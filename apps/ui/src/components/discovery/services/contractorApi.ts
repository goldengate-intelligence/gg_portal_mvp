import { generateMockContractors } from "../logic/dataTransforms";
import type { Contractor } from "../types/discovery";

export interface SearchParams {
	query: string;
	filters?: {
		location?: string;
		naics?: string;
		certification?: string;
		minValue?: number;
		maxValue?: number;
	};
	limit?: number;
	offset?: number;
}

export interface SearchResponse {
	results: Contractor[];
	total: number;
	columns: string[];
	executionTime: number;
}

// Mock API service - replace with actual API calls
export const contractorApi = {
	async search(params: SearchParams): Promise<SearchResponse> {
		// Simulate API delay
		await new Promise((resolve) =>
			setTimeout(resolve, 1000 + Math.random() * 2000),
		);

		const mockResults = generateMockContractors(params.limit || 25);

		// Filter results based on query (simple mock filtering)
		let filteredResults = mockResults;
		if (params.query) {
			const query = params.query.toLowerCase();
			filteredResults = mockResults.filter(
				(contractor) =>
					contractor.company_name.toLowerCase().includes(query) ||
					contractor.naics_description.toLowerCase().includes(query) ||
					contractor.location.toLowerCase().includes(query),
			);
		}

		// Apply additional filters
		if (params.filters) {
			if (params.filters.location) {
				filteredResults = filteredResults.filter((c) =>
					c.location
						.toLowerCase()
						.includes(params.filters?.location?.toLowerCase()),
				);
			}
			if (params.filters.certification) {
				filteredResults = filteredResults.filter(
					(c) => c.certification_level === params.filters?.certification,
				);
			}
		}

		const columns = [
			"COMPANY_NAME",
			"UEI",
			"NAICS_DESCRIPTION",
			"LOCATION",
			"ACTIVE_AWARDS_VALUE",
			"PERFORMANCE_SCORE",
			"CERTIFICATION_LEVEL",
			"EMPLOYEES",
			"FOUNDED",
		];

		return {
			results: filteredResults,
			total: filteredResults.length,
			columns,
			executionTime: Math.floor(Math.random() * 2000) + 500,
		};
	},

	async getContractorDetails(uei: string): Promise<Contractor | null> {
		await new Promise((resolve) => setTimeout(resolve, 500));

		const mockContractors = generateMockContractors(1);
		return mockContractors[0] || null;
	},

	async exportResults(
		contractors: Contractor[],
		format: "csv" | "xlsx" = "csv",
	): Promise<Blob> {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		if (format === "csv") {
			const headers = Object.keys(contractors[0] || {});
			const csvContent = [
				headers.join(","),
				...contractors.map((contractor) =>
					headers.map((header) => (contractor as any)[header]).join(","),
				),
			].join("\n");

			return new Blob([csvContent], { type: "text/csv" });
		}

		// For XLSX, return empty blob (would need actual implementation)
		return new Blob([], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});
	},
};
