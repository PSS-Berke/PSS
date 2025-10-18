import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/xano/auth-context';
import { apiRequest } from '@/lib/xano/api';
import { XANO_CONFIG, getGoogleAnalyticsApiUrl } from '@/lib/xano/config';

interface PropertySummary {
  property: string;
  displayName: string;
  propertyType: string;
  parent: string;
}

interface GooglePropertiesResponse {
  ap: {
    request: any;
    response: {
      headers: any;
      result: {
        accountSummaries: AccountSummary[];
      };
      status: number;
    };
  };
}

interface AccountSummary {
  name: string;
  account: string;
  displayName: string;
  propertySummaries: PropertySummary[];
}

export default function GaPage() {
  const { user, isLoading, token } = useAuth();
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [accountDataResponse, setAccountDataResponse] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!token || !user?.id) {
        setPropertiesLoading(false);
        return;
      }

      setPropertiesLoading(true);
      setPropertiesError(null);

      try {
        const response = await apiRequest<
          GooglePropertiesResponse
        >(
          getGoogleAnalyticsApiUrl(XANO_CONFIG.ENDPOINTS.GOOGLE_ANALYTICS.PROPERTIES) + `?user_id=${user.id}`,
          { method: 'GET' },
          token,
        );

        if (response?.ap?.response?.result?.accountSummaries) {
          const allProperties: PropertySummary[] = [];
          response.ap.response.result.accountSummaries.forEach((accountSummary: AccountSummary) => {
            allProperties.push(...accountSummary.propertySummaries);
          });
          setProperties(allProperties);
        } else {
          setPropertiesError('Failed to retrieve Google Analytics properties.');
        }
      } catch (error: any) {
        console.error('Error retrieving Google Analytics properties:', error);
        setPropertiesError(
          `Error getting properties: ${error.message || 'Unknown error'}`,
        );
      } finally {
        setPropertiesLoading(false);
      }
    };

    fetchProperties();
  }, [token, user?.id]);

  const handlePropertyClick = async (propertyId: string) => {
    setApiLoading(true);
    setApiError(null);
    setAccountDataResponse(null);

    if (!token || !user?.company_id) {
      setApiError('The user is not authenticated or the company ID is missing.');
      setApiLoading(false);
      return;
    }

    try {
      const numericPropertyId = propertyId.split('/').pop();
      if (!numericPropertyId) {
        setApiError('Failed to extract the numeric property ID.');
        setApiLoading(false);
        return;
      }

      const payload = {
        company_id: user.company_id,
        property_id: numericPropertyId,
        metrics: [{
          name: 'sessions'
        }],
        dimensions: [{
          name: 'date'
        }],
        dateRanges: [{
          startDate: '7daysAgo',
          endDate: 'today'
        }],
      };

      const apiUrl = getGoogleAnalyticsApiUrl(XANO_CONFIG.ENDPOINTS.GOOGLE_ANALYTICS.ACCOUNT_DATA);
      console.log('Sending POST request to:', apiUrl);

      const response = await apiRequest(
        apiUrl,
        {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        },
        token,
      );

      setAccountDataResponse(JSON.stringify(response, null, 2));
    } catch (error: any) {
      console.error('Error retrieving Google Analytics account data:', error);
      setApiError(
        `Error retrieving account details: ${error.message || 'Unknown error'}`,
      );
    } finally {
      setApiLoading(false);
    }
  };

  const handleTestApiCall = async () => {
    // Existing test API call logic (kept for reference, but new logic for properties is above)
    setApiLoading(true);
    setApiError(null);
    setApiResponse(null);

    if (!token) {
      setApiError('User not authenticated. Token missing.');
      setApiLoading(false);
      return;
    }

    try {
      const response = await apiRequest('/test-endpoint', { method: 'GET' }, token);
      setApiResponse(JSON.stringify(response, null, 2));
    } catch (error: any) {
      console.error('Xano API call failed:', error);
      setApiError(`Error while calling API: ${error.message || 'Unknown error'}`);
    } finally {
      setApiLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  if (!user) {
    return <div>The user is not authenticated.</div>;
  }

  return (
    <div>
      <h1>Google Analytics</h1>
      <p>Authorized user:</p>
      <p>Name: {user.name || 'Not specified'}</p>
      <p>Email: {user.email}</p>
      <p>User ID: {user.id || 'Not specified'}</p>
      <p>Company name: {user.company || 'Not specified'}</p>

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
              onClick={() => handlePropertyClick(prop.property)}
              style={{
                border: '1px solid #ddd',
                padding: '15px',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease-in-out',
                backgroundColor: apiLoading ? '#f0f0f0' : 'white',
                opacity: apiLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)')}
            >
              <h3>{prop.displayName}</h3>
              <p style={{ fontSize: '0.9em', color: '#666' }}>ID: {prop.property.split('/').pop()}</p>
              <p style={{ fontSize: '0.9em', color: '#666' }}>Тип: {prop.propertyType}</p>
            </div>
          ))}
        </div>
      )}

      {accountDataResponse && (
        <div style={{ backgroundColor: '#e6ffe6', padding: '15px', marginTop: '20px', borderRadius: '8px', border: '1px solid #aaffaa' }}>
          <h3 style={{ marginBottom: '10px' }}>Google Analytics account information:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{accountDataResponse}</pre>
        </div>
      )}

      {/* Existing demo API call section - kept for reference, can be removed later */}
      <h2 style={{ marginTop: '40px' }}>Demo interaction with Xano API (old)</h2>
      <button
        onClick={handleTestApiCall}
        disabled={apiLoading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: apiLoading ? 'not-allowed' : 'pointer',
          backgroundColor: apiLoading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        {apiLoading ? 'Loading...' : 'Make a test API call'}
      </button>

      {apiError && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <p>Error: {apiError}</p>
        </div>
      )}

      {apiResponse && (
        <div style={{ backgroundColor: '#f0f0f0', padding: '10px', marginTop: '10px', borderRadius: '5px' }}>
          <p>Response API:</p>
          <pre>{apiResponse}</pre>
        </div>
      )}
    </div>
  );
}