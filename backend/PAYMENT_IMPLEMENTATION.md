# Rent & Payment Management Implementation Guide

## Architecture Overview

The Payment Management module follows a clean layered architecture:

```
Routes (payments.ts)
    ↓
Controllers (paymentController.ts)
    ↓
Services (paymentService.ts)
    ↓
Repositories (paymentRepository.ts)
    ↓
Database (Prisma ORM)
```

## Components

### 1. Validators (`payment.ts`)

**Schemas:**

- `generateMonthlyRentSchema` - Validate month and year
- `collectRentSchema` - Validate rent collection with optional late fees/discounts
- `partialPaymentSchema` - Validate partial payment
- `updatePaymentSchema` - Validate payment updates
- `getPaymentsSchema` - Validate query parameters
- `dashboardFiltersSchema` - Validate dashboard filters

**Enums:**

- `PaymentStatus` - PENDING, PARTIAL, PAID, OVERDUE, CANCELLED, REFUNDED
- `PaymentMethod` - CASH, UPI, BANK_TRANSFER, CARD
- `ActivityType` - Audit trail events

### 2. Repository (`paymentRepository.ts`)

**Methods:**

- `createMonthlyRent()` - Create rent record
- `rentExists()` - Check for duplicate rent
- `getById()` - Get payment by ID with ownership verification
- `getAll()` - Get all payments with filters, pagination, sorting
- `getTenantPaymentHistory()` - Get tenant's payment history
- `getPendingPayments()` - Get all pending/partial payments
- `getOverduePayments()` - Get overdue payments (past grace period)
- `recordPayment()` - Record payment and update status
- `updatePayment()` - Update payment fields
- `cancelPayment()` - Cancel payment and restore outstanding
- `getDashboardMetrics()` - Get financial analytics
- `createActivityLog()` - Create audit log entry
- `createReceipt()` - Generate receipt metadata
- `getReceipt()` - Get receipt details

### 3. Service (`paymentService.ts`)

**Methods:**

- `generateMonthlyRent()` - Bulk generate rent for property
- `collectRent()` - Collect payment with validation
- `recordPartialPayment()` - Record partial payment
- `getPendingPayments()` - Fetch pending list
- `getOverduePayments()` - Fetch overdue list
- `getDashboardMetrics()` - Calculate financial metrics

### 4. Controller (`paymentController.ts`)

**Handlers:**

- `generateMonthlyRent` - POST /generate-monthly
- `collectRent` - POST /collect
- `recordPartialPayment` - POST /partial
- `listPayments` - GET /
- `getPaymentDetails` - GET /:id
- `getPaymentHistory` - GET /history/:tenantId
- `updatePayment` - PUT /:id
- `getPendingPayments` - GET /pending
- `getOverduePayments` - GET /overdue
- `getDashboard` - GET /dashboard
- `cancelPayment` - POST /:id/cancel
- `getReceipt` - GET /receipt/:receiptId

### 5. Routes (`payments.ts`)

All 12 endpoints with JWT authentication middleware.

## Database Schema

### Payment Table

```sql
CREATE TABLE Payment (
  id          String    @id @default(cuid())
  tenantId    String    @db.ObjectId
  propertyId  String    @db.ObjectId
  roomId      String    @db.ObjectId
  bedId       String    @db.ObjectId
  month       Int       -- 1-12
  year        Int       -- 2020+
  rentAmount  Float     -- Monthly rent
  paidAmount  Float     -- Total paid including late fee - discount
  outstandingAmount Float -- Remaining amount
  lateFee     Float     @default(0)
  discount    Float     @default(0)
  status      String    -- PENDING, PARTIAL, PAID, OVERDUE, CANCELLED, REFUNDED
  paymentMethod String  -- CASH, UPI, BANK_TRANSFER, CARD
  referenceNumber String? -- Transaction/UPI reference
  notes       String?
  paymentDate DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  -- Relations
  tenant      Tenant    @relation(fields: [tenantId], references: [id])
  property    Property  @relation(fields: [propertyId], references: [id])
  room        Room      @relation(fields: [roomId], references: [id])
  bed         Bed       @relation(fields: [bedId], references: [id])

  @@unique([tenantId, month, year]) -- Prevent duplicate rent
}
```

### Receipt Table

