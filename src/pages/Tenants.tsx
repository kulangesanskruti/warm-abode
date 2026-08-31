import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Download, Upload, Users, CheckCircle, AlertCircle } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import TenantCard from "@/components/tenants/TenantCard";
import AddTenantModal from "@/components/tenants/AddTenantModal";
import { useQuery } from "@tanstack/react-query";
import { fetchTenants, paymentStatusOf } from "@/lib/tenants";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Tenants() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["tenants", searchQuery, filter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);

      if (filter === "paid") params.append("paymentStatus", "PAID");
      else if (filter === "rent-due") params.append("paymentStatus", "PENDING");
      else if (filter === "overdue") params.append("paymentStatus", "OVERDUE");

      params.append("limit", "100");

      return fetchTenants(params.toString());
    },
  });

  const tenantsList = data?.tenants ?? [];

  const totalTenants = data?.pagination.total ?? 0;
  const activeTenants = tenantsList.filter((t) => t.status === "ACTIVE").length;
  const rentDue = tenantsList.filter((t) => paymentStatusOf(t) === "due").length;
  const overdueTenants = tenantsList.filter((t) => paymentStatusOf(t) === "overdue").length;

  return (
    <div className="flex h-screen flex-col bg-ink-50">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="px-6 py-8 sm:px-8 lg:px-10">
              {/* Header Section */}
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-ink-900">Tenants</h1>
                  <p className="mt-2 text-ink-600">Manage all tenants across all your properties</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition-all hover:bg-ink-50 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                  <button className="rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition-all hover:bg-ink-50 flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Import
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-700 active:scale-95 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Tenant
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
                  { label: "Total Tenants", value: totalTenants, icon: Users, color: "primary" },
                  {
                    label: "Active Tenants",
                    value: activeTenants,
                    icon: CheckCircle,
                    color: "success",
                  },
                  { label: "Rent Due", value: rentDue, icon: AlertCircle, color: "warning" },
                  {
                    label: "Overdue Payments",
                    value: overdueTenants,
                    icon: AlertCircle,
                    color: "danger",
                  },
                ].map((stat) => {
                  const Icon = stat.icon;
                  const colorMap = {
                    primary: "bg-primary-50 text-primary-600 border-primary-200",
                    success: "bg-success-50 text-success-600 border-success-200",
                    warning: "bg-warning-50 text-warning-600 border-warning-200",
                    danger: "bg-danger-50 text-danger-600 border-danger-200",
                  };
                  return (
                    <motion.div
                      key={stat.label}
                      variants={item}
                      className={`rounded-xl border ${colorMap[stat.color as keyof typeof colorMap]} p-4`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium opacity-75">{stat.label}</p>
                          <p className="mt-1 text-xl font-bold">{stat.value}</p>
                        </div>
                        <Icon className="h-6 w-6 opacity-20" />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Search and Filters */}
              <div className="mb-8 space-y-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-ink-400" />
                  <input
                    type="text"
                    placeholder="Search by name, phone, property, or room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-900 transition-all hover:border-ink-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {["All", "Paid", "Rent Due", "Overdue"].map((f) => (
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
              </div>

              {/* Tenant Grid */}
              {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-xl border border-ink-100 bg-white p-6 shadow-sm"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-ink-200" />
                          <div className="space-y-2">
                            <div className="h-4 w-28 rounded bg-ink-200" />
                            <div className="h-3 w-36 rounded bg-ink-200" />
                            <div className="h-3 w-20 rounded bg-ink-200" />
                          </div>
                        </div>
                        <div className="h-6 w-14 rounded-full bg-ink-200" />
                      </div>
                      <div className="mb-4 space-y-2 border-t border-ink-100 pt-4">
                        <div className="flex justify-between">
                          <div className="h-3 w-20 rounded bg-ink-100" />
                          <div className="h-3 w-16 rounded bg-ink-100" />
                        </div>
                        <div className="flex justify-between">
                          <div className="h-3 w-20 rounded bg-ink-100" />
                          <div className="h-3 w-24 rounded bg-ink-100" />
                        </div>
                        <div className="flex justify-between">
                          <div className="h-3 w-16 rounded bg-ink-100" />
                          <div className="h-3 w-28 rounded bg-ink-100" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-t border-ink-100 pt-4">
                        <div className="h-8 rounded bg-ink-100" />
                        <div className="h-8 rounded bg-ink-100" />
                        <div className="h-8 rounded bg-ink-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-xl border border-danger-200 bg-danger-50 p-6 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-danger-600" />
                  <h3 className="mt-4 text-lg font-semibold text-danger-900">
                    Failed to load tenants
                  </h3>
                  <p className="mt-2 text-sm text-danger-600">
                    {error instanceof Error
                      ? error.message
                      : "An error occurred while fetching tenant data."}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 inline-block rounded-lg bg-danger-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-danger-700 active:scale-95"
                  >
                    Retry Request
                  </button>
                </div>
              ) : tenantsList.length > 0 ? (
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {tenantsList.map((tenant) => (
                    <motion.div key={tenant.id} variants={item}>
                      <TenantCard tenant={tenant} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-ink-200 py-16 text-center">
                  <Users className="mx-auto h-12 w-12 text-ink-300" />
                  <p className="mt-4 text-ink-600">No tenants found</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 inline-block rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-primary-700"
                  >
                    Add Your First Tenant
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Add Tenant Modal */}
      <AddTenantModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
