import { X } from "lucide-react";
import React from "react";
import { INDUSTRIES, STATE_NAMES } from "../../data/industries";
import type { SearchFilters } from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface ActiveFiltersProps {
	filters: SearchFilters;
	onRemoveFilter: (filterType: string, value: any) => void;
	onClearAll: () => void;
}

export function ActiveFilters({
	filters,
	onRemoveFilter,
	onClearAll,
}: ActiveFiltersProps) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			notation: "compact",
			maximumFractionDigits: 1,
		}).format(value);
	};

	const formatLabel = (type: string, value: string) => {
		switch (type) {
			case "location":
				return value === "US" ? "United States" : "International";
			case "states":
				return `${value} - ${STATE_NAMES[value]}`;
			case "sectors": {
				const industry = INDUSTRIES[value as keyof typeof INDUSTRIES];
				return industry?.name || value;
			}
			case "lifecycleStage":
				return value
					.split("-")
					.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
					.join(" ");
			case "businessMomentum":
				return value
					.split("-")
					.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
					.join(" ");
			case "ownershipType":
				return value
					.split("-")
					.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
					.join(" ");
			default:
				return value;
		}
	};

	const hasActiveFilters =
		filters.location.length > 0 ||
		filters.states.length > 0 ||
		filters.sectors.length > 0 ||
		filters.lifecycleStage.length > 0 ||
		filters.businessMomentum.length > 0 ||
		filters.ownershipType.length > 0 ||
		(filters.contractValueMin && filters.contractValueMin > 0) ||
		(filters.contractValueMax && filters.contractValueMax < 10000000000) ||
		(filters.minPerformanceScore && filters.minPerformanceScore > 0);

	if (!hasActiveFilters) return null;

	return (
		<div className="mt-3 p-3 bg-gray-800 rounded-lg">
			<div className="flex items-center justify-between mb-2">
				<span className="text-xs text-gray-400 font-aptos">
					Active Filters:
				</span>
				<Button
					variant="ghost"
					size="sm"
					onClick={onClearAll}
					className="text-xs text-gray-400 hover:text-white h-6 px-2"
				>
					Clear All
				</Button>
			</div>

			<div className="flex flex-wrap gap-2">
				{/* Keywords filters - GOLD (1st) */}
				{filters.keywords?.map((keyword) => (
					<Badge
						key={`keyword-${keyword}`}
						variant="outline"
						className="border-[#D2AC38] text-[#D2AC38]"
					>
						{keyword}
						<button
							onClick={() => onRemoveFilter("keywords", keyword)}
							className="ml-2 hover:text-red-400"
						>
							<X className="h-3 w-3" />
						</button>
					</Badge>
				))}

				{/* Location filters - BLUE (2nd) */}
				{filters.location.map((loc) => (
					<Badge
						key={`location-${loc}`}
						variant="outline"
						className="border-blue-500 text-blue-500"
					>
						{formatLabel("location", loc)}
						<button
							onClick={() => onRemoveFilter("location", loc)}
							className="ml-2 hover:text-red-400"
						>
							<X className="h-3 w-3" />
						</button>
					</Badge>
				))}

				{/* State filters - BLUE (2nd) */}
				{filters.states.map((state) => (
					<Badge
						key={`state-${state}`}
						variant="outline"
						className="border-blue-500 text-blue-500"
					>
						{state}
						<button
							onClick={() => onRemoveFilter("states", state)}
							className="ml-2 hover:text-red-400"
						>
							<X className="h-3 w-3" />
						</button>
					</Badge>
				))}

				{/* Sector filters - RED (3rd) */}
				{filters.sectors.map((sector) => (
					<Badge
						key={`sector-${sector}`}
						variant="outline"
						className="border-red-500 text-red-500"
					>
						{formatLabel("sectors", sector)}
						<button
							onClick={() => onRemoveFilter("sectors", sector)}
							className="ml-2 hover:text-red-400"
						>
							<X className="h-3 w-3" />
						</button>
					</Badge>
				))}

				{/* Contract value filter - GREEN (4th) */}
				{((filters.contractValueMin && filters.contractValueMin > 0) ||
					(filters.contractValueMax &&
						filters.contractValueMax < 10000000000)) && (
					<Badge variant="outline" className="border-green-500 text-green-500">
						{formatCurrency(filters.contractValueMin || 0)} -{" "}
						{formatCurrency(filters.contractValueMax || 10000000000)}
						<button
							onClick={() => onRemoveFilter("contractValue", null)}
							className="ml-2 hover:text-red-400"
						>
							<X className="h-3 w-3" />
						</button>
					</Badge>
				)}

				{/* Lifecycle stage filters - PURPLE (5th) */}
				{filters.lifecycleStage.map((stage) => (
					<Badge
						key={`lifecycle-${stage}`}
						variant="outline"
						className="border-purple-500 text-purple-500"
					>
						{formatLabel("lifecycleStage", stage)}
						<button
							onClick={() => onRemoveFilter("lifecycleStage", stage)}
							className="ml-2 hover:text-red-400"
						>
							<X className="h-3 w-3" />
						</button>
					</Badge>
				))}

				{/* Business momentum filters - PEACH (6th) */}
				{filters.businessMomentum.map((momentum) => (
					<Badge
						key={`momentum-${momentum}`}
						variant="outline"
						className="border-orange-400 text-orange-400"
					>
						{formatLabel("businessMomentum", momentum)}
						<button
							onClick={() => onRemoveFilter("businessMomentum", momentum)}
							className="ml-2 hover:text-red-400"
						>
							<X className="h-3 w-3" />
						</button>
					</Badge>
				))}

				{/* Ownership type filters - TURQUOISE (7th) */}
				{filters.ownershipType.map((ownership) => (
					<Badge
						key={`ownership-${ownership}`}
						variant="outline"
						className="border-cyan-500 text-cyan-500"
					>
						{formatLabel("ownershipType", ownership)}
						<button
							onClick={() => onRemoveFilter("ownershipType", ownership)}
							className="ml-2 hover:text-red-400"
						>
							<X className="h-3 w-3" />
						</button>
					</Badge>
				))}

				{/* Performance score filter - Falls back to next color */}
				{filters.minPerformanceScore && filters.minPerformanceScore > 0 && (
					<Badge variant="outline" className="border-teal-500 text-teal-500">
						Performance ≥ {filters.minPerformanceScore}/100
						<button
							onClick={() => onRemoveFilter("minPerformanceScore", null)}
							className="ml-2 hover:text-red-400"
						>
							<X className="h-3 w-3" />
						</button>
					</Badge>
				)}
			</div>
		</div>
	);
}
