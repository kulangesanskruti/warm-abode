import { createFileRoute } from "@tanstack/react-router";
import RentManagement from "@/pages/RentManagement";
import { requireAuth } from "@/lib/guards";

export const Route = createFileRoute("/rent")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Rent Management — StayHub" },
      {
        name: "description",
        content:
          "Track every rent payment across all properties: collections, pending dues, overdue tenants and receipts.",
      },
      { property: "og:title", content: "Rent Management — StayHub" },
      {
        property: "og:description",
        content:
          "Track every rent payment across all properties: collections, pending dues, overdue tenants and receipts.",
      },
    ],
  }),
  component: RentManagement,
});
