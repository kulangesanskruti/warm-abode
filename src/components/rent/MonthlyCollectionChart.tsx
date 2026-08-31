import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { inr } from "./rentData";

export interface MonthlyCollectionPoint {
  month: string;
  collected: number;
  pending: number;
  expected: number;
}

export default function MonthlyCollectionChart({ data }: { data: MonthlyCollectionPoint[] }) {
  const max = Math.max(...data.map((m) => m.expected), 1);

  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
            <BarChart3 className="h-4.5 w-4.5 text-primary-600" /> Monthly Collection
          </h2>
          <p className="mt-0.5 text-sm text-ink-500">
            Collected vs pending against expected revenue.
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-3 text-xs font-semibold text-ink-600 sm:flex">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-600" /> Collected
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-warning-400" /> Pending
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" /> Expected
          </span>
        </div>
      </header>

      <div className="mt-8 flex h-64 items-end gap-3 sm:gap-6">
        {data.length === 0 && (
          <p className="mx-auto text-sm text-ink-500">No rent history yet.</p>
        )}
        {data.map((m, i) => {
          const collectedPct = (m.collected / max) * 100;
          const pendingPct = (m.pending / max) * 100;
          const expectedPct = (m.expected / max) * 100;
          return (
            <div key={m.month} className="group flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="relative flex h-full w-full items-end justify-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${expectedPct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.06 }}
                  className="absolute bottom-0 w-full rounded-xl border border-dashed border-ink-200 bg-ink-50/60"
                />
                <div className="relative flex h-full w-full items-end justify-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${collectedPct}%` }}
                    transition={{ duration: 0.9, delay: 0.15 + i * 0.06, ease: "easeOut" }}
                    className="w-1/3 rounded-t-lg bg-gradient-to-t from-primary-700 to-primary-400 shadow-float"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pendingPct}%` }}
                    transition={{ duration: 0.9, delay: 0.25 + i * 0.06, ease: "easeOut" }}
                    className="w-1/3 rounded-t-lg bg-gradient-to-t from-warning-500 to-warning-200"
                  />
                </div>
                <div className="pointer-events-none absolute -top-2 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl bg-ink-900 px-3 py-2 text-[11px] font-semibold text-white shadow-card group-hover:block">
                  Collected {inr(m.collected)} · Pending {inr(m.pending)}
                </div>
              </div>
              <span className="text-xs font-bold text-ink-600">{m.month}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
