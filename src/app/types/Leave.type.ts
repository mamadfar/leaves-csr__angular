export type TLeaveStatus = 'REQUESTED' | 'APPROVED' | 'CLOSED' | 'REJECTED' | 'CANCELLED';

export interface ILeave {
  leaveId: string;
  leaveLabel: string;
  employeeId: string;
  startOfLeave: Date;
  endOfLeave: Date;
  approverId?: string;
  status: TLeaveStatus;
  isSpecialLeave?: boolean;
  specialLeaveType?: TSpecialLeaveType;
  totalDays: number;
  totalHours: number;
}

export type TSpecialLeaveType = 'MOVING' | 'WEDDING' | 'CHILD_BIRTH' | 'PARENTAL_CARE';

export interface ISpecialLeave extends ILeave {
  isSpecialLeave: true;
  specialLeaveType: TSpecialLeaveType;
}

export interface ICreateLeaveRequest {
  leaveLabel: string;
  startOfLeave: Date;
  endOfLeave: Date;
  isSpecialLeave?: boolean;
  specialLeaveType?: TSpecialLeaveType;
}

export interface ILeaveApprovalRequest {
  leaveId: string;
  approved: boolean;
  approverId: string;
}
