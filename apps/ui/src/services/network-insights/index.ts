import Anthropic from '@anthropic-ai/sdk';

export interface NetworkInsight {
  contractorProfileHeadline: string; // 2-3 words like "SPECIALIZED FABRICATOR"
  contractorProfileDescription: string; // ~150 chars describing supply chain position
  agencyClientsInsight: string; // ~100 chars describing work for agencies
  primeClientsInsight: string; // ~100 chars describing work for primes
  subVendorsInsight: string; // ~100 chars describing procurement from subs
  source: 'ai' | 'cache';
  generatedAt: string;
  cacheExpiry: string;
}

export interface NetworkInsightData {
  uei: string;
  contractorName: string;
  naicsCode: string;
  naicsDescription?: string;
  primaryPSCs: string[];

  // Network relationships data
  agencyRelationships: {
    totalValue: number;
    count: number;
    topAgencies: string[];
  };
  primeRelationships: {
    totalValue: number;
    count: number;
    topPrimes: string[];
  };
  subRelationships: {
    totalValue: number;
    count: number;
    topSubs: string[];
  };

  // Overview data for context
  overviewData?: {
    businessSummary?: string;
    topNAICS?: string;
    topPSC?: string;
    totalRevenue?: number;
    totalPipeline?: number;
  };
}

// Note: Client-side caching removed - all caching handled by API for consistency
// This ensures standardized 30-day lazy revalidation across all AI insights