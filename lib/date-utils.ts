/**
 * Single source of truth for Indian Standard Time (IST, UTC+05:30) business date and time formatting.
 * Never rely on server/system local timezone or UTC toISOString().
 */

const IST_TIMEZONE = 'Asia/Kolkata';

// Formats date as YYYY-MM-DD in Asia/Kolkata timezone
const istDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: IST_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// Formats time with AM/PM in Asia/Kolkata timezone
const istTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: IST_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

// Formats full readable date (e.g., "16 September 2026")
const istLongDateFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: IST_TIMEZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/**
 * Returns YYYY-MM-DD for the Indian calendar day.
 * Handles UTC vs IST boundary correctly:
 * 00:30 IST is the new Indian date, even though UTC is still yesterday.
 */
export function getIndianBusinessDate(date: Date = new Date()): string {
  return istDateFormatter.format(date);
}

/**
 * Returns formatted time string in IST, e.g., "02:30 PM IST"
 */
export function formatIndianTime(date: Date = new Date()): string {
  return `${istTimeFormatter.format(date)} IST`;
}

/**
 * Returns formatted long date string, e.g., "16 September 2026"
 */
export function formatIndianLongDate(date: Date = new Date()): string {
  return istLongDateFormatter.format(date);
}

/**
 * Named constant for when financial rate data is considered stale.
 * Live feeds should update every 15-60 minutes during market hours.
 */
export const STALE_THRESHOLD_MINUTES = 60;

/**
 * Checks if a given timestamp ISO string or Date is older than thresholdMinutes.
 */
export function isTimestampStale(
  timestamp: string | Date | undefined | null,
  thresholdOrReferenceDate?: number | Date,
  referenceNow: Date = new Date()
): boolean {
  if (!timestamp) return true;
  let thresholdMinutes = STALE_THRESHOLD_MINUTES;
  let now = referenceNow;

  if (typeof thresholdOrReferenceDate === 'number') {
    thresholdMinutes = thresholdOrReferenceDate;
  } else if (thresholdOrReferenceDate instanceof Date) {
    now = thresholdOrReferenceDate;
  }

  try {
    const timeMs = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp.getTime();
    if (isNaN(timeMs)) return true;
    const diffMinutes = (now.getTime() - timeMs) / (1000 * 60);
    return diffMinutes > thresholdMinutes;
  } catch {
    return true;
  }
}
