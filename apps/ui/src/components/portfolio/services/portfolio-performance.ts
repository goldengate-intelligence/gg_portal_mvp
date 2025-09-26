/**
 * Portfolio Performance Calculation Service
 *
 * Provides portfolio-specific performance analytics and calculations.
 * Integrates with shared performance calculation service and contractor metrics.
 */

import { largeDataCache } from "../../../services/caching/large-data-cache";
import { contractorMetricsService } from "../../../services/contractors/contractor-metrics-service";
import { performanceCalculationService } from "../../contractor-detail/services/performance-calculations";
import type { GroupAsset, PortfolioAsset } from "./portfolio-data";

export interface PortfolioPerformanceMetrics {
	overall: {
		totalValue: number;
		weightedPerformanceScore: number;
		diversificationIndex: number;
		riskScore: number;
		growthPotential: number;
	};
	benchmarks: {
		industryAverage: number;
		sizeClassAverage: number;
		marketComparison: number;
	};
	distribution: {
		performanceDeciles: Record<string, number>;
		valueConcentration: Array<{ assetName: string; percentage: number }>;
		industryAllocation: Record<
			string,
			{ count: number; value: number; percentage: number }
		>;
		agencyAllocation: Record<
			string,
			{ count: number; value: number; percentage: number }
		>;
	};
	trends: {
		quarterlyPerformance: Array<{
			quarter: string;
			score: number;
			value: number;
		}>;
		yearOverYearGrowth: number;
		volatilityIndex: number;
		momentumScore: number;
	};
	riskAnalysis: {
		portfolioRisk: "low" | "medium" | "high";
		concentrationRisk: number;
		marketRisk: number;
		operationalRisk: number;
		riskFactors: string[];
		recommendations: string[];
	};
}

export interface AssetPerformanceComparison {
	asset: PortfolioAsset;
	performanceMetrics: {
		absoluteScore: number;
		relativeScore: number; // Compared to portfolio average
		industryRank: number;
		valueContribution: number;
		riskContribution: number;
	};
	trends: {
		recentChange: number;
		trajectory: "improving" | "stable" | "declining";
		predictedScore: number;
	};
}

export interface PortfolioOptimizationSuggestions {
	rebalancing: Array<{
		action: "increase" | "decrease" | "hold";
		asset: string;
		currentWeight: number;
		suggestedWeight: number;
		reasoning: string;
	}>;
	riskMitigation: Array<{
		riskType: string;
		severity: "low" | "medium" | "high";
		mitigation: string;
		expectedImpact: number;
	}>;
	growthOpportunities: Array<{
		opportunity: string;
		potentialReturn: number;
		requiredAction: string;
		timeframe: string;
	}>;
}

class PortfolioPerformanceService {
	private cache = largeDataCache;

	/**
	 * Calculate comprehensive portfolio performance metrics
	 */
	async calculatePortfolioPerformance(
		assets: Array<PortfolioAsset | GroupAsset>,
		benchmarkData?: any,
	): Promise<PortfolioPerformanceMetrics> {
		const cacheKey = `portfolio-performance:${JSON.stringify(assets.map((a) => a.id))}`;
		const cached = this.cache.get<PortfolioPerformanceMetrics>(cacheKey);
		if (cached) return cached;

		const portfolioAssets = assets.filter(
			(asset) => asset.type !== "group",
		) as PortfolioAsset[];

		try {
			const [overallMetrics, benchmarks, distribution, trends, riskAnalysis] =
				await Promise.all([
					this.calculateOverallMetrics(portfolioAssets),
					this.calculateBenchmarks(portfolioAssets, benchmarkData),
					this.calculateDistribution(portfolioAssets),
					this.calculateTrends(portfolioAssets),
					this.calculateRiskAnalysis(portfolioAssets),
				]);

			const result: PortfolioPerformanceMetrics = {
				overall: overallMetrics,
				benchmarks,
				distribution,
				trends,
				riskAnalysis,
			};

			// Cache for 30 minutes
			this.cache.set(cacheKey, result, 30);
			return result;
		} catch (error) {
			console.warn(
				"Failed to calculate portfolio performance, using fallback:",
				error,
			);
			return this.getFallbackPerformanceMetrics(portfolioAssets);
		}
	}

