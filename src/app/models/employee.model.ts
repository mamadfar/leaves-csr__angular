export interface Employee {
  employeeId: string; // Pattern: K[0-9]{6}
  name: string;
  isManager?: boolean;
  managerId?: string;
  contractHours: number; // 40 for full-time, less for part-time
  remainingLeaveDays: number;
  remainingLeaveHours: number;
}

export interface LeaveBalance {
  employeeId: string;
  totalLeaveDays: number;
  usedLeaveDays: number;
  remainingLeaveDays: number;
  totalLeaveHours: number;
  usedLeaveHours: number;
  remainingLeaveHours: number;
}
