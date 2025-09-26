// Network Tab Utilities
// Client-side aggregation logic for contractor network analysis

import type {
  ActivityEvent,
  NetworkData,
  NetworkNode,
  NetworkEdge,
  NetworkSummary,
  GeographicCluster,
  NetworkFilters
} from './types';

/**
 * Main function to transform activity events into network data
 */
export function buildNetworkData(
  activityEvents: ActivityEvent[],
  mainContractorUEI: string
): NetworkData {
  // Filter for active awards only
  const activeEvents = filterActiveAwards(activityEvents);

  // Build nodes (contractors and related entities)
  const nodes = buildNetworkNodes(activeEvents, mainContractorUEI);

  // Build edges (relationships between entities)
  const edges = buildNetworkEdges(activeEvents, mainContractorUEI);

  // Find main contractor node
  const mainContractor = nodes.find(n => n.uei === mainContractorUEI)!;

  // Generate summary statistics
  const summary = generateNetworkSummary(nodes, edges, activeEvents);

  return {
    nodes,
    edges,
    mainContractor,
    summary
  };
}

/**
 * Filter events to only include currently active awards
 */
function filterActiveAwards(events: ActivityEvent[]): ActivityEvent[] {
  const currentDate = new Date();

  return events.filter(event => {
    const startDate = new Date(event.AWARD_START_DATE);
    const endDate = new Date(event.AWARD_END_DATE || event.AWARD_POTENTIAL_END_DATE);

    return currentDate >= startDate && currentDate <= endDate;
  });
}

/**
 * Build network nodes from activity events
 */
function buildNetworkNodes(
  events: ActivityEvent[],
  mainContractorUEI: string
): NetworkNode[] {
  const nodeMap = new Map<string, NetworkNode>();

  events.forEach(event => {
    // Add main contractor node
    if (!nodeMap.has(event.CONTRACTOR_UEI)) {
      nodeMap.set(event.CONTRACTOR_UEI, {
        uei: event.CONTRACTOR_UEI,
        name: event.CONTRACTOR_NAME,
        type: 'contractor',
        location: {
          state: event.CONTRACTOR_STATE,
          city: event.CONTRACTOR_CITY
        },
        metrics: {
          totalActiveValue: 0,
          activeAwardsCount: 0,
          relationshipCount: 0
        },
        isMainContractor: event.CONTRACTOR_UEI === mainContractorUEI
      });
    }

    // Add related entity node
    if (!nodeMap.has(event.RELATED_ENTITY_UEI)) {
      const nodeType = determineNodeType(event.RELATED_ENTITY_TYPE, event.EVENT_TYPE);

      nodeMap.set(event.RELATED_ENTITY_UEI, {
        uei: event.RELATED_ENTITY_UEI,
        name: event.RELATED_ENTITY_NAME,
        type: nodeType,
        location: {
          state: event.PERFORMANCE_STATE,
          city: event.PERFORMANCE_CITY
        },
        metrics: {
          totalActiveValue: 0,
          activeAwardsCount: 0,
          relationshipCount: 0
        },
        isMainContractor: false
      });
    }
  });

  // Calculate node metrics
  const nodes = Array.from(nodeMap.values());
  nodes.forEach(node => {
    const nodeEvents = events.filter(e =>
      e.CONTRACTOR_UEI === node.uei || e.RELATED_ENTITY_UEI === node.uei
    );

    node.metrics = {
      totalActiveValue: calculateNodeValue(nodeEvents, node.uei),
      activeAwardsCount: new Set(nodeEvents.map(e => e.AWARD_KEY)).size,
      relationshipCount: new Set(nodeEvents.map(e =>
        e.CONTRACTOR_UEI === node.uei ? e.RELATED_ENTITY_UEI : e.CONTRACTOR_UEI
      )).size
    };
  });

  return nodes;
}

/**
 * Build network edges from activity events
 */
