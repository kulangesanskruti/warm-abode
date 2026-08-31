# StayHub Backend Architecture

## Overview

StayHub backend is designed using **Clean Architecture** principles with clear separation of concerns and minimal coupling between layers.

## Architecture Layers

### 1. **Presentation Layer (Routes & Controllers)**

- Handles HTTP requests/responses
- Route definitions (`routes/`)
- Controllers (to be implemented in `controllers/`)
- Request validation schemas (using Zod)

### 2. **Business Logic Layer (Services)**

- Core application logic
- Business rules implementation
- Data transformation
- Service interfaces (to be implemented in `services/`)

### 3. **Data Access Layer (Repositories)**

- Database operations abstraction
- Prisma ORM integration
- Query building and optimization
- Repository interfaces (to be implemented in `repositories/`)

### 4. **Infrastructure Layer**

- Configuration management (`config/`)
- Third-party service integrations (`lib/`)
- File uploads handling (`uploads/`)
- Prisma schema and migrations (`prisma/`)

### 5. **Cross-Cutting Concerns**

- Middleware (`middlewares/`)
- Error handling (`utils/errors.ts`)
- Logging (`utils/logger.ts`)
- Utilities and helpers (`utils/`)

## Directory Structure Deep Dive

```
backend/
├── src/
│   ├── app.ts                        # Express app configuration
│   ├── server.ts                     # Server startup & shutdown
│   │
│   ├── config/                       # Configuration layer
│   │   └── env.ts                   # Environment variables
│   │
│   ├── routes/                       # API routes
│   │   ├── health.ts                # Health check routes
│   │   └── auth.ts                  # Auth routes (prepared)
│   │
│   ├── controllers/                  # Controllers (future)
│   │   └── .gitkeep
│   │
│   ├── services/                     # Services/Business logic (future)
│   │   └── .gitkeep
│   │
│   ├── repositories/                 # Data access layer (future)
│   │   └── .gitkeep
│   │
│   ├── middlewares/                  # Express middleware
│   │   ├── auth.ts                  # JWT authentication
│   │   ├── errorHandler.ts          # Global error handling
│   │   ├── rateLimiter.ts           # Rate limiting
│   │   ├── requestLogger.ts         # Request logging
│   │   └── requestValidation.ts     # Request validation
│   │
│   ├── utils/                        # Utility functions
│   │   ├── date.ts                  # Date/time helpers
│   │   ├── errors.ts                # Error classes & responses
│   │   ├── jwt.ts                   # JWT operations
│   │   ├── logger.ts                # Logging service
│   │   ├── pagination.ts            # Pagination helpers
│   │   ├── password.ts              # Password hashing/validation
│   │   ├── response.ts              # Response formatting
│   │   └── validation.ts            # Validation utilities
│   │
│   ├── constants/                    # Application constants
│   │   └── index.ts                 # Enums, messages, defaults
│   │
│   ├── types/                        # TypeScript definitions
│   │   └── index.ts                 # Global types
│   │
│   ├── lib/                          # Third-party integrations (future)
│   │   ├── cloudinary.ts            # Image upload service
│   │   ├── whatsapp.ts              # WhatsApp messaging
│   │   ├── email.ts                 # Email service
│   │   └── redis.ts                 # Redis caching
│   │
│   └── validators/                   # Zod schemas (future)
│       └── .gitkeep
│
├── prisma/                           # Prisma ORM
│   ├── schema.prisma                # Database schema
│   ├── seed.ts                      # Database seed
│   └── migrations/                  # Migration history
│
├── uploads/                          # File uploads directory
│
├── logs/                             # Application logs (runtime)
│
├── dist/                             # Compiled JavaScript (build)
│
├── .env.example                      # Environment template
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies
└── README.md                         # Documentation

```

## Core Architectural Principles

### 1. **SOLID Principles**

- **S**ingle Responsibility: Each class/module has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes must be substitutable
- **I**nterface Segregation: Depend on specific interfaces
- **D**ependency Inversion: Depend on abstractions, not concretions

### 2. **Separation of Concerns**

- Routes handle HTTP protocol
- Controllers orchestrate requests
- Services contain business logic
- Repositories handle data access
- Middlewares handle cross-cutting concerns

### 3. **Dependency Injection**

Services receive their dependencies through constructor parameters, making them testable and loosely coupled.

### 4. **Error Handling Strategy**

```
Custom Errors (ApiError)
    ↓
Middleware Validation
    ↓
Try-Catch in Async Handlers
    ↓
Global Error Handler
    ↓
Standardized Error Response
    ↓
Client Response
```

## Data Flow

### Request Flow

