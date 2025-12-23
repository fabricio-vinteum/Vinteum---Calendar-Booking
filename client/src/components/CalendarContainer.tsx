import React, { useState } from 'react';
import { DateStripSelector } from './DateStripSelector';
import { TimeSlotGrid } from './TimeSlotGrid';

interface CalendarContainerProps {
  onSlotClick: (slot: string) => void;
}

export const CalendarContainer: React.FC<CalendarContainerProps> = ({ onSlotClick }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="bg-white p-6 sm:p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 animate-slide-up">Select a time</h2>

      {/* Date Selector */}
      <div className="mb-8 animate-slide-up delay-200">
        <DateStripSelector selectedDate={selectedDate} onDateSelect={setSelectedDate} />
      </div>

      {/* Time Slots */}
      <TimeSlotGrid selectedDate={selectedDate} onSlotClick={onSlotClick} />

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center animate-slide-up delay-400">
        <p className="text-sm text-gray-500">
          Need help? <a href="#" className="text-primary hover:underline">Contact support</a>
        </p>
      </div>
    </div>
  );
};
