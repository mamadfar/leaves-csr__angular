import { TestBed } from '@angular/core/testing';
import { LeaveService } from './leave.service';
import { AuthService } from './auth.service';
import { EmployeeService } from './employee.service';
import { Leave, CreateLeaveRequest } from '../models/leave.model';

describe('LeaveService', () => {
  let service: LeaveService;
  let authService: jasmine.SpyObj<AuthService>;
  let employeeService: jasmine.SpyObj<EmployeeService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const employeeSpy = jasmine.createSpyObj('EmployeeService', ['getEmployeesByManager']);

    TestBed.configureTestingModule({
      providers: [
        LeaveService,
        { provide: AuthService, useValue: authSpy },
        { provide: EmployeeService, useValue: employeeSpy }
      ]
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
    
    service.getLeavesByEmployee(employeeId).subscribe(leaves => {
      expect(leaves).toBeDefined();
      expect(leaves.every(leave => leave.employeeId === employeeId)).toBeTruthy();
      done();
    });
  });

  it('should validate leave request dates', (done) => {
    // Mock authenticated user
    authService.getCurrentUser.and.returnValue({
      employeeId: 'K123456',
      name: 'Test User',
      isManager: false
    });

    const invalidRequest: CreateLeaveRequest = {
      leaveLabel: 'Test Leave',
      startOfLeave: new Date('2025-01-01'), // Past date
      endOfLeave: new Date('2025-01-02'),
      isSpecialLeave: false
    };

    service.createLeave(invalidRequest).subscribe({
      next: () => {
        fail('Should have failed validation');
        done();
      },
      error: (error) => {
        expect(error.message).toContain('Leave must be scheduled for the future');
        done();
      }
    });
  });

  it('should prevent overlapping leaves', (done) => {
    authService.getCurrentUser.and.returnValue({
      employeeId: 'K123456',
      name: 'Test User',
      isManager: false
    });

    const overlappingRequest: CreateLeaveRequest = {
      leaveLabel: 'Overlapping Leave',
      startOfLeave: new Date('2025-08-05'), // Overlaps with existing leave
      endOfLeave: new Date('2025-08-10'),
      isSpecialLeave: false
    };

    service.createLeave(overlappingRequest).subscribe({
      next: () => {
        fail('Should have failed due to overlap');
        done();
      },
      error: (error) => {
        expect(error.message).toContain('Leave overlaps with existing leave');
        done();
      }
    });
  });
});
