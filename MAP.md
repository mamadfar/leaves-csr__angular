# Leaves CSR Application - User Story Implementation Map

This document maps each user story from the requirements to the specific files
and functions where the implementation can be found.

## Core User Stories Implementation

### 1. As an employee I want to view my requested (planned) leaves including the (approval) status

**Frontend Implementation:**

- **Component**: `src/app/pages/dashboard/dashboard.ts` (lines 107-114)
  - Method: `loadMyLeaves()` - Loads current user's leave requests
  - Signal: `myLeaves` (line 24) - Stores the leave data
- **Template**: `src/app/pages/dashboard/dashboard.html` (lines 58-97)
  - Displays leave requests with status, dates, and approval information
  - Shows status badges with color coding (lines 68-73)
- **Service**: `src/app/services/leave/Leave.service.ts` (lines 62-65)
  - Method: `getLeavesByEmployee(employeeId)` - Returns filtered leaves for
    employee

### 2. As an employee I want to view my remaining leave days and hours

**Frontend Implementation:**

- **Component**: `src/app/pages/dashboard/dashboard.ts` (lines 123-130)
  - Method: `loadLeaveBalance()` - Fetches current year's leave balance
  - Signal: `leaveBalance` (line 26) - Stores balance information
- **Template**: `src/app/pages/dashboard/dashboard.html` (lines 41-57)
  - Displays remaining days and hours with visual progress indication
- **Service**: `src/app/services/employee/Employee.service.ts` (lines 44-65)
  - Method: `getLeaveBalance(employeeId)` - Calculates and returns leave balance

### 3. As an employee I want to request a new leave

**Frontend Implementation:**

- **Component**: `src/app/components/leave-form/leave-form.component.ts` (lines
  18-36)
  - Method: `submitLeave()` - Submits leave request with validation
  - Form handling and error management
- **Template**: `src/app/components/leave-form/leave-form.component.html`
  - Complete form with date pickers, leave type selection, and validation
- **Service**: `src/app/services/leave/Leave.service.ts` (lines 78-100)
  - Method: `createLeave(request)` - Creates new leave request with business
    rule validation
- **Dashboard Integration**: `src/app/pages/dashboard/dashboard.ts` (lines
  47-51)
  - Method: `onLeaveCreated()` - Refreshes data after leave creation

### 4. As an employee I want to cancel (delete) an existing, future leave

**Frontend Implementation:**

- **Component**: `src/app/pages/dashboard/dashboard.ts` (lines 57-68)
  - Method: `deleteLeave()` - Cancels leave requests with confirmation
  - Method: `canDeleteLeave()` (lines 54-56) - Determines if leave can be
    cancelled
- **Template**: `src/app/pages/dashboard/dashboard.html` (lines 87-94)
  - Cancel button displayed conditionally based on leave status and date
- **Service**: `src/app/services/leave/Leave.service.ts` (lines 133-155)
  - Method: `deleteLeave(leaveId)` - Validates permissions and deletes leave
  - Business rules: Cannot delete past/started leaves or approved leaves

### 5. As a manager I want to approve the leaves requested by my employees

**Frontend Implementation:**

- **Component**: `src/app/pages/dashboard/dashboard.ts`
  - Method: `loadPendingApprovals()` (lines 116-122) - Loads subordinate leave
    requests
  - Method: `approveLeave()` (lines 70-85) - Approves/rejects leave requests
  - Signal: `pendingApprovals` (line 25) - Stores pending requests for approval
- **Template**: `src/app/pages/dashboard/dashboard.html` (lines 107-142)
  - Approvals tab with approve/reject buttons for managers (lines 131-138)
- **Service**: `src/app/services/leave/Leave.service.ts`
  - Method: `getLeavesByManager()` (lines 67-76) - Gets leaves of subordinates
  - Method: `approveLeave()` (lines 102-131) - Updates leave approval status

### 6. As a security officer I want employees to only view and manage their own leaves (except managers)

**Frontend Implementation:**

- **Authentication Service**: `src/app/services/auth/Auth.service.ts`
  - Method: `getCurrentUser()` (lines 39-41) - Returns current authenticated
    user
  - Method: `isAuthenticated()` (lines 43-45) - Checks authentication status
  - Method: `isManager()` (lines 47-49) - Role-based access control
- **Route Guard**: `src/app/guards/auth.guard.ts` (lines 4-12)
  - Function: `authGuard()` - Protects routes requiring authentication
- **Authorization Logic**:
  - `src/app/services/leave/Leave.service.ts` - User ownership checks in methods
  - Employee data filtering based on current user in dashboard component

## Authentication & Authorization

### Login System

**Frontend Implementation:**

- **Component**: `src/app/pages/login/login.ts`
  - Method: `login()` (lines 15-29) - Handles employee login with validation
  - Method: `quickLogin()` (lines 31-34) - Demo login helper
- **Template**: `src/app/pages/login/login.html`
  - Login form with employee ID input and quick login buttons
- **Service**: `src/app/services/auth/Auth.service.ts` (lines 21-32)
  - Method: `login(employeeId)` - Authenticates user and sets session state

