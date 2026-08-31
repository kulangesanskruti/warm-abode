import { createFileRoute } from "@tanstack/react-router";
import Register from "@/pages/auth/Register";
import { requireGuest } from "@/lib/guards";

export const Route = createFileRoute("/register")({
  ssr: false,
  beforeLoad: requireGuest,
  head: () => ({
    meta: [
      { title: "Create Account — StayHub" },
      {
        name: "description",
        content:
          "Create your free StayHub account and start managing your PG or rental business today.",
      },
      { property: "og:title", content: "Create Account — StayHub" },
      {
        property: "og:description",
        content:
          "Create your free StayHub account and start managing your PG or rental business today.",
      },
    ],
  }),
  component: Register,
});
