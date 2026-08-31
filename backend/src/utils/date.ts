/**
 * Date and Time Utilities
 * Helper functions for date manipulation and formatting
 */

export const getCurrentDate = (): Date => {
  return new Date();
};

export const getCurrentTimestamp = (): number => {
  return Date.now();
};

export const getCurrentISOString = (): string => {
  return new Date().toISOString();
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addHours = (date: Date, hours: number): Date => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
};

export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60 * 1000);
};

export const addSeconds = (date: Date, seconds: number): Date => {
  return new Date(date.getTime() + seconds * 1000);
};

export const getStartOfDay = (date: Date = new Date()): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const getEndOfDay = (date: Date = new Date()): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const getStartOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getEndOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

export const getDaysBetween = (start: Date, end: Date): number => {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
};

export const isDateInPast = (date: Date): boolean => {
  return date.getTime() < Date.now();
};

export const isDateInFuture = (date: Date): boolean => {
  return date.getTime() > Date.now();
};

export const isToday = (date: Date): boolean => {
  const today = getStartOfDay();
  const checkDate = getStartOfDay(date);
  return today.getTime() === checkDate.getTime();
};

export const formatDate = (date: Date, format: string = "YYYY-MM-DD"): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
};

export const parseDate = (dateString: string): Date | null => {
  try {
    return new Date(dateString);
  } catch {
    return null;
  }
};

/**
 * Computes a tenant's rent due date for a given billing month/year.
 *
 * The due day is the tenant's move-in-day anniversary (e.g. moved in on the
 * 12th -> rent is due on the 12th of every month). If that day doesn't
 * exist in the target month (e.g. moved in on the 31st, billing month is
 * February), it's clamped to the last day of that month so every tenant
 * always has a single, unambiguous due date.
 */
export const computeRentDueDate = (moveInDate: Date, month: number, year: number): Date => {
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const day = Math.min(moveInDate.getDate(), lastDayOfMonth);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
};
