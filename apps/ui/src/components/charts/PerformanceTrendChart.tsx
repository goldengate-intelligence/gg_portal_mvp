import {
	Activity,
	DollarSign,
	FileText,
	Minus,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import React, { useMemo } from "react";
import {
	Area,
	AreaChart,
	Bar,
	Brush,
	CartesianGrid,
	ComposedChart,
	Legend,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { formatCurrency } from "../../utils/contractor-profile-transform";
import { Badge } from "../ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";

interface PerformanceDataPoint {
	monthYear: string;
	monthlyRevenue: number;
	activeContracts: number;
	growthRateMom?: number;
	growthRateYoy?: number;
	activityStatus?: string;
	winRate?: number;
	activePipelineValue?: number;
}

interface PerformanceTrendChartProps {
	data: PerformanceDataPoint[];
	summary?: {
		totalRevenue: number;
		avgMonthlyRevenue: number;
		totalContracts: number;
		latestActivityStatus: string;
		growthTrend: number;
	};
	title?: string;
	description?: string;
	height?: number;
	showComparison?: "mom" | "yoy" | "both";
}

export function PerformanceTrendChart({
	data,
	summary,
	title = "Performance Trends",
	description = "36-month contractor performance history",
	height = 400,
	showComparison = "yoy",
}: PerformanceTrendChartProps) {
	// Process data for chart
	const chartData = useMemo(() => {
		return data.map((point) => ({
			month: new Date(point.monthYear).toLocaleDateString("en-US", {
				month: "short",
				year: "2-digit",
			}),
			revenue: Number.parseFloat(point.monthlyRevenue?.toString() || "0"),
			contracts: point.activeContracts || 0,
			growthMoM: point.growthRateMom || 0,
			growthYoY: point.growthRateYoy || 0,
			status: point.activityStatus || "unknown",
			winRate: point.winRate || 0,
			pipeline: Number.parseFloat(point.activePipelineValue?.toString() || "0"),
		}));
	}, [data]);

	// Calculate trend indicators
	const latestGrowth = chartData[chartData.length - 1]?.growthYoY || 0;
	const latestStatus = chartData[chartData.length - 1]?.status || "unknown";

	// Get activity status color
	const getStatusColor = (status: string) => {
		switch (status) {
			case "hot":
				return "#ef4444"; // red
			case "warm":
				return "#f59e0b"; // amber
			case "cold":
				return "#3b82f6"; // blue
			case "dormant":
				return "#6b7280"; // gray
			default:
				return "#9ca3af";
		}
	};

	const getTrendIcon = () => {
		if (latestGrowth > 5)
			return <TrendingUp className="h-4 w-4 text-green-500" />;
		if (latestGrowth < -5)
			return <TrendingDown className="h-4 w-4 text-red-500" />;
		return <Minus className="h-4 w-4 text-yellow-500" />;
	};

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const dataPoint = payload[0].payload;
			return (
				<div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
					<p className="text-sm font-medium text-white mb-2">{label}</p>
					<div className="space-y-1">
						<div className="flex items-center justify-between gap-4 text-xs">
							<span className="text-gray-400">Revenue:</span>
							<span className="font-medium text-yellow-500">
								{formatCurrency(dataPoint.revenue)}
							</span>
						</div>
						<div className="flex items-center justify-between gap-4 text-xs">
							<span className="text-gray-400">Contracts:</span>
							<span className="font-medium text-green-500">
								{dataPoint.contracts}
							</span>
						</div>
						<div className="flex items-center justify-between gap-4 text-xs">
							<span className="text-gray-400">YoY Growth:</span>
							<span
								className={`font-medium ${dataPoint.growthYoY > 0 ? "text-green-400" : "text-red-400"}`}
							>
								{dataPoint.growthYoY > 0 ? "+" : ""}
								{dataPoint.growthYoY.toFixed(1)}%
							</span>
						</div>
						<div className="flex items-center justify-between gap-4 text-xs">
							<span className="text-gray-400">Activity:</span>
							<span
								className="font-medium capitalize"
								style={{ color: getStatusColor(dataPoint.status) }}
							>
								{dataPoint.status}
							</span>
						</div>
						{dataPoint.pipeline > 0 && (
							<div className="flex items-center justify-between gap-4 text-xs">
								<span className="text-gray-400">Pipeline:</span>
								<span className="font-medium text-blue-400">
									{formatCurrency(dataPoint.pipeline)}
								</span>
							</div>
						)}
					</div>
				</div>
			);
		}
		return null;
	};

	// Activity status badge
	const ActivityBadge = ({ status }: { status: string }) => {
		const colors: Record<string, string> = {
			hot: "bg-red-500/20 text-red-400 border-red-500/50",
			warm: "bg-amber-500/20 text-amber-400 border-amber-500/50",
			cold: "bg-blue-500/20 text-blue-400 border-blue-500/50",
			dormant: "bg-gray-500/20 text-gray-400 border-gray-500/50",
			unknown: "bg-gray-700/20 text-gray-500 border-gray-600/50",
		};

		return (
			<Badge
				className={`${colors[status] || colors.unknown} border capitalize`}
			>
				<Activity className="h-3 w-3 mr-1" />
				{status}
			</Badge>
		);
	};

	return (
		<Card className="bg-medium-gray border-yellow-500/20">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-yellow-500 font-aptos">
							{title}
						</CardTitle>
						<CardDescription className="text-gray-400">
							{description}
						</CardDescription>
					</div>
					<div className="flex items-center gap-3">
						<ActivityBadge status={latestStatus} />
						<div className="flex items-center gap-2">
							{getTrendIcon()}
							<Badge
								variant={
									latestGrowth > 0
										? "success"
										: latestGrowth < 0
											? "destructive"
											: "secondary"
								}
								className="font-sans"
							>
								{latestGrowth > 0 ? "+" : ""}
								{latestGrowth.toFixed(1)}% YoY
							</Badge>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={height}>
					<ComposedChart
						data={chartData}
						margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
					>
						<defs>
							<linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#eab308" stopOpacity={0.8} />
								<stop offset="95%" stopColor="#eab308" stopOpacity={0.1} />
							</linearGradient>
							<linearGradient id="pipelineGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
								<stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
						<XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: 12 }} />
						<YAxis
							yAxisId="revenue"
							stroke="#9ca3af"
							style={{ fontSize: 12 }}
							tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
						/>
						<YAxis
							yAxisId="contracts"
							orientation="right"
							stroke="#9ca3af"
							style={{ fontSize: 12 }}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Legend wrapperStyle={{ fontSize: 12 }} iconType="line" />

						{/* Revenue area chart */}
						<Area
							yAxisId="revenue"
							type="monotone"
							dataKey="revenue"
							stroke="#eab308"
							strokeWidth={2}
							fill="url(#revenueGradient)"
							name="Revenue"
						/>

						{/* Contracts bar chart */}
						<Bar
							yAxisId="contracts"
							dataKey="contracts"
							fill="#10b981"
							opacity={0.5}
							name="Active Contracts"
						/>

						{/* Growth rate line */}
						{showComparison === "yoy" || showComparison === "both" ? (
							<Line
								yAxisId="revenue"
								type="monotone"
								dataKey="growthYoY"
								stroke="#ef4444"
								strokeWidth={1}
								strokeDasharray="3 3"
								dot={false}
								name="YoY Growth %"
							/>
						) : null}

						{/* Average reference line */}
						{summary && (
							<ReferenceLine
								yAxisId="revenue"
								y={summary.avgMonthlyRevenue}
								stroke="#6b7280"
								strokeDasharray="5 5"
								label={{
									value: "Avg",
									position: "right",
									fill: "#6b7280",
									fontSize: 10,
								}}
							/>
						)}

						<Brush
							dataKey="month"
							height={30}
							stroke="#374151"
							fill="#1f2937"
						/>
					</ComposedChart>
				</ResponsiveContainer>

				{/* Summary metrics */}
				{summary && (
					<div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-yellow-500/10">
						<div>
							<div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
								<DollarSign className="h-3 w-3" />
								Total Revenue
							</div>
							<p className="text-lg font-semibold text-white font-sans">
								{formatCurrency(summary.totalRevenue)}
							</p>
						</div>
						<div>
							<div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
								<TrendingUp className="h-3 w-3" />
								Avg Monthly
							</div>
							<p className="text-lg font-semibold text-white font-sans">
								{formatCurrency(summary.avgMonthlyRevenue)}
							</p>
						</div>
						<div>
							<div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
								<FileText className="h-3 w-3" />
								Total Contracts
							</div>
							<p className="text-lg font-semibold text-white font-sans">
								{summary.totalContracts.toLocaleString()}
							</p>
						</div>
						<div>
							<div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
								<Activity className="h-3 w-3" />
								Current Status
							</div>
							<p
								className="text-lg font-semibold capitalize"
								style={{ color: getStatusColor(summary.latestActivityStatus) }}
							>
								{summary.latestActivityStatus}
							</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
