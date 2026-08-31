import { createFileRoute } from "@tanstack/react-router";
import ForgotPassword from "@/pages/auth/ForgotPassword";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — StayHub" },
      {
        name: "description",
        content: "Reset your StayHub password and get back to managing your properties.",
      },
      { property: "og:title", content: "Forgot Password — StayHub" },
      {
        property: "og:description",
        content: "Reset your StayHub password and get back to managing your properties.",
      },
    ],
  }),
  component: ForgotPassword,
});
