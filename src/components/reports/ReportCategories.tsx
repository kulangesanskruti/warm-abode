import { motion } from "framer-motion";
import { Eye, Sparkles, Clock } from "lucide-react";
import { reportCategories, type ReportCategory } from "./reportsData";

const accent: Record<ReportCategory["accent"], string> = {
  primary: "from-primary-500/10 to-primary-500/0",
  success: "from-success-500/10 to-success-500/0",
  warning: "from-warning-500/10 to-warning-500/0",
  danger: "from-danger-500/10 to-danger-500/0",
  ink: "from-ink-500/10 to-ink-500/0",
};

interface Props {
  onGenerate: (report: ReportCategory) => void;
  onPreview: (report: ReportCategory) => void;
}

export default function ReportCategories({ onGenerate, onPreview }: Props) {
  return (
    <section className="mt-6">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-extrabold text-ink-900">Report Categories</h2>
          <p className="mt-0.5 text-sm text-ink-500">
            Pick a report, preview it, then export in one click.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportCategories.map((r, i) => (
          <motion.article
            key={r.key}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
          >
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${accent[r.accent]}`}
            />
            <span className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-ink-100 bg-ink-50 text-lg">
              {r.emoji}
            </span>
            <h3 className="relative mt-4 text-sm font-extrabold text-ink-900">{r.title}</h3>
            <p className="relative mt-1.5 flex-1 text-xs leading-relaxed text-ink-500">
              {r.description}
            </p>
            <p className="relative mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-400">
              <Clock className="h-3.5 w-3.5" /> Last generated {r.lastGenerated}
            </p>
            <div className="relative mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => onGenerate(r)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary-600 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-primary-700 active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5" /> Generate
              </button>
              <button
                onClick={() => onPreview(r)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700 active:scale-95"
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
