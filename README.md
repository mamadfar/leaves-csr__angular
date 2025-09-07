# Leave Management System (CSR)

A client-side rendered Angular application for managing employee leave requests. This application provides a dashboard for employees to submit and track their leave requests.

## Features

- Employee authentication
- Leave request submission
- Leave balance tracking
- Dashboard for leave management
- Protected routes with authentication guards

## Technology Stack

- **Angular 20** - Frontend framework
- **TypeScript** - Programming language
- **TailwindCSS** - Utility-first CSS framework
- **RxJS** - Reactive programming library

## Prerequisites

Make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Getting Started

### 1. Clone the repository (if applicable)

```bash
git clone <repository-url>
cd leaves-csr
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm start
```

The application will be available at `http://localhost:4200` by default.

## Available Scripts

- `npm start` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run watch` - Builds the app in watch mode for development
- `npm test` - Runs the unit tests

## Project Structure

```
src/
├── app/
│   ├── components/          # Reusable components
│   │   └── leave-form/      # Leave form component
│   ├── guards/              # Route guards
│   │   └── auth.guard.ts    # Authentication guard
│   ├── pages/               # Page components
│   │   ├── dashboard/       # Dashboard page
│   │   └── login/           # Login page
│   ├── services/            # Application services
│   │   ├── auth/            # Authentication service
│   │   ├── employee/        # Employee service
│   │   └── leave/           # Leave management service
│   └── types/               # TypeScript type definitions
├── styles.css              # Global styles
└── main.ts                 # Application entry point
```

## Development

1. The application uses Angular's standalone components architecture
2. TailwindCSS is configured for styling
3. Authentication is required to access the dashboard
4. The app follows Angular best practices with services, guards, and type definitions

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Testing

Run the test suite:

```bash
npm test
```

## Browser Support

This application supports modern browsers that are compatible with Angular 20.
