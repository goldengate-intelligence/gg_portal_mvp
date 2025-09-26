/**
 * Industry Image Matching Service
 *
 * Sophisticated matching system to select the most relevant industry image
 * for each contractor based on extensive tag analysis.
 */

export * from './industry-tags';
export * from './contractor-data-extractor';

import { getBestMatchingIndustryImage, getMatchingIndustryImages } from './industry-tags';
import { extractContractorData } from './contractor-data-extractor';

/**
 * Main service class for industry image matching
 */
export class IndustryImageMatchingService {
  /**
   * Get the best matching industry image for a contractor
   */
  static getBestImageForContractor(contractor: any, activityEvents: any[] = []): string {
    const contractorData = extractContractorData(contractor, activityEvents);
    const bestMatch = getBestMatchingIndustryImage(contractorData);
    return bestMatch.imagePath;
  }

  /**
   * Get multiple image options for a contractor
   */
  static getImageOptionsForContractor(
    contractor: any,
    activityEvents: any[] = [],
    limit: number = 3
  ): Array<{ imagePath: string; score: number; category: string }> {
    const contractorData = extractContractorData(contractor, activityEvents);
    const matches = getMatchingIndustryImages(contractorData, limit);

    return matches.map(match => ({
      imagePath: match.image.imagePath,
      score: match.score,
      category: match.image.primaryCategory
    }));
  }

  /**
   * Get detailed matching analysis for debugging
   */
  static getMatchingAnalysis(contractor: any, activityEvents: any[] = []) {
    const contractorData = extractContractorData(contractor, activityEvents);
    const matches = getMatchingIndustryImages(contractorData, 5);

    return {
      contractorData,
      matches: matches.map(match => ({
        imageName: match.image.imageName,
        category: match.image.primaryCategory,
        score: match.score,
        imagePath: match.image.imagePath,
        matchingTags: match.image.tags.filter(tag =>
          contractorData.keywords?.some(keyword =>
            keyword.toLowerCase().includes(tag) || tag.includes(keyword.toLowerCase())
          )
        )
      }))
    };
  }
}

// Export convenience instance
export const industryImageMatcher = IndustryImageMatchingService;