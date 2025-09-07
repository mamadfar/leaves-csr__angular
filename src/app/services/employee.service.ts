import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Employee, LeaveBalance } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  // Mock employees data
  private mockEmployees: Employee[] = [
    {
      employeeId: 'K123456',
      name: 'John Doe',
      isManager: false,
      managerId: 'K789012',
      contractHours: 40,
      remainingLeaveDays: 23,
      remainingLeaveHours: 184
    },
    {
      employeeId: 'K234567',
      name: 'Jane Smith',
      isManager: false,
      managerId: 'K789012',
      contractHours: 32,
      remainingLeaveDays: 18,
      remainingLeaveHours: 144
    },
    {
      employeeId: 'K345678',
      name: 'Bob Wilson',
      isManager: false,
      managerId: 'K890123',
      contractHours: 40,
      remainingLeaveDays: 20,
      remainingLeaveHours: 160
    },
    {
      employeeId: 'K789012',
      name: 'Alice Johnson',
      isManager: true,
      contractHours: 40,
      remainingLeaveDays: 22,
      remainingLeaveHours: 176
    },
    {
      employeeId: 'K890123',
      name: 'David Brown',
      isManager: true,
      contractHours: 40,
      remainingLeaveDays: 25,
      remainingLeaveHours: 200
    }
  ];

  getEmployee(employeeId: string): Observable<Employee | null> {
    const employee = this.mockEmployees.find(emp => emp.employeeId === employeeId);
    return of(employee || null);
  }

  getEmployeesByManager(managerId: string): Observable<Employee[]> {
    const employees = this.mockEmployees.filter(emp => emp.managerId === managerId);
    return of(employees);
  }

  getLeaveBalance(employeeId: string): Observable<LeaveBalance | null> {
    const employee = this.mockEmployees.find(emp => emp.employeeId === employeeId);
    if (!employee) {
      return of(null);
    }

    const totalLeaveDays = employee.contractHours === 40 ? 25 : Math.round(25 * (employee.contractHours / 40));
    const totalLeaveHours = totalLeaveDays * 8;
    const usedLeaveDays = totalLeaveDays - employee.remainingLeaveDays;
    const usedLeaveHours = totalLeaveHours - employee.remainingLeaveHours;

    const balance: LeaveBalance = {
      employeeId: employee.employeeId,
      totalLeaveDays,
      usedLeaveDays,
      remainingLeaveDays: employee.remainingLeaveDays,
      totalLeaveHours,
      usedLeaveHours,
      remainingLeaveHours: employee.remainingLeaveHours
    };

    return of(balance);
  }

  updateEmployeeLeaveBalance(employeeId: string, leaveDays: number, leaveHours: number): Observable<boolean> {
    const employeeIndex = this.mockEmployees.findIndex(emp => emp.employeeId === employeeId);
    if (employeeIndex >= 0) {
      this.mockEmployees[employeeIndex].remainingLeaveDays -= leaveDays;
      this.mockEmployees[employeeIndex].remainingLeaveHours -= leaveHours;
      return of(true);
    }
    return of(false);
  }
}
