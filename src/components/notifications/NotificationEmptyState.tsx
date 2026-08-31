import { motion } from "framer-motion";
import { CircleCheck as CheckCircle2, PartyPopper } from "lucide-react";

interface Props {
  onAction: () => void;
}

export default function NotificationEmptyState({ onAction }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 bg-white py-20 text-center"
    >
      <motion.span
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="flex h-20 w-20 items-center justify-center rounded-3xl bg-success-50 text-success-600"
      >
        <PartyPopper className="h-10 w-10" />
      </motion.span>
      <h3 className="mt-6 text-lg font-extrabold text-ink-900">You're all caught up!</h3>
      <p className="mt-2 max-w-sm text-sm text-ink-500">
        No pending notifications. We'll let you know the moment something needs your attention.
      </p>
      <button
        onClick={onAction}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-float transition-all hover:-translate-y-0.5 hover:bg-primary-700"
      >
        <CheckCircle2 className="h-4 w-4" /> View All Notifications
      </button>
    </motion.div>
  );
}
