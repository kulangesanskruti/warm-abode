import { motion } from "framer-motion";
import { Home, BedDouble, Trash2, TrendingUp, AlertCircle, Percent } from "lucide-react";

interface Room {
  id: string | number;
  number: string;
  capacity: number;
  occupied: number;
  occupancy: number;
  monthlyIncome: string;
  pendingRent: string;
  floor: string;
  vacant: number;
  lastUpdated: string;
  status: string;
  beds: any[];
}

export default function RoomAnalytics({ rooms }: { rooms: Room[] }) {
  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const totalOccupied = rooms.reduce((sum, r) => sum + r.occupied, 0);
  const totalVacant = totalBeds - totalOccupied;
  const totalPendingRent = rooms.reduce((sum, r) => {
    const amount = parseInt(r.pendingRent.replace(/[^0-9]/g, "")) || 0;
    return sum + amount;
  }, 0);
  const totalIncome = rooms.reduce((sum, r) => {
    const amount = parseInt(r.monthlyIncome.replace(/[^0-9]/g, "")) || 0;
    return sum + amount;
  }, 0);
  const avgOccupancy = totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const stats = [
    { label: "Total Rooms", value: totalRooms, icon: Home, color: "primary" },
    { label: "Occupied Beds", value: totalOccupied, icon: BedDouble, color: "success" },
    { label: "Vacant Beds", value: totalVacant, icon: Trash2, color: "warning" },
    {
      label: "Pending Rent",
      value: `₹${totalPendingRent.toLocaleString()}`,
      icon: AlertCircle,
      color: "danger",
    },
    {
      label: "Monthly Income",
      value: `₹${totalIncome.toLocaleString()}`,
      icon: TrendingUp,
      color: "info",
    },
    { label: "Avg Occupancy", value: `${avgOccupancy}%`, icon: Percent, color: "accent" },
  ];

  const colorMap: Record<string, string> = {
    primary: "bg-primary-50 text-primary-600 border-primary-200",
    success: "bg-success-50 text-success-600 border-success-200",
    warning: "bg-warning-50 text-warning-600 border-warning-200",
    danger: "bg-danger-50 text-danger-600 border-danger-200",
    info: "bg-blue-50 text-blue-600 border-blue-200",
    accent: "bg-purple-50 text-purple-600 border-purple-200",
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            variants={item}
            className={`rounded-xl border ${colorMap[stat.color as keyof typeof colorMap]} p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold">{stat.value}</p>
              </div>
              <Icon className="h-8 w-8 opacity-20" />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
