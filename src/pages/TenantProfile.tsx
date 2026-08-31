import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Phone, MessageCircle, DollarSign, FileText, Pencil, Trash2 } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import TenantOverview from "@/components/tenants/TenantOverview";
import TenantRentHistory from "@/components/tenants/TenantRentHistory";
import TenantDocuments from "@/components/tenants/TenantDocuments";
import TenantNotes from "@/components/tenants/TenantNotes";
import TenantActivity from "@/components/tenants/TenantActivity";
import SendWhatsAppModal from "@/components/tenants/SendWhatsAppModal";
import EditTenantModal from "@/components/tenants/EditTenantModal";
import DeleteTenantDialog from "@/components/tenants/DeleteTenantDialog";
import { fetchTenant, inr, formatDate, tenureLabel, totalPaid, paymentStatusOf } from "@/lib/tenants";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const statusColors = {
  paid: "bg-success-50 text-success-700 border-success-200",
  due: "bg-warning-50 text-warning-700 border-warning-200",
  overdue: "bg-danger-50 text-danger-700 border-danger-200",
  vacating: "bg-ink-50 text-ink-700 border-ink-200",
};

const statusLabels = {
  paid: "✓ Paid",
  due: "⏰ Due",
  overdue: "⚠ Overdue",
  vacating: "Vacating",
};

const tabs = [
  { id: "overview", label: "Overview", icon: "📋" },
  { id: "rent-history", label: "Rent History", icon: "💰" },
  { id: "documents", label: "Documents", icon: "📄" },
  { id: "notes", label: "Notes", icon: "📝" },
  { id: "activity", label: "Activity", icon: "📊" },
] as const;

export default function TenantProfile() {
  const { id } = useParams({ strict: false }) as { id?: string };
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("overview");
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenant", id],
    queryFn: () => fetchTenant(id as string),
    enabled: Boolean(id),
  });

  if (!tenant) {
    return (
      <div className="flex h-screen flex-col bg-ink-50">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <p className="text-ink-600">
                  {isLoading ? "Loading tenant…" : "Tenant not found"}
                </p>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  const paymentStatus = paymentStatusOf(tenant);

  return (
    <div className="flex h-screen flex-col bg-ink-50">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="px-6 py-8 sm:px-8 lg:px-10">
              {/* Back Button */}
              <button
                onClick={() => navigate({ to: "/tenants" })}
                className="mb-6 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Tenants
              </button>

              {/* Profile Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 rounded-2xl bg-white p-8 shadow-sm"
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-6">
                    {tenant.photoUrl ? (
                      <img
                        src={tenant.photoUrl}
                        alt={tenant.fullName}
                        className="h-24 w-24 rounded-2xl object-cover ring-4 ring-primary-100"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary-50 text-2xl font-semibold text-primary-700 ring-4 ring-primary-100">
                        {initials(tenant.fullName)}
                      </div>
                    )}
                    <div>
                      <h1 className="text-3xl font-bold text-ink-900">{tenant.fullName}</h1>
                      <p className="mt-1 text-ink-600">
                        {tenant.property ?? "—"} • Room {tenant.room ?? "—"} • Bed{" "}
                        {tenant.bed ?? "—"}
                      </p>
                      <div className="mt-3 flex gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold border ${statusColors[paymentStatus]}`}
                        >
                          {statusLabels[paymentStatus]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 w-full sm:w-auto">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-ink-900">{inr(tenant.monthlyRent)}</p>
                      <p className="text-xs text-ink-600">Monthly Rent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-ink-900">
                        {inr(tenant.securityDeposit)}
                      </p>
                      <p className="text-xs text-ink-600">Security Deposit</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-ink-900">Since</p>
                      <p className="text-xs text-ink-600">{formatDate(tenant.moveInDate)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-ink-900">Duration</p>
                      <p className="text-xs text-ink-600">{tenureLabel(tenant.moveInDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 border-t border-ink-100 pt-6 flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
                    <DollarSign className="h-4 w-4" />
                    Collect Rent
                  </button>
                  <a
                    href={`tel:${tenant.phone}`}
                    className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                  <button
                    onClick={() => setWhatsappOpen(true)}
                    className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </button>
                  <button className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">
                    <FileText className="h-4 w-4" />
                    PDF
                  </button>
                  <button
                    onClick={() => setEditOpen(true)}
                    className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteOpen(true)}
                    className="flex items-center gap-2 rounded-lg border border-danger-200 bg-white px-4 py-2.5 text-sm font-medium text-danger-600 hover:bg-danger-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </motion.div>

              {/* Tenant Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8 grid gap-4 sm:grid-cols-3"
              >
                <div className="rounded-xl border-2 border-primary-200 bg-primary-50 p-4">
                  <p className="text-sm font-medium text-primary-700">
                    🏠 Staying Since {tenureLabel(tenant.moveInDate)}
                  </p>
                </div>
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-medium text-blue-700">
                    💰 Total Paid {inr(totalPaid(tenant.payments))}
                  </p>
                </div>
                <div className={`rounded-xl border-2 p-4 ${statusColors[paymentStatus]}`}>
                  <p className="text-sm font-medium">
                    {statusLabels[paymentStatus]} — current payment status
                  </p>
                </div>
              </motion.div>

              {/* Tabs */}
              <div className="rounded-xl bg-white shadow-sm overflow-hidden">
                <div className="flex border-b border-ink-100 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-4 py-4 text-sm font-medium transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? "border-b-2 border-primary-600 text-primary-600"
                          : "text-ink-600 hover:text-ink-900"
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 sm:p-8"
                >
                  {activeTab === "overview" && <TenantOverview tenant={tenant} />}
                  {activeTab === "rent-history" && <TenantRentHistory tenant={tenant} />}
                  {activeTab === "documents" && <TenantDocuments tenant={tenant} />}
                  {activeTab === "notes" && <TenantNotes tenant={tenant} />}
                  {activeTab === "activity" && <TenantActivity tenant={tenant} />}
                </motion.div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <SendWhatsAppModal
        open={whatsappOpen}
        onClose={() => setWhatsappOpen(false)}
        tenantId={tenant.id}
        tenantName={tenant.fullName}
        tenantPhone={tenant.phone}
      />
      <EditTenantModal open={editOpen} onClose={() => setEditOpen(false)} tenant={tenant} />
      <DeleteTenantDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        tenantId={tenant.id}
        tenantName={tenant.fullName}
        onDeleted={() => navigate({ to: "/tenants" })}
      />
    </div>
  );
}
