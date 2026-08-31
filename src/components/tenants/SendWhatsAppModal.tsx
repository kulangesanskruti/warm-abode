import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, MessageCircle, X } from "lucide-react";
import { sendWhatsAppMessage, whatsappErrorMessage, type WhatsAppLog } from "@/lib/whatsapp";

interface Props {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  tenantName: string;
  tenantPhone?: string;
}

const quickMessages = (name: string) => [
  {
    label: "Rent reminder",
    body: `Hi ${name}, this is a friendly reminder that your rent is due. Please make the payment at your earliest convenience. Thank you!`,
  },
  {
    label: "Payment received",
    body: `Hi ${name}, we have received your rent payment. Thank you! Your receipt will follow shortly.`,
  },
  {
    label: "General notice",
    body: `Hi ${name}, a quick update from the property management team: `,
  },
];

export default function SendWhatsAppModal({
  open,
  onClose,
  tenantId,
  tenantName,
  tenantPhone,
}: Props) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentLog, setSentLog] = useState<WhatsAppLog | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      sendWhatsAppMessage({
        tenantId,
        message: message.trim(),
        messageType: "OTHER",
      }),
    onSuccess: (log) => {
      setSentLog(log);
      setErrorMessage(null);
      void queryClient.invalidateQueries({ queryKey: ["whatsapp"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      setSentLog(null);
      setErrorMessage(whatsappErrorMessage(error));
    },
  });

  if (!open) return null;

  const close = () => {
    setErrorMessage(null);
    setSentLog(null);
    mutation.reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-float"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-ink-900">WhatsApp {tenantName}</h2>
              <p className="text-sm text-ink-500">
                {tenantPhone ? tenantPhone : "No phone number saved for this tenant"}
              </p>
            </div>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {quickMessages(tenantName).map((q) => (
            <button
              key={q.label}
              onClick={() => setMessage(q.body)}
              className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:border-primary-300 hover:text-primary-700"
            >
              {q.label}
            </button>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            maxLength={4096}
            placeholder="Type the WhatsApp message…"
            className="mt-1.5 w-full resize-none rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        {errorMessage && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {sentLog && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-success-200 bg-success-50 p-3 text-sm text-success-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Delivered to {sentLog.phone} (status {sentLog.status}
              {sentLog.providerMessageId ? `, id ${sentLog.providerMessageId}` : ""}).
            </span>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={close}
            className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
          >
            Close
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !message.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-success-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-success-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mutation.isPending ? "Sending…" : "Send WhatsApp"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
