import type { ChartOptions } from "chart.js";
import { GOLDENGATE_COLORS } from "./config";

/**
 * Merge multiple chart options objects with deep merge
 */
export function mergeChartOptions(
	...options: (Partial<ChartOptions> | undefined)[]
): ChartOptions {
	const result: any = {};

	for (const option of options) {
		if (!option) continue;

		for (const key in option) {
			const val = (option as any)[key];

			if (val === null || val === undefined) {
				continue;
			}

			if (typeof val === "object" && !Array.isArray(val)) {
				result[key] = mergeChartOptions(result[key], val);
			} else {
				result[key] = val;
			}
		}
	}

	return result as ChartOptions;
}

/**
 * Format currency values for chart labels
 */
export function formatChartCurrency(value: number): string {
	if (value >= 1000000) {
		return `$${(value / 1000000).toFixed(1)}M`;
	}
	if (value >= 1000) {
		return `$${(value / 1000).toFixed(1)}K`;
	}
	return `$${value.toFixed(0)}`;
}

/**
 * Format percentage values for chart labels
 */
export function formatChartPercentage(value: number): string {
	return `${value.toFixed(1)}%`;
}

/**
 * Generate gradient for canvas context
 */
export function createGradient(
	ctx: CanvasRenderingContext2D,
	color1: string,
	color2: string,
	vertical = true,
): CanvasGradient {
	const gradient = vertical
		? ctx.createLinearGradient(0, 0, 0, 400)
		: ctx.createLinearGradient(0, 0, 400, 0);

	gradient.addColorStop(0, color1);
	gradient.addColorStop(1, color2);

	return gradient;
}

/**
 * Generate array of colors for datasets
 */
export function generateColors(
	count: number,
	scheme: "primary" | "gradient" | "transparent" = "gradient",
): string[] {
	const schemes = {
		primary: ["#FFD700", "#00D9FF", "#7B61FF", "#FF6B35", "#39FF14", "#FF1493"],
		gradient: [
			"rgba(255, 215, 0, 0.8)",
			"rgba(0, 217, 255, 0.8)",
			"rgba(123, 97, 255, 0.8)",
			"rgba(255, 107, 53, 0.8)",
			"rgba(57, 255, 20, 0.8)",
			"rgba(255, 20, 147, 0.8)",
		],
		transparent: [
			"rgba(255, 215, 0, 0.3)",
			"rgba(0, 217, 255, 0.3)",
			"rgba(123, 97, 255, 0.3)",
			"rgba(255, 107, 53, 0.3)",
			"rgba(57, 255, 20, 0.3)",
			"rgba(255, 20, 147, 0.3)",
		],
	};

	const colors = schemes[scheme];
	const result: string[] = [];

	for (let i = 0; i < count; i++) {
		result.push(colors[i % colors.length]);
	}

	return result;
}

/**
 * Create animated dataset configuration
 */
export function createAnimatedDataset(baseConfig: any, delay = 0): any {
	return {
		...baseConfig,
		animation: {
			duration: 1000,
			delay: (ctx: any) => ctx.dataIndex * 100 + delay,
			easing: "easeInOutQuart",
		},
	};
}

/**
 * Format large numbers with abbreviations
 */
export function formatLargeNumber(value: number): string {
	if (value >= 1000000000) {
		return `${(value / 1000000000).toFixed(1)}B`;
	}
	if (value >= 1000000) {
		return `${(value / 1000000).toFixed(1)}M`;
	}
	if (value >= 1000) {
		return `${(value / 1000).toFixed(1)}K`;
	}
	return value.toFixed(0);
}

/**
 * Generate mock data for testing
 */
export function generateMockData(
	labels: string[],
	min = 0,
	max = 100,
): number[] {
	return labels.map(() => Math.random() * (max - min) + min);
}

/**
 * Create responsive chart options based on screen size
 */
export function getResponsiveOptions(
	baseOptions: ChartOptions,
	screenWidth: number,
): ChartOptions {
	const isMobile = screenWidth < 640;
	const isTablet = screenWidth < 1024;

	if (isMobile) {
		return mergeChartOptions(baseOptions, {
			plugins: {
				legend: {
					display: false,
				},
			},
			scales: {
				x: {
					ticks: {
						maxRotation: 45,
						minRotation: 45,
					},
				},
			},
		});
	}

	if (isTablet) {
		return mergeChartOptions(baseOptions, {
			plugins: {
				legend: {
					position: "bottom" as const,
				},
			},
		});
	}

	return baseOptions;
}
