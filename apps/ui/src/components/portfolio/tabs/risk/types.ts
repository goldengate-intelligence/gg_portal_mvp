// Risk monitoring type definitions

export interface FilterSettings {
	activity: ActivityFilterConfig;
	performance: PerformanceFilterConfig;
	utilization: UtilizationFilterConfig;
}

export interface TempSettings extends FilterSettings {}

export interface ActivityFilterConfig {
	type: "threshold";
	redThreshold: number;
	feature: string;
	entityId: string;
	name: string;
	description: string;
}

export interface PerformanceFilterConfig {
	type: "range" | "central_band";
	optimal: { min: number; max: number };
	caution: { min: number; max: number };
	critical: { min: number; max: number };
	feature: string;
	entityId: string;
	name: string;
	description: string;
}

export interface UtilizationFilterConfig {
	type: "central_band" | "range";
	optimal: { min: number; max: number };
	caution: { min: number; max: number };
	critical: { min: number; max: number };
	feature: string;
	entityId: string;
	name: string;
	description: string;
}

export interface ActiveMonitor {
	id: string;
	name: string;
	type: "activity" | "performance" | "utilization";
	config: any;
	createdAt: Date;
	entityName?: string;
	featureName?: string;
}

export interface FeatureOption {
	label: string;
	description: string;
	unit: string;
	defaultType: "threshold" | "range" | "central_band";
	category: "activity" | "performance" | "utilization";
}

export interface PortfolioAsset {
	id: string;
	companyName: string;
	uei: string;
}
