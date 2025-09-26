/**
 * Portfolio Data Service (Refactored)
 *
 * Simplified service that delegates to the portfolio orchestrator.
 * Maintains backward compatibility while using the orchestration pattern.
 */

import { naicsPscService } from "../../../services/classification/naics-psc-service";
import { performanceColors } from "../../../services/visualization/performance-colors";
import { portfolioDataOrchestrator } from "./portfolio-orchestrator";
import type { PortfolioData, PortfolioFilter } from "./portfolio-orchestrator";

// Re-export types for backward compatibility
export interface PortfolioAsset {
	id: string;
	companyName: string;
	uei: string;
	naicsDescription: string;
	naicsCode: string;
	marketType: "civilian" | "defense";
	activeAwards: {
		value: string;
		count: number;
	};
	lifetimeAwards: string;
	revenue: string;
	pipeline: string;
	contractCount: number;
	primaryAgency: string;
	performanceScore: number;
	lastUpdated: string;
}

export interface GroupAsset {
	id: string;
	type: "group";
	companyName: string;
	groupName: string;
	uei: string; // Representative UEI
	memberAssets: PortfolioAsset[];
	aggregatedMetrics: {
		lifetime: string;
		revenue: string;
		pipeline: string;
	};
	marketType: "civilian" | "defense" | "mixed";
	naicsDescription: string;
	activeAwards: {
		value: string;
		count: number;
	};
}

export interface PortfolioMetrics {
	totalAssets: number;
	totalValue: string;
	averagePerformance: number;
	topPerformers: PortfolioAsset[];
	industryBreakdown: Array<{
		industry: string;
		count: number;
		percentage: number;
	}>;
}

class PortfolioDataService {
	constructor() {
		// Initialize NAICS service in background (lazy loading)
		this.initializeServices();
	}

	/**
	 * Initialize shared services in background
	 */
	private async initializeServices(): Promise<void> {
		try {
			// Trigger loading of NAICS/PSC classifications
			await naicsPscService.searchByKeyword("aerospace").catch(() => {
				// Ignore errors during initialization
			});
		} catch (error) {
			// Silent fail - services will work with fallbacks
		}
	}

	/**
	 * Get portfolio assets using orchestration service
	 */
	async getPortfolioAssets(
		portfolioId?: string,
		filters?: PortfolioFilter,
	): Promise<PortfolioAsset[]> {
		try {
			const portfolioData = await portfolioDataOrchestrator.getPortfolioData(
				portfolioId,
				filters,
			);
			return portfolioData.assets.filter(
				(asset) => asset.type !== "group",
			) as PortfolioAsset[];
		} catch (error) {
			console.error("Failed to fetch portfolio assets:", error);
			return [];
		}
	}

	/**
	 * Get complete portfolio data
	 */
	async getPortfolioData(
		portfolioId?: string,
		filters?: PortfolioFilter,
	): Promise<PortfolioData> {
		return portfolioDataOrchestrator.getPortfolioData(portfolioId, filters);
	}

	/**
	 * Search assets
	 */
	async searchAssets(
		query: string,
		portfolioId?: string,
	): Promise<PortfolioAsset[]> {
		return portfolioDataOrchestrator.searchAssets(query, portfolioId);
	}

	/**
	 * Get portfolio analytics
	 */
	async getPortfolioAnalytics(portfolioId?: string): Promise<any> {
		return portfolioDataOrchestrator.getPortfolioAnalytics(portfolioId);
	}

	/**
	 * Get industry classification (uses shared service)
	 */
	getIndustryClassification(companyName: string, naicsDescription: string) {
		const classification =
			naicsPscService.searchByKeywordSync(naicsDescription)[0];

		return {
			image: naicsPscService.getIndustryImage(companyName, naicsDescription),
			tag: naicsPscService.getIndustryTag(companyName, naicsDescription),
			category: classification?.category || "Other",
			keywords: classification?.keywords || [],
		};
	}

	/**
	 * Get performance color based on score
	 */
	getPerformanceColor(score: number): string {
		return performanceColors.getScoreColor(score);
	}

	/**
	 * Calculate portfolio metrics (delegated to orchestrator)
	 */
	async calculatePortfolioMetrics(
		portfolioId?: string,
	): Promise<PortfolioMetrics> {
		const portfolioData =
			await portfolioDataOrchestrator.getPortfolioData(portfolioId);
		return portfolioData.metrics;
	}

	/**
	 * Create asset group (delegated to orchestrator)
	 */
	async createAssetGroup(
		assetIds: string[],
		groupName: string,
	): Promise<{ success: boolean; groupId?: string }> {
		const result = await portfolioDataOrchestrator.updateAssetGrouping({
			type: "create",
			assetIds,
			groupName,
		});

		return {
			success: result.success,
			groupId: result.updatedData.groupedAssets
				? Object.keys(result.updatedData.groupedAssets)[0]
				: undefined,
		};
	}

	/**
	 * Update pinned assets (delegated to orchestrator)
	 */
	async updatePinnedAssets(assetIds: string[]): Promise<{ success: boolean }> {
		return portfolioDataOrchestrator.updatePinnedAssets(assetIds);
	}

	/**
	 * Get asset enrichment data
	 */
	async getAssetEnrichmentData(ueis: string[]): Promise<any> {
		return portfolioDataOrchestrator.getAssetEnrichmentData(ueis);
	}

	/**
	 * Invalidate cache
	 */
	invalidateCache(portfolioId?: string): void {
		portfolioDataOrchestrator.invalidatePortfolioCache(portfolioId);
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats(): { size: number; hitRate: number } {
		return portfolioDataOrchestrator.getCacheStats();
	}

	/**
	 * Legacy method - determine market type from agency
	 */
	private determineMarketType(agency?: string): "civilian" | "defense" {
		if (!agency) return "civilian";
		const defenseAgencies = [
			"defense",
			"dod",
			"army",
			"navy",
			"air force",
			"space force",
		];
		const agencyLower = agency.toLowerCase();
		return defenseAgencies.some((defenseAgency) =>
			agencyLower.includes(defenseAgency),
		)
			? "defense"
			: "civilian";
	}

	/**
	 * Legacy method - parse financial strings
	 */
	private parseMoneyValue(value: string): number {
		if (!value || typeof value !== "string") return 0;

		const cleanValue = value.replace(/[$,\s]/g, "");
		const multiplier = cleanValue.includes("B")
			? 1e9
			: cleanValue.includes("M")
				? 1e6
				: cleanValue.includes("K")
					? 1e3
					: 1;
		const numericValue = Number.parseFloat(cleanValue.replace(/[BMK]/g, ""));

		return Number.isNaN(numericValue) ? 0 : numericValue * multiplier;
	}

	/**
	 * Legacy method - format currency
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
		return `$${Math.round(value)}`;
	}
}

// Export singleton instance
export const portfolioDataService = new PortfolioDataService();

// Export types for external use
export type { PortfolioAsset, GroupAsset, PortfolioMetrics };
