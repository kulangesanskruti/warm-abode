import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, MapPin, Home, DollarSign, ChevronRight, Upload, Check, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ApiError } from "@/lib/api";

interface AddPropertyModalProps {
  open: boolean;
  onClose: () => void;
}

const initialFormData = {
  name: "",
  type: "pg",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  floors: "",
  rooms: "",
  description: "",
};

export default function AddPropertyModal({ open, onClose }: AddPropertyModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest("/properties", {
        method: "POST",
        body: {
          propertyName: formData.name,
          propertyType: formData.type,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
          totalFloors: Number(formData.floors),
          description: formData.description || undefined,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      setFormData(initialFormData);
      setFieldErrors({});
      setStep(1);
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setFieldErrors(error.fieldErrors);
      }
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      handleNext();
      return;
    }
    mutation.mutate();
  };

  const steps = ["Basic Info", "Details", "Review"];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary-100 p-2">
                  <Building2 className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ink-900">Add New Property</h2>
                  <p className="text-xs text-ink-500 mt-1">Step {step} of 3</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600 p-2 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="mb-6 flex gap-2">
              {steps.map((s, i) => (
                <div key={i} className="flex-1">
                  <div
                    className={`h-1 rounded-full transition-all ${
                      i < step ? "bg-success-600" : i === step - 1 ? "bg-primary-600" : "bg-ink-200"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-ink-900 mb-2">
                      Property Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Skyline PG"
                      className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder-ink-500 transition-all hover:border-ink-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {fieldErrors["propertyName"] && (
                      <p className="mt-1 text-xs text-danger-600">{fieldErrors["propertyName"]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-900 mb-2">
                      Property Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 transition-all hover:border-ink-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="pg">PG</option>
                      <option value="apartment">Apartment</option>
                      <option value="villa">Villa</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-900 mb-2">Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Street address"
                      className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder-ink-500 transition-all hover:border-ink-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {fieldErrors["address"] && (
                      <p className="mt-1 text-xs text-danger-600">{fieldErrors["address"]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-900 mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Bangalore"
                      className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder-ink-500 transition-all hover:border-ink-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {fieldErrors["city"] && (
                      <p className="mt-1 text-xs text-danger-600">{fieldErrors["city"]}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink-900 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Karnataka"
                        className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder-ink-500 transition-all hover:border-ink-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      {fieldErrors["state"] && (
                        <p className="mt-1 text-xs text-danger-600">{fieldErrors["state"]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-900 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        placeholder="e.g., 560001"
                        maxLength={6}
                        className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder-ink-500 transition-all hover:border-ink-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      {fieldErrors["pincode"] && (
                        <p className="mt-1 text-xs text-danger-600">{fieldErrors["pincode"]}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-900 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      placeholder="e.g., India"
                      className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder-ink-500 transition-all hover:border-ink-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {fieldErrors["country"] && (
                      <p className="mt-1 text-xs text-danger-600">{fieldErrors["country"]}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink-900 mb-2">
                        Number of Floors *
                      </label>
                      <input
                        type="number"
                        name="floors"
                        value={formData.floors}
                        onChange={handleChange}
                        required
                        placeholder="e.g., 3"
                        className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder-ink-500 transition-all hover:border-ink-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      {fieldErrors["totalFloors"] && (
                        <p className="mt-1 text-xs text-danger-600">{fieldErrors["totalFloors"]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-900 mb-2">
                        Total Rooms *
                      </label>
                      <input
                        type="number"
                        name="rooms"
                        value={formData.rooms}
                        onChange={handleChange}
                        required
                        placeholder="e.g., 12"
                        className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder-ink-500 transition-all hover:border-ink-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-900 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Additional details about your property..."
                      rows={4}
                      className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder-ink-500 transition-all hover:border-ink-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-900 mb-2">
                      Property Image
                    </label>
                    <div className="border-2 border-dashed border-ink-200 rounded-lg p-4 text-center hover:border-primary-300 transition-all cursor-pointer">
                      <Upload className="h-6 w-6 text-ink-400 mx-auto mb-2" />
                      <p className="text-sm text-ink-600">Click to upload or drag image</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="rounded-lg bg-primary-50 border border-primary-200 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-ink-900">Property Name</p>
                        <p className="text-sm text-ink-600">{formData.name || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-ink-900">Location</p>
                        <p className="text-sm text-ink-600">
                          {formData.address}, {formData.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-ink-900">Property Details</p>
                        <p className="text-sm text-ink-600">
                          {formData.floors} floors, {formData.rooms} rooms
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-ink-500 text-center">
                    Click "Save Property" to complete
                  </p>
                  {mutation.isError && !Object.keys(fieldErrors).length && (
                    <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3">
                      <AlertCircle className="h-4 w-4 text-danger-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-danger-700">
                        {mutation.error instanceof Error
                          ? mutation.error.message
                          : "Failed to save property. Please try again."}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-ink-200">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex-1 rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition-all hover:bg-ink-50 active:scale-95"
                  >
                    Previous
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-700 active:scale-95 flex items-center justify-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-1 rounded-lg bg-success-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-success-700 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Check className="h-4 w-4" />
                    {mutation.isPending ? "Saving..." : "Save Property"}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
