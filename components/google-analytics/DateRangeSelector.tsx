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
    <div style={{ marginBottom: '10px', marginTop: '10px' }}>
      <button
        onClick={() => setSelectedDateRange('1day')}
        style={{
          marginRight: '10px',
          padding: '8px 15px',
          backgroundColor: selectedDateRange === '1day' ? '#007bff' : '#f0f0f0',
          color: selectedDateRange === '1day' ? 'white' : 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        1 Day
      </button>
      <button
        onClick={() => setSelectedDateRange('7days')}
        style={{
          marginRight: '10px',
          padding: '8px 15px',
          backgroundColor: selectedDateRange === '7days' ? '#007bff' : '#f0f0f0',
          color: selectedDateRange === '7days' ? 'white' : 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        7 Days
      </button>
      <button
        onClick={() => setSelectedDateRange('28days')}
        style={{
          marginRight: '10px',
          padding: '8px 15px',
          backgroundColor: selectedDateRange === '28days' ? '#007bff' : '#f0f0f0',
          color: selectedDateRange === '28days' ? 'white' : 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        28 Days
      </button>
    </div>
  );
};
