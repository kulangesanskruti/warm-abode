import { notificationRepository } from "../repositories/notificationRepository";

const create = (
  userId: string,
  title: string,
  message: string,
  type: "PAYMENT" | "MAINTENANCE" | "TENANT" | "ROOM" | "SYSTEM",
  dedupeKey: string,
  extra: Record<string, unknown> = {},
) => notificationRepository.create({ userId, title, message, type, dedupeKey, ...extra });

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const monthName = (month: number) => MONTHS[Math.min(11, Math.max(0, month - 1))];
const money = (amount: number) => `₹${Math.round(amount).toLocaleString("en-IN")}`;
const day = (date: Date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const notificationService = {
  create,
  rentGenerated: (userId: string, tenantId: string, month: number, year: number) =>
    create(
      userId,
      "Rent generated",
      `Monthly rent for ${month}/${year} is ready.`,
      "PAYMENT",
      `rent-generated:${tenantId}:${month}:${year}`,
      { entity: "Payment", entityId: tenantId, tenantId },
    ),

  /**
   * "September rent is due" — emitted once per tenant per billing month
   * when the monthly rent record is created. Dedupe key is
   * tenant+month+year, so repeated scheduler runs, startup recovery and
   * manual generation can never stack duplicates.
   */
  rentDue: (
    userId: string,
    input: {
      tenantId: string;
      tenantName: string;
      propertyId: string;
      paymentId: string;
      month: number;
      year: number;
      amount: number;
      dueDate: Date;
    },
  ) =>
    create(
      userId,
      `${monthName(input.month)} rent is due`,
      `${monthName(input.month)} ${input.year} rent of ${money(input.amount)} for ${input.tenantName} is due on ${day(input.dueDate)}.`,
      "PAYMENT",
      `rent-due:${input.tenantId}:${input.month}:${input.year}`,
      {
        entity: "Payment",
        entityId: input.paymentId,
        tenantId: input.tenantId,
        propertyId: input.propertyId,
        metadata: { month: input.month, year: input.year, amount: input.amount },
      },
    ),

  /**
   * One — and only one — overdue notification per rent record.
   */
  rentOverdue: (
    userId: string,
    input: {
      paymentId: string;
      tenantId: string;
      tenantName: string;
      propertyId: string;
      month: number;
      year: number;
      outstanding: number;
      dueDate: Date;
    },
  ) =>
    create(
      userId,
      `${monthName(input.month)} rent is overdue`,
      `${input.tenantName} has not paid ${monthName(input.month)} ${input.year} rent. ${money(input.outstanding)} was due on ${day(input.dueDate)}.`,
      "PAYMENT",
      `rent-overdue:${input.paymentId}`,
      {
        entity: "Payment",
        entityId: input.paymentId,
        tenantId: input.tenantId,
        propertyId: input.propertyId,
        priority: 2,
        metadata: { month: input.month, year: input.year, outstanding: input.outstanding },
      },
    ),

  paymentCollected: (userId: string, paymentId: string, tenantId: string, amount: number) =>
    create(
      userId,
      "Payment received",
      `Payment of ${amount} was recorded.`,
      "PAYMENT",
      `payment-collected:${paymentId}`,
      { entity: "Payment", entityId: paymentId, tenantId },
    ),
  paymentReminder: (userId: string, paymentId: string, tenantId: string, window: string) =>
    create(
      userId,
      "Rent reminder sent",
      `A ${window} rent reminder was queued.`,
      "PAYMENT",
      `payment-reminder:${paymentId}:${window}`,
      { entity: "Payment", entityId: paymentId, tenantId },
    ),
  whatsappFailure: (userId: string, messageId: string) =>
    create(
      userId,
      "WhatsApp delivery failed",
      "A WhatsApp automation message could not be delivered.",
      "SYSTEM",
      `whatsapp-failed:${messageId}`,
      { entity: "WhatsAppLog", entityId: messageId, priority: 1 },
    ),
  list: notificationRepository.list,
  unreadCount: notificationRepository.unreadCount,
  markRead: notificationRepository.markRead,
  markAllRead: notificationRepository.markAllRead,
  remove: notificationRepository.remove,
};
