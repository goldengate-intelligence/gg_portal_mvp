/**
 * Contractor Metrics Service
 *
 * Centralized service for contractor financial and performance metrics.
 * Integrates with multiple data sources and provides comprehensive metric calculation.
 */

import { largeDataCache } from "../caching/large-data-cache";
import { icebergReader } from "../data-sources/iceberg-reader";
import { snowflakeApi } from "../data-sources/snowflake-api";
import { mockContractorApi } from "./mockContractorData";

// Use mock API in development
const isDevelopment = import.meta.env.MODE === 'development' || !import.meta.env.VITE_SNOWFLAKE_API_URL;
const apiService = isDevelopment ? mockContractorApi : snowflakeApi;

export interface ContractorMetrics {
	uei: string;
	companyName: string;
	lifetimeAwards: string;
	activeAwards: string;
	revenue: string;
	pipeline: string;
	contractCount: number;
	primaryAgency?: string;
	lastUpdated?: string;
	dataSource?: "api" | "cache" | "fallback";
}

export interface ContractorFinancialBreakdown {
	totalValue: number;
	activeValue: number;
	pipelineValue: number;
	completedValue: number;
	averageContractSize: number;
	largestContract: number;
	recentGrowthRate: number;
}

export interface ContractorAgencyBreakdown {
	primaryAgency: string;
	agencyDistribution: Array<{
		agency: string;
		percentage: number;
		value: string;
	}>;
}

class ContractorMetricsService {
	private cache = largeDataCache;

	// Comprehensive contractor metrics store with preserved mock data
	private readonly contractorMetricsData: Record<string, ContractorMetrics> = {
		TFL123456789: {
			uei: "TFL123456789",
			companyName: "Trio Fabrication LLC",
			lifetimeAwards: "$890M",
			activeAwards: "$125M",
			revenue: "$125M",
			pipeline: "$280M",
			contractCount: 92,
			primaryAgency: "Defense",
			dataSource: "fallback",
		},
		RTX987654321: {
			uei: "RTX987654321",
			companyName: "Raytheon Technologies Corporation",
			lifetimeAwards: "$45B",
			activeAwards: "$2.1B",
			revenue: "$2.1B",
			pipeline: "$8.5B",
			contractCount: 278,
			primaryAgency: "Defense",
			dataSource: "fallback",
		},
		BAE456789123: {
			uei: "BAE456789123",
			companyName: "BAE Systems Inc",
			lifetimeAwards: "$28B",
			activeAwards: "$1.8B",
			revenue: "$1.8B",
			pipeline: "$3.2B",
			contractCount: 156,
			primaryAgency: "Defense",
			dataSource: "fallback",
		},
		ACI789123456: {
			uei: "ACI789123456",
			companyName: "Applied Composites Inc",
			lifetimeAwards: "$1.2B",
			activeAwards: "$180M",
			revenue: "$180M",
			pipeline: "$450M",
			contractCount: 84,
			primaryAgency: "Energy",
			dataSource: "fallback",
		},
		MSF456789012: {
			uei: "MSF456789012",
			companyName: "MedStar Federal",
			lifetimeAwards: "$2.8B",
			activeAwards: "$350M",
			revenue: "$350M",
			pipeline: "$620M",
			contractCount: 145,
			primaryAgency: "Health and Human Services",
			dataSource: "fallback",
		},
		ITC234567890: {
			uei: "ITC234567890",
			companyName: "InfoTech Consulting Group",
			lifetimeAwards: "$950M",
			activeAwards: "$85M",
			revenue: "$85M",
			pipeline: "$180M",
			contractCount: 67,
			primaryAgency: "General Services Administration",
			dataSource: "fallback",
		},
		GCE567890123: {
			uei: "GCE567890123",
			companyName: "GreenPoint Construction & Engineering",
			lifetimeAwards: "$1.5B",
			activeAwards: "$220M",
			revenue: "$220M",
			pipeline: "$340M",
			contractCount: 89,
			primaryAgency: "Transportation",
			dataSource: "fallback",
		},
		QSL890123456: {
			uei: "QSL890123456",
			companyName: "QuantumShield Logistics",
			lifetimeAwards: "$640M",
			activeAwards: "$95M",
			revenue: "$95M",
			pipeline: "$155M",
			contractCount: 52,
			primaryAgency: "Defense",
			dataSource: "fallback",
		},
		NGE123456780: {
			uei: "NGE123456780",
			companyName: "NextGen Environmental Solutions",
			lifetimeAwards: "$420M",
			activeAwards: "$65M",
			revenue: "$65M",
			pipeline: "$120M",
			contractCount: 38,
			primaryAgency: "Environmental Protection Agency",
			dataSource: "fallback",
		},
	};

