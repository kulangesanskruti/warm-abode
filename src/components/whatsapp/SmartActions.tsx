import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { smartActions, smartActionTone, type SmartAction } from "./whatsappData";

interface Props {
  onAction: (action: SmartAction) => void;
}

export default function SmartActions({ onAction }: Props) {
  return (
    <section>
      <h2 className="text-base font-extrabold text-ink-900">Smart Actions</h2>
      <p className="mt-0.5 text-sm text-ink-500">One-click communication, ready when you are.</p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {smartActions.map((a, i) => {
          const tone = smartActionTone[a.tone];
          return (
            <motion.button
              key={a.id}
              onClick={() => onAction(a)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`group relative overflow-hidden rounded-2xl border ${tone.border} ${tone.bg} p-5 text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-soft">
                  {a.emoji}
                </span>
                <div className="min-w-0">
                  <p className={`truncate text-sm font-bold ${tone.text}`}>{a.label}</p>
                  <p className="truncate text-xs text-ink-500">{a.description}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end gap-1 text-xs font-bold text-ink-500 transition-colors group-hover:text-ink-900">
                Send now{" "}
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
