import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet, Users, FileText, Share2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { mapRoom, formatCurrency, type ApiRoom } from "@/lib/rooms";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import RoomMap from "@/components/rooms/RoomMap";
import BedDrawer from "@/components/rooms/BedDrawer";

export default function RoomDetails() {
  const { id } = useParams({ strict: false }) as { id?: string };
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedBed, setSelectedBed] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["room", id],
    enabled: Boolean(id),
    queryFn: () => apiRequest<ApiRoom>(`/rooms/${id}`),
  });

  const room = data ? mapRoom(data) : null;
  const monthlyIncome = data?.monthlyRevenue
    ? formatCurrency(data.monthlyRevenue)
    : (room?.monthlyIncome ?? formatCurrency(0));

  const selectedBedData = room?.beds.find((b) => b.id === selectedBed);

  return (
    <div className="flex h-screen bg-ink-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8 sm:px-8 lg:px-10">
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate({ to: "/rooms" })}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Rooms
            </motion.button>

            {isLoading ? (
              <div className="animate-pulse space-y-6">
                <div className="h-10 w-64 rounded bg-ink-200" />
                <div className="h-4 w-40 rounded bg-ink-100" />
                <div className="grid gap-4 sm:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 rounded-lg bg-ink-100" />
                  ))}
                </div>
                <div className="h-64 rounded-xl bg-ink-100" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-danger-200 bg-danger-50 p-6 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-danger-600" />
                <h3 className="mt-4 text-lg font-semibold text-danger-900">
                  Failed to load this room
                </h3>
                <p className="mt-2 text-sm text-danger-600">
                  {error instanceof Error
                    ? error.message
                    : "An error occurred while fetching room details."}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 inline-block rounded-lg bg-danger-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-danger-700 active:scale-95"
                >
                  Retry Request
                </button>
              </div>
            ) : !room ? (
              <div className="rounded-xl border-2 border-dashed border-ink-200 p-12 text-center">
                <h3 className="text-lg font-semibold text-ink-900">Room not found</h3>
                <p className="mt-2 text-ink-600">This room may have been removed.</p>
              </div>
            ) : (
              <>
                {/* Room Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <h1 className="text-4xl font-bold text-ink-900">Room {room.number}</h1>
                  <p className="mt-2 text-ink-600">Floor {room.floor}</p>

                  {/* Quick Stats */}
                  <div className="mt-6 grid gap-4 sm:grid-cols-4">
                    <div className="rounded-lg bg-white border border-ink-200 p-4">
                      <p className="text-xs font-medium text-ink-600">Capacity</p>
                      <p className="mt-2 text-2xl font-bold text-ink-900">{room.capacity}</p>
                    </div>
                    <div className="rounded-lg bg-white border border-ink-200 p-4">
                      <p className="text-xs font-medium text-ink-600">Occupied</p>
                      <p className="mt-2 text-2xl font-bold text-ink-900">{room.occupied}</p>
                    </div>
                    <div className="rounded-lg bg-white border border-ink-200 p-4">
                      <p className="text-xs font-medium text-ink-600">Occupancy</p>
                      <p className="mt-2 text-2xl font-bold text-primary-600">{room.occupancy}%</p>
                    </div>
                    <div className="rounded-lg bg-white border border-ink-200 p-4">
                      <p className="text-xs font-medium text-ink-600">Monthly Income</p>
                      <p className="mt-2 text-2xl font-bold text-success-600">{monthlyIncome}</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700 active:scale-95">
                      <Wallet className="h-4 w-4" />
                      Collect Rent
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700 active:scale-95">
                      <Users className="h-4 w-4" />
                      Assign Tenant
                    </button>
                    <button className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition-all hover:bg-ink-50">
                      <FileText className="h-4 w-4" />
                      Generate PDF
                    </button>
                    <button className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition-all hover:bg-ink-50">
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </motion.div>

                {/* Room Map */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-12"
                >
                  <h2 className="mb-6 text-lg font-semibold text-ink-900">Room Layout</h2>
                  <RoomMap room={room} selectedBed={selectedBed} onBedSelect={setSelectedBed} />
                </motion.div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Bed Drawer */}
      <AnimatePresence>
        {selectedBedData && (
          <BedDrawer bed={selectedBedData} onClose={() => setSelectedBed(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