```sql
CREATE TABLE Receipt (
  id              String    @id @default(cuid())
  receiptNumber   String    @unique
  paymentId       String    @db.ObjectId
  tenantId        String    @db.ObjectId
  propertyId      String    @db.ObjectId
  roomId          String    @db.ObjectId
  bedId           String    @db.ObjectId
  amount          Float
  paymentMethod   String    -- CASH, UPI, BANK_TRANSFER, CARD
  referenceNumber String?
  generatedAt     DateTime  @default(now())
  metadata        Json      @default({}) -- For PDF data
  createdAt       DateTime  @default(now())

  -- Relations
  payment         Payment   @relation(fields: [paymentId], references: [id])
  tenant          Tenant    @relation(fields: [tenantId], references: [id])
  property        Property  @relation(fields: [propertyId], references: [id])
  room            Room      @relation(fields: [roomId], references: [id])
  bed             Bed       @relation(fields: [bedId], references: [id])
}
```

### ActivityLog Table

```sql
CREATE TABLE PaymentActivityLog (
  id            String    @id @default(cuid())
  paymentId     String    @db.ObjectId
  activityType  String    -- RENT_GENERATED, PAYMENT_COLLECTED, etc.
  metadata      Json
  createdAt     DateTime  @default(now())

  -- Relations
  payment       Payment   @relation(fields: [paymentId], references: [id])
}
```

## Business Logic

### Monthly Rent Generation

1. Get all ACTIVE tenants in property
2. Check if rent already exists for month/year
3. Create monthly rent record for each tenant
4. Use tenant's `monthlyRent` field
5. Initialize status as PENDING
6. Log activity

**Duplicate Prevention:** Unique constraint on (tenantId, month, year)

### Payment Collection

1. Verify tenant is ACTIVE
2. Check rent record exists
3. Validate payment amount ≤ outstanding balance
4. Calculate new status:
   - Outstanding = 0 → PAID
   - Outstanding > 0 && Paid > 0 → PARTIAL
   - Outstanding > 0 && Paid = 0 → PENDING
5. Generate receipt number
6. Create receipt metadata
7. Log activity

### Partial Payments

1. Get or create payment record
2. Validate amount ≤ outstanding
3. Add to paid amount
4. Recalculate outstanding and status
5. Generate receipt
6. Log activity

### Late Fee Calculation

- Grace period: 5 days (configurable)
- Applied: Due date + grace period
- Amount: Configured from Settings
- Added to payment but tracked separately

### Overdue Detection

- Payments past due date + grace period
- Status: PENDING or PARTIAL
- Marked as OVERDUE in queries
- Included in overdue rent calculations

### Financial Dashboard

Metrics calculated:

- **Today's Collection:** Sum of payments with paymentDate = today
- **Monthly Collection:** Sum of payments in current month
- **Pending Rent:** Sum of outstanding with status PENDING
- **Overdue Rent:** Sum of outstanding with status OVERDUE
- **Collection Rate:** (Total Paid / Total Rent) × 100
- **Highest Paying Property:** Top 3 by collection
- **Lowest Paying Property:** Bottom 3 by collection

### Receipt Generation

Auto-generated after successful payment:

- Receipt number: RCP-[timestamp]-[random]
- Includes tenant, property, room, bed, amount, method, reference
- Metadata prepared for PDF generation (future)
- Stored for audit trail

### Activity Logging

Events logged:

- `RENT_GENERATED` - Monthly rent created
- `PAYMENT_COLLECTED` - Full/partial payment received
- `PARTIAL_PAYMENT` - Partial payment recorded
- `PAYMENT_UPDATED` - Payment modified
- `PAYMENT_CANCELLED` - Payment cancelled
- `RECEIPT_GENERATED` - Receipt created

## Key Features

### Validation

- Month: 1-12
- Year: 2020+
- Amount: > 0
- Tenant: Must exist and be ACTIVE
- Payment: Cannot exceed outstanding
- Email/Phone: Unique if updated

### Search & Filter

- Search by: Tenant name, phone, receipt number, reference
- Filter by: Month, year, property, payment method, status
- Sort by: Payment date, amount, tenant, receipt number
- Pagination: 1-100 per page

### Data Safety

- Soft delete on payments
- Cannot delete PAID payments
- Duplicate rent prevention
- Outstanding amount recalculation
- Transaction-safe operations

