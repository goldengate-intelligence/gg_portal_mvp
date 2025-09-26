import {
	Activity,
	BarChart3,
	ChevronLeft,
	ChevronRight,
	Cpu,
	Crosshair,
	Database,
	Download,
	FileDown,
	Filter,
	FolderOpen,
	Globe,
	MonitorSpeaker,
	Radar,
	Save,
	Search,
	Shield,
	Target,
	Terminal,
	TrendingUp,
	Zap,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { ActiveFilters } from "../../components/platform/ActiveFilters";
import { FilterSidebar } from "../../components/platform/FilterSidebar";
import { HudContractorModal } from "../../components/platform/HudContractorModal";
import { Button } from "../../components/ui/button";
import {
	HudCard,
	HudCardContent,
	HudCardHeader,
} from "../../components/ui/hud-card";
import { HudContractorCard } from "../../components/ui/hud-contractor-card";
import { SearchInput } from "../../components/ui/input";
import { Sheet } from "../../components/ui/modal";
import {
	ContractorCardSkeleton,
	EmptyState,
	LoadingState,
} from "../../components/ui/skeleton";
import { ContractorTable } from "../../components/ui/table";
import { useContractorFavorites } from "../../hooks/useContractorLists";
import { useContractorProfiles } from "../../hooks/useContractorProfiles";
import type { ContractorProfileFilters } from "../../hooks/useContractorProfiles";
import { cn } from "../../logic/utils";
import type { Contractor, SearchFilters, ViewMode } from "../../types";
import {
	formatCurrency,
	transformContractorProfileArray,
} from "../../utils/contractor-profile-transform";
import { exportContractors } from "../../utils/export";

export function IdentifyTargets() {
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<ViewMode>("cards");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [openFilter, setOpenFilter] = useState<string | null>(null);
	const [selectedContractor, setSelectedContractor] =
		useState<Contractor | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(24);

	// Initialize filters - no defaults since we're using aggregated profiles
	const [filters, setFilters] = useState<SearchFilters>({
		query: "",
		location: [],
		states: [],
		sectors: [],
		contractValueMin: undefined,
		contractValueMax: undefined,
		lifecycleStage: [],
		businessMomentum: [],
		ownershipType: [],
	});

	// Convert UI filters to API filters format
	const apiFilters: ContractorProfileFilters = useMemo(
		() => ({
			search: filters.query,
			states: filters.states,
			agencies: [], // Could be mapped from other filters if needed
			industries: filters.sectors,
			lifecycleStages: filters.lifecycleStage,
			sizeTiers: [], // Could be mapped from ownershipType
			minObligated: filters.contractValueMin,
			maxObligated: filters.contractValueMax,
		}),
		[filters],
	);

	// Fetch contractor profiles using the custom hook
	const {
		data: contractorProfiles,
		pagination,
		aggregations,
		isLoading,
		error,
		refetch,
	} = useContractorProfiles({
		page: currentPage,
		limit: pageSize,
		sortBy: "totalObligated",
		sortOrder: "desc",
		filters: apiFilters,
		enabled: true,
	});

	// Use favorites hook
	const { favorites, isFavorite, toggleFavorite } = useContractorFavorites();

	// Transform API profile data to UI format
	const filteredContractors = useMemo(() => {
		return transformContractorProfileArray(contractorProfiles);
	}, [contractorProfiles]);

	// Handle toggling favorite
	const handleToggleFavorite = async (contractorId: string) => {
		try {
			await toggleFavorite(contractorId);
		} catch (error) {
			console.error("Failed to toggle favorite:", error);
		}
	};

	// Debounced search with page reset
	useEffect(() => {
		const timer = setTimeout(() => {
			setFilters((prev) => ({ ...prev, query: searchQuery }));
			setCurrentPage(1); // Reset to first page on search
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Reset page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [apiFilters]);

	// Count active filters
	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (filters.location.length > 0) count += filters.location.length;
		if (filters.states.length > 0) count += filters.states.length;
		if (filters.sectors.length > 0) count += filters.sectors.length;
		if (filters.lifecycleStage.length > 0)
			count += filters.lifecycleStage.length;
		if (filters.businessMomentum.length > 0)
			count += filters.businessMomentum.length;
		if (filters.ownershipType.length > 0) count += filters.ownershipType.length;
		// Count contract value filter if any value is set
		if (
			filters.contractValueMin !== undefined ||
			filters.contractValueMax !== undefined
		)
			count++;
		return count;
	}, [filters]);

	const handleExport = () => {
		exportContractors(filteredContractors, "csv");
	};

	const handleSaveSearch = () => {
		// TODO: Implement save search functionality
		console.log("Saving search with filters:", filters);
	};

	const clearAllFilters = () => {
		setFilters({
			query: "",
			location: [],
			states: [],
			sectors: [],
			contractValueMin: undefined,
			contractValueMax: undefined,
			lifecycleStage: [],
			businessMomentum: [],
			ownershipType: [],
		});
		setSearchQuery("");
		setCurrentPage(1);
	};

	const renderFilterContent = (filterId: string) => {
		switch (filterId) {
			case "keywords":
				return (
					<div className="p-4 bg-gray-900/80">
						<div className="flex items-center justify-between mb-3">
							<span className="text-sm font-orbitron text-gray-300 uppercase">
								Keywords Filter
							</span>
							<button
								onClick={() =>
									setFilters((prev) => ({ ...prev, keywords: [] }))
								}
								className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-all font-sans uppercase"
							>
								Reset
							</button>
						</div>
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<SearchInput
									placeholder="Enter keywords..."
									className="flex-1 bg-black/50 border-cyan-500/30 text-white placeholder-gray-400 font-sans"
									onKeyPress={(e) => {
										if (e.key === "Enter" && e.target.value.trim()) {
											const keyword = e.target.value.trim();
											if (!filters.keywords?.includes(keyword)) {
												setFilters((prev) => ({
													...prev,
													keywords: [...(prev.keywords || []), keyword],
												}));
											}
											e.target.value = "";
										}
									}}
								/>
								<Button
									onClick={(e) => {
										const input = e.target.parentElement.querySelector("input");
										const keyword = input.value.trim();
										if (keyword && !filters.keywords?.includes(keyword)) {
											setFilters((prev) => ({
												...prev,
												keywords: [...(prev.keywords || []), keyword],
											}));
											input.value = "";
										}
									}}
									size="sm"
									className="bg-[#D2AC38]/20 hover:bg-[#D2AC38]/30 text-[#D2AC38] border border-[#D2AC38]/30 font-sans"
								>
									Add
								</Button>
							</div>

							{filters.keywords && filters.keywords.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{filters.keywords.map((keyword, index) => (
										<span
											key={index}
											onClick={() =>
												setFilters((prev) => ({
													...prev,
													keywords:
														prev.keywords?.filter((k) => k !== keyword) || [],
												}))
											}
											className="inline-flex items-center gap-1 px-2 py-1 bg-[#D2AC38]/20 text-[#D2AC38] rounded cursor-pointer hover:bg-[#D2AC38]/30 transition-all font-sans text-xs"
										>
											{keyword}
											<span className="text-xs">×</span>
										</span>
									))}
								</div>
							)}
						</div>
					</div>
				);

			case "location":
				return (
					<div className="p-4 bg-gray-900/80">
						<div className="flex items-center justify-between mb-3">
							<span className="text-sm font-orbitron text-gray-300 uppercase">
								Location Filter
							</span>
							<button
								onClick={() => setFilters((prev) => ({ ...prev, states: [] }))}
								className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-all font-sans uppercase"
							>
								Reset
							</button>
						</div>
						<div className="p-3 rounded-lg bg-black/50">
							<div className="flex items-center justify-between mb-3">
								<label className="text-xs font-medium text-gray-300 font-orbitron uppercase">
									Select States
								</label>
								<div className="flex gap-2">
									<button
										onClick={() => {
											const allStates = [
												"AL",
												"AK",
												"AZ",
												"AR",
												"CA",
												"CO",
												"CT",
												"DE",
												"FL",
												"GA",
												"HI",
												"ID",
												"IL",
												"IN",
												"IA",
												"KS",
												"KY",
												"LA",
												"ME",
												"MD",
												"MA",
												"MI",
												"MN",
												"MS",
												"MO",
												"MT",
												"NE",
												"NV",
												"NH",
												"NJ",
												"NM",
												"NY",
												"NC",
												"ND",
												"OH",
												"OK",
												"OR",
												"PA",
												"RI",
												"SC",
												"SD",
												"TN",
												"TX",
												"UT",
												"VT",
												"VA",
												"WA",
												"WV",
												"WI",
												"WY",
												"DC",
											];
											setFilters((prev) => ({ ...prev, states: allStates }));
										}}
										className="text-xs px-2 py-1 rounded border border-[#D2AC38]/30 text-[#D2AC38] hover:bg-[#D2AC38]/10 transition-all font-sans"
									>
										All
									</button>
									<button
										onClick={() =>
											setFilters((prev) => ({ ...prev, states: [] }))
										}
										className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-400 hover:text-gray-300 transition-all font-sans"
									>
										None
									</button>
								</div>
							</div>
							<div className="max-h-24 overflow-y-auto">
								<div className="grid grid-cols-3 gap-1">
									{[
										{ abbr: "AL", name: "Alabama" },
										{ abbr: "AK", name: "Alaska" },
										{ abbr: "AZ", name: "Arizona" },
										{ abbr: "AR", name: "Arkansas" },
										{ abbr: "CA", name: "California" },
										{ abbr: "CO", name: "Colorado" },
										{ abbr: "CT", name: "Connecticut" },
										{ abbr: "DE", name: "Delaware" },
										{ abbr: "FL", name: "Florida" },
										{ abbr: "GA", name: "Georgia" },
										{ abbr: "HI", name: "Hawaii" },
										{ abbr: "ID", name: "Idaho" },
										{ abbr: "IL", name: "Illinois" },
										{ abbr: "IN", name: "Indiana" },
										{ abbr: "IA", name: "Iowa" },
										{ abbr: "KS", name: "Kansas" },
										{ abbr: "KY", name: "Kentucky" },
										{ abbr: "LA", name: "Louisiana" },
										{ abbr: "ME", name: "Maine" },
										{ abbr: "MD", name: "Maryland" },
										{ abbr: "MA", name: "Massachusetts" },
										{ abbr: "MI", name: "Michigan" },
										{ abbr: "MN", name: "Minnesota" },
										{ abbr: "MS", name: "Mississippi" },
										{ abbr: "MO", name: "Missouri" },
										{ abbr: "MT", name: "Montana" },
										{ abbr: "NE", name: "Nebraska" },
										{ abbr: "NV", name: "Nevada" },
										{ abbr: "NH", name: "New Hampshire" },
										{ abbr: "NJ", name: "New Jersey" },
										{ abbr: "NM", name: "New Mexico" },
										{ abbr: "NY", name: "New York" },
										{ abbr: "NC", name: "North Carolina" },
										{ abbr: "ND", name: "North Dakota" },
										{ abbr: "OH", name: "Ohio" },
										{ abbr: "OK", name: "Oklahoma" },
										{ abbr: "OR", name: "Oregon" },
										{ abbr: "PA", name: "Pennsylvania" },
										{ abbr: "RI", name: "Rhode Island" },
										{ abbr: "SC", name: "South Carolina" },
										{ abbr: "SD", name: "South Dakota" },
										{ abbr: "TN", name: "Tennessee" },
										{ abbr: "TX", name: "Texas" },
										{ abbr: "UT", name: "Utah" },
										{ abbr: "VT", name: "Vermont" },
										{ abbr: "VA", name: "Virginia" },
										{ abbr: "WA", name: "Washington" },
										{ abbr: "WV", name: "West Virginia" },
										{ abbr: "WI", name: "Wisconsin" },
										{ abbr: "WY", name: "Wyoming" },
										{ abbr: "DC", name: "District of Columbia" },
									].map((state) => (
										<label
											key={state.abbr}
											className="flex items-center gap-1 cursor-pointer group"
										>
											<div className="relative">
												<input
													type="checkbox"
													checked={
														filters.states?.includes(state.abbr) || false
													}
													onChange={() => {
														setFilters((prev) => ({
															...prev,
															states: prev.states?.includes(state.abbr)
																? prev.states.filter((s) => s !== state.abbr)
																: [...(prev.states || []), state.abbr],
														}));
													}}
													className="sr-only"
												/>
												<div
													className={cn(
														"w-4 h-4 rounded border-2 transition-all",
														filters.states?.includes(state.abbr)
															? "bg-[#D2AC38] border-[#D2AC38]"
															: "border-gray-600 group-hover:border-[#D2AC38]",
													)}
												>
													{filters.states?.includes(state.abbr) && (
														<svg
															className="w-2.5 h-2.5 text-black absolute top-0.5 left-0.5"
															fill="currentColor"
														>
															<path d="M8 .5l-4.5 4.5-2-2-1.5 1.5 3.5 3.5 6-6z" />
														</svg>
													)}
												</div>
											</div>
											<span className="text-xs text-gray-300 group-hover:text-white transition-colors font-sans">
												{state.abbr}
											</span>
										</label>
									))}
								</div>
							</div>
						</div>
					</div>
				);

			case "sector":
				return (
					<div className="p-4 bg-gray-900/80">
						<div className="flex items-center justify-between mb-3">
							<span className="text-sm font-orbitron text-gray-300 uppercase">
								Sector Filter
							</span>
							<button
								onClick={() => setFilters((prev) => ({ ...prev, sectors: [] }))}
								className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-all font-sans uppercase"
							>
								Reset
							</button>
						</div>
						<div className="max-h-48 overflow-y-auto space-y-2 pr-2">
							{[
								"Agriculture, Forestry, Fishing and Hunting",
								"Mining, Quarrying, and Oil and Gas Extraction",
								"Utilities",
								"Construction",
								"Manufacturing",
								"Wholesale Trade",
								"Retail Trade",
								"Transportation and Warehousing",
								"Information",
								"Finance and Insurance",
								"Real Estate and Rental and Leasing",
								"Professional, Scientific, and Technical Services",
								"Management of Companies and Enterprises",
								"Administrative and Support and Waste Management and Remediation Services",
								"Educational Services",
								"Health Care and Social Assistance",
								"Arts, Entertainment, and Recreation",
								"Accommodation and Food Services",
								"Other Services (except Public Administration)",
								"Public Administration",
							].map((sector) => (
								<label
									key={sector}
									className="flex items-center gap-2 cursor-pointer group"
								>
									<div className="relative">
										<input
											type="checkbox"
											checked={filters.sectors?.includes(sector) || false}
											onChange={() => {
												setFilters((prev) => ({
													...prev,
													sectors: prev.sectors?.includes(sector)
														? prev.sectors.filter((s) => s !== sector)
														: [...(prev.sectors || []), sector],
												}));
											}}
											className="sr-only"
										/>
										<div
											className={cn(
												"w-4 h-4 rounded border-2 transition-all",
												filters.sectors?.includes(sector)
													? "bg-[#D2AC38] border-[#D2AC38]"
													: "border-gray-600 group-hover:border-[#D2AC38]",
											)}
										>
											{filters.sectors?.includes(sector) && (
												<svg
													className="w-2.5 h-2.5 text-black absolute top-0.5 left-0.5"
													fill="currentColor"
												>
													<path d="M8 .5l-4.5 4.5-2-2-1.5 1.5 3.5 3.5 6-6z" />
												</svg>
											)}
										</div>
									</div>
									<span className="text-sm text-gray-300 group-hover:text-white transition-colors font-sans">
										{sector}
									</span>
								</label>
							))}
						</div>
					</div>
				);

			case "awards": {
				// Exponential scaling function: converts 0-100 slider position to contract values
				const sliderToValue = (sliderPos: number): number => {
					if (sliderPos === 0) return 0;
					// Exponential curve: small values at start, large values at end
					// 0-20: $0K-$1M (granular for small contracts, in K increments)
					// 21-40: $1M-$10M (moderate granularity)
					// 41-60: $10M-$100M (medium steps)
					// 61-80: $100M-$1B (larger steps)
					// 81-100: $1B-$100B+ (broad strokes)

					if (sliderPos <= 20) {
						// $0K to $1M: linear scaling in thousands for granularity
						const thousands = Math.round((sliderPos / 20) * 1000); // 0 to 1000K
						return thousands / 1000; // Convert back to millions (0 to 1M)
					}
					if (sliderPos <= 40) {
						// $1M to $10M: exponential start
						const normalized = (sliderPos - 20) / 20; // 0-1
						return Math.round(1 + normalized ** 1.5 * 9); // 1M to 10M
					}
					if (sliderPos <= 60) {
						// $10M to $100M: moderate exponential
						const normalized = (sliderPos - 40) / 20; // 0-1
						return Math.round(10 + normalized ** 1.8 * 90); // 10M to 100M
					}
					if (sliderPos <= 80) {
						// $100M to $1B: steeper exponential
						const normalized = (sliderPos - 60) / 20; // 0-1
						return Math.round(100 + normalized ** 2 * 900); // 100M to 1B
					}
					// $1B to $100B+: very steep exponential
					const normalized = (sliderPos - 80) / 20; // 0-1
					return Math.round(1000 + normalized ** 2.5 * 99000); // 1B to 100B
				};

				// Inverse function: converts contract value back to slider position
				const valueToSlider = (value: number): number => {
					if (value === 0) return 0;
					if (value <= 1) {
						// Convert to thousands and map to slider position
						const thousands = value * 1000;
						return Math.round((thousands / 1000) * 20); // 0-20
					}
					if (value <= 10) {
						const normalized = ((value - 1) / 9) ** (1 / 1.5); // inverse of 1.5 power
						return Math.round(20 + normalized * 20); // 20-40
					}
					if (value <= 100) {
						const normalized = ((value - 10) / 90) ** (1 / 1.8); // inverse of 1.8 power
						return Math.round(40 + normalized * 20); // 40-60
					}
					if (value <= 1000) {
						const normalized = Math.sqrt((value - 100) / 900); // inverse of 2 power
						return Math.round(60 + normalized * 20); // 60-80
					}
					const normalized = ((value - 1000) / 99000) ** (1 / 2.5); // inverse of 2.5 power
					return Math.round(80 + normalized * 20); // 80-100
				};

				// Format display value
				const formatValue = (value: number): string => {
					if (value === 0) return "$0";
					if (value < 1) {
						const kValue = Math.round(value * 1000);
						return `$${kValue}K`;
					}
					if (value < 1000) return `$${Math.round(value)}M`;
					if (value < 100000) return `$${(value / 1000).toFixed(1)}B`;
					return "$100B+";
				};

				const minValue = sliderToValue(filters.contractValueMinSlider || 0);
				const maxValue = sliderToValue(filters.contractValueMaxSlider || 100);

				return (
					<div className="p-4 bg-gray-900/80">
						<div className="flex items-center justify-between mb-3">
							<span className="text-sm font-orbitron text-gray-300 uppercase">
								Awards Filter
							</span>
							<button
								onClick={() =>
									setFilters((prev) => ({
										...prev,
										contractValueMinSlider: 0,
										contractValueMaxSlider: 100,
										awardType: "Active",
									}))
								}
								className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-all font-sans uppercase"
							>
								Reset
							</button>
						</div>
						<div className="space-y-4">
							{/* Award Type Toggle */}
							<div className="flex items-center justify-center mb-4">
								<div className="flex items-center rounded-lg overflow-hidden bg-black/50">
									<button
										onClick={() =>
											setFilters((prev) => ({ ...prev, awardType: "Active" }))
										}
										className={cn(
											"px-4 py-2 text-sm font-orbitron transition-all",
											filters.awardType === "Active"
												? "text-black font-medium bg-[#D2AC38]"
												: "text-gray-400 hover:text-white",
										)}
									>
										Active
									</button>
									<button
										onClick={() =>
											setFilters((prev) => ({ ...prev, awardType: "Lifetime" }))
										}
										className={cn(
											"px-4 py-2 text-sm font-orbitron transition-all",
											filters.awardType === "Lifetime"
												? "text-black font-medium bg-[#D2AC38]"
												: "text-gray-400 hover:text-white",
										)}
									>
										Lifetime
									</button>
								</div>
							</div>

							<div className="space-y-3">
								<div className="text-sm text-white font-orbitron text-center">
									{formatValue(minValue)} - {formatValue(maxValue)}
								</div>
								<div
									className="relative px-2 py-2"
									style={{ border: "none", outline: "none", boxShadow: "none" }}
								>
									{/* Single Visual Rail */}
									<div className="relative h-2">
										{/* Background track */}
										<div className="h-2 rounded-full bg-gray-700 absolute w-full top-0" />

										{/* Active range highlight */}
										<div
											className="h-2 rounded-full absolute top-0 bg-[#D2AC38]"
											style={{
												left: `${filters.contractValueMinSlider || 0}%`,
												width: `${(filters.contractValueMaxSlider || 100) - (filters.contractValueMinSlider || 0)}%`,
											}}
										/>

										{/* Max Range Slider - Higher z-index, rendered first */}
										<input
											type="range"
											min="0"
											max="100"
											value={filters.contractValueMaxSlider || 100}
											onChange={(e) => {
												const sliderValue = Number.parseInt(e.target.value);
												setFilters((prev) => ({
													...prev,
													contractValueMaxSlider:
														sliderValue <= (prev.contractValueMinSlider || 0)
															? (prev.contractValueMinSlider || 0) + 1
															: sliderValue,
													contractValueMax: sliderToValue(
														sliderValue <= (prev.contractValueMinSlider || 0)
															? (prev.contractValueMinSlider || 0) + 1
															: sliderValue,
													),
												}));
											}}
											className="absolute w-full bg-transparent appearance-none cursor-pointer range-slider-max"
											style={{
												background: "transparent",
												outline: "none",
												border: "none",
												boxShadow: "none",
												zIndex: 2,
												height: "8px",
												top: "0px",
											}}
										/>

										{/* Min Range Slider - Lower z-index, rendered second */}
										<input
											type="range"
											min="0"
											max="100"
											value={filters.contractValueMinSlider || 0}
											onChange={(e) => {
												const sliderValue = Number.parseInt(e.target.value);
												setFilters((prev) => ({
													...prev,
													contractValueMinSlider:
														sliderValue >= (prev.contractValueMaxSlider || 100)
															? (prev.contractValueMaxSlider || 100) - 1
															: sliderValue,
													contractValueMin: sliderToValue(
														sliderValue >= (prev.contractValueMaxSlider || 100)
															? (prev.contractValueMaxSlider || 100) - 1
															: sliderValue,
													),
												}));
											}}
											className="absolute w-full bg-transparent appearance-none cursor-pointer range-slider-min"
											style={{
												background: "transparent",
												outline: "none",
												border: "none",
												boxShadow: "none",
												zIndex: 1,
												height: "8px",
												top: "0px",
											}}
										/>
									</div>
								</div>
								<div className="flex justify-between text-xs text-gray-500 font-sans px-2">
									<span>$0</span>
									<span>$100B+</span>
								</div>
							</div>
						</div>
					</div>
				);
			}

			case "activity": {
				const activityOptions = [
					{
						name: "Hot",
						tooltip: "New award within ≤30d",
						color: "bg-red-500 border-red-500",
					},
					{
						name: "Warm",
						tooltip: "New award within ≤365d",
						color: "bg-rose-400 border-rose-400",
					},
					{
						name: "Cold",
						tooltip: ">365d since last award",
						color: "bg-blue-500 border-blue-500",
					},
				];

				return (
					<div className="p-4 bg-gray-900/80">
						<div className="flex items-center justify-between mb-3">
							<span className="text-sm font-orbitron text-gray-300 uppercase">
								Activity Filter
							</span>
							<button
								onClick={() =>
									setFilters((prev) => ({ ...prev, lifecycleStage: [] }))
								}
								className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-all font-sans uppercase"
							>
								Reset
							</button>
						</div>
						<div className="space-y-2">
							{activityOptions.map((activity, index) => (
								<label
									key={activity.name}
									className="flex items-center cursor-pointer group relative"
								>
									<div className="relative">
										<input
											type="checkbox"
											checked={
												filters.lifecycleStage?.includes(activity.name) || false
											}
											onChange={() => {
												setFilters((prev) => ({
													...prev,
													lifecycleStage: prev.lifecycleStage?.includes(
														activity.name,
													)
														? prev.lifecycleStage.filter(
																(s) => s !== activity.name,
															)
														: [...(prev.lifecycleStage || []), activity.name],
												}));
											}}
											className="sr-only"
										/>
										<div
											className={cn(
												"w-4 h-4 rounded border-2 transition-all",
												filters.lifecycleStage?.includes(activity.name)
													? activity.color
													: "border-gray-600 group-hover:border-[#D2AC38]",
											)}
										>
											{filters.lifecycleStage?.includes(activity.name) && (
												<svg
													className="w-2.5 h-2.5 text-black absolute top-0.5 left-0.5"
													fill="currentColor"
												>
													<path d="M8 .5l-4.5 4.5-2-2-1.5 1.5 3.5 3.5 6-6z" />
												</svg>
											)}
										</div>
									</div>
									<div className="flex items-center ml-2">
										<span className="text-sm text-gray-300 group-hover:text-white transition-colors font-sans">
											{activity.name}
										</span>
										<div className="relative ml-1 group/tooltip">
											<svg
												className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
													clipRule="evenodd"
												/>
											</svg>
											<div
												className={cn(
													"absolute left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50",
													index === activityOptions.length - 1
														? "bottom-full mb-2"
														: "top-full mt-2",
												)}
											>
												{activity.tooltip}
											</div>
										</div>
									</div>
								</label>
							))}
						</div>
					</div>
				);
			}

			case "performance":
				return (
					<div className="p-4 bg-gray-900/80">
						<div className="flex items-center justify-between mb-3">
							<span className="text-sm font-orbitron text-gray-300 uppercase">
								Performance Filter
							</span>
							<button
								onClick={() =>
									setFilters((prev) => ({ ...prev, businessMomentum: [] }))
								}
								className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-all font-sans uppercase"
							>
								Reset
							</button>
						</div>
						<div className="space-y-2">
							{["Elite", "Strong", "Stable", "Emerging"].map((momentum) => (
								<label
									key={momentum}
									className="flex items-center gap-2 cursor-pointer group"
								>
									<div className="relative">
										<input
											type="checkbox"
											checked={
												filters.businessMomentum?.includes(momentum) || false
											}
											onChange={() => {
												setFilters((prev) => ({
													...prev,
													businessMomentum: prev.businessMomentum?.includes(
														momentum,
													)
														? prev.businessMomentum.filter(
																(m) => m !== momentum,
															)
														: [...(prev.businessMomentum || []), momentum],
												}));
											}}
											className="sr-only"
										/>
										<div
											className={cn(
												"w-4 h-4 rounded border-2 transition-all",
												filters.businessMomentum?.includes(momentum)
													? momentum === "Elite"
														? "bg-green-500 border-green-500"
														: momentum === "Strong"
															? "bg-blue-500 border-blue-500"
															: momentum === "Stable"
																? "bg-[#D2AC38] border-[#D2AC38]"
																: "bg-red-500 border-red-500"
													: "border-gray-600 group-hover:border-[#D2AC38]",
											)}
										>
											{filters.businessMomentum?.includes(momentum) && (
												<svg
													className="w-2.5 h-2.5 text-black absolute top-0.5 left-0.5"
													fill="currentColor"
												>
													<path d="M8 .5l-4.5 4.5-2-2-1.5 1.5 3.5 3.5 6-6z" />
												</svg>
											)}
										</div>
									</div>
									<span className="text-sm text-gray-300 group-hover:text-white transition-colors font-sans">
										{momentum}
									</span>
								</label>
							))}
						</div>
					</div>
				);

			case "prime":
				return (
					<div className="p-4 bg-gray-900/80">
						<div className="flex items-center justify-between mb-3">
							<span className="text-sm font-orbitron text-gray-300 uppercase">
								Prime Status Filter
							</span>
							<button
								onClick={() =>
									setFilters((prev) => ({ ...prev, ownershipType: [] }))
								}
								className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-all font-sans uppercase"
							>
								Reset
							</button>
						</div>
						<div className="space-y-2">
							{["Prime Awardee", "Indirect Sub"].map((ownership) => (
								<label
									key={ownership}
									className="flex items-center gap-2 cursor-pointer group"
								>
									<div className="relative">
										<input
											type="checkbox"
											checked={
												filters.ownershipType?.includes(ownership) || false
											}
											onChange={() => {
												setFilters((prev) => ({
													...prev,
													ownershipType: prev.ownershipType?.includes(ownership)
														? prev.ownershipType.filter((o) => o !== ownership)
														: [...(prev.ownershipType || []), ownership],
												}));
											}}
											className="sr-only"
										/>
										<div
											className={cn(
												"w-4 h-4 rounded border-2 transition-all",
												filters.ownershipType?.includes(ownership)
													? "bg-[#D2AC38] border-[#D2AC38]"
													: "border-gray-600 group-hover:border-[#D2AC38]",
											)}
										>
											{filters.ownershipType?.includes(ownership) && (
												<svg
													className="w-2.5 h-2.5 text-black absolute top-0.5 left-0.5"
													fill="currentColor"
												>
													<path d="M8 .5l-4.5 4.5-2-2-1.5 1.5 3.5 3.5 6-6z" />
												</svg>
											)}
										</div>
									</div>
									<span className="text-sm text-gray-300 group-hover:text-white transition-colors font-sans">
										{ownership}
									</span>
								</label>
							))}
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="w-full bg-gradient-to-br from-black/95 via-gray-900/90 to-black/95 backdrop-blur-sm border border-cyan-500/30 rounded-lg overflow-hidden relative">
			{/* Ambient glow effects */}
			<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-orange-500/5 pointer-events-none" />
			<div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

			{/* Command Header */}
			<div className="relative p-6 border-b border-cyan-500/20 bg-gradient-to-r from-black/80 via-gray-900/40 to-black/80">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						{/* Enhanced Icon Stack */}
						<div className="relative">
							<div className="p-3 bg-gradient-to-br from-[#D2AC38]/20 to-orange-600/20 border border-[#D2AC38]/40 rounded-xl backdrop-blur-sm shadow-lg">
								<div className="relative">
									<Target className="w-6 h-6 text-[#D2AC38] animate-pulse" />
									<div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400/80 rounded-full animate-ping" />
									<div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full" />
								</div>
							</div>
							{/* Scanning lines effect */}
							<div className="absolute inset-0 rounded-xl overflow-hidden">
								<div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent animate-pulse" />
								<div
									className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D2AC38]/60 to-transparent animate-pulse"
									style={{ animationDelay: "0.5s" }}
								/>
							</div>
						</div>

						<div>
							<div className="flex items-center gap-3 mb-1">
								<h1
									className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D2AC38] via-orange-400 to-[#D2AC38] uppercase tracking-wider"
									style={{ fontFamily: "Orbitron, monospace" }}
								>
									Entity Identification System
								</h1>
								<div className="flex items-center gap-1">
									<Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
									<span className="text-xs text-cyan-400 font-sans font-bold uppercase tracking-wide">
										v2.1.7
									</span>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<p className="text-sm text-white font-sans tracking-wide">
									<span className="text-cyan-400">SCANNING</span> GOLDENGATE
									DATABASE •
									<span className="text-[#D2AC38] font-bold">
										{" "}
										{pagination?.total?.toLocaleString() || "0"} ENTITIES
									</span>{" "}
									IDENTIFIED
								</p>
								{aggregations && (
									<div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-lg">
										<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
										<span className="text-xs text-green-400 font-sans font-bold uppercase">
											{formatCurrency(aggregations.totalObligated)} TRACKED
										</span>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Enhanced Status Panel */}
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-3 px-4 py-2 bg-black/50 border border-cyan-500/30 rounded-lg backdrop-blur-sm">
							<div className="flex items-center gap-2">
								<Radar
									className="w-4 h-4 text-cyan-400 animate-spin"
									style={{ animationDuration: "3s" }}
								/>
								<span className="text-xs text-cyan-400 font-sans uppercase tracking-wide">
									SCANNING
								</span>
							</div>
							<div className="w-px h-4 bg-cyan-500/30" />
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
								<span className="text-xs text-green-400 font-sans uppercase font-bold">
									ONLINE
								</span>
							</div>
						</div>

						{/* Data flow indicator */}
						<div className="flex flex-col gap-1">
							<div className="flex gap-1">
								{[0, 1, 2].map((i) => (
									<div
										key={i}
										className="w-1 h-3 bg-cyan-400/60 rounded-full animate-pulse"
										style={{ animationDelay: `${i * 0.2}s` }}
									/>
								))}
							</div>
							<span className="text-xs text-cyan-400/80 font-sans">LIVE</span>
						</div>
					</div>
				</div>

				{/* Progress/activity bar */}
				<div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
					<div
						className="h-full bg-gradient-to-r from-cyan-400 via-[#D2AC38] to-orange-500 rounded-full animate-pulse"
						style={{ width: "100%" }}
					/>
				</div>
			</div>

			<div className="p-0">
				<div className="px-6 py-4 border-b border-cyan-500/20">
					{/* Controls Row */}
					<div className="flex items-center justify-between mb-4" />

					{/* Enhanced Search Interface */}
					<div className="mt-6 pt-6 border-t border-gradient-to-r from-transparent via-cyan-500/20 to-transparent relative">
						{/* Search section title */}
						<div className="flex items-center gap-3 mb-4">
							<div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg">
								<Search className="w-4 h-4 text-cyan-400" />
								<span className="text-sm font-sans text-cyan-400 uppercase font-bold tracking-wide">
									TARGET ACQUISITION
								</span>
							</div>
							<div className="flex-1 h-px bg-gradient-to-r from-cyan-500/30 via-transparent to-transparent" />
						</div>

						<div className="flex gap-4 mb-6">
							<div className="flex-1 relative group">
								<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-cyan-500/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								<div className="relative">
									<SearchInput
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Enter target designation, UEI, codename, or entity identifier..."
										className="w-full bg-gradient-to-r from-black/80 to-gray-900/80 border-cyan-500/40 text-cyan-100 placeholder-gray-400 font-sans text-sm pl-12 pr-20 py-4 rounded-lg backdrop-blur-sm shadow-lg hover:border-cyan-400/60 focus:border-cyan-400 transition-all duration-300"
									/>
									<div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
										<Search className="w-4 h-4 text-cyan-400" />
										<div className="w-px h-4 bg-cyan-500/40" />
									</div>
									<div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
										<div className="flex items-center gap-1">
											<Cpu className="w-3 h-3 text-gray-500" />
											<span className="text-xs text-gray-500 font-sans uppercase">
												AI ASSIST
											</span>
										</div>
										<div className="w-px h-4 bg-gray-600" />
										<span className="text-xs text-gray-500 font-sans uppercase">
											QUERY
										</span>
									</div>
									{searchQuery && (
										<div className="absolute -bottom-6 left-0 right-0">
											<div className="flex items-center gap-2 text-xs text-cyan-400 font-sans">
												<div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
												<span>
													Scanning {pagination?.total?.toLocaleString() || "0"}{" "}
													entities...
												</span>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Horizontal Filter Bar */}
						<div className="space-y-2">
							<div className="flex gap-1 overflow-x-auto">
								{[
									{
										id: "keywords",
										label: "Keywords",
										icon: Search,
										hasActive: filters.keywords?.length > 0,
										activeCount: filters.keywords?.length || 0,
									},
									{
										id: "location",
										label: "Location",
										icon: Globe,
										hasActive: filters.states?.length > 0,
										activeCount: filters.states?.length || 0,
									},
									{
										id: "sector",
										label: "Sector",
										icon: BarChart3,
										hasActive: filters.sectors?.length > 0,
										activeCount: filters.sectors?.length || 0,
									},
									{
										id: "awards",
										label: "Awards",
										icon: BarChart3,
										hasActive:
											filters.contractValueMin > 0 ||
											filters.contractValueMax < 100 ||
											filters.awardType !== "Active",
										activeCount:
											filters.contractValueMin > 0 ||
											filters.contractValueMax < 100 ||
											filters.awardType !== "Active"
												? 1
												: 0,
									},
									{
										id: "activity",
										label: "Activity",
										icon: TrendingUp,
										hasActive: filters.lifecycleStage?.length > 0,
										activeCount: filters.lifecycleStage?.length || 0,
									},
									{
										id: "performance",
										label: "Performance",
										icon: Activity,
										hasActive: filters.businessMomentum?.length > 0,
										activeCount: filters.businessMomentum?.length || 0,
									},
									{
										id: "prime",
										label: "Prime Status",
										icon: Shield,
										hasActive: filters.ownershipType?.length > 0,
										activeCount: filters.ownershipType?.length || 0,
									},
								].map((filter) => (
									<button
										key={filter.id}
										onClick={() =>
											setOpenFilter(openFilter === filter.id ? null : filter.id)
										}
										className={cn(
											"flex items-center justify-center gap-2 px-6 py-2 rounded-lg border transition-all whitespace-nowrap font-orbitron flex-1 min-w-0",
											openFilter === filter.id
												? "border-[#D2AC38]/50 bg-[#D2AC38]/10 text-[#D2AC38]"
												: filter.hasActive
													? "border-[#D2AC38]/30 bg-[#D2AC38]/5 text-[#D2AC38]"
													: "border-cyan-500/30 text-gray-400 hover:border-cyan-500/50 hover:text-cyan-300",
										)}
									>
										<filter.icon className="w-3 h-3" />
										<span className="text-sm font-bold uppercase">
											{filter.label}
										</span>
										{filter.hasActive && (
											<span className="text-xs px-1.5 py-0.5 rounded-full bg-[#D2AC38]/30 text-[#D2AC38] font-sans">
												{filter.activeCount}
											</span>
										)}
									</button>
								))}
							</div>

							{/* Filter Content Panel */}
							{openFilter && (
								<div className="rounded-lg border border-cyan-500/30 bg-gray-900/80 backdrop-blur-sm overflow-hidden">
									{renderFilterContent(openFilter)}
								</div>
							)}
						</div>
					</div>

					{/* Active Filters Bar */}
					{activeFilterCount > 0 && (
						<div className="mt-3">
							<ActiveFilters
								filters={filters}
								onRemoveFilter={(type, value) => {
									setFilters((prev) => {
										const updated = { ...prev };
										if (type === "contractValue") {
											updated.contractValueMin = undefined;
											updated.contractValueMax = undefined;
										} else if (
											Array.isArray(updated[type as keyof SearchFilters])
										) {
											(updated[type as keyof SearchFilters] as any[]) = (
												updated[type as keyof SearchFilters] as any[]
											).filter((v: any) => v !== value);
										}
										return updated;
									});
									setCurrentPage(1);
								}}
								onClearAll={clearAllFilters}
							/>
						</div>
					)}
				</div>

				{/* Content Area - Advanced Tactical Display */}
				<div className="p-6 relative">
					{/* Enhanced Status Dashboard */}
					<div className="mb-6 p-6 bg-gradient-to-r from-black/90 via-gray-900/50 to-black/90 border border-cyan-500/30 rounded-xl backdrop-blur-sm relative overflow-hidden">
						{/* Animated background grid */}
						<div className="absolute inset-0 opacity-10">
							<div
								className="absolute inset-0"
								style={{
									backgroundImage: `
                  linear-gradient(90deg, cyan 1px, transparent 1px),
                  linear-gradient(180deg, cyan 1px, transparent 1px)
                `,
									backgroundSize: "20px 20px",
								}}
							/>
						</div>

						<div className="relative flex items-center justify-between">
							<div className="flex items-center gap-6">
								{/* System Status */}
								<div className="flex items-center gap-3 px-4 py-2 bg-black/60 border border-green-500/30 rounded-lg backdrop-blur-sm">
									<div className="relative">
										<div
											className={cn(
												"w-3 h-3 rounded-full",
												isLoading
													? "bg-yellow-400 animate-pulse"
													: error
														? "bg-red-400"
														: "bg-green-400 animate-pulse",
											)}
										/>
										{!error && (
											<div
												className={cn(
													"absolute inset-0 rounded-full animate-ping",
													isLoading ? "bg-yellow-400/50" : "bg-green-400/50",
												)}
											/>
										)}
									</div>
									<div className="flex flex-col">
										<span className="text-xs text-gray-400 font-sans uppercase">
											System Status
										</span>
										<span
											className={cn(
												"text-sm font-sans uppercase font-bold",
												isLoading
													? "text-yellow-400"
													: error
														? "text-red-400"
														: "text-green-400",
											)}
										>
											{isLoading
												? "SCANNING..."
												: error
													? "ERROR"
													: "OPERATIONAL"}
										</span>
									</div>
								</div>

								{/* Target Intelligence */}
								{pagination && (
									<div className="flex items-center gap-3 px-4 py-2 bg-black/60 border border-cyan-500/30 rounded-lg backdrop-blur-sm">
										<Target className="w-4 h-4 text-cyan-400" />
										<div className="flex flex-col">
											<span className="text-xs text-gray-400 font-sans uppercase">
												Target Count
											</span>
											<span className="text-sm text-cyan-400 font-sans font-bold">
												{pagination.total.toLocaleString()} ENTITIES
											</span>
										</div>
									</div>
								)}

								{/* Financial Intelligence */}
								{aggregations && (
									<div className="flex items-center gap-3 px-4 py-2 bg-black/60 border border-[#D2AC38]/30 rounded-lg backdrop-blur-sm">
										<Database className="w-4 h-4 text-[#D2AC38]" />
										<div className="flex flex-col">
											<span className="text-xs text-gray-400 font-sans uppercase">
												Total Value
											</span>
											<span className="text-sm text-[#D2AC38] font-sans font-bold">
												{formatCurrency(aggregations.totalObligated)}
											</span>
										</div>
									</div>
								)}

								{/* Performance Metrics */}
								<div className="flex items-center gap-3 px-4 py-2 bg-black/60 border border-blue-500/30 rounded-lg backdrop-blur-sm">
									<Activity className="w-4 h-4 text-blue-400 animate-pulse" />
									<div className="flex flex-col">
										<span className="text-xs text-gray-400 font-sans uppercase">
											Response Time
										</span>
										<span className="text-sm text-blue-400 font-sans font-bold">
											{isLoading ? "..." : "247ms"}
										</span>
									</div>
								</div>
							</div>

							{/* Pagination Controls */}
							{pagination && pagination.totalPages > 1 && (
								<div className="flex items-center gap-3">
									<div className="flex items-center gap-2 px-3 py-2 bg-black/60 border border-gray-600/30 rounded-lg backdrop-blur-sm">
										<span className="text-xs text-gray-400 font-sans uppercase">
											Page
										</span>
										<span className="text-sm text-white font-sans font-bold">
											{currentPage} / {pagination.totalPages}
										</span>
									</div>
									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
											disabled={currentPage <= 1 || isLoading}
											className="h-8 w-8 p-0 text-gray-400 hover:text-[#D2AC38] hover:bg-[#D2AC38]/10 border border-gray-600/30 rounded"
										>
											<ChevronLeft className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												setCurrentPage((p) =>
													Math.min(pagination.totalPages, p + 1),
												)
											}
											disabled={
												currentPage >= pagination.totalPages || isLoading
											}
											className="h-8 w-8 p-0 text-gray-400 hover:text-[#D2AC38] hover:bg-[#D2AC38]/10 border border-gray-600/30 rounded"
										>
											<ChevronRight className="h-4 w-4" />
										</Button>
									</div>
								</div>
							)}
						</div>

						{/* Real-time activity indicator */}
						<div className="mt-4 flex items-center gap-2">
							<div className="h-1 flex-1 bg-gray-800 rounded-full overflow-hidden">
								<div
									className={cn(
										"h-full rounded-full transition-all duration-1000",
										isLoading
											? "w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 animate-pulse"
											: error
												? "w-0 bg-red-500"
												: "w-full bg-gradient-to-r from-green-500 via-cyan-500 to-green-500",
									)}
								/>
							</div>
							<span className="text-xs text-gray-500 font-sans">
								{isLoading ? "SCANNING" : error ? "OFFLINE" : "LIVE"}
							</span>
						</div>
					</div>

					{error ? (
						<div className="text-center py-12">
							<p className="text-red-400 mb-4">{error}</p>
							<Button onClick={refetch} variant="outline">
								Try Again
							</Button>
						</div>
					) : isLoading ? (
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: pageSize }).map((_, i) => (
								<ContractorCardSkeleton key={i} />
							))}
						</div>
					) : filteredContractors.length === 0 ? (
						<EmptyState
							title="No contractors found"
							description="Try adjusting your filters or search query"
							action={
								<Button onClick={clearAllFilters} variant="outline">
									Clear Filters
								</Button>
							}
						/>
					) : viewMode === "cards" ? (
						<>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{filteredContractors.map((contractor) => (
									<HudContractorCard
										key={contractor.id}
										contractor={contractor}
										isFavorite={isFavorite(contractor.id)}
										onToggleFavorite={handleToggleFavorite}
										onClick={() => setSelectedContractor(contractor)}
									/>
								))}
							</div>
							{pagination && pagination.totalPages > 1 && (
								<div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-[#D2AC38]/10">
									<Button
										variant="outline"
										onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
										disabled={currentPage <= 1 || isLoading}
										className="border-[#D2AC38]/20 text-gray-300 hover:text-[#D2AC38] hover:border-[#D2AC38]/40"
									>
										<ChevronLeft className="h-4 w-4 mr-2" />
										Previous
									</Button>
									<div className="flex items-center gap-2">
										{Array.from(
											{ length: Math.min(5, pagination.totalPages) },
											(_, i) => {
												const pageNum =
													currentPage <= 3
														? i + 1
														: currentPage >= pagination.totalPages - 2
															? pagination.totalPages - 4 + i
															: currentPage - 2 + i;
												return (
													<Button
														key={pageNum}
														variant={
															pageNum === currentPage ? "default" : "ghost"
														}
														size="sm"
														onClick={() => setCurrentPage(pageNum)}
														disabled={isLoading}
														className={
															pageNum === currentPage
																? "bg-[#D2AC38] text-black"
																: "text-gray-400 hover:text-[#D2AC38]"
														}
													>
														{pageNum}
													</Button>
												);
											},
										)}
									</div>
									<Button
										variant="outline"
										onClick={() =>
											setCurrentPage((p) =>
												Math.min(pagination.totalPages, p + 1),
											)
										}
										disabled={currentPage >= pagination.totalPages || isLoading}
										className="border-[#D2AC38]/20 text-gray-300 hover:text-[#D2AC38] hover:border-[#D2AC38]/40"
									>
										Next
										<ChevronRight className="h-4 w-4 ml-2" />
									</Button>
								</div>
							)}
						</>
					) : (
						<>
							<ContractorTable
								contractors={filteredContractors}
								onRowClick={(contractor) => setSelectedContractor(contractor)}
							/>
							{pagination && pagination.totalPages > 1 && (
								<div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-[#D2AC38]/10">
									<Button
										variant="outline"
										onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
										disabled={currentPage <= 1 || isLoading}
										className="border-[#D2AC38]/20 text-gray-300 hover:text-[#D2AC38] hover:border-[#D2AC38]/40"
									>
										<ChevronLeft className="h-4 w-4 mr-2" />
										Previous
									</Button>
									<div className="flex items-center gap-2">
										{Array.from(
											{ length: Math.min(5, pagination.totalPages) },
											(_, i) => {
												const pageNum =
													currentPage <= 3
														? i + 1
														: currentPage >= pagination.totalPages - 2
															? pagination.totalPages - 4 + i
															: currentPage - 2 + i;
												return (
													<Button
														key={pageNum}
														variant={
															pageNum === currentPage ? "default" : "ghost"
														}
														size="sm"
														onClick={() => setCurrentPage(pageNum)}
														disabled={isLoading}
														className={
															pageNum === currentPage
																? "bg-[#D2AC38] text-black"
																: "text-gray-400 hover:text-[#D2AC38]"
														}
													>
														{pageNum}
													</Button>
												);
											},
										)}
									</div>
									<Button
										variant="outline"
										onClick={() =>
											setCurrentPage((p) =>
												Math.min(pagination.totalPages, p + 1),
											)
										}
										disabled={currentPage >= pagination.totalPages || isLoading}
										className="border-[#D2AC38]/20 text-gray-300 hover:text-[#D2AC38] hover:border-[#D2AC38]/40"
									>
										Next
										<ChevronRight className="h-4 w-4 ml-2" />
									</Button>
								</div>
							)}
						</>
					)}
				</div>
			</div>

			{/* Filter Sidebar */}
			<Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen} side="right">
				<FilterSidebar
					filters={filters}
					onFiltersChange={setFilters}
					onClose={() => setIsFilterOpen(false)}
				/>
			</Sheet>

			{/* Contractor Detail Modal */}
			<HudContractorModal
				contractor={selectedContractor}
				isOpen={!!selectedContractor}
				onClose={() => setSelectedContractor(null)}
				onAddToPortfolio={(contractor) => {
					console.log("Adding to portfolio:", contractor);
					// TODO: Implement portfolio add functionality
				}}
			/>
		</div>
	);
}
