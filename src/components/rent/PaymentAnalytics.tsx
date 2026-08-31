import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Gauge, LineChart, Scale } from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

interface Props {
  average: number;
  highest: number;
  lowest: number;
  expected: number;
  efficiency: number;
}

export default function PaymentAnalytics({
  average,
  highest,
  lowest,
  expected,
  efficiency,
}: Props) {
  const cards = [
    {
      label: "Average Rent",
      value: average,
      prefix: "₹",
      icon: Scale,
      tone: "text-primary-600 bg-primary-50",
    },
    {
      label: "Highest Rent",
      value: highest,
      prefix: "₹",
      icon: ArrowUpRight,
      tone: "text-success-600 bg-success-50",
    },
    {
      label: "Lowest Rent",
      value: lowest,
      prefix: "₹",
      icon: ArrowDownRight,
      tone: "text-warning-600 bg-warning-50",
    },
    {
      label: "Expected Monthly Revenue",
      value: expected,
      prefix: "₹",
      icon: LineChart,
      tone: "text-primary-600 bg-primary-50",
    },
    {
      label: "Collection Efficiency",
      value: efficiency,
      suffix: "%",
      icon: Gauge,
      tone: "text-success-600 bg-success-50",
    },
  ];

  return (
    <section>
      <h2 className="text-base font-extrabold text-ink-900">Payment Analytics</h2>
      <p className="mt-0.5 text-sm text-ink-500">How your rent roll is performing this month.</p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.tone}`}>
              <c.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-medium text-ink-500">{c.label}</p>
            <p className="mt-1 text-xl font-extrabold tracking-tight text-ink-900">
              <AnimatedCounter to={c.value} prefix={c.prefix ?? ""} suffix={c.suffix ?? ""} />
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
