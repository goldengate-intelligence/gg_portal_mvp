import type { ContractorProfile } from '../services/api-client';
import type { Contractor } from '../types';

/**
 * Transform API contractor profile data to UI contractor format
 */
export function transformContractorProfile(profile: ContractorProfile): Contractor {
  const totalObligatedValue = parseFloat(profile.totalObligated) || 0;
  const totalContracts = profile.totalContracts || 0;
  
  // Map lifecycle stage
  const lifecycleStageMap: Record<string, string> = {
    'Active': 'active',
    'New Entrant': 'pre-award',
    'Dormant': 'expiring',
    'Inactive': 'expired',
    'Established': 'active',
  };
  
  // Map size tier to ownership type
  const ownershipMap: Record<string, string> = {
    'MEGA': 'public',
    'LARGE': 'public',
    'MEDIUM': 'private',
    'SMALL': 'private',
  };
  
  // Determine business momentum based on performance score
  let businessMomentum = 'steady-growth';
  if (profile.performanceScore && profile.performanceScore > 80) {
    businessMomentum = 'high-growth';
  } else if (profile.performanceScore && profile.performanceScore < 40) {
    businessMomentum = 'declining';
  }
  
  // Map industry cluster
  const industryMap: Record<string, string> = {
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
  
  return {
    id: profile.id,
    uei: `PROFILE-${profile.totalUeis}`, // Indicate this is a profile with multiple UEIs
    name: profile.displayName,
    dbaName: profile.displayName,
    industry: (industryMap[profile.primaryIndustryCluster || 'Other'] || 'other') as any,
    location: (profile.statesList?.length > 0 ? 'US' : 'Unknown') as any,
    state: profile.headquartersState || undefined,
    
    // Estimated values based on contract data
    annualRevenue: Math.round(totalObligatedValue * 0.15), // Estimate 15% of total contracts as annual revenue
    employeeCount: Math.max(100, Math.round(totalObligatedValue / 200000)), // Estimate employees based on contract value
    foundedYear: 2000, // Default since not available
    
    lifecycleStage: (lifecycleStageMap[profile.dominantLifecycleStage || 'Active'] || 'active') as any,
    businessMomentum: businessMomentum as any,
    ownershipType: (ownershipMap[profile.dominantSizeTier || 'SMALL'] || 'private') as any,
    
    totalContractValue: totalObligatedValue,
    activeContracts: totalContracts,
    pastPerformanceScore: profile.performanceScore || 85,
    
    createdAt: new Date(profile.profileCreatedAt),
    updatedAt: new Date(profile.profileUpdatedAt),
    lastVerified: new Date(profile.profileUpdatedAt),

    // Additional profile-specific fields
    totalUeis: profile.totalUeis,
    primaryAgency: profile.primaryAgency,
    totalAgencies: profile.totalAgencies,
    agencyDiversity: profile.agencyDiversity,
    totalStates: profile.totalStates,
    statesList: profile.statesList,
    primaryNaicsCode: profile.primaryNaicsCode,
    primaryNaicsDescription: profile.primaryNaicsDescription,
    industryClusters: profile.industryClusters,
    sizeTier: profile.dominantSizeTier,
    performanceScore: profile.performanceScore,
    profileCompleteness: profile.profileCompleteness,
  };
}

/**
 * Transform array of API contractor profile data to UI format
 */
export function transformContractorProfileArray(profiles: ContractorProfile[]): Contractor[] {
  return profiles.map(transformContractorProfile);
}

/**
 * Format large numbers with appropriate units
 */
export function formatLargeNumber(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (numValue >= 1e15) {
    return `${(numValue / 1e15).toFixed(1)}Q`; // Quadrillion
  } else if (numValue >= 1e12) {
    return `${(numValue / 1e12).toFixed(1)}T`; // Trillion
  } else if (numValue >= 1e9) {
    return `${(numValue / 1e9).toFixed(1)}B`; // Billion
  } else if (numValue >= 1e6) {
    return `${(numValue / 1e6).toFixed(1)}M`; // Million
  } else if (numValue >= 1e3) {
    return `${(numValue / 1e3).toFixed(1)}K`; // Thousand
  } else {
    return numValue.toFixed(0);
  }
}

/**
 * Format currency values with proper units
 */
export function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (numValue >= 1e15) {
    return `$${(numValue / 1e15).toFixed(1)}Q`;
  } else if (numValue >= 1e12) {
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
 * Get profile completeness color
 */
export function getCompletenessColor(completeness: number): string {
  if (completeness >= 80) return 'text-green-500';
  if (completeness >= 60) return 'text-yellow-500';
  if (completeness >= 40) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Get performance score color
 */
export function getPerformanceColor(score: number | null): string {
  if (!score) return 'text-gray-500';
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}