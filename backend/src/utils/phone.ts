import { ApiError, HttpStatusCode } from "./errors";

const E164 = /^\+[1-9]\d{7,14}$/;

/**
 * Default country code used when a stored phone number has no international prefix.
 * Configure with WHATSAPP_DEFAULT_COUNTRY_CODE (e.g. "+91").
 */
const defaultCountryCode = (): string => {
  const raw = (process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "+91").trim();
  const digits = raw.replace(/\D/g, "");
  return digits ? `+${digits}` : "+91";
};

/**
 * Normalizes any user/tenant supplied phone number to strict E.164 (`+<country><number>`),
 * which is what WhatsApp/Twilio requires. Throws a 400 with an actionable message otherwise.
 */
export const normalizeWhatsAppPhone = (value: unknown): string => {
  const input = String(value ?? "").trim();
  if (!input) {
    throw new ApiError("Recipient phone number is required", HttpStatusCode.BAD_REQUEST);
  }

  let raw = input.startsWith("whatsapp:") ? input.slice("whatsapp:".length) : input;
  raw = raw.trim();

  const hasPlus = raw.startsWith("+") || raw.startsWith("00");
  let digits = raw.replace(/\D/g, "");
  if (raw.startsWith("00")) digits = digits.replace(/^00/, "");

  if (!digits) {
    throw new ApiError(
      `"${input}" is not a valid phone number. Use international format, e.g. +919876543210.`,
      HttpStatusCode.BAD_REQUEST,
    );
  }

  let normalized: string;
  if (hasPlus) {
    normalized = `+${digits}`;
  } else {
    const country = defaultCountryCode();
    const local = digits.replace(/^0+/, "");
    // Already prefixed with the country code but missing the "+" (e.g. 919876543210).
    normalized = local.startsWith(country.slice(1)) && local.length > 10
      ? `+${local}`
      : `${country}${local}`;
  }

  if (!E164.test(normalized)) {
    throw new ApiError(
      `Phone number "${input}" could not be formatted for WhatsApp. Save it in international format, e.g. +919876543210.`,
      HttpStatusCode.BAD_REQUEST,
    );
  }
  return normalized;
};

export const maskPhone = (phone: string): string =>
  phone.length <= 6 ? phone : `${phone.slice(0, 5)}***${phone.slice(-2)}`;
