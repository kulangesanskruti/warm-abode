import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Mail, MessageCircle, Plus } from "lucide-react";
import { scheduledReportsSeed } from "./reportsData";

const frequencies = ["Daily", "Weekly", "Monthly"];

export default function ScheduledReportsSection({ onToast }: { onToast: (m: string) => void }) {
  const [items, setItems] = useState(scheduledReportsSeed);

  const update = (id: number, patch: Partial<(typeof scheduledReportsSeed)[number]>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  return (
    <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
            <CalendarClock className="h-4.5 w-4.5 text-primary-600" /> Scheduled Reports
          </h2>
          <p className="mt-0.5 text-sm text-ink-500">
            Reports delivered automatically, without you asking.
          </p>
        </div>
        <button
          onClick={() => onToast("Schedule builder opened")}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700"
        >
          <Plus className="h-3.5 w-3.5" /> New Schedule
        </button>
      </header>

      <div className="mt-5 space-y-3">
        {items.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="grid gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-ink-900">{s.name}</p>
              <p className="mt-0.5 text-xs text-ink-500">
                {s.frequency} · via {s.channel}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-xl border border-ink-200 bg-white p-1">
                {frequencies.map((f) => (
                  <button
                    key={f}
                    onClick={() => update(s.id, { frequency: f })}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all ${
                      s.frequency === f
                        ? "bg-primary-600 text-white"
                        : "text-ink-600 hover:text-ink-900"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex rounded-xl border border-ink-200 bg-white p-1">
                <button
                  onClick={() => update(s.id, { channel: "Email" })}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all ${
                    s.channel === "Email"
                      ? "bg-ink-900 text-white"
                      : "text-ink-600 hover:text-ink-900"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" /> Email
                </button>
                <button
                  onClick={() => update(s.id, { channel: "WhatsApp" })}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all ${
                    s.channel === "WhatsApp"
                      ? "bg-success-600 text-white"
                      : "text-ink-600 hover:text-ink-900"
                  }`}
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </button>
              </div>
              <button
                onClick={() => {
                  update(s.id, { enabled: !s.enabled });
                  onToast(`${s.name} ${s.enabled ? "paused" : "scheduled"}`);
                }}
                aria-label="Toggle schedule"
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  s.enabled ? "bg-primary-600" : "bg-ink-300"
                }`}
              >
                <motion.span
                  animate={{ x: s.enabled ? 20 : 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="absolute top-[2px] h-5 w-5 rounded-full bg-white shadow-float"
                />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
