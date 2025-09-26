import type {
	Contract,
	Relationship,
	SortedInflowRelationships,
} from "../types";

export const groupByRelationship = (
	contractList: Contract[],
): Relationship[] => {
	const grouped = contractList.reduce(
		(acc, contract) => {
			const key = contract.client;
			if (!acc[key]) {
				acc[key] = {
					name: key,
					type: contract.clientType,
					role: contract.role,
					contracts: [],
					totalValue: 0,
					earliestStart: null,
					latestEnd: null,
				};
			}
			acc[key].contracts.push(contract);
			const value =
				Number.parseFloat(contract.currentValue.replace(/[$M]/g, "")) * 1000000;
			acc[key].totalValue += value;

			// Calculate earliest start and latest end dates for active awards
			const startDate = new Date(contract.start);
			const endDate = new Date(contract.end);
			const today = new Date("2025-09-19"); // Current date: September 19, 2025

			// Only consider active contracts (not completed)
			if (endDate > today) {
				if (!acc[key].earliestStart || startDate < acc[key].earliestStart) {
					acc[key].earliestStart = startDate;
				}
				if (!acc[key].latestEnd || endDate > acc[key].latestEnd) {
					acc[key].latestEnd = endDate;
				}
			}

			return acc;
		},
		{} as Record<string, any>,
	);

	return Object.values(grouped).sort(
		(a: any, b: any) => b.totalValue - a.totalValue,
	);
};

export const separateContracts = (contracts: Contract[]) => {
	const inflowContracts = contracts.filter(
		(c) =>
			c.role === "sub" || (c.role === "prime" && c.clientType === "agency"),
	);
	const outflowContracts = contracts.filter(
		(c) => c.role === "prime" && c.clientType === "sub",
	);

	return { inflowContracts, outflowContracts };
};

export const sortInflowRelationships = (
	inflowRelationships: Relationship[],
): SortedInflowRelationships => {
	const agencies = inflowRelationships
		.filter((r) => r.type === "agency")
		.sort((a, b) => b.totalValue - a.totalValue);
	const primes = inflowRelationships
		.filter((r) => r.type === "prime")
		.sort((a, b) => b.totalValue - a.totalValue);
	return { agencies, primes };
};
