import { createFileRoute } from "@tanstack/react-router";
import PropertyDetails from "@/pages/PropertyDetails";
import { requireAuth } from "@/lib/guards";

export const Route = createFileRoute("/properties/$id")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Property Details — StayHub" },
      {
        name: "description",
        content: "Rooms, tenants, rent and reports for this property in one place.",
      },
      { property: "og:title", content: "Property Details — StayHub" },
      {
        property: "og:description",
        content: "Rooms, tenants, rent and reports for this property in one place.",
      },
    ],
  }),
  component: PropertyDetails,
});
