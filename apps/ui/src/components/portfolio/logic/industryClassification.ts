// Industry Classification and Keyword Management System
// Centralizes image mapping, industry tagging, and AI corporate summaries

export interface IndustryProfile {
  id: string;
  name: string;
  imagePath: string;
  keywords: string[];
  companyKeywords: string[];
  naicsKeywords: string[];
  aiSummaryPrompts: {
    capabilities: string[];
    marketFocus: string[];
    keyStrengths: string[];
  };
}

// Available industry images mapping
export const INDUSTRY_PROFILES: Record<string, IndustryProfile> = {
  defense: {
    id: 'defense',
    name: 'Defense & Aerospace',
    imagePath: '/gg_industry_images/1_defense.jpg',
    keywords: ['defense', 'aerospace', 'military', 'aircraft', 'aviation', 'missile', 'space', 'guidance', 'navigation'],
    companyKeywords: ['lockheed', 'raytheon', 'boeing', 'northrop', 'general dynamics', 'bae'],
    naicsKeywords: ['guided missile', 'space vehicle', 'aircraft', 'aerospace', 'navigation', 'aeronautical'],
    aiSummaryPrompts: {
      capabilities: ['defense systems', 'aerospace technology', 'military equipment'],
      marketFocus: ['government contracts', 'defense spending', 'military modernization'],
      keyStrengths: ['technical expertise', 'security clearances', 'long-term contracts']
    }
  },

  informationTechnology: {
    id: 'informationTechnology',
    name: 'Information Technology',
    imagePath: '/gg_industry_images/2_informationtechnology.jpg',
    keywords: ['information technology', 'software', 'computer', 'digital', 'cyber', 'cloud', 'data'],
    companyKeywords: ['infotech', 'tech', 'systems', 'digital', 'cyber', 'data'],
    naicsKeywords: ['computer', 'software', 'information', 'data processing', 'telecommunications'],
    aiSummaryPrompts: {
      capabilities: ['software development', 'IT consulting', 'cybersecurity', 'cloud services'],
      marketFocus: ['digital transformation', 'government IT', 'enterprise solutions'],
      keyStrengths: ['technical innovation', 'agile development', 'security expertise']
    }
  },

  construction: {
    id: 'construction',
    name: 'Construction',
    imagePath: '/gg_industry_images/3_construction.jpg',
    keywords: ['construction', 'building', 'infrastructure', 'engineering', 'real estate'],
    companyKeywords: ['construction', 'building', 'engineering', 'greenpoint', 'builders'],
    naicsKeywords: ['construction', 'building', 'heavy construction', 'specialty trade'],
    aiSummaryPrompts: {
      capabilities: ['construction management', 'infrastructure development', 'engineering services'],
      marketFocus: ['public works', 'federal facilities', 'infrastructure modernization'],
      keyStrengths: ['project management', 'safety standards', 'on-time delivery']
    }
  },

  professionalServices: {
    id: 'professionalServices',
    name: 'Professional Services',
    imagePath: '/gg_industry_images/4_professionalservices.jpg',
    keywords: ['professional', 'consulting', 'technical', 'services', 'advisory'],
    companyKeywords: ['consulting', 'advisory', 'professional', 'services'],
    naicsKeywords: ['professional', 'scientific', 'technical', 'consulting', 'architectural'],
    aiSummaryPrompts: {
      capabilities: ['strategic consulting', 'technical advisory', 'business solutions'],
      marketFocus: ['government consulting', 'process improvement', 'organizational development'],
      keyStrengths: ['subject matter expertise', 'analytical capabilities', 'client relationships']
    }
  },

  researchAndDevelopment: {
    id: 'researchAndDevelopment',
    name: 'Research & Development',
    imagePath: '/gg_industry_images/5_researchanddevelopment.jpg',
    keywords: ['research', 'development', 'innovation', 'laboratory', 'scientific'],
    companyKeywords: ['research', 'labs', 'scientific', 'innovation', 'development'],
    naicsKeywords: ['research', 'development', 'scientific', 'testing', 'laboratories'],
    aiSummaryPrompts: {
      capabilities: ['R&D services', 'scientific research', 'technology development'],
      marketFocus: ['government research', 'innovation programs', 'scientific advancement'],
      keyStrengths: ['research expertise', 'innovation capabilities', 'scientific methodology']
    }
  },

  manufacturing: {
    id: 'manufacturing',
    name: 'Manufacturing',
    imagePath: '/gg_industry_images/6_manufacturing.jpg',
    keywords: ['manufacturing', 'fabrication', 'production', 'assembly', 'industrial'],
    companyKeywords: ['fabrication', 'manufacturing', 'composites', 'industrial', 'trio'],
    naicsKeywords: ['manufacturing', 'fabricated', 'production', 'assembly', 'industrial'],
    aiSummaryPrompts: {
      capabilities: ['precision manufacturing', 'fabrication services', 'quality production'],
      marketFocus: ['government procurement', 'defense manufacturing', 'industrial contracts'],
      keyStrengths: ['manufacturing expertise', 'quality control', 'production capacity']
    }
  },

  facilitiesManagement: {
    id: 'facilitiesManagement',
    name: 'Facilities Management',
    imagePath: '/gg_industry_images/7_facilitiesmanagement.jpg',
    keywords: ['facilities', 'management', 'operations', 'maintenance', 'support'],
    companyKeywords: ['facilities', 'management', 'operations', 'support', 'services'],
    naicsKeywords: ['facilities', 'support', 'management', 'maintenance', 'operations'],
    aiSummaryPrompts: {
      capabilities: ['facilities management', 'operational support', 'maintenance services'],
      marketFocus: ['government facilities', 'base operations', 'facility optimization'],
      keyStrengths: ['operational efficiency', 'cost management', 'service reliability']
    }
  },

  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    imagePath: '/gg_industry_images/8_healthcare.jpg',
    keywords: ['health', 'medical', 'healthcare', 'hospital', 'clinical'],
    companyKeywords: ['medstar', 'health', 'medical', 'healthcare', 'clinical'],
    naicsKeywords: ['health care', 'medical', 'hospital', 'ambulatory', 'social assistance'],
    aiSummaryPrompts: {
      capabilities: ['healthcare services', 'medical support', 'clinical operations'],
      marketFocus: ['federal healthcare', 'veteran services', 'public health'],
      keyStrengths: ['clinical expertise', 'patient care', 'healthcare compliance']
    }
  },

  transportation: {
    id: 'transportation',
    name: 'Transportation',
    imagePath: '/gg_industry_images/9_transportation.jpg',
    keywords: ['transportation', 'logistics', 'shipping', 'freight', 'supply chain'],
    companyKeywords: ['logistics', 'transportation', 'shipping', 'freight', 'quantumshield', 'quantum'],
    naicsKeywords: ['transportation', 'warehousing', 'logistics', 'freight', 'shipping'],
    aiSummaryPrompts: {
      capabilities: ['logistics management', 'transportation services', 'supply chain'],
      marketFocus: ['government logistics', 'defense transportation', 'supply chain optimization'],
      keyStrengths: ['logistics expertise', 'distribution networks', 'supply chain management']
    }
  },

  environmentalServices: {
    id: 'environmentalServices',
    name: 'Environmental Services',
    imagePath: '/gg_industry_images/10_environmentalservices.jpg',
    keywords: ['environmental', 'sustainability', 'remediation', 'waste', 'green'],
    companyKeywords: ['environmental', 'nextgen', 'green', 'sustainability', 'eco'],
    naicsKeywords: ['waste management', 'remediation', 'environmental', 'administrative', 'support'],
    aiSummaryPrompts: {
      capabilities: ['environmental remediation', 'sustainability consulting', 'waste management'],
      marketFocus: ['environmental compliance', 'cleanup projects', 'sustainability initiatives'],
      keyStrengths: ['environmental expertise', 'regulatory compliance', 'sustainable solutions']
    }
  },

  telecom: {
    id: 'telecom',
    name: 'Telecommunications',
    imagePath: '/gg_industry_images/11_telecom.jpg',
    keywords: ['telecommunications', 'telecom', 'communications', 'network', 'wireless'],
    companyKeywords: ['telecom', 'communications', 'network', 'wireless', 'connectivity'],
    naicsKeywords: ['telecommunications', 'communications', 'broadcasting', 'wireless'],
    aiSummaryPrompts: {
      capabilities: ['telecommunications infrastructure', 'network services', 'communications'],
      marketFocus: ['government communications', 'secure networks', 'connectivity solutions'],
      keyStrengths: ['network expertise', 'secure communications', 'infrastructure management']
    }
  },

  energy: {
    id: 'energy',
    name: 'Energy & Utilities',
    imagePath: '/gg_industry_images/12_energy.jpg',
    keywords: ['energy', 'power', 'utilities', 'electric', 'renewable'],
    companyKeywords: ['energy', 'power', 'electric', 'utilities', 'renewable'],
    naicsKeywords: ['utilities', 'electric', 'power', 'energy', 'renewable'],
    aiSummaryPrompts: {
      capabilities: ['energy solutions', 'power systems', 'utility services'],
      marketFocus: ['government energy', 'renewable projects', 'power infrastructure'],
      keyStrengths: ['energy expertise', 'sustainable solutions', 'infrastructure development']
    }
  },

  financialServices: {
    id: 'financialServices',
    name: 'Financial Services',
    imagePath: '/gg_industry_images/13_financialservices.jpg',
    keywords: ['financial', 'finance', 'banking', 'accounting', 'investment'],
    companyKeywords: ['financial', 'finance', 'banking', 'accounting', 'capital'],
    naicsKeywords: ['finance', 'banking', 'accounting', 'investment', 'financial'],
    aiSummaryPrompts: {
      capabilities: ['financial services', 'accounting', 'financial management'],
      marketFocus: ['government financial services', 'fiscal management', 'financial consulting'],
      keyStrengths: ['financial expertise', 'regulatory compliance', 'fiscal responsibility']
    }
  },

  educationServices: {
    id: 'educationServices',
    name: 'Education Services',
    imagePath: '/gg_industry_images/14_educationservices.jpg',
    keywords: ['education', 'training', 'learning', 'academic', 'instruction'],
    companyKeywords: ['education', 'training', 'learning', 'academic', 'university'],
    naicsKeywords: ['educational', 'training', 'instruction', 'academic', 'schools'],
    aiSummaryPrompts: {
      capabilities: ['educational services', 'training programs', 'curriculum development'],
      marketFocus: ['government training', 'professional development', 'educational consulting'],
      keyStrengths: ['educational expertise', 'training delivery', 'curriculum design']
    }
  },

  agriculture: {
    id: 'agriculture',
    name: 'Agriculture',
    imagePath: '/gg_industry_images/15_agriculture.jpg',
    keywords: ['agriculture', 'farming', 'food', 'agricultural', 'rural'],
    companyKeywords: ['agriculture', 'farming', 'food', 'agricultural', 'rural'],
    naicsKeywords: ['agriculture', 'farming', 'food', 'forestry', 'fishing'],
    aiSummaryPrompts: {
      capabilities: ['agricultural services', 'food production', 'rural development'],
      marketFocus: ['government agriculture', 'food security', 'rural programs'],
      keyStrengths: ['agricultural expertise', 'food systems', 'rural development']
    }
  },

  other: {
    id: 'other',
    name: 'Other Services',
    imagePath: '/gg_industry_images/16_other.jpg',
    keywords: ['other', 'miscellaneous', 'general', 'various'],
    companyKeywords: [],
    naicsKeywords: ['other', 'miscellaneous', 'unclassified'],
    aiSummaryPrompts: {
      capabilities: ['diverse services', 'specialized solutions', 'custom capabilities'],
      marketFocus: ['government services', 'specialized markets', 'niche solutions'],
      keyStrengths: ['specialized expertise', 'flexible solutions', 'diverse capabilities']
    }
  }
};

