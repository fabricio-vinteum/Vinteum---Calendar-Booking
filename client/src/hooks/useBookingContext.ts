import { useState, useEffect } from 'react';
import { parseBookingContext } from '../utils/urlParser';
import { BookingContextSchema, type BookingContext } from '../types/booking';

interface UseBookingContextResult {
  context: BookingContext | null;
  error: string | null;
  isValid: boolean;
}

/**
 * Custom hook to parse and validate booking context from URL parameters
 * Runs validation on component mount
 */
export function useBookingContext(): UseBookingContextResult {
  const [context, setContext] = useState<BookingContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const rawContext = parseBookingContext();

    if (!rawContext) {
      setError('Missing booking information in the link. Please check your invitation email.');
      setIsValid(false);
      return;
    }

    // Validate with Zod
    const result = BookingContextSchema.safeParse(rawContext);

    if (!result.success) {
      const firstError = result.error.issues[0];
      setError(`Invalid link: ${firstError.message}`);
      setIsValid(false);
      return;
    }

    // Success
    setContext(result.data);
    setError(null);
    setIsValid(true);
  }, []);

  return { context, error, isValid };
}
