import { motion } from "framer-motion";
import { Check, AlertCircle, Clock } from "lucide-react";
import { inr, formatDate, monthLabel, totalPaid, type ApiTenantDetail } from "@/lib/tenants";

interface TenantRentHistoryProps {
  tenant: ApiTenantDetail;
}

const statusConfig = {
  paid: { icon: Check, color: "text-success-600", bg: "bg-success-50", label: "Paid" },
  partial: { icon: Clock, color: "text-primary-600", bg: "bg-primary-50", label: "Partial" },
  due: { icon: Clock, color: "text-warning-600", bg: "bg-warning-50", label: "Due" },
  overdue: { icon: AlertCircle, color: "text-danger-600", bg: "bg-danger-50", label: "Overdue" },
} as const;

type UiStatus = keyof typeof statusConfig;

const toUiStatus = (status: string): UiStatus => {
  if (status === "PAID") return "paid";
  if (status === "OVERDUE") return "overdue";
  if (status === "PARTIAL") return "partial";
  return "due";
};

export default function TenantRentHistory({ tenant }: TenantRentHistoryProps) {
  const payments = tenant.payments ?? [];
  const paidPayments = payments.filter((p) => p.status === "PAID");
  const consistency = payments.length
    ? Math.round((paidPayments.length / payments.length) * 100)
    : 0;
  const outstanding = payments.reduce((sum, p) => sum + Number(p.outstandingAmount ?? 0), 0);

  if (payments.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-ink-200 py-12 text-center">
        <p className="text-ink-600">No payments recorded for this tenant yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-ink-900">Rent Payment Timeline</h3>

      <div className="space-y-3">
        {payments.map((payment, index) => {
          const config = statusConfig[toUiStatus(payment.status)];
          const StatusIcon = config.icon;

          return (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index, 8) * 0.05 }}
              className="flex items-start gap-4 rounded-lg border border-ink-100 bg-white p-4 transition-all hover:shadow-md"
            >
              <div className={`mt-1 ${config.bg} flex-shrink-0 rounded-full p-2.5`}>
                <StatusIcon className={`h-4 w-4 ${config.color}`} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink-900">
                  {monthLabel(payment.month, payment.year)}
                </p>
                <p className="mt-1 text-sm text-ink-600">
                  Rent:{" "}
                  <span className="font-semibold text-ink-900">{inr(payment.rentAmount)}</span> •
                  Paid: <span className="font-semibold text-ink-900">{inr(payment.paidAmount)}</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-ink-600">
                  <span>Paid on: {formatDate(payment.paymentDate)}</span>
                  <span>Method: {payment.paymentMethod || "—"}</span>
                  <span>Receipt: {payment.receiptNumber || "—"}</span>
                </div>
              </div>

              <div
                className={`${config.bg} ${config.color} flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold`}
              >
                {config.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 rounded-lg border border-primary-200 bg-primary-50 p-4 sm:grid-cols-3">
        <div>
          <p className="text-sm text-primary-600">Total Paid</p>
          <p className="mt-1 text-2xl font-bold text-primary-900">{inr(totalPaid(payments))}</p>
        </div>
        <div>
          <p className="text-sm text-primary-600">Outstanding</p>
          <p className="mt-1 text-2xl font-bold text-primary-900">{inr(outstanding)}</p>
        </div>
        <div>
          <p className="text-sm text-primary-600">Months Paid In Full</p>
          <p className="mt-1 text-2xl font-bold text-primary-900">{consistency}%</p>
        </div>
      </div>
    </div>
  );
}
