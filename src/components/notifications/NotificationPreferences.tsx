import { useState } from "react";
import { motion } from "framer-motion";
import { Settings2, Save } from "lucide-react";
import { preferenceItems as seed } from "./notificationsData";

interface Props {
  onToast: (m: string) => void;
}

export default function NotificationPreferences({ onToast }: Props) {
  const [items, setItems] = useState(seed);

  const toggle = (id: number) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
    const item = items.find((p) => p.id === id);
    onToast(`${item?.label} ${item?.enabled ? "disabled" : "enabled"}`);
  };

  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
            <Settings2 className="h-4.5 w-4.5 text-primary-600" /> Notification Preferences
          </h2>
          <p className="mt-0.5 text-sm text-ink-500">Choose what you want to be notified about.</p>
        </div>
        <button
          onClick={() => onToast("Preferences saved")}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-float transition-all hover:-translate-y-0.5 hover:bg-primary-700"
        >
          <Save className="h-4 w-4" /> Save
        </button>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 p-4 transition-all hover:border-ink-200"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-soft">
                {p.emoji}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-900">{p.label}</p>
                <p className="truncate text-xs text-ink-500">{p.description}</p>
              </div>
            </div>
            <button
              onClick={() => toggle(p.id)}
              aria-label={`Toggle ${p.label}`}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                p.enabled ? "bg-primary-600" : "bg-ink-300"
              }`}
            >
              <motion.span
                animate={{ x: p.enabled ? 20 : 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="absolute top-[2px] h-5 w-5 rounded-full bg-white shadow-float"
              />
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
