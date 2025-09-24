/**
 * NAICS/PSC Classification Service
 *
 * Handles mapping and classification of NAICS and PSC codes using the comprehensive CSV data.
 * Provides industry categorization and business intelligence for contractor analysis.
 */

import Papa from 'papaparse';

export interface NAICSRecord {
  naics_2_char: string;
  naics_2_description: string;
  naics_3_char: string;
  naics_3_description: string;
  naics_4_char: string;
  naics_4_description: string;
  naics_5_char: string;
  naics_5_description: string;
  naics_6_char: string;
  naics_6_description: string;
  psc_2_char: string;
  psc_2_char_description: string;
  psc_3_char: string;
  psc_3_char_description: string;
  psc_4_char: string;
  psc_4_char_description: string;
  keywords: string;
  match_type: 'ai' | 'deterministic';
  processing_timestamp: string;
}

export interface IndustryClassification {
  naicsCode: string;
  naicsDescription: string;
  pscCode: string;
  pscDescription: string;
  category: string;
  subcategory: string;
  keywords: string[];
  matchType: 'ai' | 'deterministic';
}

export interface IndustrySummary {
  primaryIndustry: string;
  secondaryIndustries: string[];
  marketType: 'defense' | 'civilian' | 'mixed';
  industryTags: string[];
}

class NAICSPSCService {
  private classifications = new Map<string, IndustryClassification>();
  private naicsIndex = new Map<string, IndustryClassification[]>();
  private pscIndex = new Map<string, IndustryClassification[]>();
  private keywordIndex = new Map<string, IndustryClassification[]>();
  private loaded = false;

  constructor() {
    this.loadClassifications();
  }

  /**
   * Load classifications from CSV file
   */
  private async loadClassifications(): Promise<void> {
    try {
      // In production, this would fetch from your data source
      const csvPath = '/business_logic_documents/psc_naics_list.csv';
      const response = await fetch(csvPath);
      const csvText = await response.text();

      const parsed = Papa.parse<NAICSRecord>(csvText, {
        header: true,
        skipEmptyLines: true
      });

      parsed.data.forEach(record => {
        if (!record.naics_6_char || !record.psc_4_char) return;

        const classification: IndustryClassification = {
          naicsCode: record.naics_6_char,
          naicsDescription: record.naics_6_description,
          pscCode: record.psc_4_char,
          pscDescription: record.psc_4_char_description,
          category: this.categorizeIndustry(record.naics_2_description),
          subcategory: record.naics_3_description,
          keywords: this.parseKeywords(record.keywords),
          matchType: record.match_type
        };

        const key = `${record.naics_6_char}:${record.psc_4_char}`;
        this.classifications.set(key, classification);

        // Build indices for fast lookup
        this.addToIndex(this.naicsIndex, record.naics_6_char, classification);
        this.addToIndex(this.pscIndex, record.psc_4_char, classification);

        // Index keywords for search
        classification.keywords.forEach(keyword => {
          this.addToIndex(this.keywordIndex, keyword.toLowerCase(), classification);
        });
      });

      this.loaded = true;
      console.log(`Loaded ${this.classifications.size} industry classifications`);

    } catch (error) {
      console.error('Failed to load NAICS/PSC classifications:', error);
    }
  }

  /**
   * Get industry classification by NAICS code
   */
  getByNAICS(naicsCode: string): IndustryClassification | null {
    const classifications = this.naicsIndex.get(naicsCode);
    return classifications?.[0] || null;
  }

  /**
   * Get industry classification by PSC code
   */
  getByPSC(pscCode: string): IndustryClassification | null {
    const classifications = this.pscIndex.get(pscCode);
    return classifications?.[0] || null;
  }

