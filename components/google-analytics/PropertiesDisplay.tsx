import React from 'react';
import { PropertySummary } from './interfaces';
import { cn } from '@/lib/utils';

interface PropertiesDisplayProps {
  properties: PropertySummary[];
  propertiesLoading: boolean;
  propertiesError: string | null;
  apiLoading: boolean;
  onPropertyClick: (propertyId: string, isDateRangeChange: boolean) => void;
  expandedPropertyId: string | null;
}

export const PropertiesDisplay: React.FC<PropertiesDisplayProps> = ({
  properties,
  propertiesLoading,
  propertiesError,
  apiLoading,
  onPropertyClick,
  expandedPropertyId,
}) => {
  return (
    <div className="mt-4">
      <h2 className="mt-4 text-xl font-semibold">Google Analytics properties</h2>
      {propertiesLoading && <div>Loading properties...</div>}
      {propertiesError && <div className="text-red-500">{propertiesError}</div>}
      {!propertiesLoading && properties.length === 0 && !propertiesError && (
        <div>Properties not found.</div>
      )}
      {!propertiesLoading && properties.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((prop) => (
            <div
              key={prop.property}
              onClick={() => onPropertyClick(prop.property, false)}
              className={cn(
                "cursor-pointer rounded-lg border p-4 shadow-sm transition-all duration-200",
                prop.property === expandedPropertyId
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-950/20"
                  : "hover:shadow-md",
                apiLoading && "opacity-70"
              )}
            >
              <h3 className="text-lg font-medium">{prop.displayName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">ID: {prop.property.split('/').pop()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Type: {prop.propertyType}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
