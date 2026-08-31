import { motion } from "framer-motion";
import { Wallet, AlertCircle, BedDouble, Users, TrendingUp, Home } from "lucide-react";

interface Property {
  id: string | number;
  name: string;
  location: string;
  beds: number;
  occupied: number;
  vacant: number;
  occupancy: number;
  monthlyIncome: string;
  pendingRent?: string;
  pendingTenantCount?: number;
  image: string;
  description?: string;
}

export default function PropertyOverview({ property }: { property: Property }) {
  const stats = [
    {
      icon: Wallet,
      title: "Monthly Income",
      value: property.monthlyIncome,
      subtitle: "Current month",
      color: "success",
    },
    {
      icon: AlertCircle,
      title: "Pending Rent",
      value: property.pendingRent ?? "₹0",
      subtitle: `${property.pendingTenantCount ?? 0} ${
        (property.pendingTenantCount ?? 0) === 1 ? "Tenant" : "Tenants"
      }`,
      color: "danger",
    },
    {
      icon: BedDouble,
      title: "Vacant Beds",
      value: `${property.vacant} Beds`,
      subtitle: "Available",
      color: "primary",
    },
    {
      icon: Users,
      title: "Occupancy Rate",
      value: `${property.occupancy}%`,
      subtitle: `${property.occupied}/${property.beds} occupied`,
      color: "info",
    },
  ];

  const colorClasses = {
    success: {
      bg: "bg-success-50",
      border: "border-success-200",
      icon: "text-success-600",
      text: "text-success-700",
    },
    danger: {
      bg: "bg-danger-50",
      border: "border-danger-200",
      icon: "text-danger-600",
      text: "text-danger-700",
    },
    primary: {
      bg: "bg-primary-50",
      border: "border-primary-200",
      icon: "text-primary-600",
      text: "text-primary-700",
    },
    info: {
      bg: "bg-info-50",
      border: "border-info-200",
      icon: "text-info-600",
      text: "text-info-700",
    },
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 lg:grid-cols-2"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = colorClasses[stat.color as keyof typeof colorClasses];

          return (
            <motion.div key={index} variants={item}>
              <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-6`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-sm font-medium ${colors.icon}`}>{stat.title}</p>
                    <p className={`mt-2 text-3xl font-bold ${colors.text}`}>{stat.value}</p>
                    <p className="mt-2 text-xs text-ink-600">{stat.subtitle}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${colors.icon}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Property Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-ink-200 bg-white p-6"
      >
        <div className="mb-6 flex items-center gap-2">
          <Home className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-bold text-ink-900">Property Information</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-ink-900 uppercase">Details</h3>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-medium text-ink-500">Property Name</p>
                <p className="mt-1 text-sm text-ink-900 font-medium">{property.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-ink-500">Location</p>
                <p className="mt-1 text-sm text-ink-900 font-medium">{property.location}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-ink-500">Total Beds</p>
                <p className="mt-1 text-sm text-ink-900 font-medium">{property.beds}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink-900 uppercase">Statistics</h3>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-medium text-ink-500">Occupancy Rate</p>
                <div className="mt-1 flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-ink-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${property.occupancy}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-primary-600"
                    />
                  </div>
                  <span className="text-sm font-bold text-ink-900">{property.occupancy}%</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-ink-500">Bed Utilization</p>
                <p className="mt-1 text-sm text-ink-900 font-medium">
                  {property.occupied} occupied, {property.vacant} vacant
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
