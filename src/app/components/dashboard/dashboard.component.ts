import { Component, computed, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { LeaveService } from '../../services/leave.service';
import { Leave } from '../../models/leave.model';
import { LeaveBalance } from '../../models/employee.model';
import { LeaveFormComponent } from '../leave-form/leave-form.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LeaveFormComponent],
  template: `
    <div class="dashboard-container">
      <header class="header">
        <h1>Leaves Management Dashboard</h1>
        <div class="user-info">
          <span>Welcome, {{ currentUser()?.name }}</span>
          <span class="role-badge" [class.manager]="currentUser()?.isManager">
            {{ currentUser()?.isManager ? 'Manager' : 'Employee' }}
          </span>
          <button class="logout-btn" (click)="logout()">Logout</button>
        </div>
      </header>

      <nav class="nav-tabs">
        <button 
          class="tab-btn"
          [class.active]="activeTab() === 'my-leaves'"
          (click)="setActiveTab('my-leaves')"
        >
          My Leaves
        </button>
        <button 
          class="tab-btn"
          [class.active]="activeTab() === 'new-leave'"
          (click)="setActiveTab('new-leave')"
        >
          Request Leave
        </button>
        <button 
          *ngIf="currentUser()?.isManager"
          class="tab-btn"
          [class.active]="activeTab() === 'approvals'"
          (click)="setActiveTab('approvals')"
        >
          Pending Approvals
        </button>
      </nav>

      <main class="main-content">
        <!-- My Leaves Tab -->
        <div *ngIf="activeTab() === 'my-leaves'" class="tab-content">
          <div class="leave-balance-card">
            <h2>Leave Balance</h2>
            <div *ngIf="leaveBalance()" class="balance-info">
              <div class="balance-item">
                <span class="label">Remaining Days:</span>
                <span class="value">{{ leaveBalance()?.remainingLeaveDays }} / {{ leaveBalance()?.totalLeaveDays }}</span>
              </div>
              <div class="balance-item">
                <span class="label">Remaining Hours:</span>
                <span class="value">{{ leaveBalance()?.remainingLeaveHours }} / {{ leaveBalance()?.totalLeaveHours }}</span>
              </div>
            </div>
          </div>

          <div class="leaves-section">
            <h2>My Leave Requests</h2>
            <div *ngIf="myLeaves().length === 0" class="no-data">
              No leave requests found.
            </div>
            <div *ngFor="let leave of myLeaves()" class="leave-card">
              <div class="leave-header">
                <h3>{{ leave.leaveLabel }}</h3>
                <span class="status-badge" [class]="leave.status.toLowerCase()">
                  {{ leave.status }}
                </span>
              </div>
              <div class="leave-details">
                <p><strong>Period:</strong> {{ formatDate(leave.startOfLeave) }} - {{ formatDate(leave.endOfLeave) }}</p>
                <p><strong>Duration:</strong> {{ leave.totalDays }} days ({{ leave.totalHours }} hours)</p>
                <p *ngIf="leave.isSpecialLeave"><strong>Type:</strong> Special Leave - {{ leave.specialLeaveType }}</p>
                <p *ngIf="leave.approverId"><strong>Approved by:</strong> {{ leave.approverId }}</p>
              </div>
              <div class="leave-actions" *ngIf="canDeleteLeave(leave)">
                <button class="delete-btn" (click)="deleteLeave(leave.leaveId)">Cancel Request</button>
              </div>
            </div>
          </div>
        </div>

        <!-- New Leave Tab -->
        <div *ngIf="activeTab() === 'new-leave'" class="tab-content">
          <app-leave-form (leaveCreated)="onLeaveCreated($event)"></app-leave-form>
        </div>

        <!-- Approvals Tab -->
        <div *ngIf="activeTab() === 'approvals' && currentUser()?.isManager" class="tab-content">
          <div class="approvals-section">
            <h2>Pending Leave Approvals</h2>
            <div *ngIf="pendingApprovals().length === 0" class="no-data">
              No pending approvals.
            </div>
            <div *ngFor="let leave of pendingApprovals()" class="leave-card approval-card">
              <div class="leave-header">
                <h3>{{ leave.leaveLabel }}</h3>
                <span class="employee-info">{{ leave.employeeId }}</span>
              </div>
              <div class="leave-details">
                <p><strong>Period:</strong> {{ formatDate(leave.startOfLeave) }} - {{ formatDate(leave.endOfLeave) }}</p>
                <p><strong>Duration:</strong> {{ leave.totalDays }} days ({{ leave.totalHours }} hours)</p>
                <p *ngIf="leave.isSpecialLeave"><strong>Type:</strong> Special Leave - {{ leave.specialLeaveType }}</p>
              </div>
              <div class="approval-actions">
                <button class="approve-btn" (click)="approveLeave(leave.leaveId, true)">Approve</button>
                <button class="reject-btn" (click)="approveLeave(leave.leaveId, false)">Reject</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .header {
      background-color: #1976d2;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header h1 {
      margin: 0;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .role-badge {
      background-color: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .role-badge.manager {
      background-color: #ff9800;
    }

    .logout-btn {
      background-color: #d32f2f;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .nav-tabs {
      background-color: white;
      border-bottom: 1px solid #ddd;
      display: flex;
      padding: 0 2rem;
    }

    .tab-btn {
      background: none;
      border: none;
      padding: 1rem 1.5rem;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      transition: all 0.3s;
    }

    .tab-btn:hover {
      background-color: #f5f5f5;
    }

    .tab-btn.active {
      border-bottom-color: #1976d2;
      color: #1976d2;
      font-weight: 600;
    }

    .main-content {
      padding: 2rem;
    }

    .leave-balance-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .balance-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .balance-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .label {
      font-weight: 500;
    }

    .value {
      font-weight: 600;
      color: #1976d2;
    }

    .leaves-section, .approvals-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .leave-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .leave-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .leave-header h3 {
      margin: 0;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.requested {
      background-color: #fff3cd;
      color: #856404;
    }

    .status-badge.approved {
      background-color: #d4edda;
      color: #155724;
    }

    .status-badge.closed {
      background-color: #f8d7da;
      color: #721c24;
    }

    .leave-details p {
      margin: 0.5rem 0;
    }

    .leave-actions, .approval-actions {
      margin-top: 1rem;
      display: flex;
      gap: 0.5rem;
    }

    .delete-btn, .reject-btn {
      background-color: #d32f2f;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .approve-btn {
      background-color: #4caf50;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .employee-info {
      color: #666;
      font-size: 0.875rem;
    }

    .no-data {
      text-align: center;
      color: #666;
      padding: 2rem;
      font-style: italic;
    }
  `]
})
export class DashboardComponent implements OnInit {
  activeTab = signal('my-leaves');
  myLeaves = signal<Leave[]>([]);
  pendingApprovals = signal<Leave[]>([]);
  leaveBalance = signal<LeaveBalance | null>(null);
  