function buildNetworkEdges(
  events: ActivityEvent[],
  mainContractorUEI: string
): NetworkEdge[] {
  // Group events by contractor-related entity pairs
  const edgeGroups = new Map<string, ActivityEvent[]>();

  events.forEach(event => {
    const edgeKey = `${event.CONTRACTOR_UEI}-${event.RELATED_ENTITY_UEI}`;

    if (!edgeGroups.has(edgeKey)) {
      edgeGroups.set(edgeKey, []);
    }
    edgeGroups.get(edgeKey)!.push(event);
  });

  // Build edges from grouped events
  const edges: NetworkEdge[] = [];

  edgeGroups.forEach((groupEvents, edgeKey) => {
    const [sourceUEI, targetUEI] = edgeKey.split('-');
    const firstEvent = groupEvents[0];

    // Determine direction from main contractor perspective
    const direction = sourceUEI === mainContractorUEI ? 'outflow' : 'inflow';

    // Calculate edge metrics
    const uniqueAwards = new Set(groupEvents.map(e => e.AWARD_KEY));
    const totalValue = groupEvents.reduce((sum, e) => sum + e.AWARD_TOTAL_VALUE, 0);
    const avgAwardSize = totalValue / uniqueAwards.size;

    // Geographic analysis
    const performanceStates = [...new Set(groupEvents.map(e => e.PERFORMANCE_STATE).filter(Boolean))];
    const performanceCities = [...new Set(groupEvents.map(e => e.PERFORMANCE_CITY).filter(Boolean))];

    // Temporal analysis
    const startDates = groupEvents.map(e => new Date(e.AWARD_START_DATE));
    const endDates = groupEvents.map(e => new Date(e.AWARD_END_DATE || e.AWARD_POTENTIAL_END_DATE));

    edges.push({
      id: edgeKey,
      source: sourceUEI,
      target: targetUEI,
      direction,
      relationshipType: firstEvent.EVENT_TYPE,
      metrics: {
        activeAwards: uniqueAwards.size,
        totalValue,
        strength: calculateRelationshipStrength(totalValue, uniqueAwards.size, avgAwardSize),
        avgAwardSize
      },
      geographic: {
        performanceStates,
        performanceCities
      },
      temporal: {
        earliestStart: new Date(Math.min(...startDates.map(d => d.getTime()))).toISOString(),
        latestEnd: new Date(Math.max(...endDates.map(d => d.getTime()))).toISOString(),
        isCurrentlyActive: true // Already filtered for active awards
      }
    });
  });

  return edges;
}

/**
 * Generate network summary statistics
 */
