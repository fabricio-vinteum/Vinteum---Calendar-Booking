/**
 * API client for fetching availability data
 */

export interface AvailabilityResponse {
  slots: string[];
}

export interface AvailabilityError {
  error: string;
  details?: string;
}

/**
 * Fetch available time slots for a given date and timezone
 * @param date - Date in YYYY-MM-DD format
 * @param timezone - IANA timezone string
 * @returns Object with slots array or error message
 */
export async function fetchAvailability(
  date: string,
  timezone: string
): Promise<{ slots: string[]; error?: string }> {
  try {
    const params = new URLSearchParams({ date, timezone });
    const response = await fetch(`http://localhost:3000/api/availability?${params}`);

    if (!response.ok) {
      const errorData: AvailabilityError = await response.json();
      return { slots: [], error: errorData.error || 'Failed to fetch availability' };
    }

    const data: AvailabilityResponse = await response.json();
    return { slots: data.slots };
  } catch (error) {
    console.error('Error fetching availability:', error);
    return { slots: [], error: 'Network error. Please try again.' };
  }
}
