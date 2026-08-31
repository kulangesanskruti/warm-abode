import { useState } from "react";
import { motion } from "framer-motion";
import { AppLink as Link } from "@/components/ui/AppLink";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  ChevronDown,
  AlertCircle,
  BedDouble,
  Users,
  MapPin,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { mapRoom, type RoomsListResponse } from "@/lib/rooms";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import RoomCard from "@/components/rooms/RoomCard";
import RoomAnalytics from "@/components/rooms/RoomAnalytics";
import TodayAlerts from "@/components/rooms/TodayAlerts";
import RoomQuickActions from "@/components/rooms/RoomQuickActions";
import AddRoomModal from "@/components/rooms/AddRoomModal";
import AddTenantModal from "@/components/tenants/AddTenantModal";

type PropertiesResponse = {
  properties: Array<{ id: string; propertyName: string }>;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FILTERS = ["all", "occupied", "vacant", "pending", "maintenance", "shared"] as const;
const FILTER_LABELS = [
  "All Rooms",
  "Occupied",
  "Vacant Beds",
  "Pending Rent",
  "Maintenance",
  "Shared Rooms",
];

export default function Rooms() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [assignTenantOpen, setAssignTenantOpen] = useState(false);

  const propertiesQuery = useQuery({
    queryKey: ["properties", "selector"],
    queryFn: () => apiRequest<PropertiesResponse>("/properties?limit=100"),
  });

  const properties = propertiesQuery.data?.properties ?? [];
  const propertyId = selectedProperty || properties[0]?.id || "";

  const {
    data,
    isLoading: roomsLoading,
    error,
  } = useQuery({
    queryKey: ["rooms", propertyId, searchQuery, filter],
    enabled: Boolean(propertyId),
    queryFn: () => {
      const params = new URLSearchParams({ propertyId, limit: "100" });
      if (searchQuery) params.append("search", searchQuery);
      if (filter === "maintenance") params.append("status", "MAINTENANCE");
      else if (filter === "occupied") params.append("status", "FULL");
      params.append("sortBy", "roomNumber");
      params.append("sortOrder", "asc");
      return apiRequest<RoomsListResponse>(`/rooms?${params.toString()}`);
    },
  });

  const isLoading = propertiesQuery.isLoading || (Boolean(propertyId) && roomsLoading);
  const loadError = propertiesQuery.error ?? error;

  const rooms = (data?.rooms ?? []).map(mapRoom);

  // Search/status handled by the API; bed-level filters are derived client-side.
  const filteredRooms = rooms.filter((room) => {
    if (filter === "vacant") return room.vacant > 0;
    if (filter === "pending") return parseInt(room.pendingRent.replace(/[^0-9]/g, "")) > 0;
    if (filter === "shared") return room.capacity > 1;
    return true;
  });

  return (
    <div className="flex h-screen bg-ink-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8 sm:px-8 lg:px-10">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex items-start justify-between"
            >
              <div>
                <h1 className="text-3xl font-bold text-ink-900">Room & Bed Management</h1>
                <p className="mt-2 text-ink-600">Manage rooms, beds and tenants visually</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setAddRoomOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  Add Room
                </button>
                <button
                  onClick={() => setAssignTenantOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700 active:scale-95"
                >
                  <Users className="h-4 w-4" />
                  Assign Tenant
                </button>
              </div>
            </motion.div>

            {/* Property Selector */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2.5">
                <MapPin className="h-4 w-4 text-ink-600" />
                <select
                  value={propertyId}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  disabled={properties.length === 0}
                  className="appearance-none bg-transparent text-sm font-medium text-ink-900 focus:outline-none"
                >
                  {properties.length === 0 && <option value="">No properties</option>}
                  {properties.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.propertyName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-ink-600 pointer-events-none" />
              </div>
            </motion.div>

            <RoomAnalytics rooms={filteredRooms} />

            <TodayAlerts rooms={filteredRooms} />

            {/* Search & Filters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 space-y-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-ink-400" />
                  <input
                    type="text"
                    placeholder="Search Rooms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-all placeholder:text-ink-500 hover:border-ink-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {FILTER_LABELS.map((f, i) => (
                    <button
                      key={f}
                      onClick={() => setFilter(FILTERS[i] ?? "all")}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        filter === FILTERS[i]
                          ? "bg-primary-600 text-white"
                          : "border border-ink-200 bg-white text-ink-700 hover:border-ink-300"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-ink-700 transition-all hover:bg-ink-50"
                >
                  {viewMode === "grid" ? (
                    <List className="h-4 w-4" />
                  ) : (
                    <Grid3X3 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Rooms */}
            {isLoading ? (
              <div
                className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse space-y-4 rounded-xl border border-ink-100 bg-white p-6"
                  >
                    <div className="h-6 w-28 rounded bg-ink-200" />
                    <div className="h-3 w-20 rounded bg-ink-100" />
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="h-14 rounded bg-ink-100" />
                      <div className="h-14 rounded bg-ink-100" />
                    </div>
                    <div className="h-10 rounded bg-ink-100" />
                  </div>
                ))}
              </div>
            ) : loadError ? (
              <div className="rounded-xl border border-danger-200 bg-danger-50 p-6 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-danger-600" />
                <h3 className="mt-4 text-lg font-semibold text-danger-900">Failed to load rooms</h3>
                <p className="mt-2 text-sm text-danger-600">
                  {loadError instanceof Error
                    ? loadError.message
                    : "An error occurred while fetching room data."}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 inline-block rounded-lg bg-danger-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-danger-700 active:scale-95"
                >
                  Retry Request
                </button>
              </div>
            ) : filteredRooms.length > 0 ? (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
              >
                {filteredRooms.map((room) => (
                  <motion.div key={room.id} variants={item}>
                    <Link to={`/rooms/${room.id}`}>
                      <RoomCard room={room} />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border-2 border-dashed border-ink-200 p-12 text-center"
              >
                <BedDouble className="mx-auto h-12 w-12 text-ink-400 mb-4" />
                <h3 className="text-lg font-semibold text-ink-900">No rooms found</h3>
                <p className="mt-2 text-ink-600">Try adjusting your search or filters</p>
              </motion.div>
            )}

            <RoomQuickActions />
          </div>
        </main>
      </div>

      <AddRoomModal
        open={addRoomOpen}
        onClose={() => setAddRoomOpen(false)}
        propertyId={propertyId}
      />
      <AddTenantModal open={assignTenantOpen} onClose={() => setAssignTenantOpen(false)} />
    </div>
  );
}
