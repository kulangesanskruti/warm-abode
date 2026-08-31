import { motion } from "framer-motion";
import { FileText, Table2, Printer, MessageCircle, X, Check, Sparkles } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

const traditional = [
  {
    icon: FileText,
    title: "Paper Registers",
    desc: "Hand-written ledgers that get lost and damaged.",
  },
  { icon: Table2, title: "Excel Sheets", desc: "Manual updates prone to errors and version mess." },
  { icon: Printer, title: "Manual PDFs", desc: "Hours spent formatting reports every month." },
  {
    icon: MessageCircle,
    title: "Manual WhatsApp",
    desc: "Individually messaging each tenant for rent.",
  },
];

const stayhub = [
  {
    icon: FileText,
    title: "Automatic Reports",
    desc: "One-click PDFs for income, occupancy and tenants.",
  },
  {
    icon: MessageCircle,
    title: "One-Click Reminders",
    desc: "Automated WhatsApp reminders to all tenants.",
  },
  { icon: Table2, title: "Real-Time Dashboard", desc: "Live numbers for every property and bed." },
  { icon: Sparkles, title: "Bed Management", desc: "Visual bed map with occupancy and sharing." },
];

export default function WhyStayHub() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="container-px">
        <SectionHeading
          eyebrow="Why StayHub"
          title={<>Stop Managing on Paper. Start Scaling.</>}
          description="The old way eats your evenings. StayHub gives those hours back."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Traditional */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-ink-100 bg-ink-50/50 p-6 sm:p-8"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-100 text-ink-400">
                <X className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-bold text-ink-600">Traditional Management</h3>
            </div>
            <div className="mt-6 space-y-3">
              {traditional.map((t, i) => {
                const Icon = t.icon;
                return (
                  <motion.div
                    key={t.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 opacity-80"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-400">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink-700">{t.title}</p>
                      <p className="mt-0.5 text-xs text-ink-400">{t.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* StayHub */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-primary-200 bg-gradient-to-br from-primary-50/80 via-white to-success-50/50 p-6 shadow-glow sm:p-8"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-200/40 blur-3xl" />
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-glow">
                <Check className="h-5 w-5" strokeWidth={3} />
              </span>
              <h3 className="text-lg font-bold text-ink-900">With StayHub</h3>
            </div>
            <div className="mt-6 space-y-3">
              {stayhub.map((t, i) => {
                const Icon = t.icon;
                return (
                  <motion.div
                    key={t.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="group flex items-start gap-3 rounded-2xl border border-white bg-white/80 p-4 shadow-soft backdrop-blur transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{t.title}</p>
                      <p className="mt-0.5 text-xs text-ink-500">{t.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
