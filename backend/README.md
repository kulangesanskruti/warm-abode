# StayHub Backend API

A production-ready backend foundation for StayHub - a comprehensive property management system built with Node.js, Express.js, TypeScript, PostgreSQL, and Prisma ORM.

## 🏗️ Architecture Overview

This backend follows **clean architecture** principles with clear separation of concerns:

```
src/
├── app.ts                 # Express application setup
├── server.ts              # Server entry point with graceful shutdown
├── config/                # Configuration files
│   └── env.ts            # Environment variables
├── controllers/           # Request handlers (to be implemented)
├── services/              # Business logic layer (to be implemented)
├── repositories/          # Data access layer (to be implemented)
├── routes/                # API route definitions
│   ├── health.ts         # Health check endpoints
│   └── auth.ts           # Authentication endpoints
├── middlewares/           # Express middleware
│   ├── auth.ts           # JWT authentication
│   ├── errorHandler.ts   # Global error handling
│   ├── rateLimiter.ts    # Rate limiting
│   ├── requestLogger.ts  # Request logging
│   └── requestValidation.ts
├── utils/                 # Utility functions
│   ├── date.ts           # Date utilities
│   ├── errors.ts         # Error handling
│   ├── jwt.ts            # JWT operations
│   ├── logger.ts         # Logging
│   ├── pagination.ts     # Pagination helpers
│   ├── password.ts       # Password utilities
│   ├── response.ts       # Response formatting
│   └── validation.ts     # Validation utilities
├── constants/             # Application constants
├── types/                 # TypeScript definitions
├── lib/                   # Third-party integrations (to be added)
├── prisma/               # Prisma ORM configuration
└── uploads/              # File uploads directory (to be created)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your database URL and other configuration:

   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/stayhub
   JWT_SECRET=your-super-secret-key-change-this-in-production
   NODE_ENV=development
   PORT=5000
   ```

3. **Setup database**

   ```bash
   npm run migrate
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:5000`

## 📝 API Endpoints

### Health Check

```http
GET /api/v1/health
```

Returns server status, database connection, uptime, and version information.

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Health check passed",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "uptime": 3600,
    "environment": "development",
    "version": "1.0.0",
    "database": "connected",
    "checks": {
      "api": "ok",
      "database": "ok"
    }
  }
}
```

### Authentication (Prepared Routes - Implementation Pending)

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout (requires auth)
- `GET /api/v1/auth/me` - Get current user info (requires auth)
- `POST /api/v1/auth/verify-email` - Verify email
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

## 🔐 Security Features

### Implemented

- **Helmet** - HTTP headers security
- **CORS** - Cross-Origin Resource Sharing configuration
- **Password Hashing** - bcryptjs with 12 salt rounds
- **JWT Authentication** - Token-based auth with access/refresh tokens
- **Rate Limiting** - IP-based request throttling (100 requests per 15 minutes)
- **Input Validation** - Zod schema validation
- **Error Handling** - Structured error responses
- **SQL Injection Protection** - Prisma parameterized queries
- **Request Logging** - Morgan & custom logging
- **Compression** - gzip compression for responses

### Prepared for Integration

- Email verification
- Password reset workflows
- Two-factor authentication
- OAuth/Social login
- API key management

## 📚 Key Utilities

### JWT Management

```typescript
import { generateTokenPair, verifyToken } from "@/utils/jwt";

const tokens = generateTokenPair({
  userId: "user123",
  email: "user@example.com",
  role: "landlord",
});

const decoded = verifyToken(tokens.accessToken);
```

### Password Security

```typescript
import { hashPassword, comparePasswords, validatePasswordStrength } from "@/utils/password";

const hashed = await hashPassword(password);
const isValid = await comparePasswords(password, hashed);
const strength = validatePasswordStrength(password);
```

### Validation

```typescript
import { validate, emailSchema, passwordSchema } from "@/utils/validation";

