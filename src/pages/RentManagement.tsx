import { useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Search, MessageCircle, FileSpreadsheet, FileText, CheckCheck, X, CalendarPlus } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import RentSummaryCards from "@/components/rent/RentSummaryCards";
import SmartInsights from "@/components/rent/SmartInsights";
import PaymentCard from "@/components/rent/PaymentCard";
import CollectRentModal from "@/components/rent/CollectRentModal";
import PaymentHistoryModal from "@/components/rent/PaymentHistoryModal";
import GenerateRentModal from "@/components/rent/GenerateRentModal";
import Modal from "@/components/rent/Modal";
import ReceiptView from "@/components/rent/ReceiptView";
import MonthlyCollectionChart, {
  type MonthlyCollectionPoint,
} from "@/components/rent/MonthlyCollectionChart";
import TodaysCollections, { type TodaysCollection } from "@/components/rent/TodaysCollections";
import PendingPayments from "@/components/rent/PendingPayments";
import PaymentAnalytics from "@/components/rent/PaymentAnalytics";
import UpcomingDue from "@/components/rent/UpcomingDue";
import { apiRequest } from "@/lib/api";
import {
  fetchPayments,
  fetchPaymentDashboard,
  collectRent,
  recordPartialPayment,
  toApiPaymentMethod,
  toPaymentRecord,
  num,
  PAYMENT_WRITE_INVALIDATIONS,
  type ApiPayment,
  type GenerateMonthlyRentResult,
} from "@/lib/payments";
import { methodOptions, recentMonths, type PaymentMethod, type PaymentRecord } from "@/components/rent/rentData";

const filters = [
  { key: "all", label: "All" },
  { key: "paid", label: "Paid" },
  { key: "due-today", label: "Due Today" },
  { key: "pending", label: "Pending" },
  { key: "overdue", label: "Overdue" },
  { key: "partial", label: "Partial Payment" },
];

type ApiPropertyLite = { id: string; propertyName: string };

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-ink-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-2/3 animate-pulse rounded bg-ink-100" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-ink-100" />
        </div>
      </div>
      <div className="mt-4 h-16 animate-pulse rounded-xl bg-ink-50" />
      <div className="mt-4 h-8 w-1/2 animate-pulse rounded bg-ink-100" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-8 animate-pulse rounded-xl bg-ink-100" />
        ))}
      </div>
    </div>
  );
}

