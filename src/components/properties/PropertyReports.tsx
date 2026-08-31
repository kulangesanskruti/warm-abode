import { motion } from "framer-motion";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";

const reports = [
  { id: 1, name: "Annual Report 2023", date: "Dec 2023", type: "Annual" },
  { id: 2, name: "Q4 Financial Summary", date: "Nov 2023", type: "Quarterly" },
  { id: 3, name: "Occupancy Analysis", date: "Oct 2023", type: "Monthly" },
  { id: 4, name: "Tenant Activity Report", date: "Sep 2023", type: "Monthly" },
  { id: 5, name: "Maintenance Log", date: "Aug 2023", type: "Custom" },
];

export default function PropertyReports({ propertyId }: { propertyId?: string }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Generate Report */}
      <motion.div
        variants={item}
        className="rounded-xl border-2 border-primary-200 bg-primary-50 p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-100 p-3">
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-primary-900">Generate New Report</p>
              <p className="text-sm text-primary-700">Create a comprehensive property report</p>
            </div>
          </div>
          <button className="rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white transition-all hover:bg-primary-700 active:scale-95 whitespace-nowrap">
            Generate
          </button>
        </div>
      </motion.div>

      {/* Reports List */}
      <div className="grid gap-4 lg:grid-cols-2">
        {reports.map((report) => (
          <motion.div
            key={report.id}
            variants={item}
            className="rounded-xl border border-ink-200 bg-white p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-ink-100 p-3">
                  <FileText className="h-6 w-6 text-ink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink-900">{report.name}</h3>
                  <div className="mt-2 flex items-center gap-4 text-sm text-ink-600">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {report.date}
                    </span>
                    <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                      {report.type}
                    </span>
                  </div>
                </div>
              </div>
              <button className="rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-all">
                <Download className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Report Schedule */}
      <motion.div variants={item} className="rounded-xl border border-ink-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-ink-900">Scheduled Reports</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-ink-100 bg-ink-50 p-4">
            <div>
              <p className="font-medium text-ink-900">Monthly Report</p>
              <p className="text-sm text-ink-600">Every 1st of the month</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="peer relative h-6 w-11 rounded-full bg-ink-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white" />
            </label>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-ink-100 bg-ink-50 p-4">
            <div>
              <p className="font-medium text-ink-900">Quarterly Report</p>
              <p className="text-sm text-ink-600">Every 3rd month</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="peer relative h-6 w-11 rounded-full bg-ink-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white" />
            </label>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
