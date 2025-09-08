import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { of } from 'rxjs';
import { Dashboard } from './dashboard';
import { AuthService } from '$services/auth/Auth.service';
import { EmployeeService } from '$services/employee/Employee.service';
import { LeaveService } from '$services/leave/Leave.service';
import { IAuthState, IUser } from '$types/Auth.type';
import { ILeave } from '$types/Leave.type';
import { ILeaveBalance } from '$types/LeaveBalance.type';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let authService: jasmine.SpyObj<AuthService>;
  let employeeService: jasmine.SpyObj<EmployeeService>;
  let leaveService: jasmine.SpyObj<LeaveService>;
  let router: jasmine.SpyObj<Router>;

  const mockUser: IUser = {
    employeeId: 'K123456',
    name: 'John Doe',
    isManager: false,
  };

  const mockAuthState: IAuthState = {
    isAuthenticated: true,
    user: mockUser,
  };

  const mockLeave: ILeave = {
    leaveId: '1',
    employeeId: 'K123456',
    leaveLabel: 'Vacation',
    startOfLeave: new Date('2024-12-25'),
    endOfLeave: new Date('2024-12-27'),
    status: 'REQUESTED',
    isSpecialLeave: false,
    totalDays: 3,
    totalHours: 24,
  };

  const mockLeaveBalance: ILeaveBalance = {
    employeeId: 'K123456',
    totalLeaveDays: 25,
    usedLeaveDays: 5,
    remainingLeaveDays: 20,
    totalLeaveHours: 200,
    usedLeaveHours: 40,
    remainingLeaveHours: 160,
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isAuthenticated',
      'getAuthState',
      'logout',
    ]);
    const employeeServiceSpy = jasmine.createSpyObj('EmployeeService', ['getLeaveBalance']);
    const leaveServiceSpy = jasmine.createSpyObj('LeaveService', [
      'getLeavesByEmployee',
      'getLeavesByManager',
      'deleteLeave',
      'approveLeave',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: EmployeeService, useValue: employeeServiceSpy },
        { provide: LeaveService, useValue: leaveServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    employeeService = TestBed.inject(EmployeeService) as jasmine.SpyObj<EmployeeService>;
    leaveService = TestBed.inject(LeaveService) as jasmine.SpyObj<LeaveService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Default setup for authenticated user
    authService.isAuthenticated.and.returnValue(true);
    authService.getAuthState.and.returnValue(signal(mockAuthState).asReadonly());
    leaveService.getLeavesByEmployee.and.returnValue(of([mockLeave]));
    employeeService.getLeaveBalance.and.returnValue(of(mockLeaveBalance));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login if not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should load data on init for authenticated user', () => {
    component.ngOnInit();

    expect(leaveService.getLeavesByEmployee).toHaveBeenCalledWith('K123456');
    expect(employeeService.getLeaveBalance).toHaveBeenCalledWith('K123456');
  });

  it('should load pending approvals for managers', () => {
    const managerUser: IUser = { ...mockUser, isManager: true };
    authService.getAuthState.and.returnValue(
      signal({ ...mockAuthState, user: managerUser }).asReadonly(),
    );
    leaveService.getLeavesByManager.and.returnValue(of([mockLeave]));

    component.ngOnInit();

    expect(leaveService.getLeavesByManager).toHaveBeenCalledWith('K123456');
  });

  it('should set active tab', () => {
    component.setActiveTab('pending-approvals');

    expect(component.activeTab()).toBe('pending-approvals');
  });

  it('should logout and redirect', () => {
    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle leave created event', () => {
    spyOn(component, 'setActiveTab');
    const loadMyLeavesSpy = spyOn<any>(component, 'loadMyLeaves');
    const loadLeaveBalanceSpy = spyOn<any>(component, 'loadLeaveBalance');

    component.onLeaveCreated(mockLeave);

    expect(loadMyLeavesSpy).toHaveBeenCalled();
    expect(loadLeaveBalanceSpy).toHaveBeenCalled();
    expect(component.setActiveTab).toHaveBeenCalledWith('my-leaves');
  });

  it('should determine if leave can be deleted', () => {
    const futureLeave: ILeave = {
      ...mockLeave,
      startOfLeave: new Date(Date.now() + 86400000), // Tomorrow
      status: 'REQUESTED',
    };

    expect(component.canDeleteLeave(futureLeave)).toBe(true);

    const approvedLeave: ILeave = { ...futureLeave, status: 'APPROVED' };
    expect(component.canDeleteLeave(approvedLeave)).toBe(false);

    const pastLeave: ILeave = {
      ...mockLeave,
      startOfLeave: new Date(Date.now() - 86400000), // Yesterday
      status: 'REQUESTED',
    };
    expect(component.canDeleteLeave(pastLeave)).toBe(false);
  });

  it('should delete leave with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    leaveService.deleteLeave.and.returnValue(of(true));
    const loadMyLeavesSpy = spyOn<any>(component, 'loadMyLeaves');
    const loadLeaveBalanceSpy = spyOn<any>(component, 'loadLeaveBalance');

    component.deleteLeave('leave-1');

    expect(leaveService.deleteLeave).toHaveBeenCalledWith('leave-1');
    expect(loadMyLeavesSpy).toHaveBeenCalled();
    expect(loadLeaveBalanceSpy).toHaveBeenCalled();
  });

  it('should not delete leave without confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteLeave('leave-1');

    expect(leaveService.deleteLeave).not.toHaveBeenCalled();
  });

  it('should approve leave with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    leaveService.approveLeave.and.returnValue(of(mockLeave));
    const loadPendingApprovalsSpy = spyOn<any>(component, 'loadPendingApprovals');

    component.approveLeave('leave-1', true);

    expect(leaveService.approveLeave).toHaveBeenCalledWith({
      leaveId: 'leave-1',
      approved: true,
      approverId: 'K123456',
    });
    expect(loadPendingApprovalsSpy).toHaveBeenCalled();
  });

  it('should format date correctly', () => {
    const testDate = new Date('2024-12-25');
    const formatted = component.formatDate(testDate);

    expect(formatted).toBe('12/25/2024');
  });
});
