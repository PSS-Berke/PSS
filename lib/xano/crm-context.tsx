'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
  CrmContact,
  CrmCustomer,
  CrmOutreachLog,
  CreateCrmContactRequest,
  CreateCrmCustomerRequest,
  CreateCrmOutreachLogRequest,
  UpdateCrmContactRequest,
  UpdateCrmCustomerRequest,
  UpdateCrmOutreachLogRequest,
} from '@/@types/crm';
import {
  apiGetCrmContacts,
  apiCreateCrmContact,
  apiUpdateCrmContact,
  apiDeleteCrmContact,
  apiGetCrmCustomers,
  apiCreateCrmCustomer,
  apiUpdateCrmCustomer,
  apiDeleteCrmCustomer,
  apiGetCrmOutreachLogs,
  apiCreateCrmOutreachLog,
  apiUpdateCrmOutreachLog,
  apiDeleteCrmOutreachLog,
} from '@/lib/services/CrmService';

interface CrmContextType {
  // Contacts
  contacts: CrmContact[];
  isLoadingContacts: boolean;
  errorContacts: string | null;
  fetchContacts: (params?: { crm_customer_id?: number; search?: string }) => Promise<void>;
  createContact: (data: CreateCrmContactRequest) => Promise<CrmContact>;
  updateContact: (id: number, data: UpdateCrmContactRequest) => Promise<CrmContact>;
  deleteContact: (id: number) => Promise<void>;

  // Customers
  customers: CrmCustomer[];
  isLoadingCustomers: boolean;
  errorCustomers: string | null;
  fetchCustomers: () => Promise<void>;
  createCustomer: (data: CreateCrmCustomerRequest) => Promise<CrmCustomer>;
  updateCustomer: (id: number, data: UpdateCrmCustomerRequest) => Promise<CrmCustomer>;
  deleteCustomer: (id: number) => Promise<void>;

  // Outreach Logs
  outreachLogs: CrmOutreachLog[];
  isLoadingLogs: boolean;
  errorLogs: string | null;
  fetchOutreachLogs: (params?: { search?: string; crm_customer_id?: number }) => Promise<void>;
  createOutreachLog: (data: CreateCrmOutreachLogRequest) => Promise<CrmOutreachLog>;
  updateOutreachLog: (id: number, data: UpdateCrmOutreachLogRequest) => Promise<CrmOutreachLog>;
  deleteOutreachLog: (id: number) => Promise<void>;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  // Contacts state
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [errorContacts, setErrorContacts] = useState<string | null>(null);

  // Customers state
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [errorCustomers, setErrorCustomers] = useState<string | null>(null);

  // Outreach Logs state
  const [outreachLogs, setOutreachLogs] = useState<CrmOutreachLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [errorLogs, setErrorLogs] = useState<string | null>(null);

  // Contacts methods
  const fetchContacts = useCallback(
    async (params?: { crm_customer_id?: number; search?: string }) => {
      setIsLoadingContacts(true);
      setErrorContacts(null);
      try {
        const data = await apiGetCrmContacts(params);
        setContacts(data);
      } catch (error) {
        setErrorContacts(error instanceof Error ? error.message : 'Failed to fetch contacts');
        console.error('Error fetching CRM contacts:', error);
      } finally {
        setIsLoadingContacts(false);
      }
    },
    [],
  );

  const createContact = useCallback(async (data: CreateCrmContactRequest) => {
    try {
      const newContact = await apiCreateCrmContact(data);
      setContacts((prev) => [newContact, ...prev]);
      return newContact;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create contact';
      setErrorContacts(message);
      throw error;
    }
  }, []);

  const updateContact = useCallback(async (id: number, data: UpdateCrmContactRequest) => {
    try {
      const updatedContact = await apiUpdateCrmContact(id, data);
      setContacts((prev) => prev.map((c) => (c.id === id ? updatedContact : c)));
      return updatedContact;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update contact';
      setErrorContacts(message);
      throw error;
    }
  }, []);

  const deleteContact = useCallback(async (id: number) => {
    try {
      await apiDeleteCrmContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete contact';
      setErrorContacts(message);
      throw error;
    }
  }, []);

  // Customers methods
  const fetchCustomers = useCallback(async () => {
    setIsLoadingCustomers(true);
    setErrorCustomers(null);
    try {
      const data = await apiGetCrmCustomers();
      setCustomers(data);
    } catch (error) {
      setErrorCustomers(error instanceof Error ? error.message : 'Failed to fetch customers');
      console.error('Error fetching CRM customers:', error);
    } finally {
      setIsLoadingCustomers(false);
    }
  }, []);

  const createCustomer = useCallback(async (data: CreateCrmCustomerRequest) => {
    try {
      const newCustomer = await apiCreateCrmCustomer(data);
      setCustomers((prev) => [newCustomer, ...prev]);
      return newCustomer;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create customer';
      setErrorCustomers(message);
      throw error;
    }
  }, []);

  const updateCustomer = useCallback(async (id: number, data: UpdateCrmCustomerRequest) => {
    try {
      const updatedCustomer = await apiUpdateCrmCustomer(id, data);
      setCustomers((prev) => prev.map((c) => (c.id === id ? updatedCustomer : c)));
      return updatedCustomer;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update customer';
      setErrorCustomers(message);
      throw error;
    }
  }, []);

  const deleteCustomer = useCallback(async (id: number) => {
    try {
      await apiDeleteCrmCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete customer';
      setErrorCustomers(message);
      throw error;
    }
  }, []);

  // Outreach Logs methods
  const fetchOutreachLogs = useCallback(
    async (params?: { search?: string; crm_customer_id?: number }) => {
      setIsLoadingLogs(true);
      setErrorLogs(null);
      try {
        const data = await apiGetCrmOutreachLogs(params);
        setOutreachLogs(data);
      } catch (error) {
        setErrorLogs(error instanceof Error ? error.message : 'Failed to fetch outreach logs');
        console.error('Error fetching CRM outreach logs:', error);
      } finally {
        setIsLoadingLogs(false);
      }
    },
    [],
  );

  const createOutreachLog = useCallback(async (data: CreateCrmOutreachLogRequest) => {
    try {
      const newLog = await apiCreateCrmOutreachLog(data);
      setOutreachLogs((prev) => [newLog, ...prev]);
      return newLog;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create outreach log';
      setErrorLogs(message);
      throw error;
    }
  }, []);

  const updateOutreachLog = useCallback(
    async (id: number, data: UpdateCrmOutreachLogRequest) => {
      try {
        const updatedLog = await apiUpdateCrmOutreachLog(id, data);
        setOutreachLogs((prev) => prev.map((log) => (log.id === id ? updatedLog : log)));
        return updatedLog;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update outreach log';
        setErrorLogs(message);
        throw error;
      }
    },
    [],
  );

  const deleteOutreachLog = useCallback(async (id: number) => {
    try {
      await apiDeleteCrmOutreachLog(id);
      setOutreachLogs((prev) => prev.filter((log) => log.id !== id));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete outreach log';
      setErrorLogs(message);
      throw error;
    }
  }, []);

  const value: CrmContextType = {
    contacts,
    isLoadingContacts,
    errorContacts,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,

    customers,
    isLoadingCustomers,
    errorCustomers,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,

    outreachLogs,
    isLoadingLogs,
    errorLogs,
    fetchOutreachLogs,
    createOutreachLog,
    updateOutreachLog,
    deleteOutreachLog,
  };

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (context === undefined) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
}

