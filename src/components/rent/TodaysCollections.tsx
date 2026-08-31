import { motion } from "framer-motion";
import { Banknote, Landmark, Smartphone, Clock3 } from "lucide-react";
import { inr } from "./rentData";

const icons: Record<string, typeof Banknote> = {
  Cash: Banknote,
  UPI: Smartphone,
  "Bank Transfer": Landmark,
};

export interface TodaysCollection {
  id: string;
  time: string;
  name: string;
  amount: number;
  method: string;
  room: string;
}

export default function TodaysCollections({ items }: { items: TodaysCollection[] }) {
  const total = items.reduce((sum, c) => sum + c.amount, 0);

  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
            <Clock3 className="h-4.5 w-4.5 text-primary-600" /> Today&apos;s Collections
          </h2>
          <p className="mt-0.5 text-sm text-ink-500">{items.length} payments received</p>
        </div>
        <span className="shrink-0 rounded-full bg-success-50 px-3 py-1.5 text-sm font-extrabold text-success-700">
          {inr(total)}
        </span>
      </header>

      <ol className="relative mt-6 space-y-4 border-l border-ink-200 pl-6">
        {items.length === 0 && (
          <p className="text-sm text-ink-500">No collections recorded today yet.</p>
        )}
        {items.map((c, i) => {
          const Icon = icons[c.method] ?? Banknote;
          return (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <span className="absolute -left-[31px] top-2 h-3 w-3 rounded-full bg-success-500 ring-4 ring-white" />
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-ink-100 bg-ink-50/60 px-4 py-3 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-soft">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink-900">{c.name}</p>
                  <p className="truncate text-xs text-ink-500">
                    {c.time} · {c.room}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-extrabold text-ink-900">{inr(c.amount)}</p>
                  <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-ink-500">
                    <Icon className="h-3 w-3" /> {c.method}
                  </span>
                </div>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
