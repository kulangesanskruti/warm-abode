import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Eye } from "lucide-react";
import { badgeMeta, inr, propertyPerformance } from "./reportsData";

export default function PropertyPerformanceReport({ onPreview }: { onPreview: () => void }) {
  return (
    <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-extrabold text-ink-900">Property Performance</h2>
          <p className="mt-0.5 text-sm text-ink-500">
            Ranked by revenue, occupancy and pending rent.
          </p>
        </div>
        <button
          onClick={onPreview}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700"
        >
          <Eye className="h-3.5 w-3.5" /> Preview Report
        </button>
      </header>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {propertyPerformance.map((p, i) => {
          const badge = badgeMeta[p.badge];
          return (
            <motion.article
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-2xl border border-ink-100 bg-ink-50/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-card"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-extrabold text-ink-900">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-ink-900 text-[11px] font-black text-white">
                      {i + 1}
                    </span>
                    <span className="truncate">{p.name}</span>
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${badge.bg} ${badge.border} ${badge.text}`}
                >
                  {badge.label}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-ink-500">
                  <span>Occupancy</span>
                  <span className="text-ink-900">{p.occupancy}%</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ink-200/70">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.occupancy}%` }}
                    transition={{ duration: 1, delay: 0.1 + i * 0.06, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white px-2 py-2.5">
                  <p className="text-xs font-extrabold text-ink-900">{inr(p.revenue)}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                    Revenue
                  </p>
                </div>
                <div className="rounded-xl bg-white px-2 py-2.5">
                  <p className="text-xs font-extrabold text-warning-700">{inr(p.pending)}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                    Pending
                  </p>
                </div>
                <div className="rounded-xl bg-white px-2 py-2.5">
                  <p
                    className={`inline-flex items-center gap-0.5 text-xs font-extrabold ${
                      p.growth >= 0 ? "text-success-700" : "text-danger-700"
                    }`}
                  >
                    {p.growth >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(p.growth)}%
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                    Growth
                  </p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
