/**
 * Detects the user's timezone using the browser's Intl API
 * @returns Timezone string (e.g., "America/New_York")
 */
export function detectTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
