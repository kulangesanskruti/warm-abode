# Room & Bed Management API Documentation

## Overview

The Room & Bed Management API is the signature feature of StayHub. It provides complete management of shared rooms with automatic bed allocation and dynamic occupancy tracking.

## Key Features

- **Automatic Bed Generation**: Beds are automatically created when a room is created
- **Dynamic Capacity**: Increase/decrease room capacity with automatic bed management
- **Occupancy Tracking**: Real-time occupancy statistics and analytics
- **Soft Delete**: Properties can be marked as deleted without data loss
- **Validation**: Comprehensive business rule validation

## Room Status

- `AVAILABLE`: Room has vacant beds
- `PARTIALLY_OCCUPIED`: Some beds occupied, some vacant
- `FULL`: All beds are occupied
- `MAINTENANCE`: Room is under maintenance

## Bed Status

- `VACANT`: Bed is available for assignment
- `OCCUPIED`: Bed is occupied by a tenant
- `RESERVED`: Bed is reserved for upcoming tenant
- `MAINTENANCE`: Bed is under maintenance

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Room Endpoints

### 1. Create Room

Creates a new room with automatic bed generation.

**Request**

```
POST /rooms
Content-Type: application/json
Authorization: Bearer <token>

{
  "propertyId": "prop_123",
  "roomNumber": "101",
  "floor": 1,
  "capacity": 4,
  "rentPerBed": 5000,
  "roomType": "Shared",
  "description": "Well-ventilated room with attached bathroom"
}
```

**Parameters**

| Parameter   | Type   | Required | Description                         |
| ----------- | ------ | -------- | ----------------------------------- |
| propertyId  | string | Yes      | ID of the property                  |
| roomNumber  | string | Yes      | Unique room number within property  |
| floor       | number | Yes      | Floor number (0-based)              |
| capacity    | number | Yes      | Number of beds (1-20)               |
| rentPerBed  | number | Yes      | Monthly rent per bed                |
| roomType    | string | Yes      | Type of room (Shared, Single, etc.) |
| description | string | No       | Room description                    |

**Response**

