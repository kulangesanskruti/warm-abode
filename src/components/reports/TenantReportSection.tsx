import { motion } from "framer-motion";
import { CalendarDays, History } from "lucide-react";
import { tenantRows, tenantStatusMeta } from "./reportsData";

export default function TenantReportSection() {
  return (
    <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header className="min-w-0">
        <h2 className="text-base font-extrabold text-ink-900">Tenant Report</h2>
        <p className="mt-0.5 text-sm text-ink-500">
          Rent status and payment reliability for every tenant.
        </p>
      </header>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tenantRows.map((t, i) => {
          const meta = tenantStatusMeta[t.status];
          const pct = Math.round((t.onTime / t.months) * 100);
          return (
            <motion.article
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <img
                  src={t.photo}
                  alt={t.name}
                  className="h-11 w-11 rounded-xl object-cover"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-ink-900">{t.name}</p>
                  <p className="truncate text-xs text-ink-500">
                    {t.property} · {t.room}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${meta.bg} ${meta.border} ${meta.text}`}
                >
                  {t.status}
                </span>
              </div>

              <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500">
                <CalendarDays className="h-3.5 w-3.5" /> Moved in {t.moveIn}
              </p>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-ink-500">
                  <span className="inline-flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5" /> Payment history
                  </span>
                  <span className="text-ink-900">
                    {t.onTime}/{t.months} on time
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ink-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.1 + i * 0.05, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      pct >= 90 ? "bg-success-500" : pct >= 75 ? "bg-primary-500" : "bg-warning-500"
                    }`}
                  />
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
