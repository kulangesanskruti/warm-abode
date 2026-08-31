export type MessageType =
  | "rent-reminder"
  | "overdue-reminder"
  | "payment-confirmation"
  | "room-advertisement"
  | "festival-greeting"
  | "maintenance-notice"
  | "water-notice"
  | "electricity-notice"
  | "broadcast"
  | "due-tomorrow-reminder";

export type DeliveryStatus = "delivered" | "sent" | "pending" | "failed" | "read";

export interface MessageTemplate {
  id: number;
  key: MessageType;
  name: string;
  emoji: string;
  category: "Rent" | "Receipts" | "Rooms" | "Announcements" | "Greetings" | "Maintenance";
  body: string;
  favorite: boolean;
  uses: number;
  accent: "primary" | "success" | "warning" | "danger" | "ink";
}

export interface MessageHistoryEntry {
  id: number;
  type: MessageType;
  title: string;
  recipient: string;
  recipientPhoto?: string;
  property: string;
  status: DeliveryStatus;
  time: string;
  emoji: string;
}

export interface ScheduledMessage {
  id: number;
  title: string;
  recipient: string;
  recipientPhoto?: string;
  template: string;
  when: "today" | "tomorrow" | "weekly" | "monthly";
  time: string;
  day?: string;
  enabled: boolean;
  emoji: string;
}

export interface CommunicationEvent {
  id: number;
  emoji: string;
  label: string;
  detail: string;
  date: string;
  tone: "primary" | "success" | "warning" | "danger" | "ink";
}

export interface SmartRecommendation {
  id: number;
  emoji: string;
  title: string;
  detail: string;
  action: string;
  tone: "danger" | "warning" | "primary" | "success";
}

export interface SmartAction {
  id: number;
  emoji: string;
  label: string;
  description: string;
  tone: "danger" | "warning" | "success" | "primary" | "ink";
}

export const summaryCards = [
  {
    id: 1,
    emoji: "📱",
    label: "Messages Sent Today",
    value: 142,
    sub: "Across 4 properties",
    tone: "primary",
  },
  {
    id: 2,
    emoji: "🟢",
    label: "Delivered Successfully",
    value: 138,
    sub: "97.2% delivery rate",
    tone: "success",
  },
  {
    id: 3,
    emoji: "🔴",
    label: "Pending Rent Reminders",
    value: 5,
    sub: "Need to send today",
    tone: "danger",
  },
  { id: 4, emoji: "📄", label: "Receipts Shared", value: 48, sub: "This month", tone: "primary" },
  {
    id: 5,
    emoji: "🏠",
    label: "Room Ads Shared",
    value: 12,
    sub: "3 vacant beds",
    tone: "warning",
  },
  {
    id: 6,
    emoji: "📢",
    label: "Broadcast Messages",
    value: 7,
    sub: "Announcements sent",
    tone: "ink",
  },
];

export const summaryToneMap: Record<string, string> = {
  primary: "bg-primary-50 text-primary-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
  ink: "bg-ink-100 text-ink-700",
};

export const smartActions: SmartAction[] = [
  {
    id: 1,
    emoji: "🔴",
    label: "Send Pending Rent Reminder",
    description: "5 tenants with overdue rent",
    tone: "danger",
  },
  {
    id: 2,
    emoji: "🟡",
    label: "Send Due Tomorrow Reminder",
    description: "3 tenants due tomorrow",
    tone: "warning",
  },
  {
    id: 3,
    emoji: "🟢",
    label: "Share Payment Receipt",
    description: "48 receipts ready to share",
    tone: "success",
  },
  {
    id: 4,
    emoji: "🔵",
    label: "Share Room Information",
    description: "3 vacant beds available",
    tone: "primary",
  },
  {
    id: 5,
    emoji: "📢",
    label: "Broadcast Announcement",
    description: "Send to all properties",
    tone: "ink",
  },
  {
    id: 6,
    emoji: "🎉",
    label: "Festival Greeting",
    description: "Independence Day coming up",
    tone: "warning",
  },
  {
    id: 7,
    emoji: "⚙",
    label: "Maintenance Update",
    description: "Notify tenants about work",
    tone: "primary",
  },
];

