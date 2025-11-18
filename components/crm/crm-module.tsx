'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, ChevronDown, ChevronUp, X, Building2 } from 'lucide-react';
import { useCrm } from '@/lib/xano/crm-context';
import { ContactsTable } from './contacts-table';
import { OutreachLogsTable } from './outreach-logs-table';
import { AddContactDialog } from './add-contact-dialog';
import { AddOutreachLogDialog } from './add-outreach-log-dialog';

interface CrmModuleProps {
  className?: string;
  onExpandedChange?: (isExpanded: boolean) => void;
}

export function CrmModule({ className, onExpandedChange }: CrmModuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'contacts' | 'outreach'>('contacts');
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);

  const {
    contacts,
    isLoadingContacts,
    fetchContacts,
    customers,
    fetchCustomers,
    outreachLogs,
    isLoadingLogs,
    fetchOutreachLogs,
  } = useCrm();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isExpanded) {
      // Fetch all data when module is expanded
      fetchContacts();
      fetchCustomers();
      fetchOutreachLogs();
    }
  }, [isExpanded, fetchContacts, fetchCustomers, fetchOutreachLogs]);

  const toggleExpanded = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    onExpandedChange?.(newExpandedState);
  };

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

  const getStatusBadge = () => {
    const contactCount = contacts.length;
    const logCount = outreachLogs.length;
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline">{contactCount} contacts</Badge>
        <Badge variant="outline">{logCount} logs</Badge>
      </div>
    );
  };

  const modalContent =
    isExpanded && mounted ? (
      <div
        className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm"
        onClick={toggleExpanded}
      >
        <div
          className="fixed inset-4 md:inset-8 z-[10000] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0 border-b">
              <div className="flex items-center justify-between flex-col md:flex-row gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">CRM</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Manage your contacts and outreach activities
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge()}
                  <Button variant="ghost" size="sm" onClick={toggleExpanded} className="ml-2">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
                  <TabsTrigger value="contacts">
                    <Users className="h-4 w-4 mr-2" />
                    Contacts
                  </TabsTrigger>
                  <TabsTrigger value="outreach">
                    Outreach Logs
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="contacts" className="flex-1 overflow-hidden mt-0">
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Contact Management</h3>
                      <Button onClick={() => setShowAddContact(true)}>
                        Add Contact
                      </Button>
                    </div>
                    <div className="flex-1 overflow-auto">
                      <ContactsTable
                        contacts={contacts}
                        customers={customers}
                        isLoading={isLoadingContacts}
                        onRefresh={fetchContacts}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="outreach" className="flex-1 overflow-hidden mt-0">
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Outreach Activity Logs</h3>
                      <Button onClick={() => setShowAddLog(true)}>
                        Add Log Entry
                      </Button>
                    </div>
                    <div className="flex-1 overflow-auto">
                      <OutreachLogsTable
                        logs={outreachLogs}
                        isLoading={isLoadingLogs}
                        onRefresh={fetchOutreachLogs}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    ) : null;

  return (
    <>
      <Card className={`w-full ${className}`}>
        <CardHeader
          className="cursor-pointer hover:bg-muted/50 transition-colors flex-row items-center space-y-0 gap-3 p-4 md:p-6"
          onClick={toggleExpanded}
        >
          {/* Left Section: Icon + Title */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base md:text-lg truncate">CRM</CardTitle>
              <p className="text-sm text-muted-foreground hidden md:block">
                Manage contacts and outreach
              </p>
            </div>
          </div>

          {/* Right Section: Badges + Expand Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Status info - hidden on mobile */}
            <div className="hidden md:flex items-center gap-2 pr-6">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              {getStatusBadge()}
            </div>

            {/* Expand button - always visible */}
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-9 w-9 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded();
              }}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Modal rendered via Portal to document.body */}
      {mounted && modalContent && createPortal(modalContent, document.body)}

      {/* Add Contact Dialog */}
      <AddContactDialog
        open={showAddContact}
        onClose={() => setShowAddContact(false)}
        onSuccess={() => {
          fetchContacts();
          setShowAddContact(false);
        }}
      />

      {/* Add Outreach Log Dialog */}
      <AddOutreachLogDialog
        open={showAddLog}
        onClose={() => setShowAddLog(false)}
        contacts={contacts}
        onSuccess={() => {
          fetchOutreachLogs();
          setShowAddLog(false);
        }}
      />
    </>
  );
}

