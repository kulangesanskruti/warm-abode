import path from "node:path";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import "express-async-errors";

import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";
import { rateLimiter } from "./middlewares/rateLimiter";
import { requestValidation } from "./middlewares/requestValidation";
import { config } from "./config/env";
import healthRoutes from "./routes/health";
import authRoutes from "./routes/auth";
import propertyRoutes from "./routes/properties";
import roomRoutes from "./routes/rooms";
import tenantRoutes from "./routes/tenants";
import paymentRoutes from "./routes/payments";
import reportRoutes from "./routes/reports";
import whatsappRoutes from "./routes/whatsapp";
import notificationRoutes from "./routes/notifications";
import jobRoutes from "./routes/jobs";
import fileRoutes from "./routes/files";

const app: Express = express();

// ============================================
// Trust proxy (important for production)
// ============================================
app.set("trust proxy", 1);

// ============================================
// Security Middleware
// ============================================
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.CORS_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    maxAge: 86400,
  }),
);

// ============================================
// Body Parser & Request Parsing
// ============================================
app.use(express.json({ limit: config.REQUEST_BODY_LIMIT }));
app.use(
  express.urlencoded({ limit: config.REQUEST_BODY_LIMIT, extended: true, parameterLimit: 100 }),
);
app.use(cookieParser());
app.use(compression());

// ============================================
// Static file serving for locally stored uploads (profile photos, documents).
// Mounted under /api/v1 so the frontend dev proxy forwards it, and before the
// API rate limiter so image loads never consume the request budget.
// ============================================
const uploadsRoot = path.resolve(process.env.FILE_STORAGE_PATH || "./storage/files");
const staticOptions = { fallthrough: false, maxAge: "7d", index: false } as const;
app.use("/api/v1/uploads", express.static(uploadsRoot, staticOptions));
// Backwards compatibility with URLs stored before the /api/v1 prefix existed.
app.use("/files", express.static(uploadsRoot, staticOptions));

// ============================================
// Logging
// ============================================
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));
app.use(requestLogger);

// ============================================
// Rate Limiting
// ============================================
app.use("/api/", rateLimiter);

// ============================================
// Request Validation Middleware (global)
// ============================================
app.use(requestValidation);

// ============================================
// API Routes
// ============================================
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/properties", propertyRoutes);
app.use("/api/v1/rooms", roomRoutes);
app.use("/api/v1/tenants", tenantRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/whatsapp", whatsappRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/files", fileRoutes);

// ============================================
// Default Routes
// ============================================
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "StayHub Backend API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    documentation: "/api/v1/docs",
  });
});

// ============================================
// 404 Handler
// ============================================
app.use(notFoundHandler);

// ============================================
// Global Error Handler (must be last)
// ============================================
app.use(errorHandler);

export default app;
