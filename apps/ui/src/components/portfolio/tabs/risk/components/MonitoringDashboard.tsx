import {
	AlertTriangle,
	ArrowLeft,
	Award,
	BarChart3,
	Bot,
	ChevronDown,
	ChevronRight,
	ChevronUp,
	Database,
	Download,
	Settings,
	Shield,
	Target,
	ToggleLeft,
	ToggleRight,
	TrendingDown,
	TrendingUp,
	Zap,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../../../ui/button";
import {
	getAllContractorMetrics,
	getContractorMetrics,
} from "../../../services/contractor-metrics-adapter";
import { featureOptions } from "../logic/featureOptions";
import type { FilterSettings } from "../types";
import { ChartStyleContainer } from "../ui/ChartStyleContainer";

interface MonitoringDashboardProps {
	filterSettings: FilterSettings;
	onAIConfigureClick: () => void;
	onShowFilterSettings: () => void;
}

export function MonitoringDashboard({
	filterSettings,
	onAIConfigureClick,
	onShowFilterSettings,
}: MonitoringDashboardProps) {
	const [expandedCard, setExpandedCard] = useState<string | null>(null);
	const [activeSpreadsheet, setActiveSpreadsheet] = useState<string | null>(
		null,
	);
	const [showScores, setShowScores] = useState(false);
	const [showColors, setShowColors] = useState(false);
	const [sortColumn, setSortColumn] = useState<string>("Portfolio");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

	const toggleCard = (cardType: string) => {
		setActiveSpreadsheet(cardType);
	};

	const handleBackToMonitoring = () => {
		setActiveSpreadsheet(null);
		setShowScores(false); // Reset to values when going back
		setShowColors(false); // Reset colors when going back
	};

	const toggleScoresValues = () => {
		setShowScores(!showScores);
	};

	const toggleColors = () => {
		setShowColors(!showColors);
	};

	// Get color for score based on type and value - using exact colors from contractor-detail performance
	const getScoreColor = (type: string, score: number) => {
		if (type === "performance") {
			if (score >= 90) return "#15803d"; // Dark green - Elite (matches score 91)
			if (score >= 75) return "#84cc16"; // Chartreuse/Lime green - Strong (matches scores 85, 82, 80, 76)
			if (score >= 60) return "#eab308"; // Yellow - Caution (matches score 68)
			return "#ef4444"; // Red - Critical
		}
		if (type === "utilization") {
			// Utilization uses 25% quartiles: red, yellow, chartreuse, green
			if (score >= 75) return "#15803d"; // Green - Top quartile (75-100)
			if (score >= 50) return "#84cc16"; // Chartreuse - Third quartile (50-74)
			if (score >= 25) return "#eab308"; // Yellow - Second quartile (25-49)
			return "#ef4444"; // Red - Bottom quartile (0-24)
		}
		return "#6b7280"; // Default gray
	};

	// Helper functions for company data (using Trio as reference framework)
	const getCompanyNAICS = (uei: string) => {
		const naicsMap: Record<string, string> = {
			TFL123456789: "Fabricated Plate Work Manufacturing",
			RTX987654321: "Guided Missile and Space Vehicle Manufacturing",
			BAE456789123: "Search Detection Navigation Guidance Aeronautical Systems",
			ACI789123456: "Laminated Plastics Plate Sheet and Shape Manufacturing",
			MSF456789012: "Health Care and Social Assistance",
			ITC234567890: "Professional, Scientific, and Technical Services",
			GCE567890123: "Construction of Buildings",
			QSL890123456: "Transportation and Warehousing",
			NGE123456780: "Environmental Consulting Services",
		};
		return naicsMap[uei] || "Professional Services";
	};

	const getMarketType = (primaryAgency?: string) => {
		return primaryAgency === "Defense" ? "defense" : "civilian";
	};

	const getCompanyLocation = (uei: string) => {
		const locationMap: Record<string, string> = {
			TFL123456789: "Houston, TX",
			RTX987654321: "Waltham, MA",
			BAE456789123: "Arlington, VA",
			ACI789123456: "Seattle, WA",
			MSF456789012: "Washington, DC",
			ITC234567890: "Austin, TX",
			GCE567890123: "Denver, CO",
			QSL890123456: "Norfolk, VA",
			NGE123456780: "Portland, OR",
		};
		return locationMap[uei] || "Washington, DC";
	};

	const getEmployeeCount = (uei: string) => {
		const employeeMap: Record<string, string> = {
			TFL123456789: "250-500",
			RTX987654321: "10,000+",
			BAE456789123: "5,000-10,000",
			ACI789123456: "500-1,000",
			MSF456789012: "1,000-5,000",
			ITC234567890: "100-250",
			GCE567890123: "500-1,000",
			QSL890123456: "100-500",
			NGE123456780: "50-100",
		};
		return employeeMap[uei] || "250-500";
	};

	const getYearsInBusiness = (uei: string) => {
		const yearsMap: Record<string, number> = {
			TFL123456789: 12,
			RTX987654321: 98,
			BAE456789123: 45,
			ACI789123456: 23,
			MSF456789012: 15,
			ITC234567890: 8,
			GCE567890123: 18,
			QSL890123456: 14,
			NGE123456780: 9,
		};
		return yearsMap[uei] || 10;
	};

	const getPrimaryContact = (uei: string) => {
		const contactMap: Record<string, string> = {
			TFL123456789: "John Smith, VP Operations",
			RTX987654321: "Sarah Johnson, Director Defense Systems",
			BAE456789123: "Michael Davis, Program Manager",
			ACI789123456: "Lisa Chen, Operations Director",
			MSF456789012: "Dr. Robert Wilson, Chief Medical Officer",
			ITC234567890: "Amanda Rodriguez, CTO",
			GCE567890123: "Mark Thompson, Project Director",
			QSL890123456: "David Kim, VP Logistics",
			NGE123456780: "Maria Santos, Environmental Director",
		};
		return contactMap[uei] || "Contact Representative";
	};

	// Portfolio Data Service - pulls from actual contractorMetrics service (Trio Fabrication framework)
	const portfolioDataService = {
		getPortfolioAssets: () => {
			const allMetrics = getAllContractorMetrics();
			return Object.values(allMetrics).map((metrics) => ({
				id: metrics.uei,
				companyName: metrics.companyName,
				naicsDescription: getCompanyNAICS(metrics.uei),
				marketType: getMarketType(metrics.primaryAgency) as
					| "defense"
					| "civilian",
				uei: metrics.uei,
				activeAwards: { value: metrics.activeAwards },
				location: getCompanyLocation(metrics.uei),
				employeeCount: getEmployeeCount(metrics.uei),
				yearsInBusiness: getYearsInBusiness(metrics.uei),
				primaryContact: getPrimaryContact(metrics.uei),
				lifetimeAwards: metrics.lifetimeAwards,
				revenue: metrics.revenue,
				pipeline: metrics.pipeline,
				contractCount: metrics.contractCount,
				primaryAgency: metrics.primaryAgency,
			}));
		},

		parseAwardValue: (value: string): number => {
			const cleanValue = value.replace(/[^\d.]/g, "");
			const multiplier = value.includes("B") ? 1000000000 : 1000000;
			return Number.parseFloat(cleanValue) * multiplier;
		},

		getAssetsByAwardValue: (sortOrder: "asc" | "desc" = "desc") => {
			const assets = portfolioDataService.getPortfolioAssets();
			return assets.sort((a, b) => {
				const aValue = portfolioDataService.parseAwardValue(
					a.activeAwards.value,
				);
				const bValue = portfolioDataService.parseAwardValue(
					b.activeAwards.value,
				);
				return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
			});
		},

		getTotalPortfolioValue: (): number => {
			const assets = portfolioDataService.getPortfolioAssets();
			return assets.reduce(
				(total, asset) =>
					total +
					portfolioDataService.parseAwardValue(asset.activeAwards.value),
				0,
			);
		},

		getAssetCount: (): number => {
			return portfolioDataService.getPortfolioAssets().length;
		},
	};

	// Use the service to get portfolio assets
	const portfolioAssets = portfolioDataService.getAssetsByAwardValue("desc");

	// Generate scores based on actual contractor metrics (using Trio as reference)
	const generateMetricsBasedScore = (asset: any, featureKey: string) => {
		const metrics = getContractorMetrics(asset.uei);
		if (!metrics) return 75; // Default score

		const feature = featureOptions[featureKey];
		let baseScore = 75;

		// Calculate scores based on actual metrics, with Trio as the reference framework
		const awardValue = portfolioDataService.parseAwardValue(
			metrics.activeAwards,
		);
		const pipelineValue = portfolioDataService.parseAwardValue(
			metrics.pipeline,
		);
		const revenueValue = portfolioDataService.parseAwardValue(metrics.revenue);

		// Trio Fabrication reference values for scoring
		const trioAwards = 125000000; // $125M
		const trioPipeline = 280000000; // $280M
		const trioRevenue = 125000000; // $125M

		switch (feature.category) {
			case "performance": {
				// Performance based on revenue and awards relative to Trio
				const revenueRatio = revenueValue / trioRevenue;
				const awardRatio = awardValue / trioAwards;
				baseScore = Math.min(
					95,
					Math.max(50, 75 + (revenueRatio + awardRatio - 2) * 15),
				);
				break;
			}

			case "activity": {
				// Activity based on contract count and award velocity
				const contractRatio = metrics.contractCount / 92; // Trio has 92 contracts
				baseScore = Math.min(95, Math.max(50, 70 + contractRatio * 20));
				break;
			}

			case "utilization": {
				// Utilization based on pipeline efficiency
				const pipelineRatio = pipelineValue / awardValue;
				const trioRatio = trioPipeline / trioAwards; // ~2.24
				baseScore = Math.min(
					95,
					Math.max(45, 75 - Math.abs(pipelineRatio - trioRatio) * 10),
				);
				break;
			}
		}

		// Add feature-specific variations
		const featureHash = featureKey
			.split("")
			.reduce((hash, char) => hash + char.charCodeAt(0), 0);
		const variation = (featureHash % 10) - 5; // -5 to +5 variation

		return Math.min(95, Math.max(45, baseScore + variation));
	};

	// Get top and bottom performers based on consistent scores
	const getTopBottomPerformers = (type: string) => {
		const featureKeys = getFeatureKeys(type);
		const assetsWithScores = portfolioAssets.map((asset) => {
			let totalScore = 0;
			let scoreCount = 0;

			featureKeys.forEach((featureKey) => {
				const score = generateMetricsBasedScore(asset, featureKey);
				totalScore += score;
				scoreCount++;
			});

			return {
				...asset,
				avgScore: totalScore / scoreCount,
			};
		});

		const sorted = assetsWithScores.sort((a, b) => b.avgScore - a.avgScore);
		return {
			strongest: sorted.slice(0, 2), // Top 2
			weakest: sorted.slice(-2).reverse(), // Bottom 2, reversed so worst is first
		};
	};

	// Get columns from feature options based on category
	const getSpreadsheetColumns = (type: string) => {
		return Object.entries(featureOptions)
			.filter(([key, option]) => option.category === type)
			.map(([key, option]) => option.label);
	};

	// Get feature keys for data generation
	const getFeatureKeys = (type: string) => {
		return Object.entries(featureOptions)
			.filter(([key, option]) => option.category === type)
			.map(([key]) => key);
	};

	// Column sorting handler
	const handleColumnSort = (column: string) => {
		if (sortColumn === column) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(column);
			setSortDirection("desc");
		}
	};

	// Reset colors when switching to activity (which doesn't support colors)
	React.useEffect(() => {
		if (activeSpreadsheet === "activity") {
			setShowColors(false);
		}
	}, [activeSpreadsheet]);

	// Generate spreadsheet data using real portfolio assets with proper feature-based columns
	const generateSpreadsheetData = (type: string) => {
		const sortedAssets = [...portfolioAssets];
		const featureKeys = getFeatureKeys(type);

		const spreadsheetData = sortedAssets.map((asset) => {
			const data = [asset.companyName];
			const awardValue = portfolioDataService.parseAwardValue(
				asset.activeAwards.value,
			);

			featureKeys.forEach((featureKey) => {
				const feature = featureOptions[featureKey];
				const scoreValue = generateMetricsBasedScore(asset, featureKey);
				const metrics = getContractorMetrics(asset.uei);

				if (showScores) {
					// Score mode (0-100 scale)
					const score = scoreValue.toFixed(1);
					data.push({ value: score, score: scoreValue });
				} else {
					// Value mode - use actual metrics where possible, otherwise calculated values
					let value;

					if (metrics) {
						// Use real metrics data for key performance indicators
						switch (featureKey) {
							case "awards_captured_ttm":
								value = metrics.activeAwards;
								break;
							case "estimated_revenue_ttm":
								value = metrics.revenue;
								break;
							case "total_pipeline":
								value = metrics.pipeline;
								break;
							case "portfolio_duration":
								value = `${(asset.yearsInBusiness * 0.3).toFixed(1)} yrs`;
								break;
							case "blended_growth": {
								const growthRate = (
									(portfolioDataService.parseAwardValue(metrics.pipeline) /
										portfolioDataService.parseAwardValue(metrics.activeAwards) -
										1) *
									50
								).toFixed(1);
								value = `${growthRate}%`;
								break;
							}
							case "new_awards":
							case "new_obligations":
							case "new_subawards":
							case "new_relationships":
							case "all_procurement_events":
								value = Math.floor(
									metrics.contractCount * (scoreValue / 75),
								).toLocaleString();
								break;
							case "award_utilization":
							case "vendor_utilization":
								value = `${scoreValue.toFixed(1)}%`;
								break;
							default: {
								// Fallback to score-based calculation
								const scoreMultiplier = scoreValue / 80;
								switch (feature.unit) {
									case "$M":
										value = `$${(
											(awardValue / 1000000) * scoreMultiplier * 0.8
										).toFixed(1)}M`;
										break;
									case "yrs":
										value = `${(2 + scoreMultiplier * 3).toFixed(1)} yrs`;
										break;
									case "%":
										value = `${scoreValue.toFixed(1)}%`;
										break;
									case "pts":
										value = scoreValue.toFixed(1);
										break;
									default:
										value = scoreValue.toFixed(1);
								}
							}
						}
					} else {
						// Fallback to score-based calculation for unknown contractors
						const scoreMultiplier = scoreValue / 80;
						switch (feature.unit) {
							case "$M":
								value = `$${((awardValue / 1000000) * scoreMultiplier * 0.8).toFixed(1)}M`;
								break;
							case "yrs":
								value = `${(2 + scoreMultiplier * 3).toFixed(1)} yrs`;
								break;
							case "%":
								value = `${scoreValue.toFixed(1)}%`;
								break;
							case "pts":
								value = scoreValue.toFixed(1);
								break;
							default:
								value = scoreValue.toFixed(1);
						}
					}

					data.push({ value, score: scoreValue });
				}
			});

			return { data, asset, sortValue: awardValue };
		});

		// Apply sorting
		if (sortColumn === "Portfolio") {
			spreadsheetData.sort((a, b) => {
				const comparison = a.asset.companyName.localeCompare(
					b.asset.companyName,
				);
				return sortDirection === "asc" ? comparison : -comparison;
			});
		} else {
			const columns = ["Portfolio", ...getSpreadsheetColumns(type)];
			const columnIndex = columns.indexOf(sortColumn);
			if (columnIndex > 0) {
				spreadsheetData.sort((a, b) => {
					const aValue =
						typeof a.data[columnIndex] === "object"
							? a.data[columnIndex].score
							: Number.parseFloat(
									a.data[columnIndex]?.toString().replace(/[^0-9.-]/g, "") ||
										"0",
								);
					const bValue =
						typeof b.data[columnIndex] === "object"
							? b.data[columnIndex].score
							: Number.parseFloat(
									b.data[columnIndex]?.toString().replace(/[^0-9.-]/g, "") ||
										"0",
								);
					const comparison = aValue - bValue;
					return sortDirection === "asc" ? comparison : -comparison;
				});
			}
		}

		return spreadsheetData.map((item) => item.data);
	};

	const getSpreadsheetConfig = (type: string) => {
		switch (type) {
			case "performance":
				return {
					title: "Portfolio Performance Monitoring",
					color: "cyan",
					bgColor: "bg-cyan-500/10",
					borderColor: "border-cyan-500/20",
					textColor: "text-cyan-400",
				};
			case "activity":
				return {
					title: "Portfolio Activity Monitoring",
					color: "orange",
					bgColor: "bg-orange-500/10",
					borderColor: "border-orange-500/20",
					textColor: "text-orange-400",
				};
			case "utilization":
				return {
					title: "Portfolio Utilization Monitoring",
					color: "indigo",
					bgColor: "bg-indigo-500/10",
					borderColor: "border-indigo-500/20",
					textColor: "text-indigo-400",
				};
			default:
				return {
					title: "Portfolio Monitoring",
					color: "gray",
					bgColor: "bg-gray-500/10",
					borderColor: "border-gray-500/20",
					textColor: "text-gray-400",
				};
		}
	};
	// If activeSpreadsheet is set, show the spreadsheet view
	if (activeSpreadsheet) {
		const columns = getSpreadsheetColumns(activeSpreadsheet);
		const data = generateSpreadsheetData(activeSpreadsheet);
		const config = getSpreadsheetConfig(activeSpreadsheet);
		const performers = getTopBottomPerformers(activeSpreadsheet);

		return (
			<div className="min-h-[500px] flex justify-center">
				<div className="w-full max-w-4xl">
					{/* Back Button */}
					<div className="mb-4">
						<button
							onClick={handleBackToMonitoring}
							className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
						>
							<ArrowLeft className="w-4 h-4" />
							Back to Monitoring Dashboard
						</button>
					</div>

					{/* Main Container with Highlights and Spreadsheet */}
					<div className="rounded-xl">
						<div
							className="rounded-xl p-4"
							style={{ backgroundColor: "#223040" }}
						>
							<div className="relative h-full">
								{/* Title */}
								<div className="absolute top-0 left-0 z-10">
									<h3 className="font-sans text-xs uppercase tracking-wider text-gray-500">
										{config.title}
									</h3>
								</div>

								{/* Live Indicator */}
								<div className="absolute top-0 right-0 z-10 flex items-center gap-2">
									<span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
									<span
										className="text-[10px] text-green-400 tracking-wider font-light"
										style={{ fontFamily: "Genos, sans-serif" }}
									>
										LIVE
									</span>
								</div>

								{/* Highlight Panels */}
								<div className="pt-8 mb-6">
									<div className="grid grid-cols-2 gap-6">
										{/* Strongest Performers */}
										<div className="relative">
											<div
												className={`rounded-lg p-4 border-2 bg-gradient-to-br from-${config.color}-500/20 to-${config.color}-600/10 ${config.borderColor} hover:border-${config.color}-400/60 transition-all duration-300`}
											>
												<div className="flex items-center justify-between mb-3">
													<div className="flex items-center gap-2">
														<div
															className={`p-2 rounded-lg bg-gradient-to-br from-${config.color}-500/30 to-${config.color}-600/20`}
														>
															<TrendingUp
																className={`w-5 h-5 ${config.textColor}`}
															/>
														</div>
														<div>
															<h4 className="font-medium text-white text-sm">
																Portfolio Leaders
															</h4>
															<p className="text-xs text-gray-400">
																Top {activeSpreadsheet} performers
															</p>
														</div>
													</div>
													<Zap
														className={`w-4 h-4 ${config.textColor} animate-pulse`}
													/>
												</div>

												<div className="space-y-2">
													{performers.strongest.map((asset, index) => (
														<div
															key={asset.id}
															className={`flex items-center justify-between p-2 rounded bg-${config.color}-500/10 hover:bg-${config.color}-500/20 transition-colors cursor-pointer`}
														>
															<div className="flex items-center gap-2">
																<div
																	className={`w-6 h-6 rounded-full bg-gradient-to-br from-${config.color}-400 to-${config.color}-500 flex items-center justify-center text-xs font-bold text-black`}
																>
																	{index + 1}
																</div>
																<div>
																	<div className="text-sm font-medium text-white">
																		{asset.companyName}
																	</div>
																	<div className="text-xs text-gray-400">
																		{asset.naicsDescription.slice(0, 30)}...
																	</div>
																</div>
															</div>
															<div
																className={`text-sm font-bold ${config.textColor}`}
															>
																{asset.avgScore.toFixed(1)}
															</div>
														</div>
													))}
												</div>
											</div>
										</div>

										{/* Weakest Performers */}
										<div className="relative">
											<div className="rounded-lg p-4 border-2 bg-gradient-to-br from-red-500/20 to-orange-600/10 border-red-500/20 hover:border-red-400/60 transition-all duration-300">
												<div className="flex items-center justify-between mb-3">
													<div className="flex items-center gap-2">
														<div className="p-2 rounded-lg bg-gradient-to-br from-red-500/30 to-orange-600/20">
															<TrendingDown className="w-5 h-5 text-red-400" />
														</div>
														<div>
															<h4 className="font-medium text-white text-sm">
																Growth Opportunities
															</h4>
															<p className="text-xs text-gray-400">
																Focus areas for improvement
															</p>
														</div>
													</div>
													<Target className="w-4 h-4 text-red-400" />
												</div>

												<div className="space-y-2">
													{performers.weakest.map((asset, index) => (
														<div
															key={asset.id}
															className="flex items-center justify-between p-2 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer"
														>
															<div className="flex items-center gap-2">
																<div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center text-xs font-bold text-white">
																	<AlertTriangle className="w-3 h-3" />
																</div>
																<div>
																	<div className="text-sm font-medium text-white">
																		{asset.companyName}
																	</div>
																	<div className="text-xs text-gray-400">
																		{asset.naicsDescription.slice(0, 30)}...
																	</div>
																</div>
															</div>
															<div className="text-sm font-bold text-red-400">
																{asset.avgScore.toFixed(1)}
															</div>
														</div>
													))}
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Export Button and Toggles */}
								<div className="flex items-center justify-between mb-4">
									<h4 className="text-sm font-medium text-gray-300">
										Detailed Data View
									</h4>
									<div className="flex items-center gap-3">
										<button
											onClick={toggleScoresValues}
											className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
										>
											{showScores ? (
												<ToggleRight className="w-3 h-3" />
											) : (
												<ToggleLeft className="w-3 h-3" />
											)}
											{showScores ? "Scores" : "Values"}
										</button>
										{(activeSpreadsheet === "performance" ||
											activeSpreadsheet === "utilization") && (
											<button
												onClick={toggleColors}
												className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
											>
												{showColors ? (
													<ToggleRight className="w-3 h-3" />
												) : (
													<ToggleLeft className="w-3 h-3" />
												)}
												Colors
											</button>
										)}
										<button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-300 transition-colors">
											<Download className="w-3 h-3" />
											Export
										</button>
									</div>
								</div>

								{/* Spreadsheet Content */}
								<div>
									<div className="border border-gray-700 rounded-lg bg-gray-800">
										{/* Spreadsheet Table */}
										<div className="overflow-x-auto">
											<table className="w-full text-[10px]">
												<thead className="bg-gray-900/50">
													<tr>
														<th
															className="text-left p-1.5 text-gray-300 font-medium border-b border-gray-700/50 text-[10px] cursor-pointer hover:text-white transition-colors"
															onClick={() => handleColumnSort("Portfolio")}
														>
															<div className="flex items-center gap-1">
																Portfolio
																{sortColumn === "Portfolio" &&
																	(sortDirection === "asc" ? (
																		<ChevronUp className="w-3 h-3" />
																	) : (
																		<ChevronDown className="w-3 h-3" />
																	))}
															</div>
														</th>
														{columns.map((column, index) => (
															<th
																key={index}
																className={`text-center p-1.5 ${config.textColor} font-medium border-b border-gray-700/50 min-w-[90px] text-[10px] cursor-pointer hover:text-white transition-colors`}
																onClick={() => handleColumnSort(column)}
															>
																<div className="flex items-center justify-center gap-1">
																	{column}
																	{sortColumn === column &&
																		(sortDirection === "asc" ? (
																			<ChevronUp className="w-3 h-3" />
																		) : (
																			<ChevronDown className="w-3 h-3" />
																		))}
																</div>
															</th>
														))}
													</tr>
												</thead>
												<tbody>
													{data.map((row, rowIndex) => (
														<tr
															key={rowIndex}
															className={`
                              ${rowIndex % 2 === 0 ? "bg-gray-900/80" : "bg-gray-700/40"}
                              hover:bg-gray-600/50 transition-colors border-b border-gray-800/30
                            `}
														>
															<td className="p-1.5 text-white font-medium text-[10px]">
																{row[0]}
															</td>
															{row.slice(1).map((cell, cellIndex) => {
																const cellValue =
																	typeof cell === "object" ? cell.value : cell;
																const cellScore =
																	typeof cell === "object"
																		? cell.score
																		: Number.parseFloat(
																				cellValue
																					?.toString()
																					.replace(/[^0-9.-]/g, "") || "0",
																			);
																const textColor =
																	showColors &&
																	(activeSpreadsheet === "performance" ||
																		activeSpreadsheet === "utilization")
																		? getScoreColor(
																				activeSpreadsheet,
																				cellScore,
																			)
																		: "#e5e7eb";

																return (
																	<td
																		key={cellIndex}
																		className="p-1.5 text-center text-[10px]"
																		style={{ color: textColor }}
																	>
																		{cellValue}
																	</td>
																);
															})}
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<ChartStyleContainer>
			<div className="relative h-full">
				{/* Title */}
				<div className="absolute top-0 left-0 z-10">
					<h3 className="font-sans text-xs uppercase tracking-wider text-gray-500">
						Monitoring Dashboard
					</h3>
				</div>

				{/* Live Indicator */}
				<div className="absolute top-0 right-0 z-10 flex items-center gap-2">
					<span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
					<span
						className="text-[10px] text-green-400 tracking-wider font-light"
						style={{ fontFamily: "Genos, sans-serif" }}
					>
						TRACKING
					</span>
				</div>

				{/* Content */}
				<div className="pt-8">
					{/* Enhanced Monitoring Grid - 3 Full Width Cards */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
						{/* ACTIVITY - Expandable Compact Grid */}
						<div
							className="bg-orange-500/10 border border-orange-500/20 rounded-lg relative group hover:border-orange-400/60 hover:bg-orange-500/15 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02]"
							onClick={() => toggleCard("activity")}
						>
							{/* Header */}
							<div className="p-6">
								<div className="text-center">
									<div className="text-sm text-orange-400 uppercase tracking-widest font-medium mb-4">
										Activity
									</div>
									<div className="text-4xl font-bold text-orange-400 mb-2 group-hover:text-orange-300 transition-colors">
										1,247
									</div>
									<div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors mb-3">
										Total Events (12 months)
									</div>
									<div className="text-xs text-orange-400 font-light tracking-wider">
										{expandedCard === "activity" ? "collapse" : "view details"}
									</div>
								</div>
							</div>

							{/* Portfolio Activity Breakdown */}
							{expandedCard === "activity" ? (
								<div className="p-4">
									<div className="text-sm font-medium text-gray-200 mb-3">
										Portfolio Activity Breakdown
									</div>
									<div className="text-xs text-gray-400 mb-2">
										Click "view details" to see full spreadsheet
									</div>
								</div>
							) : (
								<div className="p-4">
									{/* Grayed Out Scale */}
									<div className="relative h-2 bg-gray-700/30 rounded-full mb-2">
										<div className="absolute top-0 left-0 h-full bg-gray-600/20 rounded-full w-full" />
									</div>
									<div className="text-xs text-gray-500 text-center">
										Configure thresholds to enable monitoring
									</div>
								</div>
							)}
						</div>

						{/* PERFORMANCE - Expandable Compact Grid */}
						<div
							className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg relative group hover:border-cyan-400/60 hover:bg-cyan-500/15 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02]"
							onClick={() => toggleCard("performance")}
						>
							{/* Header */}
							<div className="p-6">
								<div className="text-center">
									<div className="text-sm text-cyan-400 uppercase tracking-widest font-medium mb-4">
										Performance
									</div>
									<div className="text-4xl font-bold text-cyan-400 mb-2 group-hover:text-cyan-300 transition-colors">
										78.4
									</div>
									<div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors mb-3">
										Value-Weighted Performance (Active Awards)
									</div>
									<div className="text-xs text-cyan-400 font-light tracking-wider">
										{expandedCard === "performance"
											? "collapse"
											: "view details"}
									</div>
								</div>
							</div>

							{/* Portfolio Performance Breakdown */}
							{expandedCard === "performance" ? (
								<div className="p-4">
									<div className="text-sm font-medium text-gray-200 mb-3">
										Portfolio Performance Breakdown
									</div>
									<div className="text-xs text-gray-400 mb-2">
										Click "view details" to see full spreadsheet
									</div>
								</div>
							) : (
								<div className="p-4">
									{/* Performance Gradient Scale - Adjusted for actual performance thresholds */}
									<div className="relative h-2 bg-gray-700/50 rounded-full mb-2">
										<div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500/80 via-[#eab308]/80 via-[#84cc16]/80 to-[#15803d]/80 rounded-full w-full" />
										<div
											className="absolute top-0 h-full w-1.5 bg-white rounded-full shadow-md border border-gray-400"
											style={{ left: "78%" }}
										/>
									</div>
									<div className="text-xs text-gray-500 text-center">
										Configure thresholds to enable monitoring
									</div>
								</div>
							)}
						</div>

						{/* UTILIZATION - Expandable Compact Grid */}
						<div
							className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg relative group hover:border-indigo-400/60 hover:bg-indigo-500/15 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02]"
							onClick={() => toggleCard("utilization")}
						>
							{/* Header */}
							<div className="p-6">
								<div className="text-center">
									<div className="text-sm text-indigo-400 uppercase tracking-widest font-medium mb-4">
										Utilization
									</div>
									<div className="text-4xl font-bold text-indigo-400 mb-2 group-hover:text-indigo-300 transition-colors">
										87.2%
									</div>
									<div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors mb-3">
										Value-Weighted Utilization (Active Awards)
									</div>
									<div className="text-xs text-indigo-400 font-light tracking-wider">
										{expandedCard === "utilization"
											? "collapse"
											: "view details"}
									</div>
								</div>
							</div>

							{/* Portfolio Utilization Breakdown */}
							{expandedCard === "utilization" ? (
								<div className="p-4">
									<div className="text-sm font-medium text-gray-200 mb-3">
										Portfolio Utilization Breakdown
									</div>
									<div className="text-xs text-gray-400 mb-2">
										Click "view details" to see full spreadsheet
									</div>
								</div>
							) : (
								<div className="p-4">
									{/* Utilization Gradient Scale (Reversed) */}
									<div className="relative h-2 bg-gray-700/50 rounded-full mb-2">
										<div className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500/80 via-[#7ED321]/80 via-yellow-500/80 to-red-500/80 rounded-full w-full" />
										<div
											className="absolute top-0 h-full w-1.5 bg-white rounded-full shadow-md border border-gray-400"
											style={{ left: "87%" }}
										/>
									</div>
									<div className="text-xs text-gray-500 text-center">
										Configure thresholds to enable monitoring
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Configuration Buttons */}
					<div className="flex gap-3 justify-end">
						<Button
							onClick={onAIConfigureClick}
							className="bg-[#8B8EFF]/20 hover:bg-[#8B8EFF]/30 text-[#8B8EFF] border border-[#8B8EFF]/40 hover:border-[#8B8EFF]/60 transition-all duration-200"
						>
							<Bot className="w-4 h-4 mr-2" />
							AI Configuration
						</Button>
						<Button
							onClick={onShowFilterSettings}
							className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200"
						>
							<Settings className="w-4 h-4 mr-2" />
							Filter Settings
						</Button>
					</div>
				</div>
			</div>
		</ChartStyleContainer>
	);
}
