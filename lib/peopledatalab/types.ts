// People Data Labs API Types

// Person Enrichment Types
export interface PDLPersonProfile {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  linkedin_url: string;
  linkedin_username: string;
  linkedin_id: string;
  facebook_url: string;
  twitter_url: string;
  github_url: string;

  // Work Experience
  job_title: string;
  job_title_role: string;
  job_title_sub_role: string;
  job_title_levels: string[];
  job_company_id: string;
  job_company_name: string;
  job_company_website: string;
  job_company_size: string;
  job_company_founded: number;
  job_company_industry: string;
  job_company_linkedin_url: string;
  job_company_location_name: string;
  job_last_updated: string;
  job_start_date: string;

  // Location
  location_name: string;
  location_locality: string;
  location_metro: string;
  location_region: string;
  location_country: string;
  location_continent: string;
  location_geo: string;

  // Contact
  emails: PDLEmail[];
  phone_numbers: string[];
  mobile_phone: string;

  // Education
  education: PDLEducation[];

  // Experience
  experience: PDLExperience[];

  // Skills & Interests
  skills: string[];
  interests: string[];

  // Additional
  summary: string;
  num_sources: number;
  countries: string[];
  certifications: PDLCertification[];
}

export interface PDLEmail {
  address: string;
  type: string;
  first_seen?: string;
  last_seen?: string;
}

export interface PDLEducation {
  school: PDLSchool;
  degrees: string[];
  start_date: string;
  end_date: string;
  majors: string[];
  minors: string[];
  gpa: string;
  summary: string;
}

export interface PDLSchool {
  name: string;
  type: string;
  location: PDLLocation;
  linkedin_url: string;
  facebook_url: string;
  twitter_url: string;
  linkedin_id: string;
  website: string;
}

export interface PDLExperience {
  company: PDLCompanySummary;
  location_names: string[];
  title: PDLTitle;
  start_date: string;
  end_date: string;
  is_primary: boolean;
  summary: string;
}

export interface PDLTitle {
  name: string;
  role: string;
  sub_role: string;
  levels: string[];
}

export interface PDLCompanySummary {
  name: string;
  size: string;
  id: string;
  founded: number;
  industry: string;
  location: PDLLocation;
  linkedin_url: string;
  linkedin_id: string;
  facebook_url: string;
  twitter_url: string;
  website: string;
}

export interface PDLLocation {
  name: string;
  locality: string;
  region: string;
  metro: string;
  country: string;
  continent: string;
  street_address: string;
  address_line_2: string;
  postal_code: string;
  geo: string;
}

export interface PDLCertification {
  name: string;
  organization: string;
  start_date: string;
  end_date: string;
}

// Company Enrichment Types
export interface PDLCompanyProfile {
  id: string;
  name: string;
  display_name: string;
  size: string;
  employee_count: number;
  type: string;
  founded: number;
  industry: string;
  naics: PDLNaics[];
  sic: string[];
  location: PDLLocation;
  linkedin_url: string;
  linkedin_id: string;
  facebook_url: string;
  twitter_url: string;
  website: string;
  ticker: string;
  gics_sector: string;
  mic_exchange: string;
  summary: string;
  tags: string[];
  headline: string;
  alternative_names: string[];
  alternative_domains: string[];
  affiliated_profiles: string[];

  // Employee information
  employee_count_by_month: PDLEmployeeCount[];
  employee_growth_rate: PDLGrowthRate;
  employee_churn_rate: PDLChurnRate;

  // Funding
  funding_total: number;
  funding_stage: string;
  last_funding_date: string;

  // Technology
  technologies: string[];

  // Social media
  total_funding_raised: number;
  latest_funding_stage: string;
}

export interface PDLNaics {
  sector: string;
  subsector: string;
  industry_group: string;
  naics_industry: string;
  national_industry: string;
  code: string;
}

export interface PDLEmployeeCount {
  date: string;
  employee_count: number;
}

export interface PDLGrowthRate {
  '3_month': number;
  '6_month': number;
  '12_month': number;
  '24_month': number;
}

export interface PDLChurnRate {
  '3_month': number;
  '6_month': number;
  '12_month': number;
  '24_month': number;
}

// API Request Types
export interface PDLPersonEnrichParams {
  profile?: string;
  lid?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  location?: string;
  company?: string;
  school?: string;
  phone?: string;
  email?: string;
  pretty?: boolean;
  min_likelihood?: number;
  required?: string;
  titlecase?: boolean;
}

export interface PDLCompanyEnrichParams {
  name?: string;
  profile?: string;
  ticker?: string;
  website?: string;
  location?: string;
  locality?: string;
  region?: string;
  country?: string;
  pretty?: boolean;
  min_likelihood?: number;
  required?: string;
  size?: string;
  founded?: string;
}

// API Response Types
export interface PDLPersonEnrichResponse {
  status: number;
  data: PDLPersonProfile | null;
  likelihood: number;
}

export interface PDLCompanyEnrichResponse {
  status: number;
  data: PDLCompanyProfile | null;
  likelihood: number;
}

export interface PDLErrorResponse {
  error: {
    message: string;
    type: string;
  };
  status: number;
}
