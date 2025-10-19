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

interface GoogleAccountSummaryResponse {
  dimensionHeaders: Array<{ name: string }>;
  metricHeaders: Array<any>; // Simplified, can be more detailed if needed
  rows: Array<{
    dimensionValues: Array<{ value: string }>;
    metricValues: Array<{ value: string }>;
  }>;
  rowCount: number;
  metadata: {
    currencyCode: string;
    timeZone: string;
  };
  kind: string;
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
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<GoogleAccountSummaryResponse | null>(null);

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
    if (expandedPropertyId === propertyId) {
      setExpandedPropertyId(null);
      setSummaryData(null);
      return;
    }

    setExpandedPropertyId(propertyId);
    setSummaryLoading(true);
    setSummaryError(null);
    setSummaryData(null);

    if (!token || !user?.id || !user?.company_id) {
      setSummaryError('The user is not authenticated, the user ID or company ID is missing.');
      setSummaryLoading(false);
      return;
    }

    try {
      const numericPropertyId = propertyId.split('/').pop();
      if (!numericPropertyId) {
        setSummaryError('Failed to extract the numeric property ID.');
        setSummaryLoading(false);
        return;
      }

      const payload = {
        company_id: user.company_id,
        property_id: numericPropertyId,
        user_id: user.id.toString(),
        startDate: '2025-02-01',
        endDate: '2025-10-01',
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'conversions' },
          { name: 'totalRevenue' },
          { name: 'transactions' },
        ], // Added common metrics based on typical GA reports
        dimensions: [{ name: 'date' }, { name: 'country' }], // Added country as per request
        dateRanges: [
          { startDate: '30daysAgo', endDate: 'today' }, // Default to last 30 days
        ],
      };

      const apiUrl = getGoogleAnalyticsApiUrl(XANO_CONFIG.ENDPOINTS.GOOGLE_ANALYTICS.ACCOUNT_SUMMARY);
      console.log('Sending POST request to Account Summary:', apiUrl, payload);

      const response = await apiRequest<GoogleAccountSummaryResponse>(
        apiUrl,
        {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        },
        token,
      );
      setSummaryData(response);
    } catch (error: any) {
      console.error('Error retrieving Google Analytics account summary:', error);
      setSummaryError(
        `Error retrieving account summary: ${error.message || 'Unknown error'}`,
      );
    } finally {
      setSummaryLoading(false);
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

      {summaryLoading && expandedPropertyId && <div>Loading account summary...</div>}
      {summaryError && expandedPropertyId && <div style={{ color: 'red' }}>{summaryError}</div>}
      {summaryData && expandedPropertyId && (
        <div style={{ backgroundColor: '#e6ffe6', padding: '15px', marginTop: '20px', borderRadius: '8px', border: '1px solid #aaffaa' }}>
          <h3 style={{ marginBottom: '10px' }}>Google Analytics account information for {expandedPropertyId}:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(summaryData, null, 2)}</pre>
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