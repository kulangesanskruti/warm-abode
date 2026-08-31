import { type LucideIcon } from "lucide-react";

export type Priority = "high" | "medium" | "low";
export type NotificationCategory =
  "rent" | "maintenance" | "tenants" | "rooms" | "properties" | "payments" | "system";

export type TimeGroup = "urgent" | "today" | "this-week" | "earlier";

export interface NotificationItem {
  id: string;
  icon: LucideIcon;
  emoji: string;
  title: string;
  description: string;
  time: string;
  priority: Priority;
  category: NotificationCategory;
  property?: string;
  room?: string;
  action: string;
  read: boolean;
  group: TimeGroup;
}

export interface ActivityEntry {
  id: string;
  icon: LucideIcon;
  emoji: string;
  label: string;
  detail: string;
  time: string;
  tone: "primary" | "success" | "warning" | "danger" | "ink";
}

export interface PreferenceItem {
  id: number;
  label: string;
  description: string;
  emoji: string;
  enabled: boolean;
}

export const priorityMeta: Record<
  Priority,
  { label: string; text: string; bg: string; border: string; dot: string; ring: string }
> = {
  high: {
    label: "High Priority",
    text: "text-danger-700",
    bg: "bg-danger-50",
    border: "border-danger-200",
    dot: "bg-danger-500",
    ring: "ring-danger-100",
  },
  medium: {
    label: "Medium Priority",
    text: "text-warning-700",
    bg: "bg-warning-50",
    border: "border-warning-200",
    dot: "bg-warning-500",
    ring: "ring-warning-100",
  },
  low: {
    label: "Low Priority",
    text: "text-success-700",
    bg: "bg-success-50",
    border: "border-success-200",
    dot: "bg-success-500",
    ring: "ring-success-100",
  },
};

export const categoryMeta: Record<NotificationCategory, { label: string; emoji: string }> = {
  rent: { label: "Rent", emoji: "💰" },
  maintenance: { label: "Maintenance", emoji: "⚙" },
  tenants: { label: "Tenants", emoji: "👤" },
  rooms: { label: "Rooms", emoji: "🏠" },
  properties: { label: "Properties", emoji: "🏢" },
  payments: { label: "Payments", emoji: "💳" },
  system: { label: "System", emoji: "🖥️" },
};

export const filterTabs: {
  key: "all" | "unread" | "high" | NotificationCategory;
  label: string;
}[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "high", label: "High Priority" },
  { key: "rent", label: "Rent" },
  { key: "maintenance", label: "Maintenance" },
  { key: "tenants", label: "Tenants" },
  { key: "rooms", label: "Rooms" },
  { key: "properties", label: "Properties" },
  { key: "payments", label: "Payments" },
  { key: "system", label: "System" },
];

export const groupMeta: Record<TimeGroup, { label: string; description: string; tone: string }> = {
  urgent: {
    label: "Urgent",
    description: "Needs your attention right now",
    tone: "text-danger-700",
  },
  today: { label: "Today", description: "Arrived earlier today", tone: "text-primary-700" },
  "this-week": { label: "This Week", description: "Earlier this week", tone: "text-ink-700" },
  earlier: { label: "Earlier", description: "Older notifications", tone: "text-ink-500" },
};

export const summaryToneMap: Record<string, string> = {
  primary: "bg-primary-50 text-primary-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
  ink: "bg-ink-100 text-ink-700",
};

export const activityToneMap: Record<
  ActivityEntry["tone"],
  { bg: string; text: string; dot: string; border: string }
> = {
  primary: {
    bg: "bg-primary-50",
    text: "text-primary-700",
    dot: "bg-primary-500",
    border: "border-primary-200",
  },
  success: {
    bg: "bg-success-50",
    text: "text-success-700",
    dot: "bg-success-500",
    border: "border-success-200",
  },
  warning: {
    bg: "bg-warning-50",
    text: "text-warning-700",
    dot: "bg-warning-500",
    border: "border-warning-200",
  },
  danger: {
    bg: "bg-danger-50",
    text: "text-danger-700",
    dot: "bg-danger-500",
    border: "border-danger-200",
  },
  ink: { bg: "bg-ink-100", text: "text-ink-600", dot: "bg-ink-400", border: "border-ink-200" },
};

export const preferenceItems: PreferenceItem[] = [
  {
    id: 1,
    label: "Rent Due",
    description: "Notify when rent is approaching due date",
    emoji: "💰",
    enabled: true,
  },
  {
    id: 2,
    label: "Overdue Rent",
    description: "Alert when rent becomes overdue",
    emoji: "🔴",
    enabled: true,
  },
  {
    id: 3,
    label: "Vacant Beds",
    description: "Notify when a bed becomes vacant",
    emoji: "🛏️",
    enabled: true,
  },
  {
    id: 4,
    label: "Maintenance",
    description: "Updates on maintenance requests",
    emoji: "⚙",
    enabled: true,
  },
  {
    id: 5,
    label: "New Tenant",
    description: "Notify when a tenant is added",
    emoji: "👤",
    enabled: false,
  },
  {
    id: 6,
    label: "Reports",
    description: "Monthly and weekly report notifications",
    emoji: "📊",
    enabled: true,
  },
  {
    id: 7,
    label: "System Updates",
    description: "Platform and feature updates",
    emoji: "🖥️",
    enabled: false,
  },
  {
    id: 8,
    label: "WhatsApp Confirmation",
    description: "Confirm messages sent via WhatsApp",
    emoji: "✅",
    enabled: true,
  },
  {
    id: 9,
    label: "Email Confirmation",
    description: "Receive email copies of notifications",
    emoji: "📧",
    enabled: false,
  },
];

export const quickActions = [
  { id: "collect-rent", label: "Collect Rent", emoji: "💰" },
  { id: "call-tenant", label: "Call Tenant", emoji: "📞" },
  { id: "whatsapp-reminder", label: "WhatsApp Reminder", emoji: "📱" },
  { id: "assign-tenant", label: "Assign Tenant", emoji: "👤" },
  { id: "generate-receipt", label: "Generate Receipt", emoji: "🧾" },
  { id: "dismiss", label: "Dismiss", emoji: "✕" },
];
