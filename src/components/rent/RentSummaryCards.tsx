import { motion } from "framer-motion";
import { Wallet, Clock, AlertTriangle, CalendarDays, ReceiptText, TrendingUp } from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

interface Props {
  totalCollected: number;
  pendingAmount: number;
  pendingCount: number;
  overdueAmount: number;
  overdueCount: number;
  dueTodayCount: number;
  receipts: number;
  collectionRate: number;
  onSelect: (status: "pending" | "overdue" | "due-today") => void;
  activeFilter: string;
}

function CircularProgress({ value }: { value: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative h-[88px] w-[88px]">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="8" className="stroke-ink-100" />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-success-500"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (value / 100) * circumference }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-extrabold text-ink-900">
          <AnimatedCounter to={value} suffix="%" />
        </span>
      </div>
    </div>
  );
}

const card =
  "group relative overflow-hidden rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow";

export default function RentSummaryCards({
  totalCollected,
  pendingAmount,
  pendingCount,
  overdueAmount,
  overdueCount,
  dueTodayCount,
  receipts,
  collectionRate,
  onSelect,
  activeFilter,
}: Props) {
  const item = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.07 } } }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
    >
      <motion.div variants={item} className={card}>
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-success-50 transition-transform duration-500 group-hover:scale-125" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-100 text-success-600">
              <Wallet className="h-5 w-5" />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-1 text-xs font-bold text-success-700">
              <TrendingUp className="h-3.5 w-3.5" /> +14%
            </span>
          </div>
          <p className="mt-4 text-sm font-medium text-ink-500">Total Collected</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink-900">
            <AnimatedCounter to={totalCollected} prefix="₹" />
          </p>
        </div>
      </motion.div>

      <motion.button
        variants={item}
        onClick={() => onSelect("pending")}
        className={`${card} text-left ${activeFilter === "pending" ? "ring-2 ring-warning-200" : ""}`}
      >
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-warning-50 transition-transform duration-500 group-hover:scale-125" />
        <div className="relative">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-100 text-warning-600">
            <Clock className="h-5 w-5" />
          </span>
          <p className="mt-4 text-sm font-medium text-ink-500">Pending Rent</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink-900">
            <AnimatedCounter to={pendingAmount} prefix="₹" />
          </p>
          <p className="mt-1 text-xs font-semibold text-warning-700">
            {pendingCount} Tenants · Tap to filter
          </p>
        </div>
      </motion.button>

      <motion.button
        variants={item}
        onClick={() => onSelect("overdue")}
        className={`${card} text-left ${activeFilter === "overdue" ? "ring-2 ring-danger-200" : ""}`}
      >
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-danger-50 transition-transform duration-500 group-hover:scale-125" />
        <div className="relative">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-100 text-danger-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <p className="mt-4 text-sm font-medium text-ink-500">Overdue Rent</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink-900">
            <AnimatedCounter to={overdueAmount} prefix="₹" />
          </p>
          <p className="mt-1 text-xs font-semibold text-danger-600">
            {overdueCount} Tenants · Tap to filter
          </p>
        </div>
      </motion.button>

      <motion.button
        variants={item}
        onClick={() => onSelect("due-today")}
        className={`${card} text-left ${activeFilter === "due-today" ? "ring-2 ring-primary-200" : ""}`}
      >
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary-50 transition-transform duration-500 group-hover:scale-125" />
        <div className="relative">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
            <CalendarDays className="h-5 w-5" />
          </span>
          <p className="mt-4 text-sm font-medium text-ink-500">Due Today</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink-900">
            <AnimatedCounter to={dueTodayCount} /> Payments
          </p>
          <p className="mt-1 text-xs font-semibold text-primary-700">Tap to filter</p>
        </div>
      </motion.button>

      <motion.div variants={item} className={card}>
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-ink-100 transition-transform duration-500 group-hover:scale-125" />
        <div className="relative">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 text-ink-700">
            <ReceiptText className="h-5 w-5" />
          </span>
          <p className="mt-4 text-sm font-medium text-ink-500">Receipts Generated</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink-900">
            <AnimatedCounter to={receipts} />
          </p>
          <p className="mt-1 text-xs font-medium text-ink-500">This month</p>
        </div>
      </motion.div>

      <motion.div variants={item} className={`${card} flex items-center gap-4`}>
        <CircularProgress value={collectionRate} />
        <div>
          <p className="text-sm font-medium text-ink-500">Collection Rate</p>
          <p className="mt-1 text-sm font-bold text-ink-900">On track</p>
          <p className="mt-1 text-xs font-medium text-success-700">Best in 6 months</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