	/**
	 * Compare individual asset performance within portfolio context
	 */
	async compareAssetPerformance(
		assets: PortfolioAsset[],
	): Promise<AssetPerformanceComparison[]> {
		const cacheKey = `asset-performance-comparison:${assets.map((a) => a.id).join(",")}`;
		const cached = this.cache.get<AssetPerformanceComparison[]>(cacheKey);
		if (cached) return cached;

		try {
			const portfolioAverage =
				assets.reduce((sum, asset) => sum + asset.performanceScore, 0) /
				assets.length;
			const totalValue = this.calculateTotalPortfolioValue(assets);

			const comparisons = await Promise.all(
				assets.map(async (asset) => {
					const assetValue = this.parseFinancialString(
						asset.activeAwards.value,
					);
					const valueContribution = (assetValue / totalValue) * 100;

					// Get detailed metrics from contractor metrics service
					const detailedMetrics =
						await contractorMetricsService.getContractorMetrics(asset.uei);

					const comparison: AssetPerformanceComparison = {
						asset,
						performanceMetrics: {
							absoluteScore: asset.performanceScore,
							relativeScore: asset.performanceScore - portfolioAverage,
							industryRank: this.calculateIndustryRank(asset, assets),
							valueContribution,
							riskContribution: this.calculateRiskContribution(asset, assets),
						},
						trends: {
							recentChange: Math.random() * 10 - 5, // Mock change
							trajectory: this.determineTrend(asset.performanceScore),
							predictedScore: asset.performanceScore + (Math.random() * 10 - 5),
						},
					};

					return comparison;
				}),
			);

			// Cache for 20 minutes
			this.cache.set(cacheKey, comparisons, 20);
			return comparisons.sort(
				(a, b) =>
					b.performanceMetrics.absoluteScore -
					a.performanceMetrics.absoluteScore,
			);
		} catch (error) {
			console.warn("Failed to compare asset performance:", error);
			return this.getFallbackAssetComparisons(assets);
		}
	}

	/**
	 * Generate portfolio optimization suggestions
	 */
	async generateOptimizationSuggestions(
		assets: PortfolioAsset[],
		performanceMetrics: PortfolioPerformanceMetrics,
	): Promise<PortfolioOptimizationSuggestions> {
		const cacheKey = `portfolio-optimization:${JSON.stringify(assets.map((a) => a.id))}`;
		const cached = this.cache.get<PortfolioOptimizationSuggestions>(cacheKey);
		if (cached) return cached;

		try {
			const totalValue = this.calculateTotalPortfolioValue(assets);

			const rebalancing = assets.map((asset) => {
				const currentWeight =
					(this.parseFinancialString(asset.activeAwards.value) / totalValue) *
					100;
				const suggestedWeight = this.calculateOptimalWeight(
					asset,
					assets,
					performanceMetrics,
				);

				return {
					action: this.determineAction(currentWeight, suggestedWeight),
					asset: asset.companyName,
					currentWeight,
					suggestedWeight,
					reasoning: this.generateRebalancingReasoning(
						asset,
						currentWeight,
						suggestedWeight,
					),
				};
			});

			const riskMitigation = this.generateRiskMitigations(performanceMetrics);
			const growthOpportunities = this.generateGrowthOpportunities(
				assets,
				performanceMetrics,
			);

			const suggestions: PortfolioOptimizationSuggestions = {
				rebalancing: rebalancing.filter((r) => r.action !== "hold"),
				riskMitigation,
				growthOpportunities,
			};

			// Cache for 1 hour
			this.cache.set(cacheKey, suggestions, 60);
			return suggestions;
		} catch (error) {
			console.warn("Failed to generate optimization suggestions:", error);
			return this.getFallbackOptimizationSuggestions();
		}
	}

