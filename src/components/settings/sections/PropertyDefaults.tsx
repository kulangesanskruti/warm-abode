import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Building2, Loader2, Plus, AlertCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { apiRequest, ApiError } from "@/lib/api";

type ApiProperty = {
  id: string;
  propertyName: string;
  propertyType: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  description: string | null;
};

type PropertiesResponse = {
  properties: ApiProperty[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

type FormState = {
  propertyName: string;
  propertyType: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  description: string;
};

const PROPERTY_TYPES = ["PG", "Apartment", "Villa", "Commercial"];

const toForm = (p: ApiProperty): FormState => ({
  propertyName: p.propertyName ?? "",
  propertyType: p.propertyType ?? "PG",
  address: p.address ?? "",
  city: p.city ?? "",
  state: p.state ?? "",
  pincode: p.pincode ?? "",
  country: p.country ?? "India",
  description: p.description ?? "",
});

const inputClass =
  "w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 placeholder-ink-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100";

export default function PropertyDefaults() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string>("");
  const [form, setForm] = useState<FormState | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["properties", "settings-defaults"],
    queryFn: () =>
      apiRequest<PropertiesResponse>("/properties?limit=100&sort=createdAt&order=desc"),
  });

  const properties = useMemo(() => data?.properties ?? [], [data]);

  const selected = properties.find((p) => p.id === selectedId) ?? properties[0];

  useEffect(() => {
    if (!selected) {
      setForm(null);
      return;
    }
    if (selected.id !== selectedId) setSelectedId(selected.id);
    setForm(toForm(selected));
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const mutation = useMutation({
    mutationFn: async (values: FormState) => {
      if (!selected) throw new Error("No property selected");
      return apiRequest<{ property: ApiProperty }>(`/properties/${selected.id}`, {
        method: "PUT",
        body: values,
      });
    },
    onSuccess: async () => {
      setSaveError(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (err: unknown) => {
      setSaveError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Failed to save property changes.",
      );
    },
  });

  const change = (key: keyof FormState, value: string) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ink-900">Property Defaults</h1>
        <p className="mt-2 text-ink-600">View and update details of your properties</p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-6 text-ink-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your properties...
        </div>
      )}

      {!isLoading && error && (
        <div className="flex items-center gap-3 rounded-xl border border-danger-200 bg-danger-50 p-6 text-danger-700">
          <AlertCircle className="h-4 w-4" />
          {error instanceof Error ? error.message : "Failed to load properties."}
        </div>
      )}

      {!isLoading && !error && properties.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-ink-200 bg-white p-10 text-center"
        >
          <Building2 className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-4 font-medium text-ink-900">You haven't added any properties yet.</p>
          <button
            onClick={() => navigate({ to: "/properties" })}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" /> Add Property
          </button>
        </motion.div>
      )}

      {!isLoading && !error && properties.length > 0 && form && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-ink-200 bg-white p-6"
          >
            <label className="block text-sm font-medium text-ink-700 mb-2">Select Property</label>
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                const next = properties.find((p) => p.id === e.target.value);
                if (next) setForm(toForm(next));
                setSaveError(null);
              }}
              className={inputClass}
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.propertyName}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl border border-ink-200 bg-white p-6 space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Property Name</label>
                <input
                  type="text"
                  value={form.propertyName}
                  onChange={(e) => change("propertyName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => change("city", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => change("address", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => change("state", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Pincode</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => change("pincode", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => change("country", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => change("description", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Property Type</label>
              <div className="grid grid-cols-4 gap-3">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => change("propertyType", type)}
                    className={`rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                      form.propertyType === type
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-ink-200 bg-white text-ink-600 hover:border-ink-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {saveError && (
            <div className="flex items-center gap-2 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              <AlertCircle className="h-4 w-4" /> {saveError}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-60 ${
                saveSuccess
                  ? "bg-success-600 hover:bg-success-700"
                  : "bg-primary-600 hover:bg-primary-700"
              }`}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="h-4 w-4" /> Saved
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              onClick={() => {
                if (selected) setForm(toForm(selected));
                setSaveError(null);
              }}
              className="rounded-lg border border-ink-200 bg-white px-6 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
            >
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}
