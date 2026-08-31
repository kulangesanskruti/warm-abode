# Authentication Module - Testing Guide

## Quick Start

### 1. Prerequisites

```bash
cd /vercel/share/v0-project/backend

# Install dependencies (if not already installed)
npm install

# Ensure Prisma client is generated
npx prisma generate

# Ensure TypeScript compiles without errors
npx tsc --noEmit
```

### 2. Set Environment Variables

Create `.env.local` file in the backend directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/stayhub_dev
JWT_SECRET=your-super-secret-key-change-in-production-min-32-chars
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
NODE_ENV=development
PORT=5000
```

### 3. Start the Server

```bash
npm run dev
```

The server should start on `http://localhost:5000`

## API Testing

### Using cURL

#### 1. Register a New User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+91 98765 43210",
    "password": "SecurePass@123",
    "role": "OWNER"
  }'
```

**Expected Response:**

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

#### 2. Login User

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass@123"
  }'
```

Save the `accessToken` from the response for subsequent requests.

#### 3. Get Current User

```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

#### 4. Update Profile

```bash
curl -X PUT http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Smith",
    "phone": "+91 98765 43211"
  }'
```

#### 5. Change Password

```bash
curl -X PUT http://localhost:5000/api/v1/auth/change-password \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "SecurePass@123",
    "newPassword": "NewPass@456",
    "confirmPassword": "NewPass@456"
  }'
```

#### 6. Refresh Token

```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refreshToken>"
  }'
```

Or if you have the refresh token in a cookie, it's sent automatically:

```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json"
```

#### 7. Logout

```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer <accessToken>"
```

#### 8. Forgot Password

```bash
curl -X POST http://localhost:5000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

#### 9. Reset Password

First, get a reset token (in development, check server logs):

```bash
curl -X POST http://localhost:5000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "<resetToken>",
    "newPassword": "FinalPass@789",
    "confirmPassword": "FinalPass@789"
  }'
```

### Using Postman

#### Setup

1. Create a new collection: "StayHub Auth"
2. Create a new environment with variables:
   - `baseUrl`: `http://localhost:5000/api/v1`
   - `accessToken`: (will be set automatically)
   - `refreshToken`: (will be set automatically)

#### Create Requests

##### Register Request

- **Method**: POST
- **URL**: `{{baseUrl}}/auth/register`
- **Body** (JSON):
  ```json
  {
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "+91 98765 43210",
    "password": "TestPass@123",
    "role": "OWNER"
  }
  ```
- **Tests** (save tokens):
  ```javascript
  if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("accessToken", response.data.accessToken);
    pm.environment.set(
      "refreshToken",
      pm.response.headers.get("set-cookie").split("refreshToken=")[1].split(";")[0],
    );
  }
  ```

##### Login Request

- **Method**: POST
- **URL**: `{{baseUrl}}/auth/login`
- **Body** (JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "TestPass@123"
  }
  ```

##### Get Current User

- **Method**: GET
- **URL**: `{{baseUrl}}/auth/me`
- **Headers**:
  - `Authorization`: `Bearer {{accessToken}}`

##### Update Profile

- **Method**: PUT
- **URL**: `{{baseUrl}}/auth/profile`
- **Headers**:
  - `Authorization`: `Bearer {{accessToken}}`
- **Body** (JSON):
  ```json
  {
    "fullName": "Updated Name",
    "phone": "+91 98765 54321"
  }
  ```

##### Change Password

- **Method**: PUT
- **URL**: `{{baseUrl}}/auth/change-password`
- **Headers**:
  - `Authorization`: `Bearer {{accessToken}}`
- **Body** (JSON):
  ```json
  {
    "oldPassword": "TestPass@123",
    "newPassword": "NewTest@456",
    "confirmPassword": "NewTest@456"
  }
  ```

##### Refresh Token

- **Method**: POST
- **URL**: `{{baseUrl}}/auth/refresh`
- **Body** (JSON):
  ```json
  {
    "refreshToken": "{{refreshToken}}"
  }
  ```

##### Logout

- **Method**: POST
- **URL**: `{{baseUrl}}/auth/logout`
- **Headers**:
  - `Authorization`: `Bearer {{accessToken}}`

## Validation Testing

### Password Requirements

Valid: `SecurePass@123`

- ✓ 8+ characters
- ✓ Uppercase letter: S, P
- ✓ Lowercase letters: ecureass
- ✓ Digit: 123
- ✓ Special character: @

Invalid examples:

```bash
# Too short
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "password": "Pass@1"
  }'
