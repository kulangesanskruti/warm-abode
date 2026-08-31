# Tenant Management API Documentation

## Overview

Complete API for managing tenants in the StayHub property management system. Includes tenant registration, bed assignment, transfers, vacating, and document management.

## Base URL

```
/api/v1/tenants
```

## Authentication

All endpoints require JWT token in Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

## Endpoints

### 1. Create Tenant

**POST** `/api/v1/tenants`

Create new tenant and automatically assign to bed.

#### Request Body

```json
{
  "fullName": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "gender": "MALE",
  "occupation": "Software Engineer",
  "dateOfBirth": "1995-03-15T00:00:00Z",
  "emergencyContact": "Jane Doe",
  "emergencyPhone": "9876543211",
  "permanentAddress": "123 Main Street, City, State 123456",
  "photoUrl": "https://example.com/photo.jpg",
  "monthlyRent": 15000,
  "securityDeposit": 45000,
  "moveInDate": "2024-01-15T00:00:00Z",
  "expectedVacateDate": "2024-12-15T00:00:00Z",
  "propertyId": "uuid",
  "roomId": "uuid",
  "bedId": "uuid",
  "notes": "Student tenant"
}
```

#### Response (201)

```json
{
  "success": true,
  "message": "Tenant created successfully",
  "data": {
    "tenant": {
      "id": "uuid",
      "propertyId": "uuid",
      "roomId": "uuid",
      "bedId": "uuid",
      "fullName": "John Doe",
      "phone": "9876543210",
      "email": "john@example.com",
      "gender": "MALE",
      "occupation": "Software Engineer",
      "monthlyRent": 15000,
      "securityDeposit": 45000,
      "status": "ACTIVE",
      "moveInDate": "2024-01-15T00:00:00Z",
      "createdAt": "2024-01-10T10:00:00Z"
    }
  }
}
```

#### cURL Example

```bash
curl -X POST http://localhost:3001/api/v1/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "gender": "MALE",
    "occupation": "Software Engineer",
    "emergencyContact": "Jane Doe",
    "emergencyPhone": "9876543211",
    "permanentAddress": "123 Main Street, City, State 123456",
    "monthlyRent": 15000,
    "securityDeposit": 45000,
    "moveInDate": "2024-01-15T00:00:00Z",
    "propertyId": "prop-uuid",
    "roomId": "room-uuid",
    "bedId": "bed-uuid"
  }'
```

---

### 2. Get Tenant

**GET** `/api/v1/tenants/:id`

Get tenant details with documents and activity timeline.

#### Response (200)

```json
{
  "success": true,
  "message": "Tenant retrieved successfully",
  "data": {
    "tenant": {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "monthlyRent": 15000,
      "status": "ACTIVE",
      "moveInDate": "2024-01-15T00:00:00Z",
      "documents": [
        {
          "id": "doc-uuid",
          "documentType": "AADHAAR",
          "documentUrl": "https://cloudinary.com/aadhaar.jpg",
          "uploadedAt": "2024-01-10T10:00:00Z"
        }
      ],
      "activityLogs": [
        {
          "id": "log-uuid",
          "activityType": "TENANT_CREATED",
          "description": "Tenant John Doe registered and assigned to bed A",
          "createdAt": "2024-01-10T10:00:00Z"
        }
      ]
    }
  }
}
```

#### cURL Example

