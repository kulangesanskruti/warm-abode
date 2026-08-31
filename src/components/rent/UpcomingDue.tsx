import { motion } from "framer-motion";
import { CalendarClock, IndianRupee } from "lucide-react";
import { inr, type PaymentRecord } from "./rentData";

interface Props {
  items: PaymentRecord[];
  onCollect: (payment: PaymentRecord) => void;
}

function countdown(delta: number) {
  if (delta === 0) return "Due Today";
  if (delta === 1) return "Due Tomorrow";
  return `Due in ${delta} Days`;
}

export default function UpcomingDue({ items, onCollect }: Props) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header>
        <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
          <CalendarClock className="h-4.5 w-4.5 text-warning-600" /> Upcoming Due Rent
        </h2>
        <p className="mt-0.5 text-sm text-ink-500">Rent due within the next 7 days.</p>
      </header>

      <div className="mt-5 space-y-3">
        {items.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-ink-100 bg-ink-50/60 px-4 py-3 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-soft"
          >
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={p.photo}
                alt={p.name}
                className="h-9 w-9 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-900">{p.name}</p>
                <p className="truncate text-xs text-ink-500">
                  {p.room}/{p.bed} · {inr(p.monthlyRent)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  p.daysDelta <= 1
                    ? "bg-danger-50 text-danger-600"
                    : "bg-warning-50 text-warning-700"
                }`}
              >
                {countdown(p.daysDelta)}
              </span>
              <button
                onClick={() => onCollect(p)}
                aria-label={`Collect rent from ${p.name}`}
                className="rounded-lg bg-primary-600 p-2 text-white transition-all hover:bg-primary-700"
              >
                <IndianRupee className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
        {items.length === 0 && (
          <p className="rounded-xl bg-ink-50 px-4 py-6 text-center text-sm text-ink-500">
            Nothing due in the next 7 days.
          </p>
        )}
      </div>
    </section>
  );
}
