'use client';

import React, { useState, useEffect } from 'react';
import { ActiveModulesSidebar } from './active-modules-sidebar';
import { ModuleUserList } from './module-user-list';
import { Linkedin, ShieldCheck, Building2, Share2, BarChart3, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/xano/auth-context';
import { getAuthHeaders } from '@/lib/xano/config';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FaGoogle, FaXTwitter } from 'react-icons/fa6';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiDisconnectGoogleAnalytics } from '@/lib/services/AnalyticsService';
import { AxiosError } from 'axios';
import toast from '../ui/toast';

type UserModule = {
  id: number;
  name: string;
  description?: string;
};

type TwitterAccount = {
  id: number;
  twitter_scope: string;
  twitter_username: string;
  twitter_name: string;
};

export function ActiveModulesView() {
  const { token, user, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );
  const [userModules, setUserModules] = useState<UserModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnectingGoogleAnalytics, setIsConnectingGoogleAnalytics] = useState(false);
  const [isConnectingX, setIsConnectingX] = useState(false);
  const [twitterAccounts, setTwitterAccounts] = useState<TwitterAccount[]>([]);
  const [isLoadingTwitterAccounts, setIsLoadingTwitterAccounts] = useState(false);
  const [disconnectingAccountId, setDisconnectingAccountId] = useState<number | null>(null);
  const [accountToDisconnect, setAccountToDisconnect] = useState<TwitterAccount | null>(null);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);
  const [isDisconnectingGoogleAnalytics, setIsDisconnectingGoogleAnalytics] = useState(false);
  const [showDisconnectGAModal, setShowDisconnectGAModal] = useState(false);
  const [gaDisconnectError, setGaDisconnectError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserModules = async () => {
      if (!token) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching user modules...');
        const response = await fetch(
          'https://xnpm-iauo-ef2d.n7e.xano.io/api:yeS5OlQH/get_my_modules',
          {
            method: 'GET',
            headers: getAuthHeaders(token),
          },
        );

        if (!response.ok) {
          throw new Error('Failed to fetch user modules');
        }

        const data: UserModule[] = await response.json();
        console.log('User modules received:', data);

        setUserModules(data);

        // Set first module as selected if available
        if (data.length > 0 && !selectedModuleId) {
          setSelectedModuleId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching user modules:', err);
        setError(err instanceof Error ? err.message : 'Failed to load modules');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserModules();
  }, [token]);



  const handleConnectGoogleAnalytics = async () => {
    const company_id = user?.company_id;
    const connect = await fetch(
      `https://xnpm-iauo-ef2d.n7e.xano.io/api:_dzvItLQ/google/request_url?company_id=${company_id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!connect.ok) {
      const errorData = await connect.json();
      console.error(errorData);
      setIsConnectingGoogleAnalytics(false);
      return;
    }

    const connectData = await connect.json();

    if (connectData.authUrl) {
      setIsConnectingGoogleAnalytics(false);
      window.open(connectData.authUrl, '_blank');
      return;
    }
  };

  const handleConnectXAccount = async () => {
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    setIsConnectingX(true);

    try {
      const company_id = user?.company_id;
      const authStartResponse = await fetch(
        `https://xnpm-iauo-ef2d.n7e.xano.io/api:pEDfedqJ/twitter/request_oauth_url?company_id=${company_id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!authStartResponse.ok) {
        console.error(
          'request_oauth_url failed:',
          authStartResponse.status,
          authStartResponse.statusText,
        );

        setIsConnectingX(false);
        return;
      }

      const authData = await authStartResponse.json();

      if (!authData.authorization_url) {
        console.error('No authorization_url in response:', authData);
        setIsConnectingX(false);
        return;
      }

      window.open(authData.authorization_url, '_blank');
    } catch (error) {
      toast.push('X account issue! Please try again.', {
        placement: 'top-center',
      });
      console.error('Error connecting X account:', error);
      setIsConnectingX(false);
    }
  };

  const fetchTwitterAccounts = async () => {
    if (!token) return;

    setIsLoadingTwitterAccounts(true);
    try {
      const response = await fetch(
        'https://xnpm-iauo-ef2d.n7e.xano.io/api:yeS5OlQH/twitter_accounts',
        {
          method: 'GET',
          headers: getAuthHeaders(token),
        },
      );

      if (response.ok) {
        const data: TwitterAccount[] = await response.json();
        setTwitterAccounts(data);
      } else {
        console.error('Failed to fetch Twitter accounts:', response.status);
      }
    } catch (error) {
      console.error('Error fetching Twitter accounts:', error);
    } finally {
      setIsLoadingTwitterAccounts(false);
    }
  };

  const handleDisconnectTwitterAccount = async () => {
    if (!token || !accountToDisconnect) return;

    setDisconnectingAccountId(accountToDisconnect.id);
    setDisconnectError(null);

    try {
      const response = await fetch(
        'https://xnpm-iauo-ef2d.n7e.xano.io/api:pEDfedqJ/twitter/disconect',
        {
          method: 'DELETE',
          headers: {
            ...getAuthHeaders(token),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            social_intergrations_id: accountToDisconnect.id,
          }),
        },
      );

      if (response.ok) {
        console.log('Twitter account disconnected successfully');
        await fetchTwitterAccounts();
        await refreshUser();
        setAccountToDisconnect(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to disconnect Twitter account:', response.status, errorData);
        setDisconnectError('Failed to disconnect account. Please try again.');
      }
    } catch (error) {
      console.error('Error disconnecting Twitter account:', error);
      setDisconnectError('Failed to disconnect account. Please try again.');
    } finally {
      setDisconnectingAccountId(null);
    }
  };

  const openDisconnectModal = (account: TwitterAccount) => {
    setAccountToDisconnect(account);
    setDisconnectError(null);
  };

  const closeDisconnectModal = () => {
    if (disconnectingAccountId === null) {
      setAccountToDisconnect(null);
      setDisconnectError(null);
    }
  };

  const handleDisconnectGoogleAnalytics = async () => {
    if (!token) return;

    setIsDisconnectingGoogleAnalytics(true);
    setGaDisconnectError(null);

    try {
      if (!user?.company_id) {
        setGaDisconnectError('Company ID not found');
        return;
      }
      await apiDisconnectGoogleAnalytics({ company_id: user?.company_id });

      await refreshUser();
      setShowDisconnectGAModal(false);
    } catch (error) {
      console.error('Error disconnecting Google Analytics:', error);
      setGaDisconnectError((error as AxiosError).message);
    } finally {
      setIsDisconnectingGoogleAnalytics(false);
    }
  };

  const openDisconnectGAModal = () => {
    setShowDisconnectGAModal(true);
    setGaDisconnectError(null);
  };

  const closeDisconnectGAModal = () => {
    if (!isDisconnectingGoogleAnalytics) {
      setShowDisconnectGAModal(false);
      setGaDisconnectError(null);
    }
  };

  const selectedModule = userModules.find((m) => m.id === selectedModuleId);
  const selectedModuleName = selectedModule?.name || 'Module';

  // Fetch Twitter accounts when Social Media module is selected
  useEffect(() => {
    if (selectedModuleName.toLowerCase().includes('social') && token) {
      fetchTwitterAccounts();
    }
  }, [selectedModuleName, token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading modules</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (userModules.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">No active modules found</p>
          <p className="text-sm text-muted-foreground mt-2">Add modules to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <ActiveModulesSidebar
        isCollapsed={isSidebarCollapsed}
        onCollapseChange={setIsSidebarCollapsed}
        selectedModuleId={selectedModuleId}
        onSelectModule={setSelectedModuleId}
        modules={userModules}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ModuleUserList
          moduleName={selectedModuleName}
          moduleId={selectedModuleId || 0}
          oauthSection={
            selectedModule ? (
              <div className="space-y-4 mt-4">
                {/* Show Google Analytics section for Web Analytics module */}
                {selectedModuleName.toLowerCase().includes('analytics') &&
                  user?.ga_access?.access && (
                    <div className="space-y-3">
                      <div className="flex gap-2 items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 px-3"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (!user?.ga_access?.connected) {
                              handleConnectGoogleAnalytics();
                            }
                          }}
                          disabled={isConnectingGoogleAnalytics || user?.ga_access?.connected}
                        >
                          {isConnectingGoogleAnalytics ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FaGoogle className="h-4 w-4" />
                          )}
                          <span className="hidden lg:inline">
                            {user?.ga_access?.connected
                              ? 'Google Analytics Connected'
                              : isConnectingGoogleAnalytics
                                ? 'Connecting...'
                                : 'Connect Google Analytics'}
                          </span>
                        </Button>
                      </div>

                      {/* Google Analytics Connection Status */}
                      {user?.ga_access?.connected && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Connected Accounts:
                          </p>
                          <div className="flex items-center justify-between p-3 border rounded-lg bg-background/50">
                            <div className="flex items-center gap-3">
                              <FaGoogle className="h-5 w-5" />
                              <div>
                                <p className="text-sm font-medium">Google Analytics</p>
                                <p className="text-xs text-muted-foreground">
                                  Analytics account connected
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={openDisconnectGAModal}
                              disabled={isDisconnectingGoogleAnalytics}
                            >
                              {isDisconnectingGoogleAnalytics ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Disconnect'
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* Show X (Twitter) section for Social Media module */}
                {selectedModuleName.toLowerCase().includes('social') && (
                  <div className="space-y-3">
                    <div className="flex gap-2 items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 px-3"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleConnectXAccount();
                        }}
                        disabled={isConnectingX}
                      >
                        {isConnectingX ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FaXTwitter className="h-4 w-4" />
                        )}
                        <span className="hidden lg:inline">
                          {isConnectingX ? 'Connecting...' : 'Connect X Account'}
                        </span>
                      </Button>
                    </div>

                    {/* Twitter Accounts List */}
                    {isLoadingTwitterAccounts ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading accounts...
                      </div>
                    ) : twitterAccounts.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Connected Accounts:
                        </p>
                        {twitterAccounts.map((account) => (
                          <div
                            key={account.id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-background/50"
                          >
                            <div className="flex items-center gap-3">
                              <FaXTwitter className="h-5 w-5" />
                              <div>
                                <p className="text-sm font-medium">{account.twitter_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  @{account.twitter_username}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openDisconnectModal(account)}
                              disabled={disconnectingAccountId === account.id}
                            >
                              {disconnectingAccountId === account.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Disconnect'
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ) : undefined
          }
        />
      </div>

      {/* Disconnect Confirmation Modal */}
      <Dialog
        open={accountToDisconnect !== null}
        onOpenChange={(open) => !open && closeDisconnectModal()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disconnect X Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect this X account?
            </DialogDescription>
          </DialogHeader>

          {accountToDisconnect && (
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
              <FaXTwitter className="h-8 w-8" />
              <div>
                <p className="text-sm font-medium">{accountToDisconnect.twitter_name}</p>
                <p className="text-xs text-muted-foreground">
                  @{accountToDisconnect.twitter_username}
                </p>
              </div>
            </div>
          )}

          {disconnectError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive">{disconnectError}</p>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={closeDisconnectModal}
              disabled={disconnectingAccountId !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnectTwitterAccount}
              disabled={disconnectingAccountId !== null}
            >
              {disconnectingAccountId !== null ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Disconnecting...
                </>
              ) : (
                'Disconnect Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Google Analytics Disconnect Confirmation Modal */}
      <Dialog
        open={showDisconnectGAModal}
        onOpenChange={(open) => !open && closeDisconnectGAModal()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disconnect Google Analytics</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect Google Analytics? This will remove access to your
              analytics data.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
            <FaGoogle className="h-8 w-8" />
            <div>
              <p className="text-sm font-medium">Google Analytics</p>
              <p className="text-xs text-muted-foreground">Analytics account connected</p>
            </div>
          </div>

          {gaDisconnectError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive">{gaDisconnectError}</p>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={closeDisconnectGAModal}
              disabled={isDisconnectingGoogleAnalytics}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnectGoogleAnalytics}
              disabled={isDisconnectingGoogleAnalytics}
            >
              {isDisconnectingGoogleAnalytics ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Disconnecting...
                </>
              ) : (
                'Disconnect Analytics'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
