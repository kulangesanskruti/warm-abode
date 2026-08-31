import { motion } from "framer-motion";
import { BedDouble, Wrench, DoorOpen } from "lucide-react";
import { occupancyRows } from "./reportsData";

export default function OccupancyReport() {
  return (
    <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header className="min-w-0">
        <h2 className="text-base font-extrabold text-ink-900">Room Occupancy Report</h2>
        <p className="mt-0.5 text-sm text-ink-500">Bed-level availability across every property.</p>
      </header>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {occupancyRows.map((r, i) => {
          const total = r.occupied + r.vacant + r.maintenance;
          const pct = Math.round((r.occupied / total) * 100);
          return (
            <motion.article
              key={r.property}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <p className="truncate text-sm font-extrabold text-ink-900">{r.property}</p>
                <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-700">
                  {pct}%
                </span>
              </div>

              <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-ink-100">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.occupied / total) * 100}%` }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.05 }}
                  className="h-full bg-success-500"
                />
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.vacant / total) * 100}%` }}
                  transition={{ duration: 0.9, delay: 0.2 + i * 0.05 }}
                  className="h-full bg-ink-300"
                />
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.maintenance / total) * 100}%` }}
                  transition={{ duration: 0.9, delay: 0.3 + i * 0.05 }}
                  className="h-full bg-warning-500"
                />
              </div>

              <ul className="mt-4 space-y-2 text-xs font-semibold">
                <li className="flex items-center justify-between text-ink-600">
                  <span className="inline-flex items-center gap-1.5">
                    <BedDouble className="h-3.5 w-3.5 text-success-600" /> Occupied
                  </span>
                  <span className="text-ink-900">{r.occupied} beds</span>
                </li>
                <li className="flex items-center justify-between text-ink-600">
                  <span className="inline-flex items-center gap-1.5">
                    <DoorOpen className="h-3.5 w-3.5 text-ink-400" /> Vacant
                  </span>
                  <span className="text-ink-900">{r.vacant} beds</span>
                </li>
                <li className="flex items-center justify-between text-ink-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5 text-warning-600" /> Maintenance
                  </span>
                  <span className="text-ink-900">{r.maintenance} beds</span>
                </li>
              </ul>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
