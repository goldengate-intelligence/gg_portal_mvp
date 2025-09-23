/**
 * NAICS Classification Logic for Contractor Business Categorization
 *
 * This module provides comprehensive business classification logic based on:
 * - NAICS codes (2-6 digit hierarchy)
 * - PSC codes (Product/Service Codes)
 * - Keywords and business descriptions
 *
 * Purpose: Generate one-line business summaries for contractors
 */

import naicsPscData from '../../../data/naics-psc-mappings.json';

// Type definitions for contractor classification
export interface NAICSHierarchy {
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
}

export interface PSCMapping {
  psc_2_char: string;
  psc_2_char_description: string;
  psc_3_char: string;
  psc_3_char_description: string;
  psc_4_char: string;
  psc_4_char_description: string;
}

export interface ContractorClassification {
  primaryNAICS: string;
  primaryDescription: string;
  businessSummary: string;
  industryCategory: string;
  specificityLevel: number; // 2-6 based on NAICS precision
  keywords: string[];
  pscCodes: string[];
}

/**
 * Determine primary business classification for a contractor
 * @param naicsCode - Primary NAICS code (can be 2-6 digits)
 * @param pscCodes - Array of PSC codes the contractor works with
 * @param businessDescription - Optional business description text
 * @returns ContractorClassification object
 */
export function classifyContractor(
  naicsCode: string,
  pscCodes: string[] = [],
  businessDescription?: string
): ContractorClassification {
  // Determine specificity level based on NAICS code length
  const specificityLevel = Math.min(Math.max(naicsCode.length, 2), 6);

  // Find matching NAICS hierarchy
  const naicsMatch = findNAICSMatch(naicsCode);

  // Find relevant PSC mappings
  const pscMappings = findPSCMappings(pscCodes);

  // Generate business summary
  const businessSummary = generateBusinessSummary(naicsMatch, pscMappings, businessDescription);

  // Extract industry category
  const industryCategory = determineIndustryCategory(naicsMatch);

  // Extract keywords
  const keywords = extractKeywords(naicsMatch, pscMappings, businessDescription);

  return {
    primaryNAICS: naicsCode,
    primaryDescription: getDescriptionBySpecificity(naicsMatch, specificityLevel),
    businessSummary,
    industryCategory,
    specificityLevel,
    keywords,
    pscCodes
  };
}

/**
 * Find NAICS match in the mappings data
 */
function findNAICSMatch(naicsCode: string): NAICSHierarchy | null {
  // Try exact match first
  if (naicsPscData.naicsMappings[naicsCode]) {
    return naicsPscData.naicsMappings[naicsCode];
  }

  // Try partial matches for longer codes (e.g., if we have "333515" but only "33351" in data)
  for (let len = naicsCode.length - 1; len >= 2; len--) {
    const partialCode = naicsCode.substring(0, len);
    if (naicsPscData.naicsMappings[partialCode]) {
      return naicsPscData.naicsMappings[partialCode];
    }
  }

  return null;
}

/**
 * Find PSC mappings for given codes
 */
function findPSCMappings(pscCodes: string[]): PSCMapping[] {
  const mappings: PSCMapping[] = [];

  pscCodes.forEach(pscCode => {
    // Try exact match first
    if (naicsPscData.pscMappings[pscCode]) {
      const pscData = naicsPscData.pscMappings[pscCode];
      mappings.push({
        psc_2_char: pscData.psc_2_char,
        psc_2_char_description: pscData.psc_2_char_description,
        psc_3_char: pscData.psc_3_char,
        psc_3_char_description: pscData.psc_3_char_description,
        psc_4_char: pscData.psc_4_char,
        psc_4_char_description: pscData.psc_4_char_description
      });
    } else {
      // Try partial matches for longer codes
      for (let len = pscCode.length - 1; len >= 2; len--) {
        const partialCode = pscCode.substring(0, len);
        if (naicsPscData.pscMappings[partialCode]) {
          const pscData = naicsPscData.pscMappings[partialCode];
          mappings.push({
            psc_2_char: pscData.psc_2_char,
            psc_2_char_description: pscData.psc_2_char_description,
            psc_3_char: pscData.psc_3_char,
            psc_3_char_description: pscData.psc_3_char_description,
            psc_4_char: pscData.psc_4_char,
            psc_4_char_description: pscData.psc_4_char_description
          });
          break; // Take first match
        }
      }
    }
  });

  return mappings;
}

/**
 * Generate a concise business summary
 */
