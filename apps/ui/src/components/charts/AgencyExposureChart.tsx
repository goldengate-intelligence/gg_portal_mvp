import { AlertTriangle, Building } from "lucide-react";
import React from "react";
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	Treemap,
} from "recharts";
import { Badge } from "../ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";

interface AgencyData {
	name: string;
	value: number;
	contracts: number;
	growth: number;
}

interface AgencyExposureChartProps {
	data: AgencyData[];
	viewType?: "pie" | "treemap";
	showRiskIndicator?: boolean;
}

export function AgencyExposureChart({
	data,
	viewType = "pie",
	showRiskIndicator = true,
}: AgencyExposureChartProps) {
	const COLORS = [
		"#d2ac38", // Yellow (primary)
		"#3b82f6", // Blue
		"#10b981", // Green
		"#f59e0b", // Orange
		"#8b5cf6", // Purple
		"#ef4444", // Red
		"#06b6d4", // Cyan
		"#ec4899", // Pink
	];

	const totalValue = data.reduce((sum, item) => sum + item.value, 0);
	const topAgency = data.sort((a, b) => b.value - a.value)[0];
	const concentrationRisk = (topAgency.value / totalValue) * 100;

	const getRiskLevel = () => {
		if (concentrationRisk > 50)
			return { level: "high", color: "text-red-500", badge: "destructive" };
		if (concentrationRisk > 35)
			return { level: "medium", color: "text-yellow-500", badge: "warning" };
		return { level: "low", color: "text-green-500", badge: "success" };
	};

	const risk = getRiskLevel();

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			notation: "compact",
			maximumFractionDigits: 1,
		}).format(value);
	};

	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			const percentage = ((data.value / totalValue) * 100).toFixed(1);
			return (
				<div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
					<p className="text-sm font-medium text-white mb-2">{data.name}</p>
					<div className="space-y-1 text-xs">
						<div className="flex justify-between gap-4">
							<span className="text-gray-400">Value:</span>
							<span className="font-medium text-white">
								{formatCurrency(data.value)}
							</span>
						</div>
						<div className="flex justify-between gap-4">
							<span className="text-gray-400">Share:</span>
							<span className="font-medium text-yellow-500">{percentage}%</span>
						</div>
						<div className="flex justify-between gap-4">
							<span className="text-gray-400">Contracts:</span>
							<span className="font-medium text-white">{data.contracts}</span>
						</div>
						{data.growth !== undefined && (
							<div className="flex justify-between gap-4">
								<span className="text-gray-400">Growth:</span>
								<span
									className={`font-medium ${data.growth > 0 ? "text-green-500" : "text-red-500"}`}
								>
									{data.growth > 0 ? "+" : ""}
									{data.growth}%
								</span>
							</div>
						)}
					</div>
				</div>
			);
		}
		return null;
	};

	const CustomTreemapContent = (props: any) => {
		const { x, y, width, height, name, value, index } = props;
		const percentage = ((value / totalValue) * 100).toFixed(1);

		return (
			<g>
				<rect
					x={x}
					y={y}
					width={width}
					height={height}
					style={{
						fill: COLORS[index % COLORS.length],
						stroke: "#1f2937",
						strokeWidth: 2,
						strokeOpacity: 1,
					}}
				/>
				{width > 50 && height > 50 && (
					<>
						<text
							x={x + width / 2}
							y={y + height / 2 - 10}
							textAnchor="middle"
							fill="#fff"
							fontSize={12}
							fontWeight="bold"
						>
							{name}
						</text>
						<text
							x={x + width / 2}
							y={y + height / 2 + 5}
							textAnchor="middle"
							fill="#d1d5db"
							fontSize={10}
						>
							{percentage}%
						</text>
						<text
							x={x + width / 2}
							y={y + height / 2 + 20}
							textAnchor="middle"
							fill="#9ca3af"
							fontSize={9}
						>
							{formatCurrency(value)}
						</text>
					</>
				)}
			</g>
		);
	};

	const renderLabel = (entry: any) => {
		const percentage = ((entry.value / totalValue) * 100).toFixed(1);
		if (Number.parseFloat(percentage) < 5) return null;
		return `${entry.name} (${percentage}%)`;
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Agency Exposure Distribution</CardTitle>
						<CardDescription>
							Contract value distribution across agencies
						</CardDescription>
					</div>
					{showRiskIndicator && (
						<div className="flex items-center gap-2">
							<AlertTriangle className={`h-4 w-4 ${risk.color}`} />
							<Badge variant={risk.badge as any}>
								{risk.level.toUpperCase()} RISK
							</Badge>
						</div>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{viewType === "pie" ? (
					<ResponsiveContainer width="100%" height={400}>
						<PieChart>
							<Pie
								data={data}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={renderLabel}
								outerRadius={120}
								fill="#8884d8"
								dataKey="value"
							>
								{data.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip content={<CustomTooltip />} />
							<Legend
								verticalAlign="bottom"
								height={36}
								formatter={(value: string) => {
									const item = data.find((d) => d.name === value);
									const percentage = item
										? ((item.value / totalValue) * 100).toFixed(1)
										: "0";
									return `${value} (${percentage}%)`;
								}}
								wrapperStyle={{ fontSize: 11 }}
							/>
						</PieChart>
					</ResponsiveContainer>
				) : (
					<ResponsiveContainer width="100%" height={400}>
						<Treemap
							data={data as any}
							dataKey="value"
							aspectRatio={4 / 3}
							stroke="#1f2937"
							content={<CustomTreemapContent />}
						>
							<Tooltip content={<CustomTooltip />} />
						</Treemap>
					</ResponsiveContainer>
				)}

				<div className="mt-6 space-y-3">
					<div className="grid grid-cols-2 gap-4">
						<div className="p-3 bg-gray-800 rounded-lg">
							<div className="flex items-center gap-2 mb-1">
								<Building className="h-4 w-4 text-yellow-500" />
								<p className="text-xs text-gray-400">Top Agency</p>
							</div>
							<p className="text-sm font-semibold text-white">
								{topAgency.name}
							</p>
							<p className="text-xs text-gray-400 mt-1">
								{formatCurrency(topAgency.value)} (
								{concentrationRisk.toFixed(1)}%)
							</p>
						</div>
						<div className="p-3 bg-gray-800 rounded-lg">
							<div className="flex items-center gap-2 mb-1">
								<AlertTriangle className={`h-4 w-4 ${risk.color}`} />
								<p className="text-xs text-gray-400">Concentration Risk</p>
							</div>
							<p className={`text-sm font-semibold capitalize ${risk.color}`}>
								{risk.level}
							</p>
							<p className="text-xs text-gray-400 mt-1">
								{concentrationRisk.toFixed(1)}% in top agency
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<p className="text-xs text-gray-400 uppercase tracking-wide">
							Top 3 Agencies
						</p>
						{data.slice(0, 3).map((agency, index) => {
							const percentage = ((agency.value / totalValue) * 100).toFixed(1);
							return (
								<div
									key={agency.name}
									className="flex items-center justify-between p-2 bg-gray-800/50 rounded"
								>
									<div className="flex items-center gap-2">
										<div
											className="w-3 h-3 rounded-full"
											style={{ backgroundColor: COLORS[index] }}
										/>
										<span className="text-sm text-white">{agency.name}</span>
									</div>
									<div className="flex items-center gap-3">
										<span className="text-xs text-gray-400">
											{agency.contracts} contracts
										</span>
										<Badge variant="outline" className="text-xs">
											{percentage}%
										</Badge>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
