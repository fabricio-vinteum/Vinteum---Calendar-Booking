interface CalendarEventDetails {
    title: string;
    startDate: string; // ISO 8601 format
    duration: number; // in minutes
    description?: string;
    location?: string;
}

/**
 * Formats a date to the format required by Google Calendar (YYYYMMDDTHHmmssZ)
 */
const formatDateForGoogle = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Formats a date to the format required by Outlook (YYYY-MM-DDTHH:mm:ss)
 */
const formatDateForOutlook = (date: Date): string => {
    return date.toISOString().split('.')[0];
};

/**
 * Calculates the end date based on start date and duration
 */
const calculateEndDate = (startDate: string, durationMinutes: number): Date => {
    const start = new Date(startDate);
    return new Date(start.getTime() + durationMinutes * 60000);
};

/**
 * Generates a Google Calendar URL for adding an event
 * @param details Event details including title, start date, duration, description, and location
 * @returns URL string to open Google Calendar with pre-filled event details
 */
export const generateGoogleCalendarUrl = (details: CalendarEventDetails): string => {
    const startDate = new Date(details.startDate);
    const endDate = calculateEndDate(details.startDate, details.duration);

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: details.title,
        dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
        details: details.description || '',
        location: details.location || '',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generates an Outlook Calendar URL for adding an event
 * @param details Event details including title, start date, duration, description, and location
 * @returns URL string to open Outlook Calendar with pre-filled event details
 */
export const generateOutlookCalendarUrl = (details: CalendarEventDetails): string => {
    const startDate = new Date(details.startDate);
    const endDate = calculateEndDate(details.startDate, details.duration);

    const params = new URLSearchParams({
        path: '/calendar/action/compose',
        rru: 'addevent',
        subject: details.title,
        startdt: formatDateForOutlook(startDate),
        enddt: formatDateForOutlook(endDate),
        body: details.description || '',
        location: details.location || '',
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};
