import { useState } from "react";
import { featureOptions } from "../logic/featureOptions";
import { portfolioAssets } from "../logic/portfolioAssets";
import type { ActiveMonitor, FilterSettings, TempSettings } from "../types";

// Default filter configurations - Portfolio Level
const defaultFilterSettings: FilterSettings = {
	activity: {
		type: "threshold",
		redThreshold: 10,
		feature: "new_awards",
		entityId: "",
		name: "Portfolio Activity Monitoring",
		description: "Portfolio-wide threshold monitoring of activity events.",
	},
	performance: {
		type: "range",
		optimal: { min: 80, max: 100 },
		caution: { min: 60, max: 80 },
		critical: { min: 0, max: 60 },
		feature: "composite_score",
		entityId: "",
		name: "Portfolio Performance Monitoring",
		description: "Portfolio-wide performance ranking and scoring",
	},
	utilization: {
		type: "central_band",
		optimal: { min: 60, max: 75 },
		caution: { min: 45, max: 90 },
		critical: { min: 0, max: 100 },
		feature: "award_utilization",
		entityId: "",
		name: "Portfolio Utilization Monitoring",
		description: "Portfolio-wide utilization tracking with optimal ranges",
	},
};

export function useRiskMonitoring() {
	const [showFilterSettings, setShowFilterSettings] = useState(false);
	const [filterSettings, setFilterSettings] = useState<FilterSettings>(
		defaultFilterSettings,
	);
	const [tempSettings, setTempSettings] = useState<TempSettings>(
		defaultFilterSettings,
	);
	const [activeMonitors, setActiveMonitors] = useState<ActiveMonitor[]>([]);

	const handleSaveSettings = () => {
		setFilterSettings(tempSettings);

		// Create active monitors for each configured filter
		const newMonitors: ActiveMonitor[] = [];

		// Add activity monitor if configured
		if (tempSettings.activity.feature && tempSettings.activity.redThreshold) {
			newMonitors.push({
				id: `activity-${Date.now()}`,
				name: `${tempSettings.activity.name}`,
				type: "activity",
				config: tempSettings.activity,
				createdAt: new Date(),
				entityName: tempSettings.activity.entityId
					? portfolioAssets.find(
							(a) => a.uei === tempSettings.activity.entityId,
						)?.companyName
					: "All Entities",
				featureName: featureOptions[tempSettings.activity.feature]?.label,
			});
		}

		// Add performance monitor if configured
		if (tempSettings.performance.feature) {
			newMonitors.push({
				id: `performance-${Date.now()}`,
				name: `${tempSettings.performance.name}`,
				type: "performance",
				config: tempSettings.performance,
				createdAt: new Date(),
				entityName: tempSettings.performance.entityId
					? portfolioAssets.find(
							(a) => a.uei === tempSettings.performance.entityId,
						)?.companyName
					: "All Entities",
				featureName: featureOptions[tempSettings.performance.feature]?.label,
			});
		}

		// Add utilization monitor if configured
		if (tempSettings.utilization.feature) {
			newMonitors.push({
				id: `utilization-${Date.now()}`,
				name: `${tempSettings.utilization.name}`,
				type: "utilization",
				config: tempSettings.utilization,
				createdAt: new Date(),
				entityName: tempSettings.utilization.entityId
					? portfolioAssets.find(
							(a) => a.uei === tempSettings.utilization.entityId,
						)?.companyName
					: "All Entities",
				featureName: featureOptions[tempSettings.utilization.feature]?.label,
			});
		}

		setActiveMonitors(newMonitors);
		setShowFilterSettings(false);
	};

	const removeMonitor = (monitorId: string) => {
		setActiveMonitors((prev) => prev.filter((m) => m.id !== monitorId));
	};

	return {
		// State
		showFilterSettings,
		filterSettings,
		tempSettings,
		activeMonitors,

		// Actions
		setShowFilterSettings,
		setFilterSettings,
		setTempSettings,
		setActiveMonitors,
		handleSaveSettings,
		removeMonitor,

		// Data
		portfolioAssets,
		featureOptions,
	};
}
