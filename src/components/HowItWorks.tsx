import { motion } from "framer-motion";
import { Building2, DoorOpen, BedDouble, UserPlus, Wallet, FileBarChart } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

const steps = [
  {
    icon: Building2,
    title: "Create Property",
    description: "Add your PG or rental property in seconds.",
  },
  { icon: DoorOpen, title: "Add Rooms", description: "Set up rooms with capacity and pricing." },
  {
    icon: BedDouble,
    title: "Assign Beds",
    description: "Configure shared and individual beds visually.",
  },
  {
    icon: UserPlus,
    title: "Add Tenants",
    description: "Onboard tenants with details and lease terms.",
  },
  {
    icon: Wallet,
    title: "Collect Rent",
    description: "Track payments and send reminders automatically.",
  },
  {
    icon: FileBarChart,
    title: "Generate Reports",
    description: "Export PDF reports for income and occupancy.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-ink-50/60 to-white" />
      <div className="container-px">
        <SectionHeading
          eyebrow="How It Works"
          title={<>From Setup to Rent Collection in Minutes</>}
          description="A simple, guided flow that takes you from empty property to full rent collection — no training needed."
        />

        <div className="relative mt-16">
          {/* connecting line */}
          <div className="pointer-events-none absolute left-0 right-0 top-9 hidden h-0.5 bg-gradient-to-r from-primary-200 via-primary-300 to-success-200 lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="relative z-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-primary-100 bg-white shadow-card">
                    <Icon className="h-7 w-7 text-primary-600" />
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white shadow-glow">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-ink-900">{s.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{s.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
