import { motion } from "framer-motion";
import { ExternalLink, Info, MessageCircle } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink-900">About StayHub</h1>
        <p className="mt-2 text-ink-600">Learn about StayHub and get support</p>
      </div>

      {/* Version Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Version Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-ink-600 uppercase tracking-wide">Current Version</p>
            <p className="text-2xl font-bold text-ink-900 mt-2">2.4.1</p>
          </div>
          <div>
            <p className="text-xs text-ink-600 uppercase tracking-wide">Last Updated</p>
            <p className="text-sm font-medium text-ink-900 mt-2">15 August 2024</p>
          </div>
        </div>

        <div className="border-t border-ink-200 pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-600">You are running the latest version of StayHub</p>
            <span className="text-xs font-medium text-success-600 bg-success-100 px-2 py-1 rounded-full">
              ✓ Up to date
            </span>
          </div>
        </div>
      </motion.div>

      {/* Release Notes */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Release Notes</h3>
        <div className="space-y-4">
          {[
            {
              version: "v2.4.1",
              date: "15 August 2024",
              features: [
                "Improved WhatsApp notifications",
                "Enhanced PDF report generation",
                "Bug fixes and performance improvements",
              ],
            },
            {
              version: "v2.4.0",
              date: "1 August 2024",
              features: [
                "New Settings & Business Configuration module",
                "Advanced user permissions system",
                "Analytics dashboard improvements",
              ],
            },
            {
              version: "v2.3.5",
              date: "15 July 2024",
              features: [
                "Security enhancements",
                "Mobile app optimization",
                "Database performance upgrades",
              ],
            },
          ].map((release, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-ink-200 p-4 hover:bg-ink-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-ink-900">{release.version}</h4>
                <span className="text-xs text-ink-600">{release.date}</span>
              </div>
              <ul className="space-y-1">
                {release.features.map((feature, fidx) => (
                  <li key={fidx} className="text-xs text-ink-600 flex items-start gap-2">
                    <span className="text-primary-600 mt-1">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          View Full Release Notes
          <ExternalLink className="h-4 w-4" />
        </a>
      </motion.div>

      {/* Documentation & Help */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Documentation & Help</h3>
        <div className="space-y-3">
          {[
            { title: "Getting Started Guide", href: "#" },
            { title: "User Documentation", href: "#" },
            { title: "API Reference", href: "#" },
            { title: "FAQ", href: "#" },
            { title: "Video Tutorials", href: "#" },
          ].map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="flex items-center justify-between rounded-lg border border-ink-200 p-3 hover:bg-ink-50 transition-colors group"
            >
              <span className="text-sm font-medium text-ink-900">{item.title}</span>
              <ExternalLink className="h-4 w-4 text-ink-400 group-hover:text-ink-600" />
            </a>
          ))}
        </div>
      </motion.div>

      {/* Legal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Legal</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "Privacy Policy", href: "#" },
            { title: "Terms of Service", href: "#" },
            { title: "Cookie Policy", href: "#" },
            { title: "GDPR Compliance", href: "#" },
          ].map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {item.title} →
            </a>
          ))}
        </div>
      </motion.div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-primary-200 bg-primary-50 p-6"
      >
        <div className="flex items-start gap-3">
          <MessageCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-primary-900">Need Help?</h3>
            <p className="text-sm text-primary-800 mt-1">
              Our support team is ready to help. Contact us anytime for questions or issues.
            </p>
            <button className="mt-4 flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
              <MessageCircle className="h-4 w-4" />
              Contact Support
            </button>
          </div>
        </div>
      </motion.div>

      {/* Company Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">About StayHub</h3>
        <div className="space-y-3 text-sm text-ink-600">
          <p>
            StayHub is a modern, premium SaaS platform designed for PG owners and landlords to
            manage properties, rooms, tenants, and rent collection from one unified dashboard.
          </p>
          <p>
            Founded in 2023, StayHub helps thousands of property managers streamline their
            operations and grow their businesses.
          </p>
        </div>

        <div className="border-t border-ink-200 pt-4 space-y-2">
          <div>
            <p className="text-xs text-ink-600 uppercase tracking-wide">Company</p>
            <p className="text-sm font-medium text-ink-900">StayHub Inc.</p>
          </div>
          <div>
            <p className="text-xs text-ink-600 uppercase tracking-wide">Location</p>
            <p className="text-sm font-medium text-ink-900">Delhi, India</p>
          </div>
          <div>
            <p className="text-xs text-ink-600 uppercase tracking-wide">Email</p>
            <a
              href="mailto:support@stayhub.com"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              support@stayhub.com
            </a>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center text-xs text-ink-500 py-4"
      >
        <p>© 2024 StayHub. All rights reserved.</p>
      </motion.div>
    </div>
  );
}
