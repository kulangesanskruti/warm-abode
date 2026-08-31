import { motion } from "framer-motion";
import { Megaphone, Send, IndianRupee, Sparkles } from "lucide-react";
import { inr } from "./rentData";

interface Props {
  collectionRate: number;
  pendingAmount: number;
  pendingCount: number;
  potential: number;
  onSendAll: () => void;
  onCollect: () => void;
}

export default function SmartInsights({
  collectionRate,
  pendingAmount,
  pendingCount,
  potential,
  onSendAll,
  onCollect,
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="relative mt-6 overflow-hidden rounded-3xl border border-primary-200 bg-gradient-to-br from-primary-50/90 via-white to-success-50/60 p-6 shadow-card sm:p-7"
    >
      <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary-100/50 blur-2xl" />
      <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-glow">
            <Megaphone className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-ink-900">Great progress!</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-primary-700 ring-1 ring-primary-100">
                <Sparkles className="h-3 w-3" /> Smart Insight
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-600">
              <span className="font-bold text-ink-900">{collectionRate}%</span> of this month&apos;s
              rent has already been collected. Only{" "}
              <span className="font-bold text-warning-700">{inr(pendingAmount)}</span> remains from{" "}
              {pendingCount} tenants.
            </p>
            <div className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-ink-100 bg-white/80 px-4 py-3 backdrop-blur">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-100 text-success-600">
                <IndianRupee className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-xs font-medium text-ink-500">Potential Monthly Collection</p>
                <p className="text-lg font-extrabold text-ink-900">{inr(potential)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onSendAll}
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-700"
          >
            <Send className="h-4 w-4" /> Send All Reminders
          </button>
          <button
            onClick={onCollect}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-float transition-all hover:-translate-y-0.5 hover:bg-primary-700"
          >
            <IndianRupee className="h-4 w-4" /> Collect Rent
          </button>
        </div>
      </div>
    </motion.section>
  );
}
