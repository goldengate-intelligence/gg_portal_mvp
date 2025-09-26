/**
 * Contractor Data Extractor
 *
 * Extracts and processes contractor data from various sources to create
 * a comprehensive profile for industry image matching.
 */

export interface ExtractedContractorData {
  naicsCodes: string[];
  pscCodes: string[];
  agencies: string[];
  keywords: string[];
  contractTypes: string[];
  description: string;
  services: string[];
}

/**
 * Extract comprehensive contractor data for image matching
 */
export function extractContractorData(
  contractor: any,
  activityEvents: any[] = []
): ExtractedContractorData {
  const safeActivityEvents = Array.isArray(activityEvents) ? activityEvents : [];

  // Extract NAICS codes
  const naicsCodes = Array.from(new Set([
    // From activity events
    ...safeActivityEvents
      .map(event => event?.NAICS_CODE || event?.naics_code)
      .filter(Boolean),
    // From contractor profile
    contractor?.naicsCode,
    contractor?.primaryNaics,
    ...(contractor?.naicsCodes || [])
  ].filter(Boolean))) as string[];

  // Extract PSC codes
  const pscCodes = Array.from(new Set([
    // From activity events
    ...safeActivityEvents
      .map(event => event?.PSC_CODE || event?.psc_code)
      .filter(Boolean),
    // From contractor profile
    contractor?.pscCode,
    contractor?.primaryPsc,
    ...(contractor?.pscCodes || [])
  ].filter(Boolean))) as string[];

  // Extract agencies
  const agencies = Array.from(new Set([
    // From activity events
    ...safeActivityEvents
      .map(event => event?.AWARDING_AGENCY_NAME || event?.awarding_agency_name)
      .filter(Boolean),
    // From contractor profile
    contractor?.primaryAgency,
    ...(contractor?.agencies || [])
  ].filter(Boolean))) as string[];

  // Extract contract types
  const contractTypes = Array.from(new Set([
    // From activity events
    ...safeActivityEvents
      .map(event => event?.CONTRACT_TYPE || event?.contract_type || event?.contract_pricing_type)
      .filter(Boolean),
    // From contractor profile
    ...(contractor?.contractTypes || [])
  ].filter(Boolean))) as string[];

  // Extract keywords from various text sources
  const keywords = extractKeywordsFromText([
    contractor?.name,
    contractor?.description,
    contractor?.businessDescription,
    contractor?.capabilities,
    contractor?.services,
    contractor?.specialties,
    ...safeActivityEvents.map(event => event?.DESCRIPTION || event?.description),
    ...safeActivityEvents.map(event => event?.AWARD_TITLE || event?.award_title),
    ...safeActivityEvents.map(event => event?.PURPOSE || event?.purpose)
  ].filter(Boolean).join(' '));

  // Compile description
  const description = [
    contractor?.description,
    contractor?.businessDescription,
    contractor?.capabilities
  ].filter(Boolean).join(' ');

  // Extract services
  const services = Array.from(new Set([
    ...(contractor?.services || []),
    ...(contractor?.specialties || []),
    ...extractServicesFromText(description)
  ].filter(Boolean))) as string[];

  return {
    naicsCodes,
    pscCodes,
    agencies,
    keywords,
    contractTypes,
    description,
    services
  };
}

/**
 * Extract keywords from text using common industry terms
 */
function extractKeywordsFromText(text: string): string[] {
  if (!text) return [];

  const lowercaseText = text.toLowerCase();
  const keywords: string[] = [];

  // Common industry keywords to look for
  const industryKeywords = [
    // Technology
    'software', 'hardware', 'technology', 'digital', 'computing', 'systems', 'data',
    'cybersecurity', 'cloud', 'artificial intelligence', 'ai', 'machine learning',
    'automation', 'network', 'database', 'programming', 'development',

    // Defense & Security
    'defense', 'military', 'security', 'weapons', 'tactical', 'surveillance',
    'intelligence', 'classified', 'clearance', 'aerospace', 'aviation', 'naval',

    // Construction & Engineering
    'construction', 'engineering', 'building', 'infrastructure', 'civil',
    'mechanical', 'electrical', 'structural', 'architecture', 'design',

    // Healthcare & Medical
    'healthcare', 'medical', 'hospital', 'clinical', 'pharmaceutical', 'treatment',
    'patient', 'nursing', 'therapy', 'wellness', 'research',

    // Professional Services
    'consulting', 'advisory', 'management', 'strategy', 'business', 'analysis',
    'training', 'education', 'planning', 'operations', 'process',

    // Manufacturing & Industrial
    'manufacturing', 'production', 'factory', 'assembly', 'fabrication',
    'industrial', 'machinery', 'equipment', 'materials', 'quality control',

    // Transportation & Logistics
    'transportation', 'logistics', 'shipping', 'freight', 'delivery',
    'fleet', 'vehicles', 'supply chain', 'warehousing', 'distribution',

    // Environmental
    'environmental', 'sustainability', 'green', 'renewable', 'energy',
    'cleanup', 'remediation', 'conservation', 'waste', 'recycling',

    // Facilities & Maintenance
    'facilities', 'maintenance', 'operations', 'custodial', 'cleaning',
    'janitorial', 'grounds', 'building management', 'property',

    // Financial & Administrative
    'financial', 'accounting', 'auditing', 'administrative', 'clerical',
    'bookkeeping', 'payroll', 'budgeting', 'compliance',

    // Research & Development
    'research', 'development', 'science', 'laboratory', 'testing',
    'innovation', 'technical', 'scientific', 'analysis', 'studies'
  ];

  // Check for keyword matches
  for (const keyword of industryKeywords) {
    if (lowercaseText.includes(keyword)) {
      keywords.push(keyword);
    }
  }

  // Extract additional keywords using simple heuristics
  const words = lowercaseText.split(/\s+/);
  const technicalWords = words.filter(word =>
    word.length > 4 &&
    !['services', 'solutions', 'company', 'corporation', 'llc', 'inc'].includes(word) &&
    /^[a-z-]+$/.test(word)
  );

  keywords.push(...technicalWords.slice(0, 10)); // Limit to avoid noise

  return Array.from(new Set(keywords));
}

