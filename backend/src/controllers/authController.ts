import { Request, Response } from "express";
import { authService } from "../services/authService";
import { validateAsync } from "../utils/validation";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "../validators/auth";
import { sendSuccessResponse, ApiError, HttpStatusCode, validationError } from "../utils/errors";
import { logger } from "../utils/logger";

const REFRESH_TOKEN_COOKIE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export class AuthController {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response): Promise<Response | void> {
    // Validate request
    const validation = await validateAsync<RegisterRequest>(registerSchema, req.body);
    if (!validation.isValid) {
      throw validationError(validation.errors);
    }

    // Register user
    const regData = validation.data as RegisterRequest;
    const result = await authService.register(regData);

    // Set refresh token as HttpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_COOKIE_EXPIRY,
    });

    logger.info("User registration response sent", { userId: result.user.id });

    return sendSuccessResponse(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      "User registered successfully",
      HttpStatusCode.CREATED,
    );
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response): Promise<Response | void> {
    // Validate request
    const validation = await validateAsync<LoginRequest>(loginSchema, req.body);
    if (!validation.isValid) {
      throw validationError(validation.errors);
    }

    // Login user
    const result = await authService.login(validation.data!.email, validation.data!.password);

    // Set refresh token as HttpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_COOKIE_EXPIRY,
    });

    logger.info("User login response sent", { userId: result.user.id });

    return sendSuccessResponse(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      "Login successful",
    );
  }

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  async logout(req: Request, res: Response): Promise<Response | void> {
    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    logger.info("User logout response sent", { userId: req.user?.userId });

    return sendSuccessResponse(res, undefined, "Logout successful");
  }

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  async refreshToken(req: Request, res: Response): Promise<Response | void> {
    // Get refresh token from cookie or body
    let refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      const validation = await validateAsync<RefreshTokenRequest>(refreshTokenSchema, req.body);
      if (!validation.isValid) {
        throw validationError(validation.errors);
      }
      refreshToken = validation.data!.refreshToken;
    }

    // Refresh token
    const tokens = await authService.refreshAccessToken(refreshToken);

    // Update refresh token cookie
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_COOKIE_EXPIRY,
    });

    logger.info("Token refresh response sent");

    return sendSuccessResponse(
      res,
      {
        accessToken: tokens.accessToken,
      },
      "Token refreshed successfully",
    );
  }

  /**
   * Get current user
   * GET /api/v1/auth/me
   */
  async getCurrentUser(req: Request, res: Response): Promise<Response | void> {
    if (!req.user?.userId) {
      throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
    }

    const user = await authService.getCurrentUser(req.user.userId);

    logger.info("Get current user response sent", { userId: req.user.userId });

    return sendSuccessResponse(res, { user }, "Current user retrieved");
  }

  /**
   * Update user profile
   * PUT /api/v1/auth/profile
   */
  async updateProfile(req: Request, res: Response): Promise<Response | void> {
    if (!req.user?.userId) {
      throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
    }

    // Validate request
    const validation = await validateAsync(updateProfileSchema, req.body);
    if (!validation.isValid) {
      throw validationError(validation.errors);
    }

    const user = await authService.updateProfile(req.user.userId, validation.data!);

    logger.info("Profile update response sent", { userId: req.user.userId });

    return sendSuccessResponse(res, { user }, "Profile updated successfully");
  }

  /**
   * Change password
   * PUT /api/v1/auth/change-password
   */
  async changePassword(req: Request, res: Response): Promise<Response | void> {
    if (!req.user?.userId) {
      throw new ApiError("Unauthorized", HttpStatusCode.UNAUTHORIZED);
    }

    // Validate request
    const validation = await validateAsync<ChangePasswordRequest>(changePasswordSchema, req.body);
    if (!validation.isValid) {
      throw validationError(validation.errors);
    }

    const validData = validation.data as ChangePasswordRequest;
    await authService.changePassword(
      req.user.userId,
      validData.oldPassword,
      validData.newPassword,
    );

    logger.info("Password change response sent", { userId: req.user.userId });

    return sendSuccessResponse(res, undefined, "Password changed successfully");
  }

  /**
   * Forgot password
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response): Promise<Response | void> {
    // Validate request
    const validation = await validateAsync(forgotPasswordSchema, req.body);
    if (!validation.isValid) {
      throw validationError(validation.errors);
    }

    const forgotData = validation.data as ForgotPasswordRequest;
    const message = await authService.forgotPassword(forgotData.email);

    logger.info("Forgot password response sent");

    return sendSuccessResponse(res, undefined, message);
  }

  /**
   * Reset password
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req: Request, res: Response): Promise<Response | void> {
    // Validate request
    const validation = await validateAsync<ResetPasswordRequest>(resetPasswordSchema, req.body);
    if (!validation.isValid) {
      throw validationError(validation.errors);
    }

    const validData = validation.data as ResetPasswordRequest;
    await authService.resetPassword(validData.token, validData.newPassword);

    logger.info("Password reset response sent");

    return sendSuccessResponse(res, undefined, "Password reset successfully");
  }
}

export const authController = new AuthController();
