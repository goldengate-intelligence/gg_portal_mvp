import React from "react";
import { useDesignPatterns } from "../../../../hooks/useDesignPatterns";
import { CONTRACTOR_DETAIL_COLORS } from "../../../../logic/utils";
import { GoldengateBarChart } from "../../../../ui/charts/components";
import { Card } from "../../../ui/card";
import type { ActivityEvent } from "../network/types";
import type { UniversalMetrics } from "../../services/unified-data-adapter";

interface TopRelationshipsPanelProps {
	activityEvents: ActivityEvent[];
	metrics: UniversalMetrics;
	isLoading?: boolean;
}

export function TopRelationshipsPanel({
	activityEvents,
	metrics,
	isLoading,
}: TopRelationshipsPanelProps) {
	const { Typography, PanelWrapper } = useDesignPatterns();

	// Calculate top 3 inflow relationships based on lifetime dollars
	const getTopInflowRelationships = () => {
		if (!activityEvents?.length) return [];

		const inflowTotals = new Map<string, { name: string; total: number; type: string }>();

		activityEvents.forEach(event => {
			if (event.FLOW_DIRECTION === 'INFLOW' && event.RELATED_ENTITY_NAME && event.EVENT_AMOUNT) {
				const name = event.RELATED_ENTITY_NAME;
				const current = inflowTotals.get(name) || { name, total: 0, type: event.RELATED_ENTITY_TYPE || 'UNKNOWN' };
				current.total += event.EVENT_AMOUNT;
				inflowTotals.set(name, current);
			}
		});

		return Array.from(inflowTotals.values())
			.sort((a, b) => b.total - a.total)
			.slice(0, 3);
	};

	// Calculate top 3 outflow relationships based on lifetime dollars
	const getTopOutflowRelationships = () => {
		if (!activityEvents?.length) return [];

		const outflowTotals = new Map<string, { name: string; total: number; type: string }>();

		activityEvents.forEach(event => {
			if (event.FLOW_DIRECTION === 'OUTFLOW' && event.RELATED_ENTITY_NAME && event.EVENT_AMOUNT) {
				const name = event.RELATED_ENTITY_NAME;
				const current = outflowTotals.get(name) || { name, total: 0, type: event.RELATED_ENTITY_TYPE || 'UNKNOWN' };
				current.total += event.EVENT_AMOUNT;
				outflowTotals.set(name, current);
			}
		});

		return Array.from(outflowTotals.values())
			.sort((a, b) => b.total - a.total)
			.slice(0, 3);
	};

	const topInflowRelationships = getTopInflowRelationships();
	const topOutflowRelationships = getTopOutflowRelationships();

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
						TOP RELATIONSHIPS
					</h3>
					{/* Legend */}
					<div className="flex items-center gap-4 text-[10px] text-gray-400">
						<div className="flex items-center gap-1">
							<div
								className="w-2.5 h-2.5 rounded-full"
								style={{ backgroundColor: "#9B7EBD" }}
							/>
							<span>AGENCIES</span>
						</div>
						<div className="flex items-center gap-1">
							<div
								className="w-2.5 h-2.5 rounded-full"
								style={{ backgroundColor: "#5BC0EB" }}
							/>
							<span>PRIMES</span>
						</div>
						<div className="flex items-center gap-1">
							<div
								className="w-2.5 h-2.5 rounded-full"
								style={{ backgroundColor: "#FF4C4C" }}
							/>
							<span>SUBS</span>
						</div>
					</div>
				</div>

				<div className="flex-1 flex gap-2">
					{/* Inflows Chart - Left */}
					<div className="w-1/2">
						<GoldengateBarChart
							title="Lifetime Inflows"
							liveIndicator={true}
							liveText="TRACKING"
							height={280}
							data={{
								labels: topInflowRelationships.length > 0 ? topInflowRelationships.map(rel => {
									// Shorten long names for display
									const name = rel.name;
									if (name.length > 12) {
										return name.split(' ')[0] + (name.split(' ').length > 1 ? ' ' + name.split(' ')[1].substring(0, 3) : '');
									}
									return name;
								}) : ['--'],
								datasets: [
									{
										label: "Value ($M)",
										data: topInflowRelationships.length > 0 ? topInflowRelationships.map(rel => rel.total / 1000000) : [0],
										backgroundColor: (context: any) => {
											const label =
												context.chart.data.labels[context.dataIndex];
											// Agencies get lavender, companies get sky blue
											if (
												label === "DOD" ||
												label === "GSA" ||
												label === "VA" ||
												label === "NASA" ||
												label === "DHS"
											) {
												return "rgba(155, 126, 189, 0.7)"; // Lavender for agencies
											}
											return "rgba(91, 192, 235, 0.7)"; // Sky blue for companies
										},
										borderColor: (context: any) => {
											const label =
												context.chart.data.labels[context.dataIndex];
											if (
												label === "DOD" ||
												label === "GSA" ||
												label === "VA" ||
												label === "NASA" ||
												label === "DHS"
											) {
												return "#9B7EBD"; // Lavender for agencies
											}
											return "#5BC0EB"; // Sky blue for companies
										},
										borderWidth: 2,
									},
								],
							}}
							options={{
								responsive: true,
								maintainAspectRatio: false,
								layout: {
									padding: {
										left: 5,
										right: 5,
										top: -10,
										bottom: 0,
									},
								},
								plugins: {
									legend: { display: false },
									tooltip: {
										enabled: false,
										external: (context: any) => {
											// Get or create tooltip element
											let tooltipEl = document.getElementById(
												"chartjs-tooltip-inflows",
											);

											if (!tooltipEl) {
												tooltipEl = document.createElement("div");
												tooltipEl.id = "chartjs-tooltip-inflows";
												tooltipEl.style.cssText = `
                          background: rgba(0, 0, 0, 0.95);
                          border-radius: 6px;
                          color: white;
                          opacity: 1;
                          pointer-events: none;
                          position: absolute;
                          transform: translate(-50%, 0);
                          transition: all .1s ease;
                          font-family: system-ui, -apple-system, sans-serif;
                          font-size: 12px;
                          padding: 8px 12px;
                          z-index: 9999;
                          min-width: 140px;
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
												const dataIndex = tooltipModel.dataPoints[0].dataIndex;
												const label = tooltipModel.dataPoints[0].label;
												const value = tooltipModel.dataPoints[0].parsed.y;

												// Determine border color based on bar type
												const borderColor =
													label === "DOD" ||
													label === "GSA" ||
													label === "VA" ||
													label === "NASA" ||
													label === "DHS"
														? "#9B7EBD"
														: "#5BC0EB";
												tooltipEl.style.border = `1px solid ${borderColor}`;

												// Full names for companies/agencies
												const fullNames: Record<string, string> = {
													MegaCorp: "MegaCorp Industries",
													DOD: "Department of Defense",
													"Global Def": "Global Defense Systems",
												};

												const startDates: Record<string, string> = {
													MegaCorp: "2019",
													DOD: "2018",
													"Global Def": "2020",
												};

												const fullName = fullNames[label] || label;

												tooltipEl.innerHTML = `
                          <div style="font-weight: bold; margin-bottom: 4px;">${fullName}</div>
                          <div style="color: #9CA3AF; font-size: 11px;">
                            $${Math.round(value)}M | Since ${startDates[label] || "2021"}
                          </div>
                        `;
											}

											const position =
												context.chart.canvas.getBoundingClientRect();

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
										ticks: {
											color: "#D2AC38",
											font: { size: 8 },
											maxRotation: 0,
											minRotation: 0,
											autoSkip: false,
										},
										grid: { color: "rgba(192, 192, 192, 0.3)" },
										border: { display: false },
									},
									y: {
										ticks: {
											color: "#D2AC38",
											font: { size: 10 },
											callback: (value: any) => `$${Math.round(value)}M`,
										},
										grid: { color: "rgba(255, 255, 255, 0.1)" },
										border: { display: false },
									},
								},
							}}
						/>
					</div>

					{/* Outflows Chart - Right */}
					<div className="w-1/2">
						<GoldengateBarChart
							title="Lifetime Outflows"
							liveIndicator={true}
							liveText="TRACKING"
							height={280}
							data={{
								labels: topOutflowRelationships.length > 0 ? topOutflowRelationships.map(rel => {
									// Shorten long names for display
									const name = rel.name;
									if (name.length > 12) {
										return name.split(' ')[0] + (name.split(' ').length > 1 ? ' ' + name.split(' ')[1].substring(0, 3) : '');
									}
									return name;
								}) : ['--'],
								datasets: [
									{
										label: "Value ($M)",
										data: topOutflowRelationships.length > 0 ? topOutflowRelationships.map(rel => rel.total / 1000000) : [0],
										backgroundColor: "rgba(255, 76, 76, 0.7)", // Red for outflows
										borderColor: "#FF4C4C",
										borderWidth: 2,
									},
								],
							}}
							options={{
								responsive: true,
								maintainAspectRatio: false,
								layout: {
									padding: {
										left: 5,
										right: 5,
										top: -10,
										bottom: 0,
									},
								},
								plugins: {
									legend: { display: false },
									tooltip: {
										enabled: false,
										external: (context: any) => {
											// Get or create tooltip element
											let tooltipEl = document.getElementById(
												"chartjs-tooltip-outflows",
											);

											if (!tooltipEl) {
												tooltipEl = document.createElement("div");
												tooltipEl.id = "chartjs-tooltip-outflows";
												tooltipEl.style.cssText = `
                          background: rgba(0, 0, 0, 0.95);
                          border-radius: 6px;
                          color: white;
                          opacity: 1;
                          pointer-events: none;
                          position: absolute;
                          transform: translate(-50%, 0);
                          transition: all .1s ease;
                          font-family: system-ui, -apple-system, sans-serif;
                          font-size: 12px;
                          padding: 8px 12px;
                          z-index: 9999;
                          min-width: 140px;
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
												const dataIndex = tooltipModel.dataPoints[0].dataIndex;
												const label = tooltipModel.dataPoints[0].label;
												const value = tooltipModel.dataPoints[0].parsed.y;

												// Set border color for outflows (always red)
												tooltipEl.style.border = "1px solid #FF4C4C";

												// Full names for subcontractors
												const fullNames: Record<string, string> = {
													"Alpha Sol": "Alpha Solutions LLC",
													"Beta Tech": "Beta Technologies Inc",
													Gamma: "Gamma Corporation",
												};

												const startDates: Record<string, string> = {
													"Alpha Sol": "2020",
													"Beta Tech": "2021",
													Gamma: "2019",
												};

												const fullName = fullNames[label] || label;

												tooltipEl.innerHTML = `
                          <div style="font-weight: bold; margin-bottom: 4px;">${fullName}</div>
                          <div style="color: #9CA3AF; font-size: 11px;">
                            $${Math.round(value)}M | Since ${startDates[label] || "2021"}
                          </div>
                        `;
											}

											const position =
												context.chart.canvas.getBoundingClientRect();

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
										ticks: {
											color: "#D2AC38",
											font: { size: 8 },
											maxRotation: 0,
											minRotation: 0,
											autoSkip: false,
										},
										grid: { color: "rgba(192, 192, 192, 0.3)" },
										border: { display: false },
									},
									y: {
										ticks: {
											color: "#D2AC38",
											font: { size: 10 },
											callback: (value: any) => `$${Math.round(value)}M`,
										},
										grid: { color: "rgba(255, 255, 255, 0.1)" },
										border: { display: false },
									},
								},
							}}
						/>
					</div>
				</div>
			</div>
		</Card>
	);
}