```json
{
  "success": true,
  "message": "Room created successfully",
  "data": {
    "id": "room_123",
    "propertyId": "prop_123",
    "roomNumber": "101",
    "floor": 1,
    "capacity": 4,
    "occupiedBeds": 0,
    "rentPerBed": 5000,
    "status": "AVAILABLE",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Automatic Bed Creation**

When creating a room with capacity 4, beds are automatically created as:

- Bed A (VACANT)
- Bed B (VACANT)
- Bed C (VACANT)
- Bed D (VACANT)

**Error Responses**

- `400`: Duplicate room number in property
- `400`: Invalid capacity
- `404`: Property not found

---

### 2. Get Room Details

Retrieve detailed information about a room including bed list and statistics.

**Request**

```
GET /rooms/:id?propertyId=prop_123
Authorization: Bearer <token>
```

**Parameters**

| Parameter  | Type   | Location | Description |
| ---------- | ------ | -------- | ----------- |
| id         | string | URL      | Room ID     |
| propertyId | string | Query    | Property ID |

**Response**

```json
{
  "success": true,
  "message": "Room details retrieved",
  "data": {
    "id": "room_123",
    "propertyId": "prop_123",
    "roomNumber": "101",
    "floor": 1,
    "capacity": 4,
    "occupiedBeds": 2,
    "vacantBeds": 2,
    "occupancyPercentage": "50.00",
    "monthlyRevenue": 300000,
    "rentPerBed": 5000,
    "status": "PARTIALLY_OCCUPIED",
    "beds": [
      {
        "id": "bed_1",
        "bedNumber": "A",
        "status": "OCCUPIED",
        "currentTenantId": "tenant_1"
      },
      {
        "id": "bed_2",
        "bedNumber": "B",
        "status": "VACANT",
        "currentTenantId": null
      },
      {
        "id": "bed_3",
        "bedNumber": "C",
        "status": "OCCUPIED",
        "currentTenantId": "tenant_2"
      },
      {
        "id": "bed_4",
        "bedNumber": "D",
        "status": "VACANT",
        "currentTenantId": null
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 3. List Rooms

List all rooms with filtering, pagination, and sorting.

**Request**

```
GET /rooms?propertyId=prop_123&page=1&limit=10&sortBy=roomNumber&sortOrder=asc
Authorization: Bearer <token>
```

**Query Parameters**

| Parameter  | Type   | Default    | Description                                       |
| ---------- | ------ | ---------- | ------------------------------------------------- |
| propertyId | string | Required   | Filter by property                                |
| page       | number | 1          | Page number                                       |
| limit      | number | 10         | Records per page (max 100)                        |
| search     | string | -          | Search by room number                             |
| floor      | number | -          | Filter by floor                                   |
| status     | string | -          | Filter by status                                  |
| sortBy     | string | roomNumber | Sort field: roomNumber, floor, occupancy, revenue |
| sortOrder  | string | asc        | Sort order: asc or desc                           |

**Response**

```json
{
  "success": true,
  "message": "Rooms retrieved",
  "data": {
    "rooms": [
      {
        "id": "room_123",
        "roomNumber": "101",
        "floor": 1,
        "capacity": 4,
        "occupiedBeds": 2,
        "vacantBeds": 2,
        "occupancyPercentage": "50.00",
        "status": "PARTIALLY_OCCUPIED"
      },
      {
        "id": "room_124",
        "roomNumber": "102",
        "floor": 1,
        "capacity": 2,
        "occupiedBeds": 2,
        "vacantBeds": 0,
        "occupancyPercentage": "100.00",
        "status": "FULL"
      }
    ],
    "total": 25,
    "pages": 3
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 4. Update Room

Update room information with support for capacity changes.

**Request**

```
PUT /rooms/:id?propertyId=prop_123
Content-Type: application/json
Authorization: Bearer <token>

{
  "capacity": 6,
  "rentPerBed": 4500,
  "status": "MAINTENANCE"
}
```

**Parameters**

| Parameter   | Type   | Description                                     |
| ----------- | ------ | ----------------------------------------------- |
| roomNumber  | string | Update room number                              |
| floor       | number | Update floor                                    |
| capacity    | number | Update capacity (with automatic bed adjustment) |
| rentPerBed  | number | Update rent per bed                             |
| status      | string | Update status                                   |
| description | string | Update description                              |

**Capacity Change Logic**

- **Increase**: New beds are automatically created (e.g., 4→6 creates beds E and F)
- **Decrease**: Validates no occupied beds in removed slots (e.g., 4→2 fails if 3+ beds occupied)

**Response**

```json
{
  "success": true,
  "message": "Room updated successfully",
  "data": {
    "id": "room_123",
    "capacity": 6,
    "occupiedBeds": 2,
    "rentPerBed": 4500,
    "status": "MAINTENANCE"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Responses**

- `400`: Cannot reduce capacity below occupied beds count
- `400`: Cannot delete occupied beds

---

### 5. Delete Room

Soft delete a room (only if no occupied beds exist).

**Request**

```
DELETE /rooms/:id?propertyId=prop_123
Authorization: Bearer <token>
```

**Response**

```json
{
  "success": true,
  "message": "Room deleted successfully",
  "data": null,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Responses**

- `400`: Cannot delete room with occupied beds
- `404`: Room not found

---

### 6. Get Available Beds

Get list of vacant beds in a room.

**Request**

```
GET /rooms/:id/available-beds?propertyId=prop_123
Authorization: Bearer <token>
```

**Response**

```json
{
  "success": true,
  "message": "Available beds retrieved",
  "data": [
    {
      "id": "bed_2",
      "bedNumber": "B",
      "status": "VACANT",
      "currentTenantId": null
    },
    {
      "id": "bed_4",
      "bedNumber": "D",
      "status": "VACANT",
      "currentTenantId": null
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Bed Endpoints

### 1. Get Bed Details

Retrieve information about a specific bed.

**Request**

```
GET /rooms/beds/:bedId
Authorization: Bearer <token>
```

**Response**

```json
{
  "success": true,
  "message": "Bed details retrieved",
  "data": {
    "id": "bed_123",
    "roomId": "room_123",
    "bedNumber": "A",
    "status": "OCCUPIED",
    "currentTenantId": "tenant_123",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 2. Update Bed Status

Update the status of a bed.

**Request**

```
PUT /rooms/beds/:bedId/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "MAINTENANCE"
}
```

**Parameters**

| Parameter | Type   | Values                                  |
| --------- | ------ | --------------------------------------- |
| status    | string | VACANT, OCCUPIED, RESERVED, MAINTENANCE |

**Response**

```json
{
  "success": true,
  "message": "Bed status updated",
  "data": {
    "id": "bed_123",
    "status": "MAINTENANCE"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## cURL Examples

### Create Room

```bash
curl -X POST http://localhost:5000/api/v1/rooms \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop_123",
    "roomNumber": "101",
    "floor": 1,
    "capacity": 4,
    "rentPerBed": 5000,
    "roomType": "Shared",
    "description": "4-bed shared room"
  }'
```

### Get Room Details

```bash
curl -X GET "http://localhost:5000/api/v1/rooms/room_123?propertyId=prop_123" \
  -H "Authorization: Bearer your_token"
```

### List Rooms

```bash
curl -X GET "http://localhost:5000/api/v1/rooms?propertyId=prop_123&page=1&limit=10" \
  -H "Authorization: Bearer your_token"
```

### Update Room (Increase Capacity)

```bash
curl -X PUT "http://localhost:5000/api/v1/rooms/room_123?propertyId=prop_123" \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "capacity": 6
  }'
```

### Delete Room

```bash
curl -X DELETE "http://localhost:5000/api/v1/rooms/room_123?propertyId=prop_123" \
  -H "Authorization: Bearer your_token"
```

### Update Bed Status

```bash
curl -X PUT "http://localhost:5000/api/v1/rooms/beds/bed_123/status" \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "MAINTENANCE"
  }'
```

---

## Validation Rules

### Room Creation

- Room number must be unique within property
- Capacity must be 1-20
- Rent per bed must be positive

### Room Update

- Cannot reduce capacity below occupied beds count
- Cannot delete occupied beds
- All other validations same as creation

### Room Deletion

- Can only delete if no occupied beds exist
- Soft delete (record retained, marked as deleted)

---

## Analytics Calculated in Real-time

These values are computed on every request:

- **Occupied Beds**: Count of beds with status OCCUPIED
- **Vacant Beds**: Count of beds with status VACANT
- **Occupancy Percentage**: (Occupied / Capacity) * 100
- **Monthly Revenue**: Rent Per Bed × Occupied Beds × 30 days

---

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (e.g., duplicate room number)
- `500`: Server Error

---

## Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": "Error detail"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```
