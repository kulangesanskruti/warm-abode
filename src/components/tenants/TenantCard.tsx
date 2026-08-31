import { useState } from "react";
import { motion } from "framer-motion";
import SendWhatsAppModal from "./SendWhatsAppModal";
import EditTenantModal from "./EditTenantModal";
import DeleteTenantDialog from "./DeleteTenantDialog";
import { AppLink as Link } from "@/components/ui/AppLink";
import { MessageCircle, Phone, Pencil, Trash2, ChevronRight } from "lucide-react";
import { inr, formatDate, paymentStatusOf, type ApiTenantListItem } from "@/lib/tenants";

interface TenantCardProps {
  tenant: ApiTenantListItem;
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

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function TenantCard({ tenant }: TenantCardProps) {
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const paymentStatus = paymentStatusOf(tenant);

  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group rounded-xl border border-ink-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg"
    >
      {/* Header with Photo and Status */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-4">
          {tenant.photoUrl ? (
            <img
              src={tenant.photoUrl}
              alt={tenant.fullName}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-primary-100"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-lg font-semibold text-primary-700 ring-2 ring-primary-100">
              {initials(tenant.fullName)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-ink-900">{tenant.fullName}</h3>
            <p className="text-sm text-ink-600">{tenant.property ?? "—"}</p>
            <p className="text-xs text-ink-500">
              Room {tenant.room ?? "—"} • Bed {tenant.bed ?? "—"}
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold border ${statusColors[paymentStatus]}`}
        >
          {statusLabels[paymentStatus]}
        </span>
      </div>

      {/* Details */}
      <div className="mb-4 space-y-2 border-t border-ink-100 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-ink-600">Monthly Rent</span>
          <span className="font-semibold text-ink-900">{inr(tenant.monthlyRent)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink-600">Move-in Date</span>
          <span className="text-ink-900">{formatDate(tenant.moveInDate)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink-600">Contact</span>
          <span className="font-mono text-ink-900">{tenant.phone}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-2 border-t border-ink-100 pt-4">
        <a
          href={`tel:${tenant.phone}`}
          className="rounded-lg border border-ink-200 py-2 text-xs font-medium text-ink-700 transition-all hover:bg-ink-50 flex items-center justify-center gap-1"
        >
          <Phone className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Call</span>
        </a>
        <button
          onClick={() => setWhatsappOpen(true)}
          className="rounded-lg border border-ink-200 py-2 text-xs font-medium text-ink-700 transition-all hover:bg-ink-50 flex items-center justify-center gap-1"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Chat</span>
        </button>
        <button
          onClick={() => setEditOpen(true)}
          className="rounded-lg border border-ink-200 py-2 text-xs font-medium text-ink-700 transition-all hover:bg-ink-50 flex items-center justify-center gap-1"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Edit</span>
        </button>
        <button
          onClick={() => setDeleteOpen(true)}
          className="rounded-lg border border-danger-200 py-2 text-xs font-medium text-danger-600 transition-all hover:bg-danger-50 flex items-center justify-center gap-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>

      {/* View Profile Link */}
      <Link
        to={`/tenants/${tenant.id}`}
        className="mt-4 block rounded-lg bg-primary-50 px-4 py-2.5 text-center text-sm font-medium text-primary-700 transition-all hover:bg-primary-100 active:scale-95 flex items-center justify-center gap-2 group"
      >
        View Profile
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>

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
      />
    </motion.div>
  );
}
