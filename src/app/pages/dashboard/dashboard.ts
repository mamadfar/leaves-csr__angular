import { Component, computed, signal, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '$app/services/auth/Auth.service';
import { EmployeeService } from '$services/employee/Employee.service';
import { LeaveService } from '$services/leave/Leave.service';
import { ILeave } from '$types/Leave.type';
import { LeaveFormComponent } from '$components/leave-form/leave-form.component';
import { ILeaveBalance } from '$types/LeaveBalance.type';

@Component({
  selector: 'dashboard',
  standalone: true,
  imports: [CommonModule, LeaveFormComponent],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private _authService = inject(AuthService);
  private _employeeService = inject(EmployeeService);
  private _leaveService = inject(LeaveService);
  private _router = inject(Router);

  activeTab = signal('my-leaves');
  myLeaves = signal<ILeave[]>([]);
  pendingApprovals = signal<ILeave[]>([]);
  leaveBalance = signal<ILeaveBalance | null>(null);

  currentUser = computed(() => this._authService.getAuthState()().user);

  ngOnInit(): void {
    if (!this._authService.isAuthenticated()) {
      this._router.navigate(['/login']);
      return;
    }

    this.loadData();
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  logout(): void {
    this._authService.logout();
    this._router.navigate(['/login']);
  }

  onLeaveCreated(leave: ILeave): void {
    this.loadMyLeaves();
    this.loadLeaveBalance();
    this.setActiveTab('my-leaves');
  }

  canDeleteLeave(leave: ILeave): boolean {
    return leave.status === 'REQUESTED' && leave.startOfLeave > new Date();
  }

  deleteLeave(leaveId: string): void {
    if (confirm('Are you sure you want to cancel this leave request?')) {
      this._leaveService.deleteLeave(leaveId).subscribe({
        next: () => {
          this.loadMyLeaves();
          this.loadLeaveBalance();
        },
        error: (error) => {
          alert('Failed to cancel leave: ' + error.message);
        },
      });
    }
  }

  approveLeave(leaveId: string, approved: boolean): void {
    const currentUser = this.currentUser();
    if (!currentUser) return;

    const action = approved ? 'approve' : 'reject';
    if (confirm(`Are you sure you want to ${action} this leave request?`)) {
      this._leaveService
        .approveLeave({
          leaveId,
          approved,
          approverId: currentUser.employeeId,
        })
        .subscribe({
          next: () => {
            this.loadPendingApprovals();
          },
          error: (error) => {
            alert(`Failed to ${action} leave: ` + error.message);
          },
        });
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  private loadData(): void {
    this.loadMyLeaves();
    this.loadLeaveBalance();
    if (this.currentUser()?.isManager) {
      this.loadPendingApprovals();
    }
  }

  private loadMyLeaves(): void {
    const currentUser = this.currentUser();
    if (currentUser) {
      this._leaveService.getLeavesByEmployee(currentUser.employeeId).subscribe((leaves) => {
        this.myLeaves.set(leaves);
      });
    }
  }

  private loadPendingApprovals(): void {
    const currentUser = this.currentUser();
    if (currentUser?.isManager) {
      this._leaveService.getLeavesByManager(currentUser.employeeId).subscribe((leaves) => {
        this.pendingApprovals.set(leaves);
      });
    }
  }

  private loadLeaveBalance(): void {
    const currentUser = this.currentUser();
    if (currentUser) {
      this._employeeService.getLeaveBalance(currentUser.employeeId).subscribe((balance) => {
        this.leaveBalance.set(balance);
      });
    }
  }
}
