export const inr = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export type ReportCategoryKey =
  | "rent-collection"
  | "property-performance"
  | "tenant"
  | "room-occupancy"
  | "income-expense"
  | "payment-history"
  | "monthly-summary"
  | "cashbook";

export interface ReportCategory {
  key: ReportCategoryKey;
  emoji: string;
  title: string;
  description: string;
  lastGenerated: string;
  accent: "primary" | "success" | "warning" | "danger" | "ink";
}

export const reportCategories: ReportCategory[] = [
  {
    key: "rent-collection",
    emoji: "💰",
    title: "Rent Collection Report",
    description: "Every collection, pending due and overdue amount for the selected period.",
    lastGenerated: "02 Aug 2026, 09:12 AM",
    accent: "success",
  },
  {
    key: "property-performance",
    emoji: "🏠",
    title: "Property Performance Report",
    description: "Compare occupancy, revenue and pending rent across all properties.",
    lastGenerated: "01 Aug 2026, 06:40 PM",
    accent: "primary",
  },
  {
    key: "tenant",
    emoji: "👥",
    title: "Tenant Report",
    description: "Full tenant register with rooms, rent status and move-in history.",
    lastGenerated: "31 Jul 2026, 11:05 AM",
    accent: "primary",
  },
  {
    key: "room-occupancy",
    emoji: "🛏",
    title: "Room Occupancy Report",
    description: "Bed-level occupancy with vacant and under-maintenance breakdown.",
    lastGenerated: "30 Jul 2026, 08:20 AM",
    accent: "warning",
  },
  {
    key: "income-expense",
    emoji: "📊",
    title: "Income & Expense Report",
    description: "Net position after maintenance, staff, utilities and other expenses.",
    lastGenerated: "29 Jul 2026, 07:55 PM",
    accent: "ink",
  },
  {
    key: "payment-history",
    emoji: "🧾",
    title: "Payment History Report",
    description: "Month-by-month payment trail for any tenant or property.",
    lastGenerated: "28 Jul 2026, 03:30 PM",
    accent: "primary",
  },
  {
    key: "monthly-summary",
    emoji: "📅",
    title: "Monthly Summary",
    description: "One-page snapshot of revenue, occupancy and collection efficiency.",
    lastGenerated: "27 Jul 2026, 10:15 AM",
    accent: "success",
  },
  {
    key: "cashbook",
    emoji: "📄",
    title: "Cashbook",
    description: "Daily cash in and cash out ledger ready for your accountant.",
    lastGenerated: "26 Jul 2026, 09:00 AM",
    accent: "danger",
  },
];

export const monthlyRevenue = [
  { month: "Mar", revenue: 118000, expected: 140000, occupancy: 78, rate: 84 },
  { month: "Apr", revenue: 126000, expected: 140000, occupancy: 82, rate: 90 },
  { month: "May", revenue: 131000, expected: 143000, occupancy: 86, rate: 92 },
  { month: "Jun", revenue: 124500, expected: 143500, occupancy: 84, rate: 87 },
  { month: "Jul", revenue: 138000, expected: 146500, occupancy: 91, rate: 94 },
  { month: "Aug", revenue: 128500, expected: 146500, occupancy: 89, rate: 94 },
];

export interface PropertyPerformance {
  name: string;
  occupancy: number;
  revenue: number;
  pending: number;
  growth: number;
  badge: "best" | "growing" | "attention";
}

export const propertyPerformance: PropertyPerformance[] = [
  { name: "Skyline PG", occupancy: 96, revenue: 48400, pending: 4500, growth: 12, badge: "best" },
  { name: "Urban Nest", occupancy: 88, revenue: 36200, pending: 7000, growth: 8, badge: "growing" },
  {
    name: "Metro Plaza",
    occupancy: 84,
    revenue: 27800,
    pending: 4500,
    growth: 5,
    badge: "growing",
  },
  {
    name: "Green Valley",
    occupancy: 62,
    revenue: 16100,
    pending: 9700,
    growth: -4,
    badge: "attention",
  },
];

export const badgeMeta: Record<
  PropertyPerformance["badge"],
  { label: string; text: string; bg: string; border: string }
> = {
  best: {
    label: "⭐ Best Performing",
    text: "text-success-700",
    bg: "bg-success-50",
    border: "border-success-200",
  },
  growing: {
    label: "📈 Growing",
    text: "text-primary-700",
    bg: "bg-primary-50",
    border: "border-primary-200",
  },
  attention: {
    label: "⚠ Needs Attention",
    text: "text-warning-700",
    bg: "bg-warning-50",
    border: "border-warning-200",
  },
};

export interface OccupancyRow {
  property: string;
  occupied: number;
  vacant: number;
  maintenance: number;
}

export const occupancyRows: OccupancyRow[] = [
  { property: "Skyline PG", occupied: 24, vacant: 1, maintenance: 0 },
  { property: "Urban Nest", occupied: 15, vacant: 2, maintenance: 1 },
  { property: "Metro Plaza", occupied: 11, vacant: 2, maintenance: 0 },
  { property: "Green Valley", occupied: 8, vacant: 4, maintenance: 1 },
];

export interface TenantRow {
  id: number;
  name: string;
  photo: string;
  property: string;
  room: string;
  status: "Paid" | "Pending" | "Overdue" | "Partial";
  moveIn: string;
  onTime: number;
  months: number;
}

