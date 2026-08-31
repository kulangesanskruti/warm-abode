# Tenant Management Module - Implementation Guide

## Architecture Overview

The Tenant Management module follows the established 5-layer architecture:

```
Routes (tenants.ts)
  ↓
Controllers (tenantController.ts)
  ↓
Services (tenantService.ts)
  ↓
Repositories (tenantRepository.ts)
  ↓
Database (Prisma ORM)
```

## Core Components

### 1. Validators (tenant.ts)

4 main validation schemas:

```typescript
// Tenant registration
createTenantSchema: {
  fullName, phone, email, gender, occupation,
  emergencyContact, emergencyPhone, permanentAddress,
  photoUrl?, monthlyRent, securityDeposit,
  moveInDate, expectedVacateDate?, propertyId, roomId, bedId
}

// Tenant update
updateTenantSchema: All fields optional

// Bed transfer
transferBedSchema: {
  newBedId, newRoomId, newPropertyId, reason?
}

// Vacating
vacateSchema: {
  vacatingDate, reason, securityDepositReturned, finalNotes?
}
```

### 2. Repository (tenantRepository.ts)

Data access layer with 13 methods:

- `create()` - Create tenant
- `findById()` - Get tenant by ID
- `findByEmail()` - Get tenant by email
- `findByPhone()` - Get tenant by phone
- `findAll()` - List with filters, search, pagination
- `update()` - Update tenant
- `softDelete()` - Soft delete tenant
- `updateStatus()` - Change tenant status
- `findByBedId()` - Get tenant in bed
- `countActiveByProperty()` - Count active tenants
- `createActivityLog()` - Log activity
- `getActivityLogs()` - Get timeline
- `createDocument()` - Add document

### 3. Service (tenantService.ts)

Business logic layer with 7 methods:

#### Create Tenant Workflow

1. Validate email/phone unique
2. Check bed availability (VACANT)
3. Validate room belongs to property
4. Create tenant record
5. Update bed status to OCCUPIED
6. Log activity

#### Transfer Bed Workflow

1. Validate tenant exists
2. Check target bed is VACANT
3. Validate target room
4. Free old bed
5. Occupy new bed
6. Update tenant location
7. Log activity with reason

#### Vacate Workflow

1. Validate tenant exists
2. Update status to LEFT
3. Free bed (set to VACANT)
4. Log activity with metadata

#### Document Upload

1. Validate tenant exists
2. Create document record
3. Log activity

### 4. Controller (tenantController.ts)

8 HTTP handlers:

- `createTenant()` - POST /api/v1/tenants
- `getTenant()` - GET /api/v1/tenants/:id
- `getAllTenants()` - GET /api/v1/tenants
- `updateTenant()` - PUT /api/v1/tenants/:id
- `transferBed()` - POST /api/v1/tenants/:id/transfer
- `vacateTenant()` - POST /api/v1/tenants/:id/vacate
- `uploadDocument()` - POST /api/v1/tenants/:id/documents
- `deleteTenant()` - DELETE /api/v1/tenants/:id

### 5. Routes (tenants.ts)

8 RESTful endpoints with JWT authentication and JSDoc.

## Database Schema

### Tenant Table

```sql
CREATE TABLE tenant (
  id UUID PRIMARY KEY,
  propertyId UUID FOREIGN KEY,
  roomId UUID FOREIGN KEY,
  bedId UUID FOREIGN KEY,
  fullName VARCHAR(100),
  phone VARCHAR(15) UNIQUE,
  email VARCHAR(100) UNIQUE,
  gender ENUM('MALE', 'FEMALE', 'OTHER'),
  occupation VARCHAR(100),
  dateOfBirth TIMESTAMP,
  emergencyContact VARCHAR(100),
  emergencyPhone VARCHAR(15),
  permanentAddress VARCHAR(500),
  photoUrl VARCHAR(500),
  monthlyRent DECIMAL(10,2),
  securityDeposit DECIMAL(10,2),
  status ENUM('ACTIVE', 'VACATING', 'LEFT'),
  moveInDate TIMESTAMP,
  expectedVacateDate TIMESTAMP,
  actualVacateDate TIMESTAMP,
  notes TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  deletedAt TIMESTAMP
);

CREATE TABLE tenantDocument (
  id UUID PRIMARY KEY,
  tenantId UUID FOREIGN KEY,
  documentType ENUM('AADHAAR', 'PAN', ...),
  documentUrl VARCHAR(500),
  notes TEXT,
  uploadedAt TIMESTAMP
);

CREATE TABLE activityLog (
  id UUID PRIMARY KEY,
  tenantId UUID FOREIGN KEY,
  propertyId UUID FOREIGN KEY,
  activityType ENUM('TENANT_CREATED', ...),
  description TEXT,
  metadata JSON,
  createdAt TIMESTAMP
);
```

