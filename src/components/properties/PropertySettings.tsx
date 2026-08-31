import { motion } from "framer-motion";
import { Settings, Bell, Shield, Trash2 } from "lucide-react";

export default function PropertySettings({ propertyId }: { propertyId?: string }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* General Settings */}
      <motion.div variants={item} className="rounded-xl border border-ink-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <Settings className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-bold text-ink-900">General Settings</h3>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-2">
              Property Description
            </label>
            <textarea
              defaultValue="Premium co-living space with modern amenities"
              className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 transition-all hover:border-ink-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-900 mb-2">
              Default Monthly Rate per Bed
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-ink-600 font-medium">₹</span>
              <input
                type="number"
                defaultValue="10000"
                className="w-full rounded-lg border border-ink-200 bg-white pl-8 pr-4 py-2.5 text-sm text-ink-900 transition-all hover:border-ink-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <button className="rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white transition-all hover:bg-primary-700 active:scale-95">
            Save Changes
          </button>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={item} className="rounded-xl border border-ink-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-bold text-ink-900">Notification Settings</h3>
        </div>

        <div className="space-y-4">
          {[
            { title: "Rent Reminders", description: "Get notified when rent is due" },
            { title: "Overdue Alerts", description: "Alert for overdue payments" },
            { title: "Maintenance Alerts", description: "Notifications about maintenance issues" },
            { title: "Occupancy Updates", description: "Updates on room vacancy" },
          ].map((notif, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-ink-100 bg-ink-50 p-4"
            >
              <div>
                <p className="font-medium text-ink-900">{notif.title}</p>
                <p className="text-sm text-ink-600">{notif.description}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="peer relative h-6 w-11 rounded-full bg-ink-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </label>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Security */}
      <motion.div variants={item} className="rounded-xl border border-ink-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-bold text-ink-900">Security & Privacy</h3>
        </div>

        <div className="space-y-4">
          <button className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-left font-medium text-ink-700 transition-all hover:bg-ink-50">
            Change Access Permissions
          </button>
          <button className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-left font-medium text-ink-700 transition-all hover:bg-ink-50">
            View Activity Log
          </button>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        variants={item}
        className="rounded-xl border-2 border-danger-200 bg-danger-50 p-6"
      >
        <div className="mb-6 flex items-center gap-3">
          <Trash2 className="h-5 w-5 text-danger-600" />
          <h3 className="text-lg font-bold text-danger-900">Danger Zone</h3>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-danger-800">
            Deleting this property is permanent and cannot be undone. All associated data will be
            permanently removed.
          </p>
          <button className="w-full rounded-lg border-2 border-danger-300 bg-white px-4 py-2.5 font-medium text-danger-700 transition-all hover:bg-danger-50 active:scale-95">
            Delete Property
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