export const smartActionTone: Record<
  SmartAction["tone"],
  { bg: string; border: string; text: string; dot: string }
> = {
  primary: {
    bg: "bg-primary-50",
    border: "border-primary-200",
    text: "text-primary-700",
    dot: "bg-primary-500",
  },
  success: {
    bg: "bg-success-50",
    border: "border-success-200",
    text: "text-success-700",
    dot: "bg-success-500",
  },
  warning: {
    bg: "bg-warning-50",
    border: "border-warning-200",
    text: "text-warning-700",
    dot: "bg-warning-500",
  },
  danger: {
    bg: "bg-danger-50",
    border: "border-danger-200",
    text: "text-danger-700",
    dot: "bg-danger-500",
  },
  ink: { bg: "bg-ink-100", border: "border-ink-200", text: "text-ink-700", dot: "bg-ink-500" },
};

export const messageTemplates: MessageTemplate[] = [
  {
    id: 1,
    key: "rent-reminder",
    name: "Rent Due Reminder",
    emoji: "💰",
    category: "Rent",
    body: "Dear {tenant_name}, your rent of ₹{amount} for Room {room} at {property} is due on {due_date}. Kindly make the payment at your earliest convenience. Thank you! — {owner_name}",
    favorite: true,
    uses: 42,
    accent: "warning",
  },
  {
    id: 2,
    key: "overdue-reminder",
    name: "Overdue Rent Reminder",
    emoji: "⚠️",
    category: "Rent",
    body: "Dear {tenant_name}, your rent of ₹{amount} for Room {room} at {property} was due on {due_date} and is now {days_overdue} days overdue. Please clear the payment immediately to avoid inconvenience. — {owner_name}",
    favorite: false,
    uses: 18,
    accent: "danger",
  },
  {
    id: 3,
    key: "payment-confirmation",
    name: "Payment Confirmation",
    emoji: "✅",
    category: "Receipts",
    body: "Hi {tenant_name}, we have received your rent payment of ₹{amount} for Room {room} at {property}. Receipt No: {receipt_no}. Thank you for paying on time! — {owner_name}",
    favorite: true,
    uses: 38,
    accent: "success",
  },
  {
    id: 4,
    key: "room-advertisement",
    name: "Vacant Room Advertisement",
    emoji: "🏠",
    category: "Rooms",
    body: "🏠 Room Available at {property}! Room {room} has {available_beds} bed(s) available. Rent: ₹{rent_per_bed}/month per bed. Facilities: {facilities}. Contact {owner_phone} for details or to schedule a visit.",
    favorite: false,
    uses: 12,
    accent: "primary",
  },
  {
    id: 5,
    key: "festival-greeting",
    name: "Festival Greeting",
    emoji: "🎉",
    category: "Greetings",
    body: "Dear {tenant_name}, wishing you and your family a very Happy {festival}! May this occasion bring joy and prosperity to your home. 🎉 — {owner_name}",
    favorite: false,
    uses: 6,
    accent: "warning",
  },
  {
    id: 6,
    key: "maintenance-notice",
    name: "Maintenance Notice",
    emoji: "⚙",
    category: "Maintenance",
    body: "Dear Tenant, please note that {maintenance_type} work is scheduled for {date} at {property}. {details}. We apologize for any inconvenience. — {owner_name}",
    favorite: false,
    uses: 9,
    accent: "primary",
  },
  {
    id: 7,
    key: "water-notice",
    name: "Water Supply Notice",
    emoji: "🚰",
    category: "Maintenance",
    body: "Dear Tenant, water supply will be temporarily unavailable on {date} from {start_time} to {end_time} at {property} due to {reason}. Please store water in advance. — {owner_name}",
    favorite: false,
    uses: 4,
    accent: "primary",
  },
  {
    id: 8,
    key: "electricity-notice",
    name: "Electricity Notice",
    emoji: "⚡",
    category: "Maintenance",
    body: "Dear Tenant, there will be a power cut on {date} from {start_time} to {end_time} at {property} due to {reason}. Please plan accordingly. — {owner_name}",
    favorite: false,
    uses: 3,
    accent: "warning",
  },
];

