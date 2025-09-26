// Competitive Position Panel - Data Services
// Fetching competitor data, benchmark data, industry comparisons

export interface CompetitorDataParams {
	contractorId: string;
	industry?: string;
	size?: "small" | "medium" | "large";
	region?: string;
	limit?: number;
}

export interface BenchmarkDataResponse {
	contractor: any;
	competitors: any[];
	industryAverages: Record<string, number>;
	marketPosition: {
		rank: number;
		totalCompetitors: number;
		marketShare: number;
	};
}

// Fetch competitor benchmark data
export const fetchCompetitorBenchmarkData = async (
	params: CompetitorDataParams,
): Promise<BenchmarkDataResponse> => {
	// This would make actual API calls to get competitor data
	// For now, return mock structure

	try {
		const response = await fetch(
			`/api/contractors/${params.contractorId}/benchmarks`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params),
			},
		);

		if (!response.ok) {
			throw new Error("Failed to fetch benchmark data");
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching competitor data:", error);
		throw error;
	}
};

// Get industry-specific competitor list
export const fetchIndustryCompetitors = async (
	industry: string,
	excludeContractorId?: string,
): Promise<any[]> => {
	try {
		const response = await fetch(`/api/industries/${industry}/competitors`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});

		const competitors = await response.json();

		// Filter out the current contractor if specified
		return excludeContractorId
			? competitors.filter((c: any) => c.id !== excludeContractorId)
			: competitors;
	} catch (error) {
		console.error("Error fetching industry competitors:", error);
		return [];
	}
};

// Cache management for expensive competitive data
const competitiveDataCache = new Map<string, BenchmarkDataResponse>();

export const getCachedCompetitiveData = (
	contractorId: string,
): BenchmarkDataResponse | null => {
	return competitiveDataCache.get(contractorId) || null;
};

export const setCachedCompetitiveData = (
	contractorId: string,
	data: BenchmarkDataResponse,
): void => {
	competitiveDataCache.set(contractorId, data);
};

// Real-time data updates for competitive positioning
export const subscribeToCompetitiveUpdates = (
	contractorId: string,
	callback: (data: BenchmarkDataResponse) => void,
): (() => void) => {
	// WebSocket or polling implementation
	const interval = setInterval(async () => {
		try {
			const data = await fetchCompetitorBenchmarkData({ contractorId });
			callback(data);
		} catch (error) {
			console.error("Error in competitive data subscription:", error);
		}
	}, 30000); // Update every 30 seconds

	return () => clearInterval(interval);
};
