import { useMemo } from "react";
import { getContractData } from "../logic/contractData";
import {
	groupByRelationship,
	separateContracts,
	sortInflowRelationships,
} from "../logic/contractGrouping";
import type { ActivityEvent } from "../../network/types";
import type { Contract } from "../types";

// Transform activity events into the format expected by existing logic
const transformActivityEvents = (activityEvents: ActivityEvent[]) => {
	if (!activityEvents?.length) return [];

	// Helper function to format currency
	const formatCurrency = (amount: number): string => {
		if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
		if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
		if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
		return `$${Math.round(amount).toLocaleString()}`;
	};

	// Helper function to format dates
	const formatDate = (dateStr: string): string => {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
	};

	// Helper function to calculate utilization percentage
	const calculateUtilization = (startDate: string, endDate: string, totalValue: number): number => {
		if (!startDate || !endDate || !totalValue) return 0;

		const start = new Date(startDate);
		const end = new Date(endDate);
		const now = new Date();

		if (now < start) return 0; // Not started yet
		if (now > end) return 100; // Completed

		const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
		const elapsedDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

		return Math.min(Math.max(Math.round((elapsedDays / totalDays) * 100), 0), 100);
	};

	// Group activity events by AWARD_KEY to create contracts
	const contractMap = new Map<string, Contract>();

	activityEvents.forEach(event => {
		const contractId = event.AWARD_KEY;

		if (!contractMap.has(contractId)) {
			// Determine role and client type based on event
			const role = event.EVENT_TYPE === 'PRIME' ? 'prime' : 'sub';
			const clientType = event.RELATED_ENTITY_TYPE?.toLowerCase() === 'government' ? 'agency' :
							  event.EVENT_TYPE === 'PRIME' ? 'agency' : 'prime';

			// Create a descriptive name based on NAICS description
			const description = event.NAICS_DESCRIPTION ||
							   `Contract services for ${event.NAICS_CODE}` ||
							   'Professional services';

			const contract: Contract = {
				parentAward: contractId,
				id: contractId,
				role,
				client: event.RELATED_ENTITY_NAME || 'Unknown Entity',
				clientType: clientType as 'agency' | 'prime' | 'sub',
				desc: description,
				totalValue: formatCurrency(event.AWARD_TOTAL_VALUE || 0),
				currentValue: formatCurrency(event.AWARD_TOTAL_VALUE || 0),
				mods: 1, // Count of events for this award
				start: formatDate(event.AWARD_START_DATE),
				end: formatDate(event.AWARD_END_DATE || event.AWARD_POTENTIAL_END_DATE),
				naics: event.NAICS_CODE || '',
				psc: event.PSC_CODE || '',
				type: event.AWARD_TYPE || (role === 'prime' ? 'PRIME CONTRACT' : 'SUBCONTRACT'),
				utilization: calculateUtilization(
					event.AWARD_START_DATE,
					event.AWARD_END_DATE || event.AWARD_POTENTIAL_END_DATE,
					event.AWARD_TOTAL_VALUE || 0
				),
				subTo: role === 'sub' ? event.RELATED_ENTITY_NAME : null
			};

			contractMap.set(contractId, contract);
		} else {
			// Update existing contract with additional event data
			const existing = contractMap.get(contractId)!;
			existing.mods += 1; // Increment modification count

			// Update dates if this event has more recent information
			if (event.AWARD_START_DATE && !existing.start) {
				existing.start = formatDate(event.AWARD_START_DATE);
			}
			if ((event.AWARD_END_DATE || event.AWARD_POTENTIAL_END_DATE) && !existing.end) {
				existing.end = formatDate(event.AWARD_END_DATE || event.AWARD_POTENTIAL_END_DATE);
			}
		}
	});

	return Array.from(contractMap.values());
};

export const useContractData = (activityEvents?: ActivityEvent[]) => {
	const contracts = useMemo(() => {
		if (activityEvents) {
			return transformActivityEvents(activityEvents);
		}
		return getContractData();
	}, [activityEvents]);

	const { inflowContracts, outflowContracts } = useMemo(
		() => separateContracts(contracts),
		[contracts],
	);

	const inflowRelationships = useMemo(
		() => groupByRelationship(inflowContracts),
		[inflowContracts],
	);

	const outflowRelationships = useMemo(
		() => groupByRelationship(outflowContracts),
		[outflowContracts],
	);

	const sortedInflowRelationships = useMemo(
		() => sortInflowRelationships(inflowRelationships),
		[inflowRelationships],
	);

	return {
		contracts,
		inflowContracts,
		outflowContracts,
		inflowRelationships,
		outflowRelationships,
		sortedInflowRelationships,
	};
};
