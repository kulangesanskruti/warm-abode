# Property Management API Documentation

## Overview

The Property Management API allows property owners to manage their rental properties through RESTful endpoints. All endpoints require authentication via JWT.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All property endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Property

**Endpoint:** `POST /properties`

**Description:** Create a new property

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "propertyName": "Downtown Apartment Complex",
  "propertyType": "Apartment",
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "pincode": "100001",
  "country": "USA",
  "totalFloors": 5,
  "description": "Modern apartment complex with 20 units",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "id": "prop_123",
    "ownerId": "user_456",
    "propertyName": "Downtown Apartment Complex",
    "propertyType": "Apartment",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "pincode": "100001",
    "country": "USA",
    "totalFloors": 5,
    "description": "Modern apartment complex with 20 units",
    "imageUrl": "https://example.com/image.jpg",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "deletedAt": null
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**

- `400 Bad Request` - Validation failed
- `409 Conflict` - Property with same name already exists
- `401 Unauthorized` - Invalid token

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/v1/properties \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyName": "Downtown Apartment",
    "propertyType": "Apartment",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "pincode": "100001",
    "country": "USA",
    "totalFloors": 5
  }'
```

---

### 2. Get All Properties

**Endpoint:** `GET /properties`

**Description:** Get all properties for the authenticated user with filters, search, and pagination

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional, default: 1) - Page number for pagination
- `limit` (optional, default: 10, max: 100) - Items per page
- `search` (optional) - Search by property name, address, or city
- `sort` (optional, default: createdAt) - Sort field: name, createdAt, city, updatedAt
- `order` (optional, default: desc) - Sort order: asc, desc
- `status` (optional) - Filter by status: ACTIVE, INACTIVE
- `city` (optional) - Filter by city
- `propertyType` (optional) - Filter by property type

**Example Request:**

```
GET /properties?page=1&limit=10&search=apartment&city=New York&sort=name&order=asc
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Properties retrieved successfully",
  "data": {
    "properties": [
      {
        "id": "prop_123",
        "ownerId": "user_456",
        "propertyName": "Downtown Apartment Complex",
        "propertyType": "Apartment",
        "address": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "pincode": "100001",
        "country": "USA",
        "totalFloors": 5,
        "description": "Modern apartment complex",
        "imageUrl": "https://example.com/image.jpg",
        "status": "ACTIVE",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "deletedAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  },
  "timestamp": "2024-01-15T10:35:00Z"
}
```

**cURL Example:**

```bash
curl -X GET "http://localhost:3000/api/v1/properties?page=1&limit=10&search=apartment&sort=name" \
  -H "Authorization: Bearer <token>"
```

---

### 3. Get Property By ID

**Endpoint:** `GET /properties/:id`

**Description:** Get detailed information about a specific property including aggregated data

**Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (required) - Property ID

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Property retrieved successfully",
  "data": {
    "id": "prop_123",
    "ownerId": "user_456",
    "propertyName": "Downtown Apartment Complex",
    "propertyType": "Apartment",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "pincode": "100001",
    "country": "USA",
    "totalFloors": 5,
    "description": "Modern apartment complex",
    "imageUrl": "https://example.com/image.jpg",
    "status": "ACTIVE",
    "totalRooms": 20,
    "totalBeds": 40,
    "occupiedBeds": 28,
    "vacantBeds": 12,
    "occupancyPercentage": 70,
    "monthlyRevenue": 15000,
    "pendingRent": 2000,
    "maintenanceCount": 3,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "deletedAt": null
  },
  "timestamp": "2024-01-15T10:35:00Z"
}
```

**Error Responses:**

- `404 Not Found` - Property not found
- `401 Unauthorized` - Invalid token

**cURL Example:**

```bash
curl -X GET http://localhost:3000/api/v1/properties/prop_123 \
  -H "Authorization: Bearer <token>"
```

---

### 4. Update Property

**Endpoint:** `PUT /properties/:id`

**Description:** Update property details

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**

- `id` (required) - Property ID

**Request Body (all fields optional):**

```json
{
  "propertyName": "Updated Property Name",
  "propertyType": "Commercial",
  "address": "456 New Street",
  "city": "Los Angeles",
  "state": "CA",
  "pincode": "900001",
  "country": "USA",
  "totalFloors": 10,
  "description": "Updated description",
  "imageUrl": "https://example.com/new-image.jpg",
  "status": "INACTIVE"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Property updated successfully",
  "data": {
    "id": "prop_123",
    "ownerId": "user_456",
    "propertyName": "Updated Property Name",
    "propertyType": "Commercial",
    "address": "456 New Street",
    "city": "Los Angeles",
    "state": "CA",
    "pincode": "900001",
    "country": "USA",
    "totalFloors": 10,
    "description": "Updated description",
    "imageUrl": "https://example.com/new-image.jpg",
    "status": "INACTIVE",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:00:00Z",
    "deletedAt": null
  },
  "timestamp": "2024-01-15T11:00:00Z"
}
```

**Error Responses:**

- `400 Bad Request` - Validation failed
- `404 Not Found` - Property not found
- `409 Conflict` - Property name already exists

**cURL Example:**

```bash
curl -X PUT http://localhost:3000/api/v1/properties/prop_123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyName": "Updated Property Name",
    "status": "INACTIVE"
  }'
```

---

### 5. Delete Property (Soft Delete)

**Endpoint:** `DELETE /properties/:id`

**Description:** Soft delete a property (marked as deleted, not permanently removed)

**Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (required) - Property ID

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Property deleted successfully",
  "data": null,
  "timestamp": "2024-01-15T11:05:00Z"
}
```

**Error Responses:**

- `404 Not Found` - Property not found
- `401 Unauthorized` - Invalid token

**cURL Example:**

```bash
curl -X DELETE http://localhost:3000/api/v1/properties/prop_123 \
  -H "Authorization: Bearer <token>"
```

---

### 6. Upload Property Image

**Endpoint:** `POST /properties/:id/image`

**Description:** Upload or update property image URL

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**

- `id` (required) - Property ID

**Request Body:**

```json
{
  "imageUrl": "https://example.com/property-image.jpg"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Property image uploaded successfully",
  "data": {
    "id": "prop_123",
    "ownerId": "user_456",
    "propertyName": "Downtown Apartment Complex",
    "propertyType": "Apartment",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "pincode": "100001",
    "country": "USA",
    "totalFloors": 5,
    "description": "Modern apartment complex",
    "imageUrl": "https://example.com/property-image.jpg",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:10:00Z",
    "deletedAt": null
  },
  "timestamp": "2024-01-15T11:10:00Z"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid image URL
- `404 Not Found` - Property not found

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/v1/properties/prop_123/image \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/new-property-image.jpg"
  }'
```

---

## Error Codes

| Status Code | Meaning               | Description                               |
| ----------- | --------------------- | ----------------------------------------- |
| 200         | OK                    | Request successful                        |
| 201         | Created               | Property created successfully             |
| 400         | Bad Request           | Invalid input or validation failed        |
| 401         | Unauthorized          | Missing or invalid authentication token   |
| 404         | Not Found             | Property not found                        |
| 409         | Conflict              | Duplicate property name or other conflict |
| 500         | Internal Server Error | Server error                              |

## Validation Rules

### Property Name

- Minimum 3 characters
- Maximum 100 characters
- Must be unique per owner

### Property Type

- Minimum 3 characters
- Maximum 50 characters

### Address

- Minimum 5 characters
- Maximum 200 characters

### City

- Minimum 2 characters
- Maximum 50 characters

### State

- Minimum 2 characters
- Maximum 50 characters

### Pincode

- Must be exactly 6 digits

### Country

- Minimum 2 characters
- Maximum 50 characters

### Total Floors

- Minimum 1
- Maximum 100

### Description

- Optional
- Maximum 1000 characters

### Image URL

- Optional
- Must be valid URL format

## Pagination

All list endpoints support pagination:

- Default limit: 10
- Maximum limit: 100
- Pages are 1-indexed
- Response includes total records and total pages

## Sorting

Supported sort fields:

- `name` - Sort by property name
- `createdAt` - Sort by creation date (default)
- `city` - Sort by city
- `updatedAt` - Sort by last update date

Sort order: `asc` or `desc` (default: `desc`)

## Filtering

Properties can be filtered by:

- `status` - ACTIVE or INACTIVE
- `city` - City name
- `propertyType` - Property type

## Search

Full-text search across:

- Property name
- Address
- City

## Response Format

All responses follow this format:

```json
{
  "success": true|false,
  "message": "Human-readable message",
  "data": {},
  "timestamp": "ISO 8601 timestamp"
}
```

## Rate Limiting

- 100 requests per 15 minutes per user
- Rate limit headers included in response

## Best Practices

1. Always include Authorization header
2. Use pagination for large datasets
3. Handle error responses appropriately
4. Cache property data locally when possible
5. Use search/filter to reduce data transfer
6. Validate input before sending requests
7. Handle soft-deleted properties in your UI (they won't appear in queries)
