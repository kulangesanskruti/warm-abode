# Authentication & Authorization Implementation Guide

## Overview

This guide documents the production-ready authentication system for StayHub backend. Built following senior-level backend engineering standards with clean architecture principles.

## Architecture Overview

```
HTTP Request
    ↓
Route Handler
    ↓
Middleware (Validation, Auth)
    ↓
Controller (Orchestration)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Prisma ORM ↔ PostgreSQL Database
```

## Directory Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── authController.ts      # Request handling & response formatting
│   ├── services/
│   │   └── authService.ts         # Business logic & workflows
│   ├── repositories/
│   │   └── userRepository.ts      # Database access layer
│   ├── routes/
│   │   └── auth.ts                # Route definitions
│   ├── middlewares/
│   │   ├── auth.ts                # Authentication & authorization
│   │   ├── errorHandler.ts        # Global error handling
│   │   └── rateLimiter.ts         # Rate limiting
│   ├── validators/
│   │   └── auth.ts                # Zod validation schemas
│   ├── utils/
│   │   ├── jwt.ts                 # JWT token generation & verification
│   │   ├── password.ts            # Password hashing & comparison
│   │   ├── errors.ts              # Custom error classes
│   │   └── response.ts            # Response formatting
│   └── types/
│       └── index.ts               # TypeScript type definitions
├── prisma/
│   └── schema.prisma              # Database schema
└── API_DOCUMENTATION.md           # Complete API documentation
```

## Key Components

### 1. User Repository

**File**: `src/repositories/userRepository.ts`

Handles all database operations related to users.

**Methods**:

- `create()` - Create new user
- `findByEmail()` - Find user by email
- `findByPhone()` - Find user by phone
- `findById()` - Find user by ID
- `updateProfile()` - Update user profile
- `updatePassword()` - Update user password
- `verifyEmail()` - Mark email as verified
- `emailExists()` - Check email existence
- `phoneExists()` - Check phone existence
- `findByIdSafe()` - Get user without password hash

### 2. Auth Service

**File**: `src/services/authService.ts`

Contains all authentication business logic.

**Key Features**:

- User registration with validation
- Password comparison and hashing
- JWT token generation (access + refresh)
- Token refresh workflow
- Profile updates
- Password change functionality
- Password reset workflow with tokens
- Security checks (duplicate emails/phones)

**Password Reset Token Storage**:

- Currently: In-memory Map (development)
- Production: Should use Redis or database with TTL

### 3. Auth Controller

**File**: `src/controllers/authController.ts`

Handles HTTP request/response lifecycle.

**Responsibilities**:

- Request validation
- Input transformation
- Service invocation
- Response formatting
- Cookie management
- Error handling

**Cookies Managed**:

- `refreshToken` - HttpOnly, Secure, SameSite=Strict
- Expiry: 7 days
- Set on: Register, Login, Token Refresh
- Cleared on: Logout

### 4. Auth Middleware

**File**: `src/middlewares/auth.ts`

JWT verification and authorization.

**Middleware Functions**:

#### `authenticate`

- Verifies JWT token
- Extracts user information
- Attaches user to request object
- Rejects unauthorized requests

#### `authorize(roles)`

- Role-based access control
- Checks if user has required roles
- Returns 403 Forbidden if unauthorized

#### `optional`

- Same as authenticate but doesn't fail if token absent
- Useful for public endpoints with optional auth

### 5. Validators

**File**: `src/validators/auth.ts`

Zod schemas for request validation.

**Schemas**:

- `registerSchema` - Register request validation
- `loginSchema` - Login request validation
- `updateProfileSchema` - Profile update validation
- `changePasswordSchema` - Password change validation
- `forgotPasswordSchema` - Forgot password validation
- `resetPasswordSchema` - Reset password validation
- `refreshTokenSchema` - Token refresh validation

**Validations**:

- Password: Min 8 chars, uppercase, lowercase, digit, special char
- Email: RFC 5322 format
- Phone: Min 10 digits with country code
- Name: 2-100 characters

## Authentication Flow

### Registration Flow

```
1. User POST /register with credentials
2. Validate input with Zod
3. Check email/phone uniqueness
4. Hash password with bcrypt (12 rounds)
5. Create user in database
6. Generate JWT token pair
7. Set refresh token cookie
8. Return user + access token
```

### Login Flow

```
1. User POST /login with email & password
2. Validate input
3. Find user by email
4. Compare password with bcrypt
5. Generate new JWT token pair
6. Set refresh token cookie
7. Return user + access token
```

### Protected Request Flow

```
1. Client includes Authorization header or cookie
2. authenticate middleware extracts token
3. verifyToken validates JWT signature & expiry
4. Extract user claims from token
5. Attach user to request.user
6. Controller accesses request.user
7. Optional: authorize middleware checks roles
8. Process request
```

### Token Refresh Flow

```
1. Client sends refresh token (cookie or body)
2. Validate refresh token JWT
3. Extract user info from token
4. Generate new access token
5. Generate new refresh token
6. Update refresh token cookie
7. Return new access token
```

## Security Implementation

### Password Security

- **Hashing Algorithm**: bcrypt with 12 salt rounds
- **Strength Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one digit
  - At least one special character

### JWT Security

- **Algorithm**: HS256
- **Access Token Expiry**: 15 minutes (short-lived)
- **Refresh Token Expiry**: 7 days (long-lived)
- **Secret Management**: Environment variable (change in production)

### Cookie Security

- **HttpOnly**: Cannot be accessed by JavaScript
- **Secure**: Only sent over HTTPS in production
- **SameSite**: Strict - prevents CSRF attacks
- **Domain**: Auto-set by browser

### Rate Limiting

- Implemented on all endpoints via `rateLimiter` middleware
- Default: 100 requests per 15 minutes per IP
- Configurable per endpoint

### Input Validation

- All inputs validated with Zod before processing
- Returns structured validation errors
- Prevents SQL injection (Prisma parameterized queries)
- Prevents XSS (no HTML in user inputs)

### Error Handling

- Consistent error response format
- Security: Doesn't leak sensitive info
- Logging: All errors logged with context
- Example: "Invalid email or password" (not "User not found")

## Environment Configuration

**Required Variables**:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/stayhub

# JWT
JWT_SECRET=your-secret-key-min-32-chars-change-in-production
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Server
NODE_ENV=development
PORT=5000
```

