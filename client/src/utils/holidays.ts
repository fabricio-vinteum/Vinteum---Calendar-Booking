/**
 * USA Federal Holidays utility
 * Identifies major US federal holidays
 */

export interface Holiday {
  name: string;
  date: Date;
}

/**
 * Get all USA federal holidays for a given year
 */
export function getUSHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];

  // New Year's Day - January 1
  holidays.push({
    name: "New Year's Day",
    date: new Date(year, 0, 1),
  });

  // Martin Luther King Jr. Day - Third Monday in January
  holidays.push({
    name: "Martin Luther King Jr. Day",
    date: getNthWeekdayOfMonth(year, 0, 1, 3),
  });

  // Presidents' Day - Third Monday in February
  holidays.push({
    name: "Presidents' Day",
    date: getNthWeekdayOfMonth(year, 1, 1, 3),
  });

  // Memorial Day - Last Monday in May
  holidays.push({
    name: "Memorial Day",
    date: getLastWeekdayOfMonth(year, 4, 1),
  });

  // Independence Day - July 4
  holidays.push({
    name: "Independence Day",
    date: new Date(year, 6, 4),
  });

  // Labor Day - First Monday in September
  holidays.push({
    name: "Labor Day",
    date: getNthWeekdayOfMonth(year, 8, 1, 1),
  });

  // Columbus Day - Second Monday in October
  holidays.push({
    name: "Columbus Day",
    date: getNthWeekdayOfMonth(year, 9, 1, 2),
  });

  // Veterans Day - November 11
  holidays.push({
    name: "Veterans Day",
    date: new Date(year, 10, 11),
  });

  // Thanksgiving - Fourth Thursday in November
  holidays.push({
    name: "Thanksgiving",
    date: getNthWeekdayOfMonth(year, 10, 4, 4),
  });

  // Christmas - December 25
  holidays.push({
    name: "Christmas",
    date: new Date(year, 11, 25),
  });

  return holidays;
}

/**
 * Check if a date is a USA federal holiday
 */
export function isUSHoliday(date: Date): { isHoliday: boolean; name?: string } {
  const year = date.getFullYear();
  const holidays = getUSHolidays(year);

  for (const holiday of holidays) {
    if (
      holiday.date.getFullYear() === date.getFullYear() &&
      holiday.date.getMonth() === date.getMonth() &&
      holiday.date.getDate() === date.getDate()
    ) {
      return { isHoliday: true, name: holiday.name };
    }
  }

  return { isHoliday: false };
}

/**
 * Get the Nth occurrence of a weekday in a month
 * @param year - Year
 * @param month - Month (0-11)
 * @param weekday - Day of week (0=Sunday, 1=Monday, etc.)
 * @param n - Which occurrence (1=first, 2=second, etc.)
 */
function getNthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  n: number
): Date {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  
  let daysToAdd = weekday - firstWeekday;
  if (daysToAdd < 0) daysToAdd += 7;
  
  const targetDate = 1 + daysToAdd + (n - 1) * 7;
  return new Date(year, month, targetDate);
}

/**
 * Get the last occurrence of a weekday in a month
 */
function getLastWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number
): Date {
  const lastDay = new Date(year, month + 1, 0);
  const lastWeekday = lastDay.getDay();
  
  let daysToSubtract = lastWeekday - weekday;
  if (daysToSubtract < 0) daysToSubtract += 7;
  
  return new Date(year, month, lastDay.getDate() - daysToSubtract);
}
