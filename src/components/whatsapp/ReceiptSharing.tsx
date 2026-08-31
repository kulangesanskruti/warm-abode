import { motion } from "framer-motion";
import { Share2, FileText, CircleCheck as CheckCircle2, Heart, Download } from "lucide-react";

interface Props {
  onToast: (m: string) => void;
}

const options = [
  {
    id: 1,
    emoji: "🧾",
    label: "Share Receipt",
    description: "Send the payment receipt PDF",
    tone: "primary",
    icon: Share2,
  },
  {
    id: 2,
    emoji: "📄",
    label: "Share PDF",
    description: "Download and share receipt as PDF",
    tone: "ink",
    icon: FileText,
  },
  {
    id: 3,
    emoji: "✅",
    label: "Payment Confirmation",
    description: "Confirm payment received",
    tone: "success",
    icon: CheckCircle2,
  },
  {
    id: 4,
    emoji: "🙏",
    label: "Thank You Message",
    description: "Send a thank you note",
    tone: "warning",
    icon: Heart,
  },
];

const toneMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  primary: {
    bg: "bg-primary-50",
    border: "border-primary-200",
    text: "text-primary-700",
    icon: "text-primary-600",
  },
  success: {
    bg: "bg-success-50",
    border: "border-success-200",
    text: "text-success-700",
    icon: "text-success-600",
  },
  warning: {
    bg: "bg-warning-50",
    border: "border-warning-200",
    text: "text-warning-700",
    icon: "text-warning-600",
  },
  ink: { bg: "bg-ink-100", border: "border-ink-200", text: "text-ink-700", icon: "text-ink-600" },
};

export default function ReceiptSharing({ onToast }: Props) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header className="min-w-0">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
          <Download className="h-4.5 w-4.5 text-success-600" /> Payment Receipt Sharing
        </h2>
        <p className="mt-0.5 text-sm text-ink-500">
          Share receipts instantly after rent collection.
        </p>
      </header>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {options.map((o, i) => {
          const tone = toneMap[o.tone] ?? toneMap["ink"]!;
          const Icon = o.icon;
          return (
            <motion.button
              key={o.id}
              onClick={() => onToast(`${o.label} shared`)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`group flex flex-col items-start rounded-2xl border ${tone.border} ${tone.bg} p-5 text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{o.emoji}</span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white ${tone.icon}`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
              </div>
              <p className={`mt-3 text-sm font-bold ${tone.text}`}>{o.label}</p>
              <p className="mt-1 text-xs text-ink-500">{o.description}</p>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
