import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, BedDouble, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { AppLink as Link } from "@/components/ui/AppLink";
import { mapRoom, type RoomsListResponse } from "@/lib/rooms";
import { rentStatusQuery } from "@/lib/payments";
import RoomCard from "@/components/rooms/RoomCard";
import AddRoomModal from "@/components/rooms/AddRoomModal";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function PropertyRooms({ propertyId }: { propertyId?: string }) {
  const [addRoomOpen, setAddRoomOpen] = useState(false);

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rooms", propertyId],
    enabled: Boolean(propertyId),
    // Always re-read on entry: a room just added/freed from this same tab
    // (or from the Rooms page) must show up without a manual refresh.
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: () =>
      apiRequest<RoomsListResponse>(
        `/rooms?propertyId=${encodeURIComponent(propertyId ?? "")}&limit=100&sortBy=floor&sortOrder=asc`,
      ),
  });

  const rentStatusByTenant = useQuery(rentStatusQuery).data;

  const rooms = (data?.rooms ?? []).map((room) => mapRoom(room, rentStatusByTenant));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink-900">Rooms &amp; Beds</h3>
          <p className="mt-1 text-sm text-ink-600">
            Beds are created automatically from each room's capacity
          </p>
        </div>
        <button
          onClick={() => setAddRoomOpen(true)}
          disabled={!propertyId}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700 active:scale-95 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Add Room
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse space-y-4 rounded-xl border border-ink-100 bg-white p-6"
            >
              <div className="h-6 w-28 rounded bg-ink-200" />
              <div className="h-3 w-20 rounded bg-ink-100" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="h-14 rounded bg-ink-100" />
                <div className="h-14 rounded bg-ink-100" />
              </div>
              <div className="h-10 rounded bg-ink-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-danger-200 bg-danger-50 p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-danger-600" />
          <h3 className="mt-4 text-base font-semibold text-danger-900">Failed to load rooms</h3>
          <p className="mt-2 text-sm text-danger-600">
            {error instanceof Error ? error.message : "An error occurred while fetching rooms."}
          </p>
        </div>
      ) : rooms.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {rooms.map((room) => (
            <motion.div key={room.id} variants={item}>
              <Link to={`/rooms/${room.id}`}>
                <RoomCard room={room} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-ink-200 p-12 text-center">
          <BedDouble className="mx-auto h-12 w-12 text-ink-400 mb-4" />
          <h3 className="text-lg font-semibold text-ink-900">No rooms yet</h3>
          <p className="mt-2 text-ink-600">Add the first room and its beds to this property</p>
        </div>
      )}

      <AddRoomModal
        open={addRoomOpen}
        onClose={() => setAddRoomOpen(false)}
        propertyId={propertyId}
      />
    </div>
  );
}
