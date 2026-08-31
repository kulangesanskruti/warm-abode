import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Wallet, AlertCircle, BedDouble, Home, Users, TrendingUp } from "lucide-react";
import { fetchDashboard, type DashboardAnalytics } from "@/lib/auth";

type Card = {
  id: number;
  icon: typeof Wallet;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  clickable: boolean;
};

const inr = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;

function buildCards(data: DashboardAnalytics | undefined): Card[] {
  return [
    {
      id: 1,
      icon: Wallet,
      title: "Rent Collected",
      value: data ? inr(data.monthlyRevenue) : "—",
      subtitle: data ? `${Math.round(data.collectionRate)}% collection rate` : "Loading...",
      color: "success",
      clickable: false,
    },
    {
      id: 2,
      icon: AlertCircle,
      title: "Pending Rent",
      value: data ? inr(data.pendingRent) : "—",
      subtitle: data ? `${inr(data.overdueRent)} overdue` : "Loading...",
      color: "danger",
      clickable: true,
    },
    {
      id: 3,
      icon: BedDouble,
      title: "Vacant Beds",
      value: data
        ? `${Math.max(0, Math.round(data.totalBeds * (1 - data.occupancyRate / 100)))} Beds`
        : "—",
      subtitle: data ? `${data.totalBeds} total beds` : "Loading...",
      color: "primary",
      clickable: true,
    },
    {
      id: 4,
      icon: Home,
      title: "Properties",
      value: data ? String(data.totalProperties) : "—",
      subtitle: data ? `${data.totalRooms} rooms` : "Loading...",
      color: "primary",
      clickable: false,
    },
    {
      id: 5,
      icon: Users,
      title: "Total Tenants",
      value: data ? String(data.totalTenants) : "—",
      subtitle: "Currently Occupied",
      color: "warning",
      clickable: false,
    },
    {
      id: 6,
      icon: TrendingUp,
      title: "Occupancy Rate",
      value: data ? `${Math.round(data.occupancyRate)}%` : "—",
      subtitle: data ? `${inr(data.todayCollection)} collected today` : "Loading...",
      color: "success",
      clickable: false,
    },
  ];
}

const colorClasses = {
  primary: {
    bg: "bg-primary-50",
    icon: "text-primary-600",
    value: "text-primary-900",
    indicator: "bg-primary-200",
  },
  success: {
    bg: "bg-success-50",
    icon: "text-success-600",
    value: "text-success-900",
    indicator: "bg-success-200",
  },
  warning: {
    bg: "bg-warning-50",
    icon: "text-warning-600",
    value: "text-warning-900",
    indicator: "bg-warning-200",
  },
  danger: {
    bg: "bg-danger-50",
    icon: "text-danger-600",
    value: "text-danger-900",
    indicator: "bg-danger-200",
  },
};

export default function SummaryCards() {
  const { data } = useQuery({
    queryKey: ["dashboard", "analytics"],
    queryFn: fetchDashboard,
    retry: false,
  });

  const cards = buildCards(data);
  const occupancy = data ? Math.round(data.occupancyRate) : 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
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
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const colors = colorClasses[card.color as keyof typeof colorClasses];

        return (
          <motion.div
            key={card.id}
            variants={item}
            whileHover={card.clickable ? { y: -4, transition: { duration: 0.2 } } : {}}
            className={`rounded-2xl border border-ink-100 bg-white p-6 shadow-card transition-all duration-300 ${
              card.clickable ? "cursor-pointer hover:shadow-float" : ""
            }`}
          >
            {/* Top Section */}
            <div className="flex items-start justify-between">
              <div className={`rounded-xl ${colors.bg} p-3`}>
                <Icon className={`h-6 w-6 ${colors.icon}`} />
              </div>
              {card.id === 6 && (
                <div className="relative h-16 w-16">
                  <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#grad)"
                      strokeWidth="8"
                      strokeDasharray={`${(occupancy / 100) * 282.7} 282.7`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#059669" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-success-600">{occupancy}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="mt-4">
              <p className="text-sm font-medium text-ink-600">{card.title}</p>
              <div className="mt-2 flex items-baseline justify-between">
                <p className={`text-2xl font-bold ${colors.value}`}>{card.value}</p>
              </div>
              <p className="mt-1 text-xs text-ink-500">{card.subtitle}</p>
            </div>

            {/* Indicator */}
            {card.id !== 6 && <div className={`mt-4 h-1 rounded-full ${colors.indicator}`} />}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
