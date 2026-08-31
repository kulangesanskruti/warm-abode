import { motion } from "framer-motion";
import { Check, CheckCheck, FileText, Image as ImageIcon, MapPin } from "lucide-react";

interface Props {
  message: string;
  recipient: string;
  timestamp: string;
  showAttachment?: "pdf" | "receipt" | "room" | "image" | null;
}

export default function LiveMessagePreview({
  message,
  recipient,
  timestamp,
  showAttachment,
}: Props) {
  const time =
    timestamp || new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <section className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
      <header className="flex items-center gap-3 border-b border-ink-100 bg-success-50/60 px-5 py-3.5">
        <div className="relative">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-success-500 to-success-600 text-sm font-bold text-white">
            {recipient.charAt(0) || "T"}
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-success-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink-900">{recipient || "Tenant Name"}</p>
          <p className="text-xs text-success-600">online</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-400">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100 text-success-600">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.07-1.38C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </span>
          WhatsApp
        </div>
      </header>

      <div
        className="relative min-h-[320px] space-y-3 p-5"
        style={{
          backgroundColor: "#e5ddd5",
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      >
        {/* Owner message */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-success-100 px-4 py-2.5 shadow-soft"
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-800">
            {message || "Your message preview will appear here…"}
          </p>

          {showAttachment === "pdf" && (
            <div className="mt-2 flex items-center gap-2.5 rounded-xl bg-white/80 p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger-50 text-danger-600">
                <FileText className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-ink-800">Receipt_SH-2608-0041.pdf</p>
                <p className="text-[10px] text-ink-500">PDF · 124 KB</p>
              </div>
            </div>
          )}

          {showAttachment === "receipt" && (
            <div className="mt-2 rounded-xl bg-white/80 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-ink-400">Receipt</span>
                <span className="text-[10px] font-bold text-success-600">SH-2608-0041</span>
              </div>
              <p className="mt-1 text-xs font-bold text-ink-900">₹5,000 · Rahul Sharma</p>
              <p className="text-[10px] text-ink-500">Skyline PG · Room 203 · Bed A</p>
            </div>
          )}

          {showAttachment === "room" && (
            <div className="mt-2 overflow-hidden rounded-xl bg-white/80">
              <div className="h-20 bg-gradient-to-br from-primary-200 to-success-200" />
              <div className="p-3">
                <p className="text-xs font-bold text-ink-900">Green Valley · Room 301</p>
                <p className="text-[10px] text-ink-500">2 beds available · ₹4,500/bed</p>
              </div>
            </div>
          )}

          {showAttachment === "image" && (
            <div className="mt-2 overflow-hidden rounded-xl">
              <div className="flex h-24 items-center justify-center bg-gradient-to-br from-primary-100 to-success-100">
                <ImageIcon className="h-8 w-8 text-ink-400" />
              </div>
            </div>
          )}

          <div className="mt-1 flex items-center justify-end gap-1">
            <span className="text-[10px] text-ink-500">{time}</span>
            <CheckCheck className="h-3.5 w-3.5 text-success-600" />
          </div>
        </motion.div>

        {/* Tenant reply */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mr-auto max-w-[70%] rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 shadow-soft"
        >
          <p className="text-sm leading-relaxed text-ink-800">
            Thank you! I'll make the payment today. 👍
          </p>
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[10px] text-ink-500">{time}</span>
            <Check className="h-3.5 w-3.5 text-ink-400" />
          </div>
        </motion.div>

        {/* Location pin */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="ml-auto max-w-[60%] overflow-hidden rounded-2xl rounded-tr-sm bg-success-100 shadow-soft"
        >
          <div className="flex h-20 items-center justify-center bg-gradient-to-br from-success-200 to-primary-200">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <div className="px-3 py-1.5">
            <p className="text-[10px] font-semibold text-ink-700">Property Location</p>
            <span className="text-[10px] text-ink-500">{time}</span>
          </div>
        </motion.div>
      </div>

      <footer className="flex items-center gap-2 border-t border-ink-100 bg-white px-4 py-2.5">
        <div className="flex-1 rounded-full bg-ink-50 px-4 py-2 text-xs text-ink-400">
          Type a reply…
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success-500 text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </span>
      </footer>
    </section>
  );
}
