import { getPrismaClient } from "../utils/prisma";
import { logger } from "../utils/logger";

// Type definitions
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: "OWNER" | "MANAGER" | "ACCOUNTANT";
  profilePhoto: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "OWNER" | "MANAGER" | "ACCOUNTANT";

const SAFE_USER_SELECT = {
  id: true,
  email: true,
  phone: true,
  fullName: true,
  role: true,
  profilePhoto: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type SafeUser = Pick<User, keyof typeof SAFE_USER_SELECT & keyof User>;

export class UserRepository {
  /**
   * Create a new user
   */
  async create(data: {
    fullName: string;
    email: string;
    phone: string;
    passwordHash: string;
    role: UserRole;
  }): Promise<User> {
    try {
      const prismaClient = getPrismaClient();
      const user = await prismaClient.user.create({
        data,
      });
      logger.info("User created successfully", { userId: user.id, email: user.email });
      return user;
    } catch (error) {
      logger.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<SafeUser | null> {
    try {
      const prismaClient = getPrismaClient();
      return await prismaClient.user.findUnique({
        where: { email },
        select: SAFE_USER_SELECT,
      });
    } catch (error) {
      logger.error("Error finding user by email:", error);
      throw error;
    }
  }

  /**
   * Find user by phone
   */
  async findByPhone(phone: string): Promise<SafeUser | null> {
    try {
      const prismaClient = getPrismaClient();
      return await prismaClient.user.findUnique({
        where: { phone },
        select: SAFE_USER_SELECT,
      });
    } catch (error) {
      logger.error("Error finding user by phone:", error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<SafeUser | null> {
    try {
      const prismaClient = getPrismaClient();
      return await prismaClient.user.findUnique({
        where: { id },
        select: SAFE_USER_SELECT,
      });
    } catch (error) {
      logger.error("Error finding user by ID:", error);
      throw error;
    }
  }

  /**
   * SECURITY: the ONLY two accessors that return `passwordHash`.
   * Restricted to credential verification in authService (login, change
   * password). Never use these to build an API response.
   */
  async findByEmailWithCredentials(email: string): Promise<User | null> {
    try {
      const prismaClient = getPrismaClient();
      return await prismaClient.user.findUnique({ where: { email } });
    } catch (error) {
      logger.error("Error finding user credentials by email:", error);
      throw error;
    }
  }

  async findByIdWithCredentials(id: string): Promise<User | null> {
    try {
      const prismaClient = getPrismaClient();
      return await prismaClient.user.findUnique({ where: { id } });
    } catch (error) {
      logger.error("Error finding user credentials by ID:", error);
      throw error;
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
  ): Promise<User> {
    try {
      const prismaClient = getPrismaClient();
      const user = await prismaClient.user.update({
        where: { id: userId },
        data,
      });
      logger.info("User profile updated", { userId });
      return user;
    } catch (error) {
      logger.error("Error updating user profile:", error);
      throw error;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, passwordHash: string): Promise<User> {
    try {
      const prismaClient = getPrismaClient();
      const user = await prismaClient.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
      logger.info("User password updated", { userId });
      return user;
    } catch (error) {
      logger.error("Error updating user password:", error);
      throw error;
    }
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<User> {
    try {
      const prismaClient = getPrismaClient();
      const user = await prismaClient.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });
      logger.info("User email verified", { userId });
      return user;
    } catch (error) {
      logger.error("Error verifying user email:", error);
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const prismaClient = getPrismaClient();
      const user = await prismaClient.user.findUnique({
        where: { email },
      });
      return !!user;
    } catch (error) {
      logger.error("Error checking email existence:", error);
      throw error;
    }
  }

  /**
   * Check if phone exists
   */
  async phoneExists(phone: string): Promise<boolean> {
    try {
      const prismaClient = getPrismaClient();
      const user = await prismaClient.user.findUnique({
        where: { phone },
      });
      return !!user;
    } catch (error) {
      logger.error("Error checking phone existence:", error);
      throw error;
    }
  }

  /**
   * Get user by ID without password
   */
  async findByIdSafe(id: string): Promise<Omit<User, "passwordHash"> | null> {
    try {
      const prismaClient = getPrismaClient();
      const user = await prismaClient.user.findUnique({
        where: { id },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          profilePhoto: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return user;
    } catch (error) {
      logger.error("Error finding user by ID (safe):", error);
      throw error;
    }
  }
}

export const userRepository = new UserRepository();