function generateBusinessSummary(
  naicsMatch: NAICSHierarchy | null,
  pscMappings: PSCMapping[],
  businessDescription?: string
): string {
  if (!naicsMatch) {
    return "Business classification unavailable";
  }

  // Use most specific NAICS description available
  const primaryActivity = naicsMatch.naics_6_description ||
                         naicsMatch.naics_5_description ||
                         naicsMatch.naics_4_description ||
                         naicsMatch.naics_3_description ||
                         naicsMatch.naics_2_description;

  // Enhance with PSC context if available
  if (pscMappings.length > 0) {
    const pscContext = pscMappings[0].psc_4_char_description ||
                      pscMappings[0].psc_3_char_description ||
                      pscMappings[0].psc_2_char_description;
    return `${primaryActivity} - ${pscContext}`;
  }

  return primaryActivity;
}

/**
 * Determine high-level industry category
 */
function determineIndustryCategory(naicsMatch: NAICSHierarchy | null): string {
  if (!naicsMatch) return "Unknown";

  const naics2 = naicsMatch.naics_2_char;

  // Map NAICS 2-digit codes to industry categories
  const industryMap: Record<string, string> = {
    '11': 'Agriculture',
    '21': 'Mining & Extraction',
    '22': 'Utilities',
    '23': 'Construction',
    '31': 'Manufacturing',
    '32': 'Manufacturing',
    '33': 'Manufacturing',
    '42': 'Wholesale Trade',
    '44': 'Retail Trade',
    '45': 'Retail Trade',
    '48': 'Transportation',
    '49': 'Transportation',
    '51': 'Information Technology',
    '52': 'Finance & Insurance',
    '53': 'Real Estate',
    '54': 'Professional Services',
    '55': 'Management Services',
    '56': 'Administrative Services',
    '61': 'Education',
    '62': 'Healthcare',
    '71': 'Entertainment',
    '72': 'Hospitality',
    '81': 'Other Services',
    '92': 'Government'
  };

  return industryMap[naics2] || 'Other Services';
}

/**
 * Get description based on specificity level
 */
function getDescriptionBySpecificity(naicsMatch: NAICSHierarchy | null, level: number): string {
  if (!naicsMatch) return "Classification unavailable";

  switch (level) {
    case 6: return naicsMatch.naics_6_description || naicsMatch.naics_5_description;
    case 5: return naicsMatch.naics_5_description || naicsMatch.naics_4_description;
    case 4: return naicsMatch.naics_4_description || naicsMatch.naics_3_description;
    case 3: return naicsMatch.naics_3_description || naicsMatch.naics_2_description;
    default: return naicsMatch.naics_2_description;
  }
}

/**
 * Extract relevant keywords for contractor
 */
function extractKeywords(
  naicsMatch: NAICSHierarchy | null,
  pscMappings: PSCMapping[],
  businessDescription?: string
): string[] {
  const keywords: string[] = [];

  // Add industry category as keyword
  if (naicsMatch) {
    keywords.push(determineIndustryCategory(naicsMatch));
  }

  // Add PSC-based keywords
  pscMappings.forEach(psc => {
    if (psc.psc_2_char_description) {
      keywords.push(psc.psc_2_char_description);
    }
  });

  // Extract keywords from business description
  if (businessDescription) {
    const descriptionKeywords = extractDescriptionKeywords(businessDescription);
    keywords.push(...descriptionKeywords);
  }

  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Extract keywords from business description text
 */
function extractDescriptionKeywords(description: string): string[] {
  // Simple keyword extraction - can be enhanced with NLP
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const words = description.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word))
    .slice(0, 5); // Limit to top 5 keywords

  return words;
}

/**
 * Determine if contractor is defense-focused based on classification
 */
export function isDefenseContractor(classification: ContractorClassification): boolean {
  const defenseKeywords = ['defense', 'military', 'aerospace', 'security', 'weapons', 'surveillance'];
  const keywords = classification.keywords.map(k => k.toLowerCase());

  return defenseKeywords.some(keyword =>
    keywords.some(k => k.includes(keyword))
  );
}

/**
 * Get contractor business summary line for display
 */
export function getContractorSummaryLine(
  naicsCode: string,
  pscCodes: string[] = [],
  businessDescription?: string
): string {
  const classification = classifyContractor(naicsCode, pscCodes, businessDescription);

  // Format: "Industry Category - Business Summary"
  return `${classification.industryCategory} - ${classification.businessSummary}`;
}

/**
 * Get detailed contractor classification for analysis
 */
export function getDetailedClassification(
  naicsCode: string,
  pscCodes: string[] = [],
  businessDescription?: string
): ContractorClassification {
  return classifyContractor(naicsCode, pscCodes, businessDescription);
}