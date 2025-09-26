import { useMemo } from "react";
import { getContractData } from "../logic/contractData";
import {
	groupByRelationship,
	separateContracts,
	sortInflowRelationships,
} from "../logic/contractGrouping";
import type { ActivityEvent } from "../../network/types";

// Transform activity events into the format expected by existing logic
const transformActivityEvents = (activityEvents: ActivityEvent[]) => {
	// For now, return mock data - in future this will transform activityEvents
	// into the contract format expected by existing grouping logic
	return getContractData();
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
