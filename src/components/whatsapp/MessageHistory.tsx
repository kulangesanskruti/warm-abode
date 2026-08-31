import { motion } from "framer-motion";
import { History } from "lucide-react";
import { messageHistory, deliveryStatusMeta } from "./whatsappData";

export default function MessageHistory() {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header className="min-w-0">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
          <History className="h-4.5 w-4.5 text-primary-600" /> Message History
        </h2>
        <p className="mt-0.5 text-sm text-ink-500">
          Every message you've sent, in chronological order.
        </p>
      </header>

      <ol className="relative mt-6 space-y-4 border-l border-ink-200 pl-6">
        {messageHistory.map((h, i) => {
          const meta = deliveryStatusMeta[h.status];
          return (
            <motion.li
              key={h.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative rounded-2xl border border-ink-100 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <span
                className={`absolute -left-[31px] top-6 h-3 w-3 rounded-full ring-4 ring-white ${meta.dot}`}
              />
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-lg">
                    {h.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink-900">{h.title}</p>
                    <p className="truncate text-xs text-ink-500">
                      {h.recipient} · {h.property}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.bg} ${meta.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
                  </span>
                  <span className="text-[11px] font-medium text-ink-400">{h.time}</span>
                </div>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
