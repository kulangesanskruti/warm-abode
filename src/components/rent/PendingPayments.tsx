import { motion } from "framer-motion";
import { IndianRupee, MessageCircle, Phone, AlertOctagon } from "lucide-react";
import { inr, type PaymentRecord } from "./rentData";

interface Props {
  items: PaymentRecord[];
  onCollect: (payment: PaymentRecord) => void;
}

export default function PendingPayments({ items, onCollect }: Props) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header className="min-w-0">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
          <AlertOctagon className="h-4.5 w-4.5 text-danger-500" /> Pending Payments
        </h2>
        <p className="mt-0.5 text-sm text-ink-500">Tenants who still need to pay this month.</p>
      </header>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-card"
          >
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={p.photo}
                alt={p.name}
                className="h-10 w-10 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-900">{p.name}</p>
                <p className="truncate text-xs text-ink-500">
                  {p.property} · {p.room}/{p.bed}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-xs font-medium text-ink-500">Pending</p>
                <p className="text-lg font-extrabold text-ink-900">{inr(p.outstanding)}</p>
                <p className="text-[11px] font-medium text-ink-500">Due {p.dueDate}</p>
              </div>
              <span
                className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                  p.daysDelta < 0
                    ? "bg-danger-50 text-danger-600"
                    : "bg-warning-50 text-warning-700"
                }`}
              >
                {p.daysDelta < 0
                  ? `${Math.abs(p.daysDelta)}d overdue`
                  : p.daysDelta === 0
                    ? "Due today"
                    : `in ${p.daysDelta}d`}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onCollect(p)}
                className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary-600 px-2 py-2 text-[11px] font-bold text-white transition-all hover:bg-primary-700"
              >
                <IndianRupee className="h-3 w-3" /> Collect
              </button>
              <button className="inline-flex items-center justify-center gap-1 rounded-lg border border-success-200 bg-success-50 px-2 py-2 text-[11px] font-bold text-success-700 transition-all hover:bg-success-100">
                <MessageCircle className="h-3 w-3" /> Remind
              </button>
              <button className="inline-flex items-center justify-center gap-1 rounded-lg border border-ink-200 bg-white px-2 py-2 text-[11px] font-bold text-ink-700 transition-all hover:border-primary-200 hover:text-primary-700">
                <Phone className="h-3 w-3" /> Call
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
