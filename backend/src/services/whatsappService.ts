import { isMockWhatsApp, whatsappProvider } from "../providers/whatsappProvider";
import { whatsappRepository } from "../repositories/whatsappRepository";
import { ApiError, HttpStatusCode } from "../utils/errors";
import { maskPhone, normalizeWhatsAppPhone } from "../utils/phone";
import { renderTemplate } from "./templateEngine";

const text = (value: unknown) => (value == null ? "" : String(value));

export const whatsappService = {
  async send(ownerId: string, input: any) {
    const existing =
      input.idempotencyKey &&
      (await whatsappRepository.findByIdempotency(ownerId, input.idempotencyKey));
    if (existing) return existing;
    const tenant = input.tenantId
      ? await whatsappRepository.findTenant(ownerId, input.tenantId)
      : null;
    if (input.tenantId && !tenant)
      throw new ApiError("Tenant not found or not owned by user", HttpStatusCode.NOT_FOUND);
    const template = input.templateName
      ? await whatsappRepository.getTemplate(ownerId, input.templateName)
      : null;
    if (input.templateName && !template)
      throw new ApiError(
        `WhatsApp template "${input.templateName}" was not found or is inactive`,
        HttpStatusCode.NOT_FOUND,
      );
    const message =
      input.message ||
      (template
        ? renderTemplate(template.body, {
            ...(input.variables || {}),
            tenantName: tenant?.fullName || "",
          })
        : "");
    if (!String(message).trim())
      throw new ApiError("Message body is empty", HttpStatusCode.BAD_REQUEST);
    const rawPhone = input.phone || input.recipient || tenant?.phone;
    if (!rawPhone)
      throw new ApiError(
        tenant
          ? `${tenant.fullName} has no phone number saved. Add a WhatsApp number to the tenant first.`
          : "Recipient phone number is required",
        HttpStatusCode.BAD_REQUEST,
      );
    // Throws a 400 with an actionable message when the number can't be made E.164.
    const phone = normalizeWhatsAppPhone(rawPhone);
    const log = await whatsappRepository.createLog({
      ownerId,
      tenantId: tenant?.id || input.tenantId,
      propertyId: tenant?.propertyId || input.propertyId,
      paymentId: input.paymentId,
      phone,
      templateName: input.templateName,
      messageType: input.messageType || "OTHER",
      message,
      provider: isMockWhatsApp() ? "mock" : "twilio",
      status: "QUEUED",
      scheduledAt: input.scheduledAt,
      idempotencyKey: input.idempotencyKey,
      mediaUrl: input.mediaUrl,
      metadata: {},
    });
    if (input.scheduledAt && input.scheduledAt > new Date()) return log;
    try {
      const result = await whatsappProvider.send({
        to: phone,
        body: message,
        mediaUrl: input.mediaUrl,
      });
      const sent = await whatsappRepository.updateLog(log.id, {
        status: result.status,
        providerMessageId: result.providerMessageId,
        sentAt: new Date(),
        retryCount: 0,
      });
      await whatsappRepository.analytics(ownerId, log.id, "SENT", {
        provider: result.providerMessageId,
      });
      await whatsappRepository.activity(
        ownerId,
        log.id,
        `WhatsApp message sent to ${maskPhone(phone)}`,
      );
      return sent;
    } catch (error) {
      const reason = text(error instanceof Error ? error.message : error) || "Unknown send failure";
      await whatsappRepository.updateLog(log.id, {
        status: "FAILED",
        error: reason,
        retryCount: 1,
      });
      await whatsappRepository.analytics(ownerId, log.id, "FAILED", { retryCount: 1 });
      // Surface the real reason to the client instead of a record object / generic 500.
      throw error instanceof ApiError
        ? error
        : new ApiError(
            `WhatsApp message to ${maskPhone(phone)} failed: ${reason}`,
            HttpStatusCode.BAD_REQUEST,
          );
    }
  },
  async reminder(ownerId: string, input: any) {
    const ids = input.tenantIds || (input.tenantId ? [input.tenantId] : []);
    const paymentIds = input.paymentIds || (input.paymentId ? [input.paymentId] : []);
    const targets = ids.length
      ? await Promise.all(
          ids.map((tenantId: string) => whatsappRepository.findTenant(ownerId, tenantId)),
        )
      : await Promise.all(
          paymentIds.map((paymentId: string) => whatsappRepository.findPayment(ownerId, paymentId)),
        );
    return Promise.all(
      targets
        .filter(Boolean)
        .map((target: any) =>
          this.send(ownerId, {
            tenantId: target.tenantId ? target.id : target.tenant.id,
            paymentId: target.id && target.tenantId ? target.id : undefined,
            message:
              input.message ||
              `${input.reminderType} rent reminder for ${target.fullName || target.tenant.fullName}.`,
            templateName: input.templateName,
            variables: input.variables,
            scheduledAt: input.scheduledAt,
            messageType: "PAYMENT_REMINDER",
          }),
        ),
    );
  },
  async receipt(ownerId: string, input: any) {
    const receipt = await whatsappRepository.findReceipt(
      ownerId,
      input.receiptId || input.paymentId,
    );
    if (!receipt)
      throw new ApiError("Receipt not found or not owned by user", HttpStatusCode.NOT_FOUND);
    return this.send(ownerId, {
      phone: input.phone || input.recipient || receipt.tenant.phone,
      tenantId: receipt.tenantId,
      propertyId: receipt.propertyId,
      paymentId: receipt.paymentId,
      message:
        input.message ||
        `Payment receipt ${receipt.receiptNumber} for ${receipt.tenant.fullName}: ${receipt.amount}.`,
      mediaUrl: receipt.pdfUrl || undefined,
      messageType: "RECEIPT",
      scheduledAt: input.scheduledAt,
    });
  },
  async shareRoom(ownerId: string, input: any) {
    const room = await whatsappRepository.findRoom(ownerId, input.roomId);
    if (!room) throw new ApiError("Room not found or not owned by user", HttpStatusCode.NOT_FOUND);
    const vacant = room.beds.filter((bed: any) => bed.status === "VACANT").length;
    return this.send(ownerId, {
      phone: input.phone || input.recipient,
      propertyId: room.propertyId,
      message: `Room ${room.roomNumber} at ${room.property.propertyName} has ${vacant} vacant bed(s).`,
      mediaUrl: input.includeImage ? input.imageUrl : undefined,
      messageType: "ROOM_AVAILABILITY",
      scheduledAt: input.scheduledAt,
    });
  },
  async broadcast(ownerId: string, input: any) {
    const properties = await whatsappRepository.findProperties(
      ownerId,
      input.allProperties
        ? undefined
        : input.propertyIds || (input.propertyId ? [input.propertyId] : undefined),
    );
    const tenants = input.tenantIds
      ? await Promise.all(
          input.tenantIds.map((id: string) => whatsappRepository.findTenant(ownerId, id)),
        )
      : properties.flatMap((property: any) => property.tenants || []);
    const phones = [
      ...new Set([
        ...(input.phoneNumbers || []),
        ...tenants.filter(Boolean).map((tenant: any) => tenant.phone),
      ]),
    ];
    return Promise.all(
      phones.map((phone) =>
        this.send(ownerId, {
          phone,
          message: input.message,
          templateName: input.templateName,
          variables: input.variables,
          scheduledAt: input.scheduledAt,
          messageType: "BROADCAST",
        }),
      ),
    );
  },
  async history(ownerId: string, query: any) {
    return whatsappRepository.history(ownerId, query);
  },
  async templates(ownerId: string) {
    return whatsappRepository.listTemplates(ownerId);
  },
  async createTemplate(ownerId: string, data: any) {
    return whatsappRepository.createTemplate(ownerId, { ...data, variables: data.variables || [] });
  },
  async updateTemplate(ownerId: string, id: string, data: any) {
    return whatsappRepository.updateTemplate(ownerId, id, data);
  },
};
