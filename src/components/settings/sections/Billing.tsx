import { motion } from "framer-motion";
import { Check, CreditCard, Download } from "lucide-react";

export default function Billing() {
  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink-900">Billing & Plans</h1>
        <p className="mt-2 text-ink-600">Manage your subscription and billing</p>
      </div>

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border-2 border-primary-200 bg-gradient-to-r from-primary-50 to-primary-50 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-primary-900">Professional Plan</h3>
            <p className="text-primary-700 mt-2">
              <span className="text-3xl font-bold">₹999</span>
              <span className="text-lg">/month</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-primary-800">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Unlimited Properties
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Advanced Reports
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                WhatsApp Integration
              </li>
            </ul>
          </div>
          <div className="text-right">
            <div className="inline-block rounded-lg bg-success-100 px-4 py-2 text-sm font-medium text-success-700">
              Active
            </div>
            <p className="text-xs text-primary-700 mt-4">Next renewal:</p>
            <p className="text-sm font-semibold text-primary-900">15 September 2024</p>
            <button className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
              Upgrade Plan
            </button>
          </div>
        </div>
      </motion.div>

      {/* Billing Information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-6"
      >
        <h3 className="text-lg font-semibold text-ink-900">Billing Information</h3>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-ink-600 uppercase tracking-wide">Billing Name</p>
            <p className="text-sm font-medium text-ink-900 mt-1">StayHub Properties</p>
          </div>
          <div>
            <p className="text-xs text-ink-600 uppercase tracking-wide">Email</p>
            <p className="text-sm font-medium text-ink-900 mt-1">billing@stayhub.com</p>
          </div>
          <div>
            <p className="text-xs text-ink-600 uppercase tracking-wide">Address</p>
            <p className="text-sm font-medium text-ink-900 mt-1">123 Business Street, Delhi</p>
          </div>
          <div>
            <p className="text-xs text-ink-600 uppercase tracking-wide">Tax ID</p>
            <p className="text-sm font-medium text-ink-900 mt-1">GST123456789</p>
          </div>
        </div>

        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          Edit Billing Information
        </button>
      </motion.div>

      {/* Payment Method */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Payment Method</h3>
        <div className="flex items-center justify-between rounded-lg border border-ink-200 bg-ink-50 p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-ink-600" />
            <div>
              <p className="text-sm font-medium text-ink-900">Visa ending in 4242</p>
              <p className="text-xs text-ink-600 mt-1">Expires 12/25</p>
            </div>
          </div>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Edit
          </button>
        </div>
        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          Add Payment Method
        </button>
      </motion.div>

      {/* Invoice History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Invoice History</h3>
        <div className="space-y-2">
          {[
            { date: "15 Aug 2024", amount: "₹999", status: "Paid" },
            { date: "15 Jul 2024", amount: "₹999", status: "Paid" },
            { date: "15 Jun 2024", amount: "₹999", status: "Paid" },
          ].map((invoice, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-ink-200 p-3 hover:bg-ink-50 transition-colors"
            >
              <div className="text-sm">
                <p className="font-medium text-ink-900">{invoice.date}</p>
                <p className="text-xs text-ink-600 mt-1">{invoice.amount}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    invoice.status === "Paid"
                      ? "bg-success-100 text-success-700"
                      : "bg-warning-100 text-warning-700"
                  }`}
                >
                  {invoice.status}
                </span>
                <button className="text-primary-600 hover:text-primary-700">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Plan Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-ink-200 bg-white p-6"
      >
        <h3 className="text-lg font-semibold text-ink-900 mb-4">Compare Plans</h3>
        <button className="rounded-lg border border-primary-600 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors">
          View All Plans
        </button>
      </motion.div>
    </div>
  );
}
