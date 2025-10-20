import React from 'react';
import { CalculatedKPIs } from './interfaces';

interface CalculatedKpisDisplayProps {
  calculatedKPIs: CalculatedKPIs | null;
}

export const CalculatedKpisDisplay: React.FC<CalculatedKpisDisplayProps> = ({
  calculatedKPIs,
}) => {
  if (!calculatedKPIs) return null;

  return (
    <div className="mt-4">
      <h4 className="mb-2 text-md font-semibold">Calculated Key Performance Indicators (KPIs)</h4>
      <div className="space-y-1">
        <p className="text-sm text-gray-700 dark:text-gray-300"><strong className="font-semibold">New User Share:</strong> {calculatedKPIs.newUsersShare}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300"><strong className="font-semibold">Views per User:</strong> {calculatedKPIs.viewsPerUser}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300"><strong className="font-semibold">Click-Through Rate (CTR):</strong> {calculatedKPIs.ctr}</p>
      </div>
    </div>
  );
};