export default function RentManagement() {
  const queryClient = useQueryClient();
  const months = useMemo(() => recentMonths(6), []);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [propertyId, setPropertyId] = useState<string>("all");
  const [monthIndex, setMonthIndex] = useState(0);
  const [method, setMethod] = useState<string>(methodOptions[0] as string);
  const [selected, setSelected] = useState<string[]>([]);
  const [collectTarget, setCollectTarget] = useState<PaymentRecord | null>(null);
  const [historyTarget, setHistoryTarget] = useState<PaymentRecord | null>(null);
  const [receiptTarget, setReceiptTarget] = useState<PaymentRecord | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const selectedMonth = months[monthIndex] ?? months[0]!;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const { data: propertiesData } = useQuery({
    queryKey: ["properties", "for-rent-filter"],
    queryFn: () =>
      apiRequest<{ properties: ApiPropertyLite[] }>("/properties?limit=100&status=ACTIVE"),
  });
  const properties = propertiesData?.properties ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ["payments", "list", selectedMonth.month, selectedMonth.year, propertyId, method, query],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("month", String(selectedMonth.month));
      params.set("year", String(selectedMonth.year));
      if (propertyId !== "all") params.set("propertyId", propertyId);
      if (method !== "All Methods") {
        const code = Object.entries({ Cash: "CASH", UPI: "UPI", "Bank Transfer": "BANK_TRANSFER", Card: "CARD" }).find(
          ([label]) => label === method,
        )?.[1];
        if (code) params.set("paymentMethod", code);
      }
      if (query.trim()) params.set("search", query.trim());
      params.set("limit", "100");
      return fetchPayments(params.toString());
    },
  });

  const { data: dashboard } = useQuery({
    queryKey: ["payments", "dashboard"],
    queryFn: fetchPaymentDashboard,
  });

  // A wider, unfiltered pull (current + recent months) purely to build the
  // 6-month collection trend chart from real rows without adding a new
  // backend aggregate endpoint.
  const { data: trendData } = useQuery({
    queryKey: ["payments", "trend"],
    queryFn: () => fetchPayments("limit=500&sortBy=year&order=desc"),
  });

  const rawPayments: ApiPayment[] = data?.payments ?? [];
  const records = useMemo(() => rawPayments.map(toPaymentRecord), [rawPayments]);

  const stats = useMemo(() => {
    const pending = records.filter((r) => r.status === "overdue" || r.status === "due-soon");
    const overdue = records.filter((r) => r.status === "overdue");
    const dueToday = records.filter((r) => r.status !== "paid" && r.daysDelta === 0);
    const rents = records.map((r) => r.monthlyRent);
    const pendingAmount = pending.reduce((sum, r) => sum + r.outstanding, 0);
    const totalCollected = records.reduce((sum, r) => sum + r.paidAmount, 0);
    const expected = records.reduce((sum, r) => sum + r.monthlyRent, 0);
    const receipts = records.filter((r) => r.receiptNo !== "—").length;
    return {
      totalCollected,
      pendingAmount,
      pendingCount: pending.length,
      overdueAmount: overdue.reduce((sum, r) => sum + r.outstanding, 0),
      overdueCount: overdue.length,
      dueTodayCount: dueToday.length,
      expected,
      potential: totalCollected + pendingAmount,
      receipts,
      collectionRate: dashboard?.collectionRate ?? (expected > 0 ? Math.round((totalCollected / expected) * 100) : 0),
      average: rents.length ? Math.round(rents.reduce((sum, r) => sum + r, 0) / rents.length) : 0,
      highest: rents.length ? Math.max(...rents) : 0,
      lowest: rents.length ? Math.min(...rents) : 0,
    };
  }, [records, dashboard]);

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        const matchesFilter =
          filter === "all" ||
          (filter === "paid" && r.status === "paid") ||
          (filter === "overdue" && r.status === "overdue") ||
          (filter === "partial" && r.status === "partial") ||
          (filter === "pending" && r.outstanding > 0) ||
          (filter === "due-today" && r.status !== "paid" && r.daysDelta === 0);
        return matchesFilter;
      }),
    [records, filter],
  );

  const pendingList = records.filter((r) => r.outstanding > 0);
  const upcoming = records
    .filter((r) => r.status !== "paid" && r.daysDelta >= 0 && r.daysDelta <= 7)
    .sort((a, b) => a.daysDelta - b.daysDelta);

  const todaysCollections: TodaysCollection[] = useMemo(() => {
    const todayStr = new Date().toDateString();
    return rawPayments
      .filter((p) => p.paymentDate && new Date(p.paymentDate).toDateString() === todayStr)
      .sort((a, b) => new Date(b.paymentDate!).getTime() - new Date(a.paymentDate!).getTime())
      .map((p) => ({
        id: p.id,
        time: new Date(p.paymentDate!).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        name: p.tenant?.fullName ?? "—",
        amount: num(p.paidAmount),
        method:
          { CASH: "Cash", UPI: "UPI", BANK_TRANSFER: "Bank Transfer", CARD: "Card" }[p.paymentMethod] ??
          p.paymentMethod,
        room: `${p.room?.roomNumber ?? "—"} · Bed ${p.bed?.bedNumber ?? "—"}`,
      }));
  }, [rawPayments]);

  const monthlyTrend: MonthlyCollectionPoint[] = useMemo(() => {
    const all = trendData?.payments ?? [];
    const byKey = new Map<string, { collected: number; pending: number; expected: number }>();
    for (const p of all) {
      const key = `${p.year}-${p.month}`;
      const entry = byKey.get(key) ?? { collected: 0, pending: 0, expected: 0 };
      entry.collected += num(p.paidAmount);
      entry.pending += num(p.outstandingAmount);
      entry.expected += num(p.rentAmount);
      byKey.set(key, entry);
    }
    return [...months]
      .reverse()
      .map(({ month, year, label }) => {
        const entry = byKey.get(`${year}-${month}`) ?? { collected: 0, pending: 0, expected: 0 };
        return { month: label.split(" ")[0]!, ...entry };
      });
  }, [trendData, months]);

  const invalidateAfterWrite = () => {
    for (const key of PAYMENT_WRITE_INVALIDATIONS) queryClient.invalidateQueries({ queryKey: key });
  };

  const handleGenerated = (result: GenerateMonthlyRentResult) => {
    invalidateAfterWrite();
    // Newly generated rent affects each property's pending-rent aggregate
    // too, which lives under its own "properties"/"property" query keys —
    // not covered by PAYMENT_WRITE_INVALIDATIONS (rent collection doesn't
    // change property-level totals the same way generation does, since a
    // fresh PENDING record changes "amount owed" on the property card).
    queryClient.invalidateQueries({ queryKey: ["properties"] });
    queryClient.invalidateQueries({ queryKey: ["property"] });
    setToast(
      result.generated > 0
        ? `Generated rent for ${result.generated} tenant${result.generated === 1 ? "" : "s"}`
        : "No new rent records were needed — everyone already has one for this month",
    );
  };

  const handleCollected = async (
    record: PaymentRecord,
    amount: number,
    payMethod: PaymentMethod,
    reference: string,
    notes: string,
  ) => {
    const isFullPayment = amount >= record.outstanding;
    const body = {
      tenantId: record.tenantId,
      month: record.month,
      year: record.year,
      amountPaid: amount,
      paymentMethod: toApiPaymentMethod(payMethod),
      referenceNumber: reference,
      notes,
    };
    if (isFullPayment) {
      await collectRent(body);
    } else {
      await recordPartialPayment(body);
    }
    invalidateAfterWrite();
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const markSelectedPaid = async () => {
    const targets = records.filter((r) => selected.includes(r.id) && r.outstanding > 0);
    await Promise.all(
      targets.map((r) =>
        collectRent({
          tenantId: r.tenantId,
          month: r.month,
          year: r.year,
          amountPaid: r.outstanding,
          paymentMethod: "CASH",
          notes: "Marked paid via bulk action",
        }),
      ),
    );
    invalidateAfterWrite();
    setToast(`${targets.length} tenants marked as paid`);
    setSelected([]);
  };

  const selectStyle =
    "rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-800 outline-none transition-all hover:border-ink-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

  return (
    <div className="flex h-screen flex-col bg-ink-50">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 overflow-y-auto">
            <div className="px-6 py-8 sm:px-8 lg:px-10">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <h1 className="text-2xl font-extrabold text-ink-900">Rent Management</h1>
                  <p className="mt-1 text-sm text-ink-500">
                    Track, collect, and reconcile rent across every property.
                  </p>
                </div>
                <button
                  onClick={() => setGenerateOpen(true)}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-float transition-all hover:-translate-y-0.5 hover:bg-primary-700"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Generate This Month's Rent
                </button>
              </div>

              <RentSummaryCards
                totalCollected={stats.totalCollected}
                pendingAmount={stats.pendingAmount}
                pendingCount={stats.pendingCount}
                overdueAmount={stats.overdueAmount}
                overdueCount={stats.overdueCount}
                dueTodayCount={stats.dueTodayCount}
                receipts={stats.receipts}
                collectionRate={stats.collectionRate}
                onSelect={(status) => setFilter(status)}
                activeFilter={filter}
              />

              <SmartInsights
                collectionRate={stats.collectionRate}
                pendingAmount={stats.pendingAmount}
                pendingCount={stats.pendingCount}
                potential={stats.potential}
                onSendAll={() => setToast("Reminder feature coming soon")}
                onCollect={() => filtered[0] && setCollectTarget(filtered[0])}
              />

              <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by tenant, phone, or receipt no."
                      className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value)}
                      className={selectStyle}
                    >
                      <option value="all">All Properties</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.propertyName}
                        </option>
                      ))}
                    </select>
                    <select
                      value={monthIndex}
                      onChange={(e) => setMonthIndex(Number(e.target.value))}
                      className={selectStyle}
                    >
                      {months.map((m, i) => (
                        <option key={m.label} value={i}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <select value={method} onChange={(e) => setMethod(e.target.value)} className={selectStyle}>
                      {methodOptions.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {filters.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                        filter === f.key
                          ? "bg-primary-600 text-white shadow-float"
                          : "border border-ink-200 bg-white text-ink-700 hover:border-primary-200 hover:text-primary-700"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="mt-6">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <h2 className="truncate text-base font-extrabold text-ink-900">
                    Payments <span className="text-ink-400">({filtered.length})</span>
                  </h2>
                  <span className="shrink-0 text-xs font-semibold text-ink-500">{selectedMonth.label}</span>
                </div>

                {isLoading ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <CardSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <motion.div layout className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                      {filtered.map((p) => (
                        <PaymentCard
                          key={p.id}
                          payment={p}
                          selected={selected.includes(p.id)}
                          onToggleSelect={toggleSelect}
                          onCollect={setCollectTarget}
                          onReceipt={setReceiptTarget}
                          onHistory={setHistoryTarget}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}

                {!isLoading && filtered.length === 0 && (
                  <p className="mt-4 rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-12 text-center text-sm text-ink-500">
                    No payments match your filters.
                  </p>
                )}
              </section>

              <div className="mt-8 grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <MonthlyCollectionChart data={monthlyTrend} />
                </div>
                <TodaysCollections items={todaysCollections} />
              </div>

              <div className="mt-8 grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <PendingPayments items={pendingList} onCollect={setCollectTarget} />
                </div>
                <UpcomingDue items={upcoming} onCollect={setCollectTarget} />
              </div>

              <div className="mt-8">
                <PaymentAnalytics
                  average={stats.average}
                  highest={stats.highest}
                  lowest={stats.lowest}
                  expected={stats.expected}
                  efficiency={stats.collectionRate}
                />
              </div>

              <div className="h-24" />
            </div>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-3xl rounded-2xl border border-ink-200 bg-white/95 p-3 shadow-glow backdrop-blur sm:inset-x-8"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <p className="truncate px-2 text-sm font-bold text-ink-900">{selected.length} selected</p>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => setToast(`Reminder feature coming soon`)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-success-200 bg-success-50 px-3 py-2 text-xs font-bold text-success-700 transition-all hover:bg-success-100"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Reminder
                </button>
                <button
                  onClick={() => setToast("Combined PDF export coming soon")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-xs font-bold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700"
                >
                  <FileText className="h-3.5 w-3.5" /> Combined PDF
                </button>
                <button
                  onClick={() => setToast("Excel export coming soon")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-xs font-bold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" /> Export Excel
                </button>
                <button
                  onClick={markSelectedPaid}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-primary-700"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark as Paid
                </button>
                <button
                  onClick={() => setSelected([])}
                  aria-label="Clear selection"
                  className="rounded-xl p-2 text-ink-500 transition-colors hover:bg-ink-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <CollectRentModal
        open={collectTarget !== null}
        payment={collectTarget}
        onClose={() => setCollectTarget(null)}
        onCollected={handleCollected}
        onToast={setToast}
      />

      <PaymentHistoryModal
        open={historyTarget !== null}
        payment={historyTarget}
        onClose={() => setHistoryTarget(null)}
      />

      <Modal
        open={receiptTarget !== null}
        onClose={() => setReceiptTarget(null)}
        title="Receipt Preview"
        subtitle={receiptTarget ? `${receiptTarget.name} · ${receiptTarget.property}` : ""}
      >
        {receiptTarget && <ReceiptView paymentId={receiptTarget.id} onToast={setToast} />}
      </Modal>

      <GenerateRentModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        month={selectedMonth.month}
        year={selectedMonth.year}
        monthLabel={selectedMonth.label}
        propertyId={propertyId}
        propertyName={
          propertyId === "all"
            ? "All Properties"
            : (properties.find((p) => p.id === propertyId)?.propertyName ?? "Selected Property")
        }
        onGenerated={handleGenerated}
      />
    </div>
  );
}