export const templateAccentMap: Record<
  MessageTemplate["accent"],
  { bg: string; border: string; text: string }
> = {
  primary: { bg: "bg-primary-50", border: "border-primary-200", text: "text-primary-700" },
  success: { bg: "bg-success-50", border: "border-success-200", text: "text-success-700" },
  warning: { bg: "bg-warning-50", border: "border-warning-200", text: "text-warning-700" },
  danger: { bg: "bg-danger-50", border: "border-danger-200", text: "text-danger-700" },
  ink: { bg: "bg-ink-100", border: "border-ink-200", text: "text-ink-700" },
};

export const messageHistory: MessageHistoryEntry[] = [
  {
    id: 1,
    type: "rent-reminder",
    title: "Reminder Sent",
    recipient: "Priya Singh",
    recipientPhoto:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    property: "Skyline PG",
    status: "delivered",
    time: "10 min ago",
    emoji: "📱",
  },
  {
    id: 2,
    type: "payment-confirmation",
    title: "Receipt Shared",
    recipient: "Rahul Sharma",
    recipientPhoto:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    property: "Skyline PG",
    status: "read",
    time: "35 min ago",
    emoji: "🧾",
  },
  {
    id: 3,
    type: "room-advertisement",
    title: "Room Shared",
    recipient: "Broadcast",
    property: "Green Valley",
    status: "delivered",
    time: "1 hour ago",
    emoji: "🏠",
  },
  {
    id: 4,
    type: "broadcast",
    title: "Broadcast Sent",
    recipient: "All Tenants",
    property: "All Properties",
    status: "delivered",
    time: "2 hours ago",
    emoji: "📢",
  },
  {
    id: 5,
    type: "overdue-reminder",
    title: "Reminder Sent",
    recipient: "Kavya Nair",
    recipientPhoto:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    property: "Urban Nest",
    status: "read",
    time: "3 hours ago",
    emoji: "⚠️",
  },
  {
    id: 6,
    type: "payment-confirmation",
    title: "Receipt Shared",
    recipient: "Amit Kumar",
    recipientPhoto:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    property: "Skyline PG",
    status: "delivered",
    time: "5 hours ago",
    emoji: "🧾",
  },
  {
    id: 7,
    type: "broadcast",
    title: "Tenant Replied",
    recipient: "Rohan Mehta",
    recipientPhoto:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop",
    property: "Metro Plaza",
    status: "read",
    time: "6 hours ago",
    emoji: "💬",
  },
  {
    id: 8,
    type: "rent-reminder",
    title: "Message Failed",
    recipient: "Sahil Verma",
    recipientPhoto:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    property: "Green Valley",
    status: "failed",
    time: "8 hours ago",
    emoji: "❌",
  },
  {
    id: 9,
    type: "maintenance-notice",
    title: "Maintenance Notice Sent",
    recipient: "Urban Nest Tenants",
    property: "Urban Nest",
    status: "delivered",
    time: "Yesterday",
    emoji: "⚙",
  },
  {
    id: 10,
    type: "festival-greeting",
    title: "Festival Greeting Sent",
    recipient: "All Tenants",
    property: "All Properties",
    status: "delivered",
    time: "Yesterday",
    emoji: "🎉",
  },
];

export const deliveryStatusMeta: Record<
  DeliveryStatus,
  { label: string; text: string; bg: string; dot: string }
