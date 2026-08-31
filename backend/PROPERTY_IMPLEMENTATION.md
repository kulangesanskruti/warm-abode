# Property Management Module - Implementation Guide

## Overview

The Property Management module provides complete CRUD operations for managing rental properties. It follows a clean, layered architecture with Repository, Service, and Controller patterns.

## Architecture

```
Request → Route → Controller → Service → Repository → Database
                ↓                ↓            ↓
            Validation    Business Logic   Data Access
```

## Component Breakdown

### 1. Validators (`src/validators/property.ts`)

Zod-based validation schemas for all property operations.

**Schemas:**

- `createPropertySchema` - Validate new property creation
- `updatePropertySchema` - Validate property updates
- `propertyQuerySchema` - Validate query parameters
- `uploadPropertyImageSchema` - Validate image upload

**Key Validations:**

- Property name uniqueness per owner
- Pincode format (6 digits)
- URL format for image URLs
- Field lengths and types

### 2. Repository (`src/repositories/propertyRepository.ts`)

Data access layer responsible for database operations.

**Methods:**

- `create()` - Insert new property
- `findById()` - Fetch single property with ownership check
- `findAll()` - Fetch properties with pagination, search, filter, sort
- `update()` - Update property fields
- `softDelete()` - Mark property as deleted
- `propertyNameExists()` - Check for duplicate names
- `updateImage()` - Update property image URL

**Key Features:**

- Lazy-loaded Prisma client
- Ownership verification
- Soft delete support
- Comprehensive error handling
- Activity logging

### 3. Service (`src/services/propertyService.ts`)

Business logic layer handling complex operations and workflows.

**Methods:**

- `createProperty()` - Create with duplicate check
- `getAllProperties()` - Fetch with filtering
- `getPropertyById()` - Fetch with aggregated data
- `updateProperty()` - Update with validation
- `deleteProperty()` - Soft delete
- `uploadPropertyImage()` - Update image

**Key Features:**

- Duplicate property name detection
- Aggregated property statistics
- Activity logging for audit trail
- Business rule enforcement
- Error handling and logging

### 4. Controller (`src/controllers/propertyController.ts`)

HTTP request/response handlers.

**Methods:**

- `createProperty()` - POST handler
- `getAllProperties()` - GET list handler
- `getPropertyById()` - GET detail handler
- `updateProperty()` - PUT handler
- `deleteProperty()` - DELETE handler
- `uploadImage()` - POST image handler

**Key Features:**

- Request validation
- Response formatting
- Error handling
- Authentication checks

### 5. Routes (`src/routes/properties.ts`)

API endpoint definitions and middleware application.

**Endpoints:**

- `POST /` - Create property
- `GET /` - List properties
- `GET /:id` - Get property details
- `PUT /:id` - Update property
- `DELETE /:id` - Delete property
- `POST /:id/image` - Upload image

All endpoints require authentication.

## Data Model

```typescript
Property {
  id: string              // UUID
  ownerId: string         // Reference to User
  propertyName: string    // 3-100 chars, unique per owner
  propertyType: string    // 3-50 chars
  address: string         // 5-200 chars
  city: string            // 2-50 chars
  state: string           // 2-50 chars
  pincode: string         // 6 digits
  country: string         // 2-50 chars
  totalFloors: number     // 1-100
  description: string?    // 0-1000 chars, nullable
  imageUrl: string?       // Valid URL, nullable
  status: enum            // ACTIVE | INACTIVE
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime?    // Null = not deleted
}
```

## Business Rules

1. **Ownership**: Properties belong to one owner; users only see their own
2. **Uniqueness**: Property names must be unique per owner
3. **Soft Delete**: Deleted properties are marked with `deletedAt` timestamp
4. **Queries**: Deleted properties are excluded from all queries by default
5. **Timestamps**: `createdAt` and `updatedAt` are automatically managed

## Features

### Search

- Full-text search across property name, address, and city
- Case-insensitive matching
- Combines with other filters

### Filters

- **Status**: ACTIVE or INACTIVE
- **City**: Exact match (case-insensitive)
- **Property Type**: Exact match (case-insensitive)

### Sorting

- By name (alphabetical)
- By creation date (default)
- By city (alphabetical)
- By last update date
- Ascending or descending order

### Pagination

- Page-based pagination
- Default: 10 items per page
- Maximum: 100 items per page
- Response includes total records and total pages

### Property Details

Includes aggregated data:

