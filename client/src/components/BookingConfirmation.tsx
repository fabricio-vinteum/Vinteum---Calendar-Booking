import { useState } from 'react';
import CalendarSelectionModal from './CalendarSelectionModal';

interface BookingConfirmationProps {
  meetingDetails: {
    date: string;
    topic: string;
    duration: number;
    joinUrl: string;
  };
  onBookAnother: () => void;
}

export default function BookingConfirmation({
  meetingDetails,
  onBookAnother,
}: BookingConfirmationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-scale-up">
      {/* Success Icon */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 animate-pulse-subtle">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Success Message */}
      <h2 className="mb-2 text-2xl font-bold text-stone-900 animate-slide-up">
        Meeting Scheduled!
      </h2>
      <p className="mb-8 text-stone-600 animate-slide-up delay-100">
        Your meeting has been successfully booked.
      </p>

      {/* Meeting Details */}
      <div className="mb-8 w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 text-left shadow-sm animate-slide-up delay-200">
        <h3 className="mb-4 text-lg font-semibold text-stone-900">
          Meeting Details
        </h3>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-stone-500">Topic</p>
            <p className="text-stone-900">{meetingDetails.topic}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-stone-500">Date</p>
            <p className="text-stone-900">{formatDate(meetingDetails.date)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-stone-500">Time</p>
            <p className="text-stone-900">
              {formatTime(meetingDetails.date)} ({meetingDetails.duration} minutes)
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-stone-500">Join URL</p>
            <a
              href={meetingDetails.joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
            >
              {meetingDetails.joinUrl}
              <span className="material-icons-round text-sm">open_in_new</span>
            </a>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center animate-slide-up delay-300">
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-primary px-6 py-2 font-medium text-white transition-all hover:bg-primary-hover hover:scale-105 flex items-center gap-2"
        >
          <span className="material-icons-round text-sm">event</span>
          Add to Calendar
        </button>
      </div>

      {/* Calendar Selection Modal */}
      <CalendarSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        meetingDetails={meetingDetails}
      />
    </div>
  );
};
