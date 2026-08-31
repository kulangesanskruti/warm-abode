# StayHub Authentication API Documentation

## Overview

Production-ready authentication and authorization API for the StayHub property management platform. Implements secure JWT-based authentication with refresh token rotation, role-based access control, and comprehensive error handling.

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

### Access Token

- **Type**: JWT (Bearer)
- **Expiry**: 15 minutes
- **Location**: Authorization header or Cookie
- **Format**: `Authorization: Bearer <token>`

### Refresh Token

- **Type**: JWT (HttpOnly Secure Cookie)
- **Expiry**: 7 days
- **Storage**: Secure HttpOnly cookie (automatic)
- **Can also be**: Passed in request body

## Roles

- **OWNER**: Full access to property management features
- **MANAGER**: Limited access to property operations
- **ACCOUNTANT**: Access to financial and payment features

## Endpoints

### 1. Register User

Register a new user account with email, phone, and password.

**Request**

```http
POST /auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+91 98765 43210",
  "password": "SecurePass@123",
  "role": "OWNER"
}
```

**Parameters**

| Field    | Type   | Required | Description                                                    |
| -------- | ------ | -------- | -------------------------------------------------------------- |
| fullName | string | Yes      | Full name (2-100 characters)                                   |
| email    | string | Yes      | Valid email address                                            |
| phone    | string | Yes      | Phone number with country code                                 |
| password | string | Yes      | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char |
| role     | enum   | No       | OWNER, MANAGER, ACCOUNTANT (default: OWNER)                    |

**Success Response (201 Created)**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clh5mj3k1000008l0x0x0x0x0",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+91 98765 43210",
      "role": "OWNER",
      "profilePhoto": null,
      "isVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**

```json
{
  "success": false,
  "message": "Email already registered",
  "statusCode": 409,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. Login User

Authenticate user with email and password.

**Request**

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Parameters**

| Field    | Type   | Required | Description              |
| -------- | ------ | -------- | ------------------------ |
| email    | string | Yes      | Registered email address |
| password | string | Yes      | User password            |

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clh5mj3k1000008l0x0x0x0x0",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+91 98765 43210",
      "role": "OWNER",
      "profilePhoto": null,
      "isVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response**

```json
{
  "success": false,
  "message": "Invalid email or password",
  "statusCode": 401,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 3. Get Current User

Retrieve authenticated user profile.

**Request**

```http
GET /auth/me
Authorization: Bearer <access_token>
```

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Current user retrieved",
  "data": {
    "user": {
      "id": "clh5mj3k1000008l0x0x0x0x0",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+91 98765 43210",
      "role": "OWNER",
      "profilePhoto": null,
      "isVerified": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 4. Update Profile

Update user profile information.

**Request**

```http
PUT /auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "fullName": "John Smith",
  "phone": "+91 98765 43211",
  "profilePhoto": "https://example.com/photo.jpg"
}
```

**Parameters**

| Field        | Type   | Required | Description          |
| ------------ | ------ | -------- | -------------------- |
| fullName     | string | No       | Updated full name    |
| phone        | string | No       | Updated phone number |
| profilePhoto | string | No       | Profile photo URL    |

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "clh5mj3k1000008l0x0x0x0x0",
      "fullName": "John Smith",
      "email": "john@example.com",
      "phone": "+91 98765 43211",
      "role": "OWNER",
      "profilePhoto": "https://example.com/photo.jpg",
      "isVerified": false
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 5. Change Password

Change user password.

**Request**

```http
PUT /auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "oldPassword": "SecurePass@123",
  "newPassword": "NewPass@456",
  "confirmPassword": "NewPass@456"
}
```

**Parameters**

| Field           | Type   | Required | Description                         |
| --------------- | ------ | -------- | ----------------------------------- |
| oldPassword     | string | Yes      | Current password                    |
| newPassword     | string | Yes      | New password (must differ from old) |
| confirmPassword | string | Yes      | Confirm new password                |

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Password changed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 6. Refresh Token

Get a new access token using refresh token.

**Request (Option 1: From Cookie)**

```http
POST /auth/refresh
```

**Request (Option 2: In Body)**

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response**

```json
{
  "success": false,
  "message": "Token has expired",
  "statusCode": 401,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 7. Forgot Password

Request password reset email (mock implementation).

**Request**

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Parameters**

| Field | Type   | Required | Description              |
| ----- | ------ | -------- | ------------------------ |
| email | string | Yes      | Registered email address |

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "If the email exists, password reset instructions have been sent",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Note**: Returns success even if email doesn't exist (security best practice).

---

### 8. Reset Password

Reset password with reset token.

**Request**

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "abcd1234efgh5678ijkl9012",
  "newPassword": "NewPass@789",
  "confirmPassword": "NewPass@789"
}
```

**Parameters**

| Field           | Type   | Required | Description          |
| --------------- | ------ | -------- | -------------------- |
| token           | string | Yes      | Password reset token |
| newPassword     | string | Yes      | New password         |
| confirmPassword | string | Yes      | Confirm new password |

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Password reset successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response**

```json
{
  "success": false,
  "message": "Reset token has expired",
  "statusCode": 401,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 9. Logout

Logout user and clear refresh token.

**Request**

```http
POST /auth/logout
Authorization: Bearer <access_token>
```

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Logout successful",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Error Codes

| Code | Message               | Meaning                              |
| ---- | --------------------- | ------------------------------------ |
| 400  | Validation failed     | Request data is invalid              |
| 401  | Unauthorized          | Invalid credentials or expired token |
| 409  | Conflict              | Email or phone already exists        |
| 500  | Internal Server Error | Server error                         |

## Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT-based authentication
- ✅ HttpOnly secure cookies
- ✅ SameSite cookie protection
- ✅ CORS enabled
- ✅ Helmet security headers
- ✅ Rate limiting
- ✅ Input validation with Zod
- ✅ Comprehensive error handling
- ✅ Audit logging

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/stayhub
JWT_SECRET=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
NODE_ENV=development
PORT=5000
```

## cURL Examples

### Register

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+91 98765 43210",
    "password": "SecurePass@123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass@123"
  }'
```

### Get Current User

```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>"
```

### Update Profile

```bash
curl -X PUT http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Smith",
    "phone": "+91 98765 43211"
  }'
```

### Change Password

```bash
curl -X PUT http://localhost:5000/api/v1/auth/change-password \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "SecurePass@123",
    "newPassword": "NewPass@456",
    "confirmPassword": "NewPass@456"
  }'
```

### Refresh Token

```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token>"
  }'
```

### Logout

```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

## Notes

- Passwords must be at least 8 characters with uppercase, lowercase, digit, and special character
- Phone numbers must be at least 10 digits
- Refresh tokens are automatically set as HttpOnly cookies for security
- All timestamps are in ISO 8601 format
- Rate limiting is implemented on all endpoints
