import type { IndustrySector } from '../types';

export interface IndustryInfo {
  id: IndustrySector;
  name: string;
  description: string;
  iconPath: string; // Path to industry icon image
  color: string; // Hex color code
  naicsCodes?: string[]; // Associated NAICS codes
}

// 16 Industry sectors from the old UI analysis
export const INDUSTRIES: Record<IndustrySector, IndustryInfo> = {
  'defense': {
    id: 'defense',
    name: 'Defense',
    description: 'Defense contractors and military suppliers',
    iconPath: '/images/1_defense.png',
    color: '#8B0000', // Dark red
    naicsCodes: ['336411', '541712', '334511'],
  },
  'information-technology': {
    id: 'information-technology',
    name: 'Information Technology',
    description: 'IT services, software, and technology solutions',
    iconPath: '/images/2_informationtechnology.png',
    color: '#666666', // Gray
    naicsCodes: ['541511', '541512', '518210'],
  },
  'construction': {
    id: 'construction',
    name: 'Construction',
    description: 'Construction, engineering, and infrastructure',
    iconPath: '/images/3_construction.png',
    color: '#FF6600', // Orange
    naicsCodes: ['236220', '237310', '238210'],
  },
  'professional-services': {
    id: 'professional-services',
    name: 'Professional Services',
    description: 'Consulting, advisory, and professional services',
    iconPath: '/images/4_professionalservices.png',
    color: '#6600CC', // Purple
    naicsCodes: ['541611', '541618', '541990'],
  },
  'research-development': {
    id: 'research-development',
    name: 'Research & Development',
    description: 'R&D services and scientific research',
    iconPath: '/images/5_researchanddevelopment.png',
    color: '#009900', // Green
    naicsCodes: ['541712', '541380', '541710'],
  },
  'manufacturing': {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Manufacturing and industrial production',
    iconPath: '/images/6_manufacturing.png',
    color: '#CC6600', // Brown/Orange
    naicsCodes: ['336411', '332994', '331110'],
  },
  'facilities-management': {
    id: 'facilities-management',
    name: 'Facilities Management',
    description: 'Facility operations and maintenance services',
    iconPath: '/images/7_facilitiesmanagement.png',
    color: '#996633', // Brown
    naicsCodes: ['561210', '561720', '238990'],
  },
  'healthcare': {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Healthcare services and medical support',
    iconPath: '/images/8_healthcare.png',
    color: '#CC0066', // Pink/Red
    naicsCodes: ['621111', '541380', '334510'],
  },
  'transportation': {
    id: 'transportation',
    name: 'Transportation',
    description: 'Transportation and logistics services',
    iconPath: '/images/9_transportation.png',
    color: '#808080', // Gray
    naicsCodes: ['484110', '488119', '541614'],
  },
  'environmental-services': {
    id: 'environmental-services',
    name: 'Environmental Services',
    description: 'Environmental and sustainability services',
    iconPath: '/images/10_environmentalservices.png',
    color: '#009966', // Teal
    naicsCodes: ['541620', '562910', '238910'],
  },
  'telecommunications': {
    id: 'telecommunications',
    name: 'Telecommunications',
    description: 'Telecom infrastructure and communications',
    iconPath: '/images/11_telecom.png',
    color: '#9966CC', // Purple
    naicsCodes: ['517311', '517919', '238210'],
  },
  'energy': {
    id: 'energy',
    name: 'Energy',
    description: 'Energy production and utilities',
    iconPath: '/images/12_energy.png',
    color: '#CCCC00', // Yellow
    naicsCodes: ['221111', '237130', '541690'],
  },
  'financial-services': {
    id: 'financial-services',
    name: 'Financial Services',
    description: 'Financial and accounting services',
    iconPath: '/images/13_financialservices.png',
    color: '#339900', // Lime Green
    naicsCodes: ['541211', '541219', '522320'],
  },
  'education': {
    id: 'education',
    name: 'Education Services',
    description: 'Education and training services',
    iconPath: '/images/14_educationservices.png',
    color: '#CC3366', // Pink
    naicsCodes: ['541611', '611430', '611710'],
  },
  'agriculture': {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Agricultural and food services',
    iconPath: '/images/15_agriculture.png',
    color: '#66CC00', // Bright Green
    naicsCodes: ['115116', '541690', '311111'],
  },
  'other': {
    id: 'other',
    name: 'Other',
    description: 'Other specialized services',
    iconPath: '/images/16_other.png',
    color: '#999999', // Gray
    naicsCodes: [],
  },
};

// Helper functions
export const getIndustryById = (id: IndustrySector): IndustryInfo => {
  return INDUSTRIES[id];
};

export const getAllIndustries = (): IndustryInfo[] => {
  return Object.values(INDUSTRIES);
};

export const getIndustriesByColor = (): Record<string, IndustryInfo[]> => {
  const grouped: Record<string, IndustryInfo[]> = {};
  
  Object.values(INDUSTRIES).forEach(industry => {
    if (!grouped[industry.color]) {
      grouped[industry.color] = [];
    }
    grouped[industry.color].push(industry);
  });
  
  return grouped;
};

export const searchIndustries = (query: string): IndustryInfo[] => {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(INDUSTRIES).filter(industry =>
    industry.name.toLowerCase().includes(lowercaseQuery) ||
    industry.description.toLowerCase().includes(lowercaseQuery)
  );
};

// Location data
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC' // Washington D.C.
];

export const STATE_NAMES: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'Washington D.C.'
};

// Federal agencies (common ones for opportunities)
export const FEDERAL_AGENCIES = [
  'Department of Defense',
  'General Services Administration',
  'Department of Veterans Affairs',
  'Department of Homeland Security',
  'Department of Health and Human Services',
  'Department of Transportation',
  'Department of Energy',
  'Department of Agriculture',
  'Department of Justice',
  'Department of Commerce',
  'Department of State',
  'Department of Education',
  'Department of Treasury',
  'Environmental Protection Agency',
  'National Aeronautics and Space Administration',
  'Small Business Administration',
  'Social Security Administration',
  'Other',
] as const;

export type FederalAgency = typeof FEDERAL_AGENCIES[number];