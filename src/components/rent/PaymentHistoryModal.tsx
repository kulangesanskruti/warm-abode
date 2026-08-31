import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertTriangle, ReceiptText } from "lucide-react";
import Modal from "./Modal";
import { inr, type PaymentRecord } from "./rentData";
import { fetchTenantPaymentHistoryRaw, num, type ApiPaymentStatus } from "@/lib/payments";

interface Props {
  open: boolean;
  payment: PaymentRecord | null;
  onClose: () => void;
}

const meta: Record<ApiPaymentStatus, { label: string; dot: string; chip: string; Icon: typeof CheckCircle2 }> = {
  PAID: { label: "Paid", dot: "bg-success-500", chip: "bg-success-50 text-success-700", Icon: CheckCircle2 },
  PARTIAL: { label: "Partial", dot: "bg-primary-500", chip: "bg-primary-50 text-primary-700", Icon: Clock },
  PENDING: { label: "Pending", dot: "bg-warning-500", chip: "bg-warning-50 text-warning-700", Icon: Clock },
  OVERDUE: { label: "Overdue", dot: "bg-danger-500", chip: "bg-danger-50 text-danger-700", Icon: AlertTriangle },
  CANCELLED: { label: "Cancelled", dot: "bg-ink-400", chip: "bg-ink-100 text-ink-600", Icon: Clock },
  REFUNDED: { label: "Refunded", dot: "bg-ink-400", chip: "bg-ink-100 text-ink-600", Icon: Clock },
};

const monthLabel = (month: number, year: number) =>
  new Date(year, Math.max(month - 1, 0), 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

export default function PaymentHistoryModal({ open, payment, onClose }: Props) {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["payments", "history", payment?.tenantId],
    queryFn: () => fetchTenantPaymentHistoryRaw(payment!.tenantId),
    enabled: open && !!payment?.tenantId,
  });

  if (!payment) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Payment History"
      subtitle={`${payment.name} · Room ${payment.room} · Bed ${payment.bed}`}
      maxWidth="max-w-xl"
    >
      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-ink-100" />
          ))}
        </div>
      )}

      {!isLoading && history.length === 0 && (
        <p className="rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-12 text-center text-sm text-ink-500">
          No payment history for this tenant yet.
        </p>
      )}

      {!isLoading && history.length > 0 && (
        <ol className="relative space-y-4 border-l border-ink-200 pl-6">
          {history.map((entry, i) => {
            const m = meta[entry.status] ?? meta.PENDING;
            return (
              <motion.li
                key={entry.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.06 }}
                className="relative rounded-2xl border border-ink-100 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
              >
                <span
                  className={`absolute -left-[31px] top-6 h-3 w-3 rounded-full ring-4 ring-white ${m.dot}`}
                />
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink-900">
                      {monthLabel(entry.month, entry.year)}
                    </p>
                    <span
                      className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${m.chip}`}
                    >
                      <m.Icon className="h-3 w-3" /> {m.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-ink-900">
                      {inr(num(entry.paidAmount))} / {inr(num(entry.rentAmount))}
                    </p>
                    {entry.receiptNumber ? (
                      <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-primary-600">
                        <ReceiptText className="h-3 w-3" /> {entry.receiptNumber}
                      </span>
                    ) : (
                      <span className="mt-1 block text-[11px] font-medium text-ink-400">
                        No receipt
                      </span>
                    )}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      )}
    </Modal>
  );
}
