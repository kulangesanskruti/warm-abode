import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoveHorizontal as MoreHorizontal, CheckCheck, X, ChevronRight } from "lucide-react";
import {
  priorityMeta,
  categoryMeta,
  groupMeta,
  quickActions,
  type NotificationItem,
  type TimeGroup,
} from "./notificationsData";

interface Props {
  /** API-backed notifications, already filtered by the parent screen. */
  items: NotificationItem[];
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onToast: (m: string) => void;
}

const groupOrder: TimeGroup[] = ["urgent", "today", "this-week", "earlier"];

export default function NotificationTimeline({ items, onMarkRead, onDismiss, onToast }: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = items;

  const grouped = groupOrder
    .map((g) => ({ group: g, items: filtered.filter((n) => n.group === g) }))
    .filter((g) => g.items.length > 0);

  const markRead = (id: string) => onMarkRead(id);

  const handleAction = (n: NotificationItem, actionId: string) => {
    const action = quickActions.find((a) => a.id === actionId);
    if (actionId === "dismiss") {
      onDismiss(n.id);
      return;
    }
    onToast(`${action?.label ?? n.action} — ${n.title}`);
    if (!n.read) onMarkRead(n.id);
  };

  if (filtered.length === 0) return null;

  return (
    <div className="space-y-8">
      {grouped.map(({ group, items: groupItems }) => {
        const meta = groupMeta[group];
        return (
          <section key={group}>
            <div className="mb-3 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${priorityMeta.high.dot}`} />
              <h3 className={`text-sm font-extrabold ${meta.tone}`}>{meta.label}</h3>
              <span className="text-xs font-medium text-ink-400">— {meta.description}</span>
              <span className="ml-auto rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-bold text-ink-600">
                {groupItems.length}
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {groupItems.map((n, i) => {
                  const pm = priorityMeta[n.priority];
                  const cm = categoryMeta[n.category];
                  const Icon = n.icon;
                  return (
                    <motion.article
                      key={n.id}
                      layout
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.35, delay: i * 0.05 }}
                      className={`group relative overflow-hidden rounded-2xl border bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-glow ${
                        n.read ? "border-ink-100" : `${pm.border} ring-1 ${pm.ring}`
                      }`}
                    >
                      {/* Unread accent bar */}
                      {!n.read && (
                        <span className={`absolute left-0 top-0 h-full w-1.5 ${pm.dot}`} />
                      )}

                      <div className="p-4 pl-5 sm:p-5">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:gap-4">
                          {/* Left: icon + content */}
                          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                            <span
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${pm.bg} ${pm.text}`}
                            >
                              <Icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-extrabold text-ink-900">{n.title}</p>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${pm.bg} ${pm.text}`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${pm.dot}`} />{" "}
                                  {pm.label}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-600">
                                  {cm.emoji} {cm.label}
                                </span>
                              </div>
                              <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
                                {n.description}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-ink-400">
                                <span>{n.time}</span>
                                {n.property && (
                                  <>
                                    <span className="text-ink-300">·</span>
                                    <span>{n.property}</span>
                                  </>
                                )}
                                {n.room && (
                                  <>
                                    <span className="text-ink-300">·</span>
                                    <span>Room {n.room}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: actions */}
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <div className="flex items-center gap-1">
                              {!n.read && (
                                <button
                                  onClick={() => markRead(n.id)}
                                  aria-label="Mark as read"
                                  className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-50 hover:text-primary-600"
                                >
                                  <CheckCheck className="h-4 w-4" />
                                </button>
                              )}
                              <div className="relative">
                                <button
                                  onClick={() => setOpenMenu(openMenu === n.id ? null : n.id)}
                                  aria-label="More options"
                                  className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-900"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                                <AnimatePresence>
                                  {openMenu === n.id && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                                      className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-ink-100 bg-white py-1 shadow-glow"
                                    >
                                      {quickActions.map((a) => (
                                        <button
                                          key={a.id}
                                          onClick={() => {
                                            handleAction(n, a.id);
                                            setOpenMenu(null);
                                          }}
                                          className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-ink-700 transition-colors hover:bg-ink-50"
                                        >
                                          <span>{a.emoji}</span> {a.label}
                                        </button>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAction(n, "collect-rent")}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-primary-700"
                            >
                              {n.action} <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          </section>
        );
      })}
    </div>
  );
}