> = {
  delivered: {
    label: "Delivered",
    text: "text-success-700",
    bg: "bg-success-50",
    dot: "bg-success-500",
  },
  sent: { label: "Sent", text: "text-primary-700", bg: "bg-primary-50", dot: "bg-primary-500" },
  read: { label: "Read", text: "text-primary-700", bg: "bg-primary-50", dot: "bg-primary-500" },
  pending: {
    label: "Pending",
    text: "text-warning-700",
    bg: "bg-warning-50",
    dot: "bg-warning-500",
  },
  failed: { label: "Failed", text: "text-danger-700", bg: "bg-danger-50", dot: "bg-danger-500" },
};

export const scheduledMessages: ScheduledMessage[] = [
  {
    id: 1,
    title: "Monthly Rent Reminder",
    recipient: "All Tenants",
    template: "Rent Due Reminder",
    when: "monthly",
    time: "09:00 AM",
    day: "1st of every month",
    enabled: true,
    emoji: "💰",
  },
  {
    id: 2,
    title: "Water Supply Notice",
    recipient: "Skyline PG Tenants",
    template: "Water Supply Notice",
    when: "tomorrow",
    time: "08:00 AM",
    enabled: true,
    emoji: "🚰",
  },
  {
    id: 3,
    title: "Independence Day Greeting",
    recipient: "All Tenants",
    template: "Festival Greeting",
    when: "tomorrow",
    time: "08:00 AM",
    enabled: true,
    emoji: "🎉",
  },
  {
    id: 4,
    title: "Weekly Maintenance Update",
    recipient: "Urban Nest Tenants",
    template: "Maintenance Notice",
    when: "weekly",
    time: "06:00 PM",
    day: "Every Friday",
    enabled: false,
    emoji: "⚙",
  },
  {
    id: 5,
    title: "Electricity Shutdown Notice",
    recipient: "Metro Plaza Tenants",
    template: "Electricity Notice",
    when: "today",
    time: "05:00 PM",
    enabled: true,
    emoji: "⚡",
  },
  {
    id: 6,
    title: "Monthly Summary Broadcast",
    recipient: "All Tenants",
    template: "Broadcast",
    when: "monthly",
    time: "10:00 AM",
    day: "Last day of month",
    enabled: true,
    emoji: "📢",
  },
];

export const communicationTimeline: CommunicationEvent[] = [
  {
    id: 1,
    emoji: "📱",
    label: "Reminder Sent",
    detail: "Rent reminder sent via WhatsApp",
    date: "04 Aug 2026, 09:15 AM",
    tone: "warning",
  },
  {
    id: 2,
    emoji: "💰",
    label: "Rent Received",
    detail: "₹5,000 received via UPI",
    date: "04 Aug 2026, 11:30 AM",
    tone: "success",
  },
  {
    id: 3,
    emoji: "🧾",
    label: "Receipt Shared",
    detail: "Receipt SH-2608-0041 shared",
    date: "04 Aug 2026, 11:32 AM",
    tone: "primary",
  },
  {
    id: 4,
    emoji: "🏠",
    label: "Room Changed",
    detail: "Moved from Bed C to Bed A in Room 203",
    date: "15 Jul 2026, 02:00 PM",
    tone: "ink",
  },
  {
    id: 5,
    emoji: "📄",
    label: "Agreement Shared",
    detail: "Rental agreement PDF shared",
    date: "12 Jan 2026, 10:00 AM",
    tone: "primary",
  },
  {
    id: 6,
    emoji: "🚪",
    label: "Vacating Notice",
    detail: "Not applicable — active tenant",
    date: "—",
    tone: "ink",
  },
];

export const communicationToneMap: Record<
  CommunicationEvent["tone"],
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

export const smartRecommendations: SmartRecommendation[] = [
  {
    id: 1,
    emoji: "🔴",
    title: "5 tenants have pending rent",
    detail: "Send reminders now to speed up collection.",
    action: "Send Reminders",
    tone: "danger",
  },
  {
    id: 2,
    emoji: "🟡",
    title: "3 tenants have rent due tomorrow",
    detail: "Notify them today to avoid delays.",
    action: "Notify Now",
    tone: "warning",
  },
  {
    id: 3,
    emoji: "🏠",
    title: "Room 203 has been vacant for 8 days",
    detail: "Share a room advertisement to find tenants.",
    action: "Share Room",
    tone: "primary",
  },
  {
    id: 4,
    emoji: "🧾",
    title: "Rahul paid today",
    detail: "Share a receipt to confirm the payment.",
    action: "Share Receipt",
    tone: "success",
  },
];