  /**
   * Search industries by keyword
   */
  searchByKeyword(keyword: string): IndustryClassification[] {
    const normalizedKeyword = keyword.toLowerCase();
    const directMatches = this.keywordIndex.get(normalizedKeyword) || [];

    // Also search in descriptions for partial matches
    const partialMatches: IndustryClassification[] = [];
    this.classifications.forEach(classification => {
      if (classification.naicsDescription.toLowerCase().includes(normalizedKeyword) ||
          classification.pscDescription.toLowerCase().includes(normalizedKeyword)) {
        partialMatches.push(classification);
      }
    });

    // Combine and deduplicate
    const allMatches = [...directMatches, ...partialMatches];
    return Array.from(new Map(allMatches.map(c => [c.naicsCode + c.pscCode, c])).values());
  }

  /**
   * Get industry summary for a contractor based on their NAICS codes
   */
  getIndustrySummary(naicsCodes: string[]): IndustrySummary {
    const classifications = naicsCodes
      .map(code => this.getByNAICS(code))
      .filter((c): c is IndustryClassification => c !== null);

    if (classifications.length === 0) {
      return {
        primaryIndustry: 'Unknown',
        secondaryIndustries: [],
        marketType: 'civilian',
        industryTags: []
      };
    }

    // Determine primary industry (most common category)
    const categoryCount = new Map<string, number>();
    classifications.forEach(c => {
      categoryCount.set(c.category, (categoryCount.get(c.category) || 0) + 1);
    });

    const [primaryIndustry] = [...categoryCount.entries()].sort((a, b) => b[1] - a[1])[0];

    // Get secondary industries
    const secondaryIndustries = classifications
      .map(c => c.subcategory)
      .filter(sub => sub !== primaryIndustry)
      .slice(0, 3);

    // Determine market type based on keywords and PSC codes
    const marketType = this.determineMarketType(classifications);

    // Generate industry tags
    const allKeywords = classifications.flatMap(c => c.keywords);
    const keywordCount = new Map<string, number>();
    allKeywords.forEach(keyword => {
      keywordCount.set(keyword, (keywordCount.get(keyword) || 0) + 1);
    });

    const industryTags = [...keywordCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword]) => keyword);

    return {
      primaryIndustry,
      secondaryIndustries,
      marketType,
      industryTags
    };
  }

  /**
   * Get all classifications for a specific industry category
   */
  getByCategory(category: string): IndustryClassification[] {
    return Array.from(this.classifications.values())
      .filter(c => c.category.toLowerCase() === category.toLowerCase());
  }

  /**
   * Get industry image/icon mapping (extends existing logic)
   */
  getIndustryImage(companyName: string, naicsDescription: string): string {
    const classification = this.searchByKeyword(naicsDescription)[0];

    if (!classification) {
      return this.getDefaultIndustryImage(naicsDescription);
    }

    // Use keywords to determine appropriate image
    const keywords = classification.keywords.map(k => k.toLowerCase());

    if (keywords.some(k => ['aerospace', 'aircraft', 'aviation'].includes(k))) {
      return '/gg_industry_images/aerospace.jpg';
    }
    if (keywords.some(k => ['manufacturing', 'fabrication', 'machinery'].includes(k))) {
      return '/gg_industry_images/manufacturing.jpg';
    }
    if (keywords.some(k => ['construction', 'building', 'engineering'].includes(k))) {
      return '/gg_industry_images/construction.jpg';
    }
    if (keywords.some(k => ['technology', 'software', 'computer'].includes(k))) {
      return '/gg_industry_images/technology.jpg';
    }
    if (keywords.some(k => ['defense', 'military', 'security'].includes(k))) {
      return '/gg_industry_images/defense.jpg';
    }

    return this.getDefaultIndustryImage(naicsDescription);
  }

  /**
   * Get industry tag/badge for display
   */
  getIndustryTag(companyName: string, naicsDescription: string): string {
    const classification = this.searchByKeyword(naicsDescription)[0];

    if (!classification) {
      return this.getDefaultIndustryTag(naicsDescription);
    }

    return classification.category.toUpperCase();
  }

  /**
   * Check if service is ready
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Get classification statistics
   */
  getStats(): { total: number; categories: Record<string, number> } {
    const categoryCount: Record<string, number> = {};

    this.classifications.forEach(classification => {
      categoryCount[classification.category] = (categoryCount[classification.category] || 0) + 1;
    });

    return {
      total: this.classifications.size,
      categories: categoryCount
    };
  }

  /**
   * Private: Add classification to index
   */
  private addToIndex(
    index: Map<string, IndustryClassification[]>,
    key: string,
    classification: IndustryClassification
  ): void {
    const existing = index.get(key) || [];
    existing.push(classification);
    index.set(key, existing);
  }

  /**
   * Private: Parse keywords from CSV field
   */
  private parseKeywords(keywordStr: string): string[] {
    if (!keywordStr) return [];

    return keywordStr
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0)
      .slice(0, 10); // Limit to 10 keywords
  }

  /**
   * Private: Categorize industry based on NAICS 2-digit description
   */
  private categorizeIndustry(naics2Description: string): string {
    const desc = naics2Description.toLowerCase();

    if (desc.includes('manufacturing')) return 'Manufacturing';
    if (desc.includes('construction')) return 'Construction';
    if (desc.includes('information')) return 'Technology';
    if (desc.includes('professional') || desc.includes('technical')) return 'Professional Services';
    if (desc.includes('health')) return 'Healthcare';
    if (desc.includes('educational')) return 'Education';
    if (desc.includes('transportation')) return 'Transportation';
    if (desc.includes('administrative')) return 'Administrative Services';
    if (desc.includes('public administration')) return 'Government';

    return 'Other Services';
  }

  /**
   * Private: Determine market type based on classifications
   */
  private determineMarketType(classifications: IndustryClassification[]): 'defense' | 'civilian' | 'mixed' {
    const defenseKeywords = ['defense', 'military', 'missile', 'weapon', 'surveillance', 'security'];
    const civilianKeywords = ['healthcare', 'education', 'civilian', 'commercial'];

    let defenseCount = 0;
    let civilianCount = 0;

    classifications.forEach(c => {
      const allText = `${c.naicsDescription} ${c.pscDescription} ${c.keywords.join(' ')}`.toLowerCase();

      if (defenseKeywords.some(keyword => allText.includes(keyword))) {
        defenseCount++;
      } else if (civilianKeywords.some(keyword => allText.includes(keyword))) {
        civilianCount++;
      } else {
        civilianCount++; // Default to civilian
      }
    });

    if (defenseCount > civilianCount) return 'defense';
    if (defenseCount > 0 && civilianCount > 0) return 'mixed';
    return 'civilian';
  }

  /**
   * Private: Fallback industry image logic (from existing code)
   */
  private getDefaultIndustryImage(naicsDescription: string): string {
    const desc = naicsDescription.toLowerCase();

    if (desc.includes('aircraft') || desc.includes('aerospace')) {
      return '/gg_industry_images/aerospace.jpg';
    }
    if (desc.includes('manufacturing') || desc.includes('fabrication')) {
      return '/gg_industry_images/manufacturing.jpg';
    }
    if (desc.includes('construction') || desc.includes('building')) {
      return '/gg_industry_images/construction.jpg';
    }

    return '/gg_industry_images/default.jpg';
  }

  /**
   * Private: Fallback industry tag logic
   */
  private getDefaultIndustryTag(naicsDescription: string): string {
    const desc = naicsDescription.toLowerCase();

    if (desc.includes('manufacturing')) return 'MFG';
    if (desc.includes('construction')) return 'CONST';
    if (desc.includes('professional')) return 'PROF';
    if (desc.includes('technology')) return 'TECH';

    return 'OTHER';
  }
}

// Export singleton instance
export const naicsPscService = new NAICSPSCService();

export { NAICSPSCService };