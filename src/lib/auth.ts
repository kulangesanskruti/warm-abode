import { apiRequest, clearSession, setSession, type AuthUser } from "./api";

type AuthPayload = { user: AuthUser; accessToken: string };

export async function login(email: string, password: string): Promise<AuthUser> {
  const result = await apiRequest<AuthPayload>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setSession(result.accessToken, result.user);
  return result.user;
}

export async function register(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<AuthUser> {
  const result = await apiRequest<AuthPayload>("/auth/register", {
    method: "POST",
    body: input,
    auth: false,
  });
  setSession(result.accessToken, result.user);
  return result.user;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<unknown>("/auth/logout", { method: "POST" });
  } catch {
    // Logging out locally must succeed even if the server call fails.
  }
  clearSession();
}

export type DashboardAnalytics = {
  todayCollection: number;
  monthlyRevenue: number;
  expectedRevenue: number;
  pendingRent: number;
  overdueRent: number;
  collectionRate: number;
  occupancyRate: number;
  totalProperties: number;
  totalRooms: number;
  totalBeds: number;
  totalTenants: number;
};

export function fetchDashboard(): Promise<DashboardAnalytics> {
  return apiRequest<DashboardAnalytics>("/reports/dashboard");
}
