'use client';

import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Users,
  Clock,
  Search,
  ChevronRight,
  Settings,
  Plus,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  PhoneMissedIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/lib/xano/auth-context';
import { Device } from '@twilio/voice-sdk';
import { apiGetCallLogs, apiGetContacts, apiStoreCallLog } from '@/lib/services/PhoneService';
import { AxiosError } from 'axios';
import useSWR from 'swr';
import { CallLog, Contact } from '@/@types/phone';
import { AddContact } from './components/AddContact';
import { ContactCard } from './components/ContactCard';
import { SettingsModal } from './components/SettingsModal';
import { ActiveCallOverlay } from './components/ActiveCallOverlay';
import { EditContact } from './components/EditContact';
import DeleteContact from './components/DeleteContact';
import { Dialer } from './components/Dialer';
import { RecentCalls } from './components/RecentCalls';
import { ContactsList } from './components/ContactsList';
import { NavigationTabs } from './components/NavigationTabs';
import { PhoneHeader } from './components/PhoneHeader';
import { CompanyRedacted } from '@/@types/company';
import { apiGetCompanyDetails } from '@/lib/services/CompanyService';

type TwilioError = {
  code: string;
  message: string;
  payload: {
    code: number;
    message: string;
    more_info: string;
    status: number;
  };
};

type TwilioResponse = {
  account_sid: string;
  annotation: string | null;
  answered_by: string | null;
  api_version: string;
  caller_name: string | null;
  date_created: string | null;
  date_updated: string | null;
  direction: string;
  duration: number | null;
  end_time: string | null;
  forwarded_from: string | null;
  from: string;
  from_formatted: string;
  group_sid: string | null;
  parent_call_sid: string | null;
  phone_number_sid: string;
  price: number | null;
  price_unit: string;
  queue_time: string;
  sid: string;
  start_time: string | null;
  status: string;
  subresource_uris: {
    events: string;
    notifications: string;
    payments: string;
    recordings: string;
    siprec: string;
    streams: string;
    transcriptions: string;
    user_defined_message_subscriptions: string;
    user_defined_messages: string;
  };
  to: string;
  to_formatted: string;
  trunk_sid: string | null;
  uri: string;
};

type ViewType = 'dialer' | 'contacts' | 'recent';
type CallFilterType = 'all' | 'missed' | 'inbound' | 'outbound';

interface PhoneModuleProps {
  className?: string;
  onExpandedChange?: (isExpanded: boolean) => void;
}

