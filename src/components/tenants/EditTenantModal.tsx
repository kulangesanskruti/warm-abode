import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import {
  updateTenant,
  TENANT_WRITE_INVALIDATIONS,
  type ApiTenantDetail,
  type UpdateTenantBody,
} from "@/lib/tenants";

interface EditTenantModalProps {
  open: boolean;
  onClose: () => void;
  tenant: Pick<
    ApiTenantDetail,
    | "id"
    | "fullName"
    | "phone"
    | "email"
    | "gender"
    | "occupation"
    | "emergencyContact"
    | "emergencyPhone"
    | "permanentAddress"
    | "monthlyRent"
    | "securityDeposit"
    | "notes"
  >;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditTenantModal({ open, onClose, tenant }: EditTenantModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    gender: "",
    occupation: "",
    emergencyContact: "",
    emergencyPhone: "",
    permanentAddress: "",
    monthlyRent: "",
    securityDeposit: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Always seed the form from the tenant record currently in the cache, so
  // the edit form shows real stored values (never defaults).
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      fullName: tenant.fullName ?? "",
      phone: tenant.phone ?? "",
      email: tenant.email ?? "",
      gender: (tenant.gender ?? "").toUpperCase(),
      occupation: tenant.occupation ?? "",
      emergencyContact: tenant.emergencyContact ?? "",
      emergencyPhone: tenant.emergencyPhone ?? "",
      permanentAddress: tenant.permanentAddress ?? "",
      monthlyRent: tenant.monthlyRent != null ? String(Number(tenant.monthlyRent)) : "",
      securityDeposit:
        tenant.securityDeposit != null ? String(Number(tenant.securityDeposit)) : "",
      notes: tenant.notes ?? "",
    });
  }, [open, tenant]);

  const mutation = useMutation({
    mutationFn: () => {
      const body: UpdateTenantBody = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        occupation: form.occupation.trim() || undefined,
        emergencyContact: form.emergencyContact.trim() || undefined,
        emergencyPhone: form.emergencyPhone.trim() || undefined,
        permanentAddress: form.permanentAddress.trim() || undefined,
        monthlyRent: Number(form.monthlyRent),
        securityDeposit: Number(form.securityDeposit || 0),
        notes: form.notes,
      };
      if (form.gender) body.gender = form.gender;
      return updateTenant(tenant.id, body);
    },
    onSuccess: () => {
      for (const key of TENANT_WRITE_INVALIDATIONS) {
        queryClient.invalidateQueries({ queryKey: [...key] });
      }
      onClose();
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setErrors(
          Object.keys(error.fieldErrors).length
            ? error.fieldErrors
            : { form: error.message },
        );
      } else {
        setErrors({ form: "Could not update tenant. Please try again." });
      }
    },
  });

  const change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (form.fullName.trim().length < 2) next["fullName"] = "Full name is required";
    if (form.phone.replace(/\D/g, "").length < 10) next["phone"] = "Enter a valid phone number";
    if (!EMAIL_RE.test(form.email.trim())) next["email"] = "Enter a valid email address";
    if (!(Number(form.monthlyRent) > 0)) next["monthlyRent"] = "Monthly rent must be greater than 0";
    if (form.securityDeposit.trim() && Number(form.securityDeposit) < 0)
      next["securityDeposit"] = "Security deposit cannot be negative";
    if (form.permanentAddress.trim() && form.permanentAddress.trim().length < 10)
      next["permanentAddress"] = "Address must be at least 10 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate();
  };

  const field = (name: keyof typeof form, label: string, type = "text") => (
    <div>
      <label className="block text-sm font-medium text-ink-900 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={change}
        className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
      {errors[name] && <p className="mt-1 text-xs text-danger-600">{errors[name]}</p>}
    </div>
  );

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
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-ink-900">Edit Tenant</h2>
                <p className="text-sm text-ink-600">{tenant.fullName}</p>
              </div>
              <button onClick={onClose} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4 px-6 py-6">
              {errors["form"] && (
                <div className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
                  {errors["form"]}
                </div>
              )}

              {field("fullName", "Full Name *")}
              <div className="grid grid-cols-2 gap-3">
                {field("phone", "Phone *", "tel")}
                {field("email", "Email *", "email")}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-ink-900 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={change}
                    className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                {field("occupation", "Occupation")}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {field("monthlyRent", "Monthly Rent *", "number")}
                {field("securityDeposit", "Security Deposit", "number")}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {field("emergencyContact", "Emergency Contact")}
                {field("emergencyPhone", "Emergency Phone", "tel")}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-900 mb-1">
                  Permanent Address
                </label>
                <textarea
                  name="permanentAddress"
                  rows={2}
                  value={form.permanentAddress}
                  onChange={change}
                  className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {errors["permanentAddress"] && (
                  <p className="mt-1 text-xs text-danger-600">{errors["permanentAddress"]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-900 mb-1">Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  value={form.notes}
                  onChange={change}
                  className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-ink-100 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  {mutation.isPending ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
