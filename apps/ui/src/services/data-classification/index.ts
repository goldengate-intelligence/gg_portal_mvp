/**
 * Consolidated Data Classification Services
 *
 * Unified service module combining reference data and NAICS/PSC classification.
 * Preserves all original complexity while providing a cleaner API.
 */

// Re-export individual services for backward compatibility
export { referenceDataService } from '../reference-data/reference-data-service';
export { naicsPscService } from '../classification/naics-psc-service';

// Re-export all types
export type {
  ReferenceDataRow,
  NAICSReference,
  PSCReference,
} from '../reference-data/reference-data-service';

export type {
  NAICSRecord,
  IndustryClassification,
  IndustrySummary,
} from '../classification/naics-psc-service';

// Unified classification interfaces
import { referenceDataService, type NAICSReference, type PSCReference } from '../reference-data/reference-data-service';
import { naicsPscService, type IndustryClassification, type IndustrySummary } from '../classification/naics-psc-service';

export interface ComprehensiveClassification {
  naics: {
    code: string;
    title: string;
    description: string;
    level: number;
    hierarchy: string[];
  };
  psc: {
    code: string;
    title: string;
    description: string;
    category: string;
  };
  industry: IndustryClassification;
  summary: IndustrySummary;
  references: {
    naics: NAICSReference[];
    psc: PSCReference[];
  };
}

/**
 * Unified Data Classification Service
 *
 * Combines reference data and classification services for comprehensive
 * contractor industry and procurement classification analysis.
 */
export class UnifiedDataClassificationService {
  /**
   * Get comprehensive classification for contractor
   */
  static async getComprehensiveClassification(
    naicsCode?: string,
    pscCode?: string,
    companyName?: string
  ): Promise<ComprehensiveClassification | null> {
    try {
      const [naicsRef, pscRef, industryClassification, industrySummary] = await Promise.all([
        naicsCode ? referenceDataService.getNAICSByCode(naicsCode) : null,
        pscCode ? referenceDataService.getPSCByCode(pscCode) : null,
        naicsCode ? naicsPscService.getIndustryClassification(naicsCode) : null,
        companyName ? naicsPscService.generateIndustrySummary([naicsCode || ''], companyName) : null,
      ]);

      if (!naicsRef && !pscRef) return null;

      return {
        naics: naicsRef ? {
          code: naicsRef.naics_code,
          title: naicsRef.naics_title,
          description: naicsRef.naics_description || naicsRef.naics_title,
          level: naicsRef.naics_code.length,
          hierarchy: this.buildNAICSHierarchy(naicsRef.naics_code),
        } : {
          code: '',
          title: 'Unknown',
          description: 'No NAICS classification available',
          level: 0,
          hierarchy: [],
        },
        psc: pscRef ? {
          code: pscRef.psc_code,
          title: pscRef.psc_title,
          description: pscRef.psc_description || pscRef.psc_title,
          category: pscRef.psc_category || 'Unknown',
        } : {
          code: '',
          title: 'Unknown',
          description: 'No PSC classification available',
          category: 'Unknown',
        },
        industry: industryClassification || {
          naicsCode: naicsCode || '',
          naicsDescription: naicsRef?.naics_title || 'Unknown',
          pscCode: pscCode || '',
          pscDescription: pscRef?.psc_title || 'Unknown',
          category: 'Unknown',
          subcategory: 'Unknown',
          keywords: [],
          matchType: 'deterministic',
        },
        summary: industrySummary || {
          primaryIndustry: naicsRef?.naics_title || 'Unknown',
          secondaryIndustries: [],
          marketType: 'civilian',
          industryTags: [],
        },
        references: {
          naics: naicsRef ? [naicsRef] : [],
          psc: pscRef ? [pscRef] : [],
        },
      };
    } catch (error) {
      console.error('Error getting comprehensive classification:', error);
      return null;
    }
  }

  /**
   * Search classifications by keyword
   */
  static async searchClassifications(
    keyword: string,
    options?: { includeNAICS?: boolean; includePSC?: boolean; limit?: number }
  ): Promise<{
    naics: NAICSReference[];
    psc: PSCReference[];
    combined: Array<{ type: 'naics' | 'psc'; data: NAICSReference | PSCReference; relevance: number }>;
  }> {
    const { includeNAICS = true, includePSC = true, limit = 20 } = options || {};

    const [naicsResults, pscResults] = await Promise.all([
      includeNAICS ? referenceDataService.searchNAICS(keyword) : [],
      includePSC ? referenceDataService.searchPSC(keyword) : [],
    ]);

    // Combine and rank results by relevance
    const combined = [
      ...naicsResults.map(item => ({
        type: 'naics' as const,
        data: item,
        relevance: this.calculateRelevance(keyword, item.naics_title + ' ' + (item.naics_description || '')),
      })),
      ...pscResults.map(item => ({
        type: 'psc' as const,
        data: item,
        relevance: this.calculateRelevance(keyword, item.psc_title + ' ' + (item.psc_description || '')),
      })),
    ].sort((a, b) => b.relevance - a.relevance).slice(0, limit);

    return {
      naics: naicsResults,
      psc: pscResults,
      combined,
    };
  }

  /**
   * Get industry recommendations based on company data
   */
  static async getIndustryRecommendations(
    companyName: string,
    existingNAICS?: string[],
    contractDescription?: string
  ): Promise<{
    recommended: IndustryClassification[];
    alternatives: IndustryClassification[];
    confidence: number;
  }> {
    try {
      const classifications = await naicsPscService.recommendIndustries(
        companyName,
        existingNAICS,
        contractDescription
      );

      return {
        recommended: classifications.slice(0, 3),
        alternatives: classifications.slice(3, 8),
        confidence: classifications.length > 0 ? 0.8 : 0.2,
      };
    } catch (error) {
      console.error('Error getting industry recommendations:', error);
      return {
        recommended: [],
        alternatives: [],
        confidence: 0,
      };
    }
  }

  /**
   * Build NAICS hierarchy from code
   */
  private static buildNAICSHierarchy(naicsCode: string): string[] {
    const hierarchy: string[] = [];

    // Build hierarchy from 2-digit to full code
    for (let i = 2; i <= naicsCode.length; i += 1) {
      if (i <= 6) { // NAICS codes are max 6 digits
        hierarchy.push(naicsCode.substring(0, i));
      }
    }

    return hierarchy;
  }

  /**
   * Calculate relevance score for search results
   */
  private static calculateRelevance(keyword: string, text: string): number {
    const keywordLower = keyword.toLowerCase();
    const textLower = text.toLowerCase();

    // Exact match gets highest score
    if (textLower.includes(keywordLower)) {
      return 1.0;
    }

    // Word boundary matches
    const words = keywordLower.split(/\s+/);
    const textWords = textLower.split(/\s+/);
    let matches = 0;

    for (const word of words) {
      if (textWords.some(textWord => textWord.includes(word))) {
        matches++;
      }
    }

    return matches / words.length;
  }

  /**
   * Clear all classification caches
   */
  static async clearClassificationCache(): Promise<void> {
    await Promise.all([
      referenceDataService.clearCache?.(),
      naicsPscService.clearCache?.(),
    ].filter(Boolean));
  }
}

// Export convenience singleton
export const unifiedDataClassificationService = UnifiedDataClassificationService;