  currentUser = computed(() => this.authService.getAuthState()().user);

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private leaveService: LeaveService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadData();
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onLeaveCreated(leave: Leave): void {
    this.loadMyLeaves();
    this.loadLeaveBalance();
    this.setActiveTab('my-leaves');
  }

  canDeleteLeave(leave: Leave): boolean {
    return leave.status === 'REQUESTED' && leave.startOfLeave > new Date();
  }

  deleteLeave(leaveId: string): void {
    if (confirm('Are you sure you want to cancel this leave request?')) {
      this.leaveService.deleteLeave(leaveId).subscribe({
        next: () => {
          this.loadMyLeaves();
          this.loadLeaveBalance();
        },
        error: (error) => {
          alert('Failed to cancel leave: ' + error.message);
        }
      });
    }
  }

  approveLeave(leaveId: string, approved: boolean): void {
    const currentUser = this.currentUser();
    if (!currentUser) return;

    const action = approved ? 'approve' : 'reject';
    if (confirm(`Are you sure you want to ${action} this leave request?`)) {
      this.leaveService.approveLeave({
        leaveId,
        approved,
        approverId: currentUser.employeeId
      }).subscribe({
        next: () => {
          this.loadPendingApprovals();
        },
        error: (error) => {
          alert(`Failed to ${action} leave: ` + error.message);
        }
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
      this.leaveService.getLeavesByEmployee(currentUser.employeeId).subscribe(leaves => {
        this.myLeaves.set(leaves);
      });
    }
  }

  private loadPendingApprovals(): void {
    const currentUser = this.currentUser();
    if (currentUser?.isManager) {
      this.leaveService.getLeavesByManager(currentUser.employeeId).subscribe(leaves => {
        this.pendingApprovals.set(leaves);
      });
    }
  }

  private loadLeaveBalance(): void {
    const currentUser = this.currentUser();
    if (currentUser) {
      this.employeeService.getLeaveBalance(currentUser.employeeId).subscribe(balance => {
        this.leaveBalance.set(balance);
      });
    }
  }
}
