import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { fetchRevenueAnalytics } from "@/lib/dashboard";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type Point = { month: string; value: number };

const compact = (value: number): string => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}M`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return `₹${Math.round(value)}`;
};

function buildSeries(trend: { period: string; amount: number }[] | undefined): Point[] {
  const byMonth = new Map<number, number>();
  const year = new Date().getFullYear();

  for (const entry of trend ?? []) {
    const [entryYear, entryMonth] = entry.period.split("-");
    if (Number(entryYear) !== year) continue;
    const index = Number(entryMonth) - 1;
    if (Number.isNaN(index) || index < 0 || index > 11) continue;
    byMonth.set(index, (byMonth.get(index) ?? 0) + Number(entry.amount ?? 0));
  }

  return MONTHS.map((month, index) => ({ month, value: byMonth.get(index) ?? 0 }));
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.3,
    },
  },
};

const bar = {
  hidden: { opacity: 0, scaleY: 0 },
  show: {
    opacity: 1,
    scaleY: 1,
    transition: { duration: 0.6 },
  },
};

export default function RentChart() {
  const { data: revenue, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard", "revenue"],
    queryFn: fetchRevenueAnalytics,
    retry: false,
  });

  const data = buildSeries(revenue?.collectionTrend);
  const peak = Math.max(...data.map((d) => d.value), 0);
  const maxValue = peak > 0 ? peak : 1;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const monthsWithData = data.filter((d) => d.value > 0).length;
  const average = monthsWithData ? total / monthsWithData : 0;

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink-900">Monthly Rent Collection</h2>
          <p className="mt-1 text-sm text-ink-500">Tracking your income across the year</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50">
          <TrendingUp className="h-5 w-5 text-success-600" />
        </div>
      </div>

      {isError && (
        <div className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700">
          <p>Could not load rent collection data.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-danger-600 px-3 py-1.5 text-xs font-medium text-white"
          >
            Retry
          </button>
        </div>
      )}

      {!isError && (
        <>
          {/* Chart */}
          <div className="space-y-2">
            {/* Y-axis labels */}
            <div className="relative">
              {/* Grid lines with labels */}
              <div className="absolute -left-12 top-0 flex h-full flex-col justify-between text-right">
                <span className="text-xs text-ink-400">100%</span>
                <span className="text-xs text-ink-400">75%</span>
                <span className="text-xs text-ink-400">50%</span>
                <span className="text-xs text-ink-400">25%</span>
                <span className="text-xs text-ink-400">0%</span>
              </div>

              {/* Chart area */}
              <div className="relative h-64 pl-12">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 space-y-[calc(100%/4)]">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border-t border-dashed border-ink-100" />
                  ))}
                </div>

                {/* Bars */}
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="relative flex h-full items-end justify-around gap-2"
                >
                  {data.map((d) => (
                    <motion.div
                      key={d.month}
                      variants={bar}
                      className="group relative flex-1"
                      style={{ originY: 1 }}
                    >
                      {/* Bar */}
                      <div
                        className={`relative h-full rounded-t-lg transition-all duration-300 group-hover:shadow-lg ${
                          isLoading
                            ? "animate-pulse bg-ink-100"
                            : "bg-gradient-to-t from-primary-600 to-primary-400"
                        }`}
                        style={{
                          height: isLoading ? "40%" : `${(d.value / maxValue) * 100}%`,
                        }}
                      >
                        {/* Hover tooltip */}
                        {!isLoading && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {compact(d.value)}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* X-axis labels */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-around pl-12 pt-2"
            >
              {data.map((d) => (
                <span key={d.month} className="text-xs text-ink-400">
                  {d.month}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-8 grid grid-cols-3 gap-4 border-t border-ink-100 pt-6"
          >
            <div>
              <p className="text-xs text-ink-500">Highest</p>
              <p className="mt-1 text-lg font-bold text-ink-900">
                {isLoading ? "—" : compact(peak)}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-500">Average</p>
              <p className="mt-1 text-lg font-bold text-ink-900">
                {isLoading ? "—" : compact(average)}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-500">Total YTD</p>
              <p className="mt-1 text-lg font-bold text-primary-600">
                {isLoading ? "—" : compact(total)}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
