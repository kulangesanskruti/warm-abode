/**
 * Real `/api/v1/notifications` client + adapters.
 *
 * Every value the Notification Center renders comes from these calls — there
 * is no mock/sample notification anywhere in this file or in the screens that
 * consume it. Notifications are produced by the backend automation scheduler
 * (monthly rent generation, overdue detection, reminders).
 */
import {
  AlertTriangle,
  Bell,
  BedDouble,
  Building2,
  CheckCircle2,
  UserPlus,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import type {
  ActivityEntry,
  NotificationCategory,
  NotificationItem,
  Priority,
  TimeGroup,
} from "@/components/notifications/notificationsData";

export type ApiNotificationType = "PAYMENT" | "MAINTENANCE" | "TENANT" | "ROOM" | "SYSTEM";

export type ApiNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: ApiNotificationType;
  entityType?: string | null;
  entityId?: string | null;
  propertyId?: string | null;
  tenantId?: string | null;
  dedupeKey?: string | null;
  priority: number;
  isRead: boolean;
  readAt?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type NotificationListResponse = {
  items: ApiNotification[];
  total: number;
  page: number;
  limit: number;
};

export async function fetchNotifications(
  params: { page?: number; limit?: number; unreadOnly?: boolean } = {},
): Promise<NotificationListResponse> {
  const search = new URLSearchParams();
  search.set("page", String(params.page ?? 1));
  search.set("limit", String(params.limit ?? 50));
  if (params.unreadOnly) search.set("unreadOnly", "true");
  return apiRequest<NotificationListResponse>(`/notifications?${search.toString()}`);
}

export async function fetchUnreadCount(): Promise<number> {
  const data = await apiRequest<{ count: number }>("/notifications/unread-count");
  return data.count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiRequest("/notifications/read-all", { method: "PATCH" });
}

export async function deleteNotification(id: string): Promise<void> {
  await apiRequest(`/notifications/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/* Adapters: API row -> the shapes the existing UI components expect   */
/* ------------------------------------------------------------------ */

/** Backend priority is numeric (0 = normal, 1 = elevated, 2+ = urgent). */
function toPriority(priority: number): Priority {
  if (priority >= 2) return "high";
  if (priority === 1) return "medium";
  return "low";
}

function toCategory(n: ApiNotification): NotificationCategory {
  switch (n.type) {
    case "PAYMENT":
      return n.dedupeKey?.startsWith("rent-") ? "rent" : "payments";
    case "MAINTENANCE":
      return "maintenance";
    case "TENANT":
      return "tenants";
    case "ROOM":
      return "rooms";
    default:
      return "system";
  }
}

function toIcon(n: ApiNotification): LucideIcon {
  if (n.dedupeKey?.startsWith("rent-overdue:")) return AlertTriangle;
  switch (n.type) {
    case "PAYMENT":
      return Wallet;
    case "MAINTENANCE":
      return Wrench;
    case "TENANT":
      return UserPlus;
    case "ROOM":
      return BedDouble;
    default:
      return Bell;
  }
}

export function relativeTime(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function toGroup(n: ApiNotification, now = Date.now()): TimeGroup {
  if (!n.isRead && n.priority >= 2) return "urgent";
  const days = (now - new Date(n.createdAt).getTime()) / 86400000;
  if (days < 1) return "today";
  if (days < 7) return "this-week";
  return "earlier";
}

const metaString = (n: ApiNotification, key: string): string | undefined => {
  const value = n.metadata?.[key];
  return typeof value === "string" && value.length ? value : undefined;
};

export function toNotificationItem(n: ApiNotification, now = Date.now()): NotificationItem {
  const item: NotificationItem = {
    id: n.id,
    icon: toIcon(n),
    emoji: n.type === "PAYMENT" ? "💰" : "🔔",
    title: n.title,
    description: n.message,
    time: relativeTime(n.createdAt, now),
    priority: toPriority(n.priority),
    category: toCategory(n),
    action: n.dedupeKey?.startsWith("rent-") ? "Collect Rent" : "View",
    read: n.isRead,
    group: toGroup(n, now),
  };
  const property = metaString(n, "propertyName");
  const room = metaString(n, "roomNumber");
  if (property) item.property = property;
  if (room) item.room = room;
  return item;
}

export function toActivityEntry(n: ApiNotification, now = Date.now()): ActivityEntry {
  const tone: ActivityEntry["tone"] =
    n.priority >= 2 ? "danger" : n.priority === 1 ? "warning" : n.isRead ? "ink" : "primary";
  return {
    id: n.id,
    icon: n.isRead ? CheckCircle2 : toIcon(n),
    emoji: "🔔",
    label: n.title,
    detail: n.message,
    time: relativeTime(n.createdAt, now),
    tone,
  };
}

export type NotificationSummary = {
  total: number;
  unread: number;
  high: number;
  read: number;
};

export function summarize(items: ApiNotification[], total: number): NotificationSummary {
  const unread = items.filter((n) => !n.isRead).length;
  return {
    total,
    unread,
    high: items.filter((n) => n.priority >= 2).length,
    read: items.length - unread,
  };
}
