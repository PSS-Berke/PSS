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
    <div style={{ marginTop: '20px' }}>
      <h4>Calculated Key Performance Indicators (KPIs)</h4>
      <p><strong>New User Share:</strong> {calculatedKPIs.newUsersShare}</p>
      <p><strong>Views per User:</strong> {calculatedKPIs.viewsPerUser}</p>
      <p><strong>Click-Through Rate (CTR):</strong> {calculatedKPIs.ctr}</p>
    </div>
  );
};
