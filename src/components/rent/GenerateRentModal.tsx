import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarPlus, CheckCircle2, AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import { generateMonthlyRent, type GenerateMonthlyRentResult } from "@/lib/payments";
import { ApiError } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  month: number;
  year: number;
  monthLabel: string;
  propertyId: string | "all";
  propertyName: string;
  /** Called once generation succeeds, so the caller can invalidate/refetch. */
  onGenerated: (result: GenerateMonthlyRentResult) => void;
}

export default function GenerateRentModal({
  open,
  onClose,
  month,
  year,
  monthLabel,
  propertyId,
  propertyName,
  onGenerated,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateMonthlyRentResult | null>(null);

  // Reset to the confirmation step every time the modal is reopened, so a
  // previous run's result/error never bleeds into the next one.
  useEffect(() => {
    if (open) {
      setSubmitting(false);
      setError(null);
      setResult(null);
    }
  }, [open]);

  const handleGenerate = async () => {
    // Guards against a double-submit from a fast double-click or a stuck
    // keyboard "Enter" repeat — the button is also visually disabled while
    // submitting, this is the belt-and-braces check.
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const body = propertyId === "all" ? { month, year } : { month, year, propertyId };
      const res = await generateMonthlyRent(body);
      setResult(res);
      onGenerated(res);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not generate rent right now. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={result ? "Rent Generated" : "Generate This Month's Rent"}
      subtitle={`${monthLabel} · ${propertyName}`}
    >
      {result ? (
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
              {result.generated} rent record{result.generated === 1 ? "" : "s"} generated
            </h3>
            <p className="mt-1 text-sm text-success-700/80">
              {result.skipped > 0
                ? `${result.skipped} tenant${result.skipped === 1 ? "" : "s"} already had rent for ${monthLabel} and were skipped.`
                : "Every active tenant now has a rent record for this month."}
            </p>
          </motion.div>

          {result.errors.length > 0 && (
            <div className="rounded-2xl border border-warning-200 bg-warning-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-warning-700">
                <AlertTriangle className="h-4 w-4" />
                {result.errors.length} tenant{result.errors.length === 1 ? "" : "s"} could not be
                processed
              </div>
              <ul className="mt-2 space-y-1 text-xs text-warning-700/90">
                {result.errors.map((message, i) => (
                  <li key={i}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-float transition-all hover:-translate-y-0.5 hover:bg-primary-700"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-ink-50 p-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
              <CalendarPlus className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink-900">{monthLabel}</p>
              <p className="truncate text-sm text-ink-600">{propertyName}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-primary-100 bg-primary-50 p-4 text-sm text-primary-800">
            This creates a rent record for every active tenant
            {propertyId === "all" ? "" : " in this property"} who doesn't already have one for{" "}
            <strong>{monthLabel}</strong>. Tenants who already have a rent record for this month
            are skipped automatically — running this again is always safe and will never create
            duplicates.
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {error && (
              <p className="w-full text-left text-sm font-semibold text-danger-600 sm:mr-auto sm:w-auto">
                {error}
              </p>
            )}
            <button
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-700 transition-all hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={submitting}
              className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-float transition-all hover:-translate-y-0.5 hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-500"
            >
              {submitting ? "Generating…" : "Generate Rent"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
