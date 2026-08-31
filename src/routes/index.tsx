import { createFileRoute } from "@tanstack/react-router";
import Landing from "@/pages/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StayHub — PG & Rental Management for Modern Landlords" },
      {
        name: "description",
        content:
          "Manage properties, rooms, tenants and rent collection from one premium dashboard built for PG owners and landlords.",
      },
      { property: "og:title", content: "StayHub — PG & Rental Management for Modern Landlords" },
      {
        property: "og:description",
        content:
          "Manage properties, rooms, tenants and rent collection from one premium dashboard built for PG owners and landlords.",
      },
    ],
  }),
  component: Landing,
});