export function PhoneModule({ className, onExpandedChange }: PhoneModuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dialer');
  const [dialedNumber, setDialedNumber] = useState('');
  const [activeCall, setActiveCall] = useState<any>(null);
  const [currentCall, setCurrentCall] = useState<any>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callStatus, setCallStatus] = useState<
    '' | 'RINGING' | 'ACCEPTED' | 'DISCONNECTED' | 'CANCELLED' | 'REJECTED'
  >('');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [incomingCallTimeout, setIncomingCallTimeout] = useState<NodeJS.Timeout | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [callFilter, setCallFilter] = useState<CallFilterType>('all');
  const [isDNDEnabled, setIsDNDEnabled] = useState(false);
  const [dndStartTime, setDndStartTime] = useState<string>('');
  const [dndEndTime, setDndEndTime] = useState<string>('');
  const [leftNavExpanded, setLeftNavExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  const { token } = useAuth();
  const [twilioDevice, setTwilioDevice] = useState<Device | null>(null);
  const { user } = useUser();

  const {
    data: contactsData,
    error: contactsError,
    isLoading: contactsIsLoading,
    mutate: mutateContacts,
  } = useSWR<Contact[]>('/api:GqG2MSGo/contacts', apiGetContacts);

  const {
    data: callLogs,
    error: callLogsError,
    isLoading: callLogsIsLoading,
    mutate: mutateCallLogs,
  } = useSWR<CallLog[]>('/api:mDRLMGRq/call_logs', apiGetCallLogs);

  const {
    data: companyData,
    error: companyError,
    isLoading: companyIsLoading,
    mutate: mutateCompany,
  } = useSWR<CompanyRedacted[]>('/api:ZKUwjF5k/company_details', apiGetCompanyDetails);

  const company = companyData?.find((c: CompanyRedacted) => c.company_id === user?.company_id);

  const toggleExpanded = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    onExpandedChange?.(newExpandedState);
  };

  // Timer for active call
  useEffect(() => {
    if (!activeCall) return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCall]);

  // Debug activeCall changes
  useEffect(() => {
    console.log('ActiveCall state changed:', activeCall);
  }, [activeCall]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (incomingCallTimeout) {
        clearTimeout(incomingCallTimeout);
      }
    };
  }, [incomingCallTimeout]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    return date.toLocaleDateString();
  };

  const addDigit = (digit: string) => {
    setDialedNumber((prev) => prev + digit);
  };

  const deleteDigit = () => {
    setDialedNumber((prev) => prev.slice(0, -1));
  };

  // Initialize Twilio device
  const initializeTwilioDevice = async () => {
    if (twilioDevice) return;

    try {
      // Step 1: Get Twilio token from backend (no auth)
      const tokenResponse = await fetch(
        'https://api.mwairealty.co.ke/v1/voice/token?identity=agent',
      );

      if (!tokenResponse.ok) {
        throw new Error('Failed to get Twilio token');
      }

      const { token: twilioToken } = await tokenResponse.json();

      // Step 2: Create and register device
      const device = new Device(twilioToken, {
        logLevel: 1,
      });

      // Set up event handlers
      device.on('registered', () => {
        console.log('Twilio device registered and ready!');
      });

      device.on('error', (error) => {
        console.error('Twilio device error:', error);
      });

      device.on('incoming', async (call) => {
        console.log('Incoming call from:', call.parameters.From);
        const from = call.parameters.From;
        // Look up contact by phone number
        const contact = contactsData?.find((c: Contact) => String(c.phone_number) === String(from));

        // Store the incoming call object for later acceptance/rejection
        setIncomingCall(call);

        // Set active call for overlay display
        setActiveCall({
          phone_number: from,
          contact_name: contact?.name || 'Unknown',
          status: 'incoming',
          startTime: new Date().toISOString(),
        });

        //set up call log
        await apiStoreCallLog({
          id: 0,
          created_at: new Date().toISOString(),
          phone_number: from,
          contact_name: contact?.name || 'Unknown',
          direction: 'inbound',
          status: 'completed',
          duration: 0,
          user_id: user?.id || 0,
          contact_id: contact?.id || 0,
        });

        // Set up auto-reject timeout (30 seconds)
        const timeout = setTimeout(() => {
          console.log('Auto-rejecting incoming call after timeout');
          rejectIncomingCall();
        }, 30000);
        setIncomingCallTimeout(timeout);
      });

      // Register the device
      await device.register();
      setTwilioDevice(device);
    } catch (error) {
      console.error('Failed to initialize Twilio device:', error);
    }
  };

  useEffect(() => {
    if (token) {
      initializeTwilioDevice();
    }
  }, [token]);

  const makeCall = async (number: string) => {
    if (!twilioDevice) {
      console.error('Twilio device not ready');
      return;
    }

    setCallStatus('RINGING');

    try {
      const contact = contactsData?.find(
        (contact: Contact) => String(contact.phone_number) === String(number),
      );

      // Set active call immediately when making the call
      const activeCallData = {
        phone_number: number,
        contact_name: contact?.name || 'Unknown',
        status: 'ringing',
        startTime: new Date().toISOString(),
      };
      console.log('Setting active call:', activeCallData);
      setActiveCall(activeCallData);
      setCallDuration(0);

      // Use Twilio Voice SDK to make the call directly to phone number
      const call = await twilioDevice.connect({
        params: {
          To: number,
        },
      });

      // Store the call object for event handling
      setCurrentCall(call);

      //set up call log
      await apiStoreCallLog({
        id: 0,
        created_at: new Date().toISOString(),
        phone_number: number,
        contact_name: contact?.name || 'Unknown',
        direction: 'outbound',
        status: 'completed',
        duration: 0,
        user_id: user?.id || 0,
        contact_id: contact?.id || 0,
      });

      // Set up call event handlers
      call.on('accept', () => {
        console.log('CALL STATUS - ACCEPTED');
        setActiveCall((prev: any) => (prev ? { ...prev, status: 'in-progress' } : null));
        setCallStatus('ACCEPTED');
      });

      call.on('disconnect', () => {
        console.log('CALL STATUS - DISCONNECTED');
        setActiveCall(null);
        setCurrentCall(null);
        setCallDuration(0);
        setIsMuted(false);
        setIsOnHold(false);
        setCallStatus('DISCONNECTED');
      });

      call.on('cancel', () => {
        console.log('CALL STATUS - CANCELLED');
        setActiveCall(null);
        setCurrentCall(null);
        setCallDuration(0);
        setCallStatus('CANCELLED');
      });

      call.on('reject', () => {
        console.log('CALL STATUS - REJECTED');
        setActiveCall(null);
        setCurrentCall(null);
        setCallDuration(0);
        setCallStatus('REJECTED');
      });
    } catch (error) {
      console.error('Failed to make call:', error);
    }
  };

  const acceptIncomingCall = () => {
    if (incomingCall) {
      console.log('Accepting incoming call');

      // Clear timeout
      if (incomingCallTimeout) {
        clearTimeout(incomingCallTimeout);
        setIncomingCallTimeout(null);
      }

      // Accept the call
      incomingCall.accept();

      // Set up call event handlers for the accepted call
      incomingCall.on('accept', () => {
        console.log('INCOMING CALL ACCEPTED');
        setActiveCall((prev: any) => (prev ? { ...prev, status: 'in-progress' } : null));
        setCallStatus('ACCEPTED');
      });

      incomingCall.on('disconnect', () => {
        console.log('INCOMING CALL DISCONNECTED');
        setActiveCall(null);
        setCurrentCall(null);
        setCallDuration(0);
        setIsMuted(false);
        setIsOnHold(false);
        setCallStatus('DISCONNECTED');
      });

      // Store as current call
      setCurrentCall(incomingCall);
      setIncomingCall(null);
      setCallDuration(0);
    }
  };

  const rejectIncomingCall = () => {
    if (incomingCall) {
      console.log('Rejecting incoming call');

      // Clear timeout
      if (incomingCallTimeout) {
        clearTimeout(incomingCallTimeout);
        setIncomingCallTimeout(null);
      }

      // Reject the call
      incomingCall.reject();
      setIncomingCall(null);
      setActiveCall(null);
      setCallStatus('REJECTED');
    }
  };

  const endCall = () => {
    // Clear any incoming call timeout
    if (incomingCallTimeout) {
      clearTimeout(incomingCallTimeout);
      setIncomingCallTimeout(null);
    }

    // Disconnect the specific call if it exists
    if (currentCall) {
      currentCall.disconnect();
    }
    // Also disconnect all calls as backup
    if (twilioDevice) {
      twilioDevice.disconnectAll();
    }
    setActiveCall(null);
    setCurrentCall(null);
    setIncomingCall(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsOnHold(false);
    setDialedNumber('');
    setCallStatus('');
  };

  // Function to toggle mute using Twilio call object
  const toggleMute = () => {
    if (currentCall) {
      if (isMuted) {
        currentCall.mute(false);
        setIsMuted(false);
        console.log('Call unmuted');
      } else {
        currentCall.mute(true);
        setIsMuted(true);
        console.log('Call muted');
      }
    }
  };

  // Function to toggle hold using Twilio call object (using mute as workaround)
  const toggleHold = () => {
    if (currentCall) {
      if (isOnHold) {
        // Resume call - unmute
        currentCall.mute(false);
        setIsOnHold(false);
        console.log('Call resumed from hold');
      } else {
        // Hold call - mute
        currentCall.mute(true);
        setIsOnHold(true);
        console.log('Call placed on hold');
      }
    }
  };

  const filteredContacts =
    contactsData?.filter(
      (contact: Contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone_number.includes(searchQuery) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const filteredCallLogs =
    callLogs?.filter((log) => {
      if (callFilter === 'all') return true;
      if (callFilter === 'missed') return log.status === 'missed';
      if (callFilter === 'inbound') return log.direction === 'inbound';
      if (callFilter === 'outbound') return log.direction === 'outbound';
      return true;
    }) || [];

  const missedCallsCount = callLogs?.filter((l) => l.status === 'missed').length || 0;

  const getStatusBadge = () => {
    if (activeCall) {
      return <Badge className="bg-green-500 hover:bg-green-600 text-white">Active Call</Badge>;
    }
    return <Badge variant="outline">Online</Badge>;
  };

  return (
    <Card className={cn('w-full flex flex-col', className)}>
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors flex-row items-center space-y-0 gap-2 md:gap-3 p-3 md:p-6"
        onClick={toggleExpanded}
      >
        {/* Left Section: Icon + Title */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <div className="p-1.5 md:p-2 bg-[#C33527]/10 rounded-lg flex-shrink-0">
            <Phone className="h-4 w-4 md:h-5 md:w-5 text-[#C33527]" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm md:text-base lg:text-lg truncate">Phone</CardTitle>
            <p className="text-xs md:text-sm text-muted-foreground hidden md:block">
              AI-powered calling assistant
            </p>
          </div>
        </div>

        {/* Right Section: Status + Actions + Expand Button */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* Status info - hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 pr-6">
            <div className="flex items-center gap-1.5">
              <PhoneCall className="h-4 w-4 text-muted-foreground" />
            </div>
            {getStatusBadge()}
            <div className="flex text-sm text-muted-foreground items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {contactsData?.length}
              </div>
              <div className="flex items-center gap-1.5">
                <PhoneMissedIcon className="h-4 w-4" />
                {callLogs?.length || 0}
              </div>
            </div>
          </div>

          {/* Expand button - always visible */}
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-8 w-8 md:h-9 md:w-9 p-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0">
          {/* Mobile Layout: Stack vertically with bottom tabs */}
          <div className="flex flex-col md:hidden">
            <div className="h-[500px] w-full overflow-y-auto p-4 pb-20">
              {/* Mobile Content */}
              {currentView === 'dialer' && (
                <Dialer
                  dialedNumber={dialedNumber}
                  onDigitClick={addDigit}
                  onDelete={deleteDigit}
                  onCall={() => makeCall(dialedNumber)}
                />
              )}

              {currentView === 'contacts' && (
                <ContactsList
                  filteredContacts={filteredContacts}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onAddContact={() => setShowAddContact(true)}
                  onMakeCall={makeCall}
                  onEditContact={setEditingContact}
                  onDeleteContact={setDeletingContact}
                />
              )}

              {currentView === 'recent' && (
                <RecentCalls
                  filteredCallLogs={filteredCallLogs}
                  callFilter={callFilter}
                  onFilterChange={setCallFilter}
                  missedCallsCount={missedCallsCount}
                  formatTimestamp={formatTimestamp}
                  formatDuration={formatDuration}
                />
              )}
            </div>

            {/* Mobile Bottom Navigation */}
            <NavigationTabs
              currentView={currentView}
              onViewChange={setCurrentView}
              contactsCount={contactsData?.length || 0}
              missedCallsCount={missedCallsCount}
              isMobile={true}
            />
          </div>

          {/* Desktop Layout: Side by side with sidebar */}
          <div className="hidden md:flex h-[750px]">
            {/* Left Sidebar */}
            <div className="w-64 lg:w-80 flex-shrink-0 border-r border-border">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#C33527]/15 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#C33527]" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-base">Digital Phone</h2>
                    <p className="text-xs text-muted-foreground">Make and receive calls</p>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-center justify-between mb-2 px-2">
                  <button
                    onClick={() => setLeftNavExpanded(!leftNavExpanded)}
                    className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-[#C33527]"
                  >
                    <ChevronRight
                      className={cn('w-4 h-4 transition-transform', leftNavExpanded && 'rotate-90')}
                    />
                    Phone Menu (3)
                  </button>
                </div>

                {leftNavExpanded && (
                  <NavigationTabs
                    currentView={currentView}
                    onViewChange={setCurrentView}
                    contactsCount={contactsData?.length || 0}
                    missedCallsCount={missedCallsCount}
                    isMobile={false}
                  />
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
              <PhoneHeader
                currentView={currentView}
                contactsCount={filteredContacts?.length || 0}
                callLogsCount={filteredCallLogs?.length || 0}
                onSettingsClick={() => setShowSettings(true)}
              />

              <div className="flex-1 overflow-y-auto p-6">
                {currentView === 'dialer' && (
                  <Dialer
                    dialedNumber={dialedNumber}
                    onDigitClick={addDigit}
                    onDelete={deleteDigit}
                    onCall={() => makeCall(dialedNumber)}
                  />
                )}

                {currentView === 'contacts' && (
                  <ContactsList
                    filteredContacts={filteredContacts}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onAddContact={() => setShowAddContact(true)}
                    onMakeCall={makeCall}
                    onEditContact={setEditingContact}
                    onDeleteContact={setDeletingContact}
                  />
                )}

                {currentView === 'recent' && (
                  <RecentCalls
                    filteredCallLogs={filteredCallLogs}
                    callFilter={callFilter}
                    onFilterChange={setCallFilter}
                    missedCallsCount={missedCallsCount}
                    formatTimestamp={formatTimestamp}
                    formatDuration={formatDuration}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}

      {/* Add Contact Modal */}
      <AddContact
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
        onSuccess={() => mutateContacts()}
      />

      {/* Edit Contact Modal */}
      <EditContact
        isOpen={!!editingContact}
        contact={editingContact}
        onClose={() => setEditingContact(null)}
        onSuccess={() => {
          mutateContacts();
          setEditingContact(null);
        }}
      />

      {/* Delete Contact Modal */}
      <DeleteContact
        isOpen={!!deletingContact}
        contact={deletingContact}
        onClose={() => setDeletingContact(null)}
        onSuccess={() => {
          mutateContacts();
          setDeletingContact(null);
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        company={company}
        onSuccess={() => mutateCompany()}
      />

      {/* Active Call Overlay */}
      <ActiveCallOverlay
        activeCall={activeCall}
        callDuration={callDuration}
        isMuted={isMuted}
        isOnHold={isOnHold}
        onEndCall={endCall}
        onToggleMute={toggleMute}
        onToggleHold={toggleHold}
        onAcceptCall={acceptIncomingCall}
        onRejectCall={rejectIncomingCall}
        formatDuration={formatDuration}
      />
    </Card>
  );
}
