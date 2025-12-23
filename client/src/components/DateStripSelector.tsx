import React, { useRef, useState, useEffect } from 'react';
import { getNext35Days, isWeekend, isSameDay } from '../utils/dateUtils';
import { isUSHoliday } from '../utils/holidays';

interface DateStripSelectorProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const DateStripSelector: React.FC<DateStripSelectorProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  const dates = getNext35Days();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = scrollContainerRef.current.scrollLeft +
        (direction === 'right' ? scrollAmount : -scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-stone-700 mb-3">Select a Date</h3>
      <div className="relative">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-white to-transparent flex items-center justify-start pl-1 group hover:from-gray-50 transition-colors"
            aria-label="Scroll left"
          >
            <div className="bg-white border-2 border-stone-300 rounded-full p-1.5 shadow-md group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </div>
          </button>
        )}

        {/* Date container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
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
                  ${isBlocked
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

        {/* Right scroll button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-white to-transparent flex items-center justify-end pr-1 group hover:from-gray-50 transition-colors"
            aria-label="Scroll right"
          >
            <div className="bg-white border-2 border-stone-300 rounded-full p-1.5 shadow-md group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all">
              <svg
                className="w-4 h-4"
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
        )}
      </div>
    </div>
  );
};
