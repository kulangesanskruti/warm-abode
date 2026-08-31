import { createFileRoute } from "@tanstack/react-router";
import Settings from "@/pages/Settings";
import { requireAuth } from "@/lib/guards";

export const Route = createFileRoute("/settings")({
  ssr: false,
  beforeLoad: requireAuth,
  component: Settings,
});