	/**
	 * Calculate portfolio correlation matrix
	 */
	async calculateCorrelationMatrix(
		assets: PortfolioAsset[],
	): Promise<Record<string, Record<string, number>>> {
		const cacheKey = `correlation-matrix:${assets.map((a) => a.id).join(",")}`;
		const cached =
			this.cache.get<Record<string, Record<string, number>>>(cacheKey);
		if (cached) return cached;

		try {
			// Mock correlation matrix - in production, this would use historical performance data
			const matrix: Record<string, Record<string, number>> = {};

			assets.forEach((asset1) => {
				matrix[asset1.id] = {};
				assets.forEach((asset2) => {
					if (asset1.id === asset2.id) {
						matrix[asset1.id][asset2.id] = 1.0;
					} else {
						// Mock correlation based on industry similarity
						const correlation = this.calculateMockCorrelation(asset1, asset2);
						matrix[asset1.id][asset2.id] = correlation;
					}
				});
			});

			// Cache for 2 hours
			this.cache.set(cacheKey, matrix, 120);
			return matrix;
		} catch (error) {
			console.warn("Failed to calculate correlation matrix:", error);
			return {};
		}
	}

	/**
	 * Get performance attribution analysis
	 */
	async getPerformanceAttribution(assets: PortfolioAsset[]): Promise<{
		assetSelection: number;
		sectorAllocation: number;
		marketTiming: number;
		totalAttribution: number;
	}> {
		try {
			// Mock performance attribution - in production, this would analyze actual returns
			const totalValue = this.calculateTotalPortfolioValue(assets);
			const weightedPerformance = assets.reduce((sum, asset) => {
				const weight =
					this.parseFinancialString(asset.activeAwards.value) / totalValue;
				return sum + asset.performanceScore * weight;
			}, 0);

			return {
				assetSelection: weightedPerformance * 0.6, // 60% from asset selection
				sectorAllocation: weightedPerformance * 0.25, // 25% from sector allocation
				marketTiming: weightedPerformance * 0.15, // 15% from market timing
				totalAttribution: weightedPerformance,
			};
		} catch (error) {
			console.warn("Failed to calculate performance attribution:", error);
			return {
				assetSelection: 0,
				sectorAllocation: 0,
				marketTiming: 0,
				totalAttribution: 0,
			};
		}
	}

	/**
	 * Clear performance calculation cache
	 */
	clearPerformanceCache(): void {
		this.cache.clear("portfolio-performance:");
		this.cache.clear("asset-performance-comparison:");
		this.cache.clear("portfolio-optimization:");
		this.cache.clear("correlation-matrix:");
	}

	/**
	 * Private helper methods
	 */
	private async calculateOverallMetrics(
		assets: PortfolioAsset[],
	): Promise<any> {
		const totalValue = this.calculateTotalPortfolioValue(assets);
		const weightedPerformanceScore = assets.reduce((sum, asset) => {
			const weight =
				this.parseFinancialString(asset.activeAwards.value) / totalValue;
			return sum + asset.performanceScore * weight;
		}, 0);

		return {
			totalValue,
			weightedPerformanceScore,
			diversificationIndex: this.calculateDiversificationIndex(assets),
			riskScore: this.calculatePortfolioRiskScore(assets),
			growthPotential: this.calculateGrowthPotential(assets),
		};
	}

	private async calculateBenchmarks(
		assets: PortfolioAsset[],
		benchmarkData?: any,
	): Promise<any> {
		// Mock benchmarks - in production, these would come from market data
		return {
			industryAverage: 75,
			sizeClassAverage: 72,
			marketComparison: 78,
		};
	}

