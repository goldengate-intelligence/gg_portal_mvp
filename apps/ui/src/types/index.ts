// Core entity types for the GoldenGate Midas Platform

// Industry Classifications (16 sectors from old UI analysis)
export type IndustrySector = 
  | 'defense'
  | 'information-technology'
  | 'construction'
  | 'professional-services'
  | 'research-development'
  | 'manufacturing'
  | 'facilities-management'
  | 'healthcare'
  | 'transportation'
  | 'environmental-services'
  | 'telecommunications'
  | 'energy'
  | 'financial-services'
  | 'education'
  | 'agriculture'
  | 'other';

// Location types
export type LocationType = 'US' | 'International';

// Contract lifecycle stages
export type LifecycleStage = 
  | 'pre-award'
  | 'active'
  | 'option-period'
  | 'expiring'
  | 'expired'
  | 'completed';

// Business momentum indicators
export type BusinessMomentum = 
  | 'high-growth'
  | 'steady-growth'
  | 'stable'
  | 'declining'
  | 'volatile';

// Ownership types
export type OwnershipType = 
  | 'public'
  | 'private'
  | 'government'
  | 'non-profit'
  | 'foreign-owned';

// Opportunity types
export type OpportunityType = 'AWD' | 'IDV'; // Awards vs Indefinite Delivery Vehicles

// Risk levels
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Analysis deployment types
export type AnalysisType = 
  | 'revenue-analytics'
  | 'forensic-due-diligence'
  | 'agency-exposure'
  | 'market-perception';

// Base contractor entity
export interface Contractor {
  id: string;
  uei: string; // Unique Entity Identifier
  name: string;
  dbaName?: string; // Doing Business As name
  industry: IndustrySector;
  location: LocationType;
  state?: string; // If US location
  country?: string; // If International location
  
  // Business metrics
  annualRevenue?: number;
  employeeCount?: number;
  foundedYear?: number;
  establishedDate?: Date; // Added for establishedDate property
  
  // Location details
  city?: string; // Added for city property
  
  // Performance indicators
  lifecycleStage: LifecycleStage;
  businessMomentum: BusinessMomentum;
  ownershipType: OwnershipType;
  growthPotential?: number; // Added for growthPotential property
  marketPosition?: number; // Added for marketPosition property
  
  // Federal contracting data
  totalContractValue?: number;
  activeContracts?: number;
  pastPerformanceScore?: number; // 0-100
  
  // Profile media
  profilePhotoUrl?: string;
  logoUrl?: string;
  website?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastVerified?: Date;
  
  // Profile-specific fields (when using aggregated profiles)
  totalUeis?: number;
  primaryAgency?: string | null;
  totalAgencies?: number;
  agencyDiversity?: number;
  totalStates?: number;
  statesList?: string[];
  primaryNaicsCode?: string | null;
  primaryNaicsDescription?: string | null;
  industryClusters?: string[];
  sizeTier?: string | null;
  performanceScore?: number | null;
  profileCompleteness?: number;
}

// Opportunity/Contract entity
export interface Opportunity {
  id: string;
  piid: string; // Procurement Instrument Identifier
  type: OpportunityType;
  
  // Basic info
  title: string;
  description: string;
  agency: string;
  subAgency?: string;
  
  // Financial details
  totalValue: number;
  baseValue?: number;
  optionValue?: number;
  
  // Timeline
  postedDate: Date;
  responseDeadline?: Date;
  startDate?: Date;
  endDate?: Date;
  expiryDate?: Date;
  
  // Classification
  naicsCode?: string;
  setAsideType?: string;
  placeOfPerformance?: string;
  
  // Assessment
  riskLevel: RiskLevel;
  competitionLevel?: 'full-open' | 'limited' | 'sole-source';
  
  // Relationships
  contractorId?: string; // If awarded
  incumbent?: string; // Current contractor
  
  // AI/Analysis data
  aiSummary?: string;
  keyRequirements?: string[];
  estimatedCompetitors?: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Portfolio management
export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  userId: string;
  organizationId: string;
  
  // Portfolio items (contractors being tracked)
  contractors: PortfolioItem[];
  
  // Portfolio metrics
  totalValue?: number;
  averageRisk?: RiskLevel;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastAnalyzed?: Date;
}

export interface PortfolioItem {
  id: string;
  contractorId: string;
  contractor: Contractor; // Full contractor data
  
  // Portfolio-specific data
  addedAt: Date;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  tags?: string[];
  
  // Tracking
  alertsEnabled: boolean;
  lastReviewed?: Date;
  
  // Custom ordering
  sortOrder: number;
}

// Analysis results
export interface AnalysisResult {
  id: string;
  type: AnalysisType;
  contractorId: string;
  userId: string;
  
  // Results data
  summary: string;
  keyFindings: string[];
  riskAssessment: RiskLevel;
  confidence: number; // 0-100
  
  // Structured results (varies by analysis type)
  metrics: Record<string, any>;
  charts?: ChartData[];
  comparisons?: ComparisonData[];
  
  // Metadata
  createdAt: Date;
  parameters: Record<string, any>; // Analysis parameters used
  executionTime: number; // milliseconds
}

// Chart data structure
export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area';
  title: string;
  description?: string;
  data: any[]; // Chart-specific data format
  config: Record<string, any>; // Chart configuration
}

// Comparison data structure
export interface ComparisonData {
  metric: string;
  target: number | string;
  peer_average: number | string;
  percentile: number;
  trend: 'up' | 'down' | 'stable';
}

// Search and filtering types
export interface SearchFilters {
  // Text search
  query?: string;
  
  // Location filters
  location: LocationType[];
  states: string[];
  
  // Industry filter
  sectors: IndustrySector[];
  
  // Financial filters
  contractValueMin?: number;
  contractValueMax?: number;
  revenueMin?: number;
  revenueMax?: number;
  
  // Business filters
  lifecycleStage: LifecycleStage[];
  businessMomentum: BusinessMomentum[];
  ownershipType: OwnershipType[];
  
  // Performance filters
  minPerformanceScore?: number;
  activeContractsMin?: number;
  
  // Date filters
  foundedAfter?: Date;
  lastVerifiedAfter?: Date;
}

// API response types
export interface SearchResponse {
  contractors: Contractor[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  filters: SearchFilters;
}

export interface OpportunitySearchResponse {
  opportunities: Opportunity[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// UI state types
export type ViewMode = 'table' | 'cards' | 'list';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

// Export types
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

export interface ExportRequest {
  format: ExportFormat;
  data: any[];
  filename?: string;
  includeHeaders?: boolean;
  customFields?: string[];
}