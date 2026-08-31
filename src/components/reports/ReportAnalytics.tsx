import { motion } from "framer-motion";
import { BarChart3, LineChart, Gauge, PieChart, Trophy, TrendingUp } from "lucide-react";
import { inr, monthlyRevenue, propertyPerformance } from "./reportsData";

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

function RevenueChart() {
  const max = Math.max(...monthlyRevenue.map((m) => m.expected));
  return (
    <section className={panel}>
      <PanelHead
        icon={BarChart3}
        title="Monthly Revenue"
        sub="Collected revenue against expected potential."
      />
      <div className="mt-6 flex h-52 items-end gap-3 sm:gap-5">
        {monthlyRevenue.map((m, i) => (
          <div key={m.month} className="group flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="relative flex h-full w-full items-end justify-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(m.expected / max) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.06 }}
                className="absolute bottom-0 w-full rounded-xl border border-dashed border-ink-200 bg-ink-50/60"
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(m.revenue / max) * 100}%` }}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.06, ease: "easeOut" }}
                className="relative w-1/2 rounded-t-lg bg-gradient-to-t from-primary-700 to-primary-400 shadow-float"
              />
              <div className="pointer-events-none absolute -top-2 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl bg-ink-900 px-3 py-2 text-[11px] font-semibold text-white shadow-card group-hover:block">
                {inr(m.revenue)} of {inr(m.expected)}
              </div>
            </div>
            <span className="text-xs font-semibold text-ink-500">{m.month}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TrendChart({
  title,
  sub,
  icon,
  values,
  suffix,
  stroke,
}: {
  title: string;
  sub: string;
  icon: typeof LineChart;
  values: { month: string; value: number }[];
  suffix: string;
  stroke: string;
}) {
  const max = Math.max(...values.map((v) => v.value));
  const min = Math.min(...values.map((v) => v.value));
  const span = Math.max(1, max - min);
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 100 - ((v.value - min) / span) * 78 - 11;
    return `${x},${y}`;
  });

  return (
    <section className={panel}>
      <PanelHead icon={icon} title={title} sub={sub} />
      <div className="relative mt-6 h-40">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <motion.polyline
            points={points.join(" ")}
            fill="none"
            stroke="currentColor"
            className={stroke}
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
        {values.map((v) => (
          <span key={v.month} className="flex flex-col items-center gap-0.5">
            <span className="text-ink-900">
              {v.value}
              {suffix}
            </span>
            {v.month}
          </span>
        ))}
      </div>
    </section>
  );
}

function PendingVsCollected() {
  const collected = 128500;
  const pending = 18000;
  const total = collected + pending;
  const pct = Math.round((collected / total) * 100);
  return (
    <section className={panel}>
      <PanelHead
        icon={PieChart}
        title="Pending vs Collected"
        sub="Current month split across all properties."
      />
      <div className="mt-6 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-success-700">Collected</span>
            <span className="text-ink-900">{inr(collected)}</span>
          </div>
          <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-ink-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-success-500 to-success-400"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-warning-700">Pending</span>
            <span className="text-ink-900">{inr(pending)}</span>
          </div>
          <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-ink-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${100 - pct}%` }}
              transition={{ duration: 1.1, delay: 0.15, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-warning-500 to-warning-300"
            />
          </div>
        </div>
        <p className="rounded-xl bg-ink-50 px-4 py-3 text-xs font-semibold text-ink-600">
          {pct}% of billed rent is already in your account this month.
        </p>
      </div>
    </section>
  );
}

function TopProperty() {
  const top = propertyPerformance[0]!;
  return (
    <section className={panel}>
      <PanelHead
        icon={Trophy}
        title="Top Performing Property"
        sub="Highest revenue and occupancy this month."
      />
      <div className="mt-5 rounded-2xl border border-success-200 bg-success-50 p-5">
        <p className="text-lg font-extrabold text-ink-900">{top.name}</p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-sm font-extrabold text-success-700">{top.occupancy}%</p>
            <p className="text-[11px] font-semibold text-ink-500">Occupancy</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-success-700">{inr(top.revenue)}</p>
            <p className="text-[11px] font-semibold text-ink-500">Revenue</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-success-700">+{top.growth}%</p>
            <p className="text-[11px] font-semibold text-ink-500">Growth</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ReportAnalytics() {
  return (
    <section className="mt-6">
      <div className="min-w-0">
        <h2 className="text-base font-extrabold text-ink-900">Analytics</h2>
        <p className="mt-0.5 text-sm text-ink-500">
          Live business intelligence behind every report.
        </p>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <RevenueChart />
        <TrendChart
          title="Occupancy Trend"
          sub="Share of beds filled month over month."
          icon={LineChart}
          values={monthlyRevenue.map((m) => ({ month: m.month, value: m.occupancy }))}
          suffix="%"
          stroke="text-primary-600"
        />
        <TrendChart
          title="Collection Rate"
          sub="Rent collected against rent billed."
          icon={Gauge}
          values={monthlyRevenue.map((m) => ({ month: m.month, value: m.rate }))}
          suffix="%"
          stroke="text-success-600"
        />
        <PendingVsCollected />
        <TopProperty />
        <TrendChart
          title="Rent Growth"
          sub="Average rent per bed across properties."
          icon={TrendingUp}
          values={[
            { month: "Mar", value: 4550 },
            { month: "Apr", value: 4620 },
            { month: "May", value: 4710 },
            { month: "Jun", value: 4740 },
            { month: "Jul", value: 4860 },
            { month: "Aug", value: 4940 },
          ]}
          suffix=""
          stroke="text-warning-500"
        />
      </div>
    </section>
  );
}