```bash
curl -X GET http://localhost:3001/api/v1/tenants/tenant-uuid \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Get All Tenants

**GET** `/api/v1/tenants`

List all tenants with search, filter, pagination, and sorting.

#### Query Parameters

- `search` (optional): Search by name, email, or phone
- `status` (optional): ACTIVE | VACATING | LEFT
- `paymentStatus` (optional): PAID | PENDING | OVERDUE
- `propertyId` (optional): Filter by property UUID
- `roomId` (optional): Filter by room UUID
- `page` (default: 1): Page number
- `limit` (default: 10, max: 100): Records per page
- `sortBy` (default: createdAt): fullName | moveInDate | monthlyRent | createdAt
- `sortOrder` (default: desc): asc | desc

#### Response (200)

```json
{
  "success": true,
  "message": "Tenants retrieved successfully",
  "data": {
    "tenants": [
      {
        "id": "uuid",
        "fullName": "John Doe",
        "email": "john@example.com",
        "phone": "9876543210",
        "monthlyRent": 15000,
        "status": "ACTIVE",
        "moveInDate": "2024-01-15T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3001/api/v1/tenants?status=ACTIVE&sortBy=moveInDate&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 4. Update Tenant

**PUT** `/api/v1/tenants/:id`

Update tenant information.

#### Request Body (All optional)

```json
{
  "fullName": "John Doe Updated",
  "phone": "9876543210",
  "email": "newemail@example.com",
  "occupation": "Senior Engineer",
  "monthlyRent": 16000,
  "expectedVacateDate": "2024-12-31T00:00:00Z",
  "notes": "Updated notes"
}
```

#### Response (200)

```json
{
  "success": true,
  "message": "Tenant updated successfully",
  "data": {
    "tenant": {
      "id": "uuid",
      "fullName": "John Doe Updated",
      "email": "newemail@example.com"
    }
  }
}
```

#### cURL Example

```bash
curl -X PUT http://localhost:3001/api/v1/tenants/tenant-uuid \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe Updated",
    "monthlyRent": 16000
  }'
```

---

### 5. Transfer Tenant

**POST** `/api/v1/tenants/:id/transfer`

Transfer tenant to different bed/room/property.

#### Request Body

```json
{
  "newBedId": "new-bed-uuid",
  "newRoomId": "new-room-uuid",
  "newPropertyId": "new-property-uuid",
  "reason": "Room upgrade"
}
```

#### Response (200)

```json
{
  "success": true,
  "message": "Tenant transferred successfully",
  "data": {
    "tenant": {
      "id": "uuid",
      "bedId": "new-bed-uuid",
      "roomId": "new-room-uuid",
      "propertyId": "new-property-uuid"
    }
  }
}
```

#### cURL Example

```bash
curl -X POST http://localhost:3001/api/v1/tenants/tenant-uuid/transfer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newBedId": "bed-uuid",
    "newRoomId": "room-uuid",
    "newPropertyId": "property-uuid",
    "reason": "Room upgrade"
  }'
```

---

### 6. Vacate Tenant

**POST** `/api/v1/tenants/:id/vacate`

Mark tenant as vacated and free bed.

#### Request Body

```json
{
  "vacatingDate": "2024-12-15T00:00:00Z",
  "reason": "Moved to new city",
  "securityDepositReturned": 45000,
  "finalNotes": "Good tenant, no issues"
}
```

#### Response (200)

```json
{
  "success": true,
  "message": "Tenant vacated successfully",
  "data": {
    "tenant": {
      "id": "uuid",
      "status": "LEFT",
      "actualVacateDate": "2024-12-15T00:00:00Z"
    }
  }
}
```

#### cURL Example

```bash
curl -X POST http://localhost:3001/api/v1/tenants/tenant-uuid/vacate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vacatingDate": "2024-12-15T00:00:00Z",
    "reason": "Moved to new city",
    "securityDepositReturned": 45000,
    "finalNotes": "Good tenant"
  }'
```

---

### 7. Upload Document

**POST** `/api/v1/tenants/:id/documents`

Upload tenant document (Aadhaar, PAN, etc.).

#### Request Body

```json
{
  "documentType": "AADHAAR",
  "documentUrl": "https://cloudinary.com/aadhaar.jpg",
  "notes": "Front side of Aadhaar"
}
```

#### Response (201)

```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "document": {
      "id": "doc-uuid",
      "tenantId": "tenant-uuid",
      "documentType": "AADHAAR",
      "documentUrl": "https://cloudinary.com/aadhaar.jpg",
      "uploadedAt": "2024-01-10T10:00:00Z"
    }
  }
}
```

#### Document Types Supported

- AADHAAR
- PAN
- RENTAL_AGREEMENT
- PHOTO
- POLICE_VERIFICATION
- OTHER

#### cURL Example

```bash
curl -X POST http://localhost:3001/api/v1/tenants/tenant-uuid/documents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "AADHAAR",
    "documentUrl": "https://cloudinary.com/aadhaar.jpg",
    "notes": "Front side"
  }'
```

---

### 8. Delete Tenant

**DELETE** `/api/v1/tenants/:id`

Soft delete tenant (only if not active).

#### Response (200)

```json
{
  "success": true,
  "message": "Tenant deleted successfully"
}
```

#### cURL Example

```bash
curl -X DELETE http://localhost:3001/api/v1/tenants/tenant-uuid \
  -H "Authorization: Bearer $TOKEN"
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": ["email must be valid", "phone must be 10-15 digits"]
  }
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "Email already registered"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Tenant not found"
}
```

---

## Business Rules

1. **One tenant per bed**: A bed can only have one active tenant
2. **Email/Phone unique**: Cannot register with existing email/phone
3. **Cannot delete active**: Only LEFT tenants can be deleted
4. **Bed availability**: Can only assign to VACANT beds
5. **Transfer validation**: Target bed must be VACANT
6. **Vacating frees bed**: Automatically marks bed as VACANT

---

## Statuses

### Tenant Status

- **ACTIVE**: Currently occupying bed
- **VACATING**: Notice given, leaving soon
- **LEFT**: Vacated, bed is free

### Payment Status

- **PAID**: All rent paid
- **PENDING**: Rent payment pending
- **OVERDUE**: Rent payment overdue

---

## Activity Timeline

Automatically tracked events:

- Tenant Created
- Profile Updated
- Bed Assigned
- Room Changed
- Documents Uploaded
- Tenant Vacated
- Tenant Deleted

---

## Integration Points

### Property Module

- All tenants belong to property
- Property statistics auto-update

### Room & Bed Module

- Bed occupancy auto-updated
- Room occupancy auto-calculated
- Bed status synchronized

### Future Rent Module

- Will use monthlyRent field
- Will track payment status
- Will generate rent receipts

---

## Validation Rules

| Field           | Rules                |
| --------------- | -------------------- |
| fullName        | 2-100 characters     |
| phone           | 10-15 digits, unique |
| email           | Valid format, unique |
| monthlyRent     | Positive number      |
| securityDeposit | Positive number      |
| moveInDate      | Not in future        |

---

## Response Format

All responses follow standard format:

```json
{
  "success": true/false,
  "message": "Human-readable message",
  "data": {},
  "timestamp": "2024-01-10T10:00:00Z"
}
```
