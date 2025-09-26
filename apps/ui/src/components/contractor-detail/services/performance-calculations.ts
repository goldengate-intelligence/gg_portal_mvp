/**
 * Contractor Performance Calculation Service
 *
 * Provides performance metrics calculations and analysis for contractor detail views.
 * Integrates with shared services for data sources and caching.
 */

import { largeDataCache } from "../../../services/caching/large-data-cache";
import type { ContractorPerformanceData } from "./contractor-data";

export interface PerformanceMetrics {
	efficiency: {
		costPerformanceRatio: number;
		timeToCompletion: number;
		qualityScore: number;
	};
	growth: {
		revenueGrowthRate: number;
		contractCountGrowth: number;
		marketShareGrowth: number;
	};
	reliability: {
		onTimeDeliveryRate: number;
		contractRenewalRate: number;
		clientSatisfactionScore: number;
	};
	competitiveness: {
		winRate: number;
		averageBidMargin: number;
		marketPositioning: number;
	};
}

export interface BenchmarkComparison {
	industryRanking: {
		percentile: number;
		rank: number;
		totalCompetitors: number;
	};
	sizeClassRanking: {
		percentile: number;
		rank: number;
		totalInClass: number;
	};
	regionalRanking: {
		percentile: number;
		rank: number;
		totalInRegion: number;
	};
}

export interface PerformanceTrends {
	timeSeriesData: Array<{
		period: string;
		revenue: number;
		efficiency: number;
		growth: number;
		reliability: number;
	}>;
	seasonalPatterns: {
		quarterlyTrends: Record<string, number>;
		monthlyPatterns: Record<string, number>;
	};
	predictiveMetrics: {
		projectedRevenue6Months: number;
		projectedRevenue12Months: number;
		confidenceInterval: number;
	};
}

class PerformanceCalculationService {
	private cache = largeDataCache;

	/**
	 * Calculate comprehensive performance metrics
	 */
	calculatePerformanceMetrics(
		performanceData: ContractorPerformanceData,
		historicalData?: any[],
	): PerformanceMetrics {
		const cacheKey = `perf-metrics:${JSON.stringify(performanceData)}`;
		const cached = this.cache.get<PerformanceMetrics>(cacheKey);
		if (cached) return cached;

		const metrics = this.computeMetrics(performanceData, historicalData);

		// Cache for 1 hour
		this.cache.set(cacheKey, metrics, 60);
		return metrics;
	}

	/**
	 * Generate benchmark comparison data
	 */
	generateBenchmarkComparison(
		contractorId: string,
		performanceData: ContractorPerformanceData,
		industry: string,
		sizeClass: string,
		region: string,
	): BenchmarkComparison {
		const cacheKey = `benchmark:${contractorId}:${industry}:${sizeClass}:${region}`;
		const cached = this.cache.get<BenchmarkComparison>(cacheKey);
		if (cached) return cached;

		const benchmarks = this.computeBenchmarks(
			performanceData,
			industry,
			sizeClass,
			region,
		);

		// Cache for 4 hours (benchmarks change less frequently)
		this.cache.set(cacheKey, benchmarks, 240);
		return benchmarks;
	}

	/**
	 * Calculate performance trends and predictions
	 */
	calculatePerformanceTrends(
		performanceData: ContractorPerformanceData,
		timeSeriesData: any[],
	): PerformanceTrends {
		const cacheKey = `perf-trends:${JSON.stringify(performanceData.summary)}`;
		const cached = this.cache.get<PerformanceTrends>(cacheKey);
		if (cached) return cached;

		const trends = this.computeTrends(performanceData, timeSeriesData);

		// Cache for 2 hours
		this.cache.set(cacheKey, trends, 120);
		return trends;
	}

	/**
	 * Calculate composite score with weighted factors
	 */
	calculateCompositeScore(
		performanceData: ContractorPerformanceData,
		weights?: {
			revenue?: number;
			growth?: number;
			efficiency?: number;
			reliability?: number;
		},
	): number {
		const defaultWeights = {
			revenue: 0.3,
			growth: 0.25,
			efficiency: 0.25,
			reliability: 0.2,
			...weights,
		};

		const scores = performanceData.scores;

		return (
			scores.revenue * defaultWeights.revenue +
			scores.growth * defaultWeights.growth +
			(scores.awards * 0.5 + scores.duration * 0.5) *
				defaultWeights.efficiency +
			scores.pipeline * defaultWeights.reliability
		);
	}

