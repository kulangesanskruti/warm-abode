import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
}

const formatLogEntry = (level: LogLevel, message: string, data?: any): LogEntry => {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };
};

const serializeData = (data: unknown): string => {
  if (data instanceof Error) {
    return JSON.stringify({
      name: data.name,
      message: data.message,
      stack: data.stack,
      ...Object.fromEntries(Object.entries(data as unknown as Record<string, unknown>)),
    });
  }
  try {
    return JSON.stringify(data, (_key, value) =>
      value instanceof Error
        ? { name: value.name, message: value.message, stack: value.stack }
        : value,
    );
  } catch {
    return String(data);
  }
};

const formatLogMessage = (entry: LogEntry): string => {
  const { timestamp, level, message, data } = entry;
  const dataStr = data ? ` ${serializeData(data)}` : "";
  return `[${timestamp}] [${level}] ${message}${dataStr}`;
};

const writeToFile = (entry: LogEntry) => {
  const filename = path.join(LOG_DIR, `${new Date().toISOString().split("T")[0]}.log`);
  const logMessage = formatLogMessage(entry) + "\n";
  fs.appendFileSync(filename, logMessage, "utf-8");
};

const log = (level: LogLevel, message: string, data?: any) => {
  const entry = formatLogEntry(level, message, data);
  const formattedMessage = formatLogMessage(entry);

  // Console output
  switch (level) {
    case LogLevel.ERROR:
      console.error(formattedMessage);
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage);
      break;
    case LogLevel.INFO:
      console.info(formattedMessage);
      break;
    case LogLevel.DEBUG:
      if (process.env.NODE_ENV === "development") {
        console.debug(formattedMessage);
      }
      break;
  }

  // File output (for production)
  if (process.env.NODE_ENV === "production" || level === LogLevel.ERROR) {
    writeToFile(entry);
  }
};

export const logger = {
  error: (message: string, data?: any) => log(LogLevel.ERROR, message, data),
  warn: (message: string, data?: any) => log(LogLevel.WARN, message, data),
  info: (message: string, data?: any) => log(LogLevel.INFO, message, data),
  debug: (message: string, data?: any) => log(LogLevel.DEBUG, message, data),
};