### Session Management

**Frontend Implementation:**

- **Service**: `src/app/services/auth/Auth.service.ts`
  - Method: `logout()` (lines 34-38) - Clears authentication state
  - Property: `_authState` (lines 13-16) - Signal-based state management
- **Component**: `src/app/pages/dashboard/dashboard.ts` (lines 42-45)
  - Method: `logout()` - Handles logout and navigation

## Business Rules Implementation

### Leave Validation Rules

**Implementation**: `src/app/services/leave/Leave.service.ts` (lines 157-205)

- **Method**: `validateLeaveRequest()` implements:
  - Future leave validation (lines 162-165)
  - End date after start date validation (lines 167-171)
  - Weekend restriction (lines 173-182)
  - Overlap detection (lines 184-194)
  - Special leave advance notice - 2 weeks (lines 196-203)

### Working Hours Calculation

**Implementation**: `src/app/services/leave/Leave.service.ts`

- **Method**: `calculateLeaveDays()` (lines 219-238) - Excludes weekends,
  handles partial days
- **Method**: `calculateLeaveHours()` (lines 240-242) - 8 hours per day
  calculation

### Leave Balance Management

**Implementation**: `src/app/services/employee/Employee.service.ts` (lines
44-65)

- **Method**: `getLeaveBalance()` implements:
  - 25 days base allocation (line 50)
  - Pro-rata calculation for part-time employees (lines 50-51)
  - Balance tracking with used/remaining calculations (lines 47-49, 52-53)
- **Method**: `updateEmployeeLeaveBalance()` (lines 67-74) - Deducts approved
  leaves

### Special Leaves Support

**Data Models**: `src/app/types/Leave.type.ts`

- **Type**: `TSpecialLeaveType` (line 11) - ('MOVING' | 'WEDDING' |
  'CHILD_BIRTH' | 'PARENTAL_CARE')
- **Interface**: `ISpecialLeave` (lines 24-27) - Extends ILeave with special
  leave fields
- **Validation**: Special leave rules in `validateLeaveRequest()` method

## Data Models & Types

### Core Entities

- **Leave Types**: `src/app/types/Leave.type.ts`
  - `TLeaveStatus` (line 1) - Leave status enumeration
  - `ILeave` (lines 3-17) - Main leave interface
  - `ICreateLeaveRequest` (lines 29-35) - Leave creation request
  - `ILeaveApprovalRequest` (lines 37-41) - Approval request interface

- **Employee Types**: `src/app/types/Employee.type.ts`
  - `IEmployee` (lines 1-8) - Employee interface with manager hierarchy

- **Authentication Types**: `src/app/types/Auth.type.ts`
  - User authentication and session management interfaces

- **Leave Balance Types**: `src/app/types/LeaveBalance.type.ts` (lines 1-8)
  - `ILeaveBalance` - Complete balance tracking interface

## Mock Data for Development

### Test Users & Data

**Mock Employees**: `src/app/services/employee/Employee.service.ts` (lines 8-33)

- Includes employees and managers with different contract hours for testing

**Mock Leaves**: `src/app/services/leave/Leave.service.ts` (lines 17-60)

- Sample leave requests with different statuses and types

**Mock Users**: `src/app/services/auth/Auth.service.ts` (lines 18-24)

- Test users with employee/manager roles

## Application Structure

### Routing & Configuration

- **Routes Configuration**: `src/app/app.routes.ts`
- **Auth Guard**: `src/app/guards/auth.guard.ts` (lines 4-12)
- **App Component**: `src/app/app.ts`
- **App Config**: `src/app/app.config.ts`

### Testing

- **Leave Service Tests**: `src/app/services/leave/Leave.service.spec.ts`
- **App Component Tests**: `src/app/app.spec.ts`

## Development Scripts

Use these npm scripts for development:

- `npm start` - Start development server (Angular CLI)
- `npm test` - Run unit tests with Karma
- `npm run build` - Build for production
- `npm run format` - Format code with Prettier

## Key Features Summary

✅ **Authentication System** with role-based access control  
✅ **Leave Request Lifecycle** from creation to approval  
✅ **Business Rules Enforcement** for working hours, weekends, overlaps  
✅ **Pro-rata Leave Calculation** for part-time employees  
✅ **Special Leave Management** with type-specific rules  
✅ **Manager Approval Workflow** with hierarchical validation  
✅ **Real-time Balance Calculation** with approval integration  
✅ **Security Controls** ensuring data isolation between employees

## Quick Start for Developers

### Test Credentials

1. **Employee Access**: Use employee ID `K012345` (Mohammad Farhadi)
2. **Manager Access**: Use employee ID `K000001` (Velthoven Jeroen-van)
3. **Part-time Employee**: Use employee ID `K012346` (Bertold Oravecz - 32
   hours)

### Main Components Navigation

- **Dashboard**: Single-page application handling both employee and manager
  views
- **Leave Form**: Comprehensive form component with business rule validation
- **Service Layer**: Complete business logic with mock data for immediate
  testing

---