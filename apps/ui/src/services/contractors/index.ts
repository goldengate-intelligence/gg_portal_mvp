/**
 * Consolidated Contractor Services
 *
 * Unified service module combining metrics, logo, and enrichment functionality.
 * Preserves all original complexity while providing a cleaner API.
 */

// Re-export individual services for backward compatibility
export { contractorMetricsService } from './contractor-metrics-service';
export { contractorLogoService } from './contractor-logo-service';
export { lushaEnrichmentService } from './lusha-enrichment-service';

// Re-export all types
export type {
  ContractorMetrics,
  ContractorFinancialBreakdown,
  ContractorAgencyBreakdown,
} from './contractor-metrics-service';

export type {
  LogoConfig,
  LogoResponse,
} from './contractor-logo-service';

export type {
  LushaCompanyData,
  LushaEnrichmentResponse,
} from './lusha-enrichment-service';

// Unified contractor service interface
import { contractorMetricsService, type ContractorMetrics } from './contractor-metrics-service';
import { contractorLogoService, type LogoResponse } from './contractor-logo-service';
import { lushaEnrichmentService, type LushaEnrichmentResponse } from './lusha-enrichment-service';

export interface ContractorProfile {
  metrics: ContractorMetrics;
  logo: LogoResponse;
  enrichment: LushaEnrichmentResponse;
  lastUpdated: string;
}

/**
 * Unified Contractor Service
 *
 * Combines metrics, logo, and enrichment services into a single convenient API
 * while preserving access to individual services for specific use cases.
 */
export class UnifiedContractorService {
  /**
   * Get comprehensive contractor profile with metrics, logo, and enrichment data
   */
  static async getContractorProfile(uei: string, companyName?: string): Promise<ContractorProfile> {
    const [metrics, logo, enrichment] = await Promise.all([
      contractorMetricsService.getContractorMetrics(uei),
      contractorLogoService.getContractorLogo(uei, companyName),
      lushaEnrichmentService.enrichCompanyData(companyName || uei),
    ]);

    return {
      metrics,
      logo,
      enrichment,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get contractor metrics with optional logo
   */
  static async getContractorWithLogo(uei: string, companyName?: string): Promise<ContractorMetrics & { logoUrl?: string }> {
    const [metrics, logo] = await Promise.all([
      contractorMetricsService.getContractorMetrics(uei),
      contractorLogoService.getContractorLogo(uei, companyName),
    ]);

    return {
      ...metrics,
      logoUrl: logo.logoUrl || undefined,
    };
  }

  /**
   * Batch get contractor profiles for multiple UEIs
   */
  static async getBatchContractorProfiles(
    ueis: string[],
    options?: { includeLogos?: boolean; includeEnrichment?: boolean }
  ): Promise<ContractorProfile[]> {
    const { includeLogos = true, includeEnrichment = true } = options || {};

    const profilePromises = ueis.map(async (uei) => {
      const metrics = await contractorMetricsService.getContractorMetrics(uei);

      const [logo, enrichment] = await Promise.all([
        includeLogos
          ? contractorLogoService.getContractorLogo(uei, metrics.companyName)
          : Promise.resolve({ logoUrl: null, source: 'fallback' as const, quality: 'low' as const }),
        includeEnrichment
          ? lushaEnrichmentService.enrichCompanyData(metrics.companyName)
          : Promise.resolve({
              companyData: null,
              source: 'fallback' as const,
              quality: 'low' as const
            })
      ]);

      return {
        metrics,
        logo,
        enrichment,
        lastUpdated: new Date().toISOString(),
      };
    });

    return Promise.all(profilePromises);
  }

  /**
   * Clear all caches for a contractor
   */
  static async clearContractorCache(uei: string, companyName?: string): Promise<void> {
    await Promise.all([
      contractorMetricsService.clearCache(uei),
      contractorLogoService.clearCache(uei),
      companyName ? lushaEnrichmentService.clearCache(companyName) : Promise.resolve(),
    ]);
  }

  /**
   * Refresh contractor data from all sources
   */
  static async refreshContractorData(uei: string, companyName?: string): Promise<ContractorProfile> {
    // Clear caches first
    await this.clearContractorCache(uei, companyName);

    // Fetch fresh data
    return this.getContractorProfile(uei, companyName);
  }
}

// Export convenience singleton
export const unifiedContractorService = UnifiedContractorService;