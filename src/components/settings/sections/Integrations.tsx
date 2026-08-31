import { motion } from "framer-motion";
import { Check, AlertCircle, Clock, Zap } from "lucide-react";

const INTEGRATIONS = [
  {
    name: "WhatsApp API",
    description: "Send notifications and reminders via WhatsApp",
    status: "connected",
    icon: "💬",
  },
  {
    name: "Google Drive Backup",
    description: "Automatic backups to Google Drive",
    status: "connected",
    icon: "🔄",
  },
  {
    name: "Google Calendar",
    description: "Sync events with Google Calendar",
    status: "not-connected",
    icon: "📅",
  },
  {
    name: "Email Service",
    description: "Send invoices and reports via email",
    status: "connected",
    icon: "📧",
  },
  {
    name: "Payment Gateway",
    description: "Accept online payments from tenants",
    status: "coming-soon",
    icon: "💳",
  },
  {
    name: "Accounting Software",
    description: "Sync with QuickBooks or similar",
    status: "coming-soon",
    icon: "📊",
  },
];

export default function Integrations() {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "connected":
        return {
          label: "Connected",
          color: "bg-success-100 text-success-700 border-success-200",
          icon: Check,
        };
      case "not-connected":
        return {
          label: "Not Connected",
          color: "bg-warning-100 text-warning-700 border-warning-200",
          icon: AlertCircle,
        };
      case "coming-soon":
        return {
          label: "Coming Soon",
          color: "bg-ink-100 text-ink-700 border-ink-200",
          icon: Clock,
        };
      default:
        return {
          label: "Unknown",
          color: "bg-ink-100 text-ink-700 border-ink-200",
          icon: AlertCircle,
        };
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink-900">Integrations</h1>
        <p className="mt-2 text-ink-600">Connect third-party services to enhance StayHub</p>
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-4">
        {INTEGRATIONS.map((integration, idx) => {
          const statusInfo = getStatusInfo(integration.status);
          const StatusIcon = statusInfo.icon;

          return (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border border-ink-200 bg-white p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-3xl">{integration.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-ink-900">{integration.name}</h3>
                    <p className="text-sm text-ink-600 mt-1">{integration.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${statusInfo.color}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {statusInfo.label}
                  </div>

                  {integration.status === "connected" && (
                    <button className="rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors">
                      Manage
                    </button>
                  )}
                  {integration.status === "not-connected" && (
                    <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
                      Connect
                    </button>
                  )}
                  {integration.status === "coming-soon" && (
                    <button
                      disabled
                      className="rounded-lg border border-ink-200 bg-ink-50 px-4 py-2 text-sm font-medium text-ink-500 cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-primary-200 bg-primary-50 p-6"
      >
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-primary-900">Pro Tip</p>
            <p className="text-sm text-primary-800 mt-1">
              Enabling integrations can automate your workflow and save you time. Don&apos;t
              hesitate to explore our available integrations!
            </p>
          </div>
        </div>
      </motion.div>

      {/* API Documentation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-xl border border-ink-200 bg-white p-6"
      >
        <h3 className="text-lg font-semibold text-ink-900 mb-3">Developer API</h3>
        <p className="text-sm text-ink-600 mb-4">
          Want to build your own integration? Check out our API documentation for developers.
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          View API Documentation →
        </a>
      </motion.div>
    </div>
  );
}
