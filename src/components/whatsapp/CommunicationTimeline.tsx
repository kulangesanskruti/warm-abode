import { motion } from "framer-motion";
import { GitBranch } from "lucide-react";
import { communicationTimeline, communicationToneMap } from "./whatsappData";

export default function CommunicationTimeline() {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header className="min-w-0">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
          <GitBranch className="h-4.5 w-4.5 text-primary-600" /> Communication Timeline
        </h2>
        <p className="mt-0.5 text-sm text-ink-500">Full communication journey for Rahul Sharma.</p>
      </header>

      <ol className="relative mt-6 space-y-3 border-l-2 border-primary-200 pl-6">
        {communicationTimeline.map((e, i) => {
          const tone = communicationToneMap[e.tone];
          return (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative"
            >
              <span
                className={`absolute -left-[33px] top-4 flex h-7 w-7 items-center justify-center rounded-full ${tone.bg} text-sm ring-4 ring-white`}
              >
                {e.emoji}
              </span>
              <div className={`rounded-2xl border ${tone.border} ${tone.bg} p-4`}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-bold ${tone.text}`}>{e.label}</p>
                    <p className="truncate text-xs text-ink-500">{e.detail}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold text-ink-400">{e.date}</span>
                </div>
              </div>
              {i < communicationTimeline.length - 1 && (
                <span className="absolute -left-[19px] top-14 h-4 w-0.5 bg-primary-200" />
              )}
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
