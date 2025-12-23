import React, { useState, useEffect } from 'react';
import { fetchAvailability } from '../api/availabilityApi';
import { detectTimezone } from '../utils/timezoneDetector';

interface TimeSlotGridProps {
  selectedDate: Date;
  onSlotClick: (slot: string) => void;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({ selectedDate, onSlotClick }) => {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAvailability = async () => {
      setLoading(true);
      setError(null);

      const dateStr = selectedDate.toISOString().split('T')[0];
      const timezone = detectTimezone();

      const result = await fetchAvailability(dateStr, timezone);

      if (result.error) {
        setError(result.error);
        setSlots([]);
      } else {
        setSlots(result.slots);
      }

      setLoading(false);
    };

    loadAvailability();
  }, [selectedDate]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="animate-slide-up delay-300">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Available Times for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </h3>
        <div className="space-y-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 animate-pulse"
            >
              <div className="h-4 bg-gray-300 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-slide-up delay-300">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Available Times
        </h3>
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium mb-2">Unable to Load Times</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="animate-slide-up delay-300">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Available Times for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </h3>
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-600 font-medium">No available times</p>
          <p className="text-sm text-gray-500 mt-1">Please select another day</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up delay-300">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Available Times for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </h3>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2 pb-2">
        {slots.map((slot, index) => (
          <button
            key={index}
            onClick={() => onSlotClick(slot)}
            className="time-slot w-full group flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 bg-white transition-all duration-200"
          >
            <span className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
              {formatTime(slot)}
            </span>
            <span className="material-icons-round text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
              arrow_forward
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