	/**
	 * Get contractor metrics with data source hierarchy
	 */
	async getContractorMetrics(uei: string): Promise<ContractorMetrics | null> {
		const cacheKey = `contractor-metrics:${uei}`;
		const cached = this.cache.get<ContractorMetrics>(cacheKey);
		if (cached) return cached;

		try {
			// Try Iceberg first for materialized metrics
			const icebergData = await this.fetchFromIceberg(uei);
			if (icebergData) {
				this.cache.set(cacheKey, icebergData, 60); // Cache for 1 hour
				return icebergData;
			}

			// Try Snowflake for real-time metrics
			const snowflakeData = await this.fetchFromSnowflake(uei);
			if (snowflakeData) {
				this.cache.set(cacheKey, snowflakeData, 30); // Cache for 30 minutes
				return snowflakeData;
			}
		} catch (error) {
			console.warn(
				"Failed to fetch contractor metrics from APIs, using fallback:",
				error,
			);
		}

		// Fallback to mock data
		const fallbackData = this.contractorMetricsData[uei];
		if (fallbackData) {
			this.cache.set(cacheKey, fallbackData, 5); // Short cache for fallback
			return fallbackData;
		}

		return null;
	}

	/**
	 * Get contractor metrics by company name (with fuzzy matching)
	 */
	async getContractorMetricsByName(
		companyName: string,
	): Promise<ContractorMetrics | null> {
		const cacheKey = `contractor-metrics-name:${companyName.toLowerCase()}`;
		const cached = this.cache.get<ContractorMetrics>(cacheKey);
		if (cached) return cached;

		// First try exact name lookups in APIs
		try {
			// In production, this would search by company name in the APIs
			// For now, fall through to fallback search
		} catch (error) {
			console.warn("API search by name failed:", error);
		}

		// Search in fallback data
		const found = Object.values(this.contractorMetricsData).find(
			(metrics) =>
				metrics.companyName.toLowerCase().includes(companyName.toLowerCase()) ||
				companyName.toLowerCase().includes(metrics.companyName.toLowerCase()),
		);

		if (found) {
			this.cache.set(cacheKey, found, 15); // Cache name-based lookups for 15 minutes
			return found;
		}

		return null;
	}

	/**
	 * Get multiple contractor metrics efficiently
	 */
	async getMultipleContractorMetrics(
		ueis: string[],
	): Promise<Record<string, ContractorMetrics>> {
		const results: Record<string, ContractorMetrics> = {};

		// Process in batches to avoid overwhelming APIs
		const batchSize = 10;
		for (let i = 0; i < ueis.length; i += batchSize) {
			const batch = ueis.slice(i, i + batchSize);

			const batchPromises = batch.map(async (uei) => {
				const metrics = await this.getContractorMetrics(uei);
				return { uei, metrics };
			});

			const batchResults = await Promise.all(batchPromises);
			batchResults.forEach(({ uei, metrics }) => {
				if (metrics) {
					results[uei] = metrics;
				}
			});
		}

		return results;
	}

	/**
	 * Get financial breakdown for contractor
	 */
	async getFinancialBreakdown(
		uei: string,
	): Promise<ContractorFinancialBreakdown | null> {
		const metrics = await this.getContractorMetrics(uei);
		if (!metrics) return null;

		// Parse financial strings to numbers for calculations
		const totalValue = this.parseFinancialString(metrics.lifetimeAwards);
		const activeValue = this.parseFinancialString(metrics.activeAwards);
		const pipelineValue = this.parseFinancialString(metrics.pipeline);

		return {
			totalValue,
			activeValue,
			pipelineValue,
			completedValue: totalValue - activeValue,
			averageContractSize: totalValue / metrics.contractCount,
			largestContract: activeValue * 0.3, // Estimate
			recentGrowthRate: 0.15, // Mock 15% growth rate
		};
	}

	/**
	 * Get agency distribution for contractor
	 */
	async getAgencyBreakdown(
		uei: string,
	): Promise<ContractorAgencyBreakdown | null> {
		const metrics = await this.getContractorMetrics(uei);
		if (!metrics) return null;

		// Mock agency distribution - in production, this would come from API
		return {
			primaryAgency: metrics.primaryAgency || "Unknown",
			agencyDistribution: [
				{
					agency: metrics.primaryAgency || "Unknown",
					percentage: 75,
					value: metrics.revenue,
				},
				{
					agency: "General Services Administration",
					percentage: 15,
					value: "$25M",
				},
				{ agency: "Other Agencies", percentage: 10, value: "$15M" },
			],
		};
	}

