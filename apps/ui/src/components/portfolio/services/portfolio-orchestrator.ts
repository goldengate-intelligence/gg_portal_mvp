/**
 * Portfolio Data Orchestration Service
 *
 * Centralized data management for portfolio views, coordinating between
 * multiple data sources and providing unified interface for portfolio operations.
 * Follows the same pattern as contractor-detail orchestration.
 */

import { largeDataCache } from "../../../services/caching/large-data-cache";
import { naicsPscService } from "../../../services/classification/naics-psc-service";
import { contractorLogoService } from "../../../services/contractors/contractor-logo-service";
import { contractorMetricsService } from "../../../services/contractors/contractor-metrics-service";
import { icebergReader } from "../../../services/data-sources/iceberg-reader";
import { snowflakeApi } from "../../../services/data-sources/snowflake-api";
import { performanceColors } from "../../../services/visualization/performance-colors";
import type {
	GroupAsset,
	PortfolioAsset,
	PortfolioMetrics,
} from "./portfolio-data";

export interface PortfolioData {
	assets: Array<PortfolioAsset | GroupAsset>;
	metrics: PortfolioMetrics;
	groupedAssets: Record<string, GroupAsset>;
	pinnedAssets: string[];
	lastUpdated: string;
	dataSource: "api" | "cache" | "fallback";
}

export interface PortfolioFilter {
	searchTerm?: string;
	industry?: string;
	marketType?: "civilian" | "defense" | "mixed";
	performanceRange?: [number, number];
	contractValueRange?: [number, number];
	agencies?: string[];
}

export interface PortfolioSortConfig {
	field:
		| "companyName"
		| "performance"
		| "revenue"
		| "contracts"
		| "lastUpdated";
	direction: "asc" | "desc";
}

export interface AssetEnrichmentData {
	logoUrl: string | null;
	detailedMetrics: any;
	industryClassification: {
		primaryNaics: string;
		secondaryNaics: string[];
		industryTags: string[];
	};
	performanceColor: string;
	riskIndicators: {
		level: "low" | "medium" | "high";
		factors: string[];
		score: number;
	};
}

class PortfolioDataOrchestrator {
	private cache = largeDataCache;

	/**
	 * Get complete portfolio data with all assets and metrics
	 */
	async getPortfolioData(
		portfolioId?: string,
		filters?: PortfolioFilter,
	): Promise<PortfolioData> {
		const cacheKey = `portfolio-data:${portfolioId || "default"}:${JSON.stringify(filters || {})}`;
		const cached = this.cache.get<PortfolioData>(cacheKey);
		if (cached) return cached;

		try {
			// Load portfolio assets from data sources
			const rawAssets = await this.loadPortfolioAssets(portfolioId);

			// Enrich assets with additional data
			const enrichedAssets = await this.enrichPortfolioAssets(rawAssets);

			// Apply filters if provided
			const filteredAssets = filters
				? this.applyFilters(enrichedAssets, filters)
				: enrichedAssets;

			// Load grouped assets
			const groupedAssets = await this.loadGroupedAssets(portfolioId);

			// Load pinned assets
			const pinnedAssets = await this.loadPinnedAssets(portfolioId);

			// Calculate portfolio metrics
			const metrics = this.calculatePortfolioMetrics(filteredAssets);

			const portfolioData: PortfolioData = {
				assets: filteredAssets,
				metrics,
				groupedAssets,
				pinnedAssets,
				lastUpdated: new Date().toISOString(),
				dataSource: "api",
			};

			// Cache for 15 minutes
			this.cache.set(cacheKey, portfolioData, 15);
			return portfolioData;
		} catch (error) {
			console.warn(
				"Failed to load portfolio data from APIs, using fallback:",
				error,
			);

			// Return fallback portfolio data
			const fallbackData = this.getFallbackPortfolioData();
			this.cache.set(cacheKey, fallbackData, 5); // Short cache for fallback
			return fallbackData;
		}
	}