function generateNetworkSummary(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  events: ActivityEvent[]
): NetworkSummary {
  const mainNode = nodes.find(n => n.isMainContractor)!;

  // Geographic analysis
  const allStates = new Set<string>();
  const allCities = new Set<string>();
  const stateCounts = new Map<string, number>();

  edges.forEach(edge => {
    edge.geographic.performanceStates.forEach(state => {
      if (state) {
        allStates.add(state);
        stateCounts.set(state, (stateCounts.get(state) || 0) + 1);
      }
    });
    edge.geographic.performanceCities.forEach(city => {
      if (city) allCities.add(city);
    });
  });

  const primaryState = Array.from(stateCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  // Relationship type analysis
  const relationshipTypes = {
    agencies: nodes.filter(n => n.type === 'agency').length,
    primes: nodes.filter(n => n.type === 'prime').length,
    subs: nodes.filter(n => n.type === 'sub').length,
    subsidiaries: edges.filter(e => e.relationshipType === 'SUBSIDIARY_OBLIGATION').length
  };

  return {
    totalActiveValue: mainNode.metrics.totalActiveValue,
    totalRelationships: edges.length,
    inflowRelationships: edges.filter(e => e.direction === 'inflow').length,
    outflowRelationships: edges.filter(e => e.direction === 'outflow').length,
    geographicReach: {
      states: allStates.size,
      cities: allCities.size,
      primaryState
    },
    relationshipTypes
  };
}

/**
 * Build geographic clusters for map visualization
 */
export function buildGeographicClusters(
  networkData: NetworkData,
  filters: NetworkFilters
): GeographicCluster[] {
  const clusterMap = new Map<string, GeographicCluster>();

  // Filter edges based on current filters
  const filteredEdges = applyNetworkFilters(networkData.edges, filters);

  filteredEdges.forEach(edge => {
    edge.geographic.performanceStates.forEach(state => {
      edge.geographic.performanceCities.forEach(city => {
        const clusterKey = `${state}-${city}`;

        if (!clusterMap.has(clusterKey)) {
          clusterMap.set(clusterKey, {
            state,
            city,
            coordinates: getStateCoordinates(state), // Would need coordinate lookup
            relationships: [],
            totalValue: 0,
            nodeCount: 0
          });
        }

        const cluster = clusterMap.get(clusterKey)!;
        cluster.relationships.push(edge);
        cluster.totalValue += edge.metrics.totalValue;
        cluster.nodeCount = new Set([
          ...cluster.relationships.map(e => e.source),
          ...cluster.relationships.map(e => e.target)
        ]).size;
      });
    });
  });

  return Array.from(clusterMap.values())
    .sort((a, b) => b.totalValue - a.totalValue);
}

/**
 * Apply filters to network data
 */
export function applyNetworkFilters(
  edges: NetworkEdge[],
  filters: NetworkFilters
): NetworkEdge[] {
  return edges.filter(edge => {
    // Relationship type filter
    if (filters.relationshipTypes.length > 0 &&
        !filters.relationshipTypes.includes(edge.relationshipType)) {
      return false;
    }

    // Value range filter
    if (edge.metrics.totalValue < filters.minValue ||
        edge.metrics.totalValue > filters.maxValue) {
      return false;
    }

    // Geographic filter
    if (filters.states.length > 0 &&
        !edge.geographic.performanceStates.some(state => filters.states.includes(state))) {
      return false;
    }

    // Time range filter (if needed)
    const edgeStart = new Date(edge.temporal.earliestStart);
    const edgeEnd = new Date(edge.temporal.latestEnd);
    const filterStart = new Date(filters.timeRange.start);
    const filterEnd = new Date(filters.timeRange.end);

    if (edgeEnd < filterStart || edgeStart > filterEnd) {
      return false;
    }

    return true;
  });
}

// Helper functions

function determineNodeType(
  entityType: string,
  eventType: string
): 'agency' | 'prime' | 'sub' | 'contractor' {
  if (entityType === 'GOVERNMENT') return 'agency';
  if (eventType === 'PRIME') return 'prime';
  if (eventType === 'SUBAWARD') return 'sub';
  return 'contractor';
}

function calculateNodeValue(events: ActivityEvent[], nodeUEI: string): number {
  return events
    .filter(e => e.CONTRACTOR_UEI === nodeUEI || e.RELATED_ENTITY_UEI === nodeUEI)
    .reduce((sum, e) => sum + e.AWARD_TOTAL_VALUE, 0);
}

function calculateRelationshipStrength(
  totalValue: number,
  awardCount: number,
  avgAwardSize: number
): number {
  // Normalize to 0-100 scale based on value, count, and size
  const valueScore = Math.min(totalValue / 1000000, 100); // $1M = score of 1
  const countScore = Math.min(awardCount * 10, 50); // 5 awards = score of 50
  const sizeScore = Math.min(avgAwardSize / 100000, 25); // $100K avg = score of 25

  return Math.min(valueScore + countScore + sizeScore, 100);
}

function getStateCoordinates(state: string): [number, number] {
  // This would need a proper state coordinate lookup
  // For now, return default coordinates
  const stateCoords: Record<string, [number, number]> = {
    'CA': [-119.4179, 36.7783],
    'TX': [-99.9018, 31.9686],
    'NY': [-74.2179, 40.7589],
    'FL': [-81.5158, 27.6648],
    // Add more states as needed
  };

  return stateCoords[state] || [-98.5795, 39.8283]; // Center of US as default
}

/**
 * Default filter state
 */
export const defaultNetworkFilters: NetworkFilters = {
  relationshipTypes: [],
  minValue: 0,
  maxValue: Number.MAX_SAFE_INTEGER,
  states: [],
  activeOnly: true,
  timeRange: {
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
    end: new Date().toISOString()
  }
};