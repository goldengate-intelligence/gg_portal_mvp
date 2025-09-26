import { Plus, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { activityMonitoringService } from "../../../../../logic/activity-monitoring";
import { baselineLogger } from "../../../../../logic/baseline-logger";
import { Button } from "../../../../ui/button";
import type { FeatureOption, PortfolioAsset, TempSettings } from "../types";

interface SavedActivityFilter {
	id: string;
	name: string;
	config: TempSettings["activity"];
	createdAt: Date;
}

interface ActivityFilterProps {
	tempSettings: TempSettings;
	setTempSettings: React.Dispatch<React.SetStateAction<TempSettings>>;
	portfolioAssets: PortfolioAsset[];
	featureOptions: Record<string, FeatureOption>;
}

export function ActivityFilter({
	tempSettings,
	setTempSettings,
	portfolioAssets,
	featureOptions,
}: ActivityFilterProps) {
	const [savedFilters, setSavedFilters] = useState<SavedActivityFilter[]>([]);
	const [activeTab, setActiveTab] = useState<string | null>(null);
	const [isCreatingFilter, setIsCreatingFilter] = useState(false);

	const handleSaveFilter = async () => {
		try {
			const entityId = tempSettings.activity.entityId || "all_entities";
			const feature = tempSettings.activity.feature || "new_awards";

			// Create baseline for activity monitoring
			const entity = portfolioAssets.find(
				(a) => a.uei === tempSettings.activity.entityId,
			);

			if (entity && tempSettings.activity.feature) {
				const baseline = await activityMonitoringService.createBaseline(
					entity.uei,
					entity.companyName,
					tempSettings.activity.feature as any,
					tempSettings.activity.redThreshold,
				);

				// Log the baseline with detailed breakdown
				const log = baselineLogger.logBaseline(baseline, {
					description: `Activity monitoring for ${tempSettings.activity.name}`,
					tags: ["activity", "threshold", tempSettings.activity.feature],
					createdBy: "user",
					alertOnIncrease: true,
				});

				console.log("Created baseline and log:", { baseline, log });
			}

			// Generate filter name
			const entityName =
				entityId === "all_entities"
					? "All Entities"
					: portfolioAssets.find((a) => a.uei === entityId)?.companyName ||
						entityId;

			const featureName = featureOptions[feature]?.label || feature;

			// Check if a filter with this entity/feature combo already exists
			const existingFilterIndex = savedFilters.findIndex(
				(filter) =>
					filter.config.entityId === entityId &&
					filter.config.feature === feature,
			);

			if (existingFilterIndex !== -1) {
				// Update existing filter
				const configToSave = {
					...tempSettings.activity,
					entityId,
					feature,
				};

				const updatedFilter: SavedActivityFilter = {
					...savedFilters[existingFilterIndex],
					name: `${entityName} ${featureName}`,
					config: configToSave,
					createdAt: new Date(),
				};

				setSavedFilters((prev) =>
					prev.map((filter, index) =>
						index === existingFilterIndex ? updatedFilter : filter,
					),
				);
				setActiveTab(updatedFilter.id);
			} else {
				// Create new filter
				const configToSave = {
					...tempSettings.activity,
					entityId,
					feature,
				};

				const newFilter: SavedActivityFilter = {
					id: `activity-${Date.now()}`,
					name: `${entityName} ${featureName}`,
					config: configToSave,
					createdAt: new Date(),
				};

				setSavedFilters((prev) => [...prev, newFilter]);
				setActiveTab(newFilter.id);
			}

			setIsCreatingFilter(false);
		} catch (error) {
			console.error("Error saving activity filter:", error);
		}
	};

	const loadFilter = (filter: SavedActivityFilter) => {
		setTempSettings((prev) => ({
			...prev,
			activity: { ...filter.config },
		}));
		setActiveTab(filter.id);
		setIsCreatingFilter(false);
	};

	const deleteFilter = (filterId: string) => {
		setSavedFilters((prev) => prev.filter((f) => f.id !== filterId));
		if (activeTab === filterId) {
			setActiveTab(null);
		}
	};

	return (
		<div className="border border-gray-700/30 rounded-xl p-6 bg-orange-900/40">
			{/* Header Section */}
			<div className="mb-6">
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-xl font-semibold text-white">
						Activity Monitoring
					</h3>
					<div className="text-sm px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/30 font-medium">
						THRESHOLD MONITORING
					</div>
				</div>
				<p className="text-sm text-gray-400 leading-relaxed">
					Monitor selected activity types for your assets
				</p>
			</div>

			{/* Entity and Feature Selection */}
			<div
				className="rounded-lg p-4 border border-gray-700 mb-6"
				style={{ backgroundColor: "#111827" }}
			>
				<h4 className="text-sm font-medium text-gray-200 mb-3">
					Filter Target
				</h4>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-xs text-gray-400 mb-2">Entity</label>
						<select
							value={tempSettings.activity.entityId || ""}
							onChange={(e) =>
								setTempSettings((prev) => ({
									...prev,
									activity: { ...prev.activity, entityId: e.target.value },
								}))
							}
							className="w-full bg-gray-800 border border-gray-600/50 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-400/50"
						>
							<option value="">All Entities</option>
							{portfolioAssets.map((asset) => (
								<option key={asset.id} value={asset.uei}>
									{asset.companyName} ({asset.uei})
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-xs text-gray-400 mb-2">Feature</label>
						<select
							value={tempSettings.activity.feature || "new_awards"}
							onChange={(e) =>
								setTempSettings((prev) => ({
									...prev,
									activity: {
										...prev.activity,
										feature: e.target.value,
										name: featureOptions[e.target.value].label,
										description: featureOptions[e.target.value].description,
									},
								}))
							}
							className="w-full bg-gray-800 border border-gray-600/50 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-400/50"
						>
							{Object.entries(featureOptions)
								.filter(([key]) => key.startsWith("new_"))
								.map(([key, option]) => (
									<option key={key} value={key}>
										{option.label}
									</option>
								))}
						</select>
					</div>
				</div>
			</div>

			{/* Alert Threshold Configuration */}
			<div
				className="rounded-lg p-4 border border-gray-700 mb-6"
				style={{ backgroundColor: "#111827" }}
			>
				<h4 className="text-sm font-medium text-gray-200 mb-3">
					Alert Threshold
				</h4>
				<div className="space-y-3">
					<div className="flex items-center space-x-3">
						<span className="text-xs text-red-400 w-20">ALERT {">"}</span>
						<input
							type="range"
							min="1"
							max="100"
							value={tempSettings.activity.redThreshold}
							onChange={(e) =>
								setTempSettings((prev) => ({
									...prev,
									activity: {
										...prev.activity,
										redThreshold: Number.parseInt(e.target.value),
									},
								}))
							}
							className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-400"
						/>
						<span className="text-sm text-gray-400 w-12">
							{tempSettings.activity.redThreshold}
						</span>
					</div>
					<p className="text-xs text-gray-500">
						Trigger alert when new events exceed this threshold
					</p>
				</div>
			</div>

			{/* Save Button */}
			<div className="mt-4 pt-4 border-t border-gray-700/30">
				<Button
					onClick={handleSaveFilter}
					className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40"
				>
					<Plus className="w-4 h-4 mr-2" />
					{isCreatingFilter
						? "Save New Activity Filter"
						: "Save Activity Filter"}
				</Button>
			</div>
		</div>
	);
}
