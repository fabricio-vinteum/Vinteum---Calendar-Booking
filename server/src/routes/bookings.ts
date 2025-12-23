import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { executeTransaction } from '../services/bookingService';

const router = Router();

/**
 * Booking request validation schema
 */
const BookingRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstname: z.string().min(1, 'First name is required'),
  date: z.string().datetime({ offset: true, message: 'Invalid date format (ISO 8601 required)' }),
  timezone: z.string().min(1, 'Timezone is required'),
  topic: z.string().min(1, 'Topic is required'),
  duration: z.number().int().positive('Duration must be positive'),
});

/**
 * POST /api/bookings
 * Create a new booking
 */
router.post('/', async (req: Request, res: Response) => {
  console.log('[Bookings API] Received booking request');
  try {
    // Validate request body
    const validationResult = BookingRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return res.status(400).json({
        success: false,
        error: firstError.message,
      });
    }

    const bookingRequest = validationResult.data;

    // Execute booking transaction
    const result = await executeTransaction(bookingRequest);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error: any) {
    console.error('[Bookings API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
