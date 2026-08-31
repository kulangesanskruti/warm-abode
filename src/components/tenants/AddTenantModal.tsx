import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  AlertCircle,
  Building2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ApiError } from "@/lib/api";
import { AppLink as Link } from "@/components/ui/AppLink";

interface AddTenantModalProps {
  open: boolean;
  onClose: () => void;
}

type ApiProperty = {
  id: string;
  propertyName: string;
  propertyType: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  totalFloors: number | null;
  status: "ACTIVE" | "INACTIVE" | string;
};

type PropertiesResponse = {
  properties: ApiProperty[];
};

type ApiRoom = {
  id: string;
  roomNumber: string;
  capacity?: number;
  occupiedBeds?: number;
  vacantBeds?: number;
  status?: string;
};

type RoomsResponse = {
  rooms: ApiRoom[];
};

type ApiBed = {
  id: string;
  bedNumber: string;
  status: string;
};

// A property must have every required detail filled in before it can be
// assigned to a tenant. The backend enforces these as required at creation
// time, but we check again here defensively (e.g. older/partial records).
function isPropertyComplete(property: ApiProperty): boolean {
  return Boolean(
    property.propertyName &&
      property.propertyType &&
      property.address &&
      property.city &&
      property.state &&
      property.pincode &&
      property.country &&
      property.totalFloors &&
      property.totalFloors > 0,
  );
}

const initialFormData = {
  name: "",
  phone: "",
  email: "",
  gender: "",
  occupation: "",
  propertyId: "",
  roomId: "",
  bedId: "",
  moveInDate: "",
  monthlyRent: "",
  securityDeposit: "",
  emergencyContact: "",
  emergencyPhone: "",
  permanentAddress: "",
  notes: "",
};

type FormData = typeof initialFormData;

// Which fields belong to which step, so a backend error for e.g. "phone"
// (step 1) can jump the wizard back to the right step even if the user is
// currently sitting on step 3 when the submit fails.
const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  1: ["name", "phone", "gender", "email", "occupation"],
  2: ["propertyId", "roomId", "bedId", "moveInDate", "monthlyRent", "securityDeposit"],
  3: ["permanentAddress", "emergencyContact", "emergencyPhone", "notes"],
};

// The backend's field names don't always match the form's local field names
// (e.g. "fullName" vs "name"). Map backend -> local so errors attach to the
// right input.
const BACKEND_TO_FORM_FIELD: Record<string, keyof FormData> = {
  fullName: "name",
};

