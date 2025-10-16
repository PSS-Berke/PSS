'use client';
import React, { useEffect, useState } from 'react';
import { WixAnalyticsModule } from '@/components/wix-analytics/wix-analytics-module';
import { WixAnalyticsProvider } from '@/lib/xano/wix-analytics-context';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/xano/auth-context';
import { useSearchParams } from 'next/navigation';

export default function AnalyticsPage() {
  const { user, token, refreshUser } = useAuth();
  const [isConnectingGoogleAnalytics, setIsConnectingGoogleAnalytics] = useState(false);
  const searchParams = useSearchParams();
  useEffect(() => {
    const handleTwitterCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const scope = searchParams.get('scope');
      if (code && state && token && scope) {
        try {
          console.log('Google Analytics OAuth callback detected:', { code, state, scope });

          // Send GET request to Twitter callback API
          const callbackUrl = `https://xnpm-iauo-ef2d.n7e.xano.io/api:_dzvItLQ/google/exchange_token?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scope)}`;

          const response = await fetch(callbackUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Google Analytics OAuth callback successful:', result);

            // Refresh user data to update X access status
            await refreshUser();



          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Google Analytics OAuth callback failed:', response.status, errorData);
          }
        } catch (error) {
          console.error('Google Analytics OAuth callback error:', error);
        }
      }
    };

    handleTwitterCallback();
  }, [searchParams, token, refreshUser]);


  const handleConnectGoogleAnalytics = async () => {
    // Step 1: Call request_oauth_url to get OAuth parameters and auto-associate user to state
    const company_id = user?.company_id;
    const connect = await fetch(`https://xnpm-iauo-ef2d.n7e.xano.io/api:_dzvItLQ/google/request_url?company_id=${company_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!connect.ok) {
      const errorData = await connect.json();
      console.error(errorData);
      setIsConnectingGoogleAnalytics(false);
      return;
    }

    // Step 2: Parse the JSON response
    const connectData = await connect.json();

    if (connectData.authUrl) {
      setIsConnectingGoogleAnalytics(false);
      window.open(connectData.authUrl, '_blank');
      return;
    }
  }
  return (
    <WixAnalyticsProvider>
      <main className="w-full h-full">
        <div className="w-full p-0 md:p-6 space-y-4 md:space-y-6 pb-24 md:pb-6">
          <div className="mb-6 px-2">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="mt-2 text-muted-foreground">
              Multi-platform website analytics and insights
            </p>
          </div>
          <div className="w-full px-2">
            <WixAnalyticsModule className="w-full" />
          </div>
          <div className="w-full px-2">
            <Button onClick={handleConnectGoogleAnalytics}>Connect Google Analytics to your website</Button>
          </div>
        </div>
      </main>
    </WixAnalyticsProvider>
  );
}
