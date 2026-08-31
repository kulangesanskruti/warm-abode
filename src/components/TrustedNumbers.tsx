import { motion } from "framer-motion";
import { Building2, BedDouble, Smartphone } from "lucide-react";

const capabilities = [
  {
    icon: Building2,
    title: "Unlimited Properties",
    description: "Manage as many properties as you need — all from one organized dashboard.",
    tone: "primary",
  },
  {
    icon: BedDouble,
    title: "Shared Room Support",
    description: "Bed-level occupancy and multiple tenants per room, handled natively.",
    tone: "success",
  },
  {
    icon: Smartphone,
    title: "Access Anywhere",
    description: "Works beautifully on desktop, tablet and mobile — wherever you are.",
    tone: "warning",
  },
];

export default function TrustedNumbers() {
  return (
    <section className="relative py-14 sm:py-20">
      <div className="container-px">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {capabilities.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden rounded-2xl border border-ink-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-200 hover:shadow-glow"
              >
                <div
                  className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-${c.tone}-50 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${c.tone}-50 text-${c.tone}-600 transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-ink-900">{c.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-500">{c.description}</p>
                <div
                  className={`mt-5 h-0.5 w-10 origin-left rounded-full bg-${c.tone}-500 transition-all duration-300 group-hover:w-16`}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
