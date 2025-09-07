export type LeaveStatus = 'REQUESTED' | 'APPROVED' | 'CLOSED';

export interface Leave {
  leaveId: string; // UUID
  leaveLabel: string;
  employeeId: string; // Pattern: K[0-9]{6}
  startOfLeave: Date;
  endOfLeave: Date;
  approverId?: string; // Pattern: K[0-9]{6}
  status: LeaveStatus;
  isSpecialLeave?: boolean;
  specialLeaveType?: SpecialLeaveType;
  totalDays: number;
  totalHours: number;
}

export type SpecialLeaveType = 'MOVING' | 'WEDDING' | 'BIRTH' | 'PARENTAL_CARE';

export interface SpecialLeave extends Leave {
  isSpecialLeave: true;
  specialLeaveType: SpecialLeaveType;
}

export interface CreateLeaveRequest {
  leaveLabel: string;
  startOfLeave: Date;
  endOfLeave: Date;
  isSpecialLeave?: boolean;
  specialLeaveType?: SpecialLeaveType;
}

export interface LeaveApprovalRequest {
  leaveId: string;
  approved: boolean;
  approverId: string;
}
