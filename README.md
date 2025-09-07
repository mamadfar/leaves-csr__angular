# KLM Leaves Management System

A modern Angular application for managing employee leave requests with role-based access control.

## Features Implemented

### User Stories Completed ✅

#### Employee Features
- **View Leave Requests**: Employees can view all their requested leaves with status information
- **View Leave Balance**: Display remaining leave days and hours with progress tracking
- **Request New Leave**: Submit new leave requests with validation
- **Cancel Leave Requests**: Delete future leave requests that are still pending

#### Manager Features
- **Approve Leave Requests**: Managers can approve or reject leaves from their team members
- **Team Overview**: View all pending leave requests from direct reports

#### Security Features
- **Role-based Access**: Employees can only manage their own leaves
- **Manager Permissions**: Managers can view and approve their team's leaves
- **Authentication Guard**: Routes are protected with authentication

### Business Rules Implemented ✅

#### Leave Management Rules
- ✅ 25 leave days (200 hours) annual balance for full-time employees
- ✅ Pro-rata calculation for part-time employees
- ✅ Prevents scheduling on weekends
- ✅ Prevents overlapping leave requests
- ✅ Prevents modification of past approved leaves
- ✅ Working hours validation (9:00-17:00)

#### Special Leave Rules
- ✅ Special leave types: Moving, Wedding, Birth of child, Parental care
- ✅ 2-week advance notice requirement for special leaves
- ✅ Special leaves don't reduce regular leave balance
- ✅ Specific limits per special leave type

## Technical Implementation

### Architecture
- **Framework**: Angular 20 with standalone components
- **State Management**: Angular Signals for reactive state
- **Routing**: Angular Router with guards
- **Forms**: Template-driven Forms with validation
- **Styling**: Component-scoped CSS with responsive design

### Key Components
- `LoginComponent`: User authentication with demo users
- `DashboardComponent`: Main interface with tabbed navigation
- `LeaveFormComponent`: New leave request form with validation
- `AuthGuard`: Route protection

### Services
- `AuthService`: User authentication and authorization
- `LeaveService`: Leave CRUD operations and business logic
- `EmployeeService`: Employee data and leave balance management

### Data Models
- `Leave`: Core leave request entity
- `Employee`: Employee information and leave balance
- `User`: Authentication and role information

## Demo Users

The application includes pre-configured demo users:

### Employees
- **K123456** - John Doe (Reports to Alice Johnson)
- **K234567** - Jane Smith (Reports to Alice Johnson)
- **K345678** - Bob Wilson (Reports to David Brown)

### Managers
- **K789012** - Alice Johnson (Manager)
- **K890123** - David Brown (Manager)

## Getting Started

### Prerequisites
- Node.js 18+
- Angular CLI 20+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Usage

1. Navigate to the application (http://localhost:4200)
2. Use one of the demo user IDs to log in
3. Explore the different features based on your role:
   - **Employees**: View leaves, request new leaves, check balance
   - **Managers**: Additionally approve team member requests

## Development

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Testing

The application includes unit tests for core services:

```bash
# Run tests
ng test

# Run tests with coverage
ng test --code-coverage
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.
