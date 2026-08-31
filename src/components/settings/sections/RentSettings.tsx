import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";

export default function RentSettings() {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    gracePeriod: "5",
    lateFeeType: "percentage",
    lateFeeAmount: "5",
    automaticDueDate: true,
    receiptFormat: "RENT-YYYY-MM-001",
    defaultPaymentMethod: "bank-transfer",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
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
        <h1 className="text-3xl font-bold text-ink-900">Rent Settings</h1>
        <p className="mt-2 text-ink-600">Configure rent collection and payment options</p>
      </div>

      {/* Grace Period */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Grace Period</h3>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Days of Grace Period
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              name="gracePeriod"
              value={formData.gracePeriod}
              onChange={handleChange}
              min="0"
              className="w-20 rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
            <span className="text-sm text-ink-600">days after due date</span>
          </div>
          <p className="mt-2 text-xs text-ink-500">Rent is considered overdue after this period</p>
        </div>
      </motion.div>

      {/* Late Fee Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Late Fee</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Fee Type</label>
            <select
              name="lateFeeType"
              value={formData.lateFeeType}
              onChange={handleChange}
              className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Fee Amount</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="lateFeeAmount"
                value={formData.lateFeeAmount}
                onChange={handleChange}
                min="0"
                className="flex-1 rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              <span className="text-sm font-medium text-ink-600">
                {formData.lateFeeType === "percentage" ? "%" : "₹"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Automatic Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning-600" />
              Automatic Due Date
            </h3>
            <p className="mt-1 text-sm text-ink-600">
              Automatically generate due dates for new tenants
            </p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="automaticDueDate"
              checked={formData.automaticDueDate}
              onChange={handleChange}
              className="h-5 w-5 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>
      </motion.div>

      {/* Receipt Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Receipt Number Format</h3>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">Format Pattern</label>
          <input
            type="text"
            name="receiptFormat"
            value={formData.receiptFormat}
            onChange={handleChange}
            placeholder="RENT-YYYY-MM-001"
            className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 placeholder-ink-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
          <p className="mt-2 text-xs text-ink-500">Use YYYY, MM, DD for date placeholders</p>
        </div>
      </motion.div>

      {/* Payment Method */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Default Payment Method</h3>
        <select
          name="defaultPaymentMethod"
          value={formData.defaultPaymentMethod}
          onChange={handleChange}
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        >
          <option value="bank-transfer">Bank Transfer</option>
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="cheque">Cheque</option>
        </select>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
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
