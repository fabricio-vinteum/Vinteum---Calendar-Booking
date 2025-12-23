/**
 * Generates an array of the next 14 days starting from today
 */
export function getNext14Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }

  return days;
}

/**
 * Checks if a given date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Formats a date for display in the date strip
 * @returns Formatted string like "Mon, Jan 15"
 */
export function formatDateForDisplay(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Checks if two dates represent the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
