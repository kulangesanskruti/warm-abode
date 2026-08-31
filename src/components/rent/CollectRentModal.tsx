import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  Smartphone,
  Landmark,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import Modal from "./Modal";
import ReceiptView from "./ReceiptView";
import { inr, type PaymentMethod, type PaymentRecord } from "./rentData";

interface Props {
  open: boolean;
  payment: PaymentRecord | null;
  onClose: () => void;
  onToast?: (message: string) => void;
  onCollected: (
    payment: PaymentRecord,
    amount: number,
    method: PaymentMethod,
    reference: string,
    notes: string,
  ) => Promise<void>;
}

const methods: { key: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { key: "Cash", label: "Cash", icon: Banknote },
  { key: "UPI", label: "UPI", icon: Smartphone },
  { key: "Bank Transfer", label: "Bank", icon: Landmark },
  { key: "Card", label: "Card", icon: CreditCard },
];

export default function CollectRentModal({ open, payment, onClose, onCollected, onToast }: Props) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && payment) {
      const outstanding = payment.outstanding || payment.monthlyRent;
      setAmount(String(outstanding));
      setMethod("UPI");
      setReference("");
      setNotes("");
      setDone(false);
      setError(null);
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [open, payment]);

  if (!payment) return null;

  const outstanding = payment.outstanding || payment.monthlyRent;
  const received = Number(amount) || 0;
  const remaining = Math.max(outstanding - received, 0);

  const handleCollect = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onCollected(payment, received, method, reference || "CASH-COUNTER", notes);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={done ? "Payment Collected" : "Collect Rent"}
      subtitle={`${payment.name} · Room ${payment.room} · Bed ${payment.bed}`}
    >
      {done ? (
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
            className="flex flex-col items-center rounded-2xl bg-success-50 px-6 py-7 text-center"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 14 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-success-500 text-white shadow-float"
            >
              <CheckCircle2 className="h-9 w-9" />
            </motion.span>
            <h3 className="mt-4 text-lg font-extrabold text-success-700">
              {inr(received)} collected
            </h3>
            <p className="mt-1 text-sm text-success-700/80">
              Status updated and receipt generated automatically.
            </p>
          </motion.div>

          <ReceiptView paymentId={payment.id} {...(onToast ? { onToast } : {})} />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-ink-50 p-4">
            <img
              src={payment.photo}
              alt={payment.name}
              className="h-14 w-14 rounded-xl object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink-900">{payment.name}</p>
              <p className="truncate text-xs text-ink-500">
                {payment.property} · Room {payment.room} · Bed {payment.bed}
              </p>
              <p className="mt-1 text-xs font-semibold text-ink-700">
                Monthly Rent {inr(payment.monthlyRent)} · Outstanding{" "}
                <span className="text-warning-700">{inr(outstanding)}</span>
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-700">
                Amount Received
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-semibold text-ink-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-700">Payment Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-semibold text-ink-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </label>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-primary-50 px-4 py-3">
            <span className="text-sm font-semibold text-primary-800">Remaining Balance</span>
            <span className="text-lg font-extrabold text-primary-800">{inr(remaining)}</span>
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold text-ink-700">Payment Method</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {methods.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setMethod(key)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-bold transition-all ${
                    method === key
                      ? "border-primary-300 bg-primary-50 text-primary-700 ring-2 ring-primary-100"
                      : "border-ink-200 text-ink-700 hover:border-primary-200"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-700">
                Reference Number
              </span>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="UPI / UTR / Cheque no."
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder-ink-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-700">Notes</span>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional note for this payment"
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder-ink-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </label>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {error && (
              <p className="w-full text-left text-sm font-semibold text-danger-600 sm:mr-auto sm:w-auto">
                {error}
              </p>
            )}
            <button
              onClick={onClose}
              className="rounded-xl border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-700 transition-all hover:bg-ink-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCollect}
              disabled={received <= 0 || submitting}
              className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-float transition-all hover:-translate-y-0.5 hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-500"
            >
              {submitting ? "Collecting…" : "Collect Payment"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
