import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { CONTRACTOR_DETAIL_COLORS, BUBBLE_CHART_CONFIG } from "../../../../shared-config";
import { GoldengateBubbleChart } from "../../../../ui/charts/components";
import { Card } from "../../../ui/card";
import { peerGroupDataService, type PeerGroupData, type PeerContractor } from "./services/peerGroupDataService";
import { DataSourceIndicator } from "./components/DataSourceIndicator";

interface CompetitivePositionPanelProps {
	benchmarkData: any;
	yAxisMetric: string;
	xAxisMetric: string;
	onYAxisMetricChange: (value: string) => void;
	onXAxisMetricChange: (value: string) => void;
	contractorUEI: string;
}

export function CompetitivePositionPanel({
	benchmarkData,
	yAxisMetric,
	xAxisMetric,
	onYAxisMetricChange,
	onXAxisMetricChange,
	contractorUEI,
}: CompetitivePositionPanelProps) {
	const [isTableExpanded, setIsTableExpanded] = useState(false);
	const [sortConfig, setSortConfig] = useState({ key: 'xScore', direction: 'desc' as 'asc' | 'desc' });
	const [peerGroupData, setPeerGroupData] = useState<PeerGroupData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch peer group data on component mount
	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const data = await peerGroupDataService.fetchPeerGroupData(contractorUEI);
				setPeerGroupData(data);
			} catch (err) {
				console.error('Failed to fetch peer group data:', err);
				setError(err instanceof Error ? err.message : 'Failed to load peer data');
			} finally {
				setIsLoading(false);
			}
		};

		if (contractorUEI) {
			fetchData();
		}
	}, [contractorUEI]);

	// Transform peer data for table display
	const getTableData = () => {
		if (!peerGroupData) return [];

		const tableData = peerGroupData.peers.map(peer => ({
			name: peer.name,
			uei: peer.uei,
			xScore: peerGroupDataService.getXAxisValue(peer, xAxisMetric),
			yValue: peerGroupDataService.getYAxisValue(peer, yAxisMetric),
			isSubject: peer.isSubject
		}));

		// Sort the data
		return tableData.sort((a, b) => {
			const aValue = a[sortConfig.key as keyof typeof a];
			const bValue = b[sortConfig.key as keyof typeof b];

			if (sortConfig.direction === 'asc') {
				return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
			} else {
				return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
			}
		});
	};

	const handleSort = (key: string) => {
		let direction: 'asc' | 'desc' = 'desc';
		if (sortConfig.key === key && sortConfig.direction === 'desc') {
			direction = 'asc';
		}
		setSortConfig({ key, direction });
	};

	const formatYValue = (value: number) => {
		return peerGroupDataService.formatYAxisValue(value, yAxisMetric);
	};

	// Generate bubble chart data from real peer data
	const generateBubbleChartData = () => {
		if (!peerGroupData) {
			return {
				datasets: [
					{
						label: BUBBLE_CHART_CONFIG.labels.peer,
						data: [],
						...BUBBLE_CHART_CONFIG.colors.peer,
					},
					{
						label: BUBBLE_CHART_CONFIG.labels.subject,
						data: [],
						...BUBBLE_CHART_CONFIG.colors.subject,
					}
				]
			};
		}

		// Separate peers from subject contractor
		const peers = peerGroupData.peers.filter(peer => !peer.isSubject);
		const subject = peerGroupData.subject;

		const peerData = peers.map(peer => ({
			x: peerGroupDataService.getXAxisValue(peer, xAxisMetric),
			y: peerGroupDataService.getYAxisValue(peer, yAxisMetric),
			r: BUBBLE_CHART_CONFIG.sizes.peerRadius,
		}));

		const subjectData = [{
			x: peerGroupDataService.getXAxisValue(subject, xAxisMetric),
			y: peerGroupDataService.getYAxisValue(subject, yAxisMetric),
			r: BUBBLE_CHART_CONFIG.sizes.subjectRadius,
		}];

		return {
			datasets: [
				{
					label: BUBBLE_CHART_CONFIG.labels.peer,
					data: peerData,
					...BUBBLE_CHART_CONFIG.colors.peer,
				},
				{
					label: subject.name,
					data: subjectData,
					...BUBBLE_CHART_CONFIG.colors.subject,
				}
			]
		};
	};

	// Helper function to get Y-axis title
	const getYAxisTitle = (metric: string) => {
		const titles: Record<string, string> = {
			ttm_awards: "Awards Captured (TTM)",
			ttm_revenue: "Revenue (TTM)",
			lifetime_awards: "Lifetime Awards",
			lifetime_revenue: "Lifetime Revenue",
			calculated_pipeline: "Calculated Pipeline",
			portfolio_duration: "Portfolio Duration",
			blended_growth: "Blended Growth",
		};
		return titles[metric] || "Financial Performance";
	};

	// Helper function to get X-axis title
	const getXAxisTitle = (metric: string) => {
		const titles: Record<string, string> = {
			composite_score: "Composite",
			awards_captured: "Awards Captured (TTM)",
			revenue: "Revenue (TTM)",
			pipeline_value: "Calculated Pipeline",
			portfolio_duration: "Portfolio Duration",
			blended_growth: "Blended Growth",
		};
		return titles[metric] || "Composite";
	};

	const getChartTitle = (yMetric: string, xMetric?: string) => {
		// Get the X-axis title
		const xTitle = xMetric ? getXAxisTitle(xMetric) : "Composite Score";
		// Get the Y-axis title
		const yTitle = getYAxisTitle(yMetric);
		return `${yTitle} vs ${xTitle}`;
	};

	// Loading and error states for display
	if (isLoading) {
		return (
			<div className="min-h-[55vh] flex items-center justify-center">
				<div className="text-white text-lg">Loading peer group data...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-[55vh] flex items-center justify-center">
				<div className="text-red-400 text-lg">Error: {error}</div>
			</div>
		);
	}

	return (
		<div className="min-h-[55vh]">
			{/* Cross-Sectional Performance - Full Width */}
			<div className="w-full">
				<Card
					className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative border border-[#D2AC38]/50 hover:border-[#D2AC38]/90"
					style={{ backgroundColor: "#111726" }}
				>
					<div className="p-4 h-full flex flex-col relative z-10">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-3">
								<h3
									className="font-bold tracking-wide mb-3 text-gray-200 uppercase"
									style={{ fontFamily: "Genos, sans-serif", fontSize: "18px" }}
								>
									COMPETITIVE POSITION
								</h3>
								<DataSourceIndicator className="mb-3 bg-black/40 border border-orange-400/30" />
							</div>
							<div className="flex items-center gap-2">
								<div className="flex items-center gap-1">
									<span className="text-sm text-gray-400">X-Axis (Percentile Score):</span>
									<select
										className="bg-black/60 border border-[#D2AC38] text-white text-xs px-2 py-1 rounded font-light focus:border-[#D2AC38] focus:outline-none"
										style={{
											fontFamily: "system-ui, -apple-system, sans-serif",
										}}
										value={xAxisMetric}
										onChange={(e) => onXAxisMetricChange(e.target.value)}
									>
										<option value="composite_score">Composite</option>
										<option value="awards_captured">
											Awards Captured (TTM)
										</option>
										<option value="revenue">Revenue (TTM)</option>
										<option value="pipeline_value">
											Calculated Pipeline
										</option>
										<option value="portfolio_duration">
											Portfolio Duration
										</option>
										<option value="blended_growth">Blended Growth</option>
									</select>
								</div>
								<div className="flex items-center gap-1">
									<span className="text-sm text-gray-400">Y-Axis (Value):</span>
									<select
										className="bg-black/60 border border-[#D2AC38] text-white text-xs px-2 py-1 rounded font-light focus:border-[#D2AC38] focus:outline-none"
										style={{
											fontFamily: "system-ui, -apple-system, sans-serif",
										}}
										value={yAxisMetric}
										onChange={(e) => onYAxisMetricChange(e.target.value)}
									>
										<option value="ttm_awards">Awards Captured (TTM)</option>
										<option value="ttm_revenue">Revenue (TTM)</option>
										<option value="lifetime_awards">Lifetime Awards</option>
										<option value="lifetime_revenue">Lifetime Revenue</option>
										<option value="calculated_pipeline">
											Calculated Pipeline
										</option>
										<option value="portfolio_duration">
											Portfolio Duration
										</option>
										<option value="blended_growth">Blended Growth Rate</option>
									</select>
								</div>
							</div>
						</div>
						<div className="flex-1">
							<GoldengateBubbleChart
								title={getChartTitle(yAxisMetric, xAxisMetric)}
								liveIndicator={true}
								liveText="TRACKING"
								height={350}
								data={generateBubbleChartData()}
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										legend: {
											display: true,
											position: "bottom" as const,
											labels: {
												color: "#D2AC38",
												font: { family: "sans-serif", size: 12 },
												usePointStyle: true,
												padding: 10,
												pointStyle: "circle",
												boxWidth: 6,
												boxHeight: 6,
											},
										},
										tooltip: {
											enabled: false,
											external: (context: any) => {
												// Get or create tooltip element
												let tooltipEl = document.getElementById(
													"chartjs-tooltip-competitive",
												);

												if (!tooltipEl) {
													tooltipEl = document.createElement("div");
													tooltipEl.id = "chartjs-tooltip-competitive";
													tooltipEl.style.cssText = `
                            background: rgba(0, 0, 0, 0.95);
                            border-radius: 6px;
                            color: white;
                            opacity: 1;
                            pointer-events: auto;
                            position: absolute;
                            transform: translate(-50%, 0);
                            transition: all .1s ease;
                            font-family: system-ui, -apple-system, sans-serif;
                            font-size: 12px;
                            padding: 8px 12px;
                            z-index: 9999;
                            min-width: 200px;
                          `;

													// Add event listeners to keep tooltip visible when hovering
													tooltipEl.addEventListener("mouseenter", () => {
														tooltipEl.style.opacity = "1";
													});

													tooltipEl.addEventListener("mouseleave", () => {
														tooltipEl.style.opacity = "0";
													});
													document.body.appendChild(tooltipEl);
												}

												// Hide if no tooltip
												const tooltipModel = context.tooltip;
												if (tooltipModel.opacity === 0) {
													tooltipEl.style.opacity = "0";
													return;
												}

												// Get data
												if (tooltipModel.body) {
													const datasetIndex =
														tooltipModel.dataPoints[0].datasetIndex;
													const datasetLabel =
														context.chart.data.datasets[datasetIndex].label;
													const isPeerEntity = datasetLabel === "Peer Entities";

													const entityName = isPeerEntity
														? "Peer Entity"
														: datasetLabel;
													const uei = isPeerEntity
														? `PEER${Math.floor(Math.random() * 100000)}`
														: "TFL123456789";

													// Set border color to match the dot color
													const borderColor = isPeerEntity
														? "#FF4444"
														: "#D2AC38";
													tooltipEl.style.border = `1px solid ${borderColor}`;

													const xAxisLabel = getXAxisTitle(xAxisMetric);
													const yAxisLabel = getYAxisTitle(yAxisMetric);
													const xValue = Math.round(
														tooltipModel.dataPoints[0].parsed.x,
													);

													// Format Y-value based on metric type
													let yValue;
													if (yAxisMetric === "portfolio_duration") {
														yValue = `${tooltipModel.dataPoints[0].parsed.y.toFixed(1)} yrs`;
													} else if (yAxisMetric === "blended_growth") {
														yValue = `${tooltipModel.dataPoints[0].parsed.y.toFixed(1)}%`;
													} else {
														yValue = `$${Math.round(tooltipModel.dataPoints[0].parsed.y)}M`;
													}

													// Set colors based on entity type
													const xValueColor = isPeerEntity
														? "#FF4444"
														: "#FFFFFF";
													const yValueColor = "#D2AC38";

													const clickableStyle = isPeerEntity
														? "cursor: pointer; text-decoration: underline;"
														: "";
													const clickHandler = isPeerEntity
														? `onclick="window.location.href='/contractor-detail/${uei}'"`
														: "";

													tooltipEl.innerHTML = `
                            <div style="font-weight: bold; margin-bottom: 6px; color: #D2AC38; ${clickableStyle}" ${clickHandler}>${entityName}</div>
                            <div style="color: #9CA3AF; font-size: 10px; margin-bottom: 8px;">${uei}</div>
                            <div style="font-size: 11px;">
                              <div style="margin-bottom: 2px; display: flex; justify-content: space-between;"><span>${xAxisLabel}:</span> <span style="color: ${xValueColor}; font-weight: bold;">${xValue}</span></div>
                              <div style="display: flex; justify-content: space-between;"><span>${yAxisLabel}:</span> <span style="color: ${yValueColor}; font-weight: bold;">${yValue}</span></div>
                            </div>
                          `;
												}

												const position =
													context.chart.canvas.getBoundingClientRect();

												tooltipEl.style.opacity = "1";
												tooltipEl.style.left = `${
													position.left +
													window.pageXOffset +
													tooltipModel.caretX
												}px`;
												tooltipEl.style.top = `${
													position.top +
													window.pageYOffset +
													tooltipModel.caretY
												}px`;
											},
										},
									},
									scales: {
										x: {
											type: "linear" as const,
											position: "bottom" as const,
											title: {
												display: true,
												text: "Percentile Score",
												color: "#9CA3AF",
												font: { size: 12 },
											},
											ticks: {
												color: "#D2AC38",
												font: { size: 10 },
											},
											grid: {
												color: "rgba(255, 255, 255, 0.1)",
												drawBorder: false,
											},
										},
										y: {
											type: "linear" as const,
											title: {
												display: true,
												text: "Value",
												color: "#9CA3AF",
												font: { size: 12 },
											},
											ticks: {
												color: "#D2AC38",
												font: { size: 10 },
												callback: (value: any) => {
													if (yAxisMetric === "portfolio_duration") {
														return `${value.toFixed(1)} yrs`;
													}
													if (yAxisMetric === "blended_growth") {
														return `${value.toFixed(1)}%`;
													}
													return `$${Math.round(value)}M`;
												},
											},
											grid: {
												color: "rgba(255, 255, 255, 0.1)",
												drawBorder: false,
											},
										},
									},
								}}
							/>
						</div>
					</div>
				</Card>
			</div>

			{/* Expandable Data Table */}
			<div className="mt-4">
				<Card
					className="rounded-xl overflow-hidden shadow-2xl transition-all duration-500 border border-[#D2AC38]/50 hover:border-[#D2AC38]/90"
					style={{ backgroundColor: "#111726" }}
				>
					<div className="p-4">
						<button
							onClick={() => setIsTableExpanded(!isTableExpanded)}
							className="w-full flex items-center justify-between text-left focus:outline-none group"
						>
							<h3
								className="font-bold tracking-wide text-gray-200 uppercase group-hover:text-[#D2AC38] transition-colors"
								style={{ fontFamily: "Genos, sans-serif", fontSize: "18px" }}
							>
								Competitive Data ({peerGroupData?.groupSize || 0} Entities)
							</h3>
							<div className="flex items-center gap-2">
								<span className="text-xs text-gray-400 uppercase tracking-wider">
									{isTableExpanded ? "COLLAPSE" : "EXPAND"}
								</span>
								{isTableExpanded ? (
									<ChevronUp className="w-4 h-4 text-[#D2AC38]" />
								) : (
									<ChevronDown className="w-4 h-4 text-[#D2AC38]" />
								)}
							</div>
						</button>

						{isTableExpanded && (
							<div className="mt-4 overflow-hidden rounded-lg" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead className="bg-black/40">
											<tr>
												<th className="px-4 py-2 text-left">
													<button
														onClick={() => handleSort('name')}
														className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400 hover:text-[#D2AC38] transition-colors focus:outline-none"
														style={{ fontFamily: "Genos, sans-serif" }}
													>
														Contractor Name
														{sortConfig.key === 'name' ? (
															sortConfig.direction === 'asc' ? (
																<ChevronUp className="w-3 h-3" />
															) : (
																<ChevronDown className="w-3 h-3" />
															)
														) : (
															<ArrowUpDown className="w-3 h-3 opacity-50" />
														)}
													</button>
												</th>
												<th className="px-4 py-2 text-left">
													<button
														onClick={() => handleSort('uei')}
														className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400 hover:text-[#D2AC38] transition-colors focus:outline-none"
														style={{ fontFamily: "Genos, sans-serif" }}
													>
														UEI
														{sortConfig.key === 'uei' ? (
															sortConfig.direction === 'asc' ? (
																<ChevronUp className="w-3 h-3" />
															) : (
																<ChevronDown className="w-3 h-3" />
															)
														) : (
															<ArrowUpDown className="w-3 h-3 opacity-50" />
														)}
													</button>
												</th>
												<th className="px-4 py-2 text-left">
													<button
														onClick={() => handleSort('xScore')}
														className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400 hover:text-[#D2AC38] transition-colors focus:outline-none"
														style={{ fontFamily: "Genos, sans-serif" }}
													>
														{getXAxisTitle(xAxisMetric)} Score
														{sortConfig.key === 'xScore' ? (
															sortConfig.direction === 'asc' ? (
																<ChevronUp className="w-3 h-3" />
															) : (
																<ChevronDown className="w-3 h-3" />
															)
														) : (
															<ArrowUpDown className="w-3 h-3 opacity-50" />
														)}
													</button>
												</th>
												<th className="px-4 py-2 text-left">
													<button
														onClick={() => handleSort('yValue')}
														className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400 hover:text-[#D2AC38] transition-colors focus:outline-none"
														style={{ fontFamily: "Genos, sans-serif" }}
													>
														{getYAxisTitle(yAxisMetric)}
														{sortConfig.key === 'yValue' ? (
															sortConfig.direction === 'asc' ? (
																<ChevronUp className="w-3 h-3" />
															) : (
																<ChevronDown className="w-3 h-3" />
															)
														) : (
															<ArrowUpDown className="w-3 h-3 opacity-50" />
														)}
													</button>
												</th>
											</tr>
										</thead>
										<tbody>
											{getTableData().map((contractor, index) => (
												<tr
													key={contractor.uei}
													className={`border-b border-gray-700/30 hover:bg-black/30 transition-colors ${
														contractor.isSubject
															? "bg-[#D2AC38]/20 border-[#D2AC38]/30"
															: index % 2 === 0
																? "bg-gray-800/30"
																: "bg-gray-700/30"
													}`}
													style={{
														fontFamily: "system-ui, -apple-system, sans-serif"
													}}
												>
													<td className="px-4 py-2">
														<span className={`text-sm ${
															contractor.isSubject
																? "text-[#D2AC38] font-medium"
																: "text-white"
														}`}
														style={{
															fontFamily: "system-ui, -apple-system, sans-serif"
														}}>
															{contractor.name}
														</span>
													</td>
													<td className="px-4 py-2">
														<span className={`text-sm ${
															contractor.isSubject
																? "text-[#D2AC38] font-medium"
																: "text-gray-300"
														}`}
														style={{
															fontFamily: "system-ui, -apple-system, sans-serif"
														}}>
															{contractor.uei}
														</span>
													</td>
													<td className="px-4 py-2">
														<span className={`text-sm ${
															contractor.isSubject
																? "text-[#D2AC38] font-medium"
																: "text-white font-medium"
														}`}
														style={{
															fontFamily: "system-ui, -apple-system, sans-serif"
														}}>
															{contractor.xScore}
														</span>
													</td>
													<td className="px-4 py-2">
														<span className={`text-sm ${
															contractor.isSubject
																? "text-[#D2AC38] font-medium"
																: "text-white font-medium"
														}`}
														style={{
															fontFamily: "system-ui, -apple-system, sans-serif"
														}}>
															{formatYValue(contractor.yValue)}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}
					</div>
				</Card>
			</div>
		</div>
	);
}
