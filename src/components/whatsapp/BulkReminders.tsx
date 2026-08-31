import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, MessageCircle, CheckCheck } from "lucide-react";
import { bulkReminderActions, bulkToneMap, tenantList } from "./whatsappData";

interface Props {
  onToast: (m: string) => void;
}

const statusBadge: Record<string, string> = {
  paid: "bg-success-50 text-success-700",
  overdue: "bg-danger-50 text-danger-700",
  partial: "bg-primary-50 text-primary-700",
  pending: "bg-warning-50 text-warning-700",
};

export default function BulkReminders({ onToast }: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  const toggle = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const handleAction = (label: string) => {
    onToast(`${label} sent to ${selected.length} tenants`);
    setSelected([]);
    setShowPanel(false);
  };

  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
            <Users className="h-4.5 w-4.5 text-primary-600" /> Bulk Reminders
          </h2>
          <p className="mt-0.5 text-sm text-ink-500">
            Select multiple tenants and send reminders at once.
          </p>
        </div>
        <button
          onClick={() => setShowPanel((v) => !v)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700"
        >
          {showPanel ? <X className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
          {showPanel ? "Close" : "Select Tenants"}
        </button>
      </header>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {tenantList.map((t) => {
                const isSelected = selected.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggle(t.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-primary-300 bg-primary-50 ring-2 ring-primary-100"
                        : "border-ink-100 bg-white hover:border-primary-200"
                    }`}
                  >
                    <img
                      src={t.photo}
                      alt={t.name}
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink-900">{t.name}</p>
                      <p className="truncate text-xs text-ink-500">
                        {t.property} · {t.room}/{t.bed}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBadge[t.status]}`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bulk actions */}
            {selected.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-2xl border border-primary-200 bg-primary-50 p-4"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-primary-900">
                      {selected.length} tenant{selected.length > 1 ? "s" : ""} selected
                    </p>
                    <p className="text-xs font-semibold text-primary-700">
                      Estimated messages: {selected.length}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {bulkReminderActions.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => handleAction(a.label)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white transition-all ${bulkToneMap[a.tone]}`}
                      >
                        <span>{a.emoji}</span> {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick stats */}
      {!showPanel && (
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-danger-50 p-3 text-center">
            <p className="text-lg font-extrabold text-danger-700">2</p>
            <p className="text-[10px] font-semibold uppercase text-ink-400">Overdue</p>
          </div>
          <div className="rounded-xl bg-warning-50 p-3 text-center">
            <p className="text-lg font-extrabold text-warning-700">2</p>
            <p className="text-[10px] font-semibold uppercase text-ink-400">Due Soon</p>
          </div>
          <div className="rounded-xl bg-success-50 p-3 text-center">
            <p className="text-lg font-extrabold text-success-700">3</p>
            <p className="text-[10px] font-semibold uppercase text-ink-400">Paid</p>
          </div>
        </div>
      )}
    </section>
  );
}
