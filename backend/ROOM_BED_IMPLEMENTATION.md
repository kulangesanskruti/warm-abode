# Room & Bed Management Implementation Guide

## Architecture Overview

The Room & Bed Management module follows a clean layered architecture:

```
Routes → Controller → Service → Repository → Database
  ↓         ↓           ↓          ↓           ↓
routes/   controllers/ services/ repositories/ Prisma
rooms.ts  roomController roomService roomRepository
```

## Core Components

### 1. Validators (`src/validators/room.ts`)

Zod schemas for request validation:

- `createRoomSchema`: Validates room creation requests
- `updateRoomSchema`: Validates room updates
- `roomQuerySchema`: Validates list filters and pagination
- `updateBedStatusSchema`: Validates bed status changes

### 2. Repositories

#### RoomRepository (`src/repositories/roomRepository.ts`)

Data access layer for rooms:

- `create()`: Create new room
- `findById()`: Get room with beds
- `findByPropertyAndNumber()`: Check for duplicates
- `listRooms()`: List with filters
- `update()`: Update room
- `softDelete()`: Mark as deleted
- `updateOccupiedBeds()`: Track occupancy

#### BedRepository (`src/repositories/bedRepository.ts`)

Data access layer for beds:

- `createBulk()`: Create multiple beds
- `findById()`: Get bed by ID
- `findByRoom()`: Get all beds in room
- `getVacantBeds()`: Get available beds
- `updateStatus()`: Change bed status
- `assignTenant()`: Occupy bed
- `vacate()`: Free bed
- `countByStatus()`: Get status count

### 3. Services

#### RoomService (`src/services/roomService.ts`)

Business logic layer:

```typescript
// Room Operations
createRoom(propertyId, data) → Room with beds
updateRoom(roomId, propertyId, data) → Updated room with bed management
getRoomDetails(roomId, propertyId) → Room + statistics
listRooms(propertyId, options) → Rooms with pagination
deleteRoom(roomId, propertyId) → Soft delete validation

// Bed Operations (prepared for Tenant module)
getAvailableBeds(roomId, propertyId) → Vacant beds
assignBedToTenant(bedId, tenantId, ...) → Assign bed
vacateBed(bedId, roomId, ...) → Free bed
```

### 4. Controllers

#### RoomController (`src/controllers/roomController.ts`)

HTTP handlers:

- `createRoom()`: POST /rooms
- `getRoomDetails()`: GET /rooms/:id
- `listRooms()`: GET /rooms
- `updateRoom()`: PUT /rooms/:id
- `deleteRoom()`: DELETE /rooms/:id
- `getAvailableBeds()`: GET /rooms/:id/available-beds
- `getBedDetails()`: GET /rooms/beds/:bedId
- `updateBedStatus()`: PUT /rooms/beds/:bedId/status

### 5. Routes

#### RoomRoutes (`src/routes/rooms.ts`)

REST endpoint definitions with authentication middleware.

## Business Logic Details

### Automatic Bed Generation

When creating a room with capacity 4:

```typescript
// Input: capacity = 4
// Generated beds: ['A', 'B', 'C', 'D']
const bedLetters = [];
for (let i = 0; i < capacity; i++) {
  bedLetters.push(String.fromCharCode(65 + i)); // A=65, B=66, etc.
}
```

### Capacity Changes

**Increasing Capacity (4 → 6)**:

- Calculate new bed count: 6 - 4 = 2
- Generate new letters: E, F
- Create beds E and F with VACANT status

**Decreasing Capacity (6 → 4)**:

- Check occupied beds in removal range
- If any occupied: throw validation error
- Otherwise: delete beds E and F

### Room Status Calculation

Status is determined by occupancy:

```typescript
occupancyPercentage = (occupied / capacity) * 100;

if (occupancyPercentage === 0) status = AVAILABLE;
else if (occupancyPercentage === 100) status = FULL;
else status = PARTIALLY_OCCUPIED;
```

### Revenue Calculation

Monthly revenue for a room:

```typescript
monthlyRevenue = rentPerBed × occupiedBeds × 30
```

All calculations are done in real-time, no stored values.

## Database Schema (Conceptual)

### Room Table

```sql
id              (Primary Key)
propertyId      (Foreign Key → Property)
roomNumber      (String, unique per property)
floor           (Integer)
capacity        (Integer, 1-20)
occupiedBeds    (Integer, for quick lookup)
rentPerBed      (Decimal)
status          (Enum: AVAILABLE, PARTIALLY_OCCUPIED, FULL, MAINTENANCE)
createdAt       (Timestamp)
updatedAt       (Timestamp)
deletedAt       (Timestamp, for soft delete)

Unique Index: (propertyId, roomNumber)
```

