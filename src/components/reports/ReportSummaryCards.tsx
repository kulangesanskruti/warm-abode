import { motion } from "framer-motion";
import { FileText, Wallet, TrendingUp, Building2, Users, ReceiptText } from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

const cards = [
  {
    icon: FileText,
    emoji: "📄",
    label: "Reports Generated",
    value: 126,
    prefix: "",
    suffix: "",
    sub: "Last 6 months",
    tone: "primary",
  },
  {
    icon: Wallet,
    emoji: "💰",
    label: "Total Revenue",
    value: 766000,
    prefix: "₹",
    suffix: "",
    sub: "Mar – Aug 2026",
    tone: "success",
  },
  {
    icon: TrendingUp,
    emoji: "📈",
    label: "Monthly Growth",
    value: 14,
    prefix: "+",
    suffix: "%",
    sub: "vs previous month",
    tone: "success",
  },
  {
    icon: Building2,
    emoji: "🏠",
    label: "Active Properties",
    value: 4,
    prefix: "",
    suffix: "",
    sub: "68 beds mapped",
    tone: "primary",
  },
  {
    icon: Users,
    emoji: "👥",
    label: "Total Tenants",
    value: 58,
    prefix: "",
    suffix: "",
    sub: "6 moving in this month",
    tone: "warning",
  },
  {
    icon: ReceiptText,
    emoji: "🧾",
    label: "Receipts Generated",
    value: 48,
    prefix: "",
    suffix: "",
    sub: "August 2026",
    tone: "danger",
  },
];

const toneMap: Record<string, string> = {
  primary: "bg-primary-50 text-primary-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
};

export default function ReportSummaryCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className="group relative overflow-hidden rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                {c.label}
              </p>
              <p className="mt-2 text-2xl font-extrabold tracking-tight text-ink-900">
                <AnimatedCounter to={c.value} prefix={c.prefix} suffix={c.suffix} />
              </p>
              <p className="mt-1 text-xs font-medium text-ink-500">{c.sub}</p>
            </div>
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneMap[c.tone]}`}
            >
              <c.icon className="h-5 w-5" />
            </span>
          </div>
          <span className="pointer-events-none absolute -bottom-6 -right-2 text-5xl opacity-5 transition-opacity group-hover:opacity-10">
            {c.emoji}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
