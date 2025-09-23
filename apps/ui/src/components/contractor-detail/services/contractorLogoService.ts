/**
 * Simple Logo Service - Connects contractor logos from detail pages to asset cards
 */

interface ContractorLogo {
  uei: string;
  logoUrl?: string;
}

// Simple registry for contractor logos
const logoRegistry: Map<string, string> = new Map();

// Real company logos for mock data
const companyLogos: Record<string, string> = {
  // Real Defense Companies - Using actual logo images
  'BAE456789123': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/BAE_Systems_logo.svg/2560px-BAE_Systems_logo.svg.png',

  // For companies without real logos, we'll use initials fallback (no fake logos)
};

/**
 * Register a contractor's logo when viewing their detail page
 */
export function registerContractorLogo(uei: string, logoUrl: string): void {
  if (logoUrl) {
    logoRegistry.set(uei, logoUrl);
  }
}

/**
 * Get contractor logo for asset cards
 */
export function getContractorLogo(uei: string): string | null {
  // First check registered logos (from detail pages)
  const registeredLogo = logoRegistry.get(uei);
  if (registeredLogo) {
    return registeredLogo;
  }

  // Fallback to mock company logos
  return companyLogos[uei] || null;
}

/**
 * Check if contractor has a logo
 */
export function hasContractorLogo(uei: string): boolean {
  return logoRegistry.has(uei);
}