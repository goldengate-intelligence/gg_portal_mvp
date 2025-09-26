/**
 * Contact Integration Types
 *
 * Shared type definitions for contact integration modules
 */

export interface ContactLocation {
  city?: string;
  state?: string;
  country?: string;
}

export interface ContractorContact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  department: string;
  seniority: 'entry' | 'junior' | 'senior' | 'manager' | 'director' | 'vp' | 'c-level';
  email: string;
  phone?: string;
  linkedinUrl?: string;
  location?: ContactLocation;
  companyName: string;
  lastUpdated: string;
  confidence: number;
  isActive: boolean;
  notes?: string;
  profileImageUrl?: string;
  emailStatus?: 'verified' | 'unverified' | 'invalid';
  dataSources: string[];
}

export interface ContactSearchFilters {
  department?: string[];
  seniority?: string[];
  searchTerm?: string;
  minConfidence?: number;
  isActive?: boolean;
}

export interface ContactStatistics {
  totalContacts: number;
  byDepartment: Record<string, number>;
  bySeniority: Record<string, number>;
  withEmail: number;
  withPhone: number;
  avgConfidence: number;
  lastUpdated: string;
}

export interface ContactExportOptions {
  includeHeaders?: boolean;
  dateFormat?: 'ISO' | 'US' | 'EU';
  fieldDelimiter?: ',' | ';' | '\t';
  textDelimiter?: '"' | "'";
}

export interface LushaContactResponse {
  contacts: Array<{
    id?: string;
    firstName?: string;
    lastName?: string;
    title?: string;
    department?: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    confidence?: number;
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
    companyInfo?: {
      name?: string;
      domain?: string;
      employeeCount?: number;
    };
  }>;
  companyInfo?: {
    name?: string;
    domain?: string;
    employeeCount?: number;
    lastUpdated?: string;
  };
  totalFound?: number;
  searchQuery?: any;
}

export type DepartmentCategory =
  | 'Executive'
  | 'Sales'
  | 'Marketing'
  | 'Engineering'
  | 'Operations'
  | 'Finance'
  | 'HR'
  | 'Legal'
  | 'IT'
  | 'Other';

export type SeniorityLevel =
  | 'c-level'
  | 'vp'
  | 'director'
  | 'manager'
  | 'senior'
  | 'junior'
  | 'entry';