import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, Pencil, Trash2, Plus, Clock } from "lucide-react";
import { scheduledMessages as seed, type ScheduledMessage } from "./whatsappData";

interface Props {
  onToast: (m: string) => void;
}

const whenMeta: Record<ScheduledMessage["when"], { label: string; bg: string; text: string }> = {
  today: { label: "Today", bg: "bg-primary-50", text: "text-primary-700" },
  tomorrow: { label: "Tomorrow", bg: "bg-warning-50", text: "text-warning-700" },
  weekly: { label: "Weekly", bg: "bg-success-50", text: "text-success-700" },
  monthly: { label: "Monthly", bg: "bg-ink-100", text: "text-ink-700" },
};

const tabs = ["Today", "Tomorrow", "Weekly", "Monthly", "Upcoming", "Completed"] as const;

export default function ScheduledMessages({ onToast }: Props) {
  const [items, setItems] = useState(seed);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Today");

  const filtered = items.filter((s) => {
    if (tab === "Today") return s.when === "today";
    if (tab === "Tomorrow") return s.when === "tomorrow";
    if (tab === "Weekly") return s.when === "weekly";
    if (tab === "Monthly") return s.when === "monthly";
    if (tab === "Upcoming") return s.enabled;
    if (tab === "Completed") return !s.enabled;
    return true;
  });

  const toggle = (id: number) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
    const item = items.find((s) => s.id === id);
    onToast(`${item?.title} ${item?.enabled ? "paused" : "resumed"}`);
  };

  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
            <CalendarClock className="h-4.5 w-4.5 text-primary-600" /> Scheduled Messages
          </h2>
          <p className="mt-0.5 text-sm text-ink-500">Messages set to send automatically.</p>
        </div>
        <button
          onClick={() => onToast("Schedule builder opened")}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700"
        >
          <Plus className="h-3.5 w-3.5" /> New Schedule
        </button>
      </header>

      {/* Tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
              tab === t
                ? "bg-primary-600 text-white shadow-float"
                : "border border-ink-200 bg-white text-ink-700 hover:border-primary-200 hover:text-primary-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="mt-5 space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((s, i) => {
            const meta = whenMeta[s.when];
            return (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="grid gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-soft">
                    {s.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-ink-900">{s.title}</p>
                    <p className="truncate text-xs text-ink-500">
                      {s.recipient} · {s.template}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${meta.bg} ${meta.text}`}
                      >
                        {meta.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-500">
                        <Clock className="h-3 w-3" /> {s.time}
                      </span>
                      {s.day && (
                        <span className="text-[11px] font-semibold text-ink-500">{s.day}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToast(`Editing ${s.title}`)}
                    aria-label="Edit"
                    className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-primary-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onToast(`${s.title} deleted`)}
                    aria-label="Delete"
                    className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-danger-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggle(s.id)}
                    aria-label="Toggle"
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
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <p className="rounded-xl bg-ink-50 px-4 py-8 text-center text-sm text-ink-500">
            No scheduled messages for this period.
          </p>
        )}
      </div>
    </section>
  );
}
