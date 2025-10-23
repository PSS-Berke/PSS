import React from 'react';
import { CalculatedKPIs } from './interfaces';

interface CalculatedKpisDisplayProps {
  calculatedKPIs: CalculatedKPIs | null;
}

export const CalculatedKpisDisplay: React.FC<CalculatedKpisDisplayProps> = ({ calculatedKPIs }) => {
  if (!calculatedKPIs) return null;

  const kpiItems = [
    { label: 'New User Share', value: calculatedKPIs.newUsersShare },
    { label: 'Views per User', value: calculatedKPIs.viewsPerUser },
    { label: 'Click-Through Rate (CTR)', value: calculatedKPIs.ctr },
  ];

  return (
    <div className="flex flex-col h-full">
      <h4 className="mb-4 text-md font-semibold">Calculated Key Performance Indicators (KPIs)</h4>
      <div className="flex flex-wrap justify-center items-center gap-4 flex-grow">
        {kpiItems.map((kpi, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card shadow-sm min-w-[150px] h-[100px] w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)]"
          >
            <p className="text-sm text-muted-foreground text-center">{kpi.label}</p>
            <p className="text-2xl font-bold text-center">{kpi.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
