// Mock data for the GoldenGate Midas Platform
import type { Contractor, Opportunity, Portfolio, AnalysisResult } from '../types';

// Mock contractors data
export const mockContractors: Contractor[] = [
  {
    id: '1',
    uei: 'XXXXXXXXXXX1',
    name: 'Lockheed Martin Corporation',
    dbaName: 'Lockheed Martin',
    industry: 'defense',
    location: 'US',
    state: 'MD',
    annualRevenue: 67044000000,
    employeeCount: 116000,
    foundedYear: 1995,
    lifecycleStage: 'active',
    businessMomentum: 'steady-growth',
    ownershipType: 'public',
    totalContractValue: 45000000000,
    activeContracts: 1245,
    pastPerformanceScore: 96,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-08-01'),
    lastVerified: new Date('2024-07-30'),
  },
  {
    id: '2',
    uei: 'XXXXXXXXXXX2',
    name: 'General Dynamics Corporation',
    industry: 'defense',
    location: 'US',
    state: 'VA',
    annualRevenue: 39407000000,
    employeeCount: 106500,
    foundedYear: 1952,
    lifecycleStage: 'active',
    businessMomentum: 'high-growth',
    ownershipType: 'public',
    totalContractValue: 32000000000,
    activeContracts: 892,
    pastPerformanceScore: 94,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-08-01'),
    lastVerified: new Date('2024-07-28'),
  },
  {
    id: '3',
    uei: 'XXXXXXXXXXX3',
    name: 'Accenture Federal Services',
    industry: 'information-technology',
    location: 'US',
    state: 'VA',
    annualRevenue: 2500000000,
    employeeCount: 15000,
    foundedYear: 2004,
    lifecycleStage: 'active',
    businessMomentum: 'high-growth',
    ownershipType: 'public',
    totalContractValue: 8500000000,
    activeContracts: 456,
    pastPerformanceScore: 89,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-08-01'),
    lastVerified: new Date('2024-07-25'),
  },
  {
    id: '4',
    uei: 'XXXXXXXXXXX4',
    name: 'Booz Allen Hamilton Inc.',
    industry: 'professional-services',
    location: 'US',
    state: 'VA',
    annualRevenue: 8300000000,
    employeeCount: 31400,
    foundedYear: 1914,
    lifecycleStage: 'active',
    businessMomentum: 'steady-growth',
    ownershipType: 'public',
    totalContractValue: 12000000000,
    activeContracts: 678,
    pastPerformanceScore: 91,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-08-01'),
    lastVerified: new Date('2024-07-29'),
  },
  {
    id: '5',
    uei: 'XXXXXXXXXXX5',
    name: 'Raytheon Technologies Corporation',
    industry: 'defense',
    location: 'US',
    state: 'MA',
    annualRevenue: 64388000000,
    employeeCount: 180000,
    foundedYear: 2020,
    lifecycleStage: 'active',
    businessMomentum: 'steady-growth',
    ownershipType: 'public',
    totalContractValue: 38000000000,
    activeContracts: 1134,
    pastPerformanceScore: 93,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-08-01'),
    lastVerified: new Date('2024-07-31'),
  },
  {
    id: '6',
    uei: 'XXXXXXXXXXX6',
    name: 'CACI International Inc',
    industry: 'information-technology',
    location: 'US',
    state: 'VA',
    annualRevenue: 6040000000,
    employeeCount: 23000,
    foundedYear: 1962,
    lifecycleStage: 'active',
    businessMomentum: 'high-growth',
    ownershipType: 'public',
    totalContractValue: 4200000000,
    activeContracts: 234,
    pastPerformanceScore: 87,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-08-01'),
    lastVerified: new Date('2024-07-26'),
  },
  {
    id: '7',
    uei: 'XXXXXXXXXXX7',
    name: 'Fluor Corporation',
    industry: 'construction',
    location: 'US',
    state: 'TX',
    annualRevenue: 12351000000,
    employeeCount: 44000,
    foundedYear: 1912,
    lifecycleStage: 'active',
    businessMomentum: 'stable',
    ownershipType: 'public',
    totalContractValue: 2800000000,
    activeContracts: 156,
    pastPerformanceScore: 85,
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-08-01'),
    lastVerified: new Date('2024-07-27'),
  },
  {
    id: '8',
    uei: 'XXXXXXXXXXX8',
    name: 'SAIC, Inc.',
    industry: 'information-technology',
    location: 'US',
    state: 'VA',
    annualRevenue: 7123000000,
    employeeCount: 25600,
    foundedYear: 2013,
    lifecycleStage: 'active',
    businessMomentum: 'steady-growth',
    ownershipType: 'public',
    totalContractValue: 5600000000,
    activeContracts: 312,
    pastPerformanceScore: 88,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-08-01'),
    lastVerified: new Date('2024-07-30'),
  },
];

