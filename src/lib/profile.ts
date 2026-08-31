/**
 * Current-user profile helpers.
 *
 * Everything here keeps the cached session user (localStorage) in sync with the
 * backend, and notifies subscribers so the Header, Sidebar and Account settings
 * update instantly after an upload / save / remove.
 */
import { useEffect, useState } from "react";
import {
  apiRequest,
  apiUpload,
  getStoredUser,
  setStoredUser,
  subscribeToUser,
  type AuthUser,
} from "./api";

export type UploadedFile = {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
};

/** Reactive access to the logged-in user. */
export function useCurrentUser(): AuthUser | null {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  useEffect(() => {
    setUser(getStoredUser());
    return subscribeToUser(() => setUser(getStoredUser()));
  }, []);

  return user;
}

export function getInitials(fullName?: string | null): string {
  const parts = (fullName ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

/** Fetches the authoritative user record and refreshes the cached copy. */
export async function refreshCurrentUser(): Promise<AuthUser> {
  const { user } = await apiRequest<{ user: AuthUser }>("/auth/me");
  setStoredUser(user);
  return user;
}

export async function updateProfile(input: {
  fullName?: string;
  phone?: string;
  profilePhoto?: string | null;
}): Promise<AuthUser> {
  const { user } = await apiRequest<{ user: AuthUser }>("/auth/profile", {
    method: "PUT",
    body: input,
  });
  setStoredUser(user);
  return user;
}

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Validates a chosen file before it hits the network. */
export function validatePhotoFile(file: File): string | null {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return "Please choose a JPG, PNG or WebP image.";
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return "Image is too large. Please choose a file under 5 MB.";
  }
  return null;
}

/**
 * Uploads the image, then persists the returned URL to the user's
 * `profilePhoto`. Only resolves once the database has the new URL.
 */
export async function uploadProfilePhoto(file: File): Promise<AuthUser> {
  const asset = await apiUpload<UploadedFile>("/files/profile-photo", file, {
    category: "PROFILE_PHOTO",
    entityType: "USER",
  });
  if (!asset?.url) {
    throw new Error("Upload succeeded but no photo URL was returned by the server.");
  }
  return updateProfile({ profilePhoto: asset.url });
}

export async function removeProfilePhoto(): Promise<AuthUser> {
  return updateProfile({ profilePhoto: null });
}
