# StayHub Backend Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or hosted)
- (Optional) Redis for background jobs and caching

## Installation

From the project root:

```bash
# Install backend dependencies
npm --prefix backend install

# Or if you prefer, cd into backend and install
cd backend && npm install
```

## Environment Variables

1. Copy the example env file:

```bash
cp backend/.env.example backend/.env
```

2. Fill in the required values in `backend/.env`:

| Variable               | Required | Description                                                |
| ---------------------- | -------- | ---------------------------------------------------------- |
| `DATABASE_URL`         | Yes      | PostgreSQL connection string                               |
| `JWT_SECRET`           | Yes      | Secret key for signing JWT tokens                          |
| `ACCESS_TOKEN_EXPIRY`  | No       | Access token lifetime (default: `15m`)                     |
| `REFRESH_TOKEN_EXPIRY` | No       | Refresh token lifetime (default: `7d`)                     |
| `PORT`                 | Yes      | Backend server port (default: `5000`)                      |
| `HOST`                 | No       | Backend server host (default: `0.0.0.0`)                   |
| `CORS_ORIGIN`          | No       | Allowed origin for CORS (default: `http://localhost:3000`) |
| `REDIS_URL`            | No       | Redis connection for queues and caching                    |

The server will refuse to start if `DATABASE_URL`, `JWT_SECRET`, or `PORT` are missing, displaying a clear error message listing which variables are missing.

## Prisma Setup

Before running the backend for the first time, generate the Prisma client and apply database migrations:

```bash
# Generate Prisma client (reads schema.prisma)
npm --prefix backend run prisma:generate

# Apply migrations to your database
npm --prefix backend run prisma:migrate

# (Optional) Open Prisma Studio to browse your data
npm --prefix backend run prisma:studio
```

## Running the Application

### Frontend Only

From the project root:

```bash
npm run dev
```

This starts the Vite development server (typically on port 3000).

### Backend Only

From the project root:

```bash
# Production mode (requires build first)
npm run server

# Development mode (auto-restarts on changes)
npm run server:dev
```

Or directly from the backend folder:

```bash
cd backend
npm run dev    # development with hot reload
npm run build  # compile TypeScript
npm start      # run compiled code
```

The backend API runs at `http://localhost:5000` by default, with health checks at `/api/v1/health`.

### Frontend + Backend Together

From the project root:

```bash
npm run dev:full
```

This runs both the frontend (Vite) and backend (with hot reload) concurrently in a single terminal. Frontend logs appear in blue, backend logs in green.

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Database schema (Prisma models)
│   └── seed.ts             # Database seed script
├── src/
│   ├── config/
│   │   └── env.ts          # Environment loading + startup validation
│   ├── controllers/        # Request handlers (business logic)
│   ├── middlewares/         # Express middleware (auth, rate limit, etc.)
│   ├── repositories/        # Database access layer
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic layer
│   ├── utils/              # Shared utilities (logger, JWT, Prisma)
│   ├── app.ts              # Express app configuration
│   └── server.ts           # Server entry point + graceful shutdown
├── .env.example            # Environment variable template
├── package.json            # Backend dependencies and scripts
├── prisma.config.ts        # Prisma configuration
└── tsconfig.json           # TypeScript configuration
```

## API Overview

All API routes are prefixed with `/api/v1/`. Available endpoints:

- `/api/v1/health` - Health checks
- `/api/v1/auth` - Authentication (register, login, refresh, logout)
- `/api/v1/properties` - Property management
- `/api/v1/rooms` - Room and bed management
- `/api/v1/tenants` - Tenant management
- `/api/v1/payments` - Payment tracking
- `/api/v1/reports` - Report generation
- `/api/v1/whatsapp` - WhatsApp messaging
- `/api/v1/notifications` - Notifications
- `/api/v1/jobs` - Background jobs
- `/api/v1/files` - File uploads