const result = validate(emailSchema, userEmail);
if (result.isValid) {
  // Use result.data
}
```

### Pagination

```typescript
import { getPaginationParams, createPaginatedResponse } from "@/utils/pagination";

const { page, limit, skip } = getPaginationParams(req.query.page, req.query.limit);
const response = createPaginatedResponse(items, page, limit, total);
```

## 🗄️ Database (Prisma ORM)

### Setup Migrations

```bash
# Create a new migration
npm run migrate

# Deploy migrations (production)
npm run migrate:prod

# Generate Prisma client
npm run generate

# Seed database
npm run seed
```

### Prisma Schema

The schema file is at `backend/prisma/schema.prisma`. Models for business entities (Properties, Rooms, Tenants, Rent, etc.) will be added as needed.

## 🛠️ Development

### Available Scripts

```bash
npm run dev           # Start development server with hot reload
npm run build         # Compile TypeScript to JavaScript
npm run start         # Start production server
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run type-check    # Check TypeScript types
npm run migrate       # Run database migrations
npm run seed          # Seed database
```

### Code Quality

- **TypeScript** - Strict type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Zod** - Runtime validation

### Environment Variables

Key variables to configure:

| Variable                  | Default               | Description                                    |
| ------------------------- | --------------------- | ---------------------------------------------- |
| `NODE_ENV`                | development           | Environment (development/production)           |
| `PORT`                    | 5000                  | Server port                                    |
| `DATABASE_URL`            | -                     | PostgreSQL connection string                   |
| `JWT_SECRET`              | -                     | JWT signing secret (MUST change in production) |
| `CORS_ORIGIN`             | http://localhost:3000 | CORS allowed origin                            |
| `RATE_LIMIT_MAX_REQUESTS` | 100                   | Max requests per window                        |
| `RATE_LIMIT_WINDOW_MS`    | 900000                | Rate limit window in ms (15 min)               |

See `.env.example` for complete list.

## 📊 Logging

Logs are written to:

- **Console** - Always in development, errors in production
- **File** - `logs/YYYY-MM-DD.log` for production and errors

Log levels: ERROR, WARN, INFO, DEBUG

## 🚢 Deployment

### Health Checks

For Kubernetes or other orchestrators, use:

```
GET /api/v1/health        # Liveness probe
GET /api/v1/health/ready  # Readiness probe
GET /api/v1/health/live   # Alive check
```

### Environment Setup

1. Set all required environment variables
2. Ensure PostgreSQL is accessible
3. Run migrations: `npm run migrate:prod`
4. Start server: `npm run start`

### Production Checklist

- [ ] Change JWT_SECRET
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS_ORIGIN
- [ ] Set NODE_ENV=production
- [ ] Configure database backups
- [ ] Setup monitoring/alerting
- [ ] Enable request logging
- [ ] Configure rate limiting per use case
- [ ] Setup error tracking (Sentry, etc.)
- [ ] Enable API rate limiting

## 🔄 Graceful Shutdown

The server handles graceful shutdown on SIGTERM and SIGINT signals:

- Closes HTTP server
- Disconnects from database
- Exits with status code 0

## 🎯 Next Steps

### Ready for Implementation

1. **User Management** - Create User model and management endpoints
2. **Authentication** - Implement register, login, token refresh
3. **Audit Logging** - Track user actions and changes
4. **Email Service** - Setup SMTP for notifications
5. **File Upload** - Integrate Cloudinary for images
6. **WhatsApp Integration** - Setup WhatsApp API
7. **Redis Caching** - Add caching layer

### Architecture Ready

- Request/response middleware pipeline
- Error handling system
- Validation framework
- JWT authentication infrastructure
- Database ORM setup
- Logging infrastructure
- Rate limiting
- CORS security

All foundation systems are in place to add business modules without architectural changes.

## 📞 Support

For issues or questions about the backend:

1. Check `.env` configuration
2. Verify database connection
3. Review server logs
4. Check endpoint documentation

## 📄 License

MIT License

---

**Built with ❤️ for property management**
