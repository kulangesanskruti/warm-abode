import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/jwt";
import { ApiError, HttpStatusCode } from "../utils/errors";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      token?: string;
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header or cookies
    let token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new ApiError("No authentication token provided", HttpStatusCode.UNAUTHORIZED);
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = decoded.payload;
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }

    next(new ApiError("Authentication failed", HttpStatusCode.UNAUTHORIZED));
  }
};

export const authorize = (requiredRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError("No authentication token provided", HttpStatusCode.UNAUTHORIZED));
    }

    if (!requiredRoles.includes(req.user.role || "")) {
      return next(new ApiError("Insufficient permissions", HttpStatusCode.FORBIDDEN));
    }

    next();
  };
};

export const optional = (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded.payload;
      req.token = token;
    }
  } catch (error) {
    // Silently ignore auth errors for optional auth
  }

  next();
};
