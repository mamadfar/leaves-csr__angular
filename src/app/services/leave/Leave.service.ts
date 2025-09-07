import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import {
  ILeave,
  ICreateLeaveRequest,
  ILeaveApprovalRequest,
  TSpecialLeaveType,
} from '$types/Leave.type';
import { EmployeeService } from '$services/employee/Employee.service';
import { AuthService } from '$services/auth/Auth.service';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private _employeeService = inject(EmployeeService);
  private _authService = inject(AuthService);
  private _mockLeaves: ILeave[] = [
    {
      leaveId: '1a2b3c4d-5e6f-7890-abcd-ef1234567890',
      leaveLabel: 'Summer Vacation',
      employeeId: 'K123456',
      startOfLeave: new Date('2025-08-01T09:00:00'),
      endOfLeave: new Date('2025-08-15T17:00:00'),
      approverId: 'K789012',
      status: 'APPROVED',
      totalDays: 11,
      totalHours: 88,
    },
    {
      leaveId: '2b3c4d5e-6f78-90ab-cdef-123456789012',
      leaveLabel: 'Doctor Appointment',
      employeeId: 'K123456',
      startOfLeave: new Date('2025-09-15T14:00:00'),
      endOfLeave: new Date('2025-09-15T17:00:00'),
      status: 'REQUESTED',
      totalDays: 0,
      totalHours: 3,
    },
    {
      leaveId: '3c4d5e6f-7890-abcd-ef12-3456789012ab',
      leaveLabel: 'Family Time',
      employeeId: 'K234567',
      startOfLeave: new Date('2025-09-20T09:00:00'),
      endOfLeave: new Date('2025-09-22T17:00:00'),
      status: 'REQUESTED',
      totalDays: 3,
      totalHours: 24,
    },
    {
      leaveId: '4d5e6f78-90ab-cdef-1234-56789012abcd',
      leaveLabel: 'Wedding Leave',
      employeeId: 'K345678',
      startOfLeave: new Date('2025-10-10T09:00:00'),
      endOfLeave: new Date('2025-10-10T17:00:00'),
      status: 'APPROVED',
      isSpecialLeave: true,
      specialLeaveType: 'WEDDING',
      totalDays: 1,
      totalHours: 8,
    },
  ];

  getLeavesByEmployee(employeeId: string): Observable<ILeave[]> {
    const leaves = this._mockLeaves.filter((leave) => leave.employeeId === employeeId);
    return of(leaves);
  }

  getLeavesByManager(managerId: string): Observable<ILeave[]> {
    //* Get all employees under this manager
    return new Observable((observer) => {
      this._employeeService.getEmployeesByManager(managerId).subscribe((employees) => {
        const employeeIds = employees.map((emp) => emp.employeeId);
        const leaves = this._mockLeaves.filter(
          (leave) => employeeIds.includes(leave.employeeId) && leave.status === 'REQUESTED'
        );
        observer.next(leaves);
        observer.complete();
      });
    });
  }

  createLeave(request: ICreateLeaveRequest): Observable<ILeave> {
    const currentUser = this._authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    //* Validate business rules
    const validationError = this.validateLeaveRequest(request, currentUser.employeeId);
    if (validationError) {
      return throwError(() => new Error(validationError));
    }

    const newLeave: ILeave = {
      leaveId: this.generateUUID(),
      leaveLabel: request.leaveLabel,
      employeeId: currentUser.employeeId,
      startOfLeave: request.startOfLeave,
      endOfLeave: request.endOfLeave,
      status: 'REQUESTED',
      isSpecialLeave: request.isSpecialLeave || false,
      specialLeaveType: request.specialLeaveType,
      totalDays: this.calculateLeaveDays(request.startOfLeave, request.endOfLeave),
      totalHours: this.calculateLeaveHours(request.startOfLeave, request.endOfLeave),
    };

    this._mockLeaves.push(newLeave);
    return of(newLeave);
  }

  approveLeave(request: ILeaveApprovalRequest): Observable<ILeave> {
    const leaveIndex = this._mockLeaves.findIndex((leave) => leave.leaveId === request.leaveId);
    if (leaveIndex === -1) {
      return throwError(() => new Error('Leave not found'));
    }

    const leave = this._mockLeaves[leaveIndex];

    //* Check if user is manager of the employee
    if (!this.canApproveLeave(request.approverId, leave.employeeId)) {
      return throwError(() => new Error('Not authorized to approve this leave'));
    }

    this._mockLeaves[leaveIndex] = {
      ...leave,
      status: request.approved ? 'APPROVED' : 'CLOSED',
      approverId: request.approverId,
    };

    //* If approved, update employee's leave balance
    if (request.approved && !leave.isSpecialLeave) {
      this._employeeService
        .updateEmployeeLeaveBalance(leave.employeeId, leave.totalDays, leave.totalHours)
        .subscribe();
    }

    return of(this._mockLeaves[leaveIndex]);
  }

  deleteLeave(leaveId: string): Observable<boolean> {
    const currentUser = this._authService.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    const leaveIndex = this._mockLeaves.findIndex((leave) => leave.leaveId === leaveId);
    if (leaveIndex === -1) {
      return throwError(() => new Error('Leave not found'));
    }

    const leave = this._mockLeaves[leaveIndex];

    //* Check if user owns the leave
    if (leave.employeeId !== currentUser.employeeId) {
      return throwError(() => new Error('Not authorized to delete this leave'));
    }

    //* Check if leave is in the future and not yet approved
    if (leave.status === 'APPROVED' && leave.startOfLeave < new Date()) {
      return throwError(() => new Error('Cannot delete approved leave in the past'));
    }

    this._mockLeaves.splice(leaveIndex, 1);
    return of(true);
  }

  private validateLeaveRequest(request: ICreateLeaveRequest, employeeId: string): string | null {
    //* Check if leave is in the future
    const now = new Date();
    if (request.startOfLeave <= now) {
      return 'Leave must be scheduled for the future';
    }

    //* Check if end date is after start date
    if (request.endOfLeave <= request.startOfLeave) {
      return 'End date must be after start date';
    }

    //* Check for weekends (simplified - assumes weekends are Sat/Sun)
    const start = new Date(request.startOfLeave);
    const end = new Date(request.endOfLeave);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        //* Sunday or Saturday
        return 'Leaves cannot be scheduled on weekends';
      }
    }

    //* Check for overlapping leaves
    const existingLeaves = this._mockLeaves.filter(
      (leave) =>
        leave.employeeId === employeeId &&
        leave.status !== 'CLOSED' &&
        !(leave.endOfLeave < request.startOfLeave || leave.startOfLeave > request.endOfLeave)
    );

    if (existingLeaves.length > 0) {
      return 'Leave overlaps with existing leave';
    }

    //* Special leave validation
    if (request.isSpecialLeave && request.specialLeaveType) {
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

      if (request.startOfLeave < twoWeeksFromNow) {
        return 'Special leaves must be requested 2 weeks in advance';
      }
    }

    return null;
  }

  private canApproveLeave(managerId: string, employeeId: string): boolean {
    //* For this mock, we'll check if the manager ID matches what we expect
    return true; // Simplified for demo
  }

  private calculateLeaveDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    //* If it's the same day, calculate partial days
    if (start.toDateString() === end.toDateString()) {
      const startHour = start.getHours();
      const endHour = end.getHours();
      return Math.max(0, (endHour - startHour) / 8);
    }

    let days = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        //* Not weekend
        days++;
      }
    }

    return days;
  }

  private calculateLeaveHours(startDate: Date, endDate: Date): number {
    return this.calculateLeaveDays(startDate, endDate) * 8;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