- `totalRooms` - Count of rooms in property
- `totalBeds` - Total beds across all rooms
- `occupiedBeds` - Currently occupied beds
- `vacantBeds` - Available beds
- `occupancyPercentage` - Occupancy rate
- `monthlyRevenue` - Total monthly rent
- `pendingRent` - Unpaid rent
- `maintenanceCount` - Open maintenance requests

### Activity Logging

Automatically logs:

- PROPERTY_CREATED - When property is created
- PROPERTY_UPDATED - When property is modified
- PROPERTY_DELETED - When property is deleted
- PROPERTY_IMAGE_UPDATED - When image is updated

## Error Handling

**Validation Errors (400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      { "field": "propertyName", "message": "Property name must be at least 3 characters" }
    ]
  }
}
```

**Not Found (404):**

```json
{
  "success": false,
  "message": "Property not found",
  "data": null
}
```

**Conflict (409):**

```json
{
  "success": false,
  "message": "Property with this name already exists",
  "data": null
}
```

**Unauthorized (401):**

```json
{
  "success": false,
  "message": "Unauthorized",
  "data": null
}
```

## Security Measures

1. **Authentication**: All endpoints require JWT token
2. **Authorization**: Users only access their own properties
3. **Input Validation**: Zod schemas validate all inputs
4. **SQL Injection Prevention**: Prisma parameterized queries
5. **Rate Limiting**: Global rate limiting applied
6. **CORS**: Restricted to allowed origins
7. **Helmet**: Security headers applied
8. **Activity Logging**: All modifications logged

## Testing Scenarios

### Create Property

1. Valid creation - should return 201 with property data
2. Missing required fields - should return 400
3. Duplicate name - should return 409
4. Invalid pincode - should return 400
5. Unauthorized (no token) - should return 401

### Get Properties

1. List all - should return paginated list
2. With search - should filter results
3. With filters - should apply status/city/type filters
4. With sorting - should sort by specified field
5. Pagination - should respect page and limit

### Get Property Details

1. Valid ID - should return full property with aggregates
2. Invalid ID - should return 404
3. Other user's property - should return 404
4. Deleted property - should return 404

### Update Property

1. Valid update - should return updated property
2. Duplicate name - should return 409
3. Invalid data - should return 400
4. Other user's property - should return 404
5. Partial update - should update only provided fields

### Delete Property

1. Valid delete - should soft delete property
2. Deleted property not in queries - should not appear in list
3. Other user's property - should return 404

### Upload Image

1. Valid URL - should update image URL
2. Invalid URL - should return 400
3. Property not found - should return 404

## Implementation Checklist

- [x] Property validators created
- [x] Property repository created
- [x] Property service created
- [x] Property controller created
- [x] Property routes created
- [x] Routes registered in app
- [x] Search functionality implemented
- [x] Filter functionality implemented
- [x] Pagination implemented
- [x] Sorting implemented
- [x] Soft delete implemented
- [x] Activity logging prepared
- [x] Error handling implemented
- [x] TypeScript compilation successful
- [x] Documentation created
- [x] API examples provided

## Next Steps

1. **Database Migration**: Run Prisma migration to create Property table
2. **Testing**: Use provided cURL examples to test endpoints
3. **Frontend Integration**: Connect frontend to property endpoints
4. **Image Storage**: Integrate Cloudinary or similar for image uploads
5. **Rooms Module**: Implement rooms (sub-properties) after properties stabilize

## Files Modified/Created

**Created:**

- `src/validators/property.ts` (142 lines)
- `src/repositories/propertyRepository.ts` (333 lines)
- `src/services/propertyService.ts` (313 lines)
- `src/controllers/propertyController.ts` (252 lines)
- `src/routes/properties.ts` (86 lines)
- `PROPERTY_API.md` (525 lines)
- `PROPERTY_IMPLEMENTATION.md` (this file)

**Modified:**

- `src/app.ts` (added property routes)

**Total Code:** 1,126 lines of TypeScript
**Total Documentation:** 1,050 lines

## Performance Considerations

1. **Database Indexes**: Add indexes on:
   - `properties.ownerId` - For owner queries
   - `properties.city` - For city filters
   - `properties.propertyType` - For type filters
   - `properties.deletedAt` - For soft delete queries

2. **Query Optimization**:
   - Use pagination for large datasets
   - Consider caching frequently accessed properties
   - Add database query timeouts

3. **Pagination Limits**:
   - Default: 10 items
   - Maximum: 100 items
   - Prevents memory issues with large datasets

## Monitoring & Logging

- All operations logged with userId and propertyId
- Activity audit trail for compliance
- Error logging for debugging
- Request logging for analytics
