import "dotenv/config";

const nodeEnv = process.env.NODE_ENV || "development";
const isProductionEnvironment = nodeEnv === "production";

// ============================================
// Startup Validation
// ============================================
const missingVars: string[] = [];
const insecureVars: string[] = [];

const requiredInProduction = (name: string, fallback?: string) => {
  const value = process.env[name] || fallback;
  if (isProductionEnvironment && !value) {
    missingVars.push(name);
  }
  return value;
};

// Validate critical variables
const dbUrl = isProductionEnvironment
  ? requiredInProduction("DATABASE_URL")
  : process.env.DATABASE_URL;

const jwtSecret = isProductionEnvironment
  ? requiredInProduction("JWT_SECRET")
  : process.env.JWT_SECRET;

if (!dbUrl) {
  missingVars.push("DATABASE_URL");
}
if (!jwtSecret) {
  missingVars.push("JWT_SECRET");
}

// SECURITY: reject weak/placeholder signing keys outright. There is no
// fallback secret in any environment — a short or well-known key is treated
// as a missing key so the process refuses to start.
const INSECURE_JWT_SECRETS = new Set([
  "your-secret-key-change-in-production",
  "secret",
  "changeme",
  "jwt-secret",
]);
if (jwtSecret && INSECURE_JWT_SECRETS.has(jwtSecret)) {
  insecureVars.push("JWT_SECRET must not use a well-known placeholder value");
}
if (jwtSecret && jwtSecret.length < 32) {
  insecureVars.push("JWT_SECRET must be at least 32 characters long");
}
if (!process.env.PORT) {
  missingVars.push("PORT");
}

if (insecureVars.length > 0) {
  console.error("\n========================================");
  console.error("  INSECURE CONFIGURATION");
  console.error("========================================");
  insecureVars.forEach((v) => console.error(`    - ${v}`));
  console.error("  Generate one with: openssl rand -hex 32");
  console.error("========================================\n");
  process.exit(1);
}

if (missingVars.length > 0) {
  console.error("\n========================================");
  console.error("  STARTUP VALIDATION FAILED");
  console.error("========================================");
  console.error("  Missing required environment variables:");
  missingVars.forEach((v) => console.error(`    - ${v}`));
  console.error("");
  console.error("  Copy backend/.env.example to backend/.env");
  console.error("  and fill in the required values.");
  console.error("========================================\n");
  process.exit(1);
}

export const config = {
  // Server
  NODE_ENV: nodeEnv,
  PORT: Number.parseInt(process.env.PORT || "5000", 10),
  HOST: process.env.HOST || "0.0.0.0",
  SHUTDOWN_TIMEOUT_MS: Number.parseInt(process.env.SHUTDOWN_TIMEOUT_MS || "30000", 10),
  REQUEST_BODY_LIMIT: process.env.REQUEST_BODY_LIMIT || "2mb",

  // Database
  DATABASE_URL: dbUrl as string,

  // JWT
  JWT_SECRET: jwtSecret as string,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "7d",

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  CORS_ORIGINS: (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  RATE_LIMIT_MAX_REQUESTS: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),

  // Email (future)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM || "noreply@stayhub.com",

  // Cloudinary (future)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // WhatsApp API (future)
  WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,

  // Redis (future)
  REDIS_URL: process.env.REDIS_URL,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",

  // API Documentation
  SWAGGER_ENABLED: process.env.SWAGGER_ENABLED !== "false",
};

export const isDevelopment = config.NODE_ENV === "development";
export const isProduction = config.NODE_ENV === "production";
export const isTest = config.NODE_ENV === "test";
