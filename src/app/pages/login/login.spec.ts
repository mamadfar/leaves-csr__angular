import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError, delay } from 'rxjs';
import { Login } from './login';
import { AuthService } from '$services/auth/Auth.service';
import { IUser } from '$types/Auth.type';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockUser: IUser = {
    employeeId: 'K123456',
    name: 'John Doe',
    isManager: false,
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Login, FormsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty employee ID and no loading state', () => {
    expect(component.employeeId).toBe('');
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('');
  });

  it('should show error when trying to login without employee ID', () => {
    component.employeeId = '';
    component.login();

    expect(component.errorMessage()).toBe('Please enter an employee ID');
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should login successfully and navigate to dashboard', () => {
    authService.login.and.returnValue(of(mockUser));
    component.employeeId = 'K123456';

    component.login();

    expect(component.isLoading()).toBe(false);
    expect(authService.login).toHaveBeenCalledWith('K123456');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.errorMessage()).toBe('');
  });

  it('should show error for invalid employee ID', () => {
    authService.login.and.returnValue(of(null));
    component.employeeId = 'INVALID';

    component.login();

    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('Invalid employee ID');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should handle login error', () => {
    authService.login.and.returnValue(throwError(() => new Error('Network error')));
    component.employeeId = 'K123456';

    component.login();

    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('Login failed. Please try again.');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should set loading state during login', () => {
    // Create a delayed observable to test loading state
    authService.login.and.returnValue(of(mockUser).pipe(delay(100)));
    component.employeeId = 'K123456';

    component.login();

    expect(component.isLoading()).toBe(true);
    expect(component.errorMessage()).toBe('');
  });

  it('should handle quick login', () => {
    authService.login.and.returnValue(of(mockUser));
    spyOn(component, 'login');

    component.quickLogin('K123456');

    expect(component.employeeId).toBe('K123456');
    expect(component.login).toHaveBeenCalled();
  });

  it('should clear error message on new login attempt', () => {
    component.errorMessage.set('Previous error');
    authService.login.and.returnValue(of(mockUser));
    component.employeeId = 'K123456';

    component.login();

    expect(component.errorMessage()).toBe('');
  });
});