## Key Features

### 1. Automatic Synchronization

When tenant is created:

- Bed status → OCCUPIED
- Activity log → TENANT_CREATED
- Room occupancy auto-updates (if queried)

When bed transferred:

- Old bed → VACANT
- New bed → OCCUPIED
- Activity log → ROOM_CHANGED

When tenant vacated:

- Bed → VACANT
- Tenant status → LEFT
- Activity log → TENANT_VACATED

### 2. Search & Filtering

```
Search: fullName, email, phone
Filter: status, propertyId, roomId, paymentStatus
Pagination: page, limit
Sorting: fullName, moveInDate, monthlyRent, createdAt
```

### 3. Activity Timeline

Automatic logging:

- TENANT_CREATED
- PROFILE_UPDATED
- BED_ASSIGNED
- ROOM_CHANGED
- RENT_COLLECTED
- DOCUMENT_UPLOADED
- TENANT_VACATED
- TENANT_DELETED

### 4. Document Management

Supported documents:

- AADHAAR
- PAN
- RENTAL_AGREEMENT
- PHOTO
- POLICE_VERIFICATION
- OTHER

Stores URLs only (Cloudinary integration later).

## Business Rules

1. **Email/Phone Uniqueness**

   ```
   Cannot register with existing email/phone
   Exception: Can update own email/phone
   ```

2. **Bed Occupancy**

   ```
   One tenant per bed
   One bed per tenant
   Cannot assign occupied bed
   Cannot transfer to occupied bed
   ```

3. **Active Tenant Protection**

   ```
   Cannot delete ACTIVE tenant
   Can only delete LEFT tenants
   ```

4. **Vacating Workflow**
   ```
   Mark status as VACATING (optional)
   Mark status as LEFT when vacating
   Automatically free bed
   ```

## Integration Points

### With Property Module

- All tenants filtered by propertyId
- Property analytics use tenant data
- Property occupancy calculated from tenants

### With Room & Bed Module

- Bed status synchronized on assignment/transfer/vacation
- Room occupancy auto-calculated
- Bed availability validated before assignment

### Future Rent Module

- Will use monthlyRent field
- Will calculate pending rent
- Will generate rent receipts
- Will update payment status

### Future Notification Module

- Will send SMS on tenant creation
- Will send WhatsApp reminders
- Will send email notifications

## Error Handling

Standard error responses:

```typescript
// 400 - Validation Error
{
  success: false,
  message: "Validation failed",
  data: { errors: [...] }
}

// 409 - Conflict (duplicate email/phone)
{
  success: false,
  message: "Email already registered"
}

// 404 - Not Found
{
  success: false,
  message: "Tenant not found"
}

// 400 - Business Rule Violation
{
  success: false,
  message: "Selected bed is not available"
}
```

## Testing Scenarios

### 1. Create Tenant

- Register with valid data
- Prevent duplicate email
- Prevent duplicate phone
- Validate bed is VACANT
- Validate room exists

### 2. Update Tenant

- Update any field
- Prevent duplicate email (on update)
- Prevent duplicate phone (on update)
- Log activity

### 3. Transfer Bed

- Transfer to different bed
- Transfer to different room
- Transfer to different property
- Free old bed
- Occupy new bed

### 4. Vacate Tenant

- Mark as LEFT
- Free bed
- Log activity
- Cannot delete active tenant

### 5. Document Upload

- Upload multiple documents
- Different document types
- Store URLs

## Performance Considerations

1. **Indexing**

   ```sql
   CREATE INDEX idx_tenant_property ON tenant(propertyId);
   CREATE INDEX idx_tenant_room ON tenant(roomId);
   CREATE INDEX idx_tenant_bed ON tenant(bedId);
   CREATE INDEX idx_tenant_email ON tenant(email);
   CREATE INDEX idx_tenant_phone ON tenant(phone);
   ```

2. **Query Optimization**
   - Use pagination (limit 10-100)
   - Filter before joining
   - Lazy load documents/activity logs

3. **Caching**
   - Cache active tenants by property
   - Cache bed occupancy
   - Invalidate on changes

## Future Enhancements

1. **Rent Payment Integration**
   - Track payment status
   - Generate rent receipts
   - Payment reminders

2. **Notification System**
   - SMS on registration
   - WhatsApp reminders
   - Email notifications

3. **Reports**
   - Occupancy reports
   - Revenue reports
   - Tenant analytics

4. **Advanced Search**
   - Tenant history
   - Previous tenants
   - Filtered analytics

## Deployment Checklist

- [ ] Database migrations run
- [ ] Tables created successfully
- [ ] Indexes created
- [ ] JWT authentication working
- [ ] API endpoints tested
- [ ] Error handling verified
- [ ] Logging functional
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] Documentation updated
