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