export const recommendationTone: Record<
  SmartRecommendation["tone"],
  { bg: string; border: string; text: string; btn: string }
> = {
  primary: {
    bg: "bg-primary-50",
    border: "border-primary-200",
    text: "text-primary-700",
    btn: "bg-primary-600 hover:bg-primary-700",
  },
  success: {
    bg: "bg-success-50",
    border: "border-success-200",
    text: "text-success-700",
    btn: "bg-success-600 hover:bg-success-700",
  },
  warning: {
    bg: "bg-warning-50",
    border: "border-warning-200",
    text: "text-warning-700",
    btn: "bg-warning-600 hover:bg-warning-700",
  },
  danger: {
    bg: "bg-danger-50",
    border: "border-danger-200",
    text: "text-danger-700",
    btn: "bg-danger-600 hover:bg-danger-700",
  },
};

export const announcementTypes = [
  { id: 1, emoji: "🚰", label: "Water Supply Shutdown", tone: "primary" },
  { id: 2, emoji: "🎉", label: "Festival Holiday", tone: "warning" },
  { id: 3, emoji: "⚙", label: "Maintenance Work", tone: "primary" },
  { id: 4, emoji: "⚡", label: "Electricity Shutdown", tone: "warning" },
  { id: 5, emoji: "📋", label: "Rent Policy Update", tone: "ink" },
];

export const announcementToneMap: Record<string, { bg: string; border: string; text: string }> = {
  primary: { bg: "bg-primary-50", border: "border-primary-200", text: "text-primary-700" },
  warning: { bg: "bg-warning-50", border: "border-warning-200", text: "text-warning-700" },
  ink: { bg: "bg-ink-100", border: "border-ink-200", text: "text-ink-700" },
};

export const analyticsCards = [
  {
    id: 1,
    label: "Messages Sent",
    value: 1284,
    prefix: "",
    suffix: "",
    sub: "Last 30 days",
    tone: "primary",
  },
  {
    id: 2,
    label: "Delivery Rate",
    value: 97.2,
    prefix: "",
    suffix: "%",
    sub: "Above industry avg",
    tone: "success",
  },
  {
    id: 3,
    label: "Reminder Success Rate",
    value: 82,
    prefix: "",
    suffix: "%",
    sub: "Paid within 3 days",
    tone: "success",
  },
  {
    id: 4,
    label: "Payments After Reminder",
    value: 34,
    prefix: "",
    suffix: "",
    sub: "This month",
    tone: "primary",
  },
  {
    id: 5,
    label: "Most Used Template",
    value: 0,
    prefix: "",
    suffix: "",
    sub: "Rent Due Reminder (42 uses)",
    tone: "warning",
    isText: true,
    textValue: "Rent Due",
  },
  {
    id: 6,
    label: "Peak Communication Time",
    value: 0,
    prefix: "",
    suffix: "",
    sub: "10:00 AM – 12:00 PM",
    tone: "ink",
    isText: true,
    textValue: "10–12 AM",
  },
];

export const analyticsToneMap: Record<string, string> = {
  primary: "bg-primary-50 text-primary-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  ink: "bg-ink-100 text-ink-700",
};

export const weeklyMessageData = [
  { day: "Mon", sent: 18, delivered: 17 },
  { day: "Tue", sent: 24, delivered: 23 },
  { day: "Wed", sent: 15, delivered: 15 },
  { day: "Thu", sent: 28, delivered: 27 },
  { day: "Fri", sent: 32, delivered: 31 },
  { day: "Sat", sent: 14, delivered: 14 },
  { day: "Sun", sent: 11, delivered: 10 },
];

