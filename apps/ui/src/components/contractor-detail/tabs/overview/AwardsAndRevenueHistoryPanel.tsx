import React from "react";
import { useDesignPatterns } from "../../../../hooks/useDesignPatterns";
import { CONTRACTOR_DETAIL_COLORS } from "../../../../logic/utils";
import { GoldengateBarChart } from "../../../../ui/charts/components";
import { Card } from "../../../ui/card";
import type { MonthlyMetricsData } from "../../services/unified-data-adapter";

interface AwardsAndRevenueHistoryPanelProps {
	revenueTimeAggregation: string;
	revenueTimePeriod: string;
	onRevenueTimeAggregationChange: (value: string) => void;
	onRevenueTimePeriodChange: (value: string) => void;
	monthlyHistory: MonthlyMetricsData[];
	isLoading?: boolean;
}

export function AwardsAndRevenueHistoryPanel({
	revenueTimeAggregation,
	revenueTimePeriod,
	onRevenueTimeAggregationChange,
	onRevenueTimePeriodChange,
	monthlyHistory,
	isLoading,
}: AwardsAndRevenueHistoryPanelProps) {
	const { Typography, PanelWrapper } = useDesignPatterns();

	// Filter and format monthly data based on time period
	const getFilteredMonthlyData = () => {
		if (!monthlyHistory?.length) return { labels: [], awards: [], revenue: [] };

		// Filter by time period (years back from current date)
		const yearsBack = Number.parseInt(revenueTimePeriod);
		const cutoffDate = new Date();
		cutoffDate.setFullYear(cutoffDate.getFullYear() - yearsBack);

		const filtered = monthlyHistory.filter(data => {
			const dataDate = new Date(data.snapshot_month + '-01');
			return dataDate >= cutoffDate;
		});

		// Format labels and extract data
		const labels = filtered.map(data => {
			const [year, month] = data.snapshot_month.split('-');
			const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
			return date.toLocaleDateString('en-US', {
				month: 'short',
				year: revenueTimeAggregation === 'Y' ? 'numeric' : '2-digit'
			});
		});

		const awards = filtered.map(data => data.awards_monthly_millions || 0);
		const revenue = filtered.map(data => data.revenue_monthly_millions || 0);

		return { labels, awards, revenue };
	};

	const chartData = getFilteredMonthlyData();


	return (
		<Card
			className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative border border-[#D2AC38]/50 hover:border-[#D2AC38]/90"
			style={{ backgroundColor: "#111726" }}
		>
			<div className="p-4 h-full flex flex-col relative z-10">
				<div className="flex items-center justify-between mb-4">
					<h3
						className="font-bold tracking-wide text-gray-200 uppercase"
						style={{ fontFamily: "Genos, sans-serif", fontSize: "18px" }}
					>
						AWARDS & REVENUE HISTORY ({revenueTimePeriod}Y)
					</h3>
					<div className="flex items-center gap-2">
						<select
							className="bg-black/60 border border-[#D2AC38] text-white text-xs px-2 py-1 rounded font-light focus:border-[#D2AC38] focus:outline-none"
							style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							value={revenueTimeAggregation}
							onChange={(e) => onRevenueTimeAggregationChange(e.target.value)}
						>
							<option value="M">Month</option>
							<option value="Q">Quarter</option>
							<option value="Y">Year</option>
						</select>
						<select
							className="bg-black/60 border border-[#D2AC38] text-white text-xs px-2 py-1 rounded font-light focus:border-[#D2AC38] focus:outline-none"
							style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							value={revenueTimePeriod}
							onChange={(e) => onRevenueTimePeriodChange(e.target.value)}
						>
							<option value="1">1 Year</option>
							<option value="2">2 Years</option>
							<option value="3">3 Years</option>
							<option value="5">5 Years</option>
						</select>
					</div>
				</div>

				<div className="flex-1">
					<GoldengateBarChart
						title="Lifetime Activity"
						liveIndicator={true}
						liveText="TRACKING"
						height={280}
						data={{
							labels: chartData.labels,
							datasets: [
								{
									type: "bar" as const,
									label: "Award Value  ",
									data: chartData.awards,
									backgroundColor: "rgba(78, 201, 176, 0.7)",
									borderColor: "#4EC9B0",
									borderWidth: 2,
									yAxisID: "y",
								},
								{
									type: "line" as const,
									label: "Smoothed Revenue",
									data: chartData.revenue,
									backgroundColor: "rgba(210, 172, 56, 0.4)",
									borderColor: "#D2AC38",
									borderWidth: 2,
									fill: false,
									tension: 0.4,
									pointBackgroundColor: "#D2AC38",
									pointBorderColor: "#D2AC38",
									pointRadius: 4,
									yAxisID: "y",
								},
							],
						}}
						options={{
							responsive: true,
							maintainAspectRatio: false,
							elements: {
								line: {
									borderWidth: 0,
								},
							},
							layout: {
								padding: {
									left: 5,
									right: 5,
									top: -10,
									bottom: -10,
								},
							},
							interaction: {
								mode: "index" as const,
								intersect: false,
							},
							plugins: {
								legend: {
									display: true,
									position: "bottom" as const,
									labels: {
										color: "#D2AC38",
										font: { size: 12 },
										padding: 2,
										boxWidth: 4,
										boxHeight: 4,
										usePointStyle: true,
									},
								},
								tooltip: {
									enabled: false, // Disable default tooltip since we're using external
									// Use external tooltip for full HTML control
									external: (context: any) => {
										// Get or create tooltip element
										let tooltipEl = document.getElementById("chartjs-tooltip");

										if (!tooltipEl) {
											tooltipEl = document.createElement("div");
											tooltipEl.id = "chartjs-tooltip";
											tooltipEl.style.cssText = `
                        background: rgba(0, 0, 0, 0.95);
                        border: 1px solid #374151;
                        border-radius: 6px;
                        color: white;
                        opacity: 1;
                        pointer-events: none;
                        position: absolute;
                        transform: translate(-50%, 0);
                        transition: all .1s ease;
                        font-family: system-ui, -apple-system, sans-serif;
                        font-size: 12px;
                        padding: 10px;
                        min-width: 200px;
                        z-index: 9999;
                      `;
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
											const dataPoints = tooltipModel.dataPoints;
											const awards = dataPoints[0]?.parsed.y || 0;
											const revenue = dataPoints[1]?.parsed.y || 0;
											const date = dataPoints[0]?.label || "";

											// Build HTML with aligned columns using monospace font
											const innerHtml = `
                        <div style="margin-bottom: 8px; color: #9CA3AF; font-size: 11px; border-bottom: 1px solid #374151; padding-bottom: 6px;">
                          ${date}
                        </div>
                        <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 11px;">
                          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                            <span style="color: #4EC9B0;">Awards Captured:</span>
                            <span style="color: #4EC9B0; font-weight: bold;">$${awards.toFixed(1)}M</span>
                          </div>
                          <div style="display: flex; justify-content: space-between;">
                            <span style="color: #D2AC38;">Revenue Recognized:</span>
                            <span style="color: #D2AC38; font-weight: bold;">$${revenue.toFixed(1)}M</span>
                          </div>
                        </div>
                      `;

											tooltipEl.innerHTML = innerHtml;
										}

										// Position tooltip
										const position =
											context.chart.canvas.getBoundingClientRect();
										const bodyFont = tooltipModel.options.bodyFont;

										tooltipEl.style.opacity = "1";
										tooltipEl.style.left = `${
											position.left + window.pageXOffset + tooltipModel.caretX
										}px`;
										tooltipEl.style.top = `${
											position.top + window.pageYOffset + tooltipModel.caretY
										}px`;
									},
								},
							},
							scales: {
								x: {
									display: true,
									border: {
										display: false,
									},
									ticks: {
										color: "#D2AC38",
										font: {
											family: "system-ui, -apple-system, sans-serif",
											size: 10,
										},
										maxRotation: 0,
									},
									grid: {
										color: "rgba(192, 192, 192, 0.3)",
										drawBorder: false,
										borderColor: "transparent",
										borderWidth: 0,
									},
								},
								y: {
									type: "linear" as const,
									display: true,
									position: "left" as const,
									border: {
										display: false,
									},
									ticks: {
										color: "#D2AC38",
										font: {
											family: "system-ui, -apple-system, sans-serif",
											size: 10,
										},
										callback: (value: any) => `$${value}M`,
									},
									grid: {
										color: "rgba(192, 192, 192, 0.3)",
										drawBorder: false,
										borderColor: "transparent",
										borderWidth: 0,
									},
								},
							},
						}}
					/>
				</div>
			</div>
		</Card>
	);
}