# Error: Password must be at least 8 characters

# No uppercase
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "password": "securepass@123"
  }'
# Error: Password must contain at least one uppercase letter

# No special character
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "password": "SecurePass123"
  }'
# Error: Password must contain at least one special character
```

### Email Validation

```bash
# Invalid email format
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John",
    "email": "invalid-email",
    "phone": "+91 9876543210",
    "password": "SecurePass@123"
  }'
# Error: Invalid email format

# Duplicate email
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "password": "SecurePass@123"
  }'
# (Assuming john@example.com already exists)
# Error: Email already registered
```

### Phone Validation

```bash
# Too short
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John",
    "email": "john@example.com",
    "phone": "123",
    "password": "SecurePass@123"
  }'
# Error: Invalid phone number format

# Duplicate phone
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John",
    "email": "john2@example.com",
    "phone": "+91 98765 43210",
    "password": "SecurePass@123"
  }'
# (Assuming +91 98765 43210 already exists)
# Error: Phone number already registered
```

## Error Handling Testing

### Invalid Credentials

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword@123"
  }'
```

**Response**:

```json
{
  "success": false,
  "message": "Invalid email or password",
  "statusCode": 401,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Expired Token

```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDB9.invalid"
```

**Response**:

```json
{
  "success": false,
  "message": "Token has expired",
  "statusCode": 401,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Unauthorized Request

```bash
curl -X GET http://localhost:5000/api/v1/auth/me
```

**Response**:

```json
{
  "success": false,
  "message": "No authentication token provided",
  "statusCode": 401,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Database Testing

### Check if User was Created

After registration, you can verify in the database:

```sql
SELECT * FROM users WHERE email = 'john@example.com';
```

You should see:

- Password hash (hashed with bcrypt, not plain text)
- Email and phone as unique
- Default role as OWNER if not specified
- isVerified as false

### Check Password Hash

```sql
-- Verify password is hashed
SELECT
  id,
  email,
  passwordHash,
  LENGTH(passwordHash) as hash_length
FROM users
WHERE email = 'john@example.com';
```

The hash should be 60 characters (bcrypt format).

## Performance Testing

### Concurrent Login Attempts

```bash
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "john@example.com",
      "password": "SecurePass@123"
    }' &
done
wait
```

All should succeed without errors.

### Token Refresh under Load

```bash
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/v1/auth/refresh \
    -H "Content-Type: application/json" \
    -d '{"refreshToken": "<refreshToken>"}' &
done
wait
```

## Troubleshooting

### Issue: "Database connection failed"

**Solution**:

- Check DATABASE_URL in .env.local
- Ensure PostgreSQL is running
- Verify credentials

### Issue: "JWT_SECRET not set"

**Solution**:

- Set JWT_SECRET environment variable
- Use at least 32 characters for security

### Issue: "Email already registered"

**Solution**:

- Use a different email address for registration
- Or clear the database and restart

### Issue: "Token verification failed"

**Solution**:

- Check token hasn't expired (15 minutes for access token)
- Use refresh endpoint to get new access token
- Ensure JWT_SECRET matches between generation and verification

## Next Steps

1. **Email Integration**: Connect to SendGrid/AWS SES for password reset emails
2. **Redis Integration**: Store password reset tokens in Redis instead of memory
3. **OAuth Integration**: Add Google, GitHub OAuth support
4. **Two-Factor Authentication**: SMS or TOTP verification
5. **Rate Limiting**: Implement stronger rate limiting per user
6. **Audit Logging**: Log all authentication events to database
