import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getAvailableSlots } from '../adapters/zoomAdapter';
import { getBookingCountForSlot } from '../adapters/hubspotAdapter';

const router = Router();

/**
 * Filter slots to only include those with capacity < 2
 * @param slots - Array of ISO timestamp strings
 * @returns Filtered array of available slots
 */
async function filterAvailableSlots(slots: string[]): Promise<string[]> {
  const availableSlots: string[] = [];

  for (const slot of slots) {
    const bookingCount = await getBookingCountForSlot(slot);
    
    // Only include slots with less than 2 bookings
    if (bookingCount < 2) {
      availableSlots.push(slot);
    } else {
      console.log(`Slot ${slot} is fully booked (${bookingCount}/2)`);
    }
  }

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

    // Filter out fully booked slots (capacity = 2)
    const availableSlots = await filterAvailableSlots(allSlots);

    return res.json({ slots: availableSlots });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return res.status(500).json({
      error: 'Failed to fetch availability',
    });
  }
});

export default router;
