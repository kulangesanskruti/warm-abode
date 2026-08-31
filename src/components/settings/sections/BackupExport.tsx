import { motion } from "framer-motion";
import { Download, Upload, AlertCircle, CheckCircle } from "lucide-react";

export default function BackupExport() {
  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink-900">Backup & Export</h1>
        <p className="mt-2 text-ink-600">Backup your data and export records</p>
      </div>

      {/* Last Backup */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-success-200 bg-success-50 p-6"
      >
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-success-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-success-900">Last Backup</p>
            <p className="text-sm text-success-800 mt-1">Today at 02:30 AM</p>
          </div>
        </div>
      </motion.div>

      {/* Export All Data */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900 flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export All Data
        </h3>
        <p className="text-sm text-ink-600">
          Download all your data in CSV format. This includes properties, rooms, tenants, and
          financial records.
        </p>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
            <Download className="h-4 w-4" />
            Export All Data
          </button>
          <button className="rounded-lg border border-ink-200 bg-white px-6 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors">
            Schedule Export
          </button>
        </div>
      </motion.div>

      {/* Download Backup */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900 flex items-center gap-2">
          <Download className="h-5 w-5" />
          Download Backup
        </h3>
        <p className="text-sm text-ink-600">
          Download a complete backup of your StayHub account. This includes all settings,
          configurations, and data.
        </p>
        <div className="space-y-2">
          {[
            { date: "Today", size: "24 MB", time: "02:30 AM" },
            { date: "Yesterday", size: "24 MB", time: "02:25 AM" },
            { date: "2 days ago", size: "24 MB", time: "02:20 AM" },
          ].map((backup, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-ink-200 p-3 hover:bg-ink-50 transition-colors"
            >
              <div className="text-sm">
                <p className="font-medium text-ink-900">{backup.date}</p>
                <p className="text-xs text-ink-600 mt-1">{backup.time}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs text-ink-600">{backup.size}</p>
                <button className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 transition-colors flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Restore Backup */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-warning-200 bg-warning-50 p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-warning-900 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Restore Backup
        </h3>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-warning-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-warning-800">
            Restoring a backup will overwrite your current data. Make sure you have a backup of your
            current data before proceeding.
          </p>
        </div>

        <div className="rounded-lg border-2 border-dashed border-warning-300 bg-white p-6">
          <div className="text-center">
            <Upload className="h-8 w-8 text-warning-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-ink-900">Choose a backup file to restore</p>
            <p className="text-xs text-ink-600 mt-1">or drag and drop your backup file here</p>
            <button className="mt-4 rounded-lg bg-warning-600 px-4 py-2 text-sm font-medium text-white hover:bg-warning-700 transition-colors">
              Select File
            </button>
          </div>
        </div>
      </motion.div>

      {/* Auto-Backup Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Automatic Backups</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink-900">Enable Auto-Backup</p>
            <p className="text-xs text-ink-600 mt-1">Automatically backup your data daily</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={true}
              className="h-5 w-5 rounded border-ink-300 text-primary-600"
            />
          </label>
        </div>

        <div className="border-t border-ink-200 pt-4">
          <label className="block text-sm font-medium text-ink-700 mb-2">Backup Frequency</label>
          <select className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100">
            <option>Daily (at 2:30 AM)</option>
            <option>Weekly (Every Monday)</option>
            <option>Monthly (1st of month)</option>
          </select>
        </div>

        <div className="border-t border-ink-200 pt-4">
          <label className="block text-sm font-medium text-ink-700 mb-2">Backup Retention</label>
          <select className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100">
            <option>Keep 1 month backups</option>
            <option>Keep 3 months backups</option>
            <option>Keep 6 months backups</option>
            <option>Keep 1 year backups</option>
          </select>
        </div>
      </motion.div>

      {/* Data Deletion Warning */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-danger-200 bg-danger-50 p-6"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-danger-900">Data Deletion</p>
            <p className="text-sm text-danger-800 mt-1">
              If you delete your account, all your data will be permanently deleted after 30 days.
              You cannot undo this action.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
