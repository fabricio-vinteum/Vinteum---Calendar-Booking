import { z } from 'zod';

/**
 * Zod schema for booking context validation
 * Ensures name is non-empty and email has valid format
 */
export const BookingContextSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type BookingContext = z.infer<typeof BookingContextSchema>;
