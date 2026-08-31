import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import { fetchPayments, num, type ApiPayment } from "@/lib/payments";
import { inr } from "@/components/rent/rentData";

export default function PropertyRent({ propertyId }: { propertyId?: string }) {
  const now = new Date();

  const { data, isLoading } = useQuery({
    queryKey: ["payments", "property-rent", propertyId, now.getMonth(), now.getFullYear()],
    queryFn: () => {
      const params = new URLSearchParams();
      if (propertyId) params.set("propertyId", propertyId);
      params.set("month", String(now.getMonth() + 1));
      params.set("year", String(now.getFullYear()));
      params.set("limit", "200");
      return fetchPayments(params.toString());
    },
    enabled: !!propertyId,
  });

  const payments: ApiPayment[] = data?.payments ?? [];
  const target = payments.reduce((sum, p) => sum + num(p.rentAmount), 0);
  const collected = payments.reduce((sum, p) => sum + num(p.paidAmount), 0);
  const pending = payments.reduce((sum, p) => sum + num(p.outstandingAmount), 0);
  const pendingCount = payments.filter((p) => num(p.outstandingAmount) > 0).length;
  const pct = target > 0 ? Math.round((collected / target) * 100) : 0;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={item} className="rounded-xl border-2 border-primary-200 bg-primary-50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-primary-600">Monthly Target</p>
              <p className="mt-2 text-3xl font-bold text-primary-700">{inr(target)}</p>
              <p className="mt-2 text-xs text-ink-600">Expected this month</p>
            </div>
            <DollarSign className="h-8 w-8 text-primary-600" />
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-xl border-2 border-success-200 bg-success-50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-success-600">Collected</p>
              <p className="mt-2 text-3xl font-bold text-success-700">{inr(collected)}</p>
              <p className="mt-2 text-xs text-ink-600">{pct}% of target</p>
            </div>
            <CheckCircle className="h-8 w-8 text-success-600" />
          </div>
        </motion.div>

        <motion.div variants={item} className="rounded-xl border-2 border-danger-200 bg-danger-50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-danger-600">Pending</p>
              <p className="mt-2 text-3xl font-bold text-danger-700">{inr(pending)}</p>
              <p className="mt-2 text-xs text-ink-600">
                From {pendingCount} tenant{pendingCount === 1 ? "" : "s"}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-danger-600" />
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="rounded-xl border border-ink-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-600 uppercase">Room</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-600 uppercase">Tenant</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-600 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-600 uppercase">Due Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-ink-500">
                    Loading…
                  </td>
                </tr>
              )}
              {!isLoading && payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-ink-500">
                    No rent records for this property this month.
                  </td>
                </tr>
              )}
              {payments.map((p) => {
                const isPaid = p.status === "PAID";
                return (
                  <tr key={p.id} className="border-b border-ink-100 hover:bg-ink-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-ink-900">
                      #{p.room?.roomNumber ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-700">{p.tenant?.fullName ?? "—"}</td>
                    <td className="px-6 py-4 text-sm font-medium text-ink-900">{inr(num(p.rentAmount))}</td>
                    <td className="px-6 py-4 text-sm text-ink-700">
                      {p.dueDate
                        ? new Date(p.dueDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border ${
                          isPaid
                            ? "bg-success-50 text-success-700 border-success-200"
                            : "bg-danger-50 text-danger-700 border-danger-200"
                        }`}
                      >
                        {isPaid ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
