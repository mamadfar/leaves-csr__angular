import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { LeaveFormComponent } from './leave-form.component';
import { LeaveService } from '$services/leave/Leave.service';
import { ILeave } from '$types/Leave.type';

describe('LeaveFormComponent', () => {
  let component: LeaveFormComponent;
  let fixture: ComponentFixture<LeaveFormComponent>;
  let leaveService: jasmine.SpyObj<LeaveService>;

  const mockLeave: ILeave = {
    leaveId: '1',
    employeeId: 'K123456',
    leaveLabel: 'Test Leave',
    startOfLeave: new Date(),
    endOfLeave: new Date(),
    status: 'REQUESTED',
    isSpecialLeave: false,
    totalDays: 1,
    totalHours: 8,
  };

  beforeEach(async () => {
    const leaveServiceSpy = jasmine.createSpyObj('LeaveService', ['createLeave']);

    await TestBed.configureTestingModule({
      imports: [LeaveFormComponent, FormsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: LeaveService, useValue: leaveServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaveFormComponent);
    component = fixture.componentInstance;
    leaveService = TestBed.inject(LeaveService) as jasmine.SpyObj<LeaveService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.leaveRequest.leaveLabel).toBe('');
    expect(component.leaveRequest.isSpecialLeave).toBe(false);
    expect(component.isSubmitting()).toBe(false);
    expect(component.errorMessage()).toBe('');
    expect(component.successMessage()).toBe('');
  });

  it('should set default start and end dates to tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    expect(component.leaveRequest.startOfLeave.toDateString()).toBe(tomorrow.toDateString());
    expect(component.leaveRequest.endOfLeave.toDateString()).toBe(tomorrow.toDateString());
  });

  it('should submit leave successfully', () => {
    leaveService.createLeave.and.returnValue(of(mockLeave));
    spyOn(component.leaveCreated, 'emit');

    component.leaveRequest.leaveLabel = 'Test Leave';
    component.submitLeave();

    // Check that the service was called
    expect(leaveService.createLeave).toHaveBeenCalled();

    // Check the arguments passed to the service
    const callArgs = leaveService.createLeave.calls.mostRecent().args[0];
    expect(callArgs.leaveLabel).toBe('Test Leave');
    expect(callArgs.isSpecialLeave).toBe(false);

    expect(component.leaveCreated.emit).toHaveBeenCalledWith(mockLeave);
  });

  it('should handle submit error', () => {
    const error = new Error('Something went wrong');
    leaveService.createLeave.and.returnValue(throwError(() => error));

    component.submitLeave();

    expect(leaveService.createLeave).toHaveBeenCalledWith(component.leaveRequest);
  });

  it('should reset form', () => {
    component.leaveRequest.leaveLabel = 'Test Leave';
    component.errorMessage.set('Some error');
    component.successMessage.set('Success');

    component.resetForm();

    expect(component.leaveRequest.leaveLabel).toBe('');
    expect(component.errorMessage()).toBe('');
    expect(component.successMessage()).toBe('');
  });

  it('should update start date correctly', () => {
    const testDate = '2024-12-25';
    component.updateStartDate(testDate);

    expect(component.leaveRequest.startOfLeave.getFullYear()).toBe(2024);
    expect(component.leaveRequest.startOfLeave.getMonth()).toBe(11); // December is 11
    expect(component.leaveRequest.startOfLeave.getDate()).toBe(25);
  });

  it('should update start time correctly', () => {
    component.updateStartTime('14:30');

    expect(component.leaveRequest.startOfLeave.getHours()).toBe(14);
    expect(component.leaveRequest.startOfLeave.getMinutes()).toBe(30);
  });

  it('should format date for input correctly', () => {
    const testDate = new Date('2024-12-25T10:30:00');
    const formatted = component.formatDateForInput(testDate);

    expect(formatted).toBe('2024-12-25');
  });

  it('should format time for input correctly', () => {
    const testDate = new Date('2024-12-25T14:30:00');
    const formatted = component.formatTimeForInput(testDate);

    expect(formatted).toBe('14:30');
  });
});