// Mock opportunities data
export const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    piid: 'W91WAW-24-R-0001',
    type: 'AWD',
    title: 'Next Generation Combat Vehicle Systems Integration',
    description: 'Development and integration of advanced combat vehicle systems for next-generation military applications.',
    agency: 'Department of Defense',
    subAgency: 'Army Contracting Command',
    totalValue: 2500000000,
    baseValue: 1800000000,
    optionValue: 700000000,
    postedDate: new Date('2024-03-15'),
    responseDeadline: new Date('2024-09-15'),
    startDate: new Date('2024-10-01'),
    endDate: new Date('2029-09-30'),
    naicsCode: '336992',
    setAsideType: 'Unrestricted',
    placeOfPerformance: 'Warren, MI',
    riskLevel: 'high',
    competitionLevel: 'full-open',
    incumbent: 'General Dynamics Land Systems',
    aiSummary: 'High-value combat vehicle contract with significant technology requirements and multiple option periods.',
    keyRequirements: ['Systems Integration', 'Advanced Materials', 'Cybersecurity', 'Testing & Validation'],
    estimatedCompetitors: 8,
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-08-01'),
  },
  {
    id: '2',
    piid: 'GS-35F-0119Y',
    type: 'IDV',
    title: 'Enterprise Infrastructure Solutions (EIS)',
    description: 'Comprehensive IT infrastructure services including cloud, network, and security solutions.',
    agency: 'General Services Administration',
    totalValue: 50000000000,
    postedDate: new Date('2017-09-28'),
    startDate: new Date('2018-08-01'),
    endDate: new Date('2032-07-31'),
    expiryDate: new Date('2032-07-31'),
    naicsCode: '541511',
    setAsideType: 'Unrestricted',
    placeOfPerformance: 'Nationwide',
    riskLevel: 'medium',
    competitionLevel: 'full-open',
    aiSummary: 'Large-scale indefinite delivery vehicle for federal IT infrastructure modernization.',
    keyRequirements: ['Cloud Services', 'Network Infrastructure', 'Cybersecurity', 'Legacy System Migration'],
    estimatedCompetitors: 25,
    createdAt: new Date('2017-09-28'),
    updatedAt: new Date('2024-08-01'),
  },
  {
    id: '3',
    piid: 'HHSM-500-2024-00001C',
    type: 'AWD',
    title: 'Healthcare Analytics and Data Management Services',
    description: 'Advanced analytics and data management services for healthcare program optimization.',
    agency: 'Department of Health and Human Services',
    subAgency: 'Centers for Medicare & Medicaid Services',
    totalValue: 450000000,
    baseValue: 300000000,
    optionValue: 150000000,
    postedDate: new Date('2024-01-10'),
    responseDeadline: new Date('2024-07-10'),
    startDate: new Date('2024-08-01'),
    endDate: new Date('2027-07-31'),
    naicsCode: '541511',
    setAsideType: 'Small Business',
    placeOfPerformance: 'Baltimore, MD',
    riskLevel: 'medium',
    competitionLevel: 'limited',
    aiSummary: 'Healthcare data analytics contract with focus on Medicare and Medicaid program improvement.',
    keyRequirements: ['Healthcare Analytics', 'Data Management', 'HIPAA Compliance', 'Machine Learning'],
    estimatedCompetitors: 12,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-08-01'),
  },
  {
    id: '4',
    piid: 'SP0600-24-D-0001',
    type: 'IDV',
    title: 'Defense Logistics Agency IT Services',
    description: 'Comprehensive IT support services for Defense Logistics Agency operations worldwide.',
    agency: 'Department of Defense',
    subAgency: 'Defense Logistics Agency',
    totalValue: 1200000000,
    postedDate: new Date('2024-02-01'),
    responseDeadline: new Date('2024-08-01'),
    startDate: new Date('2024-09-01'),
    endDate: new Date('2029-08-31'),
    naicsCode: '541512',
    setAsideType: 'Unrestricted',
    placeOfPerformance: 'Fort Belvoir, VA',
    riskLevel: 'low',
    competitionLevel: 'full-open',
    aiSummary: 'Multi-billion dollar IT services contract supporting global logistics operations.',
    keyRequirements: ['IT Support', 'Help Desk Services', 'Infrastructure Management', 'Security Operations'],
    estimatedCompetitors: 15,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-08-01'),
  },
];

