import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="login-container">
      <div class="login-form">
        <h1>KLM Leaves Management</h1>
        <h2>Employee Login</h2>
        
        <form (ngSubmit)="login()" #loginForm="ngForm">
          <div class="form-group">
            <label for="employeeId">Employee ID:</label>
            <input 
              type="text" 
              id="employeeId" 
              name="employeeId"
              [(ngModel)]="employeeId" 
              placeholder="K123456"
              pattern="^K[0-9]{6}$"
              required
              #empIdInput="ngModel"
            >
            <div class="error" *ngIf="empIdInput.invalid && empIdInput.touched">
              Please enter a valid employee ID (format: K123456)
            </div>
          </div>
          
          <button type="submit" [disabled]="!loginForm.valid || isLoading()">
            {{ isLoading() ? 'Logging in...' : 'Login' }}
          </button>
          
          <div class="error" *ngIf="errorMessage()">
            {{ errorMessage() }}
          </div>
        </form>
        
        <div class="demo-users">
          <h3>Demo Users:</h3>
          <div class="user-list">
            <button class="user-btn" (click)="quickLogin('K123456')">K123456 - John Doe (Employee)</button>
            <button class="user-btn" (click)="quickLogin('K234567')">K234567 - Jane Smith (Employee)</button>
            <button class="user-btn" (click)="quickLogin('K789012')">K789012 - Alice Johnson (Manager)</button>
            <button class="user-btn" (click)="quickLogin('K890123')">K890123 - David Brown (Manager)</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
      padding: 20px;
    }

    .login-form {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      text-align: center;
      color: #1976d2;
      margin-bottom: 0.5rem;
    }

    h2 {
      text-align: center;
      color: #666;
      margin-bottom: 2rem;
      font-weight: normal;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #1976d2;
    }

    button {
      width: 100%;
      padding: 0.75rem;
      background-color: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    button:hover:not(:disabled) {
      background-color: #1565c0;
    }

    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .error {
      color: #d32f2f;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .demo-users {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .demo-users h3 {
      margin-bottom: 1rem;
      color: #666;
    }

    .user-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .user-btn {
      padding: 0.5rem;
      background-color: #f5f5f5;
      color: #333;
      border: 1px solid #ddd;
      font-size: 0.875rem;
    }

    .user-btn:hover {
      background-color: #e0e0e0;
    }
  `]
})
export class LoginComponent {
  employeeId = '';
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    if (!this.employeeId) {
      this.errorMessage.set('Please enter an employee ID');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.employeeId).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        if (user) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage.set('Invalid employee ID');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Login failed. Please try again.');
      }
    });
  }

  quickLogin(employeeId: string): void {
    this.employeeId = employeeId;
    this.login();
  }
}
