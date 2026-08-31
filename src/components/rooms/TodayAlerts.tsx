import { motion } from "framer-motion";
import { AlertCircle, Clock, AlertTriangle } from "lucide-react";

interface Room {
  id: string | number;
  number: string;
  beds: Array<{
    name: string;
    status: string;
    tenant?: string | null;
    rentStatus: string;
    id: string;
  }>;
  pendingRent: string;
  vacant: number;
}

export default function TodayAlerts({ rooms }: { rooms: Room[] }) {
  const alerts: Array<{
    type: "overdue" | "due" | "vacant" | "maintenance";
    message: string;
    room: string;
    bed: string;
    action: string;
  }> = [];

  rooms.forEach((room) => {
    room.beds.forEach((bed) => {
      if (bed.rentStatus === "overdue") {
        alerts.push({
          type: "overdue",
          message: "Rent overdue by 5 days",
          room: `Room ${room.number}`,
          bed: bed.name,
          action: "Collect Rent",
        });
      } else if (bed.rentStatus === "due") {
        alerts.push({
          type: "due",
          message: "Rent due tomorrow",
          room: `Room ${room.number}`,
          bed: bed.name,
          action: "Send Reminder",
        });
      } else if (bed.status === "maintenance") {
        alerts.push({
          type: "maintenance",
          message: "Maintenance requested",
          room: `Room ${room.number}`,
          bed: bed.name,
          action: "View Details",
        });
      }
    });

    if (room.vacant > 0) {
      alerts.push({
        type: "vacant",
        message: `${room.vacant} Bed${room.vacant > 1 ? "s" : ""} Vacant`,
        room: `Room ${room.number}`,
        bed: "",
        action: "Assign Tenant",
      });
    }
  });

  if (alerts.length === 0) return null;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "overdue":
        return "🔴";
      case "due":
        return "🟡";
      case "vacant":
        return "🔵";
      case "maintenance":
        return "⚪";
      default:
        return "⚫";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "overdue":
        return "border-danger-200 bg-danger-50";
      case "due":
        return "border-warning-200 bg-warning-50";
      case "vacant":
        return "border-blue-200 bg-blue-50";
      case "maintenance":
        return "border-ink-200 bg-ink-50";
      default:
        return "border-ink-200 bg-ink-50";
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
      <h3 className="mb-4 text-lg font-semibold text-ink-900">Today's Alerts</h3>
      <div className="space-y-3">
        {alerts.slice(0, 5).map((alert, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-center justify-between rounded-lg border p-4 ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{getAlertIcon(alert.type)}</span>
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  {alert.bed ? `${alert.bed} - ` : ""}
                  {alert.message}
                </p>
                <p className="text-xs text-ink-600">{alert.room}</p>
              </div>
            </div>
            <button className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition-all hover:bg-ink-100 active:scale-95">
              {alert.action}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