	/**
	 * Get default metrics for unknown contractors
	 */
	getDefaultMetrics(uei: string, companyName: string): ContractorMetrics {
		return {
			uei,
			companyName,
			lifetimeAwards: "$500M",
			activeAwards: "$100M",
			revenue: "$100M",
			pipeline: "$200M",
			contractCount: 50,
			primaryAgency: "Unknown",
			dataSource: "fallback",
		};
	}

	/**
	 * Add or update contractor metrics
	 */
	setContractorMetrics(uei: string, metrics: ContractorMetrics): void {
		this.contractorMetricsData[uei] = {
			...metrics,
			lastUpdated: new Date().toISOString(),
		};

		// Invalidate cache for this contractor
		this.cache.delete(`contractor-metrics:${uei}`);
	}

	/**
	 * Get all contractor metrics (primarily for admin/debugging)
	 */
	getAllContractorMetrics(): Record<string, ContractorMetrics> {
		return { ...this.contractorMetricsData };
	}

	/**
	 * Clear cached metrics for specific contractor or all
	 */
	clearMetricsCache(uei?: string): void {
		if (uei) {
			this.cache.delete(`contractor-metrics:${uei}`);
			this.cache.delete(`contractor-metrics-name:${uei}`);
		} else {
			this.cache.clear("contractor-metrics");
		}
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats(): { size: number; hitRate: number } {
		return this.cache.getStats();
	}

	/**
	 * Private: Fetch metrics from Iceberg data source
	 */
	private async fetchFromIceberg(
		uei: string,
	): Promise<ContractorMetrics | null> {
		try {
			const result = await icebergReader.getContractorSummary(uei);
			if (result) {
				return {
					uei: result.uei,
					companyName: result.name,
					lifetimeAwards: this.formatCurrency(result.totalContractValue),
					activeAwards: this.formatCurrency(
						result.activeContractValue || result.totalContractValue * 0.3,
					),
					revenue: this.formatCurrency(
						result.annualRevenue || result.totalContractValue * 0.25,
					),
					pipeline: this.formatCurrency(
						result.pipelineValue || result.totalContractValue * 0.4,
					),
					contractCount: result.contractCount || 50,
					primaryAgency: result.primaryAgency,
					lastUpdated: new Date().toISOString(),
					dataSource: "api",
				};
			}
		} catch (error) {
			console.warn("Iceberg metrics fetch failed:", error);
		}
		return null;
	}

	/**
	 * Private: Fetch metrics from Snowflake data source
	 */
	private async fetchFromSnowflake(
		uei: string,
	): Promise<ContractorMetrics | null> {
		try {
			const result = await apiService.getContractorIntelligence(uei, 'competitive');
			if (result) {
				return {
					uei: result.uei,
					companyName: result.company_name,
					lifetimeAwards: result.lifetime_awards,
					activeAwards: result.active_awards,
					revenue: result.annual_revenue,
					pipeline: result.pipeline_value,
					contractCount: result.contract_count,
					primaryAgency: result.primary_agency,
					lastUpdated: new Date().toISOString(),
					dataSource: "api",
				};
			}
		} catch (error) {
			console.warn("Snowflake metrics fetch failed:", error);
		}
		return null;
	}

	/**
	 * Private: Parse financial strings like "$125M" to numbers
	 */
	private parseFinancialString(value: string): number {
		const cleanValue = value.replace(/[$,\s]/g, "");
		const multiplier = cleanValue.includes("B")
			? 1e9
			: cleanValue.includes("M")
				? 1e6
				: cleanValue.includes("K")
					? 1e3
					: 1;
		const numericValue = Number.parseFloat(cleanValue.replace(/[BMK]/g, ""));
		return numericValue * multiplier;
	}

	/**
	 * Private: Format numbers as currency strings
	 */
	private formatCurrency(value: number): string {
		if (value >= 1e9) {
			return `$${(value / 1e9).toFixed(1)}B`;
		}
		if (value >= 1e6) {
			return `$${(value / 1e6).toFixed(0)}M`;
		}
		if (value >= 1e3) {
			return `$${(value / 1e3).toFixed(0)}K`;
		}
		return `$${value.toFixed(0)}`;
	}
}

// Export singleton instance
export const contractorMetricsService = new ContractorMetricsService();

// Export types
export type {
	ContractorMetrics,
	ContractorFinancialBreakdown,
	ContractorAgencyBreakdown,
};
