import { motion } from "framer-motion";
import { BedDouble, Clock, TrendingUp, AlertCircle } from "lucide-react";

interface Room {
  id: string | number;
  number: string;
  floor: string;
  capacity: number;
  occupied: number;
  vacant: number;
  occupancy: number;
  monthlyIncome: string;
  pendingRent: string;
  lastUpdated: string;
  status: string;
  beds: any[];
}

export default function RoomCard({ room }: { room: Room }) {
  const getStatusColor = () => {
    switch (room.status) {
      case "fully-occupied":
        return "bg-success-50 text-success-700 border-success-200";
      case "occupied":
        return "bg-primary-50 text-primary-700 border-primary-200";
      case "maintenance":
        return "bg-warning-50 text-warning-700 border-warning-200";
      default:
        return "bg-ink-50 text-ink-700 border-ink-200";
    }
  };

  const getStatusLabel = () => {
    if (room.vacant === 1) return `${room.vacant} Bed Available`;
    if (room.vacant > 1) return `${room.vacant} Beds Available`;
    if (room.status === "fully-occupied") return "Fully Occupied";
    if (room.status === "maintenance") return "Maintenance";
    return "Occupied";
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 25px rgba(0, 0, 0, 0.1)" }}
      className="group rounded-xl border border-ink-200 bg-white p-6 transition-all duration-300"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold text-ink-900">Room {room.number}</h3>
          <p className="mt-1 text-sm text-ink-600">Floor {room.floor}</p>
        </div>
        <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor()}`}>
          {getStatusLabel()}
        </div>
      </div>

      {/* Capacity & Occupancy */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-ink-50 p-3">
          <p className="text-xs font-medium text-ink-600">Capacity</p>
          <p className="mt-1 text-lg font-bold text-ink-900">{room.capacity} Beds</p>
        </div>
        <div className="rounded-lg bg-primary-50 p-3">
          <p className="text-xs font-medium text-primary-600">Occupied</p>
          <p className="mt-1 text-lg font-bold text-primary-900">
            {room.occupied}/{room.capacity}
          </p>
        </div>
      </div>

      {/* Occupancy Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-ink-600">Occupancy</p>
          <p className="text-xs font-bold text-ink-900">{room.occupancy}%</p>
        </div>
        <div className="h-2 w-full rounded-full bg-ink-200 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${room.occupancy}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
          />
        </div>
      </div>

      {/* Income & Rent */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 p-3">
          <TrendingUp className="h-4 w-4 text-success-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-success-600">Income</p>
            <p className="text-sm font-bold text-success-900">{room.monthlyIncome}</p>
          </div>
        </div>
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 ${
            parseInt(room.pendingRent.replace(/[^0-9]/g, "")) > 0
              ? "border-warning-200 bg-warning-50"
              : "border-ink-200 bg-ink-50"
          }`}
        >
          <AlertCircle
            className={`h-4 w-4 flex-shrink-0 ${
              parseInt(room.pendingRent.replace(/[^0-9]/g, "")) > 0
                ? "text-warning-600"
                : "text-ink-600"
            }`}
          />
          <div>
            <p
              className={`text-xs font-medium ${
                parseInt(room.pendingRent.replace(/[^0-9]/g, "")) > 0
                  ? "text-warning-600"
                  : "text-ink-600"
              }`}
            >
              Pending
            </p>
            <p
              className={`text-sm font-bold ${
                parseInt(room.pendingRent.replace(/[^0-9]/g, "")) > 0
                  ? "text-warning-900"
                  : "text-ink-900"
              }`}
            >
              {room.pendingRent}
            </p>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mb-4 flex items-center gap-2 text-xs text-ink-500">
        <Clock className="h-3.5 w-3.5" />
        Updated {room.lastUpdated}
      </div>

      {/* View Room Button */}
      <button className="w-full rounded-lg border-2 border-primary-600 bg-white px-4 py-2.5 text-sm font-semibold text-primary-600 transition-all hover:bg-primary-50 active:scale-95 group-hover:bg-primary-600 group-hover:text-white">
        View Room
      </button>
    </motion.div>
  );
}
