/**
 * Shared types + mappers for the Room & Bed API (`/api/v1/rooms`).
 * Keeps the UI-facing shape (used by RoomCard / RoomMap / BedDrawer) in one place.
 */

export type ApiBed = {
  id: string;
  bedNumber: string;
  status: "VACANT" | "OCCUPIED" | "RESERVED" | "MAINTENANCE" | string;
  currentTenantId: string | null;
};

export type ApiRoom = {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  rentPerBed: number;
  status: "AVAILABLE" | "PARTIALLY_OCCUPIED" | "FULL" | "MAINTENANCE" | string;
  occupiedBeds?: number;
  vacantBeds?: number;
  occupancyPercentage?: string;
  monthlyRevenue?: number;
  updatedAt?: string;
  beds?: ApiBed[];
};

export type RoomsListResponse = {
  rooms: ApiRoom[];
  total: number;
  pages: number;
};

export function formatCurrency(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function formatRelative(iso?: string): string {
  if (!iso) return "—";
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (Number.isNaN(minutes)) return "—";
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function bedStatus(status: string): "occupied" | "vacant" | "maintenance" {
  if (status === "OCCUPIED" || status === "RESERVED") return "occupied";
  if (status === "MAINTENANCE") return "maintenance";
  return "vacant";
}

export function mapBed(bed: ApiBed, rentPerBed: number) {
  const status = bedStatus(bed.status);
  return {
    id: bed.bedNumber,
    name: `Bed ${bed.bedNumber}`,
    status,
    tenant: bed.currentTenantId,
    rent: formatCurrency(rentPerBed),
    rentStatus: status === "occupied" ? "paid" : status,
    avatar: status === "occupied" ? "👤" : null,
    phone: null,
    email: null,
    moveIn: null,
    security: null,
    notes: "",
  };
}

export function mapRoom(room: ApiRoom) {
  const beds = room.beds ?? [];
  const occupied = room.occupiedBeds ?? beds.filter((b) => b.status === "OCCUPIED").length;
  const vacant = room.vacantBeds ?? Math.max(room.capacity - occupied, 0);
  const occupancy = room.occupancyPercentage
    ? Math.round(parseFloat(room.occupancyPercentage))
    : room.capacity > 0
      ? Math.round((occupied / room.capacity) * 100)
      : 0;

  const uiStatus =
    room.status === "MAINTENANCE"
      ? "maintenance"
      : room.status === "FULL"
        ? "fully-occupied"
        : occupied > 0
          ? "occupied"
          : "available";

  return {
    id: room.id,
    number: room.roomNumber,
    floor: String(room.floor),
    capacity: room.capacity,
    occupied,
    vacant,
    occupancy,
    rentPerBed: room.rentPerBed,
    monthlyIncome: formatCurrency(room.rentPerBed * occupied),
    pendingRent: formatCurrency(0),
    lastUpdated: formatRelative(room.updatedAt),
    status: uiStatus,
    beds: beds.map((b) => mapBed(b, room.rentPerBed)),
  };
}
