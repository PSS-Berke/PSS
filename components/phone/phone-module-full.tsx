'use client';

import React, { useState, useEffect } from 'react';
import {
  Phone, PhoneOff, PhoneIncoming, PhoneOutgoing, PhoneMissed,
  Users, Clock, Mic, MicOff, Pause, Play, X, Search, ChevronRight, Settings,
  Plus, Building2, Mail, Star, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Mock data
const initialMockCallLogs = [
  {
    id: 1,
    phone_number: '+1 (555) 123-4567',
    contact_name: 'John Doe',
    direction: 'outbound' as const,
    status: 'completed' as const,
    duration: 245,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    phone_number: '+1 (555) 987-6543',
    contact_name: 'Jane Smith',
    direction: 'inbound' as const,
    status: 'missed' as const,
    duration: 0,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 3,
    phone_number: '+1 (555) 456-7890',
    contact_name: 'Bob Johnson',
    direction: 'outbound' as const,
    status: 'completed' as const,
    duration: 180,
    timestamp: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 4,
    phone_number: '+1 (555) 234-5678',
    contact_name: 'Alice Williams',
    direction: 'inbound' as const,
    status: 'completed' as const,
    duration: 320,
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
];

const initialMockContacts = [
  { id: 1, name: 'John Doe', company: 'Acme Corp', phone_number: '+1 (555) 123-4567', email: 'john@acme.com', is_favorite: true },
  { id: 2, name: 'Jane Smith', company: 'Tech Inc', phone_number: '+1 (555) 987-6543', email: 'jane@tech.com', is_favorite: true },
  { id: 3, name: 'Bob Johnson', company: 'StartupXYZ', phone_number: '+1 (555) 456-7890', email: 'bob@startup.com', is_favorite: false },
  { id: 4, name: 'Alice Williams', company: 'Enterprise Co', phone_number: '+1 (555) 234-5678', email: 'alice@enterprise.com', is_favorite: false },
  { id: 5, name: 'Charlie Brown', company: 'Design Studio', phone_number: '+1 (555) 345-6789', email: 'charlie@design.com', is_favorite: false },
];

type ViewType = 'dialer' | 'contacts' | 'recent';
type CallFilterType = 'all' | 'missed' | 'inbound' | 'outbound';

export function PhoneModuleFull() {
  const [currentView, setCurrentView] = useState<ViewType>('dialer');
  const [dialedNumber, setDialedNumber] = useState('');
  const [activeCall, setActiveCall] = useState<any>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [callFilter, setCallFilter] = useState<CallFilterType>('all');
  const [leftNavExpanded, setLeftNavExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [contacts, setContacts] = useState(initialMockContacts);
  const [callLogs] = useState(initialMockCallLogs);

  const [newContact, setNewContact] = useState({
    name: '',
    company: '',
    phone_number: '',
    email: '',
    is_favorite: false,
  });

  const [settings, setSettings] = useState({
    phoneNumber: '+1 (555) 900-1234',
    voicemailEnabled: true,
    voicemailGreeting: 'default',
    callForwarding: false,
    forwardNumber: '',
    doNotDisturb: false,
    callRecording: false,
    notificationSound: true,
  });

  // Timer for active call
  useEffect(() => {
    if (!activeCall) return;

    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
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
    setDialedNumber(prev => prev + digit);
  };

  const deleteDigit = () => {
    setDialedNumber(prev => prev.slice(0, -1));
  };

  const makeCall = (number: string) => {
    const contact = contacts.find(c => c.phone_number === number);
    setActiveCall({
      phone_number: number,
      contact_name: contact?.name,
      status: 'ringing',
      startTime: new Date().toISOString(),
    });
    setCallDuration(0);

    setTimeout(() => {
      setActiveCall((prev: any) => prev ? { ...prev, status: 'in-progress' } : null);
    }, 2000);
  };

  const endCall = () => {
    setActiveCall(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsOnHold(false);
    setDialedNumber('');
  };

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText(settings.phoneNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNewContactChange = (key: string, value: any) => {
    setNewContact(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    setShowSettings(false);
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone_number) {
      return;
    }

    const contactToAdd = {
      id: Date.now(),
      ...newContact,
    };

    setContacts(prev => [...prev, contactToAdd]);
    setNewContact({
      name: '',
      company: '',
      phone_number: '',
      email: '',
      is_favorite: false,
    });
    setShowAddContact(false);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone_number.includes(searchQuery) ||
    contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCallLogs = callLogs.filter(log => {
    if (callFilter === 'all') return true;
    if (callFilter === 'missed') return log.status === 'missed';
    if (callFilter === 'inbound') return log.direction === 'inbound';
    if (callFilter === 'outbound') return log.direction === 'outbound';
    return true;
  });

  const missedCallsCount = callLogs.filter(l => l.status === 'missed').length;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)] bg-background">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#C33527]/15 p-2">
            <Phone className="h-5 w-5 md:h-6 md:w-6 text-[#C33527]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Phone</h1>
            <p className="hidden md:block text-sm text-muted-foreground mt-1">
              AI-powered calling assistant
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row gap-0 md:gap-6 border border-border rounded-xl overflow-hidden bg-card">
        {/* Left Sidebar - Desktop Only */}
        <div className="hidden md:flex md:w-64 lg:w-80 bg-card border-r border-border flex-col">
          {/* Sidebar Header */}
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

          {/* Navigation Sections */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex items-center justify-between mb-2 px-2">
              <button
                onClick={() => setLeftNavExpanded(!leftNavExpanded)}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-[#C33527]"
              >
                <ChevronRight className={cn('w-4 h-4 transition-transform', leftNavExpanded && 'rotate-90')} />
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
                      : 'text-foreground hover:bg-muted'
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
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span className="font-medium text-sm">Contacts</span>
                  </div>
                  <Badge variant={currentView === 'contacts' ? 'secondary' : 'outline'} className="text-xs">
                    {contacts.length}
                  </Badge>
                </button>

                <button
                  onClick={() => setCurrentView('recent')}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors',
                    currentView === 'recent'
                      ? 'bg-[#C33527] text-white'
                      : 'text-foreground hover:bg-muted'
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

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="h-14 md:h-16 border-b border-border flex items-center justify-between px-4 md:px-6">
            <div>
              <h2 className="font-semibold text-lg md:text-xl text-foreground">
                {currentView === 'dialer' && 'Dial Pad'}
                {currentView === 'contacts' && 'Contacts'}
                {currentView === 'recent' && 'Recent Calls'}
              </h2>
              <p className="hidden md:block text-xs md:text-sm text-muted-foreground">
                {currentView === 'dialer' && 'Enter a number to make a call'}
                {currentView === 'contacts' && `${filteredContacts.length} contacts available`}
                {currentView === 'recent' && `${filteredCallLogs.length} calls in history`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="hidden sm:inline">Online</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="h-8 w-8 p-0"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
            {currentView === 'dialer' && (
              <div className="max-w-md mx-auto">
                <div className="mb-6 md:mb-8 text-center">
                  <input
                    type="tel"
                    value={dialedNumber}
                    onChange={(e) => setDialedNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full text-center text-2xl md:text-3xl font-light border-b-2 border-border focus:border-[#C33527] outline-none py-3 md:py-4 font-mono bg-transparent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
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
                      className="h-16 md:h-20 flex flex-col items-center justify-center border-2 border-border rounded-xl hover:bg-muted active:bg-muted/80 transition-colors"
                    >
                      <span className="text-2xl md:text-3xl font-light">{button.digit}</span>
                      {button.letters && (
                        <span className="text-xs text-muted-foreground mt-0.5 md:mt-1">{button.letters}</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 md:gap-4">
                  <Button
                    variant="outline"
                    onClick={deleteDigit}
                    disabled={dialedNumber.length === 0}
                    className="flex-1 h-12 md:h-14"
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={() => makeCall(dialedNumber)}
                    disabled={dialedNumber.length === 0}
                    className="flex-1 h-12 md:h-14 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Phone className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
            )}

            {currentView === 'contacts' && (
              <div>
                <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 md:pl-12 h-10 md:h-11"
                    />
                  </div>
                  <Button
                    onClick={() => setShowAddContact(true)}
                    className="bg-[#C33527] hover:bg-[#DA857C] whitespace-nowrap h-10 md:h-11"
                  >
                    <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Add Contact
                  </Button>
                </div>

                {filteredContacts.filter(c => c.is_favorite).length > 0 && (
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-2">
                      Favorites
                    </h3>
                    <div className="space-y-2">
                      {filteredContacts.filter(c => c.is_favorite).map(contact => (
                        <div key={contact.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 md:p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#C33527]/15 flex items-center justify-center text-[#C33527] font-semibold text-base md:text-lg flex-shrink-0">
                              {contact.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm md:text-base text-foreground truncate">{contact.name}</p>
                              <p className="text-xs md:text-sm text-muted-foreground truncate">{contact.company}</p>
                              <p className="text-xs md:text-sm text-foreground font-mono truncate">{contact.phone_number}</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => makeCall(contact.phone_number)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                          >
                            <Phone className="w-3.5 h-3.5 mr-1.5" />
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
                    {filteredContacts.filter(c => !c.is_favorite).map(contact => (
                      <div key={contact.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 md:p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-base md:text-lg flex-shrink-0">
                            {contact.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm md:text-base text-foreground truncate">{contact.name}</p>
                            <p className="text-xs md:text-sm text-muted-foreground truncate">{contact.company}</p>
                            <p className="text-xs md:text-sm text-foreground font-mono truncate">{contact.phone_number}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => makeCall(contact.phone_number)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                        >
                          <Phone className="w-3.5 h-3.5 mr-1.5" />
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
                <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                  {[
                    { id: 'all' as CallFilterType, label: 'All' },
                    { id: 'missed' as CallFilterType, label: 'Missed', count: missedCallsCount },
                    { id: 'inbound' as CallFilterType, label: 'Incoming' },
                    { id: 'outbound' as CallFilterType, label: 'Outgoing' },
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setCallFilter(filter.id)}
                      className={cn(
                        'px-3 md:px-4 py-2 rounded-lg transition-colors font-medium text-xs md:text-sm',
                        callFilter === filter.id
                          ? 'bg-[#C33527] text-white'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      )}
                    >
                      {filter.label}
                      {filter.count !== undefined && filter.count > 0 && (
                        <span className={cn(
                          'ml-2 px-2 py-0.5 rounded-full text-xs',
                          callFilter === filter.id ? 'bg-white/20' : 'bg-background'
                        )}>
                          {filter.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {filteredCallLogs.map(log => {
                    const Icon = log.status === 'missed' ? PhoneMissed :
                                 log.direction === 'inbound' ? PhoneIncoming : PhoneOutgoing;
                    const iconColor = log.status === 'missed' ? 'text-red-500' :
                                     log.direction === 'inbound' ? 'text-blue-500' : 'text-green-500';

                    return (
                      <div key={log.id} className="flex items-center justify-between gap-3 p-3 md:p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                          <Icon className={cn('w-4 h-4 md:w-5 md:h-5 flex-shrink-0', iconColor)} />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm md:text-base text-foreground truncate">{log.contact_name}</p>
                            <p className="text-xs md:text-sm text-muted-foreground font-mono truncate">{log.phone_number}</p>
                            <p className="text-xs text-muted-foreground">{formatTimestamp(log.timestamp)}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge variant={log.status === 'completed' ? 'default' : 'destructive'} className={cn(
                            'text-xs',
                            log.status === 'completed' && 'bg-green-100 text-green-700 hover:bg-green-100'
                          )}>
                            {log.status}
                          </Badge>
                          {log.duration > 0 && (
                            <p className="text-xs md:text-sm text-muted-foreground mt-1">{formatDuration(log.duration)}</p>
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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="grid grid-cols-3 gap-1 p-2">
          <button
            onClick={() => setCurrentView('dialer')}
            className={cn(
              'flex flex-col items-center justify-center py-2 rounded-lg transition-colors',
              currentView === 'dialer'
                ? 'bg-[#C33527] text-white'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Users className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Contacts</span>
            <Badge className="absolute top-0 right-2 h-5 min-w-5 px-1 text-[10px]" variant="secondary">
              {contacts.length}
            </Badge>
          </button>
          <button
            onClick={() => setCurrentView('recent')}
            className={cn(
              'flex flex-col items-center justify-center py-2 rounded-lg transition-colors relative',
              currentView === 'recent'
                ? 'bg-[#C33527] text-white'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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

      {/* Add Contact Modal */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#C33527]/15 flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#C33527]" />
              </div>
              <div>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>Enter contact information</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-2">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  value={newContact.name}
                  onChange={(e) => handleNewContactChange('name', e.target.value)}
                  placeholder="John Doe"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company" className="text-sm font-medium">Company</Label>
              <div className="relative mt-2">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="company"
                  type="text"
                  value={newContact.company}
                  onChange={(e) => handleNewContactChange('company', e.target.value)}
                  placeholder="Acme Corp"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={newContact.phone_number}
                  onChange={(e) => handleNewContactChange('phone_number', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="pl-10 font-mono"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => handleNewContactChange('email', e.target.value)}
                  placeholder="john@acme.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Add to Favorites</p>
                  <p className="text-xs text-muted-foreground">Quick access to this contact</p>
                </div>
              </div>
              <button
                onClick={() => handleNewContactChange('is_favorite', !newContact.is_favorite)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  newContact.is_favorite ? 'bg-[#C33527]' : 'bg-border'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    newContact.is_favorite ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddContact(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddContact}
              className="w-full sm:w-auto bg-[#C33527] hover:bg-[#DA857C]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#C33527]/15 flex items-center justify-center">
                <Settings className="w-5 h-5 text-[#C33527]" />
              </div>
              <div>
                <DialogTitle>Phone Settings</DialogTitle>
                <DialogDescription>Configure your phone preferences</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Your Phone Number</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={settings.phoneNumber}
                  onChange={(e) => handleSettingChange('phoneNumber', e.target.value)}
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyPhoneNumber}
                  className="flex-shrink-0"
                >
                  {copiedNumber ? <Check className="w-4 h-4" /> : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div>
                <p className="font-medium text-sm">Voicemail</p>
                <p className="text-xs text-muted-foreground">Enable voicemail for missed calls</p>
              </div>
              <button
                onClick={() => handleSettingChange('voicemailEnabled', !settings.voicemailEnabled)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  settings.voicemailEnabled ? 'bg-[#C33527]' : 'bg-border'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    settings.voicemailEnabled ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div>
                <p className="font-medium text-sm">Do Not Disturb</p>
                <p className="text-xs text-muted-foreground">Block incoming calls</p>
              </div>
              <button
                onClick={() => handleSettingChange('doNotDisturb', !settings.doNotDisturb)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  settings.doNotDisturb ? 'bg-[#C33527]' : 'bg-border'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    settings.doNotDisturb ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div>
                <p className="font-medium text-sm">Call Recording</p>
                <p className="text-xs text-muted-foreground">Record all calls automatically</p>
              </div>
              <button
                onClick={() => handleSettingChange('callRecording', !settings.callRecording)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  settings.callRecording ? 'bg-[#C33527]' : 'bg-border'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    settings.callRecording ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={saveSettings} className="w-full sm:w-auto bg-[#C33527] hover:bg-[#DA857C]">
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active Call Overlay */}
      {activeCall && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-sm w-full text-center">
            <div className="mb-8">
              <div className={cn(
                'w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl md:text-5xl font-semibold',
                activeCall.status === 'ringing' ? 'bg-[#C33527] animate-pulse' : 'bg-[#C33527]'
              )}>
                {activeCall.contact_name ? activeCall.contact_name.charAt(0) : '?'}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{activeCall.contact_name || 'Unknown'}</h2>
              <p className="text-base md:text-lg text-muted-foreground font-mono mb-2">{activeCall.phone_number}</p>
              <p className="text-sm md:text-base text-muted-foreground capitalize">
                {activeCall.status === 'ringing' ? 'Calling...' : formatDuration(callDuration)}
              </p>
            </div>

            {activeCall.status === 'in-progress' && (
              <div className="flex justify-center gap-4 md:gap-6 mb-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full p-0"
                >
                  {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsOnHold(!isOnHold)}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full p-0"
                >
                  {isOnHold ? <Play className="w-5 h-5 md:w-6 md:h-6" /> : <Pause className="w-5 h-5 md:w-6 md:h-6" />}
                </Button>
              </div>
            )}

            <Button
              onClick={endCall}
              size="lg"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 hover:bg-red-700 text-white p-0 mx-auto"
            >
              <PhoneOff className="w-6 h-6 md:w-8 md:h-8" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
