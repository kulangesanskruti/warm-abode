import { motion } from "framer-motion";

interface Bed {
  id: string;
  name: string;
  status: "occupied" | "vacant" | "maintenance";
  tenant?: string | null;
  rent: string;
  rentStatus: string;
  avatar?: string | null;
}

interface Room {
  id: string | number;
  beds: Bed[];
}

export default function RoomMap({
  room,
  selectedBed,
  onBedSelect,
}: {
  room: Room;
  selectedBed: string | null;
  onBedSelect: (bedId: string) => void;
}) {
  const getStatusColor = (rentStatus: string, status: string) => {
    switch (rentStatus) {
      case "paid":
        return "bg-success-50 border-success-200 hover:border-success-300";
      case "due":
        return "bg-warning-50 border-warning-200 hover:border-warning-300";
      case "overdue":
        return "bg-danger-50 border-danger-200 hover:border-danger-300";
      case "vacant":
        return "bg-blue-50 border-blue-200 hover:border-blue-300";
      case "maintenance":
        return "bg-ink-100 border-ink-300 hover:border-ink-400";
      default:
        return "bg-ink-50 border-ink-200 hover:border-ink-300";
    }
  };

  const getStatusLabel = (rentStatus: string) => {
    switch (rentStatus) {
      case "paid":
        return "✓ Paid";
      case "due":
        return "⏰ Due";
      case "overdue":
        return "⚠ Overdue";
      case "vacant":
        return "+ Add";
      case "maintenance":
        return "🔧 Maintenance";
      default:
        return "";
    }
  };

  // Create a visual room layout based on bed count
  const bedCount = room.beds.length;
  const isSharedRoom = bedCount > 1;

  return (
    <div className="rounded-2xl border-4 border-ink-300 bg-gradient-to-br from-ink-50 to-white p-12">
      {/* Room container */}
      <div className="space-y-8">
        {/* Room elements */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-semibold text-ink-600">🪟 Window</span>
          <span className="text-sm font-semibold text-ink-600">🪟 Window</span>
        </div>

        {/* Beds grid */}
        <div
          className={`grid gap-6 ${bedCount === 2 ? "grid-cols-2" : bedCount === 3 ? "grid-cols-3" : "grid-cols-2"}`}
        >
          {room.beds.map((bed, idx) => (
            <motion.button
              key={bed.id}
              onClick={() => onBedSelect(bed.id)}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative rounded-xl border-2 p-6 transition-all cursor-pointer ${getStatusColor(
                bed.rentStatus,
                bed.status,
              )} ${selectedBed === bed.id ? "ring-2 ring-primary-500 ring-offset-2" : ""}`}
            >
              {/* Bed icon */}
              <div className="text-3xl mb-3">🛏</div>

              {/* Bed info */}
              <h4 className="font-bold text-ink-900">{bed.name}</h4>
              <p className="text-xs text-ink-600 mt-2">{bed.rent}/month</p>

              {/* Tenant info or assign button */}
              {bed.status === "vacant" ? (
                <div className="mt-3 flex items-center justify-center h-8 bg-white rounded-lg border-2 border-dashed border-blue-300">
                  <span className="text-xl font-bold text-blue-500">+</span>
                </div>
              ) : (
                <>
                  <p className="mt-3 text-sm font-semibold text-ink-900 truncate">{bed.tenant}</p>
                  <div className="mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold">
                    {getStatusLabel(bed.rentStatus)}
                  </div>
                </>
              )}

              {/* Hover effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500/0 to-primary-600/0 group-hover:from-primary-500/5 group-hover:to-primary-600/10 transition-all" />
            </motion.button>
          ))}
        </div>

        {/* Door element */}
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-600">
            <div className="w-12 h-12 border-2 border-ink-600 rounded-full" />
            <span>🚪 Door/Entrance</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-12 pt-6 border-t border-ink-200">
        <p className="text-xs font-semibold text-ink-600 mb-4">Rent Status Legend:</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success-400" />
            <span>Paid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning-400" />
            <span>Due</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger-400" />
            <span>Overdue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span>Vacant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-ink-400" />
            <span>Maintenance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
