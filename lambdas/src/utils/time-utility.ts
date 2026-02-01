/**
 * Time utility functions for handling Eastern Standard Time conversions
 * Ported from backend/Utilities/TimeUtility.cs
 */

/**
 * Gets the current date/time in Eastern Standard Time
 */
export function getNowEasternStandardTime(): Date {
  // Get current UTC time
  const now = new Date();
  
  // Convert to Eastern time
  const eastern = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  
  return eastern;
}

/**
 * Gets today's date in Eastern Standard Time as a string (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  const eastern = getNowEasternStandardTime();
  return formatDateString(eastern);
}

/**
 * Formats a date as YYYY-MM-DD
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a date string (YYYY-MM-DD or MM/DD/YYYY) into a Date object
 * Returns null if parsing fails
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  // Try YYYY-MM-DD format
  const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try MM/DD/YYYY format
  const usMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try native Date parsing as fallback
  const fallback = new Date(dateString);
  if (!isNaN(fallback.getTime())) {
    return fallback;
  }
  
  return null;
}

/**
 * Checks if a string is a valid date
 */
export function isValidDate(dateString: string): boolean {
  return parseDate(dateString) !== null;
}

/**
 * Gets the date from N days ago
 */
export function getDateDaysAgo(days: number): Date {
  const now = getNowEasternStandardTime();
  now.setDate(now.getDate() - days);
  return now;
}

/**
 * Gets a date range for the last N days (not including today)
 */
export function getLastNDaysRange(days: number): { start: string; end: string } {
  const today = getNowEasternStandardTime();
  const start = new Date(today);
  start.setDate(start.getDate() - days);
  
  const end = new Date(today);
  end.setDate(end.getDate() - 1);
  
  return {
    start: formatDateString(start),
    end: formatDateString(end),
  };
}

/**
 * Parses a time string (HH:MM:SS or HH:MM:SS.mmm) to milliseconds
 */
export function parseTimeToMs(timeString: string): number | null {
  if (!timeString) return null;
  
  const match = timeString.match(/^(\d+):(\d{2}):(\d{2})(?:\.(\d+))?$/);
  if (!match) return null;
  
  const [, hours, minutes, seconds, ms] = match;
  const totalMs = 
    parseInt(hours) * 60 * 60 * 1000 +
    parseInt(minutes) * 60 * 1000 +
    parseInt(seconds) * 1000 +
    (ms ? parseInt(ms.padEnd(3, '0').substring(0, 3)) : 0);
  
  return totalMs;
}

/**
 * Formats milliseconds to a time string (HH:MM:SS)
 */
export function formatMsToTime(ms: number): string {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
