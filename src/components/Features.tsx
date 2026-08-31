import { motion } from "framer-motion";
import { BedDouble, Wallet, MessageCircle, FileText, Share2, LineChart } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

const features = [
  {
    icon: BedDouble,
    title: "Bed Management",
    description:
      "Manage every room and bed visually. Track occupancy, vacancies and shared beds at a glance.",
    tone: "primary",
  },
  {
    icon: Wallet,
    title: "Rent Collection",
    description:
      "Track every payment effortlessly. Know who paid, who is pending and never miss a due date.",
    tone: "success",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Reminders",
    description:
      "Notify tenants instantly with automated WhatsApp rent reminders. No more awkward follow-ups.",
    tone: "warning",
  },
  {
    icon: FileText,
    title: "PDF Reports",
    description:
      "Generate professional reports automatically. Income summaries, occupancy and tenant lists in one click.",
    tone: "primary",
  },
  {
    icon: Share2,
    title: "Room Sharing",
    description:
      "Share room availability easily with prospective tenants through a simple, clean link.",
    tone: "success",
  },
  {
    icon: LineChart,
    title: "Smart Analytics",
    description:
      "Monitor occupancy and income with beautiful dashboards that make your numbers make sense.",
    tone: "warning",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="container-px">
        <SectionHeading
          eyebrow="Features"
          title={<>Everything You Need To Run Your PG</>}
          description="A complete toolkit designed for the realities of running a PG or rental business — from beds to reports."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-ink-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-2 hover:border-primary-200 hover:shadow-glow"
              >
                <div
                  className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-${f.tone}-50 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />
                <div
                  className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-inset ring-primary-200/60 transition-opacity duration-300 group-hover:opacity-100`}
                />
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${f.tone}-50 text-${f.tone}-600 transition-all duration-300 group-hover:scale-110 group-hover:shadow-soft`}
                >
                  <Icon
                    className="h-6 w-6 transition-transform duration-300 group-hover:-rotate-3"
                    strokeWidth={2}
                  />
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-ink-900">{f.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-500">{f.description}</p>
                <div
                  className={`mt-5 h-0.5 w-10 origin-left scale-x-100 rounded-full bg-${f.tone}-500 transition-all duration-300 group-hover:w-16`}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
