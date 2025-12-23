import React, { useState } from 'react';
import { HostProfile } from './HostProfile';
import { CalendarContainer } from './CalendarContainer';
import BookingConfirmation from './BookingConfirmation';
import { useBookingContext } from '../hooks/useBookingContext';
import { createBooking, type CreateBookingResponse } from '../api/bookingApi';
import { detectTimezone } from '../utils/timezoneDetector';

export const BookingWidget: React.FC = () => {
  const { context, error, isValid } = useBookingContext();
  const [bookingState, setBookingState] = useState<'calendar' | 'loading' | 'confirmed' | 'error'>('calendar');
  const [bookingResult, setBookingResult] = useState<CreateBookingResponse | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const handleSlotClick = async (slot: string) => {
    if (!context) return;

    setBookingState('loading');
    setBookingError(null);

    const result = await createBooking({
      email: context.email,
      firstname: context.name,
      date: slot,
      timezone: detectTimezone(),
      topic: 'Meeting with Host',
      duration: 30,
    });

    if (result.success) {
      setBookingResult(result);
      setBookingState('confirmed');
    } else {
      setBookingError(result.error || 'Failed to create booking');
      setBookingState('error');
    }
  };

  const handleBookAnother = () => {
    setBookingState('calendar');
    setBookingResult(null);
    setBookingError(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-10">
      <main className="w-full max-w-2xl px-4 animate-fade-in">
        {error ? (
          // Error State - Invalid Link
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 animate-scale-up">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse-subtle">⚠️</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3 animate-slide-up">Invalid Booking Link</h2>
              <p className="text-gray-600 mb-6 animate-slide-up delay-100">{error}</p>
              <p className="text-sm text-gray-500 animate-slide-up delay-200">
                Please check your invitation email or contact support for assistance.
              </p>
            </div>
          </div>
        ) : bookingState === 'confirmed' && bookingResult ? (
          // Confirmed State
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
            <BookingConfirmation
              meetingDetails={{
                date: bookingResult.joinUrl || '',
                topic: 'Meeting with Host',
                duration: 30,
                joinUrl: bookingResult.joinUrl || '',
              }}
              onBookAnother={handleBookAnother}
            />
          </div>
        ) : bookingState === 'error' ? (
          // Error State - Booking Failed
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 animate-scale-up">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse-subtle">❌</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3 animate-slide-up">Booking Failed</h2>
              <p className="text-gray-600 mb-6 animate-slide-up delay-100">{bookingError}</p>
              <button
                onClick={handleBookAnother}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all hover:scale-105 animate-slide-up delay-200"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          // Calendar State
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* Host Profile Header */}
            <HostProfile name={context?.name} />

            {/* Calendar Section */}
            {isValid && bookingState === 'loading' ? (
              <div className="flex items-center justify-center h-64 p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Booking your meeting...</p>
                </div>
              </div>
            ) : (
              <CalendarContainer onSlotClick={handleSlotClick} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};
