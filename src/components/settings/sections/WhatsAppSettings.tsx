import { useState } from "react";
import { motion } from "framer-motion";
import { Check, AlertCircle, MessageCircle } from "lucide-react";

export default function WhatsAppSettings() {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    reminderTime: "48 hours before due date",
    automaticReminders: true,
    receiptSharing: true,
    roomAdvertisement: false,
    businessNumber: "+91 98765 43210",
    apiStatus: "connected",
  });

  const [messageTemplates] = useState([
    { id: 1, name: "Rent Due Reminder", preview: "Your rent is due on {{due_date}}" },
    { id: 2, name: "Overdue Notice", preview: "Your rent is now overdue. Please pay immediately" },
    { id: 3, name: "Receipt Sent", preview: "Your rent receipt for {{month}} has been sent" },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : (e.target as HTMLSelectElement).value,
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
        <h1 className="text-3xl font-bold text-ink-900">WhatsApp Settings</h1>
        <p className="mt-2 text-ink-600">Configure WhatsApp notifications and reminders</p>
      </div>

      {/* API Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border-2 p-6 ${
          formData.apiStatus === "connected"
            ? "border-success-200 bg-success-50"
            : "border-warning-200 bg-warning-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <MessageCircle
            className={`h-5 w-5 ${
              formData.apiStatus === "connected" ? "text-success-600" : "text-warning-600"
            }`}
          />
          <div>
            <p className="font-medium text-ink-900">
              {formData.apiStatus === "connected"
                ? "WhatsApp API Connected"
                : "WhatsApp API Not Connected"}
            </p>
            <p className="text-sm text-ink-600 mt-1">
              {formData.apiStatus === "connected"
                ? "Your WhatsApp integration is active"
                : "Connect your WhatsApp business account to enable notifications"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Business Number */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Business Number</h3>
        <input
          type="tel"
          name="businessNumber"
          value={formData.businessNumber}
          onChange={handleChange}
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 placeholder-ink-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </motion.div>

      {/* Reminders */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-6"
      >
        <h3 className="text-lg font-semibold text-ink-900">Reminder Settings</h3>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">Reminder Time</label>
          <select
            name="reminderTime"
            value={formData.reminderTime}
            onChange={handleChange}
            className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option>24 hours before due date</option>
            <option>48 hours before due date</option>
            <option>72 hours before due date</option>
            <option>On due date</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-ink-900">Automatic Reminders</label>
            <p className="text-xs text-ink-600 mt-1">Send automatic reminders before rent is due</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="automaticReminders"
              checked={formData.automaticReminders}
              onChange={handleChange}
              className="h-5 w-5 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>
      </motion.div>

      {/* Sharing Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-6"
      >
        <h3 className="text-lg font-semibold text-ink-900">Sharing</h3>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-ink-900">Receipt Sharing</label>
            <p className="text-xs text-ink-600 mt-1">Share rent receipts via WhatsApp</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="receiptSharing"
              checked={formData.receiptSharing}
              onChange={handleChange}
              className="h-5 w-5 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-ink-900">Room Advertisement Sharing</label>
            <p className="text-xs text-ink-600 mt-1">Share available rooms for advertisement</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="roomAdvertisement"
              checked={formData.roomAdvertisement}
              onChange={handleChange}
              className="h-5 w-5 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>
      </motion.div>

      {/* Message Templates */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Message Templates</h3>
        <div className="space-y-3">
          {messageTemplates.map((template) => (
            <div
              key={template.id}
              className="flex items-start justify-between rounded-lg bg-ink-50 p-4"
            >
              <div>
                <p className="text-sm font-medium text-ink-900">{template.name}</p>
                <p className="mt-1 text-xs text-ink-600">{template.preview}</p>
              </div>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Edit
              </button>
            </div>
          ))}
        </div>
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
