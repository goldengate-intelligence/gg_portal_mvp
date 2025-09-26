/**
 * Activity Monitoring Logic Module
 *
 * This module handles the core logic for tracking activity-based monitoring
 * including baseline state management, change detection, and alert generation.
 */

export interface ActivityBaseline {
	id: string;
	entityId: string;
	entityName: string;
	feature:
		| "new_awards"
		| "new_obligations"
		| "new_subawards"
		| "new_relationships";
	baselineValue: number;
	baselineDate: Date;
	threshold: number;
	currentValue: number;
	lastUpdated: Date;
	details: ActivityDetails;
}

export interface ActivityDetails {
	feature: string;
	sources: Array<{
		id: string;
		name: string;
		value: number;
		date: Date;
		metadata?: Record<string, any>;
	}>;
	metadata: Record<string, any>;
}

export interface ActivityDelta {
	id: string;
	baselineId: string;
	change: number;
	previousValue: number;
	newValue: number;
	changeDate: Date;
	changeDetails: Array<{
		type: "added" | "removed" | "modified";
		item: any;
		timestamp: Date;
	}>;
	exceedsThreshold: boolean;
}

export class ActivityMonitoringService {
	private baselines: Map<string, ActivityBaseline> = new Map();
	private deltas: Map<string, ActivityDelta[]> = new Map();

	/**
	 * Creates a new activity monitoring baseline
	 */
	createBaseline(
		entityId: string,
		entityName: string,
		feature: ActivityBaseline["feature"],
		threshold: number,
		initialData?: any,
	): ActivityBaseline {
		const baselineId = `baseline-${entityId}-${feature}-${Date.now()}`;

		// Get current state for this entity and feature
		const currentData = this.getCurrentActivityData(
			entityId,
			feature,
			initialData,
		);

		const baseline: ActivityBaseline = {
			id: baselineId,
			entityId,
			entityName,
			feature,
			baselineValue: currentData.value,
			baselineDate: new Date(),
			threshold,
			currentValue: currentData.value,
			lastUpdated: new Date(),
			details: currentData.details,
		};

		this.baselines.set(baselineId, baseline);
		this.deltas.set(baselineId, []);

		return baseline;
	}

	/**
	 * Updates the current value and checks for threshold breaches
	 */
	updateActivityValue(baselineId: string, newData?: any): ActivityDelta | null {
		const baseline = this.baselines.get(baselineId);
		if (!baseline) {
			throw new Error(`Baseline ${baselineId} not found`);
		}

		// Get current state
		const currentData = this.getCurrentActivityData(
			baseline.entityId,
			baseline.feature,
			newData,
		);
		const previousValue = baseline.currentValue;
		const change = currentData.value - baseline.baselineValue;

		// Create delta record
		const delta: ActivityDelta = {
			id: `delta-${baselineId}-${Date.now()}`,
			baselineId,
			change,
			previousValue,
			newValue: currentData.value,
			changeDate: new Date(),
			changeDetails: this.calculateChangeDetails(
				baseline.details,
				currentData.details,
			),
			exceedsThreshold: Math.abs(change) > baseline.threshold,
		};

		// Update baseline
		baseline.currentValue = currentData.value;
		baseline.lastUpdated = new Date();
		baseline.details = currentData.details;

		// Store delta
		const deltas = this.deltas.get(baselineId) || [];
		deltas.push(delta);
		this.deltas.set(baselineId, deltas);

		return delta.exceedsThreshold ? delta : null;
	}

	/**
	 * Gets current activity data for an entity and feature
	 */
	private getCurrentActivityData(
		entityId: string,
		feature: ActivityBaseline["feature"],
		mockData?: any,
	): { value: number; details: ActivityDetails } {
		// In a real implementation, this would fetch from APIs
		// For now, we'll use mock data or generate realistic values

		if (mockData) {
			return {
				value: mockData.value || 0,
				details:
					mockData.details ||
					this.generateMockDetails(feature, mockData.value || 0),
			};
		}

		return this.generateMockActivityData(entityId, feature);
	}

	/**
	 * Generates mock activity data for testing
	 */
	private generateMockActivityData(
		entityId: string,
		feature: ActivityBaseline["feature"],
	): { value: number; details: ActivityDetails } {
		const baseValue = Math.floor(Math.random() * 20) + 5; // 5-25 base value

		const mockSources = Array.from({ length: baseValue }, (_, i) => ({
			id: `${feature}-${entityId}-${i + 1}`,
			name: this.generateMockSourceName(feature, i + 1),
			value: 1,
			date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
			metadata: this.generateMockMetadata(feature),
		}));

		return {
			value: baseValue,
			details: {
				feature,
				sources: mockSources,
				metadata: {
					totalValue: baseValue,
					sourceCount: mockSources.length,
					lastCalculated: new Date(),
					entityId,
				},
			},
		};
	}

	/**
	 * Generates mock source names based on feature type
	 */
	private generateMockSourceName(
		feature: ActivityBaseline["feature"],
		index: number,
	): string {
		const nameMap = {
			new_awards: `Contract Award #${index.toString().padStart(3, "0")}`,
			new_obligations: `Funding Obligation #${index.toString().padStart(3, "0")}`,
			new_subawards: `Subcontract Award #${index.toString().padStart(3, "0")}`,
			new_relationships: `Partnership Agreement #${index.toString().padStart(3, "0")}`,
		};

		return nameMap[feature] || `Activity Item #${index}`;
	}

