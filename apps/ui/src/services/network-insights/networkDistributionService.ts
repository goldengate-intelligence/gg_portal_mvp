/**
 * Network Distribution Service
 *
 * Processes activity events into network distribution categories:
 * - Agency Clients (Government inflows)
 * - Prime Clients (Contractor inflows)
 * - Sub Vendors (All outflows)
 */

import type { ActivityEvent } from '../../components/contractor-detail/tabs/network/types';

export interface NetworkRelationship {
  entityUei: string;
  entityName: string;
  totalAmount: number;
  percentage: number;
  isActive: boolean;
}

export interface NetworkDistributionData {
  agencyDirectAwards: {
    totalAmount: number;
    relationships: NetworkRelationship[];
  };
  primeSubAwards: {
    totalAmount: number;
    relationships: NetworkRelationship[];
  };
  vendorProcurement: {
    totalAmount: number;
    relationships: NetworkRelationship[];
  };
}

/**
 * Filter for active obligations only
 * Only include contracts that are currently active (not expired/completed)
 */
function isActiveObligation(event: ActivityEvent): boolean {
  // Check if the award is still active based on performance dates
  if (event.awardEndDate) {
    const endDate = new Date(event.awardEndDate);
    const today = new Date();
    return endDate >= today;
  }

  // If no end date, consider active if it's recent (within last 2 years)
  if (event.eventDate) {
    const eventDate = new Date(event.eventDate);
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    return eventDate >= twoYearsAgo;
  }

  return false;
}

/**
 * Aggregate relationships by entity UEI and calculate totals
 */
function aggregateRelationships(events: ActivityEvent[]): NetworkRelationship[] {
  const relationshipMap = new Map<string, {
    entityUei: string;
    entityName: string;
    totalAmount: number;
  }>();

  // Aggregate by entity UEI
  events.forEach(event => {
    if (!event.relatedEntityUei || !event.relatedEntityName) return;

    const key = event.relatedEntityUei;
    const existing = relationshipMap.get(key);

    if (existing) {
      existing.totalAmount += Math.abs(event.eventAmount);
    } else {
      relationshipMap.set(key, {
        entityUei: event.relatedEntityUei,
        entityName: event.relatedEntityName,
        totalAmount: Math.abs(event.eventAmount)
      });
    }
  });

  // Convert to array and calculate total for percentages
  const relationships = Array.from(relationshipMap.values());
  const totalAmount = relationships.reduce((sum, rel) => sum + rel.totalAmount, 0);

  // Add percentages and sort by amount descending
  return relationships
    .map(rel => ({
      ...rel,
      percentage: totalAmount > 0 ? (rel.totalAmount / totalAmount) * 100 : 0,
      isActive: true
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

/**
 * Process activity events into network distribution categories
 */
export function processNetworkDistribution(activityEvents: ActivityEvent[]): NetworkDistributionData {
  // Filter for active obligations only
  const activeEvents = activityEvents.filter(isActiveObligation);

  // Split into categories based on flow direction and entity type
  const agencyInflows = activeEvents.filter(event =>
    event.flowDirection === 'INFLOW' &&
    event.relatedEntityType === 'GOVERNMENT' &&
    event.eventAmount > 0
  );

  const primeInflows = activeEvents.filter(event =>
    event.flowDirection === 'INFLOW' &&
    event.relatedEntityType === 'CONTRACTOR' &&
    event.eventAmount > 0
  );

  const vendorOutflows = activeEvents.filter(event =>
    event.flowDirection === 'OUTFLOW' &&
    event.eventAmount > 0
  );

  // Aggregate relationships for each category
  const agencyRelationships = aggregateRelationships(agencyInflows);
  const primeRelationships = aggregateRelationships(primeInflows);
  const vendorRelationships = aggregateRelationships(vendorOutflows);

  // Calculate totals
  const agencyTotal = agencyRelationships.reduce((sum, rel) => sum + rel.totalAmount, 0);
  const primeTotal = primeRelationships.reduce((sum, rel) => sum + rel.totalAmount, 0);
  const vendorTotal = vendorRelationships.reduce((sum, rel) => sum + rel.totalAmount, 0);

  return {
    agencyDirectAwards: {
      totalAmount: agencyTotal,
      relationships: agencyRelationships
    },
    primeSubAwards: {
      totalAmount: primeTotal,
      relationships: primeRelationships
    },
    vendorProcurement: {
      totalAmount: vendorTotal,
      relationships: vendorRelationships
    }
  };
}

/**
 * Format monetary values for display
 */
export function formatNetworkAmount(amount: number): string {
  if (amount >= 1_000_000_000) {
    const billions = amount / 1_000_000_000;
    return `$${billions.toFixed(1).replace('.0', '')}B`;
  } else if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `$${millions.toFixed(1).replace('.0', '')}M`;
  } else if (amount >= 1_000) {
    const thousands = amount / 1_000;
    return `$${thousands.toFixed(1).replace('.0', '')}K`;
  } else {
    return `$${amount.toFixed(0)}`;
  }
}

/**
 * Format percentage for display
 */
export function formatNetworkPercentage(percentage: number): string {
  if (percentage >= 10) {
    return `${percentage.toFixed(0)}%`;
  } else if (percentage >= 1) {
    return `${percentage.toFixed(1)}%`;
  } else {
    return `${percentage.toFixed(2)}%`;
  }
}