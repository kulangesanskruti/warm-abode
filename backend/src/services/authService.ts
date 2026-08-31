import { userRepository } from "../repositories/userRepository";
import { hashPassword, comparePasswords } from "../utils/password";
import { generateTokenPair, verifyToken } from "../utils/jwt";
import { ApiError, HttpStatusCode } from "../utils/errors";
import { logger } from "../utils/logger";
import { isProfileComplete } from "../utils/profile";
import crypto from "crypto";

type UserRole = "OWNER" | "MANAGER" | "ACCOUNTANT";

interface AuthResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: UserRole;
    profilePhoto: string | null;
    isVerified: boolean;
    profileComplete: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

interface PasswordResetToken {
  token: string;
  expiresAt: Date;
  userId: string;
}

// In-memory storage for password reset tokens (production should use database/Redis)
const passwordResetTokens = new Map<string, PasswordResetToken>();

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
  }): Promise<AuthResponse> {
    try {
      // Check if email already exists
      const existingEmailUser = await userRepository.findByEmail(data.email);
      if (existingEmailUser) {
        throw new ApiError("Email already registered", HttpStatusCode.CONFLICT);
      }

      // Check if phone already exists
      const existingPhoneUser = await userRepository.findByPhone(data.phone);
      if (existingPhoneUser) {
        throw new ApiError("Phone number already registered", HttpStatusCode.CONFLICT);
      }

      // Hash password
      const passwordHash = await hashPassword(data.password);

      // Create user
      const user = await userRepository.create({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: data.role || "OWNER",
      });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      logger.info("User registered successfully", { userId: user.id });

      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profilePhoto: user.profilePhoto,
          isVerified: user.isVerified,
          profileComplete: isProfileComplete(user),
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Registration error:", error);
      throw new ApiError("Registration failed", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Credential accessor: this is one of the only paths allowed to read
      // the password hash.
      const user = await userRepository.findByEmailWithCredentials(email);
      if (!user) {
        throw new ApiError("Invalid email or password", HttpStatusCode.UNAUTHORIZED);
      }

      // Compare passwords
      const isPasswordValid = await comparePasswords(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new ApiError("Invalid email or password", HttpStatusCode.UNAUTHORIZED);
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      logger.info("User logged in successfully", { userId: user.id });

      return {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profilePhoto: user.profilePhoto,
          isVerified: user.isVerified,
          profileComplete: isProfileComplete(user),
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Login error:", error);
      throw new ApiError("Login failed", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = verifyToken(refreshToken);

      // Generate new token pair
      const tokens = generateTokenPair({
        userId: decoded.payload.userId,
        email: decoded.payload.email,
        role: decoded.payload.role,
      });

      logger.info("Access token refreshed", { userId: decoded.payload.userId });

      return tokens;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Token refresh error:", error);
      throw new ApiError("Token refresh failed", HttpStatusCode.UNAUTHORIZED);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId: string) {
    try {
      const user = await userRepository.findByIdSafe(userId);
      if (!user) {
        throw new ApiError("User not found", HttpStatusCode.NOT_FOUND);
      }

      return { ...user, profileComplete: isProfileComplete(user) };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Error getting current user:", error);
      throw new ApiError("Failed to get current user", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: {
      fullName?: string;
      phone?: string;
      profilePhoto?: string | null;
    },
  ) {
    try {
      // Check if phone is being updated and already exists
      if (data.phone) {
        const existingUser = await userRepository.findByPhone(data.phone);
        if (existingUser && existingUser.id !== userId) {
          throw new ApiError("Phone number already in use", HttpStatusCode.CONFLICT);
        }
      }

      const user = await userRepository.updateProfile(userId, data);

      logger.info("User profile updated", { userId });

      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePhoto: user.profilePhoto,
        isVerified: user.isVerified,
        profileComplete: isProfileComplete(user),
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Error updating profile:", error);
      throw new ApiError("Failed to update profile", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      // Credential accessor: needed to verify the caller's current password.
      const user = await userRepository.findByIdWithCredentials(userId);
      if (!user) {
        throw new ApiError("User not found", HttpStatusCode.NOT_FOUND);
      }

      // Verify old password
      const isPasswordValid = await comparePasswords(oldPassword, user.passwordHash);
      if (!isPasswordValid) {
        throw new ApiError("Invalid old password", HttpStatusCode.UNAUTHORIZED);
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password
      await userRepository.updatePassword(userId, newPasswordHash);

      logger.info("User password changed", { userId });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Error changing password:", error);
      throw new ApiError("Failed to change password", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<string> {
    try {
      // Existence check only — no credentials needed here.
      const user = await userRepository.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists (security)
        logger.info("Password reset requested for non-existent email", { email });
        return "If the email exists, password reset instructions have been sent";
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

      // Store token
      passwordResetTokens.set(resetToken, {
        token: resetToken,
        expiresAt,
        userId: user.id,
      });

      // In production, send email here
      logger.info("Password reset token generated", { userId: user.id, resetToken });

      return "If the email exists, password reset instructions have been sent";
    } catch (error) {
      logger.error("Error in forgot password:", error);
      throw new ApiError(
        "Failed to process password reset request",
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Find reset token
      const resetTokenData = passwordResetTokens.get(token);
      if (!resetTokenData) {
        throw new ApiError("Invalid or expired reset token", HttpStatusCode.UNAUTHORIZED);
      }

      // Check if token is expired
      if (new Date() > resetTokenData.expiresAt) {
        passwordResetTokens.delete(token);
        throw new ApiError("Reset token has expired", HttpStatusCode.UNAUTHORIZED);
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password
      await userRepository.updatePassword(resetTokenData.userId, newPasswordHash);

      // Delete token
      passwordResetTokens.delete(token);

      logger.info("User password reset", { userId: resetTokenData.userId });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error("Error resetting password:", error);
      throw new ApiError("Failed to reset password", HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}

export const authService = new AuthService();
