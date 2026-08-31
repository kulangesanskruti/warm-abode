# Rent & Payment Management API Documentation

## Overview

Production-ready REST API for managing rent collection, payments, and financial analytics. Supports monthly rent generation, partial payments, late fees, discounts, and comprehensive dashboard metrics.

## Base URL

```
/api/v1/payments
```

## Authentication

All endpoints require JWT authentication via `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## API Endpoints

### 1. Generate Monthly Rent

Generate rent records for all active tenants in a property for a specific month.

**Endpoint:** `POST /api/v1/payments/generate-monthly`

**Request Body:**

```json
{
  "month": 1,
  "year": 2024
}
```

**Response:**

```json
{
  "success": true,
  "message": "Monthly rent generated successfully",
  "data": {
    "generated": 12,
    "skipped": 2,
    "errors": []
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3001/api/v1/payments/generate-monthly \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "month": 1,
    "year": 2024
  }'
```

---

### 2. Collect Rent Payment

Record a full or partial rent collection with optional late fees and discounts.

**Endpoint:** `POST /api/v1/payments/collect`

**Request Body:**

```json
{
  "tenantId": "tenant_123",
  "month": 1,
  "year": 2024,
  "amountPaid": 5000,
  "lateFee": 100,
  "discount": 0,
  "paymentMethod": "UPI",
  "referenceNumber": "UPI123456789",
  "notes": "Collected via mobile"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Rent collected successfully",
  "data": {
    "payment": {
      "id": "payment_456",
      "tenantId": "tenant_123",
      "rentAmount": 5000,
      "paidAmount": 5100,
      "outstandingAmount": 0,
      "status": "PAID",
      "paymentDate": "2024-01-15T10:30:00Z"
    },
    "receiptNumber": "RCP-1705313400000-ABC123XYZ",
    "status": "success"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Validation:**

- Cannot pay more than outstanding balance
- Amount paid must be > 0
- Tenant must be ACTIVE

**cURL Example:**

```bash
curl -X POST http://localhost:3001/api/v1/payments/collect \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant_123",
    "month": 1,
    "year": 2024,
    "amountPaid": 5000,
    "lateFee": 100,
    "paymentMethod": "UPI",
    "referenceNumber": "UPI123456789"
  }'
```

---

### 3. Record Partial Payment

Record a partial payment for rent that may be paid in multiple installments.

**Endpoint:** `POST /api/v1/payments/partial`

**Request Body:**

```json
{
  "tenantId": "tenant_123",
  "month": 1,
  "year": 2024,
  "amountPaid": 2500,
  "paymentMethod": "CASH",
  "referenceNumber": "CASH001",
  "notes": "First installment"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Partial payment recorded successfully",
  "data": {
    "payment": {
      "id": "payment_456",
      "tenantId": "tenant_123",
      "rentAmount": 5000,
      "paidAmount": 2500,
      "outstandingAmount": 2500,
      "status": "PARTIAL"
    },
    "receiptNumber": "RCP-1705313400001-XYZ789ABC",
    "status": "partial"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3001/api/v1/payments/partial \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant_123",
    "month": 1,
    "year": 2024,
    "amountPaid": 2500,
    "paymentMethod": "CASH",
    "referenceNumber": "CASH001"
  }'
```

---

### 4. List All Payments

Get paginated list of payments with filtering and sorting options.

**Endpoint:** `GET /api/v1/payments`

**Query Parameters:**

- `page` (default: 1) - Page number
- `limit` (default: 10, max: 100) - Items per page
- `month` - Filter by month (1-12)
- `year` - Filter by year
- `propertyId` - Filter by property
- `paymentMethod` - Filter by payment method (CASH, UPI, BANK_TRANSFER, CARD)
- `status` - Filter by status (PENDING, PARTIAL, PAID, OVERDUE, CANCELLED, REFUNDED)
- `search` - Search by tenant name, phone, receipt or reference number
- `sortBy` - Sort field (paymentDate, amount, tenant, receiptNumber)
- `order` - Sort order (asc, desc)

**Response:**

```json
{
  "success": true,
  "message": "Payments retrieved successfully",
  "data": {
    "payments": [
      {
        "id": "payment_456",
        "tenantId": "tenant_123",
        "tenant": { "fullName": "John Doe", "phoneNumber": "9876543210" },
        "propertyId": "prop_789",
        "rentAmount": 5000,
        "paidAmount": 5000,
        "outstandingAmount": 0,
        "status": "PAID",
        "paymentMethod": "UPI",
        "month": 1,
        "year": 2024,
        "paymentDate": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**cURL Example:**

```bash
curl "http://localhost:3001/api/v1/payments?page=1&limit=10&status=PAID&month=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 5. Get Payment Details

Get detailed information about a specific payment.

**Endpoint:** `GET /api/v1/payments/:id`

**Response:**

```json
{
  "success": true,
  "message": "Payment details retrieved successfully",
  "data": {
    "id": "payment_456",
    "tenantId": "tenant_123",
    "tenant": { "fullName": "John Doe" },
    "propertyId": "prop_789",
    "roomId": "room_101",
    "bedId": "bed_A",
    "rentAmount": 5000,
    "paidAmount": 5000,
    "outstandingAmount": 0,
    "status": "PAID",
    "lateFee": 100,
    "discount": 0,
    "paymentMethod": "UPI",
    "referenceNumber": "UPI123456789",
    "notes": "Collected via mobile",
    "month": 1,
    "year": 2024,
    "paymentDate": "2024-01-15T10:30:00Z",
    "activityLogs": [
      {
        "activityType": "PAYMENT_COLLECTED",
        "metadata": { "amountPaid": 5000, "receiptNumber": "RCP-..." }
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**cURL Example:**

```bash
curl http://localhost:3001/api/v1/payments/payment_456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 6. Get Tenant Payment History

Get complete payment history for a specific tenant.

**Endpoint:** `GET /api/v1/payments/history/:tenantId`

**Response:**

```json
{
  "success": true,
  "message": "Payment history retrieved successfully",
  "data": [
    {
      "id": "payment_456",
      "month": 1,
      "year": 2024,
      "rentAmount": 5000,
      "paidAmount": 5000,
      "status": "PAID",
      "paymentDate": "2024-01-15T10:30:00Z"
    },
    {
      "id": "payment_457",
      "month": 2,
      "year": 2024,
      "rentAmount": 5000,
      "paidAmount": 2500,
      "status": "PARTIAL",
      "paymentDate": "2024-02-20T15:45:00Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**cURL Example:**

```bash
curl http://localhost:3001/api/v1/payments/history/tenant_123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 7. Update Payment

Update payment details (notes, reference number, etc.).

**Endpoint:** `PUT /api/v1/payments/:id`

**Request Body:**

```json
{
  "notes": "Updated notes",
  "referenceNumber": "NEW_REF_001"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment updated successfully",
  "data": {
    "id": "payment_456",
    "notes": "Updated notes",
    "referenceNumber": "NEW_REF_001"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**cURL Example:**

```bash
curl -X PUT http://localhost:3001/api/v1/payments/payment_456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Updated notes"}'
```

---

### 8. Get Pending Payments

Get list of all pending payments (not fully paid).

**Endpoint:** `GET /api/v1/payments/pending`

**Response:**

```json
{
  "success": true,
  "message": "Pending payments retrieved successfully",
  "data": [
    {
      "id": "payment_457",
      "tenantId": "tenant_123",
      "tenant": { "fullName": "John Doe" },
      "rentAmount": 5000,
      "paidAmount": 2500,
      "outstandingAmount": 2500,
      "status": "PARTIAL",
      "month": 2,
      "year": 2024
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**cURL Example:**

```bash
curl http://localhost:3001/api/v1/payments/pending \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 9. Get Overdue Payments

Get list of overdue payments (past grace period without full payment).

**Endpoint:** `GET /api/v1/payments/overdue`

**Response:**

```json
{
  "success": true,
  "message": "Overdue payments retrieved successfully",
  "data": [
    {
      "id": "payment_450",
      "tenantId": "tenant_099",
      "tenant": { "fullName": "Jane Smith", "phoneNumber": "9999999999" },
      "rentAmount": 4000,
      "paidAmount": 0,
      "outstandingAmount": 4000,
      "status": "OVERDUE",
      "month": 12,
      "year": 2023,
      "createdAt": "2023-12-01T00:00:00Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**cURL Example:**

```bash
curl http://localhost:3001/api/v1/payments/overdue \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 10. Financial Dashboard

Get comprehensive financial metrics and analytics.

**Endpoint:** `GET /api/v1/payments/dashboard`

**Query Parameters:**

- `month` - Filter by month (optional)
- `year` - Filter by year (optional)
- `propertyId` - Filter by specific property (optional)

**Response:**

```json
{
  "success": true,
  "message": "Dashboard metrics retrieved successfully",
  "data": {
    "todayCollection": 15000,
    "monthlyCollection": 125000,
    "pendingRent": 45000,
    "overdueRent": 12000,
    "collectionRate": 87.5,
    "activeProperties": 8,
    "highestPayingProperty": "prop_001",
    "lowestPayingProperty": "prop_008"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**cURL Example:**

```bash
curl "http://localhost:3001/api/v1/payments/dashboard?month=1&year=2024" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 11. Cancel Payment

Cancel a payment and restore outstanding balance.

**Endpoint:** `POST /api/v1/payments/:id/cancel`

**Response:**

```json
{
  "success": true,
  "message": "Payment cancelled successfully",
  "data": {
    "id": "payment_456",
    "status": "CANCELLED",
    "outstandingAmount": 5000
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3001/api/v1/payments/payment_456/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 12. Get Receipt

Get receipt metadata for a payment.

**Endpoint:** `GET /api/v1/payments/receipt/:receiptId`

**Response:**

```json
{
  "success": true,
  "message": "Receipt retrieved successfully",
  "data": {
    "id": "receipt_789",
    "receiptNumber": "RCP-1705313400000-ABC123XYZ",
    "paymentId": "payment_456",
    "tenantId": "tenant_123",
    "propertyId": "prop_789",
    "roomId": "room_101",
    "bedId": "bed_A",
    "amount": 5000,
    "paymentMethod": "UPI",
    "referenceNumber": "UPI123456789",
    "generatedAt": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**cURL Example:**

```bash
curl http://localhost:3001/api/v1/payments/receipt/receipt_789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Payment Status Enums

| Status    | Description                         |
| --------- | ----------------------------------- |
| PENDING   | Rent generated, no payment received |
| PARTIAL   | Partial payment received            |
| PAID      | Full payment received               |
| OVERDUE   | Not paid after grace period         |
| CANCELLED | Payment cancelled                   |
| REFUNDED  | Payment refunded                    |

## Payment Methods

| Method        | Description       |
| ------------- | ----------------- |
| CASH          | Cash payment      |
| UPI           | UPI transfer      |
| BANK_TRANSFER | Bank transfer     |
| CARD          | Credit/Debit card |

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "amountPaid": "Amount must be greater than 0"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Payment not found",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Business Rules

1. **Cannot overpay:** Payment amount cannot exceed outstanding balance
2. **Duplicate prevention:** Cannot generate duplicate rent for same month/year
3. **Partial payments:** Support multiple payments for same rent
4. **Late fees:** Automatically calculated on overdue payments
5. **Discounts:** Configurable discounts per payment
6. **Soft delete:** Payments are not physically deleted
7. **Audit trail:** All changes logged with metadata

---

## Integration Notes

- Monthly rent generation runs automatically on schedule (future)
- Late fees calculated based on grace period
- Receipts prepared for PDF generation (future)
- Dashboard metrics updated automatically
- Activity logs created for all operations
- Notifications triggered on payment success (future)
- WhatsApp receipts prepared for future integration

---

## Rate Limiting

- 100 requests per minute per user
- 10 generate-monthly requests per day per property

---

## Response Format

All responses follow this format:

```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "errors": object (optional),
  "timestamp": ISO 8601 timestamp
}
```