	/**
	 * Generates mock metadata based on feature type
	 */
	private generateMockMetadata(
		feature: ActivityBaseline["feature"],
	): Record<string, any> {
		const baseMetadata = {
			new_awards: {
				contractType: ["Prime", "Subcontract", "IDIQ"][
					Math.floor(Math.random() * 3)
				],
				agency: ["DoD", "NASA", "DOE", "Commerce"][
					Math.floor(Math.random() * 4)
				],
				value: Math.floor(Math.random() * 1000000) + 100000,
			},
			new_obligations: {
				obligationType: ["Initial", "Additional", "Modification"][
					Math.floor(Math.random() * 3)
				],
				amount: Math.floor(Math.random() * 500000) + 50000,
				fiscalYear: new Date().getFullYear(),
			},
			new_subawards: {
				subcontractorType: ["Small Business", "Large Business", "8(a)", "WOSB"][
					Math.floor(Math.random() * 4)
				],
				workType: ["Manufacturing", "Services", "R&D", "Support"][
					Math.floor(Math.random() * 4)
				],
				value: Math.floor(Math.random() * 200000) + 25000,
			},
			new_relationships: {
				relationshipType: ["JV", "Teaming", "Supplier", "Strategic"][
					Math.floor(Math.random() * 4)
				],
				partnerSize: ["Small", "Medium", "Large"][
					Math.floor(Math.random() * 3)
				],
				industry: ["Defense", "Aerospace", "Technology", "Manufacturing"][
					Math.floor(Math.random() * 4)
				],
			},
		};

		return baseMetadata[feature] || {};
	}

	/**
	 * Calculates detailed changes between two activity states
	 */
	private calculateChangeDetails(
		oldDetails: ActivityDetails,
		newDetails: ActivityDetails,
	): ActivityDelta["changeDetails"] {
		const changes: ActivityDelta["changeDetails"] = [];
		const oldSourceIds = new Set(oldDetails.sources.map((s) => s.id));
		const newSourceIds = new Set(newDetails.sources.map((s) => s.id));

		// Find added items
		newDetails.sources.forEach((source) => {
			if (!oldSourceIds.has(source.id)) {
				changes.push({
					type: "added",
					item: source,
					timestamp: source.date,
				});
			}
		});

		// Find removed items
		oldDetails.sources.forEach((source) => {
			if (!newSourceIds.has(source.id)) {
				changes.push({
					type: "removed",
					item: source,
					timestamp: new Date(),
				});
			}
		});

		return changes.sort(
			(a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
		);
	}

	/**
	 * Gets all baselines for monitoring display
	 */
	getAllBaselines(): ActivityBaseline[] {
		return Array.from(this.baselines.values());
	}

	/**
	 * Gets deltas for a specific baseline
	 */
	getBaselineDeltas(baselineId: string): ActivityDelta[] {
		return this.deltas.get(baselineId) || [];
	}

	/**
	 * Gets recent alerts (deltas that exceeded thresholds)
	 */
	getRecentAlerts(hours = 24): ActivityDelta[] {
		const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
		const allDeltas: ActivityDelta[] = [];

		this.deltas.forEach((deltas) => {
			allDeltas.push(
				...deltas.filter((d) => d.exceedsThreshold && d.changeDate > cutoff),
			);
		});

		return allDeltas.sort(
			(a, b) => b.changeDate.getTime() - a.changeDate.getTime(),
		);
	}

	/**
	 * Removes a baseline and its associated deltas
	 */
	removeBaseline(baselineId: string): boolean {
		const deleted = this.baselines.delete(baselineId);
		this.deltas.delete(baselineId);
		return deleted;
	}

	/**
	 * Formats activity value for display based on feature type
	 */
	formatActivityValue(
		feature: ActivityBaseline["feature"],
		value: number,
	): string {
		const unit = this.getFeatureUnit(feature);
		return `${value} ${unit}${value !== 1 ? "s" : ""}`;
	}

	/**
	 * Gets the unit for a feature type
	 */
	private getFeatureUnit(feature: ActivityBaseline["feature"]): string {
		const unitMap = {
			new_awards: "award",
			new_obligations: "obligation",
			new_subawards: "subaward",
			new_relationships: "relationship",
		};

		return unitMap[feature] || "item";
	}

	/**
	 * Generates mock details for a given feature and value
	 */
	private generateMockDetails(
		feature: ActivityBaseline["feature"],
		value: number,
	): ActivityDetails {
		const mockSources = Array.from({ length: value }, (_, i) => ({
			id: `${feature}-mock-${i + 1}`,
			name: this.generateMockSourceName(feature, i + 1),
			value: 1,
			date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
			metadata: this.generateMockMetadata(feature),
		}));

		return {
			feature,
			sources: mockSources,
			metadata: {
				totalValue: value,
				sourceCount: mockSources.length,
				lastCalculated: new Date(),
				entityId: "mock-entity",
			},
		};
	}
}

// Export singleton instance
export const activityMonitoringService = new ActivityMonitoringService();
