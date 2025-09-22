// Contractor metrics service - centralizes financial data by UEI

export interface ContractorMetrics {
  uei: string;
  companyName: string;
  lifetimeAwards: string;
  activeAwards: string;
  revenue: string;
  pipeline: string;
  contractCount: number;
  primaryAgency?: string;
}

// Central contractor metrics store
const contractorMetricsData: Record<string, ContractorMetrics> = {
  'TFL123456789': {
    uei: 'TFL123456789',
    companyName: 'Trio Fabrication LLC',
    lifetimeAwards: '$890M',
    activeAwards: '$125M',
    revenue: '$125M',
    pipeline: '$280M',
    contractCount: 92,
    primaryAgency: 'Defense'
  },
  'RTX987654321': {
    uei: 'RTX987654321',
    companyName: 'Raytheon Technologies Corporation',
    lifetimeAwards: '$45B',
    activeAwards: '$2.1B',
    revenue: '$2.1B',
    pipeline: '$8.5B',
    contractCount: 278,
    primaryAgency: 'Defense'
  },
  'BAE456789123': {
    uei: 'BAE456789123',
    companyName: 'BAE Systems Inc',
    lifetimeAwards: '$28B',
    activeAwards: '$1.8B',
    revenue: '$1.8B',
    pipeline: '$3.2B',
    contractCount: 156,
    primaryAgency: 'Defense'
  },
  'ACI789123456': {
    uei: 'ACI789123456',
    companyName: 'Applied Composites Inc',
    lifetimeAwards: '$1.2B',
    activeAwards: '$180M',
    revenue: '$180M',
    pipeline: '$450M',
    contractCount: 84,
    primaryAgency: 'Energy'
  },
  'MSF456789012': {
    uei: 'MSF456789012',
    companyName: 'MedStar Federal',
    lifetimeAwards: '$2.8B',
    activeAwards: '$350M',
    revenue: '$350M',
    pipeline: '$620M',
    contractCount: 145,
    primaryAgency: 'Health and Human Services'
  },
  'ITC234567890': {
    uei: 'ITC234567890',
    companyName: 'InfoTech Consulting Group',
    lifetimeAwards: '$950M',
    activeAwards: '$85M',
    revenue: '$85M',
    pipeline: '$180M',
    contractCount: 67,
    primaryAgency: 'General Services Administration'
  },
  'GCE567890123': {
    uei: 'GCE567890123',
    companyName: 'GreenPoint Construction & Engineering',
    lifetimeAwards: '$1.5B',
    activeAwards: '$220M',
    revenue: '$220M',
    pipeline: '$340M',
    contractCount: 89,
    primaryAgency: 'Transportation'
  },
  'QSL890123456': {
    uei: 'QSL890123456',
    companyName: 'QuantumShield Logistics',
    lifetimeAwards: '$640M',
    activeAwards: '$95M',
    revenue: '$95M',
    pipeline: '$155M',
    contractCount: 52,
    primaryAgency: 'Defense'
  },
  'NGE123456780': {
    uei: 'NGE123456780',
    companyName: 'NextGen Environmental Solutions',
    lifetimeAwards: '$420M',
    activeAwards: '$65M',
    revenue: '$65M',
    pipeline: '$120M',
    contractCount: 38,
    primaryAgency: 'Environmental Protection Agency'
  }
};

// Get metrics for a specific contractor by UEI
export const getContractorMetrics = (uei: string): ContractorMetrics | null => {
  return contractorMetricsData[uei] || null;
};

// Get metrics for a specific contractor by company name (fallback)
export const getContractorMetricsByName = (companyName: string): ContractorMetrics | null => {
  const found = Object.values(contractorMetricsData).find(
    metrics => metrics.companyName.toLowerCase().includes(companyName.toLowerCase()) ||
               companyName.toLowerCase().includes(metrics.companyName.toLowerCase())
  );
  return found || null;
};

// Add or update contractor metrics
export const setContractorMetrics = (uei: string, metrics: ContractorMetrics): void => {
  contractorMetricsData[uei] = metrics;
};

// Get all contractor metrics
export const getAllContractorMetrics = (): Record<string, ContractorMetrics> => {
  return { ...contractorMetricsData };
};

// Default metrics for unknown contractors
export const getDefaultMetrics = (uei: string, companyName: string): ContractorMetrics => {
  return {
    uei,
    companyName,
    lifetimeAwards: '$500M',
    activeAwards: '$100M',
    revenue: '$100M',
    pipeline: '$200M',
    contractCount: 50
  };
};