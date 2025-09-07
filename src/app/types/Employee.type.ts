export interface IEmployee {
  employeeId: string;
  name: string;
  isManager?: boolean;
  managerId?: string;
  contractHours: number;
  remainingLeaveDays: number;
  remainingLeaveHours: number;
}
