import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { deleteTenant, TENANT_WRITE_INVALIDATIONS } from "@/lib/tenants";

interface DeleteTenantDialogProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  tenantName: string;
  /** Called after a successful delete (e.g. to navigate away from a profile). */
  onDeleted?: () => void;
}

export default function DeleteTenantDialog({
  open,
  onClose,
  tenantId,
  tenantName,
  onDeleted,
}: DeleteTenantDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deleteTenant(tenantId),
    onSuccess: () => {
      for (const key of TENANT_WRITE_INVALIDATIONS) {
        queryClient.invalidateQueries({ queryKey: [...key] });
      }
      onClose();
      onDeleted?.();
    },
  });

  const message =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Could not delete tenant. Please try again."
        : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-full border border-danger-200 bg-danger-50 p-3">
                <AlertTriangle className="h-6 w-6 text-danger-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-ink-900">Delete tenant?</h3>
                <p className="mt-2 text-sm text-ink-600">
                  <span className="font-medium text-ink-900">{tenantName}</span> will be removed
                  from the tenant list and their bed released back to the room.
                </p>
                {message && <p className="mt-3 text-sm text-danger-600">{message}</p>}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
              >
                Cancel
              </button>
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="rounded-lg bg-danger-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-danger-700 disabled:opacity-60"
              >
                {mutation.isPending ? "Deleting…" : "Delete Tenant"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
