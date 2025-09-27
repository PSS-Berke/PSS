// Xano API Types
export interface User {
  id: number;
  email: string;
  name?: string;
  company?: string;
  company_code?: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}


export interface AuthResponse {
  user: User;
  token: string;
  refresh_token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  company?: string;
  company_code?: number;
}


export interface XanoApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// LinkedIn Copilot Types
export interface LinkedInSession {
  id: number;
  created_at: number | string;
  session_id: string;
  last_activity: string | null;
  is_enabled: boolean;
  user_id: number;
  session_name: string;
  is_deleted: boolean;
  linkedin_campaigns_id: number;
}

export interface LinkedInMessage {
  id: number;
  created_at: number | string;
  session_id: string;
  role: 'user' | 'ai';
  content: string;
  user_id: number;
}

export interface LinkedInCampaign {
  id: number;
  created_at: number | string;
  name: string;
  additional_notes?: string;
  company_id: number;
  created_by: number;
  marketing_type?: string;
  post_length?: number;
  tone?: string;
}

export interface CampaignPage {
  linkedin_campaigns_id: number;
  name: string;
  records: LinkedInSession[] | string; // Can be string from JSON_AGG or parsed array
}

// API Request/Response Types
export interface CreateCampaignParams {
  name?: string;
  additional_notes?: string;
  tone?: string;
  content_length?: number;
  marketing_type?: string;
}

export interface SendMessageRequest {
  prompt: string;
}

export interface ChangeChatRequest {
  session_id: string;
}

export interface DeleteChatRequest {
  session_id: string;
}

