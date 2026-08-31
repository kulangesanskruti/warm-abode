import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { smartRecommendations, recommendationTone } from "./whatsappData";

interface Props {
  onAction: (id: number) => void;
}

export default function SmartRecommendations({ onAction }: Props) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
          <span className="text-lg">✨</span> Smart Recommendations
        </h2>
        <p className="mt-0.5 text-sm text-ink-500">StayHub suggests your next best action.</p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {smartRecommendations.map((r, i) => {
          const tone = recommendationTone[r.tone];
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`flex flex-col rounded-2xl border ${tone.border} ${tone.bg} p-5`}
            >
              <span className="text-2xl">{r.emoji}</span>
              <p className="mt-3 text-sm font-bold text-ink-900">{r.title}</p>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-ink-500">{r.detail}</p>
              <button
                onClick={() => onAction(r.id)}
                className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white transition-all ${tone.btn}`}
              >
                {r.action} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
