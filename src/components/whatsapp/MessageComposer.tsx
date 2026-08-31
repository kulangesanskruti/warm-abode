import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { motion } from "framer-motion";
import { Send, Calendar, Save, Eye, Paperclip, Smile } from "lucide-react";
import LiveMessagePreview from "./LiveMessagePreview";
import { emojis, messageTemplates, properties, tenantList } from "./whatsappData";

type TenantOption = { id: string; fullName: string; phone: string; property?: string };

interface Props {
  initialTemplate?: string;
  initialMessage?: string;
  onSend: (msg: string, recipient: string, tenantId?: string) => void;
  onSchedule: () => void;
  onToast: (m: string) => void;
}

const selectStyle =
  "w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-800 outline-none transition-all hover:border-ink-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

export default function MessageComposer({
  initialTemplate,
  initialMessage,
  onSend,
  onSchedule,
  onToast,
}: Props) {
  const { data: tenantData } = useQuery({
    queryKey: ["tenants", "whatsapp-composer"],
    queryFn: () => apiRequest<{ tenants: TenantOption[] }>("/tenants?limit=200"),
  });
  const realTenants = tenantData?.tenants ?? [];
  const [tenantId, setTenantId] = useState("");
  const selectedTenant = realTenants.find((t) => t.id === tenantId) ?? realTenants[0];
  const recipient = selectedTenant?.fullName ?? "";
  const [property, setProperty] = useState(properties[1] ?? "");
  const [templateKey, setTemplateKey] = useState(
    initialTemplate ?? messageTemplates[0]?.name ?? "",
  );
  const [message, setMessage] = useState(initialMessage ?? messageTemplates[0]?.body ?? "");
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachment, setAttachment] = useState<"pdf" | "receipt" | "room" | "image" | null>(null);

  const handleTemplateChange = (name: string) => {
    setTemplateKey(name);
    const t = messageTemplates.find((t) => t.name === name);
    if (t) setMessage(t.body);
  };

  const insertEmoji = (e: string) => {
    setMessage((m) => m + e);
    setShowEmoji(false);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {/* Composer */}
      <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <header className="min-w-0">
          <h2 className="text-base font-extrabold text-ink-900">Message Composer</h2>
          <p className="mt-0.5 text-sm text-ink-500">
            Compose, preview and send — all in one place.
          </p>
        </header>

        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Property
              </span>
              <select
                value={property}
                onChange={(e) => setProperty(e.target.value)}
                className={`${selectStyle} mt-1.5`}
              >
                {properties.slice(1).map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Room
              </span>
              <select className={`${selectStyle} mt-1.5`}>
                <option>203</option>
                <option>105</option>
                <option>301</option>
              </select>
            </label>
            <label className="min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Tenant
              </span>
              <select
                value={selectedTenant?.id ?? ""}
                onChange={(e) => setTenantId(e.target.value)}
                className={`${selectStyle} mt-1.5`}
              >
                {realTenants.length === 0 && <option value="">No tenants found</option>}
                {realTenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} — {t.phone}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Message Template
            </span>
            <select
              value={templateKey}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className={`${selectStyle} mt-1.5`}
            >
              {messageTemplates.map((t) => (
                <option key={t.id}>{t.name}</option>
              ))}
            </select>
          </label>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Editable Message
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowEmoji((v) => !v)}
                  aria-label="Emoji"
                  className="rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-50 hover:text-warning-600"
                >
                  <Smile className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => onToast("Attachment picker opened")}
                  aria-label="Attach"
                  className="rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-50 hover:text-primary-600"
                >
                  <Paperclip className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
            {showEmoji && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 grid grid-cols-10 gap-1 rounded-xl border border-ink-100 bg-ink-50 p-3"
              >
                {emojis.map((e) => (
                  <button
                    key={e}
                    onClick={() => insertEmoji(e)}
                    className="rounded-lg p-1.5 text-lg transition-transform hover:scale-125"
                  >
                    {e}
                  </button>
                ))}
              </motion.div>
            )}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="mt-1.5 w-full resize-none rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-all hover:border-ink-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {/* Attachment toggles */}
          <div className="flex flex-wrap gap-2">
            {(["pdf", "receipt", "room", "image"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAttachment(attachment === a ? null : a)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  attachment === a
                    ? "bg-primary-600 text-white"
                    : "border border-ink-200 bg-white text-ink-600 hover:border-primary-200"
                }`}
              >
                {a === "pdf" && "PDF"}
                {a === "receipt" && "Receipt"}
                {a === "room" && "Room Card"}
                {a === "image" && "Image"}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 border-t border-ink-100 pt-4">
            <button
              onClick={() => {
                if (!selectedTenant) {
                  onToast("Select a tenant with a saved phone number first");
                  return;
                }
                if (!message.trim()) {
                  onToast("Write a message before sending");
                  return;
                }
                onSend(message, recipient, selectedTenant.id);
              }}
              disabled={!selectedTenant || !message.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-success-600 px-5 py-2.5 text-sm font-bold text-white shadow-float transition-all hover:-translate-y-0.5 hover:bg-success-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Send WhatsApp
            </button>
            <button
              onClick={onSchedule}
              className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700"
            >
              <Calendar className="h-4 w-4" /> Schedule
            </button>
            <button
              onClick={() => onToast("Template saved")}
              className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700"
            >
              <Save className="h-4 w-4" /> Save Template
            </button>
            <button
              onClick={() => onToast("Preview opened")}
              className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700"
            >
              <Eye className="h-4 w-4" /> Preview
            </button>
          </div>
        </div>
      </section>

      {/* Live preview */}
      <LiveMessagePreview
        message={message}
        recipient={recipient}
        timestamp={new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        showAttachment={attachment}
      />
    </div>
  );
}
