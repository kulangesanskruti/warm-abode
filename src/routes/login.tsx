import { createFileRoute } from "@tanstack/react-router";
import Login from "@/pages/auth/Login";
import { requireGuest } from "@/lib/guards";

export const Route = createFileRoute("/login")({
  ssr: false,
  beforeLoad: requireGuest,
  head: () => ({
    meta: [
      { title: "Sign In — StayHub" },
      {
        name: "description",
        content:
          "Sign in to your StayHub account to manage properties, tenants and rent collections.",
      },
      { property: "og:title", content: "Sign In — StayHub" },
      {
        property: "og:description",
        content:
          "Sign in to your StayHub account to manage properties, tenants and rent collections.",
      },
    ],
  }),
  component: Login,
});
