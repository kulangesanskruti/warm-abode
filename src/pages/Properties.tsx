import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Grid3X3,
  List,
  Home,
  BedDouble,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import PropertyCard from "@/components/properties/PropertyCard";
import AddPropertyModal from "@/components/properties/AddPropertyModal";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

type ApiProperty = {
  id: string;
  propertyName: string;
  propertyType: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  totalFloors: number | null;
  description: string | null;
  imageUrl: string | null;
  status: "ACTIVE" | "INACTIVE" | string;
  createdAt: string;
  updatedAt: string;
  totalBeds?: number;
  occupiedBeds?: number;
  vacantBeds?: number;
  occupancyRate?: number;
  monthlyIncome?: number;
  pendingRent?: number;
};

type PropertiesResponse = {
  properties: ApiProperty[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop";

function formatCurrency(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (Number.isNaN(minutes)) return "—";
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function Properties() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data, isLoading, error } = useQuery({
    queryKey: ["properties", searchQuery, filter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filter === "active") params.append("status", "ACTIVE");
      params.append("sort", "createdAt");
      params.append("order", "desc");
      params.append("limit", "100");

      return apiRequest<PropertiesResponse>(`/properties?${params.toString()}`);
    },
  });

  const properties = (data?.properties ?? []).map((p) => {
    const beds = p.totalBeds ?? 0;
    const occupied = p.occupiedBeds ?? 0;
    const vacant = p.vacantBeds ?? Math.max(beds - occupied, 0);
    const occupancy = p.occupancyRate ?? (beds > 0 ? Math.round((occupied / beds) * 100) : 0);

    return {
      id: p.id,
      name: p.propertyName,
      location: [p.city, p.address].filter(Boolean).join(", ") || "—",
      beds,
      occupied,
      vacant,
      occupancy,
      monthlyIncome: formatCurrency(p.monthlyIncome ?? 0),
      pendingRent: formatCurrency(p.pendingRent ?? 0),
      lastUpdated: formatRelative(p.updatedAt),
      image: p.imageUrl || FALLBACK_IMAGE,
      status: p.status === "ACTIVE" ? "active" : "inactive",
    };
  });

  // Search and status are handled by the API; bed-level filters are derived client-side.
  const filteredProperties = properties.filter((prop) => {
    if (filter === "vacant-beds") return prop.vacant > 0;
    if (filter === "fully-occupied") return prop.beds > 0 && prop.occupancy === 100;
    return true;
  });

  const totalProperties = data?.pagination.total ?? 0;
  const totalBeds = properties.reduce((sum, p) => sum + p.beds, 0);
  const totalOccupied = properties.reduce((sum, p) => sum + p.occupied, 0);
  const avgOccupancy = totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="flex h-screen flex-col bg-ink-50">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 overflow-y-auto">
            <div className="px-6 py-8 sm:px-8 lg:px-10">
              {/* Header */}
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-ink-900">Properties</h1>
                  <p className="mt-2 text-ink-600">
                    Manage all your PGs and rental properties from one place
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition-all hover:bg-ink-50">
                    📥 Import Properties
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                {[
                  {
                    label: "Total Properties",
                    value: totalProperties,
                    icon: Home,
                    color: "primary",
                  },
                  { label: "Total Beds", value: totalBeds, icon: BedDouble, color: "success" },
                  { label: "Total Occupied", value: totalOccupied, icon: Users, color: "warning" },
                  {
                    label: "Average Occupancy",
                    value: `${avgOccupancy}%`,
                    icon: TrendingUp,
                    color: "info",
                  },
                ].map((stat) => {
                  const Icon = stat.icon;
                  const colorMap = {
                    primary: "bg-primary-50 text-primary-600 border-primary-200",
                    success: "bg-success-50 text-success-600 border-success-200",
                    warning: "bg-warning-50 text-warning-600 border-warning-200",
                    info: "bg-blue-50 text-blue-600 border-blue-200",
                  };
                  return (
                    <motion.div
                      key={stat.label}
                      variants={item}
                      className={`rounded-xl border ${colorMap[stat.color as keyof typeof colorMap]} p-6`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium opacity-75">{stat.label}</p>
                          <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                        </div>
                        <Icon className="h-8 w-8 opacity-20" />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Search and Filters */}
              <div className="mb-8 grid gap-4 lg:grid-cols-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-5 w-5 text-ink-400" />
                    <input
                      type="text"
                      placeholder="Search by name or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-900 placeholder-ink-500 transition-all hover:border-ink-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {["All", "Active", "Vacant Beds", "Fully Occupied"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f.toLowerCase().replace(" ", "-"))}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        (f === "All" && filter === "all") ||
                        filter === f.toLowerCase().replace(" ", "-")
                          ? "bg-primary-600 text-white"
                          : "border border-ink-200 bg-white text-ink-700 hover:border-ink-300"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
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

                <button
                  onClick={() => setShowAddModal(true)}
                  className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700 active:scale-95 flex items-center justify-center gap-2 lg:justify-start"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Property</span>
                </button>
              </div>

              {/* Results count */}
              {!isLoading && !error && (
                <p className="mb-6 text-sm font-medium text-ink-600">
                  {filteredProperties.length}{" "}
                  {filteredProperties.length === 1 ? "property" : "properties"}
                </p>
              )}

              {/* Property Cards Grid */}
              {isLoading ? (
                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm"
                    >
                      <div className="h-40 w-full bg-ink-200" />
                      <div className="space-y-3 p-6">
                        <div className="h-4 w-40 rounded bg-ink-200" />
                        <div className="h-3 w-52 rounded bg-ink-100" />
                        <div className="grid grid-cols-3 gap-2 pt-4">
                          <div className="h-8 rounded bg-ink-100" />
                          <div className="h-8 rounded bg-ink-100" />
                          <div className="h-8 rounded bg-ink-100" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-xl border border-danger-200 bg-danger-50 p-6 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-danger-600" />
                  <h3 className="mt-4 text-lg font-semibold text-danger-900">
                    Failed to load properties
                  </h3>
                  <p className="mt-2 text-sm text-danger-600">
                    {error instanceof Error
                      ? error.message
                      : "An error occurred while fetching property data."}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 inline-block rounded-lg bg-danger-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-danger-700 active:scale-95"
                  >
                    Retry Request
                  </button>
                </div>
              ) : filteredProperties.length > 0 ? (
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3"
                >
                  {filteredProperties.map((property) => (
                    <motion.div key={property.id} variants={item}>
                      <PropertyCard property={property} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 py-12">
                  <p className="text-ink-600">No properties found matching your criteria</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 inline-block rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-primary-700"
                  >
                    Add Your First Property
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Add Property Modal */}
      <AddPropertyModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
