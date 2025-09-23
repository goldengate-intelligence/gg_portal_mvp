import type { Contract, Relationship } from '../types';

export const calculateRelationshipMetrics = (relationship: Relationship, type: 'inflow' | 'outflow') => {
  const awardedAmount = relationship.totalValue * (type === 'inflow' ? 0.85 : 0.75);
  const obligationRate = relationship.contracts.reduce((sum: number, contract: Contract) => sum + contract.utilization, 0) / relationship.contracts.length;
  const obligatedAmount = awardedAmount * (obligationRate / 100);

  return {
    awardedAmount,
    obligationRate,
    obligatedAmount
  };
};

export const getTypeInfo = (type: string) => {
  if (type === 'agency') return { label: 'AGENCY', color: '#9B7EBD' };
  if (type === 'prime') return { label: 'PRIME', color: '#5BC0EB' };
  return { label: 'SUB', color: '#FF4C4C' };
};

export const getRelationshipInitials = (name: string): string => {
  return name.split(' ').map(word => word.charAt(0)).join('').slice(0, 3).toUpperCase();
};

export const getEntityIdentifier = (relationship: Relationship): string => {
  if (relationship.type === 'agency') {
    // For agencies, use agency code or department abbreviation
    if (relationship.name.includes('Defense')) return 'DOD-AGENCY';
    if (relationship.name.includes('Corps')) return 'USACE-AGENCY';
    if (relationship.name.includes('Navy')) return 'NAVY-AGENCY';
    if (relationship.name.includes('Air Force')) return 'USAF-AGENCY';
    if (relationship.name.includes('Army')) return 'ARMY-AGENCY';
    return 'GOV-AGENCY';
  } else {
    // For companies, generate a mock UEI
    const nameHash = relationship.name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const ueiSuffix = Math.abs(nameHash).toString().slice(0, 9).padStart(9, '0');
    return `W${ueiSuffix}`;
  }
};

export const getWorkSummary = (relationship: Relationship): string => {
  const naicsCodes = relationship.contracts.map((c: Contract) => c.naics);
  const primaryNaics = naicsCodes[0];

  if (primaryNaics?.startsWith('332')) return 'Manufacturing & Fabrication';
  if (primaryNaics?.startsWith('541')) return 'Professional Services';
  if (primaryNaics?.startsWith('336')) return 'Aerospace & Defense';
  if (primaryNaics?.startsWith('238')) return 'Construction Services';
  if (primaryNaics?.startsWith('334')) return 'Technology & Electronics';
  return 'Multi-sector Operations';
};

export const calculateContractTimeline = (contract: Contract) => {
  const startDate = new Date(contract.start);
  const endDate = new Date(contract.end);
  const today = new Date();
  const totalTime = endDate.getTime() - startDate.getTime();
  const elapsedTime = today.getTime() - startDate.getTime();
  const remainingTime = endDate.getTime() - today.getTime();
  const progressPercent = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
  const remainingMonths = Math.max(0, Math.floor(remainingTime / (1000 * 60 * 60 * 24 * 30)));

  return {
    progressPercent,
    remainingMonths
  };
};

export const getTimelineColor = (remainingMonths: number): string => {
  if (remainingMonths <= 3) return '#dc2626'; // Red
  if (remainingMonths <= 6) return '#eab308'; // Yellow
  if (remainingMonths <= 12) return '#84cc16'; // Chartreuse
  return '#10B981'; // Emerald green
};

export const getUtilizationColor = (utilization: number): string => {
  const util = Math.min(100, utilization);
  if (util <= 25) return '#10B981'; // Emerald green
  if (util <= 50) return '#84cc16'; // Chartreuse
  if (util <= 75) return '#eab308'; // Yellow
  return '#dc2626'; // Red
};