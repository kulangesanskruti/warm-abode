import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Plus, User, Wallet, MessageCircle, FileText } from "lucide-react";
import { fetchDashboard, type DashboardAnalytics } from "@/lib/auth";
import { inr } from "@/lib/dashboard";

type Action = {
  id: number;
  icon: typeof Plus;
  label: string;
  color: string;
  detail: string;
};

function buildActions(data: DashboardAnalytics | undefined, isLoading: boolean): Action[] {
  const detail = (value: string) => (isLoading ? "…" : data ? value : "");

  return [
    {
      id: 1,
      icon: Plus,
      label: "Add Property",
      color: "primary",
      detail: detail(`${data?.totalProperties ?? 0} active`),
    },
    {
      id: 2,
      icon: User,
      label: "Add Tenant",
      color: "success",
      detail: detail(`${data?.totalTenants ?? 0} tenants`),
    },
    {
      id: 3,
      icon: Wallet,
      label: "Collect Rent",
      color: "warning",
      detail: detail(`${inr(data?.pendingRent ?? 0)} pending`),
    },
    {
      id: 4,
      icon: MessageCircle,
      label: "WhatsApp Reminder",
      color: "primary",
      detail: detail(`${inr(data?.overdueRent ?? 0)} overdue`),
    },
    {
      id: 5,
      icon: FileText,
      label: "Generate PDF",
      color: "danger",
      detail: detail(`${Math.round(data?.collectionRate ?? 0)}% collected`),
    },
  ];
}

const colorClasses = {
  primary: {
    bg: "bg-primary-50 hover:bg-primary-100",
    icon: "text-primary-600",
  },
  success: {
    bg: "bg-success-50 hover:bg-success-100",
    icon: "text-success-600",
  },
  warning: {
    bg: "bg-warning-50 hover:bg-warning-100",
    icon: "text-warning-600",
  },
  danger: {
    bg: "bg-danger-50 hover:bg-danger-100",
    icon: "text-danger-600",
  },
};

export default function QuickActions() {
  // Shares the cache entry primed by SummaryCards, so this adds no extra request.
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "analytics"],
    queryFn: fetchDashboard,
    retry: false,
  });

  const actions = buildActions(data, isLoading);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.25,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <h2 className="mb-6 text-lg font-bold text-ink-900">Quick Actions</h2>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          const colors = colorClasses[action.color as keyof typeof colorClasses];

          return (
            <motion.button
              key={action.id}
              variants={item}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95 }}
              className={`group flex items-center gap-3 rounded-xl ${colors.bg} p-4 transition-all duration-300`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                <Icon className={`h-5 w-5 ${colors.icon}`} />
              </div>
              <span className="text-left text-sm font-medium text-ink-900">{action.label}</span>
              {!isError && action.detail && (
                <span className="ml-auto text-xs text-ink-500">{action.detail}</span>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
