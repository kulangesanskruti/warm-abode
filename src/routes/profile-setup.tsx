import { createFileRoute } from "@tanstack/react-router";
import ProfileSetup from "@/pages/auth/ProfileSetup";
import { requireIncompleteProfile } from "@/lib/guards";

export const Route = createFileRoute("/profile-setup")({
  ssr: false,
  beforeLoad: requireIncompleteProfile,
  head: () => ({
    meta: [
      { title: "Complete Your Profile — StayHub" },
      {
        name: "description",
        content: "Finish setting up your StayHub account to access your dashboard.",
      },
    ],
  }),
  component: ProfileSetup,
});