### Bed Table

```sql
id              (Primary Key)
roomId          (Foreign Key → Room)
bedNumber       (String: A, B, C, D, etc.)
status          (Enum: VACANT, OCCUPIED, RESERVED, MAINTENANCE)
currentTenantId (Foreign Key → Tenant, nullable)
createdAt       (Timestamp)
updatedAt       (Timestamp)
```

## Key Features

### 1. Automatic Bed Management

Beds are never manually created. They are:

- Automatically generated when room is created
- Automatically added when capacity increases
- Automatically validated when capacity decreases
- Always lettered A, B, C, D, etc.

### 2. Ownership Verification

Every endpoint verifies the user's property ownership:

```typescript
room = findById(roomId);
if (room.propertyId !== req.propertyId) {
  throw UNAUTHORIZED;
}
```

### 3. Validation Rules

**Room Creation**:

- Property must exist
- Room number unique within property
- Capacity: 1-20 beds
- Rent per bed: positive number

**Room Update**:

- Cannot reduce capacity below occupied beds
- Cannot delete occupied beds
- Duplicate room number check

**Room Deletion**:

- Only if no occupied beds
- Soft delete (record retained)

### 4. Activity Logging

Every operation is logged:

- Room created/updated/deleted
- Capacity changed
- Beds generated/removed
- Bed status changed

## Testing Scenarios

### Scenario 1: Create Room

```bash
POST /api/v1/rooms
{
  "propertyId": "prop_123",
  "roomNumber": "101",
  "floor": 1,
  "capacity": 4,
  "rentPerBed": 5000
}

Expected: Room with 4 VACANT beds A, B, C, D
```

### Scenario 2: Increase Capacity

```bash
PUT /api/v1/rooms/room_123?propertyId=prop_123
{
  "capacity": 6
}

Expected: Beds E and F created as VACANT
```

### Scenario 3: Decrease Capacity (Invalid)

```bash
PUT /api/v1/rooms/room_123?propertyId=prop_123
{
  "capacity": 2
}

Current: 3 occupied beds
Expected: 400 - Cannot reduce below occupied beds
```

### Scenario 4: Delete Room with Occupied Beds

```bash
DELETE /api/v1/rooms/room_123?propertyId=prop_123

Current: 2 occupied beds
Expected: 400 - Cannot delete with occupied beds
```

### Scenario 5: List with Filters

```bash
GET /api/v1/rooms?propertyId=prop_123&status=AVAILABLE&page=1&limit=10

Expected: Rooms with AVAILABLE status, paginated
```

## Integration with Future Modules

### Tenant Module Integration

When implementing the Tenant module:

```typescript
// Assign bed to tenant
await roomService.assignBedToTenant(bedId, tenantId, roomId, propertyId);

// Vacate bed when tenant leaves
await roomService.vacateBed(bedId, roomId, propertyId);
```

### Rent Module Integration

The room data is ready for rent tracking:

```typescript
// Get occupancy for rent calculation
room = getRoomDetails(roomId, propertyId);
monthlyRevenue = room.monthlyRevenue;
occupancyPercentage = room.occupancyPercentage;
```

## Performance Considerations

### Optimization Tips

1. **Pagination**: Always paginate list responses
2. **Lazy Loading**: Beds loaded with room query
3. **Counting**: Use database COUNT for occupancy
4. **Indexing**: Ensure (propertyId, roomNumber) index
5. **Caching**: Cache room details for 5 minutes

### Query Optimization

```sql
-- Efficient queries
SELECT * FROM Room WHERE propertyId = ? AND status = ? ORDER BY roomNumber LIMIT 10
SELECT COUNT(*) FROM Bed WHERE roomId = ? AND status = 'OCCUPIED'
SELECT * FROM Bed WHERE roomId = ? AND status = 'VACANT'
```

## Error Handling

Common error scenarios:

| Scenario              | Error                                   | Code |
| --------------------- | --------------------------------------- | ---- |
| Duplicate room number | "Room number already exists"            | 409  |
| Capacity too high     | "Capacity cannot exceed 20"             | 400  |
| Reduce below occupied | "Cannot reduce below occupied beds"     | 400  |
| Delete with tenants   | "Cannot delete room with occupied beds" | 400  |
| Room not found        | "Room not found"                        | 404  |
| Unauthorized          | "Unauthorized"                          | 401  |

## Future Enhancements

1. **Bulk Operations**: Create multiple rooms at once
2. **Room Templates**: Pre-configured room setups
3. **Bed Transfer**: Move tenant between beds
4. **Room History**: Audit trail of all changes
5. **Analytics**: Room utilization reports
