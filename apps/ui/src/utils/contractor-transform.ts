import type { ContractorData } from '../lib/api-client';
import type { Contractor } from '../types';

// Industry cluster mapping to UI categories
const industryMapping: Record<string, string> = {
  'Defense': 'defense',
  'Information Technology': 'information-technology',
  'Professional Services': 'professional-services',
  'Construction': 'construction',
  'Manufacturing': 'manufacturing',
  'Research and Development': 'research-development',
  'Healthcare': 'healthcare',
  'Transportation': 'transportation',
  'Agriculture': 'agriculture',
  'Energy': 'energy',
  'Education Services': 'education',
  'Financial Services': 'financial-services',
  'Environmental Services': 'environmental',
  'Telecommunications': 'telecommunications',
  'Facilities Management': 'facilities-management',
  'Other': 'other',
};

// Lifecycle stage mapping
const lifecycleMapping: Record<string, string> = {
  'Active': 'active',
  'New Entrant': 'pre-award',
  'Dormant': 'expiring',
  'Inactive': 'expired',
};

// Business momentum mapping (derived from lifecycle stage)
const momentumMapping: Record<string, string> = {
  'Active': 'steady-growth',
  'New Entrant': 'high-growth',
  'Dormant': 'declining',
  'Inactive': 'stable',
};

// Size tier to ownership mapping
const ownershipMapping: Record<string, string> = {
  'LARGE': 'public',
  'SMALL': 'private',
};

/**
 * Transform API contractor data to UI contractor format
 */
export function transformContractorData(apiData: ContractorData): Contractor {
  const totalObligatedValue = parseFloat(apiData.totalObligated) || 0;
  
  return {
    id: apiData.id,
    uei: apiData.contractorUei,
    name: apiData.contractorName,
    dbaName: apiData.contractorName, // Use same name since DBA not available
    industry: (industryMapping[apiData.industryCluster || 'Other'] || 'other') as any,
    location: (apiData.country === 'U.S.' ? 'US' : (apiData.country || 'Unknown')) as any,
    state: apiData.state || undefined,
    
    // Estimated values based on contract data
    annualRevenue: Math.round(totalObligatedValue * 0.15), // Estimate 15% of total contracts as annual revenue
    employeeCount: Math.max(100, Math.round(totalObligatedValue / 200000)), // Estimate employees based on contract value
    foundedYear: 2000, // Default since not available
    
    lifecycleStage: (lifecycleMapping[apiData.lifecycleStage || 'Active'] || 'active') as any,
    businessMomentum: (momentumMapping[apiData.lifecycleStage || 'Active'] || 'steady-growth') as any,
    ownershipType: (ownershipMapping[apiData.sizeTier || 'SMALL'] || 'private') as any,
    
    totalContractValue: totalObligatedValue,
    activeContracts: apiData.totalContracts,
    pastPerformanceScore: Math.max(80, Math.min(100, 85 + (apiData.agencyDiversity * 2))), // Score based on agency diversity
    
    createdAt: new Date(apiData.cacheCreatedAt),
    updatedAt: new Date(apiData.cacheUpdatedAt),
    lastVerified: apiData.sourceLastUpdated ? new Date(apiData.sourceLastUpdated) : new Date(apiData.cacheUpdatedAt),

    // Additional fields from API
    primaryAgency: apiData.primaryAgency,
    primaryNaicsCode: apiData.primaryNaicsCode,
    primaryNaicsDescription: apiData.primaryNaicsDescription,
    sizeTier: apiData.sizeTier,
    agencyDiversity: apiData.agencyDiversity,
  };
}

/**
 * Transform array of API contractor data to UI format
 */
export function transformContractorDataArray(apiDataArray: ContractorData[]): Contractor[] {
  return apiDataArray.map(transformContractorData);
}

/**
 * Format currency values
 */
export function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (numValue >= 1e12) {
    return `$${(numValue / 1e12).toFixed(1)}T`;
  } else if (numValue >= 1e9) {
    return `$${(numValue / 1e9).toFixed(1)}B`;
  } else if (numValue >= 1e6) {
    return `$${(numValue / 1e6).toFixed(1)}M`;
  } else if (numValue >= 1e3) {
    return `$${(numValue / 1e3).toFixed(1)}K`;
  } else {
    return `$${numValue.toFixed(0)}`;
  }
}

/**
 * Format contract count
 */
export function formatContractCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Get default filters for high-value contractors
 */
export function getHighValueContractorFilters() {
  return {
    minObligated: 10000000, // $10M minimum
    sortBy: 'totalObligated',
    sortOrder: 'desc' as const,
    limit: 24,
  };
}