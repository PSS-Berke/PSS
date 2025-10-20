import React from 'react';
import { PropertySummary } from './interfaces';

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
    <div style={{ marginTop: '20px' }}>
      <h2 style={{ marginTop: '20px' }}>Google Analytics properties</h2>
      {propertiesLoading && <div>Loading properties...</div>}
      {propertiesError && <div style={{ color: 'red' }}>{propertiesError}</div>}
      {!propertiesLoading && properties.length === 0 && !propertiesError && (
        <div>Properties not found.</div>
      )}
      {!propertiesLoading && properties.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', marginTop: '15px' }}>
          {properties.map((prop) => (
            <div
              key={prop.property}
              onClick={() => onPropertyClick(prop.property, false)}
              style={{
                border: '1px solid #ddd',
                padding: '15px',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: prop.property === expandedPropertyId ? '0 4px 8px rgba(0,0,0,0.1), 0 0 0 2px #007bff' : '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease-in-out',
                backgroundColor: prop.property === expandedPropertyId ? '#e6f7ff' : (apiLoading ? '#f0f0f0' : 'white'),
                opacity: apiLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = prop.property === expandedPropertyId ? '0 4px 8px rgba(0,0,0,0.1), 0 0 0 2px #007bff' : '0 4px 8px rgba(0,0,0,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = prop.property === expandedPropertyId ? '0 4px 8px rgba(0,0,0,0.1), 0 0 0 2px #007bff' : '0 2px 4px rgba(0,0,0,0.05)')}
            >
              <h3>{prop.displayName}</h3>
              <p style={{ fontSize: '0.9em', color: '#666' }}>ID: {prop.property.split('/').pop()}</p>
              <p style={{ fontSize: '0.9em', color: '#666' }}>Type: {prop.propertyType}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