	/**
	 * Get enriched data for specific assets
	 */
	async getAssetEnrichmentData(
		ueis: string[],
	): Promise<Record<string, AssetEnrichmentData>> {
		const enrichmentData: Record<string, AssetEnrichmentData> = {};

		// Process in batches for performance
		const batchSize = 10;
		for (let i = 0; i < ueis.length; i += batchSize) {
			const batch = ueis.slice(i, i + batchSize);

			const batchPromises = batch.map(async (uei) => {
				try {
					const [logoResponse, metrics, industryData] = await Promise.all([
						contractorLogoService.getContractorLogo(uei),
						contractorMetricsService.getContractorMetrics(uei),
						this.getIndustryClassification(uei),
					]);

					const enrichment: AssetEnrichmentData = {
						logoUrl: logoResponse.logoUrl,
						detailedMetrics: metrics,
						industryClassification: industryData,
						performanceColor: performanceColors.getColorForScore(
							metrics?.contractCount || 50,
						),
						riskIndicators: this.calculateRiskIndicators(metrics),
					};

					return { uei, enrichment };
				} catch (error) {
					console.warn(`Failed to enrich asset ${uei}:`, error);
					return { uei, enrichment: this.getDefaultEnrichmentData(uei) };
				}
			});

			const batchResults = await Promise.all(batchPromises);
			batchResults.forEach(({ uei, enrichment }) => {
				enrichmentData[uei] = enrichment;
			});
		}

		return enrichmentData;
	}

	/**
	 * Update asset grouping
	 */
	async updateAssetGrouping(operation: {
		type: "create" | "add" | "remove" | "rename" | "delete";
		groupId?: string;
		assetIds: string[];
		groupName?: string;
	}): Promise<{ success: boolean; updatedData: PortfolioData }> {
		try {
			// In production, this would update persistent storage
			// For now, invalidate cache and return updated data
			this.invalidatePortfolioCache();

			const updatedData = await this.getPortfolioData();
			return { success: true, updatedData };
		} catch (error) {
			console.error("Failed to update asset grouping:", error);
			return { success: false, updatedData: await this.getPortfolioData() };
		}
	}

	/**
	 * Update pinned assets
	 */
	async updatePinnedAssets(assetIds: string[]): Promise<{ success: boolean }> {
		try {
			// In production, this would persist to storage
			// For now, just invalidate cache
			this.cache.clear("pinned-assets");
			return { success: true };
		} catch (error) {
			console.error("Failed to update pinned assets:", error);
			return { success: false };
		}
	}

	/**
	 * Search assets by keyword
	 */
	async searchAssets(
		query: string,
		portfolioId?: string,
	): Promise<PortfolioAsset[]> {
		const cacheKey = `asset-search:${query}:${portfolioId || "default"}`;
		const cached = this.cache.get<PortfolioAsset[]>(cacheKey);
		if (cached) return cached;

		try {
			// Get full portfolio data
			const portfolioData = await this.getPortfolioData(portfolioId);

			// Filter assets by search query
			const filteredAssets = portfolioData.assets.filter((asset) => {
				if (asset.type === "group") return false; // Exclude groups from search

				const searchableText = [
					asset.companyName,
					asset.naicsDescription,
					asset.primaryAgency,
					asset.uei,
				]
					.join(" ")
					.toLowerCase();

				return searchableText.includes(query.toLowerCase());
			}) as PortfolioAsset[];

			// Cache search results for 10 minutes
			this.cache.set(cacheKey, filteredAssets, 10);
			return filteredAssets;
		} catch (error) {
			console.warn("Asset search failed:", error);
			return [];
		}
	}

	/**
	 * Get portfolio analytics
	 */
	async getPortfolioAnalytics(portfolioId?: string): Promise<{
		totalValue: number;
		averagePerformance: number;
		industryDistribution: Record<string, number>;
		agencyDistribution: Record<string, number>;
		riskDistribution: Record<string, number>;
		growthTrends: Array<{ period: string; value: number }>;
	}> {
		const cacheKey = `portfolio-analytics:${portfolioId || "default"}`;
		const cached = this.cache.get(cacheKey);
		if (cached) return cached;

		try {
			const portfolioData = await this.getPortfolioData(portfolioId);

			const analytics = {
				totalValue: this.parseFinancialString(portfolioData.metrics.totalValue),
				averagePerformance: portfolioData.metrics.averagePerformance,
				industryDistribution: this.calculateIndustryDistribution(
					portfolioData.assets,
				),
				agencyDistribution: this.calculateAgencyDistribution(
					portfolioData.assets,
				),
				riskDistribution: this.calculateRiskDistribution(portfolioData.assets),
				growthTrends: this.calculateGrowthTrends(portfolioData.assets),
			};

			// Cache analytics for 30 minutes
			this.cache.set(cacheKey, analytics, 30);
			return analytics;
		} catch (error) {
			console.warn("Failed to calculate portfolio analytics:", error);
			return this.getDefaultAnalytics();
		}
	}