	private async calculateDistribution(assets: PortfolioAsset[]): Promise<any> {
		const totalValue = this.calculateTotalPortfolioValue(assets);

		const performanceDeciles: Record<string, number> = {};
		for (let i = 1; i <= 10; i++) {
			const decile = `${(i - 1) * 10}-${i * 10}`;
			performanceDeciles[decile] = assets.filter(
				(asset) =>
					asset.performanceScore >= (i - 1) * 10 &&
					asset.performanceScore < i * 10,
			).length;
		}

		const valueConcentration = assets
			.map((asset) => ({
				assetName: asset.companyName,
				percentage:
					(this.parseFinancialString(asset.activeAwards.value) / totalValue) *
					100,
			}))
			.sort((a, b) => b.percentage - a.percentage)
			.slice(0, 10);

		const industryAllocation = this.calculateAllocationByField(
			assets,
			"naicsDescription",
			totalValue,
		);
		const agencyAllocation = this.calculateAllocationByField(
			assets,
			"primaryAgency",
			totalValue,
		);

		return {
			performanceDeciles,
			valueConcentration,
			industryAllocation,
			agencyAllocation,
		};
	}

	private async calculateTrends(assets: PortfolioAsset[]): Promise<any> {
		// Mock trends - in production, these would use historical data
		return {
			quarterlyPerformance: [
				{ quarter: "2024-Q1", score: 74.2, value: 1250000000 },
				{ quarter: "2024-Q2", score: 76.8, value: 1320000000 },
				{ quarter: "2024-Q3", score: 78.1, value: 1380000000 },
				{ quarter: "2024-Q4", score: 79.5, value: 1450000000 },
			],
			yearOverYearGrowth: 8.5,
			volatilityIndex: 12.3,
			momentumScore: 7.2,
		};
	}

	private async calculateRiskAnalysis(assets: PortfolioAsset[]): Promise<any> {
		const concentrationRisk = this.calculateConcentrationRisk(assets);
		const portfolioRisk =
			concentrationRisk > 40
				? "high"
				: concentrationRisk > 20
					? "medium"
					: "low";

		return {
			portfolioRisk,
			concentrationRisk,
			marketRisk: 25, // Mock value
			operationalRisk: 18, // Mock value
			riskFactors: this.identifyRiskFactors(assets, concentrationRisk),
			recommendations: this.generateRiskRecommendations(
				portfolioRisk,
				concentrationRisk,
			),
		};
	}

	private calculateTotalPortfolioValue(assets: PortfolioAsset[]): number {
		return assets.reduce(
			(sum, asset) => sum + this.parseFinancialString(asset.activeAwards.value),
			0,
		);
	}

	private calculateDiversificationIndex(assets: PortfolioAsset[]): number {
		// Simplified diversification index based on industry spread
		const industries = new Set(
			assets.map((asset) => asset.naicsDescription.split(" ")[0]),
		);
		return Math.min(100, (industries.size / assets.length) * 100);
	}

	private calculatePortfolioRiskScore(assets: PortfolioAsset[]): number {
		// Simplified risk score based on performance variance
		const avgPerformance =
			assets.reduce((sum, asset) => sum + asset.performanceScore, 0) /
			assets.length;
		const variance =
			assets.reduce(
				(sum, asset) => sum + (asset.performanceScore - avgPerformance) ** 2,
				0,
			) / assets.length;
		return Math.min(100, variance);
	}

	private calculateGrowthPotential(assets: PortfolioAsset[]): number {
		// Mock growth potential calculation
		return (
			assets.reduce((sum, asset) => sum + asset.performanceScore, 0) /
			assets.length
		);
	}

