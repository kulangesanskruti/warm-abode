import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/pages/Dashboard";
import { requireAuth } from "@/lib/guards";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Control Center — StayHub" },
      {
        name: "description",
        content: "Your daily command center: occupancy, collections, alerts and quick actions.",
      },
      { property: "og:title", content: "Control Center — StayHub" },
      {
        property: "og:description",
        content: "Your daily command center: occupancy, collections, alerts and quick actions.",
      },
    ],
  }),
  component: Dashboard,
});
