import { motion } from "framer-motion";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { summaryToneMap } from "./notificationsData";
import type { NotificationSummary } from "@/lib/notifications";

/** Cards are derived from the real /notifications payload — no sample data. */
export default function NotificationSummaryCards({ summary }: { summary: NotificationSummary }) {
  const cards = [
    {
      id: "total",
      emoji: "🔔",
      label: "Total Notifications",
      value: summary.total,
      sub: `${summary.unread} unread`,
      tone: "primary",
    },
    {
      id: "high",
      emoji: "🔴",
      label: "High Priority",
      value: summary.high,
      sub: "Needs action",
      tone: "danger",
    },
    {
      id: "pending",
      emoji: "🟡",
      label: "Pending Actions",
      value: summary.unread,
      sub: "Awaiting response",
      tone: "warning",
    },
    {
      id: "read",
      emoji: "🟢",
      label: "Read",
      value: summary.read,
      sub: "Resolved",
      tone: "success",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.07 } } }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((c) => (
        <motion.div
          key={c.id}
          variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
          className="group relative overflow-hidden rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
        >
          <div className="flex items-start justify-between">
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${summaryToneMap[c.tone]}`}
            >
              {c.emoji}
            </span>
          </div>
          <p className="mt-4 text-sm font-medium text-ink-500">{c.label}</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink-900">
            <AnimatedCounter to={c.value} />
          </p>
          <p className="mt-1 text-xs font-medium text-ink-500">{c.sub}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
