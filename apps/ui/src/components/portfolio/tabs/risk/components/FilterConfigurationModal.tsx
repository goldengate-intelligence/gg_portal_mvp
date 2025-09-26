import { Check, X } from "lucide-react";
import type React from "react";
import { Button } from "../../../../ui/button";
import type { FilterSettings, TempSettings } from "../types";
import { ActivityFilter } from "./ActivityFilter";
import { PerformanceFilter } from "./PerformanceFilter";
import { UtilizationFilter } from "./UtilizationFilter";

interface FilterConfigurationModalProps {
	showFilterSettings: boolean;
	setShowFilterSettings: (show: boolean) => void;
	filterSettings: FilterSettings;
	tempSettings: TempSettings;
	setTempSettings: React.Dispatch<React.SetStateAction<TempSettings>>;
	setFilterSettings: React.Dispatch<React.SetStateAction<FilterSettings>>;
	portfolioAssets: Array<{ id: string; companyName: string; uei: string }>;
	featureOptions: Record<string, any>;
	onSaveSettings: () => void;
}

export function FilterConfigurationModal({
	showFilterSettings,
	setShowFilterSettings,
	filterSettings,
	tempSettings,
	setTempSettings,
	setFilterSettings,
	portfolioAssets,
	featureOptions,
	onSaveSettings,
}: FilterConfigurationModalProps) {
	if (!showFilterSettings) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6 pt-20">
			<div
				className="border border-gray-700 rounded-xl p-6 w-full max-w-5xl max-h-[85vh] overflow-y-auto my-auto"
				style={{ backgroundColor: "#111827" }}
			>
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div>
						<h3 className="text-lg font-medium text-gray-200">
							Smart Filter Configuration
						</h3>
						<p className="text-sm text-gray-400 mt-1">
							Configure linear ranges or central band filters for each metric
						</p>
					</div>
					<Button
						onClick={() => setShowFilterSettings(false)}
						className="h-8 w-8 p-0 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-gray-300"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>

				{/* Filter Configuration Sections */}
				<div className="space-y-6">
					<ActivityFilter
						tempSettings={tempSettings}
						setTempSettings={setTempSettings}
						portfolioAssets={portfolioAssets}
						featureOptions={featureOptions}
					/>

					<PerformanceFilter
						tempSettings={tempSettings}
						setTempSettings={setTempSettings}
						portfolioAssets={portfolioAssets}
						featureOptions={featureOptions}
					/>

					<UtilizationFilter
						tempSettings={tempSettings}
						setTempSettings={setTempSettings}
						portfolioAssets={portfolioAssets}
						featureOptions={featureOptions}
					/>
				</div>

				{/* Footer */}
				<div className="flex gap-3 mt-6">
					<Button
						onClick={() => {
							setTempSettings(filterSettings);
							setShowFilterSettings(false);
						}}
						className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/50"
					>
						Cancel
					</Button>
					<Button
						onClick={onSaveSettings}
						className="flex-1 bg-gray-600/20 hover:bg-gray-500/30 text-gray-300 border border-gray-600/40"
					>
						<Check className="w-4 h-4 mr-2" />
						Save Settings
					</Button>
				</div>
			</div>
		</div>
	);
}