// Mock portfolios data
export const mockPortfolios: Portfolio[] = [
  {
    id: '1',
    name: 'Defense Prime Contractors',
    description: 'Major defense contractors with significant federal contract portfolios',
    userId: 'user1',
    organizationId: 'org1',
    contractors: [
      {
        id: '1',
        contractorId: '1',
        contractor: mockContractors[0],
        addedAt: new Date('2024-06-01'),
        priority: 'high',
        notes: 'Key defense contractor with strong performance history',
        tags: ['prime', 'defense', 'established'],
        alertsEnabled: true,
        lastReviewed: new Date('2024-07-30'),
        sortOrder: 1,
      },
      {
        id: '2',
        contractorId: '2',
        contractor: mockContractors[1],
        addedAt: new Date('2024-06-02'),
        priority: 'high',
        notes: 'Growing defense portfolio, strong in naval systems',
        tags: ['prime', 'defense', 'naval'],
        alertsEnabled: true,
        lastReviewed: new Date('2024-07-28'),
        sortOrder: 2,
      },
      {
        id: '3',
        contractorId: '5',
        contractor: mockContractors[4],
        addedAt: new Date('2024-06-03'),
        priority: 'medium',
        notes: 'Recent merger, monitoring integration progress',
        tags: ['prime', 'defense', 'aerospace'],
        alertsEnabled: true,
        lastReviewed: new Date('2024-07-31'),
        sortOrder: 3,
      },
    ],
    totalValue: 115000000000,
    averageRisk: 'medium',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-07-31'),
    lastAnalyzed: new Date('2024-07-30'),
  },
  {
    id: '2',
    name: 'IT Services Leaders',
    description: 'Top federal IT service providers and system integrators',
    userId: 'user1',
    organizationId: 'org1',
    contractors: [
      {
        id: '4',
        contractorId: '3',
        contractor: mockContractors[2],
        addedAt: new Date('2024-06-15'),
        priority: 'high',
        notes: 'Strong federal presence, growing cloud capabilities',
        tags: ['IT', 'cloud', 'consulting'],
        alertsEnabled: true,
        lastReviewed: new Date('2024-07-25'),
        sortOrder: 1,
      },
      {
        id: '5',
        contractorId: '6',
        contractor: mockContractors[5],
        addedAt: new Date('2024-06-16'),
        priority: 'medium',
        notes: 'Specialized in intelligence community contracts',
        tags: ['IT', 'intelligence', 'cybersecurity'],
        alertsEnabled: false,
        lastReviewed: new Date('2024-07-26'),
        sortOrder: 2,
      },
      {
        id: '6',
        contractorId: '8',
        contractor: mockContractors[7],
        addedAt: new Date('2024-06-17'),
        priority: 'medium',
        notes: 'Solid technical capabilities, good past performance',
        tags: ['IT', 'engineering', 'support'],
        alertsEnabled: true,
        lastReviewed: new Date('2024-07-30'),
        sortOrder: 3,
      },
    ],
    totalValue: 18220000000,
    averageRisk: 'low',
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-07-30'),
    lastAnalyzed: new Date('2024-07-29'),
  },
];

// Mock analysis results
export const mockAnalysisResults: AnalysisResult[] = [
  {
    id: '1',
    type: 'revenue-analytics',
    contractorId: '1',
    userId: 'user1',
    summary: 'Lockheed Martin shows strong revenue growth with consistent federal contract performance. Revenue has grown 8.2% annually over the past 5 years.',
    keyFindings: [
      'Consistent 8.2% annual revenue growth',
      '67% of revenue from federal contracts',
      'Strong performance in aerospace and defense sectors',
      'Diversified contract portfolio reduces risk',
    ],
    riskAssessment: 'low',
    confidence: 92,
    metrics: {
      revenueGrowth: 8.2,
      federalRevenue: 67,
      contractDiversification: 85,
      performanceScore: 96,
    },
    charts: [
      {
        id: 'revenue-trend',
        type: 'line',
        title: '5-Year Revenue Trend',
        description: 'Revenue growth over the past 5 years',
        data: [
          { year: 2020, revenue: 65398000000 },
          { year: 2021, revenue: 67044000000 },
          { year: 2022, revenue: 65984000000 },
          { year: 2023, revenue: 67000000000 },
          { year: 2024, revenue: 67044000000 },
        ],
        config: { currency: true },
      },
    ],
    comparisons: [
      {
        metric: 'Annual Revenue',
        target: 67044000000,
        peer_average: 45000000000,
        percentile: 95,
        trend: 'up',
      },
      {
        metric: 'Past Performance Score',
        target: 96,
        peer_average: 87,
        percentile: 92,
        trend: 'stable',
      },
    ],
    createdAt: new Date('2024-07-30'),
    parameters: {
      timeframe: '5-years',
      includeSubcontractors: true,
      sectors: ['defense', 'aerospace'],
    },
    executionTime: 2340,
  },
  {
    id: '2',
    type: 'forensic-due-diligence',
    contractorId: '3',
    userId: 'user1',
    summary: 'Accenture Federal Services demonstrates strong compliance record with no significant regulatory issues. Minor concerns around subcontractor management processes.',
    keyFindings: [
      'Clean compliance record over past 3 years',
      'No significant regulatory violations',
      'Strong cybersecurity posture',
      'Minor gaps in subcontractor oversight',
    ],
    riskAssessment: 'low',
    confidence: 88,
    metrics: {
      complianceScore: 94,
      cybersecurityRating: 92,
      financialStability: 89,
      operationalRisk: 15,
    },
    charts: [
      {
        id: 'compliance-history',
        type: 'bar',
        title: 'Compliance Score History',
        description: 'Compliance scores over the past 3 years',
        data: [
          { year: 2022, score: 91 },
          { year: 2023, score: 93 },
          { year: 2024, score: 94 },
        ],
        config: { maxValue: 100 },
      },
    ],
    comparisons: [
      {
        metric: 'Compliance Score',
        target: 94,
        peer_average: 87,
        percentile: 78,
        trend: 'up',
      },
    ],
    createdAt: new Date('2024-07-28'),
    parameters: {
      includeCybersecurity: true,
      lookbackPeriod: 36,
      includeSubcontractors: true,
    },
    executionTime: 4120,
  },
];

