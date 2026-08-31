import { motion } from "framer-motion";
import {
  X,
  Phone,
  Mail,
  Calendar,
  Wallet,
  AlertCircle,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

interface Bed {
  id: string;
  name: string;
  status: string;
  tenant?: string | null;
  rent: string;
  rentStatus: string;
  phone?: string | null;
  email?: string | null;
  moveIn?: string | null;
  security?: string | null;
  notes: string;
  avatar?: string | null;
}

export default function BedDrawer({ bed, onClose }: { bed: Bed; onClose: () => void }) {
  const getRentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success-50 text-success-700 border-success-200";
      case "due":
        return "bg-warning-50 text-warning-700 border-warning-200";
      case "overdue":
        return "bg-danger-50 text-danger-700 border-danger-200";
      default:
        return "bg-ink-50 text-ink-700 border-ink-200";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-ink-200 bg-white p-6">
          <h2 className="text-xl font-bold text-ink-900">{bed.name}</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-ink-50 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tenant Info */}
          {bed.tenant ? (
            <>
              {/* Tenant Avatar & Name */}
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-3xl">
                  {bed.avatar}
                </div>
                <h3 className="text-lg font-bold text-ink-900">{bed.tenant}</h3>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                {bed.phone && (
                  <a
                    href={`tel:${bed.phone}`}
                    className="flex items-center gap-3 rounded-lg border border-ink-200 p-4 hover:bg-ink-50 transition-all"
                  >
                    <Phone className="h-5 w-5 text-primary-600 flex-shrink-0" />
                    <span className="text-sm text-ink-900">{bed.phone}</span>
                  </a>
                )}
                {bed.email && (
                  <a
                    href={`mailto:${bed.email}`}
                    className="flex items-center gap-3 rounded-lg border border-ink-200 p-4 hover:bg-ink-50 transition-all"
                  >
                    <Mail className="h-5 w-5 text-primary-600 flex-shrink-0" />
                    <span className="text-sm text-ink-900">{bed.email}</span>
                  </a>
                )}
              </div>

              {/* Rental Details */}
              <div className="space-y-3 border-t border-ink-200 pt-6">
                {bed.moveIn && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-ink-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-ink-600">Move-in Date</p>
                      <p className="text-sm font-semibold text-ink-900">
                        {new Date(bed.moveIn).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-ink-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-ink-600">Monthly Rent</p>
                    <p className="text-sm font-semibold text-ink-900">{bed.rent}</p>
                  </div>
                </div>
                {bed.security && (
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-ink-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-ink-600">Security Deposit</p>
                      <p className="text-sm font-semibold text-ink-900">{bed.security}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Status */}
              <div className={`rounded-lg border-2 p-4 ${getRentStatusColor(bed.rentStatus)}`}>
                <p className="text-xs font-medium mb-2">Payment Status</p>
                <p className="text-sm font-bold">
                  {bed.rentStatus === "paid" && "✓ Paid"}
                  {bed.rentStatus === "due" && "⏰ Due Tomorrow"}
                  {bed.rentStatus === "overdue" && "⚠ Overdue by 5 Days"}
                </p>
              </div>

              {/* Notes */}
              {bed.notes && (
                <div className="rounded-lg bg-ink-50 p-4 border border-ink-200">
                  <p className="text-xs font-medium text-ink-600 mb-2">Notes</p>
                  <p className="text-sm text-ink-900">{bed.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 border-t border-ink-200 pt-6">
                <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-700 active:scale-95">
                  <Wallet className="h-4 w-4" />
                  Collect Rent
                </button>
                <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-primary-600 px-4 py-3 text-sm font-semibold text-primary-600 transition-all hover:bg-primary-50 active:scale-95">
                  <MessageCircle className="h-4 w-4" />
                  Send WhatsApp
                </button>
                <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm font-semibold text-ink-700 transition-all hover:bg-ink-50 active:scale-95">
                  <ExternalLink className="h-4 w-4" />
                  View Full Profile
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
                🛏
              </div>
              <h3 className="text-lg font-bold text-ink-900">Bed Vacant</h3>
              <p className="mt-2 text-sm text-ink-600">Monthly rent: {bed.rent}</p>
              <button className="mt-6 w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-700 active:scale-95">
                Assign Tenant
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
