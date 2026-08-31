import { useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Eye, FileDown, FileSpreadsheet, FileText, Sheet } from "lucide-react";
import {
  dateRanges,
  formatOptions,
  propertyOptions,
  roomOptions,
  statusOptions,
  tenantOptions,
} from "./reportsData";

const selectStyle =
  "w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-800 outline-none transition-all hover:border-ink-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

const formatIcon = { PDF: FileText, Excel: FileSpreadsheet, CSV: Sheet } as const;

interface Props {
  onPreview: (format: string) => void;
  onGenerate: (format: string) => void;
}

export default function ReportBuilder({ onPreview, onGenerate }: Props) {
  const [format, setFormat] = useState<string>("PDF");

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card"
    >
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-ink-100 bg-gradient-to-r from-primary-50 to-white px-6 py-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white">
          <SlidersHorizontal className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-extrabold text-ink-900">Report Builder</h2>
          <p className="mt-0.5 text-sm text-ink-500">
            Build a custom report with exactly the data you need.
          </p>
        </div>
      </header>

      <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 xl:grid-cols-3">
        <label className="min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Date Range
          </span>
          <select className={`${selectStyle} mt-1.5`}>
            {dateRanges.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Property
          </span>
          <select className={`${selectStyle} mt-1.5`}>
            {propertyOptions.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">Room</span>
          <select className={`${selectStyle} mt-1.5`}>
            {roomOptions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">Tenant</span>
          <select className={`${selectStyle} mt-1.5`}>
            {tenantOptions.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Payment Status
          </span>
          <select className={`${selectStyle} mt-1.5`}>
            {statusOptions.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <div className="min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Export Format
          </span>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {formatOptions.map((f) => {
              const Icon = formatIcon[f];
              const active = format === f;
              return (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-bold transition-all ${
                    active
                      ? "border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-100"
                      : "border-ink-200 bg-white text-ink-600 hover:border-ink-300"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {f}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-ink-100 bg-ink-50 px-6 py-4">
        <button
          onClick={() => onPreview(format)}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-700"
        >
          <Eye className="h-4 w-4" /> Preview
        </button>
        <button
          onClick={() => onGenerate(format)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-float transition-all hover:-translate-y-0.5 hover:bg-primary-700"
        >
          <FileDown className="h-4 w-4" /> Generate Report
        </button>
      </div>
    </motion.section>
  );
}
