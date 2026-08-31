import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { activityToneMap, type ActivityEntry } from "./notificationsData";

/** Entries come from the real notifications API. */
export default function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header className="min-w-0">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
          <Activity className="h-4.5 w-4.5 text-primary-600" /> Activity Feed
        </h2>
        <p className="mt-0.5 text-sm text-ink-500">Everything that happened recently.</p>
      </header>

      <ol className="relative mt-6 space-y-3 border-l border-ink-200 pl-6">
        {entries.map((a, i) => {
          const tone = activityToneMap[a.tone];
          const Icon = a.icon;
          return (
            <motion.li
              key={a.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative rounded-2xl border border-ink-100 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <span
                className={`absolute -left-[31px] top-5 h-3 w-3 rounded-full ring-4 ring-white ${tone.dot}`}
              />
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.bg} ${tone.text}`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink-900">{a.label}</p>
                  <p className="truncate text-xs text-ink-500">{a.detail}</p>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-ink-400">{a.time}</span>
              </div>
            </motion.li>
          );
        })}
      </ol>
      {entries.length === 0 && <p className="mt-6 text-sm text-ink-400">No recent activity yet.</p>}
    </section>
  );
}
