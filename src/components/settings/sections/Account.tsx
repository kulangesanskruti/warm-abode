import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Camera, Loader2, AlertCircle } from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  getInitials,
  refreshCurrentUser,
  removeProfilePhoto,
  updateProfile,
  uploadProfilePhoto,
  useCurrentUser,
  validatePhotoFile,
} from "@/lib/profile";

const LOCAL_PREFS_KEY = "stayhub.accountPreferences";

type Preferences = { language: string; timezone: string; currency: string };

const defaultPreferences: Preferences = {
  language: "English",
  timezone: "Asia/Kolkata",
  currency: "INR",
};

function readPreferences(): Preferences {
  if (typeof window === "undefined") return defaultPreferences;
  try {
    const raw = window.localStorage.getItem(LOCAL_PREFS_KEY);
    return raw ? { ...defaultPreferences, ...(JSON.parse(raw) as Preferences) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const field = Object.values(error.fieldErrors)[0];
    if (error.status === 0) return "Unable to reach the server. Please check your connection.";
    if (error.status === 401) return "Your session expired. Please sign in again.";
    return field ?? error.message ?? fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function Account() {
  const user = useCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState<"upload" | "remove" | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Preferences>(() => readPreferences());
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });

  // Load the authoritative record once so stale cached values never show.
  useEffect(() => {
    refreshCurrentUser().catch(() => {
      // A failed refresh must not sign the user out; cached values stay visible.
    });
  }, []);

  // Keep the editable fields in sync with the logged-in user.
  useEffect(() => {
    if (!user) return;
    setForm({ fullName: user.fullName ?? "", email: user.email ?? "", phone: user.phone ?? "" });
  }, [user?.id, user?.fullName, user?.email, user?.phone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaveSuccess(false);
    setSaveError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreferences((prev) => {
      const next = { ...prev, [e.target.name]: e.target.value };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const handlePickPhoto = () => {
    setPhotoError(null);
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const invalid = validatePhotoFile(file);
    if (invalid) {
      setPhotoError(invalid);
      return;
    }

    setPhotoError(null);
    setPhotoBusy("upload");
    try {
      await uploadProfilePhoto(file);
    } catch (error) {
      setPhotoError(errorMessage(error, "Could not upload the photo. Please try again."));
    } finally {
      setPhotoBusy(null);
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoError(null);
    setPhotoBusy("remove");
    try {
      await removeProfilePhoto();
    } catch (error) {
      setPhotoError(errorMessage(error, "Could not remove the photo. Please try again."));
    } finally {
      setPhotoBusy(null);
    }
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);

    const fullName = form.fullName.trim();
    const phone = form.phone.trim();
    if (fullName.length < 2) {
      setSaveError("Please enter your full name (at least 2 characters).");
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ fullName, ...(phone ? { phone } : {}) });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (error) {
      setSaveError(errorMessage(error, "Could not save your changes. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSaveError(null);
    setSaveSuccess(false);
    setForm({
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    });
  };

  const initials = getInitials(user?.fullName);

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink-900">Account Settings</h1>
        <p className="mt-2 text-ink-600">Manage your personal account details</p>
      </div>

      {/* Profile Photo */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-ink-200 bg-white p-6"
      >
        <h3 className="mb-4 text-lg font-semibold text-ink-900">Profile Photo</h3>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-visible rounded-full bg-gradient-to-br from-primary-400 to-primary-600">
            <div className="h-full w-full overflow-hidden rounded-full">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.fullName || "Profile photo"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-2xl font-bold text-white">{initials}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handlePickPhoto}
              disabled={photoBusy !== null}
              aria-label="Upload profile photo"
              className="absolute bottom-0 right-0 rounded-full bg-primary-600 p-2 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {photoBusy === "upload" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoSelected}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-ink-900">{user?.fullName || "—"}</p>
            <p className="text-xs text-ink-500">JPG, PNG or WebP · up to 5 MB</p>
            <div className="mt-1 flex items-center gap-3">
              <button
                type="button"
                onClick={handlePickPhoto}
                disabled={photoBusy !== null}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-60"
              >
                {user?.profilePhoto ? "Change Photo" : "Upload Photo"}
              </button>
              {user?.profilePhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={photoBusy !== null}
                  className="text-sm font-medium text-danger-600 hover:text-danger-700 disabled:opacity-60"
                >
                  {photoBusy === "remove" ? "Removing…" : "Remove Photo"}
                </button>
              )}
            </div>
          </div>
        </div>

        {photoError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{photoError}</span>
          </div>
        )}
      </motion.div>

      {/* Account Information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6 rounded-xl border border-ink-200 bg-white p-6"
      >
        <h3 className="text-lg font-semibold text-ink-900">Personal Information</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink-700">Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 placeholder-ink-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              readOnly
              title="Email cannot be changed here"
              className="w-full cursor-not-allowed rounded-lg border border-ink-200 bg-ink-50 px-4 py-2.5 text-ink-600"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink-700">Phone</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 placeholder-ink-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink-700">Language</label>
            <select
              name="language"
              value={preferences.language}
              onChange={handlePreferenceChange}
              className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Spanish</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink-700">Timezone</label>
            <select
              name="timezone"
              value={preferences.timezone}
              onChange={handlePreferenceChange}
              className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option>Asia/Kolkata</option>
              <option>UTC</option>
              <option>America/New_York</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink-700">Currency</label>
            <select
              name="currency"
              value={preferences.currency}
              onChange={handlePreferenceChange}
              className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option>INR</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </div>
        </div>
      </motion.div>

      {saveError && (
        <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-70 ${
            saveSuccess
              ? "bg-success-600 hover:bg-success-700"
              : "bg-primary-600 hover:bg-primary-700"
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : saveSuccess ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            "Save Changes"
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="rounded-lg border border-ink-200 bg-white px-6 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-70"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}
