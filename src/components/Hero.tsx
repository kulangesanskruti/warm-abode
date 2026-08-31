import { motion } from "framer-motion";
import { AppLink as Link } from "@/components/ui/AppLink";
import {
  ArrowRight,
  Play,
  Check,
  TrendingUp,
  BedDouble,
  Wallet,
  CheckCircle2,
  Clock,
  Home,
  Users,
  Bell,
} from "lucide-react";
import RippleButton from "@/components/ui/RippleButton";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-24 sm:pt-40 lg:pt-44 lg:pb-32">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 via-white to-ink-50/80" />
        <div className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-primary-200/25 blur-[140px]" />
        <div className="absolute right-0 top-44 h-[420px] w-[420px] rounded-full bg-success-100/30 blur-[140px]" />
        <div className="absolute left-0 top-60 h-[360px] w-[360px] rounded-full bg-primary-100/30 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.05) 1px, transparent 0)",
            backgroundSize: "34px 34px",
            maskImage: "radial-gradient(ellipse 72% 58% at 50% 0%, black, transparent)",
            WebkitMaskImage: "radial-gradient(ellipse 72% 58% at 50% 0%, black, transparent)",
          }}
        />
      </div>

      <div className="container-px grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        {/* Left */}
        <div className="max-w-2xl">
          <motion.div {...fade(0)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-1.5 text-xs font-semibold text-primary-700 shadow-soft backdrop-blur-xl">
              <span className="flex h-2 w-2">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-success-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
              </span>
              Built for modern PG owners
            </span>
          </motion.div>

          <motion.h1
            {...fade(0.08)}
            className="mt-7 text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.04]"
          >
            Manage Your PG & Rental Business{" "}
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-success-500 bg-clip-text text-transparent">
              Smarter, Faster
            </span>{" "}
            & Stress-Free.
          </motion.h1>

          <motion.p
            {...fade(0.16)}
            className="mt-6 max-w-xl text-lg leading-relaxed text-ink-500 sm:text-[1.075rem]"
          >
            StayHub helps PG owners and landlords manage rooms, beds, tenants, rent collection,
            maintenance and reports from one beautiful platform.
          </motion.p>

          <motion.div {...fade(0.24)} className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/register">
              <RippleButton className="px-7 py-3.5 text-base">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </RippleButton>
            </Link>
            <Link to="/dashboard?demo=true">
              <button className="btn-secondary px-6 py-3.5 text-base">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <Play className="h-3.5 w-3.5" fill="currentColor" />
                </span>
                Watch Demo
              </button>
            </Link>
          </motion.div>

          <motion.ul {...fade(0.32)} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
            {["Mobile Friendly", "No Credit Card", "Setup in Minutes"].map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm font-medium text-ink-600">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success-50 text-success-600">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Right — Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="relative">
      {/* glow */}
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary-200/40 via-transparent to-success-100/40 blur-2xl" />

      {/* Main dashboard card */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="relative rounded-[1.5rem] border border-white/80 bg-white/95 p-3 shadow-glow backdrop-blur-sm"
      >
        {/* top bar */}
        <div className="flex items-center justify-between px-2 pb-3 pt-1.5">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-danger-500/80" />
            <span className="h-3 w-3 rounded-full bg-warning-500/80" />
            <span className="h-3 w-3 rounded-full bg-success-500/80" />
          </div>
          <div className="rounded-full bg-ink-50 px-3 py-1 text-[11px] font-medium text-ink-400">
            app.stayhub.com
          </div>
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-700" />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Property cards */}
          <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-3.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-500">Properties</span>
              <Home className="h-3.5 w-3.5 text-primary-500" />
            </div>
            <div className="mt-3 space-y-2.5">
              {[
                { name: "Sunrise Residency", beds: "24/28 beds", tone: "success" },
                { name: "Green Park PG", beds: "18/20 beds", tone: "primary" },
                { name: "Lakeview Hostel", beds: "6/16 beds", tone: "warning" },
              ].map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 shadow-soft"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-8 w-8 rounded-lg bg-${p.tone}-50 flex items-center justify-center`}
                    >
                      <Home className={`h-4 w-4 text-${p.tone}-600`} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-ink-800">{p.name}</p>
                      <p className="text-[10px] text-ink-400">{p.beds}</p>
                    </div>
                  </div>
                  <span className={`h-2 w-2 rounded-full bg-${p.tone}-500`} />
                </div>
              ))}
            </div>
          </div>

          {/* Occupancy donut + stat */}
          <div className="rounded-2xl border border-ink-100 bg-white p-3.5 shadow-soft">
            <span className="text-xs font-semibold text-ink-500">Occupancy</span>
            <div className="mt-2 flex flex-col items-center">
              <div className="relative h-24 w-24">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="url(#occGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="97.4"
                    initial={{ strokeDashoffset: 97.4 }}
                    whileInView={{ strokeDashoffset: 22.4 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.4, delay: 0.6, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="occGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-ink-900">77%</span>
                  <span className="text-[9px] font-medium text-ink-400">filled</span>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-ink-400">48 of 64 beds</p>
            </div>
          </div>

          {/* Rent analytics bar chart */}
          <div className="rounded-2xl border border-ink-100 bg-white p-3.5 shadow-soft sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-500">Rent Analytics</span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-success-600">
                <TrendingUp className="h-3 w-3" /> +12.4%
              </span>
            </div>
            <div className="mt-3 flex h-24 items-end gap-1.5">
              {[40, 55, 48, 70, 62, 85, 78, 95, 72, 88, 80, 100].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.4 + i * 0.04, ease: "easeOut" }}
                  className={`flex-1 rounded-t-md ${i === 11 ? "bg-gradient-to-t from-primary-600 to-primary-400" : "bg-primary-100"}`}
                />
              ))}
            </div>
          </div>

          {/* Pending rent */}
          <div className="rounded-2xl border border-ink-100 bg-gradient-to-br from-warning-50 to-white p-3.5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-500">Pending Rent</span>
              <Clock className="h-3.5 w-3.5 text-warning-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-ink-900">₹42,500</p>
            <p className="text-[10px] text-warning-600">8 tenants pending</p>
          </div>
        </div>
      </motion.div>

      {/* Floating card: Recent payments */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -left-4 top-24 hidden w-44 rounded-2xl border border-white/80 bg-white/85 p-3 shadow-float backdrop-blur-xl sm:block"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-50 text-success-600">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-ink-800">Rent Received</p>
            <p className="text-[10px] text-ink-400">Rahul M. · ₹6,500</p>
          </div>
        </div>
      </motion.div>

      {/* Floating card: Vacant beds */}
      <motion.div
        animate={{ y: [0, 9, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -right-3 bottom-6 hidden w-44 rounded-2xl border border-white/80 bg-white/85 p-3 shadow-float backdrop-blur-xl sm:block"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <BedDouble className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-ink-800">16 Vacant Beds</p>
            <p className="text-[10px] text-ink-400">Across 3 properties</p>
          </div>
        </div>
      </motion.div>

      {/* Floating mini: WhatsApp reminder */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute -right-2 top-10 hidden items-center gap-2 rounded-2xl border border-white/80 bg-white/85 px-3 py-2 shadow-float backdrop-blur-xl lg:flex"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-50 text-success-600">
          <Bell className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold text-ink-800">Reminder Sent</p>
          <p className="text-[10px] text-ink-400">via WhatsApp</p>
        </div>
      </motion.div>

      {/* Floating mini: tenants */}
      <motion.div
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute -left-2 bottom-24 hidden items-center gap-2 rounded-2xl border border-white/80 bg-white/85 px-3 py-2 shadow-float backdrop-blur-xl lg:flex"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <Users className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold text-ink-800">128 Tenants</p>
          <p className="text-[10px] text-ink-400">Active</p>
        </div>
      </motion.div>
    </div>
  );
}
