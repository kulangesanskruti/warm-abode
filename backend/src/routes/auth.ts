import { Router } from "express";
import { authController } from "../controllers/authController";
import { authenticate } from "../middlewares/auth";
import { authRateLimiter } from "../middlewares/rateLimiter";
import { asyncHandler } from "../utils/errors";

const router = Router();

/**
 * @route POST /api/v1/auth/register
 * @description Register a new user
 * @access Public
 * @body {fullName, email, phone, password, role?}
 * @returns {user, accessToken}
 */
router.post(
  "/register",
  authRateLimiter,
  asyncHandler((req, res) => authController.register(req, res)),
);

/**
 * @route POST /api/v1/auth/login
 * @description Login user with email and password
 * @access Public
 * @body {email, password}
 * @returns {user, accessToken}
 */
router.post(
  "/login",
  authRateLimiter,
  asyncHandler((req, res) => authController.login(req, res)),
);

/**
 * @route POST /api/v1/auth/logout
 * @description Logout user
 * @access Protected
 * @returns {success message}
 */
router.post(
  "/logout",
  authenticate,
  asyncHandler((req, res) => authController.logout(req, res)),
);

/**
 * @route POST /api/v1/auth/refresh
 * @description Refresh access token using refresh token
 * @access Public
 * @body {refreshToken?} or from cookie
 * @returns {accessToken}
 */
router.post(
  "/refresh",
  asyncHandler((req, res) => authController.refreshToken(req, res)),
);

/**
 * @route GET /api/v1/auth/me
 * @description Get current authenticated user
 * @access Protected
 * @returns {user}
 */
router.get(
  "/me",
  authenticate,
  asyncHandler((req, res) => authController.getCurrentUser(req, res)),
);

/**
 * @route PUT /api/v1/auth/profile
 * @description Update user profile
 * @access Protected
 * @body {fullName?, phone?, profilePhoto?}
 * @returns {user}
 */
router.put(
  "/profile",
  authenticate,
  asyncHandler((req, res) => authController.updateProfile(req, res)),
);

/**
 * @route PUT /api/v1/auth/change-password
 * @description Change user password
 * @access Protected
 * @body {oldPassword, newPassword, confirmPassword}
 * @returns {success message}
 */
router.put(
  "/change-password",
  authenticate,
  asyncHandler((req, res) => authController.changePassword(req, res)),
);

/**
 * @route POST /api/v1/auth/forgot-password
 * @description Request password reset email
 * @access Public
 * @body {email}
 * @returns {success message}
 */
router.post(
  "/forgot-password",
  authRateLimiter,
  asyncHandler((req, res) => authController.forgotPassword(req, res)),
);

/**
 * @route POST /api/v1/auth/reset-password
 * @description Reset password with token
 * @access Public
 * @body {token, newPassword, confirmPassword}
 * @returns {success message}
 */
router.post(
  "/reset-password",
  authRateLimiter,
  asyncHandler((req, res) => authController.resetPassword(req, res)),
);

export default router;
