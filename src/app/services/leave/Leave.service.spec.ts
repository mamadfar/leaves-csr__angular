import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { LeaveService } from './Leave.service';
import { AuthService } from '$services/auth/Auth.service';
import { EmployeeService } from '$services/employee/Employee.service';
import { ILeave, ICreateLeaveRequest } from '$types/Leave.type';

describe('LeaveService', () => {
  let service: LeaveService;
  let authService: jasmine.SpyObj<AuthService>;
  let employeeService: jasmine.SpyObj<EmployeeService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const employeeSpy = jasmine.createSpyObj('EmployeeService', ['getEmployeesByManager']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        LeaveService,
        { provide: AuthService, useValue: authSpy },
        { provide: EmployeeService, useValue: employeeSpy },
      ],
    });

    service = TestBed.inject(LeaveService);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    employeeService = TestBed.inject(EmployeeService) as jasmine.SpyObj<EmployeeService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get leaves by employee', (done) => {
    const employeeId = 'K123456';

    service.getLeavesByEmployee(employeeId).subscribe((leaves) => {
      expect(leaves).toBeDefined();
      expect(leaves.every((leave) => leave.employeeId === employeeId)).toBeTruthy();
      done();
    });
  });

  it('should validate leave request dates', (done) => {
    // Mock authenticated user
    authService.getCurrentUser.and.returnValue({
      employeeId: 'K123456',
      name: 'Test User',
      isManager: false,
    });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const invalidRequest: ICreateLeaveRequest = {
      leaveLabel: 'Test Leave',
      startOfLeave: yesterday, // Past date
      endOfLeave: new Date(),
      isSpecialLeave: false,
    };

    service.createLeave(invalidRequest).subscribe({
      next: () => {
        fail('Should have failed validation');
        done();
      },
      error: (error) => {
        expect(error.message).toContain('Leave must be scheduled for the future');
        done();
      },
    });
  });

  it('should create a valid leave request for weekdays', (done) => {
    authService.getCurrentUser.and.returnValue({
      employeeId: 'K999999', // New employee with no existing leaves
      name: 'Test User',
      isManager: false,
    });

    // Find next Monday (weekday)
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + ((8 - nextMonday.getDay()) % 7 || 7));
    nextMonday.setHours(9, 0, 0, 0);

    const endDate = new Date(nextMonday);
    endDate.setDate(endDate.getDate() + 2); // Wednesday
    endDate.setHours(17, 0, 0, 0);

    const validRequest: ICreateLeaveRequest = {
      leaveLabel: 'Valid Leave',
      startOfLeave: nextMonday,
      endOfLeave: endDate,
      isSpecialLeave: false,
    };

    service.createLeave(validRequest).subscribe({
      next: (leave) => {
        expect(leave).toBeTruthy();
        expect(leave.leaveLabel).toBe('Valid Leave');
        expect(leave.employeeId).toBe('K999999');
        done();
      },
      error: (error) => {
        fail('Should not have failed: ' + error.message);
        done();
      },
    });
  });
});
