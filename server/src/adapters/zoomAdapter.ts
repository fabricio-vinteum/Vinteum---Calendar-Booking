import { MOCK_MODE } from '../config/zoom';
import { ZoomError } from '../errors/ZoomError';

/**
 * Mock Zoom adapter for availability and meeting creation
 * TODO: Replace with real Zoom API integration
 */

export interface AvailabilitySlot {
  start: string; // ISO 8601 timestamp
}

export interface ZoomMeetingResponse {
  meetingId: string;
  joinUrl: string;
  startUrl: string;
}

/**
 * Get available time slots for a given date
 * @param date - Date in YYYY-MM-DD format
 * @param timezone - IANA timezone string
 * @returns Array of available slot timestamps
 */
export async function getAvailableSlots(
  date: string,
  timezone: string
): Promise<string[]> {
  // Mock implementation: Generate 9am-8pm slots in 30min intervals
  const slots: string[] = [];
  const baseDate = new Date(`${date}T00:00:00`);

  for (let hour = 9; hour <= 20; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 20 && minute === 30) break; // Stop at 8pm

      const slotDate = new Date(baseDate);
      slotDate.setHours(hour, minute, 0, 0);
      slots.push(slotDate.toISOString());
    }
  }

  // Randomly exclude some slots to simulate busy times
  const availableSlots = slots.filter(() => Math.random() > 0.3);

  return availableSlots;
}

/**
 * Create a Zoom meeting
 * @param params - Meeting parameters
 * @returns Meeting details with join URL
 */
export async function createMeeting(params: {
  date: string; // ISO 8601 timestamp
  topic: string;
  duration: number; // Duration in minutes
}): Promise<ZoomMeetingResponse> {
  if (MOCK_MODE) {
    // Mock implementation
    const mockMeetingId = `mock-meeting-${Date.now()}`;
    const mockJoinUrl = `https://zoom.us/j/${mockMeetingId}`;
    const mockStartUrl = `https://zoom.us/s/${mockMeetingId}?zak=mock-token`;

    console.log(`[Zoom Mock] Created meeting: ${params.topic} at ${params.date}`);
    console.log(`[Zoom Mock] Duration: ${params.duration} minutes`);
    console.log(`[Zoom Mock] Join URL: ${mockJoinUrl}`);

    return {
      meetingId: mockMeetingId,
      joinUrl: mockJoinUrl,
      startUrl: mockStartUrl,
    };
  }

  // Real Zoom API implementation would go here
  // This would involve:
  // 1. Getting OAuth access token
  // 2. Making POST request to /users/{userId}/meetings
  // 3. Parsing response

  throw new ZoomError(
    'Real Zoom API not implemented. Set ZOOM_MOCK_MODE=true to use mock mode.',
    'AUTH_ERROR'
  );
}