	private calculateAllocationByField(
		assets: PortfolioAsset[],
		field: keyof PortfolioAsset,
		totalValue: number,
	): Record<string, any> {
		const allocation: Record<
			string,
			{ count: number; value: number; percentage: number }
		> = {};

		assets.forEach((asset) => {
			const key = String(asset[field]);
			const value = this.parseFinancialString(asset.activeAwards.value);

			if (!allocation[key]) {
				allocation[key] = { count: 0, value: 0, percentage: 0 };
			}

			allocation[key].count += 1;
			allocation[key].value += value;
			allocation[key].percentage = (allocation[key].value / totalValue) * 100;
		});

		return allocation;
	}

	private calculateConcentrationRisk(assets: PortfolioAsset[]): number {
		const totalValue = this.calculateTotalPortfolioValue(assets);
		const largestPosition = Math.max(
			...assets.map((asset) =>
				this.parseFinancialString(asset.activeAwards.value),
			),
		);
		return (largestPosition / totalValue) * 100;
	}

	private calculateIndustryRank(
		asset: PortfolioAsset,
		allAssets: PortfolioAsset[],
	): number {
		const industryAssets = allAssets.filter(
			(a) => a.naicsDescription === asset.naicsDescription,
		);
		const rank =
			industryAssets
				.sort((a, b) => b.performanceScore - a.performanceScore)
				.findIndex((a) => a.id === asset.id) + 1;
		return rank;
	}

	private calculateRiskContribution(
		asset: PortfolioAsset,
		allAssets: PortfolioAsset[],
	): number {
		const totalValue = this.calculateTotalPortfolioValue(allAssets);
		const assetWeight =
			this.parseFinancialString(asset.activeAwards.value) / totalValue;
		const performanceVariance = (asset.performanceScore - 75) ** 2; // Assuming 75 as market average
		return assetWeight * performanceVariance;
	}

	private determineTrend(score: number): "improving" | "stable" | "declining" {
		if (score > 80) return "improving";
		if (score < 60) return "declining";
		return "stable";
	}

	private calculateOptimalWeight(
		asset: PortfolioAsset,
		allAssets: PortfolioAsset[],
		metrics: PortfolioPerformanceMetrics,
	): number {
		// Simplified optimal weight calculation
		const totalValue = this.calculateTotalPortfolioValue(allAssets);
		const currentWeight =
			(this.parseFinancialString(asset.activeAwards.value) / totalValue) * 100;

		// Adjust based on performance relative to portfolio average
		const performanceAdjustment =
			(asset.performanceScore - metrics.overall.weightedPerformanceScore) / 100;
		return Math.max(0, Math.min(25, currentWeight + performanceAdjustment * 5)); // Cap at 25%
	}

	private determineAction(
		currentWeight: number,
		suggestedWeight: number,
	): "increase" | "decrease" | "hold" {
		const difference = suggestedWeight - currentWeight;
		if (Math.abs(difference) < 1) return "hold";
		return difference > 0 ? "increase" : "decrease";
	}

	private generateRebalancingReasoning(
		asset: PortfolioAsset,
		currentWeight: number,
		suggestedWeight: number,
	): string {
		const difference = suggestedWeight - currentWeight;
		if (difference > 2) {
			return `Strong performance (${asset.performanceScore}) suggests increasing allocation by ${difference.toFixed(1)}%`;
		}
		if (difference < -2) {
			return `Below-average performance (${asset.performanceScore}) suggests reducing allocation by ${Math.abs(difference).toFixed(1)}%`;
		}
		return "Current allocation is optimal";
	}

	private calculateMockCorrelation(
		asset1: PortfolioAsset,
		asset2: PortfolioAsset,
	): number {
		// Mock correlation based on industry and agency similarity
		let correlation = 0.1; // Base correlation

		if (asset1.naicsDescription === asset2.naicsDescription) correlation += 0.4;
		if (asset1.primaryAgency === asset2.primaryAgency) correlation += 0.3;
		if (asset1.marketType === asset2.marketType) correlation += 0.2;

		return Math.min(0.95, correlation + (Math.random() * 0.2 - 0.1)); // Add some randomness
	}