	/**
	 * Invalidate all portfolio-related cache
	 */
	invalidatePortfolioCache(portfolioId?: string): void {
		if (portfolioId) {
			this.cache.clear(`portfolio-data:${portfolioId}`);
			this.cache.clear(`portfolio-analytics:${portfolioId}`);
		} else {
			this.cache.clear("portfolio-");
			this.cache.clear("asset-search:");
		}
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats(): { size: number; hitRate: number } {
		return this.cache.getStats();
	}

	/**
	 * Private: Load portfolio assets from data sources
	 */
	private async loadPortfolioAssets(
		portfolioId?: string,
	): Promise<PortfolioAsset[]> {
		try {
			// Try Iceberg first for materialized portfolio data
			const icebergResult = await icebergReader.getPortfolioAssets(portfolioId);
			if (icebergResult.data.length > 0) {
				return this.transformIcebergAssets(icebergResult.data);
			}

			// Fallback to Snowflake for real-time data
			const snowflakeResult =
				await snowflakeApi.getPortfolioAssets(portfolioId);
			if (snowflakeResult) {
				return this.transformSnowflakeAssets(snowflakeResult);
			}
		} catch (error) {
			console.warn("Failed to load assets from APIs:", error);
		}

		// Return fallback mock assets
		return this.getMockPortfolioAssets();
	}

	/**
	 * Private: Enrich portfolio assets with additional data
	 */
	private async enrichPortfolioAssets(
		assets: PortfolioAsset[],
	): Promise<PortfolioAsset[]> {
		const ueis = assets.map((asset) => asset.uei);
		const enrichmentData = await this.getAssetEnrichmentData(ueis);

		return assets.map((asset) => ({
			...asset,
			enrichmentData: enrichmentData[asset.uei],
		}));
	}

	/**
	 * Private: Apply filters to portfolio assets
	 */
	private applyFilters(
		assets: Array<PortfolioAsset | GroupAsset>,
		filters: PortfolioFilter,
	): Array<PortfolioAsset | GroupAsset> {
		return assets.filter((asset) => {
			if (filters.searchTerm) {
				const searchText = asset.companyName.toLowerCase();
				if (!searchText.includes(filters.searchTerm.toLowerCase()))
					return false;
			}

			if (filters.marketType && asset.marketType !== filters.marketType)
				return false;

			if (filters.industry) {
				if (
					!asset.naicsDescription
						.toLowerCase()
						.includes(filters.industry.toLowerCase())
				)
					return false;
			}

			if (filters.performanceRange) {
				const score = (asset as PortfolioAsset).performanceScore || 50;
				if (
					score < filters.performanceRange[0] ||
					score > filters.performanceRange[1]
				)
					return false;
			}

			return true;
		});
	}

	/**
	 * Private: Load grouped assets
	 */
	private async loadGroupedAssets(
		portfolioId?: string,
	): Promise<Record<string, GroupAsset>> {
		// In production, this would load from persistent storage
		// For now, return empty groups
		return {};
	}

	/**
	 * Private: Load pinned assets
	 */
	private async loadPinnedAssets(portfolioId?: string): Promise<string[]> {
		const cacheKey = `pinned-assets:${portfolioId || "default"}`;
		const cached = this.cache.get<string[]>(cacheKey);
		if (cached) return cached;

		// In production, this would load from user preferences
		// For now, return some mock pinned assets
		const pinned = ["TFL123456789", "RTX987654321"];
		this.cache.set(cacheKey, pinned, 60); // Cache for 1 hour
		return pinned;
	}

	/**
	 * Private: Calculate portfolio metrics
	 */
	private calculatePortfolioMetrics(
		assets: Array<PortfolioAsset | GroupAsset>,
	): PortfolioMetrics {
		const portfolioAssets = assets.filter(
			(asset) => asset.type !== "group",
		) as PortfolioAsset[];

		const totalValue = portfolioAssets.reduce((sum, asset) => {
			return sum + this.parseFinancialString(asset.activeAwards.value);
		}, 0);

		const averagePerformance =
			portfolioAssets.length > 0
				? portfolioAssets.reduce(
						(sum, asset) => sum + asset.performanceScore,
						0,
					) / portfolioAssets.length
				: 0;

		const topPerformers = [...portfolioAssets]
			.sort((a, b) => b.performanceScore - a.performanceScore)
			.slice(0, 5);

		const industryBreakdown = this.calculateIndustryBreakdown(portfolioAssets);

		return {
			totalAssets: portfolioAssets.length,
			totalValue: this.formatCurrency(totalValue),
			averagePerformance,
			topPerformers,
			industryBreakdown,
		};
	}

	/**
	 * Private: Helper methods for calculations and transformations
	 */
	private calculateIndustryBreakdown(
		assets: PortfolioAsset[],
	): Array<{ industry: string; count: number; percentage: number }> {
		const industryCount: Record<string, number> = {};

		assets.forEach((asset) => {
			const industry = asset.naicsDescription.split(" ")[0]; // Simplified industry extraction
			industryCount[industry] = (industryCount[industry] || 0) + 1;
		});

		const total = assets.length;
		return Object.entries(industryCount).map(([industry, count]) => ({
			industry,
			count,
			percentage: Math.round((count / total) * 100),
		}));
	}

	private calculateIndustryDistribution(
		assets: Array<PortfolioAsset | GroupAsset>,
	): Record<string, number> {
		const distribution: Record<string, number> = {};
		assets.forEach((asset) => {
			if (asset.type === "group") return;
			const industry = asset.naicsDescription.split(" ")[0];
			distribution[industry] = (distribution[industry] || 0) + 1;
		});
		return distribution;
	}

	private calculateAgencyDistribution(
		assets: Array<PortfolioAsset | GroupAsset>,
	): Record<string, number> {
		const distribution: Record<string, number> = {};
		assets.forEach((asset) => {
			if (asset.type === "group") return;
			const agency = (asset as PortfolioAsset).primaryAgency;
			distribution[agency] = (distribution[agency] || 0) + 1;
		});
		return distribution;
	}

	private calculateRiskDistribution(
		assets: Array<PortfolioAsset | GroupAsset>,
	): Record<string, number> {
		// Mock risk calculation
		return { low: 60, medium: 30, high: 10 };
	}

	private calculateGrowthTrends(
		assets: Array<PortfolioAsset | GroupAsset>,
	): Array<{ period: string; value: number }> {
		// Mock growth trends
		return [
			{ period: "2024-Q1", value: 1250000000 },
			{ period: "2024-Q2", value: 1320000000 },
			{ period: "2024-Q3", value: 1380000000 },
			{ period: "2024-Q4", value: 1450000000 },
		];
	}

	private async getIndustryClassification(uei: string): Promise<any> {
		try {
			const results = await naicsPscService.searchByKeyword("manufacturing");
			return {
				primaryNaics: results[0]?.naicsCode || "336000",
				secondaryNaics: results.slice(1, 3).map((r) => r.naicsCode),
				industryTags: results.slice(0, 3).map((r) => r.naicsDescription),
			};
		} catch (error) {
			return {
				primaryNaics: "336000",
				secondaryNaics: ["334000", "335000"],
				industryTags: ["Manufacturing", "Technology", "Engineering"],
			};
		}
	}

	private calculateRiskIndicators(metrics: any): any {
		if (!metrics) {
			return { level: "medium", factors: ["Limited data"], score: 50 };
		}

		// Simple risk calculation based on contract count and value
		const contractCount = metrics.contractCount || 0;
		const score = Math.min(100, Math.max(0, contractCount * 2));

		let level: "low" | "medium" | "high" = "medium";
		if (score >= 70) level = "low";
		else if (score <= 30) level = "high";

		return {
			level,
			factors:
				level === "high"
					? ["Low contract volume", "Limited diversification"]
					: level === "low"
						? ["Strong contract portfolio", "Diversified revenue"]
						: ["Moderate risk profile"],
			score,
		};
	}

	private getDefaultEnrichmentData(uei: string): AssetEnrichmentData {
		return {
			logoUrl: null,
			detailedMetrics: null,
			industryClassification: {
				primaryNaics: "336000",
				secondaryNaics: [],
				industryTags: ["Manufacturing"],
			},
			performanceColor: "#64748b",
			riskIndicators: {
				level: "medium",
				factors: ["Limited data available"],
				score: 50,
			},
		};
	}

	private getFallbackPortfolioData(): PortfolioData {
		const mockAssets = this.getMockPortfolioAssets();
		return {
			assets: mockAssets,
			metrics: this.calculatePortfolioMetrics(mockAssets),
			groupedAssets: {},
			pinnedAssets: ["TFL123456789"],
			lastUpdated: new Date().toISOString(),
			dataSource: "fallback",
		};
	}

	private getMockPortfolioAssets(): PortfolioAsset[] {
		// Preserved mock data for development
		return [
			{
				id: "TFL123456789",
				companyName: "Trio Fabrication LLC",
				uei: "TFL123456789",
				naicsDescription: "Fabricated Plate Work Manufacturing",
				naicsCode: "332313",
				marketType: "defense",
				activeAwards: { value: "$125M", count: 15 },
				lifetimeAwards: "$890M",
				revenue: "$125M",
				pipeline: "$280M",
				contractCount: 92,
				primaryAgency: "Defense",
				performanceScore: 85,
				lastUpdated: "2024-01-20",
			},
			{
				id: "RTX987654321",
				companyName: "Raytheon Technologies Corporation",
				uei: "RTX987654321",
				naicsDescription: "Guided Missile and Space Vehicle Manufacturing",
				naicsCode: "336414",
				marketType: "defense",
				activeAwards: { value: "$2.1B", count: 45 },
				lifetimeAwards: "$45B",
				revenue: "$2.1B",
				pipeline: "$8.5B",
				contractCount: 278,
				primaryAgency: "Defense",
				performanceScore: 92,
				lastUpdated: "2024-01-19",
			},
		];
	}

	private transformIcebergAssets(rawData: any[]): PortfolioAsset[] {
		return rawData.map((raw) => ({
			id: raw.id || raw.uei,
			companyName: raw.company_name,
			uei: raw.uei,
			naicsDescription: raw.naics_description,
			naicsCode: raw.naics_code,
			marketType: this.determineMarketType(raw.primary_agency),
			activeAwards: {
				value: raw.active_awards_value || "$0",
				count: raw.active_awards_count || 0,
			},
			lifetimeAwards: raw.lifetime_awards || "$0",
			revenue: raw.annual_revenue || "$0",
			pipeline: raw.pipeline_value || "$0",
			contractCount: raw.contract_count || 0,
			primaryAgency: raw.primary_agency,
			performanceScore: raw.performance_score || 50,
			lastUpdated: raw.last_updated || new Date().toISOString(),
		}));
	}

	private transformSnowflakeAssets(rawData: any[]): PortfolioAsset[] {
		// Similar transformation for Snowflake data
		return rawData.map((raw) => ({
			id: raw.uei,
			companyName: raw.company_name,
			uei: raw.uei,
			naicsDescription: raw.naics_description,
			naicsCode: raw.naics_code,
			marketType: this.determineMarketType(raw.primary_agency),
			activeAwards: {
				value: raw.active_awards_value || "$0",
				count: raw.active_awards_count || 0,
			},
			lifetimeAwards: raw.lifetime_awards || "$0",
			revenue: raw.annual_revenue || "$0",
			pipeline: raw.pipeline_value || "$0",
			contractCount: raw.contract_count || 0,
			primaryAgency: raw.primary_agency,
			performanceScore: raw.performance_score || 50,
			lastUpdated: raw.last_updated || new Date().toISOString(),
		}));
	}

	private determineMarketType(agency?: string): "civilian" | "defense" {
		if (!agency) return "civilian";
		const defenseAgencies = ["defense", "dod", "army", "navy", "air force"];
		return defenseAgencies.some((d) => agency.toLowerCase().includes(d))
			? "defense"
			: "civilian";
	}

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

	private getDefaultAnalytics(): any {
		return {
			totalValue: 1500000000,
			averagePerformance: 75,
			industryDistribution: { Manufacturing: 40, Technology: 35, Services: 25 },
			agencyDistribution: { Defense: 60, Energy: 20, Transportation: 20 },
			riskDistribution: { low: 60, medium: 30, high: 10 },
			growthTrends: [
				{ period: "2024-Q1", value: 1250000000 },
				{ period: "2024-Q2", value: 1320000000 },
				{ period: "2024-Q3", value: 1380000000 },
				{ period: "2024-Q4", value: 1450000000 },
			],
		};
	}
}

// Export singleton instance
export const portfolioDataOrchestrator = new PortfolioDataOrchestrator();

// Export types
export type {
	PortfolioData,
	PortfolioFilter,
	PortfolioSortConfig,
	AssetEnrichmentData,
};
