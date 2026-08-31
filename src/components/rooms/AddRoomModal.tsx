import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BedDouble, Layers, Hash, Users, IndianRupee, AlertCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ApiError } from "@/lib/api";

interface AddRoomModalProps {
  open: boolean;
  onClose: () => void;
  /** Pre-selected property (the Rooms page property selector). */
  propertyId?: string | undefined;
}

type ApiProperty = {
  id: string;
  propertyName: string;
  totalFloors: number | null;
};

type PropertiesResponse = { properties: ApiProperty[] };

const initialFormData = {
  propertyId: "",
  floor: "0",
  roomNumber: "",
  roomType: "Shared",
  capacity: "2",
  rentPerBed: "",
  description: "",
};

const ROOM_TYPES = ["Single", "Shared", "Dormitory", "Deluxe"];

export default function AddRoomModal({ open, onClose, propertyId }: AddRoomModalProps) {
  const [formData, setFormData] = useState({ ...initialFormData, propertyId: propertyId ?? "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ["properties", "selector"],
    queryFn: () => apiRequest<PropertiesResponse>("/properties?limit=100"),
    enabled: open,
  });

  const properties = propertiesData?.properties ?? [];

  useEffect(() => {
    if (!open) return;
    setFormData((prev) => ({
      ...prev,
      propertyId: prev.propertyId || propertyId || properties[0]?.id || "",
    }));
  }, [open, propertyId, properties]);

  const selectedProperty = properties.find((p) => p.id === formData.propertyId);
  const totalFloors = selectedProperty?.totalFloors ?? 0;
  // Floors belong to the property: only floors that exist on the selected
  // property can be chosen, and every room is stored against one of them.
  const floorOptions = Array.from({ length: Math.max(totalFloors, 1) }).map((_, i) => i);

  useEffect(() => {
    setFormData((prev) =>
      floorOptions.includes(Number(prev.floor)) ? prev : { ...prev, floor: "0" },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.propertyId, totalFloors]);

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest("/rooms", {
        method: "POST",
        body: {
          propertyId: formData.propertyId,
          roomNumber: formData.roomNumber.trim(),
          floor: Number(formData.floor),
          capacity: Number(formData.capacity),
          rentPerBed: Number(formData.rentPerBed),
          roomType: formData.roomType,
          description: formData.description || undefined,
        },
      }),
    onSuccess: () => {
      // Rooms, beds, property summaries and the tenant assignment dropdown all
      // read this data — refresh every one of them.
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setFormData({ ...initialFormData, propertyId: formData.propertyId });
      setFieldErrors({});
      setFormError(null);
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setFieldErrors(error.fieldErrors);
        setFormError(error.message);
      } else {
        setFormError("Could not create the room. Please try again.");
      }
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    mutation.mutate();
  };

  const inputClass =
    "w-full rounded-lg border border-ink-200 py-2.5 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary-100 p-2">
                  <BedDouble className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ink-900">Add New Room</h2>
                  <p className="mt-1 text-xs text-ink-500">
                    Beds are created automatically from the capacity
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-ink-400 transition-all hover:bg-ink-100 hover:text-ink-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {properties.length === 0 && !propertiesLoading ? (
              <div className="rounded-xl border border-warning-200 bg-warning-50 p-6 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-warning-600" />
                <p className="mt-3 text-sm font-medium text-ink-900">
                  Add a property first, then create its rooms.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink-900">Property *</label>
                  <select
                    name="propertyId"
                    value={formData.propertyId}
                    onChange={handleChange}
                    className={inputClass}
                    required
                    disabled={propertiesLoading}
                  >
                    <option value="">
                      {propertiesLoading ? "Loading properties..." : "Select property"}
                    </option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.propertyName}
                      </option>
                    ))}
                  </select>
                  {fieldErrors["propertyId"] && (
                    <p className="mt-1 text-xs text-danger-600">{fieldErrors["propertyId"]}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink-900">Floor *</label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-3 h-4 w-4 text-ink-400" />
                      <select
                        name="floor"
                        value={formData.floor}
                        onChange={handleChange}
                        className={`${inputClass} pl-9`}
                        required
                      >
                        {floorOptions.map((floor) => (
                          <option key={floor} value={String(floor)}>
                            {floor === 0 ? "Ground floor" : `Floor ${floor}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    {fieldErrors["floor"] && (
                      <p className="mt-1 text-xs text-danger-600">{fieldErrors["floor"]}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink-900">
                      Room Number *
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3 h-4 w-4 text-ink-400" />
                      <input
                        type="text"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleChange}
                        placeholder="101"
                        className={`${inputClass} pl-9`}
                        required
                      />
                    </div>
                    {fieldErrors["roomNumber"] && (
                      <p className="mt-1 text-xs text-danger-600">{fieldErrors["roomNumber"]}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink-900">
                      Room Type *
                    </label>
                    <select
                      name="roomType"
                      value={formData.roomType}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    >
                      {ROOM_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {fieldErrors["roomType"] && (
                      <p className="mt-1 text-xs text-danger-600">{fieldErrors["roomType"]}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink-900">
                      Beds (capacity) *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-ink-400" />
                      <input
                        type="number"
                        name="capacity"
                        min={1}
                        max={20}
                        value={formData.capacity}
                        onChange={handleChange}
                        className={`${inputClass} pl-9`}
                        required
                      />
                    </div>
                    {fieldErrors["capacity"] && (
                      <p className="mt-1 text-xs text-danger-600">{fieldErrors["capacity"]}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-ink-900">
                    Rent per bed (₹) *
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-ink-400" />
                    <input
                      type="number"
                      name="rentPerBed"
                      min={1}
                      value={formData.rentPerBed}
                      onChange={handleChange}
                      placeholder="8000"
                      className={`${inputClass} pl-9`}
                      required
                    />
                  </div>
                  {fieldErrors["rentPerBed"] && (
                    <p className="mt-1 text-xs text-danger-600">{fieldErrors["rentPerBed"]}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-ink-900">
                    Description (optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Attached bathroom, balcony..."
                    className={inputClass}
                  />
                </div>

                {formError && (
                  <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-danger-600" />
                    <p className="text-xs text-danger-700">{formError}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 transition-all hover:bg-ink-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={mutation.isPending || !formData.propertyId}
                    className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700 active:scale-95 disabled:opacity-60"
                  >
                    {mutation.isPending ? "Creating..." : "Create Room"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
