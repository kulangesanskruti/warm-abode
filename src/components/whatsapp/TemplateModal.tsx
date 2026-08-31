import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Save, Calendar } from "lucide-react";
import Modal from "@/components/rent/Modal";
import LiveMessagePreview from "./LiveMessagePreview";
import { type MessageTemplate } from "./whatsappData";

interface Props {
  open: boolean;
  template: MessageTemplate | null;
  mode: "preview" | "edit";
  onClose: () => void;
  onToast: (m: string) => void;
}

export default function TemplateModal({ open, template, mode, onClose, onToast }: Props) {
  const [body, setBody] = useState(template?.body ?? "");

  if (!template) return null;

  const isEdit = mode === "edit";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit: ${template.name}` : `Preview: ${template.name}`}
      subtitle={`${template.category} · ${template.uses} uses`}
      maxWidth="max-w-4xl"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor / preview text */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-ink-50 p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-soft">
              {template.emoji}
            </span>
            <div>
              <p className="text-sm font-bold text-ink-900">{template.name}</p>
              <p className="text-xs text-ink-500">{template.category}</p>
            </div>
          </div>

          {isEdit ? (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="w-full resize-none rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          ) : (
            <div className="rounded-xl border border-ink-100 bg-ink-50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
                {template.body}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                onToast("Message sent on WhatsApp");
                onClose();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-success-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-success-700"
            >
              <Send className="h-4 w-4" /> Send WhatsApp
            </button>
            {isEdit && (
              <button
                onClick={() => {
                  onToast("Template saved");
                  onClose();
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
            )}
            <button
              onClick={() => {
                onToast("Message scheduled");
                onClose();
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700"
            >
              <Calendar className="h-4 w-4" /> Schedule
            </button>
          </div>
        </div>

        {/* Live preview */}
        <LiveMessagePreview
          message={isEdit ? body : template.body}
          recipient="Rahul Sharma"
          timestamp={new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        />
      </div>
    </Modal>
  );
}
