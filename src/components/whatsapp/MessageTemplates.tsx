import { motion } from "framer-motion";
import { Eye, Pencil, Copy, Send, Star, StarOff } from "lucide-react";
import { messageTemplates, templateAccentMap, type MessageTemplate } from "./whatsappData";

interface Props {
  onPreview: (t: MessageTemplate) => void;
  onEdit: (t: MessageTemplate) => void;
  onSend: (t: MessageTemplate) => void;
  onToggleFavorite: (id: number) => void;
  onDuplicate: (t: MessageTemplate) => void;
  favorites: Record<number, boolean>;
}

export default function MessageTemplates({
  onPreview,
  onEdit,
  onSend,
  onToggleFavorite,
  onDuplicate,
  favorites,
}: Props) {
  return (
    <section>
      <div className="min-w-0">
        <h2 className="text-base font-extrabold text-ink-900">Message Templates</h2>
        <p className="mt-0.5 text-sm text-ink-500">
          Pre-written messages ready to send or customize.
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {messageTemplates.map((t, i) => {
          const accent = templateAccentMap[t.accent];
          const isFav = favorites[t.id] ?? t.favorite;
          return (
            <motion.article
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${accent.bg}`}
                >
                  {t.emoji}
                </span>
                <button
                  onClick={() => onToggleFavorite(t.id)}
                  aria-label="Toggle favorite"
                  className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-50 hover:text-warning-500"
                >
                  {isFav ? (
                    <Star className="h-4.5 w-4.5 fill-warning-500 text-warning-500" />
                  ) : (
                    <StarOff className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>

              <p className="mt-3 text-sm font-extrabold text-ink-900">{t.name}</p>
              <p className="mt-1 text-xs font-semibold text-ink-400">
                {t.category} · {t.uses} uses
              </p>
              <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-ink-500">
                {t.body}
              </p>

              <div className="mt-4 grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => onPreview(t)}
                  aria-label="Preview"
                  className="inline-flex items-center justify-center rounded-lg border border-ink-200 py-2 text-ink-600 transition-all hover:border-primary-200 hover:text-primary-700"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onEdit(t)}
                  aria-label="Edit"
                  className="inline-flex items-center justify-center rounded-lg border border-ink-200 py-2 text-ink-600 transition-all hover:border-primary-200 hover:text-primary-700"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDuplicate(t)}
                  aria-label="Duplicate"
                  className="inline-flex items-center justify-center rounded-lg border border-ink-200 py-2 text-ink-600 transition-all hover:border-primary-200 hover:text-primary-700"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onSend(t)}
                  aria-label="Send"
                  className="inline-flex items-center justify-center rounded-lg bg-primary-600 py-2 text-white transition-all hover:bg-primary-700"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
