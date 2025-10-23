import React from 'react';

interface DateRangeSelectorProps {
  selectedDateRange: '1day' | '7days' | '28days';
  setSelectedDateRange: (range: '1day' | '7days' | '28days') => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  selectedDateRange,
  setSelectedDateRange,
}) => {
  return (
    <div className="mb-10 mt-10">
      {/* Date range buttons */}
      <div className="flex space-x-2">
        {[
          {
            key: '1day',
            label: '1 Day',
          },
          {
            key: '7days',
            label: '7 Days',
          },
          {
            key: '28days',
            label: '28 Days',
          },
        ].map((range) => (
          <button
            key={range.key}
            onClick={() => setSelectedDateRange(range.key as any)}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${
                selectedDateRange === range.key
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }
            `}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
};
