import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { AppLink as Link } from "@/components/ui/AppLink";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Users,
  Wallet,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import PropertyOverview from "@/components/properties/PropertyOverview";
import PropertyRooms from "@/components/properties/PropertyRooms";
import PropertyTenants from "@/components/properties/PropertyTenants";
import PropertyRent from "@/components/properties/PropertyRent";
import PropertyReports from "@/components/properties/PropertyReports";
import PropertySettings from "@/components/properties/PropertySettings";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

type ApiPropertyDetails = {
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
  occupancyPercentage?: number;
  monthlyRevenue?: number;
  pendingRent?: number;
  pendingTenantCount?: number;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=400&fit=crop";

function formatCurrency(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatEstablished(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "rooms", label: "Rooms" },
  { id: "tenants", label: "Tenants" },
  { id: "rent", label: "Rent" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" },
];

export default function PropertyDetails() {
  const { id } = useParams({ strict: false }) as { id?: string };
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const {
    data: apiProperty,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["property", id],
    queryFn: () => apiRequest<ApiPropertyDetails>(`/properties/${id}`),
    enabled: !!id,
  });

  const beds = apiProperty?.totalBeds ?? 0;
  const occupied = apiProperty?.occupiedBeds ?? 0;
  const vacant = apiProperty?.vacantBeds ?? Math.max(beds - occupied, 0);
  const occupancy =
    apiProperty?.occupancyPercentage ?? (beds > 0 ? Math.round((occupied / beds) * 100) : 0);

  const propertyDetails = {
    id: apiProperty?.id ?? id ?? "",
    name: apiProperty?.propertyName ?? "—",
    location: [apiProperty?.city, apiProperty?.address].filter(Boolean).join(", ") || "—",
    beds,
    occupied,
    vacant,
    occupancy,
    monthlyIncome: formatCurrency(apiProperty?.monthlyRevenue ?? 0),
    pendingRent: formatCurrency(apiProperty?.pendingRent ?? 0),
    pendingTenantCount: apiProperty?.pendingTenantCount ?? 0,
    image: apiProperty?.imageUrl || FALLBACK_IMAGE,
    description: apiProperty?.description ?? "",
    contact: "—",
    email: "—",
    established: apiProperty?.createdAt ? formatEstablished(apiProperty.createdAt) : "—",
  };

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col bg-ink-50">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main className="flex-1 overflow-y-auto">
              <div className="px-6 py-8 sm:px-8 lg:px-10">
                <div className="animate-pulse space-y-6">
                  <div className="h-64 w-full rounded-xl bg-ink-200" />
                  <div className="h-10 w-1/3 rounded bg-ink-200" />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col bg-ink-50">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main className="flex-1 overflow-y-auto">
              <div className="px-6 py-8 sm:px-8 lg:px-10">
                <div className="rounded-xl border border-danger-200 bg-danger-50 p-6 text-center">
                  <h3 className="text-lg font-semibold text-danger-900">
                    Failed to load property
                  </h3>
                  <p className="mt-2 text-sm text-danger-600">
                    {error instanceof Error ? error.message : "An error occurred."}
                  </p>
                  <Link
                    to="/properties"
                    className="mt-4 inline-block rounded-lg bg-danger-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-danger-700"
                  >
                    Back to Properties
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <PropertyOverview property={propertyDetails} />;
      case "rooms":
        return <PropertyRooms propertyId={id ?? ""} />;
      case "tenants":
        return <PropertyTenants propertyId={id ?? ""} />;
      case "rent":
        return <PropertyRent propertyId={id ?? ""} />;
      case "reports":
        return <PropertyReports propertyId={id ?? ""} />;
      case "settings":
        return <PropertySettings propertyId={id ?? ""} />;
      default:
        return <PropertyOverview property={propertyDetails} />;
    }
  };

  return (
    <div className="flex h-screen flex-col bg-ink-50">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 overflow-y-auto">
            <div className="px-6 py-8 sm:px-8 lg:px-10">
              {/* Back Button */}
              <Link
                to="/properties"
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Properties
              </Link>

              {/* Property Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 rounded-xl border border-ink-200 bg-white overflow-hidden shadow-sm"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden bg-ink-100">
                  <img
                    src={propertyDetails.image}
                    alt={propertyDetails.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                {/* Info */}
                <div className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-ink-900">{propertyDetails.name}</h1>
                      <div className="mt-3 flex items-center gap-2 text-ink-600">
                        <MapPin className="h-5 w-5" />
                        <span>{propertyDetails.location}</span>
                      </div>
                      <p className="mt-2 text-sm text-ink-600">{propertyDetails.description}</p>
                    </div>

                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs font-medium text-ink-500 uppercase">Contact</p>
                        <div className="mt-2 space-y-2 text-sm text-ink-900">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary-600" />
                            <span>{propertyDetails.contact}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary-600" />
                            <span>{propertyDetails.email}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-ink-500 uppercase">Established</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-ink-900">
                          <Calendar className="h-4 w-4 text-primary-600" />
                          <span>{propertyDetails.established}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-lg bg-primary-50 border border-primary-200 p-3">
                      <p className="text-xs font-medium text-primary-600">Total Beds</p>
                      <p className="mt-1 text-2xl font-bold text-primary-700">
                        {propertyDetails.beds}
                      </p>
                    </div>
                    <div className="rounded-lg bg-success-50 border border-success-200 p-3">
                      <p className="text-xs font-medium text-success-600">Occupied</p>
                      <p className="mt-1 text-2xl font-bold text-success-700">
                        {propertyDetails.occupied}
                      </p>
                    </div>
                    <div className="rounded-lg bg-warning-50 border border-warning-200 p-3">
                      <p className="text-xs font-medium text-warning-600">Vacant</p>
                      <p className="mt-1 text-2xl font-bold text-warning-700">
                        {propertyDetails.vacant}
                      </p>
                    </div>
                    <div className="rounded-lg bg-info-50 border border-info-200 p-3">
                      <p className="text-xs font-medium text-info-600">Occupancy</p>
                      <p className="mt-1 text-2xl font-bold text-info-700">
                        {propertyDetails.occupancy}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-primary-50 border border-primary-200 p-3">
                      <p className="text-xs font-medium text-primary-600">Monthly Income</p>
                      <p className="mt-1 text-xl font-bold text-primary-700">
                        {propertyDetails.monthlyIncome}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8 border-b border-ink-200 bg-white rounded-t-xl"
              >
                <div className="flex overflow-x-auto px-6 sm:px-8 lg:px-10">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? "text-primary-600"
                          : "text-ink-600 hover:text-ink-900"
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Tab Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderTabContent()}
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