**Production Checklist**:

- [ ] Change JWT_SECRET to strong random value (32+ chars)
- [ ] Use strong DATABASE_URL
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS (Secure cookie flag)
- [ ] Implement email service for password resets
- [ ] Move password reset tokens to Redis/Database
- [ ] Set up monitoring and logging
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up API key rotation

## Testing the Endpoints

### Using Postman

1. **Register**
   - Method: POST
   - URL: `http://localhost:5000/api/v1/auth/register`
   - Body: JSON with fullName, email, phone, password

2. **Login**
   - Method: POST
   - URL: `http://localhost:5000/api/v1/auth/login`
   - Body: JSON with email, password
   - Save access token from response

3. **Get Current User**
   - Method: GET
   - URL: `http://localhost:5000/api/v1/auth/me`
   - Header: `Authorization: Bearer <access_token>`

4. **Update Profile**
   - Method: PUT
   - URL: `http://localhost:5000/api/v1/auth/profile`
   - Header: `Authorization: Bearer <access_token>`
   - Body: JSON with fullName, phone, profilePhoto

5. **Change Password**
   - Method: PUT
   - URL: `http://localhost:5000/api/v1/auth/change-password`
   - Header: `Authorization: Bearer <access_token>`
   - Body: JSON with oldPassword, newPassword, confirmPassword

6. **Refresh Token**
   - Method: POST
   - URL: `http://localhost:5000/api/v1/auth/refresh`
   - Postman auto-sends refresh token cookie
   - Gets new access token

7. **Logout**
   - Method: POST
   - URL: `http://localhost:5000/api/v1/auth/logout`
   - Header: `Authorization: Bearer <access_token>`

## Response Format

**Successful Response**:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {/* operation data */},
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response**:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": {/* validation errors if any */},
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Future Enhancements

1. **Email Verification**
   - Send verification email on registration
   - Block login until email verified

2. **Two-Factor Authentication**
   - OTP via SMS/Email
   - TOTP authenticator app support

3. **OAuth Integration**
   - Google OAuth
   - GitHub OAuth
   - Facebook OAuth

4. **Session Management**
   - Device tracking
   - Multiple device support
   - Session revocation

5. **Password Reset Email**
   - Email service integration (SendGrid, AWS SES)
   - HTML email templates
   - Token expiry management

6. **Account Security**
   - Failed login attempt tracking
   - Account lockout after N attempts
   - IP whitelisting

7. **Audit Logging**
   - Log all authentication events
   - Track login/logout history
   - Monitor suspicious activity

## Dependencies

- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token management
- `zod` - Schema validation
- `prisma` - ORM
- `@prisma/client` - Prisma client

## Troubleshooting

### Token Expired Error

- Check system time is synced
- Verify JWT_SECRET matches on server
- Check token hasn't been tampered with

### Invalid Credentials

- Ensure email/password are correct
- Check database has user record
- Verify password hasn't been changed

### Validation Failed

- Check request body matches schema
- Verify all required fields are present
- Ensure email format is valid

### Database Connection Error

- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Check credentials in connection string

## Performance Considerations

- **Password Hashing**: Async operation (don't block)
- **JWT Verification**: Fast, use for all protected routes
- **Database Queries**: Indexed on email, phone, id
- **Token Expiry**: 15-min access tokens reduce token exposure
- **Rate Limiting**: Prevents brute force attacks