// Industry classification function
export const classifyIndustry = (companyName: string, naicsDescription: string): IndustryProfile => {
  const company = companyName.toLowerCase();
  const naics = naicsDescription.toLowerCase();

  // Check each industry profile for matches
  for (const profile of Object.values(INDUSTRY_PROFILES)) {
    // Check company name keywords first (highest priority)
    if (profile.companyKeywords.some(keyword => company.includes(keyword))) {
      return profile;
    }

    // Check NAICS keywords
    if (profile.naicsKeywords.some(keyword => naics.includes(keyword))) {
      return profile;
    }

    // Check general keywords
    if (profile.keywords.some(keyword =>
      company.includes(keyword) || naics.includes(keyword)
    )) {
      return profile;
    }
  }

  // Default fallback
  return INDUSTRY_PROFILES.other;
};

// Get industry image path
export const getIndustryImage = (companyName: string, naicsDescription: string): string => {
  return classifyIndustry(companyName, naicsDescription).imagePath;
};

// Get industry tag
export const getIndustryTag = (companyName: string, naicsDescription: string): string => {
  return classifyIndustry(companyName, naicsDescription).name;
};

// Generate AI summary prompts
export const getAISummaryPrompts = (companyName: string, naicsDescription: string): string[] => {
  const profile = classifyIndustry(companyName, naicsDescription);
  return [
    ...profile.aiSummaryPrompts.capabilities,
    ...profile.aiSummaryPrompts.marketFocus,
    ...profile.aiSummaryPrompts.keyStrengths
  ];
};