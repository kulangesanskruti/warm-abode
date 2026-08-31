import { createFileRoute } from "@tanstack/react-router";
import Tenants from "@/pages/Tenants";
import { requireAuth } from "@/lib/guards";

export const Route = createFileRoute("/tenants/")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Tenants — StayHub" },
      {
        name: "description",
        content: "Every tenant, their room, rent status and documents in one premium view.",
      },
      { property: "og:title", content: "Tenants — StayHub" },
      {
        property: "og:description",
        content: "Every tenant, their room, rent status and documents in one premium view.",
      },
    ],
  }),
  component: Tenants,
});
