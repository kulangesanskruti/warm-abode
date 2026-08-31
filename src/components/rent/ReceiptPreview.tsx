import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Printer, MessageCircle, QrCode, Loader2 } from "lucide-react";
import { inr } from "./rentData";
import {
  downloadReceiptPdf,
  formatReceiptDate,
  methodDisplay,
  monthLabel,
  receiptWhatsAppText,
  type RentReceipt,
} from "@/lib/payments";

interface Props {
  receipt: RentReceipt;
  compact?: boolean;
  onToast?: (message: string) => void;
}

/** Digits-only phone for a wa.me deep link. */
const waNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return digits.length === 10 ? `91${digits}` : digits;
};

export default function ReceiptPreview({ receipt, compact = false, onToast }: Props) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadReceiptPdf(receipt.paymentId, receipt.receiptNumber);
      onToast?.(`Receipt ${receipt.receiptNumber} downloaded`);
    } catch {
      onToast?.("Could not generate the receipt PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(receiptWhatsAppText(receipt));
    const number = waNumber(receipt.tenant.phone ?? "");
    window.open(
      number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
    onToast?.(`Receipt summary shared with ${receipt.tenant.fullName}`);
  };

  const address = [receipt.property.address, receipt.property.city].filter(Boolean).join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      id="receipt-print-area"
      className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card"
    >
      <div className="flex items-center justify-between bg-ink-900 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-black text-white">
            S
          </span>
          <div>
            <p className="text-sm font-extrabold text-white">StayHub</p>
            <p className="text-[11px] text-ink-400">Rent Payment Receipt</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-ink-400">Receipt No.</p>
          <p className="text-sm font-bold text-white">{receipt.receiptNumber}</p>
          <p className="text-[11px] font-bold text-success-200">{receipt.status}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-5 py-5 text-sm">
        {[
          ["Tenant Name", receipt.tenant.fullName],
          ["Tenant Phone", receipt.tenant.phone || "—"],
          ["Property", receipt.property.propertyName],
          ["Property Address", address || "—"],
          ["Room", receipt.room.number],
          ["Bed", receipt.bed.number],
          ["Rent Month", monthLabel(receipt.month, receipt.year)],
          ["Payment Date", formatReceiptDate(receipt.paymentDate)],
          ["Payment Method", methodDisplay(receipt.paymentMethod)],
          ["Transaction Reference", receipt.referenceNumber || "—"],
          ["Monthly Rent", inr(receipt.rentAmount)],
          [
            "Outstanding",
            receipt.outstandingAmount > 0 ? inr(receipt.outstandingAmount) : "Nil",
          ],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
              {label}
            </dt>
            <dd className="mt-0.5 truncate font-semibold text-ink-900">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mx-5 flex items-center justify-between rounded-xl bg-success-50 px-4 py-3">
        <span className="text-sm font-semibold text-success-700">Amount Paid</span>
        <span className="text-xl font-extrabold text-success-700">{inr(receipt.amountPaid)}</span>
      </div>

      <div className="flex items-end justify-between gap-4 px-5 py-5">
        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border border-dashed border-ink-300 text-ink-400">
          <QrCode className="h-7 w-7" />
          <span className="mt-1 text-[10px] font-medium">Verify QR</span>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">Received By</p>
          <p className="text-sm font-bold text-ink-900">{receipt.owner.fullName}</p>
          {receipt.owner.phone && (
            <p className="text-[11px] text-ink-500">{receipt.owner.phone}</p>
          )}
          <p className="mt-1 text-[11px] text-ink-400">
            Generated {formatReceiptDate(receipt.generatedAt)}
          </p>
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-1 gap-2 border-t border-ink-100 bg-ink-50 px-5 py-4 print:hidden sm:grid-cols-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-3 py-2.5 text-xs font-bold text-white transition-all hover:bg-primary-700 disabled:opacity-60"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}{" "}
            {downloading ? "Preparing…" : "Download PDF"}
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-xs font-bold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
          <button
            onClick={handleWhatsApp}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-success-200 bg-success-50 px-3 py-2.5 text-xs font-bold text-success-700 transition-all hover:bg-success-100"
          >
            <MessageCircle className="h-4 w-4" /> Share WhatsApp
          </button>
        </div>
      )}
    </motion.div>
  );
}
