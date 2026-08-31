import { motion } from "framer-motion";
import { Download, Printer, Share2 } from "lucide-react";
import { inr, monthlyRevenue, propertyPerformance, reportTableRows } from "./reportsData";

interface Props {
  title: string;
  template: string;
  format?: string;
  onAction: (label: string) => void;
}

const statusColor: Record<string, string> = {
  Paid: "text-success-700 bg-success-50",
  Partial: "text-primary-700 bg-primary-50",
  Overdue: "text-danger-700 bg-danger-50",
};

export default function ReportPreview({ title, template, format = "PDF", onAction }: Props) {
  const generated = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const max = Math.max(...monthlyRevenue.map((m) => m.expected));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card"
    >
      {/* Document header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-ink-900 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-black text-white">
            S
          </span>
          <div>
            <p className="text-sm font-extrabold text-white">StayHub</p>
            <p className="text-[11px] text-ink-400">PG &amp; Rental Management</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-ink-400">Generated on</p>
          <p className="text-sm font-bold text-white">{generated}</p>
        </div>
      </div>

      <div className="border-b border-ink-100 px-6 py-5">
        <h3 className="text-lg font-extrabold text-ink-900">{title}</h3>
        <p className="mt-1 text-xs font-semibold text-ink-500">
          Template: {template} · Format: {format} · Period: August 2026 · All Properties
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 px-6 py-5 sm:grid-cols-4">
        {[
          ["Total Revenue", inr(128500)],
          ["Outstanding", inr(18000)],
          ["Occupancy", "89%"],
          ["Collection Rate", "94%"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-ink-100 bg-ink-50 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
              {label}
            </p>
            <p className="mt-1 text-sm font-extrabold text-ink-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="px-6 pb-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">
          Monthly revenue
        </p>
        <div className="mt-3 flex h-32 items-end gap-2 rounded-xl border border-ink-100 bg-ink-50/60 p-3">
          {monthlyRevenue.map((m, i) => (
            <div key={m.month} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div className="flex h-full w-full items-end justify-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(m.revenue / max) * 100}%` }}
                  transition={{ duration: 0.7, delay: i * 0.05 }}
                  className="w-2/3 rounded-t bg-gradient-to-t from-primary-700 to-primary-400"
                />
              </div>
              <span className="text-[10px] font-semibold text-ink-500">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Property table */}
      <div className="px-6 pb-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">
          Property summary
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-ink-100">
          <table className="w-full min-w-[420px] text-left text-xs">
            <thead className="bg-ink-50 text-[10px] uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-3 py-2 font-bold">Property</th>
                <th className="px-3 py-2 font-bold">Occupancy</th>
                <th className="px-3 py-2 font-bold">Revenue</th>
                <th className="px-3 py-2 font-bold">Pending</th>
              </tr>
            </thead>
            <tbody>
              {propertyPerformance.map((p) => (
                <tr key={p.name} className="border-t border-ink-100">
                  <td className="px-3 py-2 font-semibold text-ink-900">{p.name}</td>
                  <td className="px-3 py-2 text-ink-600">{p.occupancy}%</td>
                  <td className="px-3 py-2 font-semibold text-ink-900">{inr(p.revenue)}</td>
                  <td className="px-3 py-2 text-warning-700">{inr(p.pending)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions table */}
      <div className="px-6 pb-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Transactions</p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-ink-100">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead className="bg-ink-50 text-[10px] uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-3 py-2 font-bold">Date</th>
                <th className="px-3 py-2 font-bold">Tenant</th>
                <th className="px-3 py-2 font-bold">Property</th>
                <th className="px-3 py-2 font-bold">Method</th>
                <th className="px-3 py-2 font-bold">Amount</th>
                <th className="px-3 py-2 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {reportTableRows.map((r, i) => (
                <tr key={`${r.tenant}-${i}`} className="border-t border-ink-100">
                  <td className="px-3 py-2 text-ink-600">{r.date}</td>
                  <td className="px-3 py-2 font-semibold text-ink-900">{r.tenant}</td>
                  <td className="px-3 py-2 text-ink-600">{r.property}</td>
                  <td className="px-3 py-2 text-ink-600">{r.method}</td>
                  <td className="px-3 py-2 font-semibold text-ink-900">{inr(r.amount)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        statusColor[r.status] ?? "bg-ink-100 text-ink-600"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-ink-100 px-6 py-4 text-[11px] font-medium text-ink-400">
        <span>Generated by StayHub</span>
        <span>Page 1 of 1</span>
      </div>

      <div className="grid grid-cols-1 gap-2 border-t border-ink-100 bg-ink-50 px-6 py-4 sm:grid-cols-3">
        <button
          onClick={() => onAction("PDF download started")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-3 py-2.5 text-xs font-bold text-white transition-all hover:bg-primary-700"
        >
          <Download className="h-4 w-4" /> Download PDF
        </button>
        <button
          onClick={() => onAction("Sent to printer")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-xs font-bold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700"
        >
          <Printer className="h-4 w-4" /> Print
        </button>
        <button
          onClick={() => onAction("Share link copied")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-success-200 bg-success-50 px-3 py-2.5 text-xs font-bold text-success-700 transition-all hover:bg-success-100"
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>
    </motion.div>
  );
}
