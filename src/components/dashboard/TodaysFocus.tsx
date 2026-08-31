import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Zap, Wrench, ChevronRight, CheckCircle2 } from "lucide-react";
import {
  fetchNotifications,
  fetchOccupancyAnalytics,
  fetchOverduePayments,
  fetchPendingPayments,
  inr,
  num,
  relativeTime,
  type PaymentRecord,
} from "@/lib/dashboard";

type FocusItem = {
  id: string;
  icon: typeof AlertCircle;
  title: string;
  room: string;
  tenant: string;
  amount: string;
  status: string;
  color: "primary" | "danger" | "warning";
  action: string;
};

const outstanding = (payment: PaymentRecord): number =>
  num(payment.outstandingAmount) || Math.max(0, num(payment.rentAmount) - num(payment.paidAmount));

const monthLabel = (payment: PaymentRecord): string =>
  new Date(payment.year, Math.max(0, payment.month - 1), 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

const colorClasses = {
  primary: {
    bg: "bg-primary-50",
    border: "border-primary-200",
    icon: "text-primary-600",
    badge: "bg-primary-100 text-primary-700",
  },
  danger: {
    bg: "bg-danger-50",
    border: "border-danger-200",
    icon: "text-danger-600",
    badge: "bg-danger-100 text-danger-700",
  },
  warning: {
    bg: "bg-warning-50",
    border: "border-warning-200",
    icon: "text-warning-600",
    badge: "bg-warning-100 text-warning-700",
  },
};

export default function TodaysFocus() {
  const overdueQuery = useQuery({
    queryKey: ["dashboard", "payments", "overdue"],
    queryFn: fetchOverduePayments,
    retry: false,
  });
  const pendingQuery = useQuery({
    queryKey: ["dashboard", "payments", "pending"],
    queryFn: fetchPendingPayments,
    retry: false,
  });
  const occupancyQuery = useQuery({
    queryKey: ["dashboard", "occupancy"],
    queryFn: fetchOccupancyAnalytics,
    retry: false,
  });
  const notificationsQuery = useQuery({
    queryKey: ["dashboard", "notifications"],
    queryFn: () => fetchNotifications(6),
    retry: false,
  });

  const isLoading =
    overdueQuery.isLoading ||
    pendingQuery.isLoading ||
    occupancyQuery.isLoading ||
    notificationsQuery.isLoading;

  // Only a total failure blocks the card; partial failures just drop that section.
  const isError =
    overdueQuery.isError &&
    pendingQuery.isError &&
    occupancyQuery.isError &&
    notificationsQuery.isError;

  const retryAll = () => {
    overdueQuery.refetch();
    pendingQuery.refetch();
    occupancyQuery.refetch();
    notificationsQuery.refetch();
  };

  const focusItems: FocusItem[] = [];

  for (const payment of (overdueQuery.data ?? []).slice(0, 2)) {
    focusItems.push({
      id: `overdue-${payment.id}`,
      icon: AlertCircle,
      title: "Overdue Rent",
      room: payment.property?.propertyName ?? "Rent payment",
      tenant: payment.tenant?.fullName ?? "Tenant",
      amount: inr(outstanding(payment)),
      status: `${monthLabel(payment)} overdue`,
      color: "danger",
      action: "Send Reminder",
    });
  }

  for (const payment of (pendingQuery.data ?? [])
    .filter((p) => p.status !== "OVERDUE")
    .slice(0, 2)) {
    focusItems.push({
      id: `pending-${payment.id}`,
      icon: AlertCircle,
      title: "Rent Due",
      room: payment.property?.propertyName ?? "Rent payment",
      tenant: payment.tenant?.fullName ?? "Tenant",
      amount: inr(outstanding(payment)),
      status: `${monthLabel(payment)} pending`,
      color: "danger",
      action: "Collect Rent",
    });
  }

  const vacantRoom = (occupancyQuery.data?.rooms ?? []).find((room) => room.vacantBeds > 0);
  if (vacantRoom) {
    focusItems.push({
      id: `vacant-${vacantRoom.roomId}`,
      icon: Zap,
      title: "Vacant Bed",
      room: `Room ${vacantRoom.roomNumber}`,
      tenant: `${vacantRoom.occupiedBeds}/${vacantRoom.capacity} occupied`,
      amount: `${vacantRoom.vacantBeds} Bed${vacantRoom.vacantBeds === 1 ? "" : "s"} Available`,
      status: "Ready to Assign",
      color: "primary",
      action: "Assign Tenant",
    });
  }

  const maintenance = (notificationsQuery.data?.items ?? []).find(
    (notification) => notification.type === "MAINTENANCE",
  );
  if (maintenance) {
    focusItems.push({
      id: `maintenance-${maintenance.id}`,
      icon: Wrench,
      title: "Maintenance",
      room: maintenance.title,
      tenant: maintenance.message,
      amount: "Needs Attention",
      status: relativeTime(maintenance.createdAt) || "Pending",
      color: "warning",
      action: "View Details",
    });
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-ink-900">Today&apos;s Focus</h2>
        <p className="mt-1 text-sm text-ink-500">Actions that need your attention</p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-ink-100" />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700">
          <p>Could not load today&apos;s focus items.</p>
          <button
            onClick={retryAll}
            className="mt-3 rounded-lg bg-danger-600 px-3 py-1.5 text-xs font-medium text-white"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && focusItems.length === 0 && (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-ink-200 p-8 text-center">
          <CheckCircle2 className="h-6 w-6 text-success-500" />
          <p className="mt-3 text-sm font-medium text-ink-700">Nothing needs attention</p>
          <p className="mt-1 text-xs text-ink-500">Rent is collected and every bed is assigned.</p>
        </div>
      )}

      {!isLoading && !isError && focusItems.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {focusItems.map((focusItem) => {
            const Icon = focusItem.icon;
            const colors = colorClasses[focusItem.color];

            return (
              <motion.div
                key={focusItem.id}
                variants={item}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className={`group rounded-xl border-2 ${colors.border} ${colors.bg} p-4 transition-all duration-300 hover:shadow-md cursor-pointer`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 flex-shrink-0 ${colors.icon}`} />
                      <h3 className="font-semibold text-ink-900">{focusItem.title}</h3>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ink-600">{focusItem.room}</span>
                        <span className="font-medium text-ink-900">{focusItem.amount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ink-500">{focusItem.tenant}</span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors.badge}`}
                        >
                          {focusItem.status}
                        </span>
                      </div>
                    </div>

                    <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-700 active:scale-95">
                      {focusItem.action}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
