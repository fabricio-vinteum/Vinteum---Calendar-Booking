import type { BookingContext } from '../types/booking';

/**
 * Parses booking context from URL query parameters
 * @returns BookingContext if both name and email are present, null otherwise
 */
export function parseBookingContext(): BookingContext | null {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name');
  const email = params.get('email');

  if (!name || !email) {
    return null;
  }

  return { name, email };
}
