import { createFileRoute } from "@tanstack/react-router";
import Reports from "@/pages/Reports";
import { requireAuth } from "@/lib/guards";

export const Route = createFileRoute("/reports")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Reports & Analytics — StayHub" },
      {
        name: "description",
        content:
          "Generate rent, occupancy and property reports, preview professional PDFs and analyze income across all your properties.",
      },
      { property: "og:title", content: "Reports & Analytics — StayHub" },
      {
        property: "og:description",
        content:
          "Generate rent, occupancy and property reports, preview professional PDFs and analyze income across all your properties.",
      },
    ],
  }),
  component: Reports,
});
