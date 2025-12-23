import axios from 'axios';
import { MOCK_MODE, ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } from '../config/zoom';
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

export interface ZoomMeeting {
  id: string;
  topic: string;
  start_time: string; // ISO 8601 timestamp
  duration: number; // Duration in minutes
  timezone: string;
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
  // Generate slots from 7am-6pm GMT-5 (converts to 9am-8pm São Paulo GMT-3)
  const slots: string[] = [];
  // Hardcode to GMT-5 as requested
  // Format: YYYY-MM-DDTHH:mm:00-05:00

  const pad = (n: number) => n.toString().padStart(2, '0');

  for (let hour = 7; hour <= 18; hour++) {
    // Generate slots only at the top of each hour for 60-minute meetings
    const slotIso = `${date}T${pad(hour)}:00:00-05:00`;
    slots.push(slotIso);
  }

  return slots;
}

/**
 * Create a Zoom meeting
 * @param params - Meeting parameters
 * @returns Meeting details with join URL
 */
// Token caching
let cachedAccessToken: string | null = null;
let tokenExpiryTime: number = 0;

/**
 * Get Zoom Server-to-Server OAuth Access Token
 */
async function getZoomAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiryTime) {
    return cachedAccessToken;
  }

  try {
    const authHeader = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');

    const response = await axios.post(
      'https://zoom.us/oauth/token',
      null,
      {
        params: {
          grant_type: 'account_credentials',
          account_id: ZOOM_ACCOUNT_ID,
        },
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, expires_in } = response.data;

    cachedAccessToken = access_token;
    // Set expiry to 5 minutes before actual expiry to be safe
    tokenExpiryTime = Date.now() + (expires_in - 300) * 1000;

    return access_token;
  } catch (error: any) {
    console.error('Zoom OAuth Error:', error.response?.data || error.message);
    throw new ZoomError(
      'Failed to authenticate with Zoom',
      'AUTH_ERROR',
      error.response?.status,
      error.response?.data
    );
  }
}

export async function createMeeting(params: {
  date: string; // ISO 8601 timestamp
  topic: string;
  duration: number; // Duration in minutes
  timezone?: string;
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

  try {
    const accessToken = await getZoomAccessToken();

    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic: params.topic,
        type: 2, // Scheduled meeting
        start_time: params.date, // ISO 8601 is accepted by Zoom
        duration: params.duration,
        timezone: params.timezone || 'UTC',
        settings: {
          join_before_host: true,
          waiting_room: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      meetingId: response.data.id.toString(),
      joinUrl: response.data.join_url,
      startUrl: response.data.start_url,
    };
  } catch (error: any) {
    console.error('Zoom Create Meeting Error:', error.response?.data || error.message);
    throw new ZoomError(
      `Failed to create Zoom meeting: ${error.message}`,
      'NETWORK_ERROR',
      error.response?.status,
      error.response?.data
    );
  }
}

/**
 * Get scheduled meetings for a date range
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of scheduled meetings
 */
export async function getScheduledMeetings(
  startDate: string,
  endDate: string
): Promise<ZoomMeeting[]> {
  if (MOCK_MODE) {
    console.log(`[Zoom Mock] Fetching scheduled meetings from ${startDate} to ${endDate}`);
    // Return empty array in mock mode - no conflicts
    return [];
  }

  try {
    const accessToken = await getZoomAccessToken();

    const response = await axios.get(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        params: {
          type: 'scheduled',
          page_size: 300, // Max allowed
          from: startDate,
          to: endDate,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const meetings: ZoomMeeting[] = response.data.meetings || [];
    console.log(`[Zoom] Found ${meetings.length} scheduled meetings`);

    return meetings;
  } catch (error: any) {
    console.error('Zoom List Meetings Error:', error.response?.data || error.message);
    // Return empty array on error to avoid blocking all slots
    console.warn('[Zoom] Returning empty meetings list due to error');
    return [];
  }
}

