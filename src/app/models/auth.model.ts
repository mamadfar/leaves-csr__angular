export interface User {
  employeeId: string;
  name: string;
  isManager: boolean;
  managerId?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
