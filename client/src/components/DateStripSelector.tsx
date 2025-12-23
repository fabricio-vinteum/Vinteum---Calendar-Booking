import React from 'react';
import { getNext14Days, isWeekend, isSameDay } from '../utils/dateUtils';
import { isUSHoliday } from '../utils/holidays';

interface DateStripSelectorProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const DateStripSelector: React.FC<DateStripSelectorProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  const dates = getNext14Days();

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-stone-700 mb-3">Select a Date</h3>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {dates.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isWeekendDay = isWeekend(date);
          const holidayCheck = isUSHoliday(date);
          const isHoliday = holidayCheck.isHoliday;
          const isBlocked = isWeekendDay || isHoliday;

          return (
            <button
              key={index}
              onClick={() => !isBlocked && onDateSelect(date)}
              disabled={isBlocked}
              title={isHoliday ? `🎉 ${holidayCheck.name}` : undefined}
              className={`
                flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all
                min-w-[100px] text-center
                ${
                  isBlocked
                    ? 'bg-stone-50 border-stone-200 text-stone-300 cursor-not-allowed opacity-60'
                    : isSelected
                    ? 'bg-primary border-primary text-white shadow-md'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-primary hover:bg-primary/5 cursor-pointer'
                }
              `}
            >
              <div className="text-xs font-medium mb-1">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                {isHoliday && ' 🎉'}
              </div>
              <div className={`text-lg font-semibold ${isSelected ? 'text-white' : ''}`}>
                {date.getDate()}
              </div>
              <div className="text-xs">
                {date.toLocaleDateString('en-US', { month: 'short' })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