	/**
	 * Generate revenue forecasting
	 */
	forecastRevenue(
		performanceData: ContractorPerformanceData,
		monthsAhead = 12,
	): Array<{
		month: string;
		projectedRevenue: number;
		confidenceInterval: [number, number];
	}> {
		const metrics = performanceData.metrics;
		if (metrics.length < 6) {
			// Not enough data for reliable forecasting
			return [];
		}

		const forecasts: Array<{
			month: string;
			projectedRevenue: number;
			confidenceInterval: [number, number];
		}> = [];

		// Simple linear regression for demonstration
		// In production, you'd use more sophisticated time series forecasting
		const recentRevenues = metrics
			.slice(-12)
			.map((m) => Number.parseFloat(m.monthlyRevenue));
		const avgRevenue =
			recentRevenues.reduce((a, b) => a + b, 0) / recentRevenues.length;

		// Calculate trend
		const trend = this.calculateLinearTrend(recentRevenues);

		for (let i = 1; i <= monthsAhead; i++) {
			const baseDate = new Date();
			baseDate.setMonth(baseDate.getMonth() + i);
			const monthKey = `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, "0")}`;

			const projectedRevenue = avgRevenue + trend * i;
			const variance = this.calculateVariance(recentRevenues);
			const confidenceInterval: [number, number] = [
				projectedRevenue - variance,
				projectedRevenue + variance,
			];

			forecasts.push({
				month: monthKey,
				projectedRevenue: Math.max(0, projectedRevenue),
				confidenceInterval,
			});
		}

		return forecasts;
	}

	/**
	 * Calculate risk assessment
	 */
	assessPerformanceRisk(
		performanceData: ContractorPerformanceData,
		marketData?: any,
	): {
		riskLevel: "low" | "medium" | "high";
		riskFactors: string[];
		riskScore: number;
		recommendations: string[];
	} {
		let riskScore = 0;
		const riskFactors: string[] = [];
		const recommendations: string[] = [];

		// Analyze revenue stability
		const recentRevenues = performanceData.metrics
			.slice(-6)
			.map((m) => Number.parseFloat(m.monthlyRevenue));
		const revenueVolatility = this.calculateVolatility(recentRevenues);

		if (revenueVolatility > 0.3) {
			riskScore += 25;
			riskFactors.push("High revenue volatility");
			recommendations.push(
				"Diversify contract portfolio to reduce revenue fluctuations",
			);
		}

		// Analyze growth trends
		if (performanceData.scores.growth < 50) {
			riskScore += 20;
			riskFactors.push("Below-average growth performance");
			recommendations.push(
				"Focus on business development and market expansion",
			);
		}

		// Analyze pipeline health
		const pipelineRatio =
			performanceData.summary.pipelineValue /
			performanceData.summary.totalRevenue;
		if (pipelineRatio < 0.5) {
			riskScore += 15;
			riskFactors.push("Low pipeline-to-revenue ratio");
			recommendations.push(
				"Increase business development efforts to build pipeline",
			);
		}

		// Analyze contract concentration
		if (performanceData.summary.activeContracts < 5) {
			riskScore += 20;
			riskFactors.push("High client concentration risk");
			recommendations.push("Diversify client base to reduce dependency risk");
		}

		// Determine risk level
		let riskLevel: "low" | "medium" | "high" = "low";
		if (riskScore >= 60) riskLevel = "high";
		else if (riskScore >= 30) riskLevel = "medium";

		return {
			riskLevel,
			riskFactors,
			riskScore,
			recommendations,
		};
	}

