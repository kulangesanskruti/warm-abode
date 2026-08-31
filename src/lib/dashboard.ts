import { apiRequest } from "./api";

export type PaymentRecord = {
  id: string;
  tenantId: string;
  propertyId: string;
  roomId: string;
  month: number;
  year: number;
  rentAmount: string | number;
  paidAmount: string | number;
  outstandingAmount: string | number;
  status: "PENDING" | "PARTIAL" | "OVERDUE" | "PAID" | string;
  paymentDate: string | null;
  createdAt: string;
  tenant?: { id: string; fullName: string; phone?: string } | null;
  property?: { id: string; propertyName?: string } | null;
};

export type NotificationRecord = {
  id: string;
  title: string;
  message: string;
  type: "PAYMENT" | "MAINTENANCE" | "TENANT" | "ROOM" | "SYSTEM" | string;
  isRead: boolean;
  createdAt: string;
};

export type RevenueAnalytics = {
  monthlyRevenue: number;
  yearlyRevenue: number;
  averageRent: number;
  collectionTrend: { period: string; amount: number }[];
  highestPayingProperty: { propertyId: string; propertyName: string; revenue: number } | null;
  lowestPayingProperty: { propertyId: string; propertyName: string; revenue: number } | null;
};

export type OccupancyAnalytics = {
  rooms: {
    roomId: string;
    propertyId: string;
    roomNumber: string;
    capacity: number;
    occupiedBeds: number;
    vacantBeds: number;
    occupancy: number;
    revenue: number;
  }[];
};

export type BusinessHealth = {
  score: number;
  grade: string;
  factors: {
    collectionRate: number;
    occupancyRate: number;
    pendingRent: number;
    vacantBeds: number;
    maintenanceIssues: number;
  };
  recommendations: string[];
};

export const num = (value: unknown): number => Number(value ?? 0) || 0;

export const inr = (value: number): string => `₹${Math.round(value).toLocaleString("en-IN")}`;

export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export const fetchPendingPayments = () => apiRequest<PaymentRecord[]>("/payments/pending");
export const fetchOverduePayments = () => apiRequest<PaymentRecord[]>("/payments/overdue");
export const fetchRevenueAnalytics = () => apiRequest<RevenueAnalytics>("/reports/revenue");
export const fetchOccupancyAnalytics = () => apiRequest<OccupancyAnalytics>("/reports/occupancy");
export const fetchBusinessHealth = () => apiRequest<BusinessHealth>("/reports/business-health");
export const fetchNotifications = (limit = 6) =>
  apiRequest<{ items: NotificationRecord[]; total: number }>(
    `/notifications?page=1&limit=${limit}`,
  );
