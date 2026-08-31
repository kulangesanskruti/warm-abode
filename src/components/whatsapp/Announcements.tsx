import { useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Send, Building2 } from "lucide-react";
import { announcementTypes, announcementToneMap, properties } from "./whatsappData";

interface Props {
  onToast: (m: string) => void;
}

const scopeOptions = [
  { id: "single", label: "Single Property" },
  { id: "multiple", label: "Multiple Properties" },
  { id: "all", label: "All Properties" },
];

export default function Announcements({ onToast }: Props) {
  const [selectedType, setSelectedType] = useState<number | null>(1);
  const [scope, setScope] = useState("all");
  const [message, setMessage] = useState("");

  const current = announcementTypes.find((a) => a.id === selectedType);
  const placeholder = current
    ? `Dear Tenant, this is to inform you about ${current.label.toLowerCase()} at your property. [Add details here]`
    : "Select an announcement type…";

  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header className="min-w-0">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
          <Megaphone className="h-4.5 w-4.5 text-primary-600" /> Announcements
        </h2>
        <p className="mt-0.5 text-sm text-ink-500">
          Broadcast announcements to one, some, or all properties.
        </p>
      </header>

      {/* Announcement type picker */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {announcementTypes.map((a, i) => {
          const tone = announcementToneMap[a.tone] ?? announcementToneMap["ink"]!;
          const active = selectedType === a.id;
          return (
            <motion.button
              key={a.id}
              onClick={() => setSelectedType(a.id)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-300 ${
                active
                  ? `${tone.border} ${tone.bg} ring-2 ring-primary-100`
                  : "border-ink-100 bg-white hover:border-primary-200 hover:shadow-soft"
              }`}
            >
              <span className="text-2xl">{a.emoji}</span>
              <span className={`text-xs font-bold ${active ? tone.text : "text-ink-700"}`}>
                {a.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Scope selector */}
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Recipients</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {scopeOptions.map((s) => (
            <button
              key={s.id}
              onClick={() => setScope(s.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                scope === s.id
                  ? "bg-primary-600 text-white shadow-float"
                  : "border border-ink-200 bg-white text-ink-700 hover:border-primary-200"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" /> {s.label}
            </button>
          ))}
        </div>
        {scope !== "all" && (
          <select className="mt-2 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
            {properties.slice(1).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        )}
      </div>

      {/* Message */}
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          Announcement Message
        </p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder={placeholder}
          className="mt-1.5 w-full resize-none rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder-ink-400 outline-none transition-all hover:border-ink-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Send */}
      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
        <p className="text-xs font-semibold text-ink-500">
          {scope === "all"
            ? "Will be sent to all tenants across all properties"
            : `Will be sent to selected ${scope === "single" ? "property" : "properties"}`}
        </p>
        <button
          onClick={() => onToast("Announcement broadcast sent")}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-float transition-all hover:-translate-y-0.5 hover:bg-primary-700"
        >
          <Send className="h-4 w-4" /> Broadcast Now
        </button>
      </div>
    </section>
  );
}
