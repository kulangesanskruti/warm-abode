import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-2xl",
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className={`relative flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-t-3xl bg-white shadow-glow sm:rounded-3xl`}
          >
            <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-ink-100 px-6 py-5">
              <div className="min-w-0">
                <h2 className="truncate text-base font-extrabold text-ink-900">{title}</h2>
                {subtitle && <p className="mt-0.5 truncate text-sm text-ink-500">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
