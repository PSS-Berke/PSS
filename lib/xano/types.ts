// Xano API Types
export interface Company {
  company_id: number;
  company_name: string;
}

export interface Module {
  id: number;
  name: string;
  is_disabled?: boolean;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  role?: boolean;
  admin?: boolean;
  company?: string;
  company_id?: number;
  company_code?: number;
  modules?: Module[];
  available_companies?: Company[];
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
  linkedin_campaigns_id: number | null;
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
  target_audience?: string;
}

export type LinkedInCampaignDetails = LinkedInCampaign & {
  post_length?: number | string | null;
};

export interface CampaignPage {
  linkedin_campaigns_id: number;
  name: string;
  records: LinkedInSession[] | string; // Can be string from JSON_AGG or parsed array
  target_audience?: string;
  additional_notes?: string;
  marketing_type?: string;
  post_length?: number;
  tone?: string;
}

// API Request/Response Types
export interface CreateCampaignParams {
  name?: string;
  additional_notes?: string;
  tone?: string;
  content_length?: number;
  marketing_type?: string;
  target_audience?: string;
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

export interface EditChatNameRequest {
  name: string;
  linkedin_sessions_id: number;
}

export interface InitiateSessionRequest {
  session_id: string;
  linkedin_campaigns_id: number | null;
}

export interface EditCampaignPayload {
  campaign_id: number;
  name: string;
  additional_notes: string;
  marketing_type: string;
  post_length: number;
  tone: string;
  target_audience: string;
}

// Social Media Copilot Types
export interface SocialPost {
  id: number;
  post_title: string;
  post_description?: string;
  rich_content_html?: string;
  rich_content_text?: string;
  content?: string;
  url_1?: string;
  url_2?: string;
  content_type: 'linkedin' | 'instagram' | 'tiktok' | 'all';
  scheduled_date: string;
  published: boolean;
  status?: 'draft' | 'approved' | 'published';
  created_at: string;
  updated_at: string;
}

export interface SocialPostPayload {
  post_title: string;
  post_description?: string;
  rich_content_html?: string;
  rich_content_text?: string;
  content: string;
  url_1?: string;
  url_2?: string;
  content_type: 'linkedin' | 'instagram' | 'tiktok' | 'all';
  scheduled_date: string;
  published?: boolean;
  status?: 'draft' | 'approved' | 'published';
}

export type SocialPostUpdatePayload = Partial<SocialPostPayload> & {
  scheduled_date?: string;
  published?: boolean;
  status?: 'draft' | 'approved' | 'published';
  content?: string;
};

// Battle Card Copilot Types
export interface BattleCard {
  id: number;
  created_at: number | string;
  competitor_name: string;
  competitor_service: string;
  company_overview: string;
  key_products_services: string;
  recent_news: string;
  target_market_icp: string;
  market_positioning: string;
  weaknesses_gaps: string;
  strengths: string;
  customer_references: string;
  user_id: number;
}

export interface CreateBattleCardRequest {
  competitor_name: string;
  service_name: string;
}

export interface BattleCardListItem {
  id: number;
  competitor_name: string;
  competitor_overview: string;
}

// Website Analytics Copilot Types
export type PlatformType = 'wix' | 'wordpress' | 'shopify' | 'google-search-console';

export type AnalyticsCategory =
  | 'overview'
  | 'analytics-tracking'
  | 'seo-content'
  | 'ecommerce'
  | 'customer-insights'
  | 'automation-tools'
  | 'settings';

export type CardContentType = 'text' | 'table' | 'code';

export interface CardContent {
  type: CardContentType;
  data: string | TableData;
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface AnalyticsCard {
  id: string;
  title: string;
  icon: string; // Icon name from lucide-react
  summary: string;
  content: CardContent;
}

export interface AnalyticsCategoryData {
  name: string;
  category: string;
  description: string;
  cards: AnalyticsCard[];
}

export interface WebsiteSite {
  id: number;
  created_at: string;
  updated_at: string;
  site_name: string;
  site_url?: string;
  platform_type: PlatformType;
  is_connected: boolean;
  last_sync_at?: string;
  user_id: number;
  company_id?: number;
}

export interface ConnectSitePayload {
  site_name: string;
  site_url?: string;
  platform_type: PlatformType;
  credentials?: Record<string, unknown>;
}

export interface AnalyticsMetrics {
  [key: string]: unknown;
}

