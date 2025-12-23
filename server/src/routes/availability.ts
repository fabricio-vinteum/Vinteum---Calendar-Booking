import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getAvailableSlots, getScheduledMeetings, ZoomMeeting } from '../adapters/zoomAdapter';

const router = Router();

/**
 * Check if a slot conflicts with any existing meetings
 * @param slotStart - Slot start time
 * @param slotDuration - Slot duration in minutes
 * @param meetings - Array of scheduled meetings
 * @returns true if there's a conflict, false otherwise
 */
function hasConflict(
  slotStart: Date,
  slotDuration: number,
  meetings: ZoomMeeting[]
): boolean {
  const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

  for (const meeting of meetings) {
    const meetingStart = new Date(meeting.start_time);
    const meetingEnd = new Date(meetingStart.getTime() + meeting.duration * 60000);

    // Check if slot overlaps with meeting
    // Overlap occurs if: slotStart < meetingEnd AND slotEnd > meetingStart
    if (slotStart < meetingEnd && slotEnd > meetingStart) {
      console.log(`[Availability] Slot ${slotStart.toISOString()} conflicts with meeting: ${meeting.topic}`);
      return true;
    }
  }

  return false;
}

/**
 * Filter slots to only include those without conflicts
 * @param slots - Array of ISO timestamp strings
 * @param date - Date in YYYY-MM-DD format
 * @returns Filtered array of available slots
 */
async function filterAvailableSlots(slots: string[], date: string): Promise<string[]> {
  const availableSlots: string[] = [];
  const now = new Date();

  // Fetch all scheduled meetings for the day
  const meetings = await getScheduledMeetings(date, date);
  console.log(`[Availability] Checking ${slots.length} slots against ${meetings.length} scheduled meetings`);

  for (const slot of slots) {
    const slotTime = new Date(slot);

    // Skip past slots
    if (slotTime < now) {
      continue;
    }

    // Check for conflicts with existing meetings (60 min duration)
    if (!hasConflict(slotTime, 60, meetings)) {
      availableSlots.push(slot);
    }
  }

  console.log(`[Availability] ${availableSlots.length} of ${slots.length} slots are available`);
  return availableSlots;
}

// Validation schema for query parameters
const AvailabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timezone: z.string().min(1, 'Timezone is required'),
});

/**
 * GET /api/availability
 * Returns available time slots for a given date and timezone
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const result = AvailabilityQuerySchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid parameters',
        details: result.error.issues[0].message,
      });
    }

    const { date, timezone } = result.data;

    // Fetch available slots from Zoom adapter
    const allSlots = await getAvailableSlots(date, timezone);

    // Filter out slots that conflict with existing Zoom meetings
    const availableSlots = await filterAvailableSlots(allSlots, date);

    return res.json({ slots: availableSlots });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return res.status(500).json({
      error: 'Failed to fetch availability',
    });
  }
});

export default router;
