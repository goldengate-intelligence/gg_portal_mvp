/**
 * Contractor Metrics Adapter
 *
 * Temporary adapter to provide sync access to contractor metrics
 * while transitioning to async shared service.
 * Uses cached data when available, fallback otherwise.
 */

import { contractorMetricsService } from "../../../services/contractors/contractor-metrics-service";
import type { ContractorMetrics } from "../../../services/contractors/contractor-metrics-service";

/**
 * Synchronous adapter for getContractorMetrics
 * Uses cached data if available, returns null otherwise
 */
export function getContractorMetrics(uei: string): ContractorMetrics | null {
	try {
		// Try to get from existing cache/fallback data synchronously
		const allMetrics = contractorMetricsService.getAllContractorMetrics();
		return allMetrics[uei] || null;
	} catch (error) {
		console.warn("Failed to get contractor metrics synchronously:", error);
		return null;
	}
}

/**
 * Synchronous adapter for getContractorMetricsByName
 * Uses cached data if available, returns null otherwise
 */
export function getContractorMetricsByName(
	companyName: string,
): ContractorMetrics | null {
	try {
		const allMetrics = contractorMetricsService.getAllContractorMetrics();
		const found = Object.values(allMetrics).find(
			(metrics) =>
				metrics.companyName.toLowerCase().includes(companyName.toLowerCase()) ||
				companyName.toLowerCase().includes(metrics.companyName.toLowerCase()),
		);
		return found || null;
	} catch (error) {
		console.warn(
			"Failed to get contractor metrics by name synchronously:",
			error,
		);
		return null;
	}
}

/**
 * Synchronous adapter for getDefaultMetrics
 */
export function getDefaultMetrics(
	uei: string,
	companyName: string,
): ContractorMetrics {
	return contractorMetricsService.getDefaultMetrics(uei, companyName);
}

/**
 * Synchronous adapter for getAllContractorMetrics
 */
export function getAllContractorMetrics(): Record<string, ContractorMetrics> {
	try {
		return contractorMetricsService.getAllContractorMetrics();
	} catch (error) {
		console.warn("Failed to get all contractor metrics synchronously:", error);
		return {};
	}
}

/**
 * Initialize contractor metrics in background
 * Call this early in component lifecycle to populate cache
 */
export function preloadContractorMetrics(ueis: string[]): void {
	// Fire and forget - load metrics into cache for later sync access
	Promise.all(
		ueis.map((uei) => contractorMetricsService.getContractorMetrics(uei)),
	).catch((error) => {
		console.warn("Failed to preload contractor metrics:", error);
	});
}
