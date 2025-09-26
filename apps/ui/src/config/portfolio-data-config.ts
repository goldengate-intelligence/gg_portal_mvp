/**
 * Portfolio Data Configuration
 *
 * Centralized configuration for portfolio asset mock data and lookup services
 */

export interface CompanyProfile {
  uei: string;
  companyName: string;
  location: string;
  naicsDescription: string;
  employeeCount: string;
  yearsInBusiness: number;
  primaryContact: string;
  marketType: 'defense' | 'civilian';
}

export interface ContractorLookupMaps {
  locations: Record<string, string>;
  naicsCodes: Record<string, string>;
  employeeCounts: Record<string, string>;
  yearsInBusiness: Record<string, number>;
  primaryContacts: Record<string, string>;
}

export const CONTRACTOR_LOCATION_MAP: Record<string, string> = {
  TFL123456789: "Houston, TX",
  RTX987654321: "Waltham, MA",
  BAE456789123: "Arlington, VA",
  ACI789123456: "Seattle, WA",
  MSF456789012: "Washington, DC",
  ITC234567890: "Austin, TX",
  GCE567890123: "Denver, CO",
  QSL890123456: "Norfolk, VA",
  NGE123456780: "Portland, OR",
};

export const CONTRACTOR_NAICS_MAP: Record<string, string> = {
  TFL123456789: "Fabricated Plate Work Manufacturing",
  RTX987654321: "Guided Missile and Space Vehicle Manufacturing",
  BAE456789123: "Search Detection Navigation Guidance Aeronautical Systems",
  ACI789123456: "Laminated Plastics Plate Sheet and Shape Manufacturing",
  MSF456789012: "Health Care and Social Assistance",
  ITC234567890: "Professional, Scientific, and Technical Services",
  GCE567890123: "Construction of Buildings",
  QSL890123456: "Transportation and Warehousing",
  NGE123456780: "Environmental Consulting Services",
};

export const CONTRACTOR_EMPLOYEE_COUNT_MAP: Record<string, string> = {
  TFL123456789: "250-500",
  RTX987654321: "10,000+",
  BAE456789123: "5,000-10,000",
  ACI789123456: "500-1,000",
  MSF456789012: "1,000-5,000",
  ITC234567890: "100-250",
  GCE567890123: "500-1,000",
  QSL890123456: "100-500",
  NGE123456780: "50-100",
};

export const CONTRACTOR_YEARS_IN_BUSINESS_MAP: Record<string, number> = {
  TFL123456789: 12,
  RTX987654321: 98,
  BAE456789123: 45,
  ACI789123456: 23,
  MSF456789012: 15,
  ITC234567890: 8,
  GCE567890123: 18,
  QSL890123456: 14,
  NGE123456780: 9,
};

export const CONTRACTOR_PRIMARY_CONTACT_MAP: Record<string, string> = {
  TFL123456789: "John Smith, VP Operations",
  RTX987654321: "Sarah Johnson, Director Defense Systems",
  BAE456789123: "Michael Davis, Program Manager",
  ACI789123456: "Lisa Chen, Operations Director",
  MSF456789012: "Dr. Robert Wilson, Chief Medical Officer",
  ITC234567890: "Amanda Rodriguez, CTO",
  GCE567890123: "Mark Thompson, Project Director",
  QSL890123456: "David Kim, VP Logistics",
  NGE123456780: "Maria Santos, Environmental Director",
};

export const DEFAULT_VALUES = {
  location: "Washington, DC",
  naicsDescription: "Professional Services",
  employeeCount: "250-500",
  yearsInBusiness: 10,
  primaryContact: "Contact Representative",
  marketType: "civilian" as const,
} as const;

export class PortfolioDataService {
  /**
   * Get company location by UEI
   */
  static getCompanyLocation(uei: string): string {
    return CONTRACTOR_LOCATION_MAP[uei] || DEFAULT_VALUES.location;
  }

  /**
   * Get company NAICS description by UEI
   */
  static getCompanyNAICS(uei: string): string {
    return CONTRACTOR_NAICS_MAP[uei] || DEFAULT_VALUES.naicsDescription;
  }

  /**
   * Get employee count by UEI
   */
  static getEmployeeCount(uei: string): string {
    return CONTRACTOR_EMPLOYEE_COUNT_MAP[uei] || DEFAULT_VALUES.employeeCount;
  }

  /**
   * Get years in business by UEI
   */
  static getYearsInBusiness(uei: string): number {
    return CONTRACTOR_YEARS_IN_BUSINESS_MAP[uei] || DEFAULT_VALUES.yearsInBusiness;
  }

  /**
   * Get primary contact by UEI
   */
  static getPrimaryContact(uei: string): string {
    return CONTRACTOR_PRIMARY_CONTACT_MAP[uei] || DEFAULT_VALUES.primaryContact;
  }

  /**
   * Determine market type based on primary agency
   */
  static getMarketType(primaryAgency?: string): 'defense' | 'civilian' {
    return primaryAgency === "Defense" ? "defense" : "civilian";
  }

  /**
   * Parse award value string to number
   */
  static parseAwardValue(value: string): number {
    const cleanValue = value.replace(/[^\d.]/g, '');
    const multiplier = value.includes('B') ? 1000000000 : 1000000;
    return parseFloat(cleanValue) * multiplier;
  }

  /**
   * Get complete company profile by UEI
   */
  static getCompanyProfile(uei: string, companyName: string, primaryAgency?: string): CompanyProfile {
    return {
      uei,
      companyName,
      location: this.getCompanyLocation(uei),
      naicsDescription: this.getCompanyNAICS(uei),
      employeeCount: this.getEmployeeCount(uei),
      yearsInBusiness: this.getYearsInBusiness(uei),
      primaryContact: this.getPrimaryContact(uei),
      marketType: this.getMarketType(primaryAgency),
    };
  }
}