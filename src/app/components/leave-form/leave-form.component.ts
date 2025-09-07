import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LeaveService } from '../../services/leave.service';
import { CreateLeaveRequest, Leave, SpecialLeaveType } from '../../models/leave.model';

@Component({
  selector: 'app-leave-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="leave-form-container">
      <h2>Request New Leave</h2>
      
      <form (ngSubmit)="submitLeave()" #leaveForm="ngForm">
        <div class="form-group">
          <label for="leaveLabel">Leave Description:</label>
          <input 
            type="text" 
            id="leaveLabel" 
            name="leaveLabel"
            [(ngModel)]="leaveRequest.leaveLabel" 
            placeholder="e.g., Summer vacation, Doctor appointment"
            required
            #labelInput="ngModel"
          >
          <div class="error" *ngIf="labelInput.invalid && labelInput.touched">
            Leave description is required
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="startDate">Start Date:</label>
            <input 
              type="date" 
              id="startDate" 
              name="startDate"
              [ngModel]="formatDateForInput(leaveRequest.startOfLeave)"
              (ngModelChange)="updateStartDate($event)"
              required
              #startInput="ngModel"
            >
          </div>

          <div class="form-group">
            <label for="startTime">Start Time:</label>
            <input 
              type="time" 
              id="startTime" 
              name="startTime"
              [ngModel]="formatTimeForInput(leaveRequest.startOfLeave)"
              (ngModelChange)="updateStartTime($event)"
              required
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="endDate">End Date:</label>
            <input 
              type="date" 
              id="endDate" 
              name="endDate"
              [ngModel]="formatDateForInput(leaveRequest.endOfLeave)"
              (ngModelChange)="updateEndDate($event)"
              required
              #endInput="ngModel"
            >
          </div>

          <div class="form-group">
            <label for="endTime">End Time:</label>
            <input 
              type="time" 
              id="endTime" 
              name="endTime"
              [ngModel]="formatTimeForInput(leaveRequest.endOfLeave)"
              (ngModelChange)="updateEndTime($event)"
              required
            >
          </div>
        </div>

        <div class="form-group">
          <label>
            <input 
              type="checkbox" 
              [(ngModel)]="leaveRequest.isSpecialLeave"
              name="isSpecialLeave"
            >
            This is a special leave
          </label>
        </div>

        <div class="form-group" *ngIf="leaveRequest.isSpecialLeave">
          <label for="specialType">Special Leave Type:</label>
          <select 
            id="specialType" 
            name="specialType"
            [(ngModel)]="leaveRequest.specialLeaveType"
            required
          >
            <option value="">Select special leave type</option>
            <option value="MOVING">Moving to new house</option>
            <option value="WEDDING">Wedding/Partner registration</option>
            <option value="BIRTH">Birth of a child</option>
            <option value="PARENTAL_CARE">Parental care</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" [disabled]="!leaveForm.valid || isSubmitting()" class="submit-btn">
            {{ isSubmitting() ? 'Submitting...' : 'Submit Request' }}
          </button>
          <button type="button" (click)="resetForm()" class="reset-btn">Reset</button>
        </div>

        <div class="error" *ngIf="errorMessage()">
          {{ errorMessage() }}
        </div>

        <div class="success" *ngIf="successMessage()">
          {{ successMessage() }}
        </div>
      </form>

      <div class="info-section">
        <h3>Important Information</h3>
        <ul>
          <li>Leaves cannot be scheduled on weekends</li>
          <li>Special leaves must be requested 2 weeks in advance</li>
          <li>Leaves cannot overlap with existing approved leaves</li>
          <li>Working hours are from 9:00 to 17:00</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .leave-form-container {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      max-width: 600px;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    input, select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #1976d2;
    }

    input[type="checkbox"] {
      width: auto;
      margin-right: 0.5rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .submit-btn {
      background-color: #1976d2;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    .submit-btn:hover:not(:disabled) {
      background-color: #1565c0;
    }

    .submit-btn:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .reset-btn {
      background-color: #666;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    .reset-btn:hover {
      background-color: #555;
    }

    .error {
      color: #d32f2f;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .success {
      color: #2e7d32;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .info-section {
      margin-top: 2rem;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .info-section h3 {
      margin-top: 0;
      color: #666;
    }

    .info-section ul {
      margin: 0;
      padding-left: 1.5rem;
    }

    .info-section li {
      margin-bottom: 0.5rem;
      color: #666;
    }
  `]
})
export class LeaveFormComponent {
  @Output() leaveCreated = new EventEmitter<Leave>();

  leaveRequest: CreateLeaveRequest = {
    leaveLabel: '',
    startOfLeave: this.getDefaultStartDate(),
    endOfLeave: this.getDefaultEndDate(),
    isSpecialLeave: false
  };

  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(private leaveService: LeaveService) {}

  submitLeave(): void {
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.leaveService.createLeave(this.leaveRequest).subscribe({
      next: (leave) => {
        this.isSubmitting.set(false);
        this.successMessage.set('Leave request submitted successfully!');
        this.leaveCreated.emit(leave);
        this.resetForm();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error.message);
      }
    });
  }

  resetForm(): void {
    this.leaveRequest = {
      leaveLabel: '',
      startOfLeave: this.getDefaultStartDate(),
      endOfLeave: this.getDefaultEndDate(),
      isSpecialLeave: false
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
