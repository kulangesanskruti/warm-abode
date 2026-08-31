import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Modal from "@/components/rent/Modal";
import { vacateTenant, TENANT_WRITE_INVALIDATIONS } from "@/lib/tenants";

interface Props {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  tenantName: string;
  securityDeposit?: number | string | null;
}

/**
 * Connects the existing "Mark Vacating" action to the existing backend
 * endpoint POST /tenants/:id/vacate. The backend stores vacatingDate,
 * reason, securityDepositReturned and finalNotes — the deposit/inspection
 * selections that have no dedicated backend column are appended to the
 * notes so nothing is silently dropped.
 */
export default function VacateTenantModal({
  open,
  onClose,
  tenantId,
  tenantName,
  securityDeposit,
}: Props) {
  const queryClient = useQueryClient();
  const [vacatingDate, setVacatingDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("");
  const [depositStatus, setDepositStatus] = useState<"FULL" | "PARTIAL" | "WITHHELD">("FULL");
  const [depositAmount, setDepositAmount] = useState("");
  const [inspection, setInspection] = useState<"PENDING" | "PASSED" | "ISSUES_FOUND">("PENDING");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setVacatingDate(new Date().toISOString().slice(0, 10));
    setReason("");
    setDepositStatus("FULL");
    setDepositAmount(String(Math.round(Number(securityDeposit ?? 0))));
    setInspection("PENDING");
    setNotes("");
  }, [open, securityDeposit]);

  const mutation = useMutation({
    mutationFn: () =>
      vacateTenant(tenantId, {
        vacatingDate: new Date(`${vacatingDate}T00:00:00`).toISOString(),
        reason: reason.trim(),
        securityDepositReturned:
          depositStatus === "WITHHELD" ? 0 : Math.max(Number(depositAmount) || 0, 0),
        finalNotes:
          `Deposit: ${depositStatus} · Room inspection: ${inspection}` +
          (notes.trim() ? ` · ${notes.trim()}` : ""),
      }),
    onSuccess: async () => {
      await Promise.all(
        TENANT_WRITE_INVALIDATIONS.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey: [...queryKey] }),
        ),
      );
      toast.success(`${tenantName} marked as vacated.`);
      onClose();
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Could not mark tenant as vacating."),
  });

  const disabled = mutation.isPending || reason.trim().length < 2;

  return (
    <Modal open={open} onClose={onClose} title="Mark Vacating" subtitle={tenantName}>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-600">Vacating Date</label>
          <input
            type="date"
            value={vacatingDate}
            onChange={(e) => setVacatingDate(e.target.value)}
            className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-600">Reason</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Relocating for work"
            className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600">
              Security Deposit Status
            </label>
            <select
              value={depositStatus}
              onChange={(e) => setDepositStatus(e.target.value as typeof depositStatus)}
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-primary-500 focus:outline-none"
            >
              <option value="FULL">Refunded in full</option>
              <option value="PARTIAL">Partially refunded</option>
              <option value="WITHHELD">Withheld</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-600">Amount Returned</label>
            <input
              type="number"
              min="0"
              value={depositStatus === "WITHHELD" ? "0" : depositAmount}
              disabled={depositStatus === "WITHHELD"}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-primary-500 focus:outline-none disabled:bg-ink-50"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-600">
            Room Inspection Status
          </label>
          <select
            value={inspection}
            onChange={(e) => setInspection(e.target.value as typeof inspection)}
            className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-primary-500 focus:outline-none"
          >
            <option value="PENDING">Pending</option>
            <option value="PASSED">Passed</option>
            <option value="ISSUES_FOUND">Issues found</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-600">Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            Cancel
          </button>
          <button
            disabled={disabled}
            onClick={() => mutation.mutate()}
            className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {mutation.isPending ? "Saving…" : "Confirm Vacating"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
