import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IEmployee } from '$types/Employee.type';
import { ILeaveBalance } from '$types/LeaveBalance.type';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  //* Mock employees data
  private _mockEmployees: IEmployee[] = [
    {
      employeeId: 'K012345',
      name: 'Mohammad Farhadi',
      isManager: false,
      managerId: 'K000001',
      contractHours: 40,
      remainingLeaveDays: 23,
      remainingLeaveHours: 184,
    },
    {
      employeeId: 'K012346',
      name: 'Bertold Oravecz',
      isManager: false,
      managerId: 'K000001',
      contractHours: 32,
      remainingLeaveDays: 18,
      remainingLeaveHours: 144,
    },
    {
      employeeId: 'K012347',
      name: 'Carol Davis',
      isManager: false,
      managerId: 'K000002',
      contractHours: 40,
      remainingLeaveDays: 20,
      remainingLeaveHours: 160,
    },
    {
      employeeId: 'K000001',
      name: 'Velthoven Jeroen-van',
      isManager: true,
      contractHours: 40,
      remainingLeaveDays: 22,
      remainingLeaveHours: 176,
    },
    {
      employeeId: 'K000002',
      name: 'Eszter Nasz',
      isManager: true,
      contractHours: 40,
      remainingLeaveDays: 25,
      remainingLeaveHours: 200,
    },
  ];

  getEmployee(employeeId: string): Observable<IEmployee | null> {
    const employee = this._mockEmployees.find((emp) => emp.employeeId === employeeId);
    return of(employee || null);
  }

  getEmployeesByManager(managerId: string): Observable<IEmployee[]> {
    const employees = this._mockEmployees.filter((emp) => emp.managerId === managerId);
    return of(employees);
  }

  getLeaveBalance(employeeId: string): Observable<ILeaveBalance | null> {
    const employee = this._mockEmployees.find((emp) => emp.employeeId === employeeId);
    if (!employee) {
      return of(null);
    }

    const totalLeaveDays =
      employee.contractHours === 40 ? 25 : Math.round(25 * (employee.contractHours / 40));
    const totalLeaveHours = totalLeaveDays * 8;
    const usedLeaveDays = totalLeaveDays - employee.remainingLeaveDays;
    const usedLeaveHours = totalLeaveHours - employee.remainingLeaveHours;

    const balance: ILeaveBalance = {
      employeeId: employee.employeeId,
      totalLeaveDays,
      usedLeaveDays,
      remainingLeaveDays: employee.remainingLeaveDays,
      totalLeaveHours,
      usedLeaveHours,
      remainingLeaveHours: employee.remainingLeaveHours,
    };

    return of(balance);
  }

  updateEmployeeLeaveBalance(
    employeeId: string,
    leaveDays: number,
    leaveHours: number
  ): Observable<boolean> {
    const employeeIndex = this._mockEmployees.findIndex((emp) => emp.employeeId === employeeId);
    if (employeeIndex >= 0) {
      this._mockEmployees[employeeIndex].remainingLeaveDays -= leaveDays;
      this._mockEmployees[employeeIndex].remainingLeaveHours -= leaveHours;
      return of(true);
    }
    return of(false);
  }
}
