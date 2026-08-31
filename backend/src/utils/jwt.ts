import jwt, { SignOptions } from "jsonwebtoken";
import { logger } from "./logger";
import { ApiError, HttpStatusCode } from "./errors";
import { config } from "../config/env";

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  propertyId?: string;
  iat?: number;
  exp?: number;
}

export interface DecodedToken {
  payload: TokenPayload;
  iat: number;
  exp: number;
}

const JWT_SECRET = config.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = config.ACCESS_TOKEN_EXPIRY;
const REFRESH_TOKEN_EXPIRY = config.REFRESH_TOKEN_EXPIRY;

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: "HS256",
  } as SignOptions;

  try {
    return jwt.sign(payload, JWT_SECRET, options);
  } catch (error) {
    logger.error("Error generating access token:", error);
    throw new ApiError("Failed to generate access token", HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: "HS256",
  } as SignOptions;

  try {
    return jwt.sign(payload, JWT_SECRET, options);
  } catch (error) {
    logger.error("Error generating refresh token:", error);
    throw new ApiError("Failed to generate refresh token", HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
};

export const verifyToken = (token: string): DecodedToken => {
  try {
    // SECURITY: pin the algorithm allow-list so a token declaring a different
    // `alg` (e.g. "none" or an RS/HS confusion attempt) can never validate.
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as TokenPayload & { iat: number; exp: number };

    return {
      payload: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError("Token has expired", HttpStatusCode.UNAUTHORIZED);
    }

    if (error.name === "JsonWebTokenError") {
      throw new ApiError("Invalid token", HttpStatusCode.UNAUTHORIZED);
    }

    throw new ApiError("Token verification failed", HttpStatusCode.UNAUTHORIZED);
  }
};

export const generateTokenPair = (
  payload: TokenPayload,
): { accessToken: string; refreshToken: string } => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const decodeTokenWithoutVerification = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded;
  } catch (error) {
    logger.debug("Error decoding token without verification:", error);
    return null;
  }
};
