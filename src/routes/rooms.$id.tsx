import { createFileRoute } from "@tanstack/react-router";
import RoomDetails from "@/pages/RoomDetails";
import { requireAuth } from "@/lib/guards";

export const Route = createFileRoute("/rooms/$id")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Room Details — StayHub" },
      { name: "description", content: "Bed-level occupancy, tenants and activity for this room." },
      { property: "og:title", content: "Room Details — StayHub" },
      {
        property: "og:description",
        content: "Bed-level occupancy, tenants and activity for this room.",
      },
    ],
  }),
  component: RoomDetails,
});