## Testing Scenarios

### 1. Happy Path - Collect Full Rent

```bash
# Generate rent
POST /generate-monthly
{ "month": 1, "year": 2024 }

# Collect payment
POST /collect
{
  "tenantId": "t123",
  "month": 1,
  "year": 2024,
  "amountPaid": 5000,
  "paymentMethod": "UPI"
}

Expected: Status changes PENDING → PAID
```

### 2. Partial Payment Flow

```bash
# First partial
POST /partial
{ "tenantId": "t123", "month": 1, "year": 2024, "amountPaid": 2500 }
# Status: PARTIAL, Outstanding: 2500

# Second partial
POST /partial
{ "tenantId": "t123", "month": 1, "year": 2024, "amountPaid": 2500 }
# Status: PAID, Outstanding: 0
```

### 3. Late Fee

```bash
POST /collect
{
  "tenantId": "t123",
  "month": 1,
  "year": 2024,
  "amountPaid": 5100,
  "lateFee": 100
}
# Amount Paid: 5100 (includes late fee)
```

### 4. Discount Application

```bash
POST /collect
{
  "tenantId": "t123",
  "month": 1,
  "year": 2024,
  "amountPaid": 4800,
  "discount": 200
}
# Effective rent: 5000 - 200 = 4800
```

### 5. Overpayment Prevention

```bash
POST /collect
{
  "tenantId": "t123",
  "month": 1,
  "year": 2024,
  "amountPaid": 6000
}

Expected Error:
"Cannot pay more than 5000. Outstanding: 5000"
```

### 6. Dashboard Analytics

```bash
GET /dashboard?month=1&year=2024

Response:
{
  "todayCollection": 45000,
  "monthlyCollection": 125000,
  "pendingRent": 25000,
  "overdueRent": 8000,
  "collectionRate": 82.5
}
```

## Integration Points

### Property Module

- Verified on payment record
- Ownership verification

### Room Module

- Room ID stored with payment
- Room details in responses

### Bed Module

- Bed ID stored with payment
- Bed status linked

### Tenant Module

- Tenant ID required
- Status checked (must be ACTIVE)
- Monthly rent from tenant profile

### Future: Reports Module

- Financial reports from payments data
- Reconciliation reports

### Future: Notifications Module

- Payment success notification
- Overdue payment reminder
- Receipt delivery

### Future: Scheduler

- Automatic monthly rent generation
- Late fee application
- Overdue reminders

## Performance Considerations

### Indexes Recommended

```sql
-- Payment lookup
CREATE INDEX idx_payment_tenant_month_year ON Payment(tenantId, month, year);
CREATE INDEX idx_payment_property_status ON Payment(propertyId, status);
CREATE INDEX idx_payment_date ON Payment(paymentDate);

-- Dashboard queries
CREATE INDEX idx_payment_property_date ON Payment(propertyId, paymentDate);

-- Search
CREATE INDEX idx_receipt_number ON Receipt(receiptNumber);
CREATE INDEX idx_activity_payment ON PaymentActivityLog(paymentId, createdAt);
```

### Query Optimization

- Pagination enforced (max 100 per page)
- Filtered queries before sorting
- Select only needed fields
- Lazy load activity logs
- Dashboard: Aggregation queries used

## Security

- JWT authentication required
- Ownership verification on all operations
- Input validation via Zod schemas
- SQL injection prevention (Prisma)
- Rate limiting: 100 req/min per user
- Activity logged for audit
- Sensitive data in metadata only

## Error Handling

- 400: Validation errors
- 401: Unauthorized
- 403: Forbidden (ownership)
- 404: Not found
- 409: Conflict (duplicate)
- 500: Server errors

All errors logged with context.

## Future Enhancements

1. **PDF Receipt Generation** - Generate actual PDF files
2. **Automated Scheduling** - Monthly rent generation trigger
3. **Late Fee Engine** - Configurable calculation
4. **Notification System** - Email/SMS/WhatsApp receipts
5. **Payment Gateway Integration** - Online payments
6. **Refund Processing** - Handle refunds
7. **Financial Reports** - Detailed reporting
8. **Multi-currency Support** - Different currencies
9. **Tax Calculation** - TDS, GST integration
10. **Reconciliation** - Bank reconciliation matching