export const tenantRows: TenantRow[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    property: "Skyline PG",
    room: "203 · Bed A",
    status: "Paid",
    moveIn: "12 Jan 2025",
    onTime: 11,
    months: 12,
  },
  {
    id: 2,
    name: "Priya Singh",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    property: "Skyline PG",
    room: "203 · Bed C",
    status: "Overdue",
    moveIn: "04 Mar 2025",
    onTime: 7,
    months: 11,
  },
  {
    id: 3,
    name: "Neha Patel",
    photo: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&h=200&fit=crop",
    property: "Urban Nest",
    room: "105 · Bed A",
    status: "Partial",
    moveIn: "22 Nov 2024",
    onTime: 15,
    months: 17,
  },
  {
    id: 4,
    name: "Rohan Mehta",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop",
    property: "Metro Plaza",
    room: "204 · Bed B",
    status: "Paid",
    moveIn: "09 Jun 2025",
    onTime: 8,
    months: 8,
  },
  {
    id: 5,
    name: "Vikram Desai",
    photo: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200&h=200&fit=crop",
    property: "Green Valley",
    room: "301 · Bed B",
    status: "Pending",
    moveIn: "18 Feb 2026",
    onTime: 5,
    months: 6,
  },
  {
    id: 6,
    name: "Kavya Nair",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    property: "Urban Nest",
    room: "108 · Bed A",
    status: "Overdue",
    moveIn: "30 Apr 2025",
    onTime: 9,
    months: 13,
  },
];

export const tenantStatusMeta: Record<
  TenantRow["status"],
  { text: string; bg: string; border: string }
> = {
  Paid: { text: "text-success-700", bg: "bg-success-50", border: "border-success-200" },
  Pending: { text: "text-warning-700", bg: "bg-warning-50", border: "border-warning-200" },
  Overdue: { text: "text-danger-700", bg: "bg-danger-50", border: "border-danger-200" },
  Partial: { text: "text-primary-700", bg: "bg-primary-50", border: "border-primary-200" },
};

export const propertyOptions = [
  "All Properties",
  "Skyline PG",
  "Urban Nest",
  "Green Valley",
  "Metro Plaza",
];
export const roomOptions = ["All Rooms", "203", "204", "105", "108", "301", "305"];
export const tenantOptions = ["All Tenants", ...tenantRows.map((t) => t.name)];
export const statusOptions = ["All Statuses", "Paid", "Pending", "Overdue", "Partial"];
export const dateRanges = [
  "This Month",
  "Last Month",
  "Last 3 Months",
  "Last 6 Months",
  "This Year",
  "Custom Range",
];
export const formatOptions = ["PDF", "Excel", "CSV"] as const;

export const pdfTemplates = [
  {
    key: "modern",
    name: "Modern",
    description: "Bold headers, colour accents and a chart-first layout.",
  },
  {
    key: "professional",
    name: "Professional",
    description: "Classic business report with letterhead and tables.",
  },
  {
    key: "minimal",
    name: "Minimal",
    description: "Clean type, generous whitespace, no heavy borders.",
  },
  { key: "compact", name: "Compact", description: "Dense one-pager built for quick printing." },
] as const;

export const financialInsights = [
  {
    label: "Highest Revenue Month",
    value: "July 2026",
    sub: inr(138000),
    tone: "success" as const,
  },
  {
    label: "Lowest Revenue Month",
    value: "March 2026",
    sub: inr(118000),
    tone: "warning" as const,
  },
  {
    label: "Expected Revenue",
    value: inr(146500),
    sub: "Current month potential",
    tone: "primary" as const,
  },
  {
    label: "Outstanding Rent",
    value: inr(18000),
    sub: "4 tenants pending",
    tone: "danger" as const,
  },
  {
    label: "Collection Efficiency",
    value: "94%",
    sub: "+4% vs last month",
    tone: "success" as const,
  },
];

export const scheduledReportsSeed = [
  { id: 1, name: "Rent Collection Report", frequency: "Daily", channel: "WhatsApp", enabled: true },
  {
    id: 2,
    name: "Property Performance Report",
    frequency: "Weekly",
    channel: "Email",
    enabled: true,
  },
  { id: 3, name: "Monthly Summary", frequency: "Monthly", channel: "Email", enabled: false },
];

export const reportTableRows = [
  {
    date: "01 Aug 2026",
    tenant: "Rohan Mehta",
    property: "Metro Plaza",
    method: "Bank Transfer",
    amount: 4800,
    status: "Paid",
  },
  {
    date: "02 Aug 2026",
    tenant: "Ishita Bose",
    property: "Skyline PG",
    method: "UPI",
    amount: 5400,
    status: "Paid",
  },
  {
    date: "03 Aug 2026",
    tenant: "Rahul Sharma",
    property: "Skyline PG",
    method: "Cash",
    amount: 5000,
    status: "Paid",
  },
  {
    date: "03 Aug 2026",
    tenant: "Neha Patel",
    property: "Urban Nest",
    method: "UPI",
    amount: 3000,
    status: "Partial",
  },
  {
    date: "03 Aug 2026",
    tenant: "Amit Kumar",
    property: "Skyline PG",
    method: "UPI",
    amount: 4500,
    status: "Paid",
  },
  {
    date: "—",
    tenant: "Priya Singh",
    property: "Skyline PG",
    method: "—",
    amount: 4500,
    status: "Overdue",
  },
];
