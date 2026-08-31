import { motion } from "framer-motion";
import {
  IndianRupee,
  ReceiptText,
  History,
  MessageCircle,
  CalendarClock,
  BedDouble,
  Building2,
  CreditCard,
} from "lucide-react";
import { inr, statusMeta, type PaymentRecord } from "./rentData";
import { isReceiptAvailable } from "@/lib/payments";


interface Props {
  payment: PaymentRecord;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onCollect: (payment: PaymentRecord) => void;
  onReceipt: (payment: PaymentRecord) => void;
  onHistory: (payment: PaymentRecord) => void;
}

function daysLabel(delta: number) {
  if (delta === 0) return "Due today";
  if (delta < 0) return `${Math.abs(delta)} days overdue`;
  return `${delta} days remaining`;
}

export default function PaymentCard({
  payment,
  selected,
  onToggleSelect,
  onCollect,
  onReceipt,
  onHistory,
}: Props) {
  const meta = statusMeta[payment.status];
  const isPaid = payment.status === "paid";
  /** Receipts only exist for money actually collected. */
  const receiptAvailable = isReceiptAvailable(payment);


  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35 }}
      className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow ${
        selected ? "border-primary-300 ring-2 ring-primary-100" : "border-ink-100"
      }`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${meta.dot}`} />

      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(payment.id)}
            aria-label={`Select ${payment.name}`}
            className="h-4 w-4 shrink-0 cursor-pointer rounded border-ink-300 text-primary-600 accent-primary-600"
          />
          <img
            src={payment.photo}
            alt={payment.name}
            loading="lazy"
            className={`h-12 w-12 shrink-0 rounded-xl object-cover ring-2 ${meta.ring}`}
          />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-ink-900">{payment.name}</h3>
            <p className="truncate text-xs text-ink-500">{payment.phone}</p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${meta.bg} ${meta.border} ${meta.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-ink-50 p-3 text-xs">
        <div className="flex min-w-0 items-center gap-2 text-ink-600">
          <Building2 className="h-3.5 w-3.5 shrink-0 text-ink-400" />
          <span className="truncate font-medium">{payment.property}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-ink-600">
          <BedDouble className="h-3.5 w-3.5 shrink-0 text-ink-400" />
          <span className="truncate font-medium">
            Room {payment.room} · Bed {payment.bed}
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-ink-600">
          <CalendarClock className="h-3.5 w-3.5 shrink-0 text-ink-400" />
          <span className="truncate font-medium">Due {payment.dueDate}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2 text-ink-600">
          <CreditCard className="h-3.5 w-3.5 shrink-0 text-ink-400" />
          <span className="truncate font-medium">{payment.method}</span>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-ink-500">Monthly Rent</p>
          <p className="text-xl font-extrabold tracking-tight text-ink-900">
            {inr(payment.monthlyRent)}
          </p>
          {payment.outstanding > 0 && (
            <p className="mt-0.5 text-xs font-bold text-warning-700">
              Outstanding {inr(payment.outstanding)}
            </p>
          )}
        </div>
        <span
          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
            payment.daysDelta < 0
              ? "bg-danger-50 text-danger-600"
              : payment.daysDelta === 0
                ? "bg-primary-50 text-primary-700"
                : "bg-ink-100 text-ink-600"
          }`}
        >
          {isPaid ? "Settled" : daysLabel(payment.daysDelta)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => onCollect(payment)}
          disabled={isPaid}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary-600 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-primary-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-500"
        >
          <IndianRupee className="h-3.5 w-3.5" /> Collect Rent
        </button>
        <button
          onClick={() => onReceipt(payment)}
          disabled={!receiptAvailable}
          title={
            receiptAvailable
              ? `View receipt ${payment.receiptNo}`
              : "Receipt is available once rent is collected"
          }
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-xs font-bold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700 disabled:cursor-not-allowed disabled:border-ink-100 disabled:bg-ink-50 disabled:text-ink-400 disabled:hover:border-ink-100 disabled:hover:text-ink-400"
        >
          <ReceiptText className="h-3.5 w-3.5" /> Receipt
        </button>

        <button
          onClick={() => onHistory(payment)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-xs font-bold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700"
        >
          <History className="h-3.5 w-3.5" /> History
        </button>
        <button className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-success-200 bg-success-50 px-3 py-2 text-xs font-bold text-success-700 transition-all hover:bg-success-100">
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </button>
      </div>
    </motion.article>
  );
}
