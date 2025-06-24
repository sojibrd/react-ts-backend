// Example: Helper function to format dates
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Example: Helper to get the current timestamp
export function getCurrentTimestamp(): number {
  return Date.now();
}

// Example: Helper to add days to a date
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Example: Helper to check if a date is in the past
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

// Example: Helper to get the difference in days between two dates
export function diffInDays(date1: Date, date2: Date): number {
  const diff = Math.abs(date1.getTime() - date2.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Example: Helper to format a date as YYYY-MM-DD HH:mm:ss
export function formatDateTime(date: Date): string {
  return date.toISOString().replace("T", " ").substring(0, 19);
}
