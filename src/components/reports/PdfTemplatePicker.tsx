import { motion } from "framer-motion";
import { Check, Eye } from "lucide-react";
import { pdfTemplates } from "./reportsData";

interface Props {
  value: string;
  onChange: (key: string) => void;
  onPreview: (name: string) => void;
}

function TemplateThumb({ variant }: { variant: string }) {
  if (variant === "modern") {
    return (
      <div className="space-y-1.5 p-3">
        <div className="h-4 rounded bg-gradient-to-r from-primary-600 to-primary-400" />
        <div className="flex gap-1.5">
          <div className="h-6 flex-1 rounded bg-primary-100" />
          <div className="h-6 flex-1 rounded bg-success-100" />
          <div className="h-6 flex-1 rounded bg-warning-100" />
        </div>
        <div className="h-8 rounded bg-ink-100" />
      </div>
    );
  }
  if (variant === "professional") {
    return (
      <div className="space-y-1.5 p-3">
        <div className="h-3 w-1/2 rounded bg-ink-900" />
        <div className="h-px bg-ink-300" />
        <div className="space-y-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-2 rounded bg-ink-200" />
          ))}
        </div>
        <div className="h-5 rounded border border-ink-300" />
      </div>
    );
  }
  if (variant === "minimal") {
    return (
      <div className="space-y-2.5 p-4">
        <div className="h-2.5 w-1/3 rounded bg-ink-300" />
        <div className="h-2 w-2/3 rounded bg-ink-100" />
        <div className="h-2 w-1/2 rounded bg-ink-100" />
        <div className="h-6 rounded bg-ink-50" />
      </div>
    );
  }
  return (
    <div className="space-y-1 p-2">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-1.5 rounded bg-ink-200" />
      ))}
    </div>
  );
}

export default function PdfTemplatePicker({ value, onChange, onPreview }: Props) {
  return (
    <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <header className="min-w-0">
        <h2 className="text-base font-extrabold text-ink-900">PDF Templates</h2>
        <p className="mt-0.5 text-sm text-ink-500">Choose how your exported documents look.</p>
      </header>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {pdfTemplates.map((t, i) => {
          const active = value === t.key;
          return (
            <motion.button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`group relative overflow-hidden rounded-2xl border bg-white p-4 text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow ${
                active ? "border-primary-500 ring-2 ring-primary-100" : "border-ink-100 shadow-card"
              }`}
            >
              {active && (
                <span className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
              <div className="h-28 overflow-hidden rounded-xl border border-ink-100 bg-white">
                <TemplateThumb variant={t.key} />
              </div>
              <p className="mt-3 text-sm font-extrabold text-ink-900">{t.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-500">{t.description}</p>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(t.name);
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-2.5 py-1.5 text-[11px] font-bold text-ink-700 transition-all hover:border-primary-200 hover:text-primary-700"
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
