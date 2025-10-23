import React from 'react';
import { PropertySummary } from './interfaces';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

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
      <h3 className="mt-4 text-xl font-semibold">Google Analytics properties</h3>
      {propertiesLoading && <div>Loading properties...</div>}
      {propertiesError && <div className="text-red-500">{propertiesError}</div>}
      {!propertiesLoading && properties.length === 0 && !propertiesError && (
        <div>Properties not found.</div>
      )}
      {!propertiesLoading && properties.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((prop) => (
            <Card
              key={prop.property}
              onClick={() => onPropertyClick(prop.property, false)}
              className={cn(
                'group relative rounded-lg border-2 border-gray-200 bg-white p-6 text-left transition-all border-t-[3px] cursor-pointer',
                prop.property !== expandedPropertyId
                  ? 'hover:shadow-lg hover:border-t-[#C33527]'
                  : '',
                prop.property === expandedPropertyId
                  ? 'shadow-lg border-t-[#C33527]'
                  : 'border-t-transparent',
                apiLoading && 'opacity-70',
              )}
            >
              <CardHeader className="mb-2 flex-row items-center space-y-0 gap-3 p-0 transition-all group-hover:translate-x-1 group-[.shadow-lg]:translate-x-1">
                <div className="p-2 rounded-md bg-transparent transition-colors group-hover:bg-primary/10 group-[.shadow-lg]:bg-primary/10 flex-shrink-0">
                  <BarChart3 className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary group-[.shadow-lg]:text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base md:text-lg truncate">
                    {prop.displayName}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground transition-colors group-hover:text-primary group-[.shadow-lg]:text-primary">
                    Property ID: {prop.property.split('/').pop()}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
