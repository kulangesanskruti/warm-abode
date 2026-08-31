import { ApiError, HttpStatusCode } from "../utils/errors";

export interface WhatsAppProviderInput {
  to: string;
  body: string;
  mediaUrl?: string;
}
export interface WhatsAppProviderResult {
  providerMessageId: string;
  status: string;
  raw?: unknown;
}
export interface WhatsAppProvider {
  send(input: WhatsAppProviderInput): Promise<WhatsAppProviderResult>;
}

/**
 * Mock provider. Only used when WHATSAPP_PROVIDER=mock is set EXPLICITLY,
 * so a missing/incorrect Twilio configuration can never look like a success.
 */
class MockWhatsAppProvider implements WhatsAppProvider {
  async send(input: WhatsAppProviderInput): Promise<WhatsAppProviderResult> {
    return {
      providerMessageId: `mock-${Date.now()}`,
      status: "SENT",
      raw: { to: input.to, mock: true },
    };
  }
}

class TwilioWhatsAppProvider implements WhatsAppProvider {
  async send(input: WhatsAppProviderInput): Promise<WhatsAppProviderResult> {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;

    const missing = [
      !sid && "TWILIO_ACCOUNT_SID",
      !token && "TWILIO_AUTH_TOKEN",
      !from && "TWILIO_WHATSAPP_FROM",
    ].filter(Boolean) as string[];
    if (missing.length) {
      throw new ApiError(
        `WhatsApp is not configured. Missing ${missing.join(", ")} on the server. Add the Twilio WhatsApp credentials (or set WHATSAPP_PROVIDER=mock for local testing).`,
        HttpStatusCode.SERVICE_UNAVAILABLE,
      );
    }

    const params = new URLSearchParams({
      From: from!.startsWith("whatsapp:") ? from! : `whatsapp:${from}`,
      To: input.to.startsWith("whatsapp:") ? input.to : `whatsapp:${input.to}`,
      Body: input.body,
    });
    if (input.mediaUrl) params.set("MediaUrl", input.mediaUrl);

    let response: Response;
    try {
      response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });
    } catch (error) {
      throw new ApiError(
        `Could not reach the WhatsApp provider: ${error instanceof Error ? error.message : "network error"}`,
        HttpStatusCode.SERVICE_UNAVAILABLE,
      );
    }

    const data = (await response.json().catch(() => ({}))) as {
      sid?: string;
      status?: string;
      message?: string;
      code?: number;
      more_info?: string;
    };

    if (!response.ok || !data.sid) {
      const detail = [
        data.message || `Provider responded with HTTP ${response.status}`,
        data.code ? `(Twilio code ${data.code})` : null,
      ]
        .filter(Boolean)
        .join(" ");
      throw new ApiError(
        `WhatsApp provider rejected the message: ${detail}`,
        response.status === 401 || response.status === 403
          ? HttpStatusCode.SERVICE_UNAVAILABLE
          : HttpStatusCode.BAD_REQUEST,
      );
    }

    const status = String(data.status || "SENT").toUpperCase();
    if (status === "FAILED" || status === "UNDELIVERED") {
      throw new ApiError(
        `WhatsApp provider returned status ${status}. Check that the recipient has opted in to your WhatsApp sender.`,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    return {
      providerMessageId: data.sid,
      status: status === "ACCEPTED" || status === "QUEUED" ? "SENT" : status,
      raw: { sid: data.sid, status: data.status },
    };
  }
}

export const isMockWhatsApp = (): boolean =>
  String(process.env.WHATSAPP_PROVIDER || "").toLowerCase() === "mock";

export const getWhatsAppProvider = (): WhatsAppProvider =>
  isMockWhatsApp() ? new MockWhatsAppProvider() : new TwilioWhatsAppProvider();

/** Lazy façade so env is read at send time, not at module load. */
export const whatsappProvider: WhatsAppProvider = {
  send: (input) => getWhatsAppProvider().send(input),
};
