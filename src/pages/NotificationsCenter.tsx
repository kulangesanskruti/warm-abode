import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, Settings2, CircleCheck as CheckCircle2, TriangleAlert } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import Modal from "@/components/rent/Modal";
import NotificationSummaryCards from "@/components/notifications/NotificationSummaryCards";
import NotificationFilters from "@/components/notifications/NotificationFilters";
import NotificationTimeline from "@/components/notifications/NotificationTimeline";
import ActivityFeed from "@/components/notifications/ActivityFeed";
import NotificationPreferences from "@/components/notifications/NotificationPreferences";
import NotificationEmptyState from "@/components/notifications/NotificationEmptyState";
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  summarize,
  toActivityEntry,
  toNotificationItem,
} from "@/lib/notifications";

/**
 * Notification Center — 100% backed by the real `/notifications` API.
 * Notifications are created by the backend automation scheduler (monthly rent
 * generation, overdue detection). There is no mock/sample data on this screen.
 */
export default function NotificationsCenter() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: ["notifications", { page: 1, limit: 50 }],
    queryFn: () => fetchNotifications({ page: 1, limit: 50 }),
  });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (m: string) => setToast(m);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
  };

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      showToast("Marked as read");
      invalidate();
    },
    onError: () => showToast("Could not mark as read"),
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      showToast("All notifications marked as read");
      invalidate();
    },
    onError: () => showToast("Could not mark all as read"),
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      showToast("Notification dismissed");
      invalidate();
    },
    onError: () => showToast("Could not dismiss notification"),
  });

  const rows = useMemo(() => notificationsQuery.data?.items ?? [], [notificationsQuery.data]);
  const total = notificationsQuery.data?.total ?? rows.length;

  const items = useMemo(() => rows.map((n) => toNotificationItem(n)), [rows]);
  const activity = useMemo(() => rows.slice(0, 8).map((n) => toActivityEntry(n)), [rows]);
  const summary = useMemo(() => summarize(rows, total), [rows, total]);

  const filteredItems = items.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    if (filter === "high") return n.priority === "high";
    return n.category === filter;
  });

  const loading = notificationsQuery.isPending;
  const error = notificationsQuery.error;
  const hasNotifications = items.length > 0;

  return (
    <div className="flex h-screen flex-col bg-ink-50">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 overflow-y-auto">
            <div className="px-6 py-8 sm:px-8 lg:px-10">
              {/* Page header */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
                    Notifications
                  </h1>
                  <p className="mt-1 text-sm text-ink-500">
                    Stay updated with everything happening across your properties.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => markAllMutation.mutate()}
                    disabled={markAllMutation.isPending || summary.unread === 0}
                    className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    <CheckCheck className="h-4 w-4" />{" "}
                    {markAllMutation.isPending ? "Marking…" : "Mark All Read"}
                  </button>
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-float transition-all hover:-translate-y-0.5 hover:bg-primary-700"
                  >
                    <Settings2 className="h-4 w-4" /> Notification Settings
                  </button>
                </div>
              </div>

              {loading ? (
                <>
                  {/* Skeleton: summary cards */}
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card"
                      >
                        <div className="h-11 w-11 animate-pulse rounded-xl bg-ink-100" />
                        <div className="mt-4 h-3 w-2/3 animate-pulse rounded bg-ink-100" />
                        <div className="mt-2 h-6 w-1/2 animate-pulse rounded bg-ink-100" />
                        <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-ink-50" />
                      </div>
                    ))}
                  </div>
                  {/* Skeleton: timeline */}
                  <div className="mt-8 space-y-3">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card"
                      >
                        <div className="flex gap-4">
                          <div className="h-11 w-11 animate-pulse rounded-xl bg-ink-100" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3.5 w-2/3 animate-pulse rounded bg-ink-100" />
                            <div className="h-3 w-full animate-pulse rounded bg-ink-50" />
                            <div className="h-3 w-1/3 animate-pulse rounded bg-ink-50" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : error ? (
                <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-danger-200 bg-white py-20 text-center">
                  <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-danger-50 text-danger-600">
                    <TriangleAlert className="h-10 w-10" />
                  </span>
                  <h3 className="mt-6 text-lg font-extrabold text-ink-900">
                    Couldn't load notifications
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-ink-500">
                    {error instanceof Error
                      ? error.message
                      : "Something went wrong while reaching the server."}
                  </p>
                  <button
                    onClick={() => notificationsQuery.refetch()}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-float transition-all hover:-translate-y-0.5 hover:bg-primary-700"
                  >
                    Try again
                  </button>
                </div>
              ) : hasNotifications ? (
                <>
                  {/* Summary cards */}
                  <div className="mt-6">
                    <NotificationSummaryCards summary={summary} />
                  </div>

                  {/* Filters */}
                  <div className="mt-6">
                    <NotificationFilters active={filter} onChange={setFilter} />
                  </div>

                  {/* Timeline + Activity feed */}
                  <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <div>
                      {filteredItems.length > 0 ? (
                        <NotificationTimeline
                          items={filteredItems}
                          onMarkRead={(id) => markReadMutation.mutate(id)}
                          onDismiss={(id) => dismissMutation.mutate(id)}
                          onToast={showToast}
                        />
                      ) : (
                        <NotificationEmptyState onAction={() => setFilter("all")} />
                      )}
                    </div>
                    <div className="xl:sticky xl:top-6 xl:self-start">
                      <ActivityFeed entries={activity} />
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="mt-8">
                    <NotificationPreferences onToast={showToast} />
                  </div>

                  <div className="h-24" />
                </>
              ) : (
                <div className="mt-8">
                  <NotificationEmptyState onAction={() => notificationsQuery.refetch()} />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Settings modal */}
      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Notification Settings"
        subtitle="Choose what you want to be notified about."
        maxWidth="max-w-2xl"
      >
        <NotificationPreferences onToast={showToast} />
      </Modal>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="inline-flex items-center gap-2 rounded-2xl bg-ink-900 px-4 py-3 text-sm font-semibold text-white shadow-glow">
              <CheckCircle2 className="h-4 w-4 text-success-400" /> {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
