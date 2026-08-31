import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { AppLink as Link } from "@/components/ui/AppLink";
import Logo from "@/components/ui/Logo";
import { BedDouble, Wallet, Bell, CheckCircle2, TrendingUp, Home } from "lucide-react";

type Props = {
  children: ReactNode;
  title: string;
  subtitle: string;
};

export default function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* LEFT — Branding */}
      <div className="relative hidden w-2/5 overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 lg:flex xl:w-[42%]">
        {/* animated background blobs */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-success-400/20 blur-3xl"
          />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img
              src="/image.png"
              alt="StayHub"
              className="h-10 w-10 object-contain"
              draggable={false}
            />
            <span className="text-xl font-bold tracking-tight text-white">
              Stay<span className="text-primary-200">Hub</span>
            </span>
          </Link>

          {/* Welcome message */}
          <div className="max-w-md">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl font-extrabold leading-tight tracking-tight text-white xl:text-4xl xl:leading-[1.1]"
            >
              Manage your PG with confidence.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-base leading-relaxed text-primary-100"
            >
              Rooms, beds, tenants, rent collection and reports — all from one beautiful platform
              built for modern PG owners.
            </motion.p>

            {/* Dashboard illustration */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10"
            >
              <BrandingIllustration />
            </motion.div>
          </div>

          {/* Footer */}
          <p className="text-xs text-primary-200/80">
            © {new Date().getFullYear()} StayHub. Built for landlords.
          </p>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="flex w-full flex-col items-center justify-center px-5 py-10 sm:px-8 lg:w-3/5 xl:px-14">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Logo size="lg" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px]"
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm text-ink-500">{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

function BrandingIllustration() {
  return (
    <div className="relative">
      {/* main card */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="relative rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/80">Dashboard Overview</span>
          <span className="flex items-center gap-1 rounded-full bg-success-400/20 px-2 py-0.5 text-[10px] font-semibold text-success-200">
            <TrendingUp className="h-3 w-3" /> +18.2%
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {[
            { icon: Home, label: "6", sub: "Properties" },
            { icon: BedDouble, label: "64", sub: "Beds" },
            { icon: Wallet, label: "₹42k", sub: "Pending" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.sub} className="rounded-xl border border-white/15 bg-white/10 p-2.5">
                <Icon className="h-4 w-4 text-primary-200" />
                <p className="mt-1.5 text-base font-bold text-white">{s.label}</p>
                <p className="text-[9px] text-white/60">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* mini bar chart */}
        <div className="mt-3 flex h-16 items-end gap-1.5">
          {[45, 60, 52, 75, 68, 88, 78, 95].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.7, delay: 0.5 + i * 0.06, ease: "easeOut" }}
              className={`flex-1 rounded-t-sm ${i === 7 ? "bg-white/80" : "bg-white/25"}`}
            />
          ))}
        </div>
      </motion.div>

      {/* floating cards */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -right-4 -top-4 flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-3 py-2 shadow-xl backdrop-blur-md"
      >
        <CheckCircle2 className="h-4 w-4 text-success-300" />
        <div>
          <p className="text-[10px] font-semibold text-white">Rent Received</p>
          <p className="text-[9px] text-white/60">₹6,500</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-3 py-2 shadow-xl backdrop-blur-md"
      >
        <Bell className="h-4 w-4 text-primary-200" />
        <div>
          <p className="text-[10px] font-semibold text-white">Reminder Sent</p>
          <p className="text-[9px] text-white/60">via WhatsApp</p>
        </div>
      </motion.div>
    </div>
  );
}
