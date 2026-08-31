/**
 * WhatsApp send helpers for the `/api/v1/whatsapp` endpoints.
 * Success is only reported when the backend log comes back with a sent status —
 * never optimistically.
 */
import { apiRequest, ApiError } from "@/lib/api";

export type WhatsAppLog = {
  id: string;
  phone: string;
  message: string;
  status: string;
  error?: string | null;
  providerMessageId?: string | null;
  sentAt?: string | null;
  scheduledAt?: string | null;
};

export type SendWhatsAppInput = {
  tenantId?: string;
  phone?: string;
  message: string;
  messageType?: string;
  propertyId?: string;
  paymentId?: string;
  mediaUrl?: string;
};

const SENT_STATUSES = new Set(["SENT", "DELIVERED", "READ", "ACCEPTED"]);

export function isSentStatus(status: string | undefined): boolean {
  return SENT_STATUSES.has(String(status ?? "").toUpperCase());
}

export async function sendWhatsAppMessage(input: SendWhatsAppInput): Promise<WhatsAppLog> {
  const log = await apiRequest<WhatsAppLog>("/whatsapp/send", {
    method: "POST",
    body: {
      ...(input.tenantId ? { tenantId: input.tenantId } : {}),
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.propertyId ? { propertyId: input.propertyId } : {}),
      ...(input.paymentId ? { paymentId: input.paymentId } : {}),
      ...(input.mediaUrl ? { mediaUrl: input.mediaUrl } : {}),
      message: input.message,
      messageType: input.messageType ?? "OTHER",
    },
  });

  if (!isSentStatus(log.status)) {
    throw new ApiError(
      log.error || `Message was not delivered (status: ${log.status || "UNKNOWN"})`,
      502,
    );
  }
  return log;
}

export function whatsappErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const fieldError = Object.values(error.fieldErrors)[0];
    return error.status === 0
      ? "Unable to reach the server. Check your connection and try again."
      : fieldError || error.message;
  }
  return error instanceof Error ? error.message : "Failed to send the WhatsApp message.";
}
