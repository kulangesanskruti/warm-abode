import { motion } from "framer-motion";
import {
  ChartBar as BarChart3,
  ChartLine as LineChart,
  Gauge,
  ChartPie as PieChart,
  TrendingUp,
  Clock,
} from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import {
  analyticsCards,
  analyticsToneMap,
  weeklyMessageData,
  deliveryTrendData,
  templateUsageData,
} from "./whatsappData";

const panel = "rounded-2xl border border-ink-100 bg-white p-6 shadow-card";

function PanelHead({
  icon: Icon,
  title,
  sub,
}: {
  icon: typeof BarChart3;
  title: string;
  sub: string;
}) {
  return (
    <header className="min-w-0">
      <h3 className="flex items-center gap-2 text-sm font-extrabold text-ink-900">
        <Icon className="h-4 w-4 text-primary-600" /> {title}
      </h3>
      <p className="mt-0.5 text-xs text-ink-500">{sub}</p>
    </header>
  );
}

function WeeklyChart() {
  const max = Math.max(...weeklyMessageData.map((d) => d.sent));
  return (
    <section className={panel}>
      <PanelHead icon={BarChart3} title="Messages Sent" sub="Daily message volume this week." />
      <div className="mt-6 flex h-48 items-end gap-3 sm:gap-5">
        {weeklyMessageData.map((d, i) => (
          <div key={d.day} className="group flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="relative flex h-full w-full items-end justify-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.sent / max) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.06 }}
                className="relative w-1/2 rounded-t-lg bg-gradient-to-t from-primary-700 to-primary-400 shadow-float"
              />
              <div className="pointer-events-none absolute -top-2 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl bg-ink-900 px-3 py-2 text-[11px] font-semibold text-white shadow-card group-hover:block">
                {d.sent} sent · {d.delivered} delivered
              </div>
            </div>
            <span className="text-xs font-semibold text-ink-500">{d.day}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DeliveryTrend() {
  const max = Math.max(...deliveryTrendData.map((d) => d.rate));
  const min = Math.min(...deliveryTrendData.map((d) => d.rate));
  const span = Math.max(1, max - min);
  const points = deliveryTrendData.map((d, i) => {
    const x = (i / (deliveryTrendData.length - 1)) * 100;
    const y = 100 - ((d.rate - min) / span) * 78 - 11;
    return `${x},${y}`;
  });

  return (
    <section className={panel}>
      <PanelHead icon={LineChart} title="Delivery Rate Trend" sub="Weekly delivery success rate." />
      <div className="relative mt-6 h-40">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <motion.polyline
            points={points.join(" ")}
            fill="none"
            stroke="currentColor"
            className="text-success-600"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.3, ease: "easeOut" }}
          />
        </svg>
      </div>
      <div className="mt-3 flex justify-between text-xs font-semibold text-ink-500">
        {deliveryTrendData.map((d) => (
          <span key={d.week} className="flex flex-col items-center gap-0.5">
            <span className="text-ink-900">{d.rate}%</span>
            {d.week}
          </span>
        ))}
      </div>
    </section>
  );
}

function TemplateUsage() {
  const max = Math.max(...templateUsageData.map((d) => d.uses));
  return (
    <section className={panel}>
      <PanelHead icon={PieChart} title="Template Usage" sub="Most used message templates." />
      <div className="mt-6 space-y-3">
        {templateUsageData.map((d, i) => (
          <div key={d.name}>
            <div className="flex items-center justify-between text-xs font-bold text-ink-600">
              <span>{d.name}</span>
              <span className="text-ink-900">{d.uses} uses</span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ink-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(d.uses / max) * 100}%` }}
                transition={{ duration: 1, delay: 0.1 + i * 0.06, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PeakTime() {
  return (
    <section className={panel}>
      <PanelHead icon={Clock} title="Peak Communication Time" sub="When tenants respond most." />
      <div className="mt-6 flex h-40 items-end gap-2">
        {[20, 35, 45, 60, 75, 90, 85, 70, 55, 40, 30, 25].map((h, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.7, delay: i * 0.04 }}
              className={`w-full rounded-t-md ${i === 5 ? "bg-gradient-to-t from-warning-600 to-warning-400" : "bg-ink-200"}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-semibold text-ink-400">
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>12 AM</span>
      </div>
    </section>
  );
}

export default function MessageAnalytics() {
  return (
    <section>
      <div className="min-w-0">
        <h2 className="text-base font-extrabold text-ink-900">Message Analytics</h2>
        <p className="mt-0.5 text-sm text-ink-500">
          Track delivery, engagement and communication patterns.
        </p>
      </div>

      {/* Stat cards */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {analyticsCards.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${analyticsToneMap[c.tone]}`}
            >
              {c.id === 1 && <BarChart3 className="h-5 w-5" />}
              {c.id === 2 && <Gauge className="h-5 w-5" />}
              {c.id === 3 && <TrendingUp className="h-5 w-5" />}
              {c.id === 4 && <PieChart className="h-5 w-5" />}
              {c.id === 5 && <PieChart className="h-5 w-5" />}
              {c.id === 6 && <Clock className="h-5 w-5" />}
            </span>
            <p className="mt-4 text-sm font-medium text-ink-500">{c.label}</p>
            <p className="mt-1 text-xl font-extrabold tracking-tight text-ink-900">
              {c.isText ? (
                c.textValue
              ) : (
                <AnimatedCounter to={c.value} prefix={c.prefix} suffix={c.suffix} />
              )}
            </p>
            <p className="mt-0.5 text-xs font-medium text-ink-500">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <WeeklyChart />
        <DeliveryTrend />
        <TemplateUsage />
        <PeakTime />
      </div>
    </section>
  );
}
