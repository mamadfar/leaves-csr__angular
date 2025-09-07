import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LeaveService } from '$services/leave/Leave.service';
import { ICreateLeaveRequest, ILeave, TSpecialLeaveType } from '$types/Leave.type';

@Component({
  selector: 'leave-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './leave-form.component.html',
})
export class LeaveFormComponent {
  private _leaveService = inject(LeaveService);
  @Output() leaveCreated = new EventEmitter<ILeave>();

  leaveRequest: ICreateLeaveRequest = {
    leaveLabel: '',
    startOfLeave: this.getDefaultStartDate(),
    endOfLeave: this.getDefaultEndDate(),
    isSpecialLeave: false,
  };

  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  submitLeave(): void {
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this._leaveService.createLeave(this.leaveRequest).subscribe({
      next: (leave) => {
        this.isSubmitting.set(false);
        this.successMessage.set('Leave request submitted successfully!');
        this.leaveCreated.emit(leave);
        this.resetForm();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  resetForm(): void {
    this.leaveRequest = {
      leaveLabel: '',
      startOfLeave: this.getDefaultStartDate(),
      endOfLeave: this.getDefaultEndDate(),
      isSpecialLeave: false,
    };
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  updateStartDate(dateValue: string): void {
    const currentTime = this.leaveRequest.startOfLeave;
    const newDate = new Date(dateValue);
    newDate.setHours(currentTime.getHours(), currentTime.getMinutes());
    this.leaveRequest.startOfLeave = newDate;
  }

  updateStartTime(timeValue: string): void {
    const [hours, minutes] = timeValue.split(':').map(Number);
    const newDate = new Date(this.leaveRequest.startOfLeave);
    newDate.setHours(hours, minutes);
    this.leaveRequest.startOfLeave = newDate;
  }

  updateEndDate(dateValue: string): void {
    const currentTime = this.leaveRequest.endOfLeave;
    const newDate = new Date(dateValue);
    newDate.setHours(currentTime.getHours(), currentTime.getMinutes());
    this.leaveRequest.endOfLeave = newDate;
  }

  updateEndTime(timeValue: string): void {
    const [hours, minutes] = timeValue.split(':').map(Number);
    const newDate = new Date(this.leaveRequest.endOfLeave);
    newDate.setHours(hours, minutes);
    this.leaveRequest.endOfLeave = newDate;
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatTimeForInput(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private getDefaultStartDate(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  }

  private getDefaultEndDate(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0);
    return tomorrow;
  }
}
