// Consolidated JSON Profile Schema
// Unified data structure that combines all contractor data sources into organized profiles

// Core data source identifiers
export type DataSource = 'snowflake' | 'lusha' | 'anthropic' | 'internal' | 'calculated';

// Cache metadata for tracking data freshness and sources
export interface CacheMetadata {
  source: DataSource;
  fetchedAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
  version: number;
  isStale: boolean;
}

// Snowflake financial and performance data
export interface SnowflakeContractorData {
  // Core identification
  uei: string;
  recipientName: string;
  entityClassification: 'Pure Prime' | 'Pure Sub' | 'Iceberg Sub' | 'Teaming Prime' | 'Hybrid';

  // Financial metrics (TTM)
  awardsTtmMillions: number;
  revenueTtmMillions: number;
  subcontractingTtmMillions: number;
  calculatedPipelineMillions: number;
  avgContractDurationMonths: number;

  // Growth metrics
  awardsTtmYoyGrowthPct?: number;
  revenueTtmYoyGrowthPct?: number;
  revenue1yrGrowthPct?: number;
  revenue2yrAvgGrowthPct?: number;
  revenue3yrAvgGrowthPct?: number;
  blendedGrowthScore?: number;

  // Industry classification
  primaryNaicsCode: string;
  primaryNaicsDescription: string;
  agencyFocus: 'Defense' | 'Civilian';
  sizeTier: 'MEGA' | 'LARGE' | 'MEDIUM' | 'SMALL';

  // Performance scores (percentiles 0-100)
  performanceScores: {
    awards: number;
    revenue: number;
    pipeline: number;
    duration: number;
    growth?: number;
    networkActivity?: number;
    composite: number;
  };

  // Peer group context
  peerGroup: {
    naicsCode: string;
    entityClassification: string;
    groupSize: number;
    marketSharePercent: number;
    rankWithinPeer: number;
    performanceTier: string; // 'Top 10%', 'Top 25%', or 'Xth percentile'
    performanceClassification: 'Elite' | 'Strong' | 'Stable' | 'Emerging' | 'Insufficient Data';
  };

  // Historical snapshots
  snapshotMonth: string;
  cache: CacheMetadata;
}

// Lusha enrichment data for company details
export interface LushaEnrichmentData {
  // Company information
  companyDetails: {
    name: string;
    domain?: string;
    website?: string;
    description?: string;
    foundedYear?: number;
    employeeCount?: number;
    annualRevenue?: number;
    industry?: string;
    companyType?: string;
  };

  // Location data
  location: {
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    zipCode?: string;
  };

  // Social media and digital presence
  digitalPresence: {
    linkedinUrl?: string;
    twitterHandle?: string;
    facebookUrl?: string;
    logoUrl?: string;
  };

  // Contact information (high-level, not personal)
  contactInfo: {
    phone?: string;
    email?: string; // General company email
    contactsAvailable: number; // Count of individual contacts available
  };

  // Technology and tools (if available)
  technologies?: string[];

  cache: CacheMetadata;
}

// AI-generated insights from Anthropic
export interface AIGeneratedInsights {
  // Performance insights
  performanceInsights: {
    strongestHeadline: string;
    strongestInsight: string;
    weakestHeadline: string;
    weakestInsight: string;
    confidenceScore: number; // 0-100
  };

  // Market positioning insights
  marketInsights?: {
    competitiveAdvantages: string[];
    marketOpportunities: string[];
    riskFactors: string[];
    strategicRecommendations: string[];
  };

  // Network analysis insights
  networkInsights?: {
    primaryRelationships: string[];
    networkStrength: 'Strong' | 'Moderate' | 'Weak';
    diversificationLevel: 'High' | 'Medium' | 'Low';
  };

  cache: CacheMetadata;
}

// Network and relationship data processed from activity events
export interface NetworkRelationshipData {
  // Distribution categories
  networkDistribution: {
    agencyDirectAwards: {
      percentage: number;
      totalValue: number;
      count: number;
    };
    primeSubAwards: {
      percentage: number;
      totalValue: number;
      count: number;
    };
    vendorProcurement: {
      percentage: number;
      totalValue: number;
      count: number;
    };
  };

