import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User, AuthState } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = signal<AuthState>({
    isAuthenticated: false,
    user: null
  });

  // Mock users for demo
  private mockUsers: User[] = [
    { employeeId: 'K123456', name: 'John Doe', isManager: false, managerId: 'K789012' },
    { employeeId: 'K234567', name: 'Jane Smith', isManager: false, managerId: 'K789012' },
    { employeeId: 'K345678', name: 'Bob Wilson', isManager: false, managerId: 'K890123' },
    { employeeId: 'K789012', name: 'Alice Johnson', isManager: true },
    { employeeId: 'K890123', name: 'David Brown', isManager: true }
  ];

  login(employeeId: string): Observable<User | null> {
    const user = this.mockUsers.find(u => u.employeeId === employeeId);
    if (user) {
      this.authState.set({
        isAuthenticated: true,
        user
      });
      return of(user);
    }
    return of(null);
  }

  logout(): void {
    this.authState.set({
      isAuthenticated: false,
      user: null
    });
  }

  getCurrentUser(): User | null {
    return this.authState().user;
  }

  isAuthenticated(): boolean {
    return this.authState().isAuthenticated;
  }

  isManager(): boolean {
    return this.authState().user?.isManager || false;
  }

  getAuthState() {
    return this.authState.asReadonly();
  }
}
