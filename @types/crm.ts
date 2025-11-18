// CRM Type Definitions

export interface CrmCustomer {
  id: number;
  created_at: string;
  name: string;
  company_id: number;
}

export interface CrmContact {
  id: number;
  created_at: string;
  name: string;
  email: string;
  number: string;
  crm_customer_id: number;
  company_id: number;
  added_by: number;
  stage: 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  expected_close_date: number;
  company?: string; // From JOIN in GET response
}

export interface CrmOutreachLog {
  id: number;
  created_at: string;
  user_id: number;
  crm_contacts_id: number;
  outreach_type: 'email' | 'call' | 'meeting' | 'linkedin';
  time: number;
  direction: 'inbound' | 'outbound';
  subject: string;
  notes: string;
  outcome: 'connected' | 'no_answer' | 'left_voicemail' | 'scheduled_followup' | 'closed';
  name?: string; // From JOIN in GET response
  company?: string; // From JOIN in GET response
  customer_id?: number; // From JOIN in GET response
}

// Request payload types (without id and created_at)
export interface CreateCrmCustomerRequest {
  name: string;
  company_id: number;
}

export interface UpdateCrmCustomerRequest {
  name?: string;
  company_id?: number;
}

export interface CreateCrmContactRequest {
  name: string;
  email: string;
  number: string;
  crm_customer_id: number;
  company_id: number;
  added_by: number;
  stage: 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  expected_close_date: number;
}

export interface UpdateCrmContactRequest {
  name?: string;
  email?: string;
  number?: string;
  crm_customer_id?: number;
  company_id?: number;
  added_by?: number;
  stage?: 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  expected_close_date?: number;
}

export interface CreateCrmOutreachLogRequest {
  user_id: number;
  crm_contacts_id: number;
  outreach_type: 'email' | 'call' | 'meeting' | 'linkedin';
  time: number;
  direction: 'inbound' | 'outbound';
  subject: string;
  notes: string;
  outcome: 'connected' | 'no_answer' | 'left_voicemail' | 'scheduled_followup' | 'closed';
}

export interface UpdateCrmOutreachLogRequest {
  user_id?: number;
  crm_contacts_id?: number;
  outreach_type?: 'email' | 'call' | 'meeting' | 'linkedin';
  time?: number;
  direction?: 'inbound' | 'outbound';
  subject?: string;
  notes?: string;
  outcome?: 'connected' | 'no_answer' | 'left_voicemail' | 'scheduled_followup' | 'closed';
}