/**
 * Extract service offerings from descriptive text
 */
function extractServicesFromText(text: string): string[] {
  if (!text) return [];

  const services: string[] = [];
  const lowercaseText = text.toLowerCase();

  // Common service patterns
  const servicePatterns = [
    /(\w+\s+)?consulting/g,
    /(\w+\s+)?management/g,
    /(\w+\s+)?support/g,
    /(\w+\s+)?services/g,
    /(\w+\s+)?solutions/g,
    /(\w+\s+)?development/g,
    /(\w+\s+)?maintenance/g,
    /(\w+\s+)?operations/g,
    /(\w+\s+)?analysis/g,
    /(\w+\s+)?design/g
  ];

  for (const pattern of servicePatterns) {
    const matches = lowercaseText.match(pattern);
    if (matches) {
      services.push(...matches.map(match => match.trim()));
    }
  }

  return Array.from(new Set(services));
}

/**
 * Helper function to analyze contractor's industry focus
 */
export function analyzeIndustryFocus(contractorData: ExtractedContractorData): {
  primaryIndustry: string;
  industries: Array<{ name: string; confidence: number }>;
} {
  const industries = new Map<string, number>();

  // Analyze NAICS codes
  for (const naics of contractorData.naicsCodes) {
    const majorGroup = naics.substring(0, 2);
    const industryName = getIndustryNameFromNAICS(majorGroup);
    industries.set(industryName, (industries.get(industryName) || 0) + 5);
  }

  // Analyze keywords
  for (const keyword of contractorData.keywords) {
    const industryName = getIndustryNameFromKeyword(keyword);
    if (industryName) {
      industries.set(industryName, (industries.get(industryName) || 0) + 2);
    }
  }

  // Analyze agencies
  for (const agency of contractorData.agencies) {
    const industryName = getIndustryNameFromAgency(agency);
    if (industryName) {
      industries.set(industryName, (industries.get(industryName) || 0) + 3);
    }
  }

  const sortedIndustries = Array.from(industries.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, score], index) => ({
      name,
      confidence: Math.min(100, (score / (index + 1)) * 20)
    }));

  return {
    primaryIndustry: sortedIndustries[0]?.name || 'Other Services',
    industries: sortedIndustries.slice(0, 5)
  };
}

/**
 * Map NAICS major group to industry name
 */
function getIndustryNameFromNAICS(majorGroup: string): string {
  const naicsMap: Record<string, string> = {
    '11': 'Agriculture',
    '21': 'Mining/Energy',
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
    '52': 'Financial Services',
    '53': 'Real Estate',
    '54': 'Professional Services',
    '55': 'Management Services',
    '56': 'Administrative Services',
    '61': 'Educational Services',
    '62': 'Healthcare',
    '71': 'Arts/Entertainment',
    '72': 'Accommodation/Food',
    '81': 'Other Services',
    '92': 'Public Administration'
  };

  return naicsMap[majorGroup] || 'Other Services';
}

/**
 * Map keyword to industry name
 */
function getIndustryNameFromKeyword(keyword: string): string | null {
  const keywordMap: Record<string, string> = {
    'software': 'Information Technology',
    'hardware': 'Information Technology',
    'technology': 'Information Technology',
    'digital': 'Information Technology',
    'cybersecurity': 'Information Technology',
    'defense': 'Defense & Security',
    'military': 'Defense & Security',
    'security': 'Defense & Security',
    'construction': 'Construction',
    'engineering': 'Construction',
    'building': 'Construction',
    'healthcare': 'Healthcare',
    'medical': 'Healthcare',
    'manufacturing': 'Manufacturing',
    'production': 'Manufacturing',
    'consulting': 'Professional Services',
    'advisory': 'Professional Services',
    'management': 'Professional Services',
    'environmental': 'Environmental Services',
    'energy': 'Energy & Utilities',
    'transportation': 'Transportation',
    'logistics': 'Transportation',
    'financial': 'Financial Services',
    'education': 'Educational Services',
    'training': 'Educational Services'
  };

  return keywordMap[keyword.toLowerCase()] || null;
}

/**
 * Map agency to industry name
 */
function getIndustryNameFromAgency(agency: string): string | null {
  const agencyLower = agency.toLowerCase();

  if (agencyLower.includes('defense') || agencyLower.includes('dod') || agencyLower.includes('army') || agencyLower.includes('navy') || agencyLower.includes('air force')) {
    return 'Defense & Security';
  }
  if (agencyLower.includes('health') || agencyLower.includes('hhs') || agencyLower.includes('va') || agencyLower.includes('veterans')) {
    return 'Healthcare';
  }
  if (agencyLower.includes('transport') || agencyLower.includes('dot')) {
    return 'Transportation';
  }
  if (agencyLower.includes('energy') || agencyLower.includes('doe')) {
    return 'Energy & Utilities';
  }
  if (agencyLower.includes('epa') || agencyLower.includes('environment')) {
    return 'Environmental Services';
  }
  if (agencyLower.includes('education') || agencyLower.includes('training')) {
    return 'Educational Services';
  }
  if (agencyLower.includes('agriculture') || agencyLower.includes('usda')) {
    return 'Agriculture';
  }

  return null;
}