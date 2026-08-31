import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Upload } from "lucide-react";

export default function PDFReports() {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    logo: "Included",
    footer: "StayHub © 2024",
    signature: "Not Set",
    watermark: "Disabled",
    paperSize: "A4",
    colorTheme: "blue",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink-900">PDF & Reports</h1>
        <p className="mt-2 text-ink-600">Customize PDF report generation</p>
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Logo</h3>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-white">S</span>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100">
            <Upload className="h-4 w-4" />
            Update Logo
          </button>
        </div>
      </motion.div>

      {/* Footer & Signature */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-6"
      >
        <h3 className="text-lg font-semibold text-ink-900">Footer & Signature</h3>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">Footer Text</label>
          <textarea
            name="footer"
            value={formData.footer}
            onChange={(e) => setFormData((prev) => ({ ...prev, footer: e.target.value }))}
            className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 placeholder-ink-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
            rows={2}
          />
          <p className="mt-1 text-xs text-ink-500">
            This text will appear at the bottom of each page
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">Digital Signature</label>
          <div className="flex items-center justify-between rounded-lg border-2 border-dashed border-ink-200 bg-ink-50 p-6">
            <div>
              <p className="text-sm font-medium text-ink-900">No signature uploaded</p>
              <p className="text-xs text-ink-600 mt-1">
                Upload your digital signature to include in PDFs
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
              <Upload className="h-4 w-4" />
              Upload
            </button>
          </div>
        </div>
      </motion.div>

      {/* Watermark & Paper */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-6"
      >
        <h3 className="text-lg font-semibold text-ink-900">Document Settings</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Watermark</label>
            <select
              name="watermark"
              value={formData.watermark}
              onChange={handleChange}
              className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option>Disabled</option>
              <option>Original</option>
              <option>Copy</option>
              <option>Draft</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Paper Size</label>
            <select
              name="paperSize"
              value={formData.paperSize}
              onChange={handleChange}
              className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option>A4</option>
              <option>Letter</option>
              <option>Legal</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Color Theme */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Color Theme</h3>
        <div className="grid grid-cols-5 gap-3">
          {[
            { name: "Blue", color: "bg-blue-600" },
            { name: "Green", color: "bg-green-600" },
            { name: "Purple", color: "bg-purple-600" },
            { name: "Red", color: "bg-red-600" },
            { name: "Gray", color: "bg-gray-600" },
          ].map((theme) => (
            <button
              key={theme.name}
              onClick={() =>
                setFormData((prev) => ({ ...prev, colorTheme: theme.name.toLowerCase() }))
              }
              className={`rounded-lg border-2 p-4 transition-all ${
                formData.colorTheme === theme.name.toLowerCase()
                  ? "border-ink-900"
                  : "border-ink-200 hover:border-ink-300"
              }`}
            >
              <div className={`h-12 w-full rounded ${theme.color} mb-2`} />
              <p className="text-xs font-medium text-ink-700">{theme.name}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-all ${
            saveSuccess
              ? "bg-success-600 hover:bg-success-700"
              : "bg-primary-600 hover:bg-primary-700"
          }`}
        >
          {saveSuccess ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            "Save Changes"
          )}
        </button>
        <button className="rounded-lg border border-ink-200 bg-white px-6 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50">
          Cancel
        </button>
      </motion.div>
    </div>
  );
}
