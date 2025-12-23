import { useEffect } from 'react';
import { generateGoogleCalendarUrl, generateOutlookCalendarUrl } from '../utils/calendarUtils';

interface CalendarSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    meetingDetails: {
        date: string;
        topic: string;
        duration: number;
        joinUrl: string;
    };
}

export default function CalendarSelectionModal({
    isOpen,
    onClose,
    meetingDetails,
}: CalendarSelectionModalProps) {
    // Close modal on Escape key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleGoogleCalendar = () => {
        const url = generateGoogleCalendarUrl({
            title: meetingDetails.topic,
            startDate: meetingDetails.date,
            duration: meetingDetails.duration,
            description: `Join the meeting: ${meetingDetails.joinUrl}`,
            location: meetingDetails.joinUrl,
        });
        window.open(url, '_blank');
        onClose();
    };

    const handleOutlookCalendar = () => {
        const url = generateOutlookCalendarUrl({
            title: meetingDetails.topic,
            startDate: meetingDetails.date,
            duration: meetingDetails.duration,
            description: `Join the meeting: ${meetingDetails.joinUrl}`,
            location: meetingDetails.joinUrl,
        });
        window.open(url, '_blank');
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal Content */}
            <div
                className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-all hover:bg-stone-100 hover:text-stone-600"
                    aria-label="Close modal"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                {/* Header */}
                <div className="mb-6">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <span className="material-icons-round text-blue-600">event</span>
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900">
                        Add to Calendar
                    </h2>
                    <p className="mt-1 text-sm text-stone-600">
                        Choose your preferred calendar application
                    </p>
                </div>

                {/* Calendar Options */}
                <div className="space-y-3">
                    {/* Google Calendar Button */}
                    <button
                        onClick={handleGoogleCalendar}
                        className="group w-full rounded-xl border-2 border-stone-200 bg-white p-4 text-left transition-all hover:border-blue-500 hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm group-hover:shadow-md transition-shadow">
                                <svg
                                    className="h-7 w-7"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <path
                                        d="M5.5 3C4.67157 3 4 3.67157 4 4.5V19.5C4 20.3284 4.67157 21 5.5 21H18.5C19.3284 21 20 20.3284 20 19.5V9L15 4H5.5Z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M15 4V9H20"
                                        fill="#A1C2FA"
                                    />
                                    <path
                                        d="M12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10Z"
                                        fill="white"
                                    />
                                    <path
                                        d="M12 11.5C11.1716 11.5 10.5 12.1716 10.5 13C10.5 13.8284 11.1716 14.5 12 14.5C12.8284 14.5 13.5 13.8284 13.5 13C13.5 12.1716 12.8284 11.5 12 11.5Z"
                                        fill="#4285F4"
                                    />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-stone-900 group-hover:text-blue-700">
                                    Google Calendar
                                </h3>
                                <p className="text-sm text-stone-500">
                                    Add to your Google account
                                </p>
                            </div>
                            <svg
                                className="h-5 w-5 text-stone-400 group-hover:text-blue-600 transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </div>
                    </button>

                    {/* Outlook Calendar Button */}
                    <button
                        onClick={handleOutlookCalendar}
                        className="group w-full rounded-xl border-2 border-stone-200 bg-white p-4 text-left transition-all hover:border-blue-600 hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm group-hover:shadow-md transition-shadow">
                                <svg
                                    className="h-7 w-7"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <rect
                                        x="3"
                                        y="4"
                                        width="18"
                                        height="16"
                                        rx="2"
                                        fill="#0078D4"
                                    />
                                    <path
                                        d="M8 9C7.44772 9 7 9.44772 7 10V14C7 14.5523 7.44772 15 8 15H16C16.5523 15 17 14.5523 17 14V10C17 9.44772 16.5523 9 16 9H8Z"
                                        fill="white"
                                    />
                                    <path
                                        d="M12 12L7 9.5V10.5L12 13L17 10.5V9.5L12 12Z"
                                        fill="#0078D4"
                                    />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-stone-900 group-hover:text-blue-700">
                                    Outlook Calendar
                                </h3>
                                <p className="text-sm text-stone-500">
                                    Add to your Microsoft account
                                </p>
                            </div>
                            <svg
                                className="h-5 w-5 text-stone-400 group-hover:text-blue-600 transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </div>
                    </button>
                </div>

                {/* Footer Note */}
                <p className="mt-4 text-center text-xs text-stone-500">
                    You'll be redirected to your calendar provider
                </p>
            </div>
        </div>
    );
}
