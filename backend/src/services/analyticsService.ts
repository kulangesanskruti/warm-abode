import { reportRepository, ReportFilters } from "../repositories/reportRepository";

const n = (value: unknown) => Number(value || 0);
const money = (value: unknown) => Math.round(n(value) * 100) / 100;
export const analyticsService = {
  async dashboard(ownerId: string, filters: ReportFilters = {}) {
    const current = await reportRepository.payments(ownerId, filters);
    const properties = await reportRepository.properties(ownerId, filters.propertyId);
    const tenants = await reportRepository.tenants(ownerId, filters);
    const rooms = properties.flatMap((p: any) => p.rooms);
    const beds = rooms.flatMap((r: any) => r.beds);
    const revenue = current.reduce((s: number, p: any) => s + n(p.paidAmount), 0);
    const expected = current.reduce((s: number, p: any) => s + n(p.rentAmount), 0);
    const pending = current
      .filter((p: any) => ["PENDING", "PARTIAL"].includes(p.status))
      .reduce((s: number, p: any) => s + n(p.outstandingAmount), 0);
    const overdue = current
      .filter((p: any) => p.status === "OVERDUE")
      .reduce((s: number, p: any) => s + n(p.outstandingAmount), 0);
    return {
      todayCollection: money(
        current
          .filter(
            (p: any) =>
              p.paymentDate && new Date(p.paymentDate).toDateString() === new Date().toDateString(),
          )
          .reduce((s: number, p: any) => s + n(p.paidAmount), 0),
      ),
      monthlyRevenue: money(revenue),
      expectedRevenue: money(expected),
      pendingRent: money(pending),
      overdueRent: money(overdue),
      collectionRate: expected ? money((revenue / expected) * 100) : 0,
      occupancyRate: beds.length
        ? money((beds.filter((b: any) => b.status === "OCCUPIED").length / beds.length) * 100)
        : 0,
      totalProperties: properties.length,
      totalRooms: rooms.length,
      totalBeds: beds.length,
      totalTenants: tenants.length,
    };
  },
  async revenue(ownerId: string, filters: ReportFilters = {}) {
    const payments = await reportRepository.payments(ownerId, filters);
    const byMonth: Record<string, number> = {};
    payments.forEach((p: any) => {
      const key = `${p.year}-${String(p.month).padStart(2, "0")}`;
      byMonth[key] = (byMonth[key] || 0) + n(p.paidAmount);
    });
    const values = payments.map((p: any) => n(p.paidAmount));
    return {
      monthlyRevenue: money(values.reduce((a: number, b: number) => a + b, 0)),
      yearlyRevenue: money(values.reduce((a: number, b: number) => a + b, 0)),
      averageRent: values.length
        ? money(values.reduce((a: number, b: number) => a + b, 0) / values.length)
        : 0,
      collectionTrend: Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, amount]) => ({ period, amount: money(amount) })),
      highestPayingProperty: this.propertyRanking(payments, "desc"),
      lowestPayingProperty: this.propertyRanking(payments, "asc"),
    };
  },
  propertyRanking(payments: any[], direction: "asc" | "desc") {
    const grouped: Record<string, { propertyId: string; propertyName: string; revenue: number }> =
      {};
    payments.forEach((p) => {
      const key = p.propertyId;
      grouped[key] ||= {
        propertyId: key,
        propertyName: p.property?.propertyName || key,
        revenue: 0,
      };
      grouped[key].revenue += n(p.paidAmount);
    });
    return (
      Object.values(grouped).sort((a, b) =>
        direction === "desc" ? b.revenue - a.revenue : a.revenue - b.revenue,
      )[0] || null
    );
  },
  async occupancy(ownerId: string, filters: ReportFilters = {}) {
    const rooms = await reportRepository.rooms(ownerId, filters);
    return {
      rooms: rooms.map((r: any) => ({
        roomId: r.id,
        propertyId: r.propertyId,
        roomNumber: r.roomNumber,
        capacity: r.capacity,
        occupiedBeds: r.beds.filter((b: any) => b.status === "OCCUPIED").length,
        vacantBeds: r.beds.filter((b: any) => b.status === "VACANT").length,
        occupancy: r.capacity ? money((r.occupiedBeds / r.capacity) * 100) : 0,
        revenue: money(r.payments.reduce((s: number, p: any) => s + n(p.paidAmount), 0)),
      })),
    };
  },
  async businessHealth(ownerId: string, filters: ReportFilters = {}) {
    const dashboard = await this.dashboard(ownerId, filters);
    const maintenance = await reportRepository.maintenance(ownerId, filters.propertyId);
    const score = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          dashboard.collectionRate * 0.4 +
            dashboard.occupancyRate * 0.4 +
            (maintenance.filter((m: any) => m.status === "OPEN").length ? 10 : 20),
        ),
      ),
    );
    const grade = score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : "D";
    const recommendations = [
      dashboard.collectionRate < 85 && "Follow up on pending rent",
      dashboard.occupancyRate < 80 && "Review vacant beds and pricing",
      maintenance.some((m: any) => m.status === "OPEN") && "Resolve open maintenance issues",
    ].filter(Boolean);
    return {
      score,
      grade,
      factors: {
        collectionRate: dashboard.collectionRate,
        occupancyRate: dashboard.occupancyRate,
        pendingRent: dashboard.pendingRent,
        vacantBeds:
          dashboard.totalBeds - Math.round((dashboard.occupancyRate / 100) * dashboard.totalBeds),
        maintenanceIssues: maintenance.filter((m: any) => m.status === "OPEN").length,
      },
      recommendations,
    };
  },
  async cashbook(ownerId: string, filters: ReportFilters = {}) {
    const payments = await reportRepository.payments(ownerId, filters);
    const income = payments.reduce((s: number, p: any) => s + n(p.paidAmount), 0);
    const daily: Record<string, number> = {};
    payments.forEach((p: any) => {
      const key = p.paymentDate ? new Date(p.paymentDate).toISOString().slice(0, 10) : "unpaid";
      daily[key] = (daily[key] || 0) + n(p.paidAmount);
    });
    return {
      openingBalance: 0,
      income: money(income),
      expenses: 0,
      closingBalance: money(income),
      dailySummary: Object.entries(daily).map(([date, amount]) => ({
        date,
        income: money(amount),
        expenses: 0,
        closing: money(amount),
      })),
      monthlySummary: [{ income: money(income), expenses: 0, closing: money(income) }],
    };
  },
};
