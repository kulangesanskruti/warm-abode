import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, CheckCircle2, FileDown, Loader2 } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import Modal from "@/components/rent/Modal";
import ReportSummaryCards from "@/components/reports/ReportSummaryCards";
import ReportCategories from "@/components/reports/ReportCategories";
import ReportBuilder from "@/components/reports/ReportBuilder";
import ReportAnalytics from "@/components/reports/ReportAnalytics";
import PropertyPerformanceReport from "@/components/reports/PropertyPerformanceReport";
import OccupancyReport from "@/components/reports/OccupancyReport";
import TenantReportSection from "@/components/reports/TenantReportSection";
import FinancialInsightsSection from "@/components/reports/FinancialInsightsSection";
import ScheduledReportsSection from "@/components/reports/ScheduledReportsSection";
import PdfTemplatePicker from "@/components/reports/PdfTemplatePicker";
import ReportPreview from "@/components/reports/ReportPreview";
import { pdfTemplates } from "@/components/reports/reportsData";

function SectionSkeleton() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/2 animate-pulse rounded bg-ink-100" />
              <div className="h-6 w-2/3 animate-pulse rounded bg-ink-100" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-ink-50" />
            </div>
            <div className="h-11 w-11 animate-pulse rounded-xl bg-ink-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<string>("modern");
  const [preview, setPreview] = useState<{ title: string; format: string } | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const templateName = pdfTemplates.find((t) => t.key === template)?.name ?? "Modern";

  const generate = (title: string, format = "PDF") => {
    setGenerating(title);
    setTimeout(() => {
      setGenerating(null);
      setPreview({ title, format });
      setToast(`${title} generated as ${format}`);
    }, 900);
  };

  return (
    <div className="flex h-screen flex-col bg-ink-50">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 overflow-y-auto">
            <div className="px-6 py-8 sm:px-8 lg:px-10">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
                    Reports &amp; Analytics
                  </h1>
                  <p className="mt-1 text-sm text-ink-500">
                    Generate reports, analyze income and export professional PDFs.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => generate("Monthly Summary")}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-float transition-all hover:-translate-y-0.5 hover:bg-primary-700"
                  >
                    <FileDown className="h-4 w-4" /> Generate Report
                  </button>
                  <button
                    onClick={() => setScheduleOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-700"
                  >
                    <CalendarClock className="h-4 w-4" /> Schedule Report
                  </button>
                </div>
              </div>

              {loading ? (
                <SectionSkeleton />
              ) : (
                <>
                  <div className="mt-6">
                    <ReportSummaryCards />
                  </div>

                  <ReportCategories
                    onGenerate={(r) => generate(r.title)}
                    onPreview={(r) => setPreview({ title: r.title, format: "PDF" })}
                  />

                  <ReportBuilder
                    onPreview={(format) => setPreview({ title: "Custom Report", format })}
                    onGenerate={(format) => generate("Custom Report", format)}
                  />

                  <ReportAnalytics />

                  <FinancialInsightsSection />

                  <PropertyPerformanceReport
                    onPreview={() =>
                      setPreview({ title: "Property Performance Report", format: "PDF" })
                    }
                  />

                  <OccupancyReport />

                  <TenantReportSection />

                  <PdfTemplatePicker
                    value={template}
                    onChange={setTemplate}
                    onPreview={(name) =>
                      setPreview({ title: `${name} Template Preview`, format: "PDF" })
                    }
                  />

                  <ScheduledReportsSection onToast={setToast} />
                </>
              )}

              <div className="h-6" />
            </div>
          </main>
        </div>
      </div>

      {/* Report preview */}
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.title ?? "Report Preview"}
        subtitle={`${templateName} template · ${preview?.format ?? "PDF"} export`}
        maxWidth="max-w-3xl"
      >
        {preview && (
          <ReportPreview
            title={preview.title}
            template={templateName}
            format={preview.format}
            onAction={(m) => setToast(m)}
          />
        )}
      </Modal>

      {/* Schedule modal */}
      <Modal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Schedule a Report"
        subtitle="Choose frequency and delivery channel."
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Report
            </span>
            <select className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
              <option>Rent Collection Report</option>
              <option>Property Performance Report</option>
              <option>Monthly Summary</option>
              <option>Cashbook</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Frequency
            </span>
            <select className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Delivery
            </span>
            <select className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
              <option>Email</option>
              <option>WhatsApp</option>
            </select>
          </label>
          <button
            onClick={() => {
              setScheduleOpen(false);
              setToast("Report scheduled successfully");
            }}
            className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-primary-700"
          >
            Save Schedule
          </button>
        </div>
      </Modal>

      {/* Generating overlay */}
      <AnimatePresence>
        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              className="flex flex-col items-center gap-3 rounded-3xl bg-white px-10 py-8 shadow-glow"
            >
              <Loader2 className="h-7 w-7 animate-spin text-primary-600" />
              <p className="text-sm font-bold text-ink-900">Generating {generating}…</p>
              <p className="text-xs text-ink-500">Compiling data and building your document</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="inline-flex items-center gap-2 rounded-2xl bg-ink-900 px-4 py-3 text-sm font-semibold text-white shadow-glow">
              <CheckCircle2 className="h-4 w-4 text-success-400" /> {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
