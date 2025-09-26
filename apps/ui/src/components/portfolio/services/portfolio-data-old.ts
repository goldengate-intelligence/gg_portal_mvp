/**
 * Portfolio Data Service
 *
 * Orchestrates shared services to provide portfolio-specific data operations.
 * Eliminates cross-component imports by using shared services.
 */

import { naicsPscService } from "../../../services/classification/naics-psc-service";
import { contractorLogoService } from "../../../services/contractors/contractor-logo-service";
import { icebergReader } from "../../../services/data-sources/iceberg-reader";
import { performanceColors } from "../../../services/visualization/performance-colors";

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
	 * Get portfolio assets from iceberg tables
	 */
	async getPortfolioAssets(portfolioId?: string): Promise<PortfolioAsset[]> {
		try {
			const result = await icebergReader.getPortfolioAssets(portfolioId);

			const assets: PortfolioAsset[] = result.data.map((raw) => ({
				id: raw.id || raw.uei,
				companyName: raw.company_name,
				uei: raw.uei,
				naicsDescription: raw.naics_description,
				naicsCode: raw.naics_code,
				marketType: this.determineMarketType(raw.primary_agency),
				activeAwards: {
					value: raw.active_awards_value || "$0",
					count: Number.parseInt(raw.active_awards_count || "0"),
				},
				lifetimeAwards: raw.lifetime_awards || "$0",
				revenue: raw.estimated_revenue || "$0",
				pipeline: raw.estimated_pipeline || "$0",
				contractCount: Number.parseInt(raw.contract_count || "0"),
				primaryAgency: raw.primary_agency || "Unknown",
				performanceScore: Number.parseFloat(raw.performance_score || "75"),
				lastUpdated: raw.last_updated || new Date().toISOString(),
			}));

			return assets.sort((a, b) => b.performanceScore - a.performanceScore);
		} catch (error) {
			console.error("Failed to fetch portfolio assets:", error);
			return [];
		}
	}

	/**
	 * Get contractor logo (uses shared service)
	 */
	async getContractorLogo(
		uei: string,
		companyName?: string,
	): Promise<string | null> {
		const logoResponse = await contractorLogoService.getContractorLogo(
			uei,
			companyName,
		);
		return logoResponse.logoUrl;
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
	 * Calculate portfolio metrics
	 */
	calculatePortfolioMetrics(assets: PortfolioAsset[]): PortfolioMetrics {
		const totalAssets = assets.length;

		// Calculate total value
		const totalValueNum = assets.reduce((sum, asset) => {
			return sum + this.parseMoneyValue(asset.activeAwards.value);
		}, 0);
		const totalValue = this.formatCurrency(totalValueNum);

		// Calculate average performance
		const averagePerformance =
			assets.length > 0
				? assets.reduce((sum, asset) => sum + asset.performanceScore, 0) /
					assets.length
				: 0;

		// Get top performers (top 25%)
		const topPerformersCount = Math.max(1, Math.ceil(assets.length * 0.25));
		const topPerformers = assets
			.sort((a, b) => b.performanceScore - a.performanceScore)
			.slice(0, topPerformersCount);

		// Calculate industry breakdown
		const industryCount = new Map<string, number>();
		assets.forEach((asset) => {
			const classification = naicsPscService.getByNAICSSync(asset.naicsCode);
			const industry = classification?.category || "Other";
			industryCount.set(industry, (industryCount.get(industry) || 0) + 1);
		});

		const industryBreakdown = Array.from(industryCount.entries())
			.map(([industry, count]) => ({
				industry,
				count,
				percentage: (count / totalAssets) * 100,
			}))
			.sort((a, b) => b.count - a.count);

		return {
			totalAssets,
			totalValue,
			averagePerformance,
			topPerformers,
			industryBreakdown,
		};
	}

	/**
	 * Create asset group
	 */
	createAssetGroup(assets: PortfolioAsset[], groupName: string): GroupAsset {
		if (assets.length === 0) {
			throw new Error("Cannot create group with no assets");
		}

		// Calculate aggregated metrics
		const totalLifetime = assets.reduce(
			(sum, asset) => sum + this.parseMoneyValue(asset.lifetimeAwards),
			0,
		);
		const totalRevenue = assets.reduce(
			(sum, asset) => sum + this.parseMoneyValue(asset.revenue),
			0,
		);
		const totalPipeline = assets.reduce(
			(sum, asset) => sum + this.parseMoneyValue(asset.pipeline),
			0,
		);
		const totalActiveValue = assets.reduce(
			(sum, asset) => sum + this.parseMoneyValue(asset.activeAwards.value),
			0,
		);
		const totalActiveCount = assets.reduce(
			(sum, asset) => sum + asset.activeAwards.count,
			0,
		);

		// Determine market type
		const marketTypes = assets.map((a) => a.marketType);
		const defenseCount = marketTypes.filter((t) => t === "defense").length;
		const civilianCount = marketTypes.filter((t) => t === "civilian").length;

		let marketType: "civilian" | "defense" | "mixed";
		if (defenseCount === 0) marketType = "civilian";
		else if (civilianCount === 0) marketType = "defense";
		else marketType = "mixed";

		// Use most common NAICS description
		const naicsDescriptions = assets.map((a) => a.naicsDescription);
		const naicsCount = new Map<string, number>();
		naicsDescriptions.forEach((desc) => {
			naicsCount.set(desc, (naicsCount.get(desc) || 0) + 1);
		});
		const naicsDescription =
			[...naicsCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ||
			"Mixed Industries";

		return {
			id: `group_${Date.now()}`,
			type: "group",
			companyName: groupName,
			groupName,
			uei: assets[0].uei, // Use first asset's UEI as representative
			memberAssets: assets,
			aggregatedMetrics: {
				lifetime: this.formatCurrency(totalLifetime),
				revenue: this.formatCurrency(totalRevenue),
				pipeline: this.formatCurrency(totalPipeline),
			},
			marketType,
			naicsDescription,
			activeAwards: {
				value: this.formatCurrency(totalActiveValue),
				count: totalActiveCount,
			},
		};
	}

	/**
	 * Update asset group
	 */
	updateAssetGroup(
		group: GroupAsset,
		updates: Partial<Pick<GroupAsset, "groupName" | "memberAssets">>,
	): GroupAsset {
		const updatedGroup = { ...group };

		if (updates.groupName) {
			updatedGroup.companyName = updates.groupName;
			updatedGroup.groupName = updates.groupName;
		}

		if (updates.memberAssets) {
			updatedGroup.memberAssets = updates.memberAssets;
			// Recalculate aggregated metrics
			const recreated = this.createAssetGroup(
				updates.memberAssets,
				updatedGroup.groupName,
			);
			updatedGroup.aggregatedMetrics = recreated.aggregatedMetrics;
			updatedGroup.marketType = recreated.marketType;
			updatedGroup.naicsDescription = recreated.naicsDescription;
			updatedGroup.activeAwards = recreated.activeAwards;
		}

		return updatedGroup;
	}

	/**
	 * Save portfolio configuration
	 */
	async savePortfolio(
		portfolioId: string,
		assets: Array<PortfolioAsset | GroupAsset>,
	): Promise<void> {
		try {
			// In a real implementation, this would save to your backend
			console.log("Saving portfolio:", portfolioId, assets);

			// For now, store in localStorage as fallback
			localStorage.setItem(
				`portfolio_${portfolioId}`,
				JSON.stringify({
					id: portfolioId,
					assets,
					lastUpdated: new Date().toISOString(),
				}),
			);
		} catch (error) {
			console.error("Failed to save portfolio:", error);
			throw error;
		}
	}

	/**
	 * Load portfolio configuration
	 */
	async loadPortfolio(
		portfolioId: string,
	): Promise<Array<PortfolioAsset | GroupAsset> | null> {
		try {
			// Try localStorage first
			const stored = localStorage.getItem(`portfolio_${portfolioId}`);
			if (stored) {
				const parsed = JSON.parse(stored);
				return parsed.assets || null;
			}

			return null;
		} catch (error) {
			console.error("Failed to load portfolio:", error);
			return null;
		}
	}

	/**
	 * Private: Determine market type from agency
	 */
	private determineMarketType(primaryAgency?: string): "civilian" | "defense" {
		if (!primaryAgency) return "civilian";

		const agency = primaryAgency.toLowerCase();
		const defenseKeywords = [
			"defense",
			"dod",
			"army",
			"navy",
			"air force",
			"marines",
			"military",
		];

		return defenseKeywords.some((keyword) => agency.includes(keyword))
			? "defense"
			: "civilian";
	}

	/**
	 * Private: Parse money string to number
	 */
	private parseMoneyValue(moneyStr: string): number {
		const cleaned = moneyStr.replace(/[^\d.-]/g, "");
		const value = Number.parseFloat(cleaned) || 0;

		if (moneyStr.includes("B")) return value * 1000000000;
		if (moneyStr.includes("M")) return value * 1000000;
		if (moneyStr.includes("K")) return value * 1000;

		return value;
	}

	/**
	 * Private: Format number as currency
	 */
	private formatCurrency(value: number): string {
		if (value >= 1000000000) {
			return `$${(value / 1000000000).toFixed(1)}B`;
		}
		if (value >= 1000000) {
			return `$${(value / 1000000).toFixed(1)}M`;
		}
		if (value >= 1000) {
			return `$${(value / 1000).toFixed(1)}K`;
		}
		return `$${value.toFixed(0)}`;
	}
}

// Export singleton instance
export const portfolioDataService = new PortfolioDataService();

export { PortfolioDataService };

// Explicit type exports for better module resolution
export type { PortfolioAsset, GroupAsset, PortfolioMetrics };
