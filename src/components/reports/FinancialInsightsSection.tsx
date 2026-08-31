import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target, AlertTriangle, Gauge } from "lucide-react";
import { financialInsights } from "./reportsData";

const toneMap: Record<
  string,
  { icon: typeof TrendingUp; bg: string; text: string; border: string }
> = {
  success: {
    icon: TrendingUp,
    bg: "bg-success-50",
    text: "text-success-700",
    border: "border-success-200",
  },
  warning: {
    icon: TrendingDown,
    bg: "bg-warning-50",
    text: "text-warning-700",
    border: "border-warning-200",
  },
  primary: {
    icon: Target,
    bg: "bg-primary-50",
    text: "text-primary-700",
    border: "border-primary-200",
  },
  danger: {
    icon: AlertTriangle,
    bg: "bg-danger-50",
    text: "text-danger-700",
    border: "border-danger-200",
  },
};

export default function FinancialInsightsSection() {
  return (
    <section className="mt-6">
      <div className="min-w-0">
        <h2 className="text-base font-extrabold text-ink-900">Financial Insights</h2>
        <p className="mt-0.5 text-sm text-ink-500">The five numbers that decide your month.</p>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {financialInsights.map((f, i) => {
          const tone = toneMap[f.tone] ?? toneMap["primary"]!;
          const Icon = f.label === "Collection Efficiency" ? Gauge : tone.icon;
          return (
            <motion.article
              key={f.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`rounded-2xl border bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow ${tone.border}`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone.bg} ${tone.text}`}
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                {f.label}
              </p>
              <p className="mt-1 text-lg font-extrabold text-ink-900">{f.value}</p>
              <p className={`mt-0.5 text-xs font-semibold ${tone.text}`}>{f.sub}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
