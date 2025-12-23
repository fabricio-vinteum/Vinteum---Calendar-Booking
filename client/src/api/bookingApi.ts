/**
 * Booking API Client
 * Handles communication with the booking service
 */

export interface CreateBookingRequest {
  email: string;
  firstname: string;
  date: string; // ISO 8601 timestamp
  timezone: string;
  topic: string;
  duration: number; // Duration in minutes
}

export interface CreateBookingResponse {
  success: boolean;
  contactId?: string;
  meetingId?: string;
  joinUrl?: string;
  startUrl?: string;
  dealId?: string;
  error?: string;
}

const API_BASE_URL = 'http://localhost:3000';

/**
 * Create a new booking
 */
export async function createBooking(
  request: CreateBookingRequest
): Promise<CreateBookingResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create booking',
    };
  }
}
