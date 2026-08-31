import { createFileRoute } from "@tanstack/react-router";
import ResetPassword from "@/pages/auth/ResetPassword";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — StayHub" },
      { name: "description", content: "Choose a new password for your StayHub account." },
      { property: "og:title", content: "Reset Password — StayHub" },
      { property: "og:description", content: "Choose a new password for your StayHub account." },
    ],
  }),
  component: ResetPassword,
});
