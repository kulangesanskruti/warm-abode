import { createFileRoute } from "@tanstack/react-router";
import NotificationsCenter from "@/pages/NotificationsCenter";
import { requireAuth } from "@/lib/guards";

export const Route = createFileRoute("/notifications")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Notifications — StayHub" },
      {
        name: "description",
        content:
          "Stay updated with everything happening across your properties — rent reminders, payments, maintenance, tenants and more.",
      },
      { property: "og:title", content: "Notifications — StayHub" },
      {
        property: "og:description",
        content:
          "Stay updated with everything happening across your properties — rent reminders, payments, maintenance, tenants and more.",
      },
    ],
  }),
  component: NotificationsCenter,
});
