import { useRef, useState } from "react";
import { FileText, ExternalLink, Upload } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import {
  DOCUMENT_TYPES,
  documentLabel,
  formatDate,
  uploadTenantDocument,
  type ApiTenantDetail,
  type DocumentType,
} from "@/lib/tenants";

interface TenantDocumentsProps {
  tenant: ApiTenantDetail;
}

export default function TenantDocuments({ tenant }: TenantDocumentsProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("AADHAAR");

  const documents = tenant.documents ?? [];

  const mutation = useMutation({
    mutationFn: (file: File) => uploadTenantDocument(tenant.id, file, documentType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", tenant.id] });
      if (inputRef.current) inputRef.current.value = "";
    },
  });

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Could not upload the document. Please try again."
        : null;

  return (
    <div className="space-y-6">
      {documents.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border border-ink-100 bg-white p-4 transition-all hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-lg bg-ink-50 p-2">
                  <FileText className="h-5 w-5 text-ink-600" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink-900">
                    {documentLabel(doc.documentType)}
                  </p>
                  <p className="text-xs text-ink-600">Uploaded {formatDate(doc.uploadedAt)}</p>
                </div>
              </div>

              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 rounded-lg border border-ink-200 py-2 text-xs font-medium text-ink-700 hover:bg-ink-50"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open document
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-ink-200 py-10 text-center">
          <p className="text-ink-600">No documents uploaded for this tenant yet</p>
        </div>
      )}

      <div className="rounded-lg border-2 border-dashed border-ink-200 p-8 text-center transition-colors hover:border-primary-300">
        <Upload className="mx-auto mb-3 h-12 w-12 text-ink-300" />
        <p className="font-medium text-ink-900">Upload New Document</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            className="rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-primary-500 focus:outline-none"
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {documentLabel(type)}
              </option>
            ))}
          </select>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) mutation.mutate(file);
            }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={mutation.isPending}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {mutation.isPending ? "Uploading…" : "Choose File"}
          </button>
        </div>
        {errorMessage && <p className="mt-3 text-sm text-danger-600">{errorMessage}</p>}
      </div>
    </div>
  );
}
