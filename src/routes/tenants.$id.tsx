import { createFileRoute } from "@tanstack/react-router";
import TenantProfile from "@/pages/TenantProfile";
import { requireAuth } from "@/lib/guards";

export const Route = createFileRoute("/tenants/$id")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Tenant Profile — StayHub" },
      {
        name: "description",
        content: "Full tenant profile: stay details, rent history, documents and notes.",
      },
      { property: "og:title", content: "Tenant Profile — StayHub" },
      {
        property: "og:description",
        content: "Full tenant profile: stay details, rent history, documents and notes.",
      },
    ],
  }),
  component: TenantProfile,
});