function stepForField(field: string): number {
  const local = BACKEND_TO_FORM_FIELD[field] ?? field;
  for (const [stepNum, fields] of Object.entries(STEP_FIELDS)) {
    if ((fields as string[]).includes(local)) return Number(stepNum);
  }
  return 3;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Client-side validation, mirroring the backend's zod schema closely enough
// that a user practically never reaches "submit" only to be bounced back for
// something that could've been caught while filling the step out.
function validateStep(stepNum: number, data: FormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (stepNum === 1) {
    if (!data.name.trim()) errors["name"] = "Full name is required";
    else if (data.name.trim().length < 2)
      errors["name"] = "Full name must be at least 2 characters";

    const phoneDigits = data.phone.replace(/\D/g, "");
    if (!data.phone.trim()) errors["phone"] = "Phone number is required";
    else if (phoneDigits.length < 10) errors["phone"] = "Enter a valid phone number";

    if (!data.gender) errors["gender"] = "Gender is required";

    if (!data.email.trim()) errors["email"] = "Email is required";
    else if (!EMAIL_RE.test(data.email.trim())) errors["email"] = "Enter a valid email address";

    if (!data.occupation.trim()) errors["occupation"] = "Occupation is required";
  }

  if (stepNum === 2) {
    if (!data.propertyId) errors["propertyId"] = "Please select a property";
    if (!data.roomId) errors["roomId"] = "Please select a room";
    if (!data.bedId) errors["bedId"] = "Please select a bed";

    if (!data.moveInDate) errors["moveInDate"] = "Move-in date is required";

    if (!data.monthlyRent.trim()) errors["monthlyRent"] = "Monthly rent is required";
    else if (!(Number(data.monthlyRent) > 0))
      errors["monthlyRent"] = "Monthly rent must be greater than 0";

    // Security deposit is optional, but if the user did type something it
    // must be a valid non-negative number (0 is allowed).
    if (data.securityDeposit.trim() && !(Number(data.securityDeposit) >= 0)) {
      errors["securityDeposit"] = "Security deposit cannot be negative";
    }
  }

  if (stepNum === 3) {
    if (!data.permanentAddress.trim()) errors["permanentAddress"] = "Permanent address is required";
    else if (data.permanentAddress.trim().length < 10)
      errors["permanentAddress"] = "Address must be at least 10 characters";

    if (!data.emergencyContact.trim())
      errors["emergencyContact"] = "Emergency contact name is required";

    const emergencyDigits = data.emergencyPhone.replace(/\D/g, "");
    if (!data.emergencyPhone.trim()) errors["emergencyPhone"] = "Emergency contact phone is required";
    else if (emergencyDigits.length < 10) errors["emergencyPhone"] = "Enter a valid phone number";
  }

  return errors;
}

export default function AddTenantModal({ open, onClose }: AddTenantModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const {
    data: propertiesData,
    isLoading: propertiesLoading,
    error: propertiesError,
  } = useQuery({
    queryKey: ["properties", "for-tenant-assignment"],
    queryFn: () =>
      apiRequest<PropertiesResponse>("/properties?limit=100&sort=createdAt&order=desc"),
    enabled: open,
  });

  // Only properties owned by this user (the API already scopes results to
  // the logged-in owner) AND with every required field filled in are
  // selectable — a tenant can never be pointed at a property typed in freehand.
  const eligibleProperties = (propertiesData?.properties ?? []).filter(isPropertyComplete);

  const {
    data: roomsData,
    isLoading: roomsLoading,
  } = useQuery({
    queryKey: ["rooms", "for-tenant-assignment", formData.propertyId],
    queryFn: () =>
      apiRequest<RoomsResponse>(
        `/rooms?propertyId=${encodeURIComponent(formData.propertyId)}&limit=100`,
      ),
    enabled: open && !!formData.propertyId,
    // Always re-read availability when the form is opened: a room created or
    // freed a moment ago must show up immediately.
    staleTime: 0,
    refetchOnMount: "always",
  });

  // A room is assignable when it has at least one free bed. `vacantBeds` comes
  // from the API, but we fall back to capacity - occupiedBeds so a room is never
  // wrongly hidden if that derived field is missing.
  const availableRooms = (roomsData?.rooms ?? []).filter((room) => {
    if (room.status === "MAINTENANCE") return false;
    const vacant =
      typeof room.vacantBeds === "number"
        ? room.vacantBeds
        : Math.max((room.capacity ?? 0) - (room.occupiedBeds ?? 0), 0);
    return vacant > 0;
  });

  const {
    data: bedsData,
    isLoading: bedsLoading,
  } = useQuery({
    queryKey: ["beds", "available", formData.roomId],
    queryFn: () => apiRequest<ApiBed[]>(`/rooms/${formData.roomId}/available-beds`),
    enabled: open && !!formData.roomId,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const availableBeds = bedsData ?? [];


  const mutation = useMutation({
    mutationFn: () => {
      const moveInIso = formData.moveInDate
        ? new Date(`${formData.moveInDate}T00:00:00`).toISOString()
        : "";
      return apiRequest("/tenants", {
        method: "POST",
        body: {
          fullName: formData.name,
          phone: formData.phone,
          email: formData.email,
          gender: formData.gender.toUpperCase(),
          occupation: formData.occupation,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
          permanentAddress: formData.permanentAddress,
          monthlyRent: Number(formData.monthlyRent),
          securityDeposit: Number(formData.securityDeposit || 0),
          moveInDate: moveInIso,
          propertyId: formData.propertyId,
          roomId: formData.roomId,
          bedId: formData.bedId,
          notes: formData.notes || undefined,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      // Occupancy changed: rooms/beds availability everywhere must refresh.
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["beds"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setFormData(initialFormData);
      setFieldErrors({});
      setStep(1);
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        // Map backend field names to local form field names so every error
        // has somewhere to render (e.g. "fullName" -> "name").
        const mapped: Record<string, string> = {};
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          mapped[BACKEND_TO_FORM_FIELD[field] ?? field] = message;
        }
        setFieldErrors(mapped);

        // The user may be sitting on step 3 when a step-1 or step-2 field
        // fails backend validation (e.g. a duplicate phone/email, or a bed
        // that was taken a moment ago). Jump back to the earliest step that
        // has an error so it's actually visible.
        const errorFields = Object.keys(mapped);
        if (errorFields.length > 0) {
          const earliestStep = Math.min(...errorFields.map(stepForField));
          setStep(earliestStep);
        }
      }
    },
  });

  // Reset dependent selections whenever the property (or room) changes, so
  // a stale room/bed from a previous property can never be submitted.
  useEffect(() => {
    setFormData((prev) => ({ ...prev, roomId: "", bedId: "" }));
    setFieldErrors((prev) => {
      if (!("roomId" in prev) && !("bedId" in prev)) return prev;
      const { roomId, bedId, ...rest } = prev;
      return rest;
    });
  }, [formData.propertyId]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, bedId: "" }));
    setFieldErrors((prev) => {
      if (!("bedId" in prev)) return prev;
      const { bedId, ...rest } = prev;
      return rest;
    });
  }, [formData.roomId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear this field's error the moment the user changes it, rather than
    // leaving a stale error on screen after they've already fixed it.
    setFieldErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  // Validates the current step and, if it passes, advances to the next one.
  // Returns whether the step was valid (used by handleSubmit on step 3).
  const goToNextStep = (): boolean => {
    const errors = validateStep(step, formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }));
      return false;
    }
    if (step < 3) setStep(step + 1);
    return true;
  };

  const handleNext = () => {
    goToNextStep();
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      goToNextStep();
      return;
    }
    const errors = validateStep(3, formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }));
      return;
    }
    mutation.mutate();
  };

  const noEligibleProperties =
    !propertiesLoading && !propertiesError && eligibleProperties.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
          >
            {/* Header */}
            <div className="border-b border-ink-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-ink-900">Add New Tenant</h2>
                <p className="text-sm text-ink-600">Step {step} of 3</p>
              </div>
              <button onClick={onClose} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-ink-100">
              <motion.div
                initial={{ width: "33.33%" }}
                animate={{ width: `${(step / 3) * 100}%` }}
                className="h-full bg-primary-600"
              />
            </div>

            {noEligibleProperties ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-warning-50 border border-warning-200">
                  <Building2 className="h-7 w-7 text-warning-600" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-ink-900">
                  Please add a property first before adding a tenant.
                </h3>
                <p className="mt-2 text-sm text-ink-600">
                  A tenant must be assigned to an existing property with complete details.
                </p>
                <Link
                  to="/properties"
                  onClick={onClose}
                  className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Go to Properties
                </Link>
              </div>
            ) : (
            <form onSubmit={handleSubmit}>
              <div className="min-h-80 px-6 py-6">
                {/* Step 1: Personal Information */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-ink-900 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-ink-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter tenant name"
                          className="w-full rounded-lg border border-ink-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          required
                        />
                      </div>
                      {fieldErrors["name"] && (
                        <p className="mt-1 text-xs text-danger-600">{fieldErrors["name"]}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-ink-900 mb-1">
                          Phone *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-5 w-5 text-ink-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            className="w-full rounded-lg border border-ink-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            required
                          />
                        </div>
                        {fieldErrors["phone"] && (
                          <p className="mt-1 text-xs text-danger-600">{fieldErrors["phone"]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ink-900 mb-1">
                          Gender *
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          required
                          className="w-full rounded-lg border border-ink-200 py-2.5 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        {fieldErrors["gender"] && (
                          <p className="mt-1 text-xs text-danger-600">{fieldErrors["gender"]}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-900 mb-1">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-ink-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="tenant@example.com"
                          required
                          className="w-full rounded-lg border border-ink-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      {fieldErrors["email"] && (
                        <p className="mt-1 text-xs text-danger-600">{fieldErrors["email"]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-900 mb-1">
                        Occupation *
                      </label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        placeholder="e.g., Software Engineer"
                        required
                        className="w-full rounded-lg border border-ink-200 py-2.5 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      {fieldErrors["occupation"] && (
                        <p className="mt-1 text-xs text-danger-600">{fieldErrors["occupation"]}</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Property Assignment */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-ink-900 mb-1">
                        Select Property *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-ink-400" />
                        <select
                          name="propertyId"
                          value={formData.propertyId}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-ink-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          required
                          disabled={propertiesLoading}
                        >
                          <option value="">
                            {propertiesLoading ? "Loading properties..." : "Select property"}
                          </option>
                          {eligibleProperties.map((property) => (
                            <option key={property.id} value={property.id}>
                              {property.propertyName}
                            </option>
                          ))}
                        </select>
                      </div>
                      {fieldErrors["propertyId"] && (
                        <p className="mt-1 text-xs text-danger-600">{fieldErrors["propertyId"]}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-ink-900 mb-1">
                          Room *
                        </label>
                        <select
                          name="roomId"
                          value={formData.roomId}
                          onChange={handleChange}
                          disabled={!formData.propertyId || roomsLoading}
                          className="w-full rounded-lg border border-ink-200 py-2.5 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-ink-50 disabled:text-ink-400"
                          required
                        >
                          <option value="">
                            {!formData.propertyId
                              ? "Select property first"
                              : roomsLoading
                                ? "Loading rooms..."
                                : availableRooms.length === 0
                                  ? "No rooms with vacant beds"
                                  : "Select room"}
                          </option>
                          {availableRooms.map((room) => (
                            <option key={room.id} value={room.id}>
                              #{room.roomNumber} ({room.vacantBeds} vacant)
                            </option>
                          ))}
                        </select>
                        {fieldErrors["roomId"] && (
                          <p className="mt-1 text-xs text-danger-600">{fieldErrors["roomId"]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ink-900 mb-1">Bed *</label>
                        <select
                          name="bedId"
                          value={formData.bedId}
                          onChange={handleChange}
                          disabled={!formData.roomId || bedsLoading}
                          className="w-full rounded-lg border border-ink-200 py-2.5 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-ink-50 disabled:text-ink-400"
                          required
                        >
                          <option value="">
                            {!formData.roomId
                              ? "Select room first"
                              : bedsLoading
                                ? "Loading beds..."
                                : availableBeds.length === 0
                                  ? "No vacant beds"
                                  : "Select bed"}
                          </option>
                          {availableBeds.map((bed) => (
                            <option key={bed.id} value={bed.id}>
                              Bed {bed.bedNumber}
                            </option>
                          ))}
                        </select>
                        {fieldErrors["bedId"] && (
                          <p className="mt-1 text-xs text-danger-600">{fieldErrors["bedId"]}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-900 mb-1">
                        Move-in Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-ink-400" />
                        <input
                          type="date"
                          name="moveInDate"
                          value={formData.moveInDate}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-ink-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          required
                        />
                      </div>
                      {fieldErrors["moveInDate"] && (
                        <p className="mt-1 text-xs text-danger-600">{fieldErrors["moveInDate"]}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-ink-900 mb-1">
                          Monthly Rent *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-5 w-5 text-ink-400" />
                          <input
                            type="number"
                            name="monthlyRent"
                            value={formData.monthlyRent}
                            onChange={handleChange}
                            placeholder="3000"
                            min="0"
                            className="w-full rounded-lg border border-ink-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            required
                          />
                        </div>
                        {fieldErrors["monthlyRent"] && (
                          <p className="mt-1 text-xs text-danger-600">
                            {fieldErrors["monthlyRent"]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ink-900 mb-1">
                          Security Deposit
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-5 w-5 text-ink-400" />
                          <input
                            type="number"
                            name="securityDeposit"
                            value={formData.securityDeposit}
                            onChange={handleChange}
                            placeholder="6000"
                            min="0"
                            className="w-full rounded-lg border border-ink-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        </div>
                        {fieldErrors["securityDeposit"] && (
                          <p className="mt-1 text-xs text-danger-600">
                            {fieldErrors["securityDeposit"]}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Additional Details */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-ink-900 mb-1">
                        Permanent Address *
                      </label>
                      <textarea
                        name="permanentAddress"
                        value={formData.permanentAddress}
                        onChange={handleChange}
                        placeholder="Full permanent address"
                        rows={2}
                        required
                        className="w-full rounded-lg border border-ink-200 py-2.5 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      {fieldErrors["permanentAddress"] && (
                        <p className="mt-1 text-xs text-danger-600">
                          {fieldErrors["permanentAddress"]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-900 mb-1">
                        Emergency Contact Name *
                      </label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        placeholder="Parent or guardian name"
                        required
                        className="w-full rounded-lg border border-ink-200 py-2.5 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      {fieldErrors["emergencyContact"] && (
                        <p className="mt-1 text-xs text-danger-600">
                          {fieldErrors["emergencyContact"]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-900 mb-1">
                        Emergency Contact Phone *
                      </label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        required
                        className="w-full rounded-lg border border-ink-200 py-2.5 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      {fieldErrors["emergencyPhone"] && (
                        <p className="mt-1 text-xs text-danger-600">
                          {fieldErrors["emergencyPhone"]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-900 mb-1">Notes</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Any special notes about the tenant..."
                        rows={3}
                        className="w-full rounded-lg border border-ink-200 py-2.5 px-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    {mutation.isError && !Object.keys(fieldErrors).length && (
                      <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3">
                        <AlertCircle className="h-4 w-4 text-danger-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-danger-700">
                          {mutation.error instanceof Error
                            ? mutation.error.message
                            : "Failed to save tenant. Please try again."}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-ink-100 flex items-center justify-between bg-ink-50 px-6 py-4 rounded-b-2xl">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={step === 1}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-ink-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ink-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
                <div className="flex gap-2">
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="rounded-lg bg-success-600 px-4 py-2 text-sm font-medium text-white hover:bg-success-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {mutation.isPending ? "Saving..." : "Save Tenant"}
                    </button>
                  )}
                </div>
              </div>
            </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
