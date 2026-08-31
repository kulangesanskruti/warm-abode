import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { saveTenantNotes, type ApiTenantDetail } from "@/lib/tenants";

interface TenantNotesProps {
  tenant: ApiTenantDetail;
}

export default function TenantNotes({ tenant }: TenantNotesProps) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(tenant.notes ?? "");

  useEffect(() => {
    setNotes(tenant.notes ?? "");
  }, [tenant.id, tenant.notes]);

  const mutation = useMutation({
    mutationFn: () => saveTenantNotes(tenant.id, notes.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", tenant.id] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Could not save the notes. Please try again."
        : null;

  const dirty = notes.trim() !== (tenant.notes ?? "").trim();

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-ink-100 bg-white p-4">
        <label className="text-sm font-medium text-ink-700" htmlFor="tenant-notes">
          Notes about this tenant
        </label>
        <textarea
          id="tenant-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add a note about this tenant..."
          rows={6}
          className="mt-2 w-full rounded-lg border border-ink-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-ink-500">
            {mutation.isSuccess && !dirty ? "Saved" : "Notes are stored on the tenant record."}
          </p>
          <button
            onClick={() => mutation.mutate()}
            disabled={!dirty || mutation.isPending}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? "Saving…" : "Save Notes"}
          </button>
        </div>
        {errorMessage && <p className="mt-2 text-sm text-danger-600">{errorMessage}</p>}
      </div>
    </div>
  );
}
