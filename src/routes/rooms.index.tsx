import { createFileRoute } from "@tanstack/react-router";
import Rooms from "@/pages/Rooms";
import { requireAuth } from "@/lib/guards";

export const Route = createFileRoute("/rooms/")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Room Management — StayHub" },
      {
        name: "description",
        content: "Visual room and bed management across all your properties.",
      },
      { property: "og:title", content: "Room Management — StayHub" },
      {
        property: "og:description",
        content: "Visual room and bed management across all your properties.",
      },
    ],
  }),
  component: Rooms,
});
