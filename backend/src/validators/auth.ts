import { z } from "zod";

// User roles enum
enum UserRole {
  OWNER = "OWNER",
  MANAGER = "MANAGER",
  ACCOUNTANT = "ACCOUNTANT",
}

// Register validation
export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters"),
  email: z.string().email("Invalid email format").toLowerCase(),
  phone: z.string().regex(/^[\d\s\-\+\(\)]{10,}$/, "Invalid phone number format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one digit")
    .regex(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      "Password must contain at least one special character",
    ),
  role: z
    .enum([UserRole.OWNER, UserRole.MANAGER, UserRole.ACCOUNTANT])
    .optional()
    .default(UserRole.OWNER),
});

export type RegisterRequest = z.infer<typeof registerSchema>;

// Login validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof loginSchema>;

// Refresh token validation
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;

// Update profile validation
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .optional(),
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]{10,}$/, "Invalid phone number format")
    .optional(),
  // Accepts an absolute URL (https://...) or an app-relative upload path
  // (/api/v1/uploads/...). null or "" clears the photo.
  profilePhoto: z
    .union([
      z
        .string()
        .trim()
        .max(2048, "Photo URL is too long")
        .refine(
          (value) => value === "" || /^https?:\/\//i.test(value) || value.startsWith("/"),
          "Photo must be an absolute URL or an uploaded file path",
        ),
      z.null(),
    ])
    .optional()
    .transform((value) => (value === "" ? null : value)),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;

// Change password validation
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one digit")
      .regex(
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from old password",
    path: ["newPassword"],
  });

export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;

// Forgot password validation
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),
});

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;

// Reset password validation
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one digit")
      .regex(
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
