import { motion } from "framer-motion";
import {
  Home,
  DoorOpen,
  BedDouble,
  Wallet,
  Receipt,
  Plus,
  Bell,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

export default function ControlCenter() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="container-px">
        <SectionHeading
          eyebrow="Control Center"
          title={<>Your Entire Business, One Screen</>}
          description="A real-time dashboard that brings properties, rooms, beds, rent and payments together — beautifully."
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-14 max-w-5xl"
        >
          {/* glow */}
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-primary-200/30 via-transparent to-success-100/30 blur-3xl" />

          {/* MacBook frame */}
          <div className="relative rounded-[1.5rem] border border-ink-200 bg-ink-900 p-3 shadow-glow">
            <div className="rounded-[1rem] border border-ink-700 bg-white overflow-hidden">
              {/* App chrome */}
              <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50/60 px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-danger-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success-500/70" />
                </div>
                <span className="text-[11px] font-medium text-ink-400">StayHub Dashboard</span>
                <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary-400 to-primary-600" />
              </div>

              {/* Dashboard body */}
              <div className="grid gap-3 p-4 sm:grid-cols-12 sm:p-5">
                {/* Stat cards */}
                <StatCard
                  className="sm:col-span-3"
                  icon={Home}
                  label="Properties"
                  value="6"
                  tone="primary"
                />
                <StatCard
                  className="sm:col-span-3"
                  icon={DoorOpen}
                  label="Rooms"
                  value="42"
                  tone="success"
                />
                <StatCard
                  className="sm:col-span-3"
                  icon={BedDouble}
                  label="Beds"
                  value="64"
                  tone="warning"
                />
                <StatCard
                  className="sm:col-span-3"
                  icon={Wallet}
                  label="Pending Rent"
                  value="₹42.5k"
                  tone="danger"
                />

                {/* Chart */}
                <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:col-span-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-ink-500">Monthly Income</p>
                      <p className="mt-0.5 text-xl font-bold text-ink-900">₹2,84,000</p>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-[11px] font-semibold text-success-600">
                      <TrendingUp className="h-3 w-3" /> +18.2%
                    </span>
                  </div>
                  <div className="mt-4 flex h-28 items-end gap-2">
                    {[45, 58, 52, 70, 64, 82, 76, 90, 68, 95, 84, 100].map((h, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7, delay: 0.2 + i * 0.05, ease: "easeOut" }}
                          className={`w-full rounded-t-md ${i === 11 ? "bg-gradient-to-t from-primary-600 to-primary-400" : "bg-primary-100"}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent payments */}
                <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:col-span-4">
                  <p className="text-xs font-semibold text-ink-500">Recent Payments</p>
                  <div className="mt-3 space-y-2.5">
                    {[
                      { name: "Rahul M.", amount: "₹6,500", time: "2h ago" },
                      { name: "Priya S.", amount: "₹5,200", time: "5h ago" },
                      { name: "Arjun K.", amount: "₹7,000", time: "1d ago" },
                      { name: "Neha R.", amount: "₹4,800", time: "2d ago" },
                    ].map((p) => (
                      <div key={p.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success-50 text-success-600">
                            <Receipt className="h-3.5 w-3.5" />
                          </span>
                          <div>
                            <p className="text-[11px] font-semibold text-ink-800">{p.name}</p>
                            <p className="text-[9px] text-ink-400">{p.time}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-ink-900">{p.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="rounded-2xl border border-ink-100 bg-gradient-to-br from-primary-50/60 to-white p-4 shadow-soft sm:col-span-12">
                  <p className="text-xs font-semibold text-ink-500">Quick Actions</p>
                  <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {[
                      { icon: Plus, label: "Add Tenant" },
                      { icon: Bell, label: "Send Reminder" },
                      { icon: FileText, label: "Generate PDF" },
                      { icon: Users, label: "View Tenants" },
                    ].map((a) => {
                      const Icon = a.icon;
                      return (
                        <div
                          key={a.label}
                          className="flex items-center gap-2 rounded-xl border border-ink-100 bg-white px-3 py-2.5 shadow-soft transition-transform duration-200 hover:scale-[1.03]"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="text-xs font-semibold text-ink-700">{a.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MacBook base */}
          <div className="mx-auto mt-1 h-3 w-3/5 rounded-b-2xl border border-ink-200 bg-ink-200" />
          <div className="mx-auto h-1 w-1/4 rounded-b-xl bg-ink-300" />
        </motion.div>
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  className = "",
}: {
  icon: typeof Home;
  label: string;
  value: string;
  tone: "primary" | "success" | "warning" | "danger";
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-ink-100 bg-white p-4 shadow-soft ${className}`}>
      <div className="flex items-center justify-between">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg bg-${tone}-50 text-${tone}-600`}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-500">{label}</p>
    </div>
  );
}
