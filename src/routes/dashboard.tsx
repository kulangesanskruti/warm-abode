import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/pages/Dashboard";
import { requireAuth } from "@/lib/guards";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  // `/dashboard?demo=true` is the public "Try Live Demo" entry point and must
  // stay reachable without a session. Every other dashboard visit is guarded.
  beforeLoad: ({ location }) => {
    const demo = (location.search as Record<string, unknown> | undefined)?.["demo"];
    if (demo === "true" || demo === true) return;
    requireAuth();
  },
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
