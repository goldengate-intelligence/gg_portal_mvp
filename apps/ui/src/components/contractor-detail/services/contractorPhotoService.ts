/**
 * Contractor Photo Service
 *
 * Provides centralized management of contractor profile photos for use across
 * the platform, including asset cards, contractor detail headers, and other components.
 */

export interface ContractorPhoto {
  uei: string;
  companyName: string;
  photoUrl?: string;
  logoUrl?: string;
  initials?: string;
  backgroundColor?: string;
  textColor?: string;
}

// Contractor registry - this would be populated from actual contractor data
const contractorRegistry: Map<string, ContractorPhoto> = new Map();

/**
 * Register contractor from actual contractor data
 */
export function registerContractor(contractor: {
  uei: string;
  name: string;
  profilePhotoUrl?: string;
  logoUrl?: string;
}): void {
  const contractorPhoto: ContractorPhoto = {
    uei: contractor.uei,
    companyName: contractor.name,
    photoUrl: contractor.profilePhotoUrl,
    logoUrl: contractor.logoUrl,
    initials: generateInitialsFromName(contractor.name),
    backgroundColor: getDefaultThemeColor(contractor.name),
    textColor: '#FFFFFF'
  };

  contractorRegistry.set(contractor.uei, contractorPhoto);
}

/**
 * Get contractor photo information by UEI
 */
export function getContractorPhoto(uei: string): ContractorPhoto | null {
  return contractorRegistry.get(uei) || null;
}

/**
 * Get contractor photo information by company name
 */
export function getContractorPhotoByName(companyName: string): ContractorPhoto | null {
  for (const [, photo] of contractorRegistry) {
    if (photo.companyName.toLowerCase() === companyName.toLowerCase()) {
      return photo;
    }
  }
  return null;
}

/**
 * Get contractor profile image URL with fallback logic
 * Priority: photoUrl > logoUrl > null
 */
export function getContractorProfileImage(uei: string, companyName?: string): string | null {
  let photo = getContractorPhoto(uei);

  if (!photo && companyName) {
    photo = getContractorPhotoByName(companyName);
  }

  if (photo) {
    return photo.photoUrl || photo.logoUrl || null;
  }

  return null;
}

/**
 * Get contractor initials for display in asset cards
 */
export function getContractorInitials(uei: string, companyName: string): string {
  const photo = getContractorPhoto(uei) || getContractorPhotoByName(companyName);

  if (photo?.initials) {
    return photo.initials;
  }

  // Fallback: generate initials from company name
  return generateInitialsFromName(companyName);
}

/**
 * Generate initials from company name as fallback
 */
function generateInitialsFromName(companyName: string): string {
  // Special cases for common patterns
  if (companyName.includes('Trio')) return 'TFL';
  if (companyName.includes('Raytheon')) return 'RTX';
  if (companyName.includes('BAE')) return 'BAE';
  if (companyName.includes('Applied')) return 'ACI';
  if (companyName.includes('MedStar')) return 'MSF';
  if (companyName.includes('InfoTech')) return 'ITC';
  if (companyName.includes('GreenPoint')) return 'GCE';
  if (companyName.includes('QuantumShield')) return 'QSL';
  if (companyName.includes('NextGen')) return 'NGE';

  // Default: first letter of each word, max 3 characters
  return companyName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

/**
 * Get contractor theme colors for asset cards
 */
export function getContractorTheme(uei: string, companyName: string): {
  backgroundColor: string;
  textColor: string;
} {
  const photo = getContractorPhoto(uei) || getContractorPhotoByName(companyName);

  if (photo?.backgroundColor && photo?.textColor) {
    return {
      backgroundColor: photo.backgroundColor,
      textColor: photo.textColor
    };
  }

  // Fallback theme
  return {
    backgroundColor: '#D2AC38',
    textColor: '#FFFFFF'
  };
}

/**
 * Get default theme color based on company name
 */
function getDefaultThemeColor(companyName: string): string {
  if (companyName.includes('Trio')) return '#D2AC38';
  if (companyName.includes('Raytheon')) return '#3B82F6';
  if (companyName.includes('BAE')) return '#EF4444';
  if (companyName.includes('Applied')) return '#10B981';
  if (companyName.includes('MedStar')) return '#F59E0B';
  if (companyName.includes('InfoTech')) return '#8B5CF6';
  if (companyName.includes('GreenPoint')) return '#059669';
  if (companyName.includes('QuantumShield')) return '#DC2626';
  if (companyName.includes('NextGen')) return '#0891B2';

  // Default golden color
  return '#D2AC38';
}

/**
 * Register or update contractor photo information
 * This would typically be called when uploading new photos
 */
export function setContractorPhoto(photo: ContractorPhoto): void {
  contractorRegistry.set(photo.uei, photo);
}

/**
 * Check if contractor has a profile photo
 */
export function hasContractorPhoto(uei: string, companyName?: string): boolean {
  return getContractorProfileImage(uei, companyName) !== null;
}