// Helper functions for mock data
export const getContractorById = (id: string): Contractor | undefined => {
  return mockContractors.find(contractor => contractor.id === id);
};

export const getOpportunityById = (id: string): Opportunity | undefined => {
  return mockOpportunities.find(opportunity => opportunity.id === id);
};

export const getPortfolioById = (id: string): Portfolio | undefined => {
  return mockPortfolios.find(portfolio => portfolio.id === id);
};

export const getContractorsByIndustry = (industry: string): Contractor[] => {
  return mockContractors.filter(contractor => contractor.industry === industry);
};

export const getOpportunitiesByAgency = (agency: string): Opportunity[] => {
  return mockOpportunities.filter(opportunity => opportunity.agency === agency);
};

export const getAnalysisResultsByContractor = (contractorId: string): AnalysisResult[] => {
  return mockAnalysisResults.filter(result => result.contractorId === contractorId);
};

// Search simulation functions
export const searchContractors = (query: string): Contractor[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockContractors.filter(contractor =>
    contractor.name.toLowerCase().includes(lowercaseQuery) ||
    contractor.dbaName?.toLowerCase().includes(lowercaseQuery) ||
    contractor.uei.toLowerCase().includes(lowercaseQuery)
  );
};

export const searchOpportunities = (query: string): Opportunity[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockOpportunities.filter(opportunity =>
    opportunity.title.toLowerCase().includes(lowercaseQuery) ||
    opportunity.description.toLowerCase().includes(lowercaseQuery) ||
    opportunity.piid.toLowerCase().includes(lowercaseQuery) ||
    opportunity.agency.toLowerCase().includes(lowercaseQuery)
  );
};

// Generate additional mock data for development
export const generateMockContractor = (overrides: Partial<Contractor> = {}): Contractor => {
  const industries = ['defense', 'information-technology', 'construction', 'professional-services'];
  const states = ['VA', 'MD', 'TX', 'CA', 'NY', 'FL'];
  const lifecycleStages = ['pre-award', 'active', 'option-period', 'expiring'];
  const momentum = ['high-growth', 'steady-growth', 'stable', 'declining'];
  const ownership = ['public', 'private', 'government', 'non-profit'];

  const baseId = Date.now().toString();
  
  return {
    id: baseId,
    uei: `MOCK${baseId.slice(-8)}`,
    name: `Mock Contractor ${baseId.slice(-4)}`,
    industry: industries[Math.floor(Math.random() * industries.length)] as any,
    location: 'US',
    state: states[Math.floor(Math.random() * states.length)],
    annualRevenue: Math.floor(Math.random() * 10000000000) + 1000000,
    employeeCount: Math.floor(Math.random() * 50000) + 100,
    foundedYear: Math.floor(Math.random() * 50) + 1970,
    lifecycleStage: lifecycleStages[Math.floor(Math.random() * lifecycleStages.length)] as any,
    businessMomentum: momentum[Math.floor(Math.random() * momentum.length)] as any,
    ownershipType: ownership[Math.floor(Math.random() * ownership.length)] as any,
    totalContractValue: Math.floor(Math.random() * 5000000000) + 1000000,
    activeContracts: Math.floor(Math.random() * 500) + 10,
    pastPerformanceScore: Math.floor(Math.random() * 20) + 80,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastVerified: new Date(),
    ...overrides,
  };
};