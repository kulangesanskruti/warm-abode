import { motion } from "framer-motion";
import { MessageCircle, Send } from "lucide-react";

interface Props {
  onAction: () => void;
}

export default function EmptyState({ onAction }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 bg-white py-16 text-center"
    >
      <motion.span
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="flex h-20 w-20 items-center justify-center rounded-3xl bg-success-50 text-success-600"
      >
        <MessageCircle className="h-10 w-10" />
      </motion.span>
      <h3 className="mt-6 text-lg font-extrabold text-ink-900">No messages sent yet</h3>
      <p className="mt-2 max-w-sm text-sm text-ink-500">
        Start communicating with your tenants. Send your first rent reminder and see how fast they
        respond.
      </p>
      <button
        onClick={onAction}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-success-600 px-6 py-3 text-sm font-bold text-white shadow-float transition-all hover:-translate-y-0.5 hover:bg-success-700"
      >
        <Send className="h-4 w-4" /> Send Your First Reminder
      </button>
    </motion.div>
  );
}
