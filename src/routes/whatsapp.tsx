import { createFileRoute } from "@tanstack/react-router";
import WhatsAppCenter from "@/pages/WhatsAppCenter";
import { requireAuth } from "@/lib/guards";

export const Route = createFileRoute("/whatsapp")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "WhatsApp Reminder Center — StayHub" },
      {
        name: "description",
        content:
          "Send rent reminders, share receipts, broadcast announcements and share room availability — all from one premium communication hub.",
      },
      { property: "og:title", content: "WhatsApp Reminder Center — StayHub" },
      {
        property: "og:description",
        content:
          "Send rent reminders, share receipts, broadcast announcements and share room availability — all from one premium communication hub.",
      },
    ],
  }),
  component: WhatsAppCenter,
});
