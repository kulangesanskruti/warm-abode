import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, FileText, Megaphone, CircleCheck as CheckCircle2 } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import Modal from "@/components/rent/Modal";
import WhatsAppSummaryCards from "@/components/whatsapp/WhatsAppSummaryCards";
import SmartActions from "@/components/whatsapp/SmartActions";
import SmartRecommendations from "@/components/whatsapp/SmartRecommendations";
import MessageTemplates from "@/components/whatsapp/MessageTemplates";
import MessageComposer from "@/components/whatsapp/MessageComposer";
import RoomShareCard from "@/components/whatsapp/RoomShareCard";
import ReceiptSharing from "@/components/whatsapp/ReceiptSharing";
import ScheduledMessages from "@/components/whatsapp/ScheduledMessages";
import MessageHistory from "@/components/whatsapp/MessageHistory";
import CommunicationTimeline from "@/components/whatsapp/CommunicationTimeline";
import MessageAnalytics from "@/components/whatsapp/MessageAnalytics";
import Announcements from "@/components/whatsapp/Announcements";
import BulkReminders from "@/components/whatsapp/BulkReminders";
import EmptyState from "@/components/whatsapp/EmptyState";
import TemplateModal from "@/components/whatsapp/TemplateModal";
import { type MessageTemplate, type SmartAction } from "@/components/whatsapp/whatsappData";
import { useQueryClient } from "@tanstack/react-query";
import { sendWhatsAppMessage, whatsappErrorMessage } from "@/lib/whatsapp";

export default function WhatsAppCenter() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [composerOpen, setComposerOpen] = useState(false);
  const [templateModal, setTemplateModal] = useState<{
    template: MessageTemplate;
    mode: "preview" | "edit";
  } | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [hasMessages, setHasMessages] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (m: string) => setToast(m);

  const handleToggleFavorite = (id: number) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    showToast("Favorite updated");
  };

  const handleSmartAction = (a: SmartAction) => {
    if (a.id === 4) {
      showToast("Room sharing opened");
    } else {
      showToast(`${a.label} — ready to send`);
      setComposerOpen(true);
    }
  };

  const handleSend = async (msg: string, recipient: string, tenantId?: string) => {
    if (!tenantId) {
      showToast("Select a tenant before sending");
      return false;
    }
    try {
      const log = await sendWhatsAppMessage({ tenantId, message: msg });
      showToast(`Message delivered to ${recipient} (${log.phone})`);
      void queryClient.invalidateQueries({ queryKey: ["whatsapp"] });
      return true;
    } catch (error) {
      showToast(`Send failed: ${whatsappErrorMessage(error)}`);
      return false;
    }
  };

  const handleSchedule = () => {
    setScheduleOpen(true);
  };

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
                    WhatsApp Reminder Center
                  </h1>
                  <p className="mt-1 text-sm text-ink-500">Communicate with tenants in seconds.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setComposerOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-success-600 px-4 py-2.5 text-sm font-semibold text-white shadow-float transition-all hover:-translate-y-0.5 hover:bg-success-700"
                  >
                    <Plus className="h-4 w-4" /> New Message
                  </button>
                  <button
                    onClick={() => showToast("Template builder opened")}
                    className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-700"
                  >
                    <FileText className="h-4 w-4" /> Create Template
                  </button>
                  <button
                    onClick={() => showToast("Broadcast composer opened")}
                    className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-700"
                  >
                    <Megaphone className="h-4 w-4" /> Broadcast
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
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
              ) : hasMessages ? (
                <>
                  {/* Summary */}
                  <div className="mt-6">
                    <WhatsAppSummaryCards />
                  </div>

                  {/* Smart recommendations */}
                  <div className="mt-6">
                    <SmartRecommendations
                      onAction={(id) => showToast(`Recommendation ${id} actioned`)}
                    />
                  </div>

                  {/* Smart actions */}
                  <div className="mt-6">
                    <SmartActions onAction={handleSmartAction} />
                  </div>

                  {/* Composer */}
                  <div className="mt-8">
                    <MessageComposer
                      onSend={handleSend}
                      onSchedule={handleSchedule}
                      onToast={showToast}
                    />
                  </div>

                  {/* Message templates */}
                  <div className="mt-8">
                    <MessageTemplates
                      onPreview={(t) => setTemplateModal({ template: t, mode: "preview" })}
                      onEdit={(t) => setTemplateModal({ template: t, mode: "edit" })}
                      onSend={(t) => showToast(`${t.name} sent`)}
                      onToggleFavorite={handleToggleFavorite}
                      onDuplicate={(t) => showToast(`${t.name} duplicated`)}
                      favorites={favorites}
                    />
                  </div>

                  {/* Room sharing */}
                  <div className="mt-8">
                    <RoomShareCard onToast={showToast} />
                  </div>

                  {/* Receipt sharing */}
                  <div className="mt-8">
                    <ReceiptSharing onToast={showToast} />
                  </div>

                  {/* Bulk reminders */}
                  <div className="mt-8">
                    <BulkReminders onToast={showToast} />
                  </div>

                  {/* Scheduled + History */}
                  <div className="mt-8 grid gap-6 xl:grid-cols-2">
                    <ScheduledMessages onToast={showToast} />
                    <MessageHistory />
                  </div>

                  {/* Communication timeline */}
                  <div className="mt-8">
                    <CommunicationTimeline />
                  </div>

                  {/* Announcements */}
                  <div className="mt-8">
                    <Announcements onToast={showToast} />
                  </div>

                  {/* Analytics */}
                  <div className="mt-8">
                    <MessageAnalytics />
                  </div>

                  <div className="h-24" />
                </>
              ) : (
                <div className="mt-8">
                  <EmptyState
                    onAction={() => {
                      setHasMessages(true);
                      setComposerOpen(true);
                    }}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Composer modal */}
      <Modal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        title="New Message"
        subtitle="Compose and send a WhatsApp message"
        maxWidth="max-w-4xl"
      >
        <MessageComposer
          onSend={(msg, r, tenantId) => {
            void handleSend(msg, r, tenantId).then((ok) => {
              if (ok) setComposerOpen(false);
            });
          }}
          onSchedule={handleSchedule}
          onToast={showToast}
        />
      </Modal>

      {/* Template modal */}
      <TemplateModal
        open={templateModal !== null}
        template={templateModal?.template ?? null}
        mode={templateModal?.mode ?? "preview"}
        onClose={() => setTemplateModal(null)}
        onToast={showToast}
      />

      {/* Schedule modal */}
      <Modal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="Schedule Message"
        subtitle="Pick when this message should go out."
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">Date</span>
            <input
              type="date"
              className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">Time</span>
            <input
              type="time"
              className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Repeat
            </span>
            <select className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
              <option>One-time</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </label>
          <button
            onClick={() => {
              setScheduleOpen(false);
              showToast("Message scheduled successfully");
            }}
            className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-primary-700"
          >
            Save Schedule
          </button>
        </div>
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
