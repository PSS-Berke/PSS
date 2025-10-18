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
  const [callStatus, setCallStatus] = useState<
    '' | 'RINGING' | 'ACCEPTED' | 'DISCONNECTED' | 'CANCELLED' | 'REJECTED'
  >('');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [callFilter, setCallFilter] = useState<CallFilterType>('all');
  const [leftNavExpanded, setLeftNavExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);

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

      device.on('incoming', (call) => {
        console.log('Incoming call from:', call.parameters.From);
        // Handle incoming call
        setActiveCall({
          phone_number: call.parameters.From,
          contact_name: 'Unknown',
          status: 'incoming',
          startTime: new Date().toISOString(),
        });
        call.accept(); // Auto-accept for now
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
      // Use Twilio Voice SDK to make the call directly to phone number
      const call = await twilioDevice.connect({
        params: {
          To: number,
        },
      });

      // Store the call object for event handling
      setCurrentCall(call);
      const contact = contactsData?.find((contact: Contact) => contact.phone_number === number);
      //set up call log
      await apiStoreCallLog({
        id: 0,
        created_at: new Date().toISOString(),
        phone: number,
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

      setActiveCall({
        phone_number: number,
        contact_name:
          contactsData?.find((contact: Contact) => contact.phone_number === number)?.name ||
          'Unknown',
        status: 'ringing',
        startTime: new Date().toISOString(),
      });
      setCallDuration(0);
    } catch (error) {
      console.error('Failed to make call:', error);
      setCallStatus('');
    }
  };

  const endCall = () => {
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
                <Clock className="h-4 w-4" />
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
                <div className="max-w-md mx-auto">
                  <div className="mb-6 text-center">
                    <input
                      type="tel"
                      value={dialedNumber}
                      onChange={(e) => setDialedNumber(e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full text-center text-2xl font-light border-b-2 border-border focus:border-[#C33527] outline-none py-3 font-mono bg-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { digit: '1', letters: '' },
                      { digit: '2', letters: 'ABC' },
                      { digit: '3', letters: 'DEF' },
                      { digit: '4', letters: 'GHI' },
                      { digit: '5', letters: 'JKL' },
                      { digit: '6', letters: 'MNO' },
                      { digit: '7', letters: 'PQRS' },
                      { digit: '8', letters: 'TUV' },
                      { digit: '9', letters: 'WXYZ' },
                      { digit: '*', letters: '' },
                      { digit: '0', letters: '+' },
                      { digit: '#', letters: '' },
                    ].map((button) => (
                      <button
                        key={button.digit}
                        onClick={() => addDigit(button.digit)}
                        className="h-16 flex flex-col items-center justify-center border-2 border-border rounded-xl hover:bg-muted active:bg-muted/80 transition-colors"
                      >
                        <span className="text-2xl font-light">{button.digit}</span>
                        {button.letters && (
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {button.letters}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={deleteDigit}
                      disabled={dialedNumber.length === 0}
                      className="flex-1 h-12"
                    >
                      Delete
                    </Button>
                    <Button
                      onClick={() => makeCall(dialedNumber)}
                      disabled={dialedNumber.length === 0}
                      className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>
              )}

              {currentView === 'contacts' && (
                <div>
                  <div className="mb-4 flex flex-col gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10"
                      />
                    </div>
                    <Button
                      onClick={() => setShowAddContact(true)}
                      className="bg-[#C33527] hover:bg-[#DA857C] h-10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Contact
                    </Button>
                  </div>

                  {filteredContacts && filteredContacts.filter((c) => c.is_favorite).length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-2">
                        Favorites
                      </h3>
                      <div className="space-y-2">
                        {filteredContacts
                          .filter((c) => c.is_favorite)
                          .map((contact) => (
                            <ContactCard key={contact.id} contact={contact} makeCall={makeCall} />
                          ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-2">
                      All Contacts
                    </h3>
                    <div className="space-y-2">
                      {filteredContacts
                        .filter((c) => !c.is_favorite)
                        .map((contact) => (
                          <ContactCard key={contact.id} contact={contact} makeCall={makeCall} />
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {currentView === 'recent' && (
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[
                      { id: 'all' as CallFilterType, label: 'All' },
                      { id: 'missed' as CallFilterType, label: 'Missed', count: missedCallsCount },
                      { id: 'inbound' as CallFilterType, label: 'Incoming' },
                      { id: 'outbound' as CallFilterType, label: 'Outgoing' },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setCallFilter(filter.id)}
                        className={cn(
                          'px-3 py-2 rounded-lg transition-colors font-medium text-xs',
                          callFilter === filter.id
                            ? 'bg-[#C33527] text-white'
                            : 'bg-muted text-foreground hover:bg-muted/80',
                        )}
                      >
                        {filter.label}
                        {filter.count !== undefined && filter.count > 0 && (
                          <span
                            className={cn(
                              'ml-2 px-2 py-0.5 rounded-full text-xs',
                              callFilter === filter.id ? 'bg-white/20' : 'bg-background',
                            )}
                          >
                            {filter.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {filteredCallLogs.map((log) => {
                      const Icon =
                        log.status === 'missed'
                          ? PhoneMissed
                          : log.direction === 'inbound'
                            ? PhoneIncoming
                            : PhoneOutgoing;
                      const iconColor =
                        log.status === 'missed'
                          ? 'text-red-500'
                          : log.direction === 'inbound'
                            ? 'text-blue-500'
                            : 'text-green-500';

                      return (
                        <div
                          key={log.id}
                          className="flex items-center justify-between gap-3 p-3 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Icon className={cn('w-4 h-4 flex-shrink-0', iconColor)} />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm text-foreground truncate">
                                {log.contact_name}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono truncate">
                                {log.phone}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTimestamp(log.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <Badge
                              variant={log.status === 'completed' ? 'default' : 'destructive'}
                              className={cn(
                                'text-xs',
                                log.status === 'completed' &&
                                  'bg-green-100 text-green-700 hover:bg-green-100',
                              )}
                            >
                              {log.status}
                            </Badge>
                            {log.duration > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDuration(log.duration)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="border-t border-border bg-card">
              <div className="grid grid-cols-3 gap-1 p-2">
                <button
                  onClick={() => setCurrentView('dialer')}
                  className={cn(
                    'flex flex-col items-center justify-center py-2 rounded-lg transition-colors',
                    currentView === 'dialer'
                      ? 'bg-[#C33527] text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Phone className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">Dial</span>
                </button>
                <button
                  onClick={() => setCurrentView('contacts')}
                  className={cn(
                    'flex flex-col items-center justify-center py-2 rounded-lg transition-colors relative',
                    currentView === 'contacts'
                      ? 'bg-[#C33527] text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Users className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">Contacts</span>
                  <Badge
                    className="absolute top-0 right-2 h-5 min-w-5 px-1 text-[10px]"
                    variant="secondary"
                  >
                    {contactsData?.length}
                  </Badge>
                </button>
                <button
                  onClick={() => setCurrentView('recent')}
                  className={cn(
                    'flex flex-col items-center justify-center py-2 rounded-lg transition-colors relative',
                    currentView === 'recent'
                      ? 'bg-[#C33527] text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Clock className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">Recent</span>
                  {missedCallsCount > 0 && (
                    <Badge className="absolute top-0 right-2 h-5 min-w-5 px-1 text-[10px] bg-red-500 hover:bg-red-600 text-white">
                      {missedCallsCount}
                    </Badge>
                  )}
                </button>
              </div>
            </div>
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
                  <div className="space-y-1">
                    <button
                      onClick={() => setCurrentView('dialer')}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors',
                        currentView === 'dialer'
                          ? 'bg-[#C33527] text-white'
                          : 'text-foreground hover:bg-muted',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5" />
                        <span className="font-medium text-sm">Dial Pad</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setCurrentView('contacts')}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors',
                        currentView === 'contacts'
                          ? 'bg-[#C33527] text-white'
                          : 'text-foreground hover:bg-muted',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5" />
                        <span className="font-medium text-sm">Contacts</span>
                      </div>
                      <Badge
                        variant={currentView === 'contacts' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {contactsData?.length}
                      </Badge>
                    </button>

                    <button
                      onClick={() => setCurrentView('recent')}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors',
                        currentView === 'recent'
                          ? 'bg-[#C33527] text-white'
                          : 'text-foreground hover:bg-muted',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium text-sm">Recent Calls</span>
                      </div>
                      {missedCallsCount > 0 && (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
                          {missedCallsCount}
                        </Badge>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="h-16 border-b border-border flex items-center justify-between px-6">
                <div>
                  <h2 className="font-semibold text-xl text-foreground">
                    {currentView === 'dialer' && 'Dial Pad'}
                    {currentView === 'contacts' && 'Contacts'}
                    {currentView === 'recent' && 'Recent Calls'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {currentView === 'dialer' && 'Enter a number to make a call'}
                    {currentView === 'contacts' &&
                      `${filteredContacts?.length || 0} contacts available`}
                    {currentView === 'recent' &&
                      `${filteredCallLogs?.length || 0} calls in history`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Online
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Settings className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {currentView === 'dialer' && (
                  <div className="max-w-md mx-auto">
                    <div className="mb-8 text-center">
                      <input
                        type="tel"
                        value={dialedNumber}
                        onChange={(e) => setDialedNumber(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full text-center text-3xl font-light border-b-2 border-border focus:border-[#C33527] outline-none py-4 font-mono bg-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[
                        { digit: '1', letters: '' },
                        { digit: '2', letters: 'ABC' },
                        { digit: '3', letters: 'DEF' },
                        { digit: '4', letters: 'GHI' },
                        { digit: '5', letters: 'JKL' },
                        { digit: '6', letters: 'MNO' },
                        { digit: '7', letters: 'PQRS' },
                        { digit: '8', letters: 'TUV' },
                        { digit: '9', letters: 'WXYZ' },
                        { digit: '*', letters: '' },
                        { digit: '0', letters: '+' },
                        { digit: '#', letters: '' },
                      ].map((button) => (
                        <button
                          key={button.digit}
                          onClick={() => addDigit(button.digit)}
                          className="h-20 flex flex-col items-center justify-center border-2 border-border rounded-xl hover:bg-muted active:bg-muted/80 transition-colors"
                        >
                          <span className="text-3xl font-light">{button.digit}</span>
                          {button.letters && (
                            <span className="text-xs text-muted-foreground mt-1">
                              {button.letters}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={deleteDigit}
                        disabled={dialedNumber.length === 0}
                        className="flex-1 h-14"
                      >
                        Delete
                      </Button>
                      <Button
                        onClick={() => makeCall(dialedNumber)}
                        disabled={dialedNumber.length === 0}
                        className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                )}

                {currentView === 'contacts' && (
                  <div>
                    <div className="mb-6 flex gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search contacts..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-12 h-11"
                        />
                      </div>
                      <Button
                        onClick={() => setShowAddContact(true)}
                        className="bg-[#C33527] hover:bg-[#DA857C] whitespace-nowrap h-11"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Contact
                      </Button>
                    </div>

                    {filteredContacts?.filter((c: Contact) => c.is_favorite).length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-2">
                          Favorites
                        </h3>
                        <div className="space-y-2">
                          {filteredContacts
                            .filter((c) => c.is_favorite)
                            .map((contact) => (
                              <div
                                key={contact.id}
                                className="flex items-center justify-between gap-4 p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-full bg-[#C33527]/15 flex items-center justify-center text-[#C33527] font-semibold text-lg flex-shrink-0">
                                    {contact.name.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-base text-foreground truncate">
                                      {contact.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {contact.company}
                                    </p>
                                    <p className="text-sm text-foreground font-mono truncate">
                                      {contact.phone_number}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => makeCall(contact.phone_number)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Phone className="w-4 h-4 mr-1.5" />
                                  Call
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-2">
                        All Contacts
                      </h3>
                      <div className="space-y-2">
                        {filteredContacts
                          .filter((c) => !c.is_favorite)
                          .map((contact) => (
                            <div
                              key={contact.id}
                              className="flex items-center justify-between gap-4 p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-lg flex-shrink-0">
                                  {contact.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-base text-foreground truncate">
                                    {contact.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {contact.company}
                                  </p>
                                  <p className="text-sm text-foreground font-mono truncate">
                                    {contact.phone_number}
                                  </p>
                                </div>
                              </div>
                              <Button
                                onClick={() => makeCall(contact.phone_number)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Phone className="w-4 h-4 mr-1.5" />
                                Call
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentView === 'recent' && (
                  <div>
                    <div className="flex gap-2 mb-6">
                      {[
                        { id: 'all' as CallFilterType, label: 'All' },
                        {
                          id: 'missed' as CallFilterType,
                          label: 'Missed',
                          count: missedCallsCount,
                        },
                        { id: 'inbound' as CallFilterType, label: 'Incoming' },
                        { id: 'outbound' as CallFilterType, label: 'Outgoing' },
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setCallFilter(filter.id)}
                          className={cn(
                            'px-4 py-2 rounded-lg transition-colors font-medium text-sm',
                            callFilter === filter.id
                              ? 'bg-[#C33527] text-white'
                              : 'bg-muted text-foreground hover:bg-muted/80',
                          )}
                        >
                          {filter.label}
                          {filter.count !== undefined && filter.count > 0 && (
                            <span
                              className={cn(
                                'ml-2 px-2 py-0.5 rounded-full text-xs',
                                callFilter === filter.id ? 'bg-white/20' : 'bg-background',
                              )}
                            >
                              {filter.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      {filteredCallLogs.map((log) => {
                        const Icon =
                          log.status === 'missed'
                            ? PhoneMissed
                            : log.direction === 'inbound'
                              ? PhoneIncoming
                              : PhoneOutgoing;
                        const iconColor =
                          log.status === 'missed'
                            ? 'text-red-500'
                            : log.direction === 'inbound'
                              ? 'text-blue-500'
                              : 'text-green-500';

                        return (
                          <div
                            key={log.id}
                            className="flex items-center justify-between gap-4 p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <Icon className={cn('w-5 h-5 flex-shrink-0', iconColor)} />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-base text-foreground truncate">
                                  {log.contact_name}
                                </p>
                                <p className="text-sm text-muted-foreground font-mono truncate">
                                  {log.phone}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatTimestamp(log.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <Badge
                                variant={log.status === 'completed' ? 'default' : 'destructive'}
                                className={cn(
                                  'text-xs',
                                  log.status === 'completed' &&
                                    'bg-green-100 text-green-700 hover:bg-green-100',
                                )}
                              >
                                {log.status}
                              </Badge>
                              {log.duration > 0 && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {formatDuration(log.duration)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Active Call Overlay */}
      <ActiveCallOverlay
        activeCall={activeCall}
        callDuration={callDuration}
        isMuted={isMuted}
        isOnHold={isOnHold}
        onEndCall={endCall}
        onToggleMute={toggleMute}
        onToggleHold={toggleHold}
        formatDuration={formatDuration}
      />
    </Card>
  );
}
