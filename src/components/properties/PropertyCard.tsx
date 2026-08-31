import { useState } from "react";
import { AppLink as Link } from "@/components/ui/AppLink";
import { motion } from "framer-motion";
import { MapPin, BedDouble, Users, TrendingUp, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest, ApiError } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Property {
  id: string | number;
  name: string;
  location: string;
  beds: number;
  occupied: number;
  vacant: number;
  occupancy: number;
  monthlyIncome: string;
  pendingRent: string;
  lastUpdated: string;
  image: string;
  status: string;
}

export default function PropertyCard({ property }: { property: Property }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteProperty = useMutation({
    mutationFn: () =>
      apiRequest<void>(`/properties/${property.id}?permanent=true`, { method: "DELETE" }),
    onSuccess: async () => {
      setConfirmOpen(false);
      toast.success(`"${property.name}" and its floors, rooms and tenant records were deleted.`);
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Failed to delete property. Please try again.";
      toast.error(message);
    },
  });

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 80) return "text-success-600 bg-success-50 border-success-200";
    if (occupancy >= 60) return "text-warning-600 bg-warning-50 border-warning-200";
    return "text-danger-600 bg-danger-50 border-danger-200";
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group rounded-xl border border-ink-200 bg-white transition-all duration-300 hover:shadow-lg overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-ink-100">
        <motion.img
          src={property.image}
          alt={property.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <button
          type="button"
          aria-label={`Delete ${property.name}`}
          title="Delete property"
          onClick={() => setConfirmOpen(true)}
          disabled={deleteProperty.isPending}
          className="absolute right-3 top-3 rounded-lg border border-danger-200 bg-white/90 p-2 text-danger-600 shadow-sm backdrop-blur transition-all hover:bg-danger-50 active:scale-95 disabled:opacity-60"
        >
          {deleteProperty.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-ink-900">{property.name}</h3>
          <div className="mt-2 flex items-center gap-2 text-sm text-ink-600">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{property.location}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          {/* Beds */}
          <div className="rounded-lg border border-ink-100 bg-ink-50 p-3">
            <p className="text-xs font-medium text-ink-600">Total Beds</p>
            <div className="mt-1 flex items-center gap-1">
              <BedDouble className="h-4 w-4 text-primary-600" />
              <p className="text-lg font-bold text-ink-900">{property.beds}</p>
            </div>
          </div>

          {/* Occupancy */}
          <div className={`rounded-lg border p-3 ${getOccupancyColor(property.occupancy)}`}>
            <p className="text-xs font-medium opacity-75">Occupancy</p>
            <p className="mt-1 text-lg font-bold">{property.occupancy}%</p>
          </div>

          {/* Occupied */}
          <div className="rounded-lg border border-success-200 bg-success-50 p-3">
            <p className="text-xs font-medium text-success-600">Occupied</p>
            <div className="mt-1 flex items-center gap-1">
              <Users className="h-4 w-4 text-success-600" />
              <p className="text-lg font-bold text-success-700">{property.occupied}</p>
            </div>
          </div>

          {/* Vacant */}
          <div className="rounded-lg border border-warning-200 bg-warning-50 p-3">
            <p className="text-xs font-medium text-warning-600">Vacant</p>
            <p className="mt-1 text-lg font-bold text-warning-700">{property.vacant}</p>
          </div>
        </div>

        {/* Monthly Income & Pending Rent */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 p-3">
            <TrendingUp className="h-4 w-4 text-primary-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-primary-600">Monthly Income</p>
              <p className="text-sm font-bold text-primary-700">{property.monthlyIncome}</p>
            </div>
          </div>
          <div className="rounded-lg border border-warning-200 bg-warning-50 p-3">
            <p className="text-xs font-medium text-warning-600">Pending Rent</p>
            <p className="text-sm font-bold text-warning-700">{property.pendingRent}</p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mb-4 flex items-center justify-between text-xs text-ink-500">
          <span>Last updated {property.lastUpdated}</span>
        </div>

        {/* View Details Button */}
        <Link to={`/properties/${property.id}`}>
          <button className="w-full rounded-lg border border-primary-300 bg-primary-50 px-4 py-2.5 font-medium text-primary-700 transition-all hover:bg-primary-100 active:scale-95 flex items-center justify-center gap-2">
            View Details
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </Link>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{property.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the property along with all of its floors, rooms, beds and
              tenant records, including their rent history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProperty.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteProperty.isPending}
              onClick={(e) => {
                e.preventDefault();
                deleteProperty.mutate();
              }}
              className="bg-danger-600 text-white hover:bg-danger-700"
            >
              {deleteProperty.isPending ? "Deleting..." : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
