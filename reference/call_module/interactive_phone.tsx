import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, PhoneIncoming, PhoneOutgoing, PhoneMissed, 
         Users, Clock, Mic, MicOff, Pause, Play, X, Search, ChevronRight, Settings, ExternalLink, 
         Bell, Volume2, Save, Copy, Check, Plus, Building2, Mail, Star } from 'lucide-react';

// Mock data
const initialMockCallLogs = [
  {
    id: 1,
    phone_number: '+1 (555) 123-4567',
    contact_name: 'John Doe',
    direction: 'outbound',
    status: 'completed',
    duration: 245,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    phone_number: '+1 (555) 987-6543',
    contact_name: 'Jane Smith',
    direction: 'inbound',
    status: 'missed',
    duration: 0,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 3,
    phone_number: '+1 (555) 456-7890',
    contact_name: 'Bob Johnson',
    direction: 'outbound',
    status: 'completed',
    duration: 180,
    timestamp: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 4,
    phone_number: '+1 (555) 234-5678',
    contact_name: 'Alice Williams',
    direction: 'inbound',
    status: 'completed',
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

export default function PhoneModule() {
  const [currentView, setCurrentView] = useState('dialer');
  const [dialedNumber, setDialedNumber] = useState('');
  const [activeCall, setActiveCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [callFilter, setCallFilter] = useState('all');
  const [leftNavExpanded, setLeftNavExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [contacts, setContacts] = useState(initialMockContacts);
  const [callLogs] = useState(initialMockCallLogs);
  
  // New contact form state
  const [newContact, setNewContact] = useState({
    name: '',
    company: '',
    phone_number: '',
    email: '',
    is_favorite: false,
  });

  // Settings state
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

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    return date.toLocaleDateString();
  };

  const addDigit = (digit) => {
    setDialedNumber(prev => prev + digit);
  };

  const deleteDigit = () => {
    setDialedNumber(prev => prev.slice(0, -1));
  };

  const makeCall = (number) => {
    const contact = contacts.find(c => c.phone_number === number);
    setActiveCall({
      phone_number: number,
      contact_name: contact?.name,
      status: 'ringing',
      startTime: new Date().toISOString(),
    });
    setCallDuration(0);
    
    // Simulate call connecting after 2 seconds
    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'in-progress' } : null);
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

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNewContactChange = (key, value) => {
    setNewContact(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    alert('Settings saved successfully!');
    setShowSettings(false);
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone_number) {
      alert('Please enter at least a name and phone number');
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
    alert('Contact added successfully!');
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
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="font-semibold text-lg">Digital Phone</h1>
              <p className="text-sm text-gray-500">AI-powered calling assistant</p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            {/* Phone Menu Header */}
            <div className="flex items-center justify-between mb-2 px-2">
              <button 
                onClick={() => setLeftNavExpanded(!leftNavExpanded)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${leftNavExpanded ? 'rotate-90' : ''}`} />
                Phone Menu (3)
              </button>
            </div>

            {leftNavExpanded && (
              <div className="space-y-1">
                {/* Dial Pad */}
                <button
                  onClick={() => setCurrentView('dialer')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                    currentView === 'dialer' 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5" />
                    <span className="font-medium text-sm">Dial Pad</span>
                  </div>
                </button>

                {/* Contacts */}
                <button
                  onClick={() => setCurrentView('contacts')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                    currentView === 'contacts' 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span className="font-medium text-sm">Contacts</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    currentView === 'contacts' ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {contacts.length}
                  </span>
                </button>

                {/* Recent Calls */}
                <button
                  onClick={() => setCurrentView('recent')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                    currentView === 'recent' 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium text-sm">Recent Calls</span>
                  </div>
                  {missedCallsCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white">
                      {missedCallsCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top Bar */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h2 className="font-semibold text-xl text-gray-900">
              {currentView === 'dialer' && 'Dial Pad'}
              {currentView === 'contacts' && 'Contacts'}
              {currentView === 'recent' && 'Recent Calls'}
            </h2>
            <p className="text-sm text-gray-500">
              {currentView === 'dialer' && 'Enter a number to make a call'}
              {currentView === 'contacts' && `${filteredContacts.length} contacts available`}
              {currentView === 'recent' && `${filteredCallLogs.length} calls in history`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Online
            </div>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentView === 'dialer' && (
            <div className="max-w-md mx-auto">
              {/* Phone Number Display */}
              <div className="mb-8 text-center">
                <input
                  type="tel"
                  value={dialedNumber}
                  onChange={(e) => setDialedNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full text-center text-3xl font-light border-b-2 border-gray-300 focus:border-blue-500 outline-none py-4 font-mono"
                />
              </div>

              {/* Dial Pad */}
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
                    className="h-20 flex flex-col items-center justify-center border-2 border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <span className="text-3xl font-light">{button.digit}</span>
                    {button.letters && (
                      <span className="text-xs text-gray-500 mt-1">{button.letters}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={deleteDigit}
                  disabled={dialedNumber.length === 0}
                  className="flex-1 h-14 border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Delete
                </button>
                <button
                  onClick={() => makeCall(dialedNumber)}
                  disabled={dialedNumber.length === 0}
                  className="flex-1 h-14 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call
                </button>
              </div>
            </div>
          )}

          {currentView === 'contacts' && (
            <div>
              {/* Search Bar and Add Contact Button */}
              <div className="mb-6 max-w-2xl flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                  />
                </div>
                <button
                  onClick={() => setShowAddContact(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  Add Contact
                </button>
              </div>

              {/* Favorites */}
              {filteredContacts.filter(c => c.is_favorite).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
                    Favorites
                  </h3>
                  <div className="space-y-2">
                    {filteredContacts.filter(c => c.is_favorite).map(contact => (
                      <div key={contact.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                            {contact.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{contact.name}</p>
                            <p className="text-sm text-gray-500">{contact.company}</p>
                            <p className="text-sm text-gray-600 font-mono">{contact.phone_number}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => makeCall(contact.phone_number)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Contacts */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
                  All Contacts
                </h3>
                <div className="space-y-2">
                  {filteredContacts.filter(c => !c.is_favorite).map(contact => (
                    <div key={contact.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-lg">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          <p className="text-sm text-gray-500">{contact.company}</p>
                          <p className="text-sm text-gray-600 font-mono">{contact.phone_number}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => makeCall(contact.phone_number)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'recent' && (
            <div>
              {/* Filter Tabs */}
              <div className="flex gap-2 mb-6">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'missed', label: 'Missed', count: missedCallsCount },
                  { id: 'inbound', label: 'Incoming' },
                  { id: 'outbound', label: 'Outgoing' },
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setCallFilter(filter.id)}
                    className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                      callFilter === filter.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                    {filter.count > 0 && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        callFilter === filter.id ? 'bg-white/20' : 'bg-gray-300'
                      }`}>
                        {filter.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Call Logs */}
              <div className="space-y-2">
                {filteredCallLogs.map(log => {
                  const Icon = log.status === 'missed' ? PhoneMissed : 
                               log.direction === 'inbound' ? PhoneIncoming : PhoneOutgoing;
                  const iconColor = log.status === 'missed' ? 'text-red-500' : 
                                   log.direction === 'inbound' ? 'text-blue-500' : 'text-green-500';
                  
                  return (
                    <div key={log.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                        <div>
                          <p className="font-medium text-gray-900">{log.contact_name}</p>
                          <p className="text-sm text-gray-600 font-mono">{log.phone_number}</p>
                          <p className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          log.status === 'completed' ? 'bg-green-100 text-green-700' :
                          log.status === 'missed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {log.status}
                        </span>
                        {log.duration > 0 && (
                          <p className="text-sm text-gray-600 mt-1">{formatDuration(log.duration)}</p>
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

      {/* Add Contact Modal */}
      {showAddContact && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddContact(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Add New Contact</h2>
                  <p className="text-sm text-gray-500">Enter contact information</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddContact(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => handleNewContactChange('name', e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Company
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => handleNewContactChange('company', e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={newContact.phone_number}
                    onChange={(e) => handleNewContactChange('phone_number', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => handleNewContactChange('email', e.target.value)}
                    placeholder="john@acme.com"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Favorite Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Add to Favorites</p>
                    <p className="text-sm text-gray-500">Quick access to this contact</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNewContactChange('is_favorite', !newContact.is_favorite)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    newContact.is_favorite ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      newContact.is_favorite ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowAddContact(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContact}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowSettings(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Settings Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Phone Settings</h2>
                  <p className="text-sm text-gray-500">Manage your phone configuration</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Phone Number Section */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Phone Number</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Your Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={settings.phoneNumber}
                        onChange={(e) => handleSettingChange('phoneNumber', e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none font-mono"
                      />
                      <button
                        onClick={copyPhoneNumber}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center gap-2"
                      >
                        {copiedNumber ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="text-sm">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      This is your Twilio phone number for making and receiving calls
                    </p>
                  </div>
                </div>

                {/* Voicemail Section */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Voicemail</h3>
                  
                  {/* Enable/Disable Voicemail */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-gray-900">Enable Voicemail</p>
                      <p className="text-sm text-gray-500">Allow callers to leave voice messages</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('voicemailEnabled', !settings.voicemailEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.voicemailEnabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.voicemailEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Voicemail Greeting */}
                  {settings.voicemailEnabled && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Greeting Type
                      </label>
                      <select
                        value={settings.voicemailGreeting}
                        onChange={(e) => handleSettingChange('voicemailGreeting', e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                      >
                        <option value="default">Default Greeting</option>
                        <option value="custom">Custom Greeting</option>
                        <option value="name">Name Only</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Call Forwarding Section */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Forwarding</h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-gray-900">Forward Calls</p>
                      <p className="text-sm text-gray-500">Forward incoming calls to another number</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('callForwarding', !settings.callForwarding)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.callForwarding ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.callForwarding ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {settings.callForwarding && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Forward to Number
                      </label>
                      <input
                        type="tel"
                        value={settings.forwardNumber}
                        onChange={(e) => handleSettingChange('forwardNumber', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* Additional Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Options</h3>
                  
                  {/* Do Not Disturb */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Do Not Disturb</p>
                        <p className="text-sm text-gray-500">Block all incoming calls</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange('doNotDisturb', !settings.doNotDisturb)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.doNotDisturb ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.doNotDisturb ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Call Recording */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Call Recording</p>
                        <p className="text-sm text-gray-500">Automatically record all calls</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange('callRecording', !settings.callRecording)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.callRecording ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.callRecording ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Notification Sound */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Notification Sounds</p>
                        <p className="text-sm text-gray-500">Play sound for incoming calls</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange('notificationSound', !settings.notificationSound)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notificationSound ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notificationSound ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Call Overlay */}
      {activeCall && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={endCall}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Contact Avatar */}
            <div className="text-center mb-6">
              <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl font-semibold text-blue-600">
                  {activeCall.contact_name?.charAt(0) || '?'}
                </span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {activeCall.contact_name || activeCall.phone_number}
              </h3>
              <p className="text-gray-600 font-mono">{activeCall.phone_number}</p>
            </div>

            {/* Call Status */}
            <div className="text-center mb-8">
              <div className={`inline-block px-6 py-3 rounded-full text-lg font-medium ${
                activeCall.status === 'ringing' 
                  ? 'bg-yellow-100 text-yellow-700 animate-pulse' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {activeCall.status === 'ringing' && 'Ringing...'}
                {activeCall.status === 'in-progress' && formatDuration(callDuration)}
              </div>
            </div>

            {/* Call Controls */}
            {activeCall.status === 'in-progress' && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`h-20 flex flex-col items-center justify-center rounded-xl transition-colors ${
                    isMuted ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {isMuted ? <MicOff className="w-6 h-6 mb-1" /> : <Mic className="w-6 h-6 mb-1" />}
                  <span className="text-xs">{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>

                <button
                  onClick={() => setIsOnHold(!isOnHold)}
                  className={`h-20 flex flex-col items-center justify-center rounded-xl transition-colors ${
                    isOnHold ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {isOnHold ? <Play className="w-6 h-6 mb-1" /> : <Pause className="w-6 h-6 mb-1" />}
                  <span className="text-xs">{isOnHold ? 'Resume' : 'Hold'}</span>
                </button>

                <button className="h-20 flex flex-col items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                  <Phone className="w-6 h-6 mb-1" />
                  <span className="text-xs">Keypad</span>
                </button>
              </div>
            )}

            {/* End Call Button */}
            <button
              onClick={endCall}
              className="w-full h-16 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold text-lg flex items-center justify-center gap-3"
            >
              <PhoneOff className="w-6 h-6" />
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}