export const deliveryTrendData = [
  { week: "W1", rate: 94 },
  { week: "W2", rate: 96 },
  { week: "W3", rate: 95 },
  { week: "W4", rate: 97 },
  { week: "W5", rate: 98 },
  { week: "W6", rate: 97 },
];

export const templateUsageData = [
  { name: "Rent Reminder", uses: 42 },
  { name: "Payment Confirm", uses: 38 },
  { name: "Overdue", uses: 18 },
  { name: "Room Ad", uses: 12 },
  { name: "Maintenance", uses: 9 },
  { name: "Festival", uses: 6 },
];

export const roomShareCard = {
  property: "Green Valley",
  room: "301",
  availableBeds: 2,
  rentPerBed: 4500,
  facilities: ["WiFi", "AC", "Hot Water", "Parking", "CCTV", "Kitchen"],
  ownerContact: "+91 98765 43210",
  image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=200&fit=crop",
};

export const bulkReminderActions = [
  { id: 1, label: "Send Pending Reminder", emoji: "🔴", tone: "danger" },
  { id: 2, label: "Send Due Tomorrow Reminder", emoji: "🟡", tone: "warning" },
  { id: 3, label: "Monthly Reminder", emoji: "📅", tone: "primary" },
  { id: 4, label: "Custom Message", emoji: "✏️", tone: "ink" },
];

export const bulkToneMap: Record<string, string> = {
  primary: "bg-primary-600 hover:bg-primary-700",
  success: "bg-success-600 hover:bg-success-700",
  warning: "bg-warning-600 hover:bg-warning-700",
  danger: "bg-danger-600 hover:bg-danger-700",
  ink: "bg-ink-700 hover:bg-ink-800",
};

export const properties = [
  "All Properties",
  "Skyline PG",
  "Urban Nest",
  "Green Valley",
  "Metro Plaza",
];

export const tenantList = [
  {
    id: 1,
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    property: "Skyline PG",
    room: "203",
    bed: "A",
    status: "paid" as const,
  },
  {
    id: 2,
    name: "Amit Kumar",
    phone: "+91 98765 43211",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    property: "Skyline PG",
    room: "203",
    bed: "B",
    status: "paid" as const,
  },
  {
    id: 3,
    name: "Priya Singh",
    phone: "+91 98765 43212",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    property: "Skyline PG",
    room: "203",
    bed: "C",
    status: "overdue" as const,
  },
  {
    id: 4,
    name: "Neha Patel",
    phone: "+91 98765 43213",
    photo: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&h=200&fit=crop",
    property: "Urban Nest",
    room: "105",
    bed: "A",
    status: "partial" as const,
  },
  {
    id: 5,
    name: "Vikram Desai",
    phone: "+91 98765 43214",
    photo: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200&h=200&fit=crop",
    property: "Green Valley",
    room: "301",
    bed: "B",
    status: "pending" as const,
  },
  {
    id: 6,
    name: "Ananya Reddy",
    phone: "+91 98765 43215",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    property: "Metro Plaza",
    room: "202",
    bed: "A",
    status: "pending" as const,
  },
  {
    id: 7,
    name: "Rohan Mehta",
    phone: "+91 98765 43216",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop",
    property: "Metro Plaza",
    room: "204",
    bed: "B",
    status: "paid" as const,
  },
  {
    id: 8,
    name: "Kavya Nair",
    phone: "+91 98765 43217",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    property: "Urban Nest",
    room: "108",
    bed: "A",
    status: "overdue" as const,
  },
];

export const emojis = [
  "😀",
  "😊",
  "🙏",
  "👍",
  "💰",
  "🏠",
  "🎉",
  "✅",
  "⚠️",
  "📢",
  "🚰",
  "⚡",
  "⚙",
  "🧾",
  "📅",
  "🔥",
  "✨",
  "📞",
  "📍",
  "💯",
];

export const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;
