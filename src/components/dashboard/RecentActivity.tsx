import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, UserPlus, Send, FileText, Home, Activity, Bell } from "lucide-react";
import { AppLink as Link } from "@/components/ui/AppLink";
import { fetchNotifications, relativeTime, type NotificationRecord } from "@/lib/dashboard";

const iconByType: Record<string, typeof CheckCircle2> = {
  PAYMENT: CheckCircle2,
  TENANT: UserPlus,
  SYSTEM: Send,
  ROOM: Home,
  MAINTENANCE: FileText,
};

const colorByType: Record<string, "success" | "primary" | "warning" | "danger"> = {
  PAYMENT: "success",
  TENANT: "primary",
  SYSTEM: "warning",
  ROOM: "primary",
  MAINTENANCE: "warning",
};

const colorClasses = {
  success: { bg: "bg-success-50", icon: "text-success-600", dot: "bg-success-500" },
  primary: { bg: "bg-primary-50", icon: "text-primary-600", dot: "bg-primary-500" },
  warning: { bg: "bg-warning-50", icon: "text-warning-600", dot: "bg-warning-500" },
  danger: { bg: "bg-danger-50", icon: "text-danger-600", dot: "bg-danger-500" },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.35 } },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export default function RecentActivity() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard", "notifications"],
    queryFn: () => fetchNotifications(6),
    retry: false,
  });

  const activities: NotificationRecord[] = data?.items ?? [];

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink-900">Recent Activity</h2>
          <p className="mt-1 text-sm text-ink-500">Latest updates</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-50">
          <Activity className="h-5 w-5 text-ink-600" />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-10 w-10 animate-pulse rounded-full bg-ink-100" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 w-3/4 animate-pulse rounded bg-ink-100" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700">
          <p>Could not load recent activity.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-danger-600 px-3 py-1.5 text-xs font-medium text-white"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && activities.length === 0 && (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-ink-200 p-8 text-center">
          <Bell className="h-6 w-6 text-ink-400" />
          <p className="mt-3 text-sm font-medium text-ink-700">No activity yet</p>
          <p className="mt-1 text-xs text-ink-500">Updates will appear here as you use StayHub.</p>
        </div>
      )}

      {!isLoading && !isError && activities.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = iconByType[activity.type] ?? Activity;
            const colors = colorClasses[colorByType[activity.type] ?? "primary"];

            return (
              <motion.div key={activity.id} variants={item} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${colors.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${colors.icon}`} />
                  </div>
                  {index !== activities.length - 1 && (
                    <div className={`mt-2 w-0.5 h-12 ${colors.dot}`} style={{ opacity: 0.3 }} />
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <p className="text-sm font-medium text-ink-900">{activity.title}</p>
                  <p className="text-xs text-ink-600">{activity.message}</p>
                  <p className="mt-1 text-xs text-ink-500">{relativeTime(activity.createdAt)}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <Link to="/notifications">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 w-full rounded-lg border border-ink-200 py-2.5 text-sm font-medium text-primary-600 transition-all hover:bg-primary-50 active:scale-95"
        >
          View All Activity
        </motion.button>
      </Link>
    </div>
  );
}