	/**
	 * Private: Compute detailed performance metrics
	 */
	private computeMetrics(
		performanceData: ContractorPerformanceData,
		historicalData?: any[],
	): PerformanceMetrics {
		// Mock implementation - in production, these would be complex calculations
		// based on actual performance data and industry benchmarks

		return {
			efficiency: {
				costPerformanceRatio: 0.85, // Lower is better (cost/value delivered)
				timeToCompletion: 0.92, // Higher is better (on-time completion rate)
				qualityScore: 0.88, // Higher is better
			},
			growth: {
				revenueGrowthRate: 0.15, // 15% annual growth
				contractCountGrowth: 0.08, // 8% growth in contract count
				marketShareGrowth: 0.03, // 3% market share growth
			},
			reliability: {
				onTimeDeliveryRate: 0.94, // 94% on-time delivery
				contractRenewalRate: 0.78, // 78% renewal rate
				clientSatisfactionScore: 0.86, // 86% satisfaction
			},
			competitiveness: {
				winRate: 0.32, // 32% bid win rate
				averageBidMargin: 0.12, // 12% average margin
				marketPositioning: 0.75, // 75th percentile
			},
		};
	}

	/**
	 * Private: Compute benchmark comparisons
	 */
	private computeBenchmarks(
		performanceData: ContractorPerformanceData,
		industry: string,
		sizeClass: string,
		region: string,
	): BenchmarkComparison {
		// Mock benchmarks - in production, these would come from industry databases
		return {
			industryRanking: {
				percentile: 78,
				rank: 22,
				totalCompetitors: 100,
			},
			sizeClassRanking: {
				percentile: 85,
				rank: 6,
				totalInClass: 40,
			},
			regionalRanking: {
				percentile: 72,
				rank: 14,
				totalInRegion: 50,
			},
		};
	}

	/**
	 * Private: Compute performance trends
	 */
	private computeTrends(
		performanceData: ContractorPerformanceData,
		timeSeriesData: any[],
	): PerformanceTrends {
		// Mock trends - in production, these would be sophisticated time series analysis
		const currentRevenue = performanceData.summary.totalRevenue;

		return {
			timeSeriesData: performanceData.metrics.map((m) => ({
				period: m.monthYear,
				revenue: Number.parseFloat(m.monthlyRevenue),
				efficiency: 0.85 + Math.random() * 0.1,
				growth: 0.15 + Math.random() * 0.05,
				reliability: 0.9 + Math.random() * 0.05,
			})),
			seasonalPatterns: {
				quarterlyTrends: {
					Q1: 0.92,
					Q2: 1.05,
					Q3: 0.98,
					Q4: 1.15,
				},
				monthlyPatterns: {
					Jan: 0.95,
					Feb: 0.9,
					Mar: 0.92,
					Apr: 1.05,
					May: 1.08,
					Jun: 1.02,
					Jul: 0.98,
					Aug: 0.95,
					Sep: 1.01,
					Oct: 1.1,
					Nov: 1.18,
					Dec: 1.2,
				},
			},
			predictiveMetrics: {
				projectedRevenue6Months: currentRevenue * 0.55, // 6 months projection
				projectedRevenue12Months: currentRevenue * 1.15, // 12 months with growth
				confidenceInterval: 0.82, // 82% confidence
			},
		};
	}

	/**
	 * Private: Calculate linear trend
	 */
	private calculateLinearTrend(values: number[]): number {
		const n = values.length;
		const sumX = (n * (n + 1)) / 2;
		const sumY = values.reduce((a, b) => a + b, 0);
		const sumXY = values.reduce((sum, y, i) => sum + (i + 1) * y, 0);
		const sumXX = (n * (n + 1) * (2 * n + 1)) / 6;

		return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
	}

	/**
	 * Private: Calculate variance
	 */
	private calculateVariance(values: number[]): number {
		const mean = values.reduce((a, b) => a + b, 0) / values.length;
		const squaredDiffs = values.map((value) => (value - mean) ** 2);
		return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
	}

	/**
	 * Private: Calculate volatility
	 */
	private calculateVolatility(values: number[]): number {
		if (values.length < 2) return 0;

		const returns = [];
		for (let i = 1; i < values.length; i++) {
			returns.push((values[i] - values[i - 1]) / values[i - 1]);
		}

		return this.calculateVariance(returns);
	}
}

// Export singleton instance
export const performanceCalculationService =
	new PerformanceCalculationService();

// Export types
export type { PerformanceMetrics, BenchmarkComparison, PerformanceTrends };
