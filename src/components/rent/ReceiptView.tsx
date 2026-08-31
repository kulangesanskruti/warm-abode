import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import ReceiptPreview from "./ReceiptPreview";
import { fetchPaymentReceipt } from "@/lib/payments";
import { ApiError } from "@/lib/api";

interface Props {
  /** Payment whose receipt should be shown. */
  paymentId: string;
  compact?: boolean;
  onToast?: (message: string) => void;
}

/**
 * Loads the real receipt for a single payment from
 * GET /payments/:id/receipt and renders it with the existing receipt
 * design. No fallback/mock values — an unpaid payment surfaces the API's
 * "receipt not available yet" message instead.
 */
export default function ReceiptView({ paymentId, compact, onToast }: Props) {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["payments", "receipt", paymentId],
    queryFn: () => fetchPaymentReceipt(paymentId),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (isPending) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-ink-100 bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        <p className="text-sm font-medium text-ink-500">Loading receipt…</p>
      </div>
    );
  }

  if (isError || !data) {
    const message =
      error instanceof ApiError
        ? error.message
        : "Could not load this receipt. Please try again.";
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-warning-200 bg-warning-50 px-6 py-10 text-center">
        <AlertTriangle className="h-7 w-7 text-warning-600" />
        <p className="max-w-sm text-sm font-semibold text-warning-800">{message}</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-xl border border-warning-300 bg-white px-3 py-2 text-xs font-bold text-warning-800 transition-all hover:bg-warning-100"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Retry
        </button>
      </div>
    );
  }

  return <ReceiptPreview receipt={data} compact={compact ?? false} {...(onToast ? { onToast } : {})} />;
}