```
HTTP Request
    ↓
CORS Middleware
    ↓
Helmet Security Headers
    ↓
Request Logger
    ↓
Rate Limiter
    ↓
Body Parser
    ↓
Cookie Parser
    ↓
Authentication (if required)
    ↓
Route Handler
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Prisma/Database
```

### Response Flow

```
Database Result
    ↓
Repository Transforms Data
    ↓
Service Formats Response
    ↓
Controller Sends Response
    ↓
Response Formatter
    ↓
HTTP Response
```

## Error Handling Pattern

```typescript
// 1. Define specific error in utils/errors.ts
throw new ApiError('Invalid credentials', HttpStatusCode.UNAUTHORIZED);

// 2. Catch in route handler or let bubble up
} catch (error) {
  next(error);
}

// 3. Global middleware catches and formats
app.use(errorHandler);

// 4. Standardized response sent to client
{
  "success": false,
  "message": "Invalid credentials",
  "errors": {...},
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Authentication Flow

```
1. User submits credentials (email + password)
    ↓
2. Service validates credentials
    ↓
3. JWT tokens generated (access + refresh)
    ↓
4. Tokens returned to client
    ↓
5. Client stores tokens
    ↓
6. Subsequent requests include access token
    ↓
7. Auth middleware verifies token
    ↓
8. User info attached to request
    ↓
9. Request proceeds with authorization
```

## Database Design Principles

### Models Structure

Each model follows this pattern:

```typescript
model Entity {
  id        String    @id @default(cuid())

  // Required fields
  name      String
  email     String    @unique

  // Relationships
  user      User      @relation(fields: [userId], references: [id])
  userId    String

  // Soft delete
  deletedAt DateTime?

  // Timestamps
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // Indexes for performance
  @@unique([email, userId])
  @@index([userId])
  @@map("entities")
}
```

### Migration Strategy

1. Generate migration: `npm run migrate`
2. Prisma creates migration file
3. Review SQL in `prisma/migrations/`
4. Deploy in production: `npm run migrate:prod`

## Validation Strategy

Uses Zod for runtime type safety:

```typescript
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

// In route handler
const result = validate(userSchema, req.body);
if (!result.isValid) {
  return sendErrorResponse(res, result.errors);
}
```

## Scalability Considerations

### Ready for Growth

1. **Middleware Pipeline** - Easily add new middleware
2. **Service Layer** - Business logic scales independently
3. **Repository Pattern** - Data access can be optimized per entity
4. **Caching Layer** - Redis ready for integration
5. **Message Queue** - Background jobs ready (Bull, RabbitMQ)
6. **Search Engine** - Elasticsearch ready
7. **File Storage** - Cloudinary integrated
8. **Analytics** - Event tracking infrastructure in place

### Performance Optimizations

- Pagination built-in
- Efficient database queries with Prisma
- Response compression enabled
- Request rate limiting
- Logging without performance impact

## Security Architecture

### Layers of Security

1. **Network Security**
   - CORS configured
   - HTTPS enforced (production)
   - Rate limiting per IP

2. **Authentication**
   - JWT tokens with expiration
   - Refresh token rotation
   - Secure password hashing (bcrypt)

3. **Authorization**
   - Role-based access control (prepared)
   - Permission checking
   - Resource ownership validation

4. **Data Protection**
   - Parameterized queries (Prisma)
   - Input validation (Zod)
   - Output encoding
   - Sensitive data redaction

5. **Application Security**
   - Error handling (no stack traces in production)
   - Logging of security events
   - Audit trail capability
   - CSRF protection (ready)

## Testing Architecture (Future)

```
Unit Tests (Services, Utils)
    ↓
Integration Tests (Services + Repositories)
    ↓
API Tests (Full request/response)
    ↓
E2E Tests (User workflows)
```

## Monitoring & Observability

### Implemented

- Request logging with Morgan
- Centralized error logging
- Request ID tracking
- Performance timing

### Ready for Integration

- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Log aggregation (Datadog, CloudWatch)
- Metrics collection (Prometheus)
- Distributed tracing

## Future Enhancement Points

1. **Caching Layer** - Redis for session & data caching
2. **Search** - Elasticsearch for full-text search
3. **Background Jobs** - Bull/RabbitMQ for async operations
4. **Real-time** - WebSockets for notifications
5. **Analytics** - Event tracking and reporting
6. **API Gateway** - Kong or similar for advanced routing
7. **GraphQL** - GraphQL layer alongside REST
8. **Message Queue** - Event-driven architecture

---

This architecture provides a solid foundation for scaling from a single server to a distributed system without major refactoring.