  // Key relationships
  topAgencies: Array<{
    name: string;
    totalValue: number;
    percentage: number;
    contractCount: number;
  }>;

  topPrimes: Array<{
    name: string;
    uei: string;
    totalSubcontractValue: number;
    percentage: number;
    contractCount: number;
  }>;

  topSubcontractors: Array<{
    name: string;
    uei: string;
    totalValue: number;
    percentage: number;
    contractCount: number;
  }>;

  cache: CacheMetadata;
}

// Main consolidated profile structure
export interface ConsolidatedContractorProfile {
  // Core identification
  profileId: string; // Generated UUID for this profile
  uei: string;
  primaryName: string;
  alternativeNames: string[]; // DBA names, variations

  // Data completeness tracking
  dataCompleteness: {
    overall: number; // 0-100 percentage
    snowflakeData: boolean;
    lushaEnrichment: boolean;
    aiInsights: boolean;
    networkAnalysis: boolean;
  };

  // All data sources consolidated
  snowflakeData?: SnowflakeContractorData;
  lushaData?: LushaEnrichmentData;
  aiInsights?: AIGeneratedInsights;
  networkData?: NetworkRelationshipData;

  // Profile metadata
  profileMetadata: {
    createdAt: string;
    lastUpdatedAt: string;
    version: number;
    sources: DataSource[];
    refreshSchedule: {
      snowflakeRefresh: string; // Cron expression
      lushaRefresh: string;
      aiRefresh: string;
    };
  };

  // Quick access computed fields
  quickAccess: {
    displayName: string;
    primaryIndustry: string;
    sizeTier: string;
    performanceRating: string;
    lastActivityDate: string;
    totalContractValue: number;
    websiteUrl?: string;
    logoUrl?: string;
  };
}

// Profile collection structure for bulk operations
export interface ProfileCollection {
  profiles: ConsolidatedContractorProfile[];
  metadata: {
    totalProfiles: number;
    lastBulkUpdate: string;
    indexVersion: number;
    searchable: boolean;
  };
}

// Search and filter interfaces for consolidated profiles
export interface ConsolidatedProfileFilters {
  // Basic filters
  ueis?: string[];
  names?: string[];
  industries?: string[];
  sizeTiers?: string[];

  // Performance filters
  minPerformanceScore?: number;
  maxPerformanceScore?: number;
  performanceTiers?: string[];

  // Data completeness filters
  requireSnowflakeData?: boolean;
  requireLushaData?: boolean;
  requireAiInsights?: boolean;
  minDataCompleteness?: number;

  // Location filters
  states?: string[];
  countries?: string[];

  // Financial filters
  minRevenue?: number;
  maxRevenue?: number;
  minContractValue?: number;
  maxContractValue?: number;

  // Freshness filters
  maxAgeHours?: number; // Filter by data age
  excludeStale?: boolean;
}

// Service interfaces for profile management
export interface ProfileUpdateRequest {
  uei: string;
  forceRefresh?: boolean;
  refreshSources?: DataSource[];
  priority?: 'low' | 'normal' | 'high';
}

export interface ProfileBulkUpdateRequest {
  ueis: string[];
  batchSize?: number;
  refreshSources?: DataSource[];
  maxConcurrency?: number;
}

// Cache management interfaces
export interface CacheStrategy {
  defaultTtl: number; // seconds
  maxSize: number; // max number of profiles to cache
  evictionPolicy: 'lru' | 'ttl' | 'mixed';
  compressionEnabled: boolean;
}

export interface CacheStats {
  totalProfiles: number;
  cacheHitRate: number;
  averageDataAge: number;
  stalestProfileAge: number;
  freshnessDistribution: {
    fresh: number; // < 1 day
    recent: number; // 1-7 days
    stale: number; // > 7 days
  };
}