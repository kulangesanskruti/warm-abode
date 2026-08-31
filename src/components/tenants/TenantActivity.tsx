import { motion } from "framer-motion";
import {
  UserPlus,
  DollarSign,
  MessageCircle,
  FileText,
  Receipt,
  Home,
  Activity as ActivityIcon,
} from "lucide-react";
import { documentLabel, type ApiActivityLog, type ApiTenantDetail } from "@/lib/tenants";

interface TenantActivityProps {
  tenant: ApiTenantDetail;
}

const iconFor = (action: string) => {
  if (action.includes("CREATED")) return { icon: UserPlus, color: "primary" as const };
  if (action.includes("PAYMENT") || action.includes("RENT"))
    return { icon: DollarSign, color: "success" as const };
  if (action.includes("WHATSAPP") || action.includes("REMINDER"))
    return { icon: MessageCircle, color: "info" as const };
  if (action.includes("DOCUMENT")) return { icon: FileText, color: "warning" as const };
  if (action.includes("RECEIPT")) return { icon: Receipt, color: "success" as const };
  if (action.includes("TRANSFER") || action.includes("VACATE"))
    return { icon: Home, color: "ink" as const };
  return { icon: ActivityIcon, color: "ink" as const };
};

const colorMap = {
  primary: "bg-primary-50 text-primary-600 border-primary-200",
  success: "bg-success-50 text-success-600 border-success-200",
  warning: "bg-warning-50 text-warning-600 border-warning-200",
  info: "bg-blue-50 text-blue-600 border-blue-200",
  ink: "bg-ink-50 text-ink-600 border-ink-200",
};

const timestamp = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TenantActivity({ tenant }: TenantActivityProps) {
  const activities: ApiActivityLog[] = tenant.activityLogs ?? [];

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-ink-200 py-12 text-center">
        <p className="text-ink-600">No activity recorded for this tenant yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-ink-900">Activity Timeline</h3>

      <div className="space-y-3">
        {activities.map((activity, index) => {
          const { icon: Icon, color } = iconFor(activity.action);
          const colorClass = colorMap[color];

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index, 8) * 0.05 }}
              className="flex items-start gap-4 rounded-lg border border-ink-100 bg-white p-4"
            >
              <div className={`rounded-lg border p-2.5 ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink-900">{documentLabel(activity.action)}</p>
                {activity.description && (
                  <p className="mt-1 text-sm text-ink-600">{activity.description}</p>
                )}
                <p className="mt-2 text-xs text-ink-500">{timestamp(activity.createdAt)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
