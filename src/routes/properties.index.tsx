import { createFileRoute } from "@tanstack/react-router";
import Properties from "@/pages/Properties";
import { requireAuth } from "@/lib/guards";

export const Route = createFileRoute("/properties/")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Properties — StayHub" },
      {
        name: "description",
        content: "Every PG and rental property you manage, with occupancy and revenue at a glance.",
      },
      { property: "og:title", content: "Properties — StayHub" },
      {
        property: "og:description",
        content: "Every PG and rental property you manage, with occupancy and revenue at a glance.",
      },
    ],
  }),
  component: Properties,
});
