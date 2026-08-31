import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sun, Moon, Monitor } from "lucide-react";

export default function Appearance() {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    theme: "system",
    primaryColor: "blue",
    fontSize: "normal",
    compactMode: false,
  });

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

  const THEMES = [
    { id: "light", name: "Light", icon: Sun },
    { id: "dark", name: "Dark", icon: Moon },
    { id: "system", name: "System", icon: Monitor },
  ];

  const COLORS = [
    { name: "Blue", value: "blue", color: "bg-blue-600" },
    { name: "Purple", value: "purple", color: "bg-purple-600" },
    { name: "Green", value: "green", color: "bg-green-600" },
    { name: "Red", value: "red", color: "bg-red-600" },
    { name: "Orange", value: "orange", color: "bg-orange-600" },
    { name: "Indigo", value: "indigo", color: "bg-indigo-600" },
  ];

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink-900">Appearance</h1>
        <p className="mt-2 text-ink-600">Customize the look and feel of your dashboard</p>
      </div>

      {/* Theme Selection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          {THEMES.map((theme) => {
            const Icon = theme.icon;
            const isActive = formData.theme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => setFormData((prev) => ({ ...prev, theme: theme.id }))}
                className={`rounded-lg border-2 p-6 flex flex-col items-center gap-3 transition-all ${
                  isActive
                    ? "border-primary-600 bg-primary-50"
                    : "border-ink-200 bg-white hover:border-ink-300"
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? "text-primary-600" : "text-ink-600"}`} />
                <span
                  className={`text-sm font-medium ${isActive ? "text-primary-700" : "text-ink-900"}`}
                >
                  {theme.name}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Primary Color */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Primary Color</h3>
        <div className="grid grid-cols-6 gap-3">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setFormData((prev) => ({ ...prev, primaryColor: color.value }))}
              className={`rounded-lg border-2 p-4 transition-all ${
                formData.primaryColor === color.value
                  ? "border-ink-900"
                  : "border-ink-200 hover:border-ink-300"
              }`}
            >
              <div className={`h-12 w-full rounded ${color.color} mb-2`} />
              <p className="text-xs font-medium text-ink-700 text-center">{color.name}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Font Size */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Font Size</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "small", label: "Small", preview: "text-sm" },
            { value: "normal", label: "Normal", preview: "text-base" },
            { value: "large", label: "Large", preview: "text-lg" },
          ].map((size) => (
            <button
              key={size.value}
              onClick={() => setFormData((prev) => ({ ...prev, fontSize: size.value }))}
              className={`rounded-lg border-2 p-4 transition-all ${
                formData.fontSize === size.value
                  ? "border-primary-600 bg-primary-50"
                  : "border-ink-200 bg-white hover:border-ink-300"
              }`}
            >
              <p
                className={`${size.preview} font-medium ${
                  formData.fontSize === size.value ? "text-primary-700" : "text-ink-900"
                }`}
              >
                {size.label}
              </p>
              <p
                className={`text-xs ${formData.fontSize === size.value ? "text-primary-600" : "text-ink-600"} mt-2`}
              >
                Preview text
              </p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Compact Mode */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-ink-200 bg-white p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink-900">Compact Mode</h3>
            <p className="text-xs text-ink-600 mt-1">
              Reduce spacing and make the interface more compact
            </p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="compactMode"
              checked={formData.compactMode}
              onChange={handleChange}
              className="h-5 w-5 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>
      </motion.div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-ink-200 bg-white p-6"
      >
        <h3 className="text-lg font-semibold text-ink-900 mb-4">Preview</h3>
        <div className="rounded-lg border border-ink-200 bg-ink-50 p-6">
          <div className="space-y-4">
            <div className="h-10 w-full rounded-lg bg-blue-600" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded bg-ink-300" />
              <div className="h-4 w-1/2 rounded bg-ink-300" />
            </div>
          </div>
          <p className="text-center text-sm text-ink-600 mt-6">
            Your dashboard preview will appear here
          </p>
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
          Reset to Default
        </button>
      </motion.div>
    </div>
  );
}
