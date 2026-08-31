import { useState } from "react";
import { motion } from "framer-motion";

const NOTIFICATION_TYPES = [
  { id: "rent-due", label: "Rent Due", description: "Receive notifications when rent is due" },
  { id: "overdue", label: "Overdue", description: "Get alerted when rent is overdue" },
  { id: "maintenance", label: "Maintenance", description: "Maintenance requests and updates" },
  { id: "vacant-beds", label: "Vacant Beds", description: "Notifications about vacant rooms" },
  { id: "reports", label: "Reports", description: "Periodic reports and analytics" },
  { id: "system-alerts", label: "System Alerts", description: "Important system notifications" },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(
    NOTIFICATION_TYPES.reduce(
      (acc, notif) => {
        acc[notif.id] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  const handleToggle = (id: string) => {
    setNotifications((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink-900">Notifications</h1>
        <p className="mt-2 text-ink-600">Control what notifications you receive</p>
      </div>

      {/* Notifications Grid */}
      <div className="grid gap-4">
        {NOTIFICATION_TYPES.map((notif, index) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between rounded-xl border border-ink-200 bg-white p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-ink-900">{notif.label}</h3>
              <p className="mt-1 text-xs text-ink-600">{notif.description}</p>
            </div>
            <label className="flex items-center cursor-pointer ml-4 flex-shrink-0">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={notifications[notif.id]}
                  onChange={() => handleToggle(notif.id)}
                  className="sr-only"
                />
                <div
                  className={`h-6 w-11 rounded-full border-2 transition-colors ${
                    notifications[notif.id]
                      ? "bg-primary-600 border-primary-600"
                      : "bg-white border-ink-300"
                  }`}
                />
                <motion.div
                  animate={{
                    x: notifications[notif.id] ? 20 : 2,
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white"
                />
              </div>
            </label>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-ink-200 bg-ink-50 p-6"
      >
        <p className="text-sm text-ink-700">
          <span className="font-semibold">
            {Object.values(notifications).filter(Boolean).length}
          </span>{" "}
          out of <span className="font-semibold">{NOTIFICATION_TYPES.length}</span> notification
          types are enabled.
        </p>
      </motion.div>
    </div>
  );
}
