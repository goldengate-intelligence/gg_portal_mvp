// Network Tab Types
// Based on unified activity events data structure

export interface NetworkNode {
  uei: string;
  name: string;
  type: 'contractor' | 'agency' | 'prime' | 'sub';
  location: {
    state?: string;
    city?: string;
    coordinates?: [number, number]; // [lng, lat] for map visualization
  };
  metrics: {
    totalActiveValue: number;
    activeAwardsCount: number;
    relationshipCount: number;
  };
  isMainContractor: boolean;
}

export interface NetworkEdge {
  id: string; // unique edge identifier
  source: string; // source node UEI
  target: string; // target node UEI
  direction: 'inflow' | 'outflow'; // from main contractor perspective
  relationshipType: 'PRIME' | 'SUBAWARD' | 'SUBSIDIARY_OBLIGATION';
  metrics: {
    activeAwards: number;
    totalValue: number;
    strength: number; // calculated relationship strength (0-100)
    avgAwardSize: number;
  };
  geographic: {
    performanceStates: string[];
    performanceCities: string[];
  };
  temporal: {
    earliestStart: string;
    latestEnd: string;
    isCurrentlyActive: boolean;
  };
}

export interface NetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  mainContractor: NetworkNode;
  summary: NetworkSummary;
}

export interface NetworkSummary {
  totalActiveValue: number;
  totalRelationships: number;
  inflowRelationships: number;
  outflowRelationships: number;
  geographicReach: {
    states: number;
    cities: number;
    primaryState: string;
  };
  relationshipTypes: {
    agencies: number;
    primes: number;
    subs: number;
    subsidiaries: number;
  };
}

export interface GeographicCluster {
  state: string;
  city?: string;
  coordinates: [number, number];
  relationships: NetworkEdge[];
  totalValue: number;
  nodeCount: number;
}

export interface NetworkFilters {
  relationshipTypes: string[];
  minValue: number;
  maxValue: number;
  states: string[];
  activeOnly: boolean;
  timeRange: {
    start: string;
    end: string;
  };
}

export interface NetworkVisualizationProps {
  networkData: NetworkData;
  filters: NetworkFilters;
  onNodeClick: (node: NetworkNode) => void;
  onEdgeClick: (edge: NetworkEdge) => void;
  onFilterChange: (filters: NetworkFilters) => void;
}

export interface MapVisualizationProps {
  clusters: GeographicCluster[];
  networkData: NetworkData;
  filters: NetworkFilters;
  onClusterClick: (cluster: GeographicCluster) => void;
  onFilterChange: (filters: NetworkFilters) => void;
}

// Raw activity event interface (from API)
export interface ActivityEvent {
  EVENT_ID: string;
  CONTRACTOR_UEI: string;
  CONTRACTOR_NAME: string;
  RELATED_ENTITY_UEI: string;
  RELATED_ENTITY_NAME: string;
  RELATED_ENTITY_TYPE: string;
  FLOW_DIRECTION: 'INFLOW' | 'OUTFLOW';
  EVENT_TYPE: 'PRIME' | 'SUBAWARD' | 'SUBSIDIARY_OBLIGATION';
  EVENT_AMOUNT: number;
  AWARD_KEY: string;
  AWARD_TOTAL_VALUE: number;
  AWARD_START_DATE: string;
  AWARD_END_DATE: string;
  AWARD_POTENTIAL_END_DATE: string;
  CONTRACTOR_STATE: string;
  CONTRACTOR_CITY: string;
  PERFORMANCE_STATE: string;
  PERFORMANCE_CITY: string;
  EVENT_DATE: string;
  FISCAL_YEAR: number;
  NAICS_CODE: string;
  NAICS_DESCRIPTION: string;
  PSC_CODE: string;
  AWARD_TYPE: string;
}