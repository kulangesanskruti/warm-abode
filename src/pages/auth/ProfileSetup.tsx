import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { User, Phone, Camera, Loader2, AlertCircle } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";
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

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return "Unable to reach the server. Please check your connection.";
    if (error.status === 401) return "Your session expired. Please sign in again.";
    return error.message || fallback;
  }
  return fallback;
}

export default function ProfileSetup() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState<"upload" | "remove" | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Load the authoritative record so a stale cached user never lets someone
  // skip setup with data that's actually incomplete on the server.
  useEffect(() => {
    refreshCurrentUser().catch(() => {
      // A failed refresh must not block the form — it can still be filled
      // in and submitted; the save itself will surface any real error.
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName ?? "");
    setPhone(user.phone ?? "");
  }, [user?.id, user?.fullName, user?.phone]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError("");

    const errors: Record<string, string> = {};
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    if (trimmedName.length < 2) {
      errors["fullName"] = "Full name must be at least 2 characters";
    }
    if (!trimmedPhone) {
      errors["phone"] = "Phone number is required";
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProfile({ fullName: trimmedName, phone: trimmedPhone });
      if (updated.profileComplete) {
        await navigate({ to: "/dashboard" });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors);
        setFormError(Object.keys(err.fieldErrors).length ? "" : err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const initials = getInitials(fullName || user?.fullName);

  return (
    <AuthLayout
      title="Complete your profile"
      subtitle="A couple of quick details and you're ready to go."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Profile photo — optional */}
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-visible rounded-full bg-gradient-to-br from-primary-400 to-primary-600">
            <div className="h-full w-full overflow-hidden rounded-full">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.fullName || "Profile photo"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-xl font-bold text-white">{initials}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handlePickPhoto}
              disabled={photoBusy !== null}
              aria-label="Upload profile photo"
              className="absolute bottom-0 right-0 rounded-full bg-primary-600 p-1.5 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {photoBusy === "upload" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
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
            <p className="text-sm font-semibold text-ink-900">Profile photo</p>
            <p className="text-xs text-ink-500">Optional · JPG, PNG or WebP, up to 5 MB</p>
            <div className="mt-1 flex items-center gap-3">
              <button
                type="button"
                onClick={handlePickPhoto}
                disabled={photoBusy !== null}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-60"
              >
                {user?.profilePhoto ? "Change" : "Upload"}
              </button>
              {user?.profilePhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={photoBusy !== null}
                  className="text-xs font-medium text-danger-600 hover:text-danger-700 disabled:opacity-60"
                >
                  {photoBusy === "remove" ? "Removing…" : "Remove"}
                </button>
              )}
            </div>
          </div>
        </div>

        {photoError && (
          <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{photoError}</span>
          </div>
        )}

        <Input
          label="Full Name"
          placeholder="Prashant Sharma"
          icon={<User className="h-4.5 w-4.5" />}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={fieldErrors["fullName"]}
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+91 98765 43210"
          icon={<Phone className="h-4.5 w-4.5" />}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={fieldErrors["phone"]}
        />

        {formError && (
          <p className="text-sm font-medium text-danger-600" role="alert">
            {formError}
          </p>
        )}

        <div className="pt-2">
          <AuthButton type="submit" loading={saving}>
            {saving ? "Saving..." : "Continue to Dashboard"}
          </AuthButton>
        </div>
      </form>
    </AuthLayout>
  );
}
