import { X } from "lucide-react";
import React from "react";
import { INDUSTRIES, STATE_NAMES, US_STATES } from "../../data/industries";
import type {
	BusinessMomentum,
	IndustrySector,
	LifecycleStage,
	LocationType,
	OwnershipType,
	SearchFilters,
} from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox, CheckboxGroup, Radio, RadioGroup } from "../ui/checkbox";
import { Input } from "../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { ExponentialSlider, RangeSlider } from "../ui/slider";

interface FilterSidebarProps {
	filters: SearchFilters;
	onFiltersChange: (filters: SearchFilters) => void;
	onClose: () => void;
}

export function FilterSidebar({
	filters,
	onFiltersChange,
	onClose,
}: FilterSidebarProps) {
	const handleLocationChange = (values: string[]) => {
		onFiltersChange({
			...filters,
			location: values as LocationType[],
		});
	};

	const handleStateChange = (values: string[]) => {
		onFiltersChange({
			...filters,
			states: values,
		});
	};

	const handleIndustryChange = (values: string[]) => {
		onFiltersChange({
			...filters,
			sectors: values as IndustrySector[],
		});
	};

	const handleContractValueChange = (min: number, max: number) => {
		onFiltersChange({
			...filters,
			contractValueMin: min,
			contractValueMax: max,
		});
	};

	const handleLifecycleChange = (values: string[]) => {
		onFiltersChange({
			...filters,
			lifecycleStage: values as LifecycleStage[],
		});
	};

	const handleMomentumChange = (values: string[]) => {
		onFiltersChange({
			...filters,
			businessMomentum: values as BusinessMomentum[],
		});
	};

	const handleOwnershipChange = (values: string[]) => {
		onFiltersChange({
			...filters,
			ownershipType: values as OwnershipType[],
		});
	};

	const clearFilters = () => {
		onFiltersChange({
			query: "",
			location: [],
			states: [],
			sectors: [],
			contractValueMin: 0,
			contractValueMax: 10000000000,
			lifecycleStage: [],
			businessMomentum: [],
			ownershipType: [],
		});
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			notation: "compact",
			maximumFractionDigits: 1,
		}).format(value);
	};

	return (
		<div className="h-full flex flex-col bg-dark-gray">
			{/* Header */}
			<div className="flex items-center justify-between p-6 border-b border-dark-gray">
				<h2 className="text-lg font-semibold text-yellow-500 font-aptos">
					Filters
				</h2>
				<button
					onClick={onClose}
					className="text-gray-400 hover:text-white transition-colors"
				>
					<X className="h-5 w-5" />
				</button>
			</div>

			{/* Filter Sections */}
			<div className="flex-1 overflow-y-auto p-6 space-y-6">
				{/* Location Filter */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium text-white font-aptos">
						Location
					</h3>
					<CheckboxGroup
						values={filters.location}
						onValuesChange={handleLocationChange}
						options={[
							{ value: "US", label: "United States" },
							{ value: "International", label: "International" },
						]}
					/>

					{/* State Selection - Only show if US is selected */}
					{filters.location.includes("US") && (
						<div className="mt-3 space-y-2">
							<label className="text-xs text-gray-400 font-aptos">
								Select States
							</label>
							<div className="max-h-40 overflow-y-auto border border-dark-gray rounded-md p-2 space-y-1">
								{US_STATES.map((state) => (
									<Checkbox
										key={state}
										checked={filters.states.includes(state)}
										onCheckedChange={(checked) => {
											if (checked) {
												handleStateChange([...filters.states, state]);
											} else {
												handleStateChange(
													filters.states.filter((s) => s !== state),
												);
											}
										}}
										label={`${state} - ${STATE_NAMES[state]}`}
									/>
								))}
							</div>
							{filters.states.length > 0 && (
								<div className="flex flex-wrap gap-1">
									{filters.states.map((state) => (
										<Badge key={state} variant="outline" className="text-xs">
											{state}
											<button
												onClick={() =>
													handleStateChange(
														filters.states.filter((s) => s !== state),
													)
												}
												className="ml-1 hover:text-red-400"
											>
												×
											</button>
										</Badge>
									))}
								</div>
							)}
						</div>
					)}
				</div>

				{/* Industry Sectors */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium text-white font-aptos">
						Industry Sectors
					</h3>
					<div className="space-y-2 max-h-60 overflow-y-auto border border-dark-gray rounded-md p-3">
						{Object.values(INDUSTRIES).map((industry) => (
							<Checkbox
								key={industry.id}
								checked={filters.sectors.includes(industry.id)}
								onCheckedChange={(checked) => {
									if (checked) {
										handleIndustryChange([...filters.sectors, industry.id]);
									} else {
										handleIndustryChange(
											filters.sectors.filter((s) => s !== industry.id),
										);
									}
								}}
								label={industry.name}
								description={industry.description}
							/>
						))}
					</div>
				</div>

				{/* Contract Value Range */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium text-white font-aptos">
						Contract Value Range
					</h3>
					<div className="space-y-4">
						<div className="flex justify-between text-xs text-gray-400">
							<span>{formatCurrency(filters.contractValueMin || 0)}</span>
							<span>
								{formatCurrency(filters.contractValueMax || 10000000000)}
							</span>
						</div>
						<ExponentialSlider
							value={filters.contractValueMin || 0}
							onValueChange={(value) =>
								handleContractValueChange(
									value,
									filters.contractValueMax || 10000000000,
								)
							}
							min={0}
							max={10000000000}
						/>
						<div className="flex gap-2">
							<Button
								size="sm"
								variant="outline"
								onClick={() => handleContractValueChange(0, 1000000)}
								className="text-xs"
							>
								&lt;$1M
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => handleContractValueChange(1000000, 10000000)}
								className="text-xs"
							>
								$1M-$10M
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() => handleContractValueChange(10000000, 100000000)}
								className="text-xs"
							>
								$10M-$100M
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={() =>
									handleContractValueChange(100000000, 10000000000)
								}
								className="text-xs"
							>
								&gt;$100M
							</Button>
						</div>
					</div>
				</div>

				{/* Lifecycle Stage */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium text-white font-aptos">
						Lifecycle Stage
					</h3>
					<CheckboxGroup
						values={filters.lifecycleStage}
						onValuesChange={handleLifecycleChange}
						options={[
							{ value: "pre-award", label: "Pre-Award" },
							{ value: "active", label: "Active" },
							{ value: "option-period", label: "Option Period" },
							{ value: "expiring", label: "Expiring Soon" },
							{ value: "expired", label: "Expired" },
							{ value: "completed", label: "Completed" },
						]}
					/>
				</div>

				{/* Business Momentum */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium text-white font-aptos">
						Business Momentum
					</h3>
					<CheckboxGroup
						values={filters.businessMomentum}
						onValuesChange={handleMomentumChange}
						options={[
							{
								value: "high-growth",
								label: "High Growth",
								description: "Rapid expansion",
							},
							{
								value: "steady-growth",
								label: "Steady Growth",
								description: "Consistent growth",
							},
							{
								value: "stable",
								label: "Stable",
								description: "Maintaining position",
							},
							{
								value: "declining",
								label: "Declining",
								description: "Losing momentum",
							},
							{
								value: "volatile",
								label: "Volatile",
								description: "Unpredictable",
							},
						]}
					/>
				</div>

				{/* Ownership Type */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium text-white font-aptos">
						Ownership Type
					</h3>
					<CheckboxGroup
						values={filters.ownershipType}
						onValuesChange={handleOwnershipChange}
						options={[
							{ value: "public", label: "Public" },
							{ value: "private", label: "Private" },
							{ value: "government", label: "Government" },
							{ value: "non-profit", label: "Non-Profit" },
							{ value: "foreign-owned", label: "Foreign-Owned" },
						]}
					/>
				</div>

				{/* Additional Filters */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium text-white font-aptos">
						Performance Score
					</h3>
					<div className="space-y-2">
						<RangeSlider
							value={[filters.minPerformanceScore || 0, 100]}
							onValueChange={([min]) => {
								onFiltersChange({
									...filters,
									minPerformanceScore: min,
								});
							}}
							min={0}
							max={100}
							step={5}
							showValue={true}
							formatValue={(v) => `${v}/100`}
						/>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="border-t border-dark-gray p-6 space-y-3">
				<Button
					onClick={() => {
						console.log("Applying filters:", filters);
						onClose();
					}}
					className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-aptos"
				>
					Apply Filters
				</Button>
				<Button
					onClick={clearFilters}
					variant="outline"
					className="w-full border-dark-gray text-gray-300 hover:text-white font-aptos"
				>
					Clear All Filters
				</Button>
			</div>
		</div>
	);
}