	private identifyRiskFactors(
		assets: PortfolioAsset[],
		concentrationRisk: number,
	): string[] {
		const factors: string[] = [];

		if (concentrationRisk > 30)
			factors.push("High concentration in single asset");
		if (new Set(assets.map((a) => a.primaryAgency)).size < 3)
			factors.push("Limited agency diversification");
		if (new Set(assets.map((a) => a.naicsDescription.split(" ")[0])).size < 4)
			factors.push("Insufficient industry diversification");

		return factors;
	}

	private generateRiskRecommendations(
		riskLevel: "low" | "medium" | "high",
		concentrationRisk: number,
	): string[] {
		const recommendations: string[] = [];

		if (riskLevel === "high") {
			recommendations.push(
				"Consider reducing position sizes to improve diversification",
			);
			recommendations.push("Explore assets in uncorrelated industries");
		}

		if (concentrationRisk > 25) {
			recommendations.push("Rebalance to reduce concentration risk");
		}

		return recommendations;
	}

	private generateRiskMitigations(metrics: PortfolioPerformanceMetrics): any[] {
		// Mock risk mitigations
		return [
			{
				riskType: "Concentration Risk",
				severity: "medium" as const,
				mitigation: "Diversify into 3-4 additional industries",
				expectedImpact: 15,
			},
		];
	}

	private generateGrowthOpportunities(
		assets: PortfolioAsset[],
		metrics: PortfolioPerformanceMetrics,
	): any[] {
		// Mock growth opportunities
		return [
			{
				opportunity: "Expand into high-performing defense contractors",
				potentialReturn: 12,
				requiredAction: "Allocate 10-15% to top-tier defense assets",
				timeframe: "6-12 months",
			},
		];
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
		return Number.isNaN(numericValue) ? 0 : numericValue * multiplier;
	}

	private getFallbackPerformanceMetrics(
		assets: PortfolioAsset[],
	): PortfolioPerformanceMetrics {
		// Return basic fallback metrics
		const totalValue = this.calculateTotalPortfolioValue(assets);
		const avgPerformance =
			assets.reduce((sum, asset) => sum + asset.performanceScore, 0) /
			assets.length;

		return {
			overall: {
				totalValue,
				weightedPerformanceScore: avgPerformance,
				diversificationIndex: 65,
				riskScore: 45,
				growthPotential: 70,
			},
			benchmarks: {
				industryAverage: 75,
				sizeClassAverage: 72,
				marketComparison: 78,
			},
			distribution: {
				performanceDeciles: {},
				valueConcentration: [],
				industryAllocation: {},
				agencyAllocation: {},
			},
			trends: {
				quarterlyPerformance: [],
				yearOverYearGrowth: 0,
				volatilityIndex: 0,
				momentumScore: 0,
			},
			riskAnalysis: {
				portfolioRisk: "medium",
				concentrationRisk: 25,
				marketRisk: 20,
				operationalRisk: 15,
				riskFactors: [],
				recommendations: [],
			},
		};
	}

	private getFallbackAssetComparisons(
		assets: PortfolioAsset[],
	): AssetPerformanceComparison[] {
		return assets.map((asset) => ({
			asset,
			performanceMetrics: {
				absoluteScore: asset.performanceScore,
				relativeScore: 0,
				industryRank: 1,
				valueContribution: 10,
				riskContribution: 5,
			},
			trends: {
				recentChange: 0,
				trajectory: "stable" as const,
				predictedScore: asset.performanceScore,
			},
		}));
	}

	private getFallbackOptimizationSuggestions(): PortfolioOptimizationSuggestions {
		return {
			rebalancing: [],
			riskMitigation: [],
			growthOpportunities: [],
		};
	}
}

// Export singleton instance
export const portfolioPerformanceService = new PortfolioPerformanceService();

// Export types
export type {
	PortfolioPerformanceMetrics,
	AssetPerformanceComparison,
	PortfolioOptimizationSuggestions,
};
