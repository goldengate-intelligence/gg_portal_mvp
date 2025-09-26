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
	GoldengateBarChart,
	GoldengateLineChart,
	GoldengateMixedChart,
} from "../../ui/charts/components";
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
}

interface PerformanceSummary {
	totalRevenue: number;
	avgMonthlyRevenue: number;
	totalContracts: number;
	latestActivityStatus: string;
	growthTrend: number;
}

interface PerformanceTrendChartProps {
	data: PerformanceDataPoint[];
	summary: PerformanceSummary;
	title?: string;
	description?: string;
	height?: number;
	showComparison?: boolean;
}

export function PerformanceTrendChartV2({
	data,
	summary,
	title = "Performance History",
	description = "36-month revenue and contract trends",
	height = 400,
	showComparison = false,
}: PerformanceTrendChartProps) {
	// Prepare data for Goldengate charts
	const chartData = useMemo(() => {
		const labels = data.map((d) => {
			const date = new Date(d.monthYear);
			return date.toLocaleDateString("en-US", {
				month: "short",
				year: "2-digit",
			});
		});

		const revenueData = data.map((d) => d.monthlyRevenue / 1000000); // Convert to millions
		const contractData = data.map((d) => d.activeContracts);
		const growthData = data.map((d) => d.growthRateYoy || 0);

		return {
			labels,
			datasets: [
				{
					label: "Revenue ($M)",
					data: revenueData,
					borderColor: "#FFD700",
					backgroundColor: "rgba(255, 215, 0, 0.1)",
					yAxisID: "y",
				},
				{
					label: "Active Contracts",
					data: contractData,
					borderColor: "#00D9FF",
					backgroundColor: "rgba(0, 217, 255, 0.1)",
					yAxisID: "y1",
				},
			],
		};
	}, [data]);

	// Growth rate chart data
	const growthChartData = useMemo(() => {
		const labels = data.map((d) => {
			const date = new Date(d.monthYear);
			return date.toLocaleDateString("en-US", {
				month: "short",
				year: "2-digit",
			});
		});

		const growthData = data.map((d) => d.growthRateYoy || 0);

		return {
			labels,
			datasets: [
				{
					label: "YoY Growth %",
					data: growthData,
					borderColor:
						growthData[growthData.length - 1] >= 0 ? "#00FF88" : "#FF0066",
					backgroundColor:
						growthData[growthData.length - 1] >= 0
							? "rgba(0, 255, 136, 0.1)"
							: "rgba(255, 0, 102, 0.1)",
				},
			],
		};
	}, [data]);

	// Get growth indicator
	const getGrowthIndicator = () => {
		if (summary.growthTrend > 0) {
			return <TrendingUp className="h-4 w-4 text-green-400" />;
		}
		if (summary.growthTrend < 0) {
			return <TrendingDown className="h-4 w-4 text-red-400" />;
		}
		return <Minus className="h-4 w-4 text-gray-400" />;
	};

	const chartOptions = {
		scales: {
			y: {
				type: "linear" as const,
				display: true,
				position: "left" as const,
				grid: { color: "rgba(0, 217, 255, 0.1)" },
				ticks: {
					color: "#FFD700",
					callback: (value: any) => `$${value}M`,
				},
				title: {
					display: true,
					text: "Revenue",
					color: "#FFD700",
				},
			},
			y1: {
				type: "linear" as const,
				display: true,
				position: "right" as const,
				grid: { drawOnChartArea: false },
				ticks: {
					color: "#00D9FF",
					callback: (value: any) => value,
				},
				title: {
					display: true,
					text: "Contracts",
					color: "#00D9FF",
				},
			},
		},
		plugins: {
			legend: {
				display: true,
				position: "top" as const,
			},
		},
	};

	return (
		<Card className="bg-medium-gray border-yellow-500/20">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-xl text-white">{title}</CardTitle>
						<CardDescription className="text-gray-400">
							{description}
						</CardDescription>
					</div>
					<div className="flex items-center gap-4">
						<Badge className="bg-gray-800 text-gray-300">
							<Activity className="h-3 w-3 mr-1" />
							{summary.latestActivityStatus}
						</Badge>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Summary Stats */}
				<div className="grid grid-cols-4 gap-4">
					<div className="bg-dark-gray p-3 rounded">
						<div className="flex items-center justify-between mb-1">
							<span className="text-xs text-gray-400">Total Revenue</span>
							<DollarSign className="h-4 w-4 text-yellow-400" />
						</div>
						<p className="text-lg font-bold text-yellow-400">
							{formatCurrency(summary.totalRevenue)}
						</p>
					</div>

					<div className="bg-dark-gray p-3 rounded">
						<div className="flex items-center justify-between mb-1">
							<span className="text-xs text-gray-400">Avg Monthly</span>
							<DollarSign className="h-4 w-4 text-cyan-400" />
						</div>
						<p className="text-lg font-bold text-cyan-400">
							{formatCurrency(summary.avgMonthlyRevenue)}
						</p>
					</div>

					<div className="bg-dark-gray p-3 rounded">
						<div className="flex items-center justify-between mb-1">
							<span className="text-xs text-gray-400">Total Contracts</span>
							<FileText className="h-4 w-4 text-purple-400" />
						</div>
						<p className="text-lg font-bold text-purple-400">
							{summary.totalContracts}
						</p>
					</div>

					<div className="bg-dark-gray p-3 rounded">
						<div className="flex items-center justify-between mb-1">
							<span className="text-xs text-gray-400">Growth Trend</span>
							{getGrowthIndicator()}
						</div>
						<p
							className={`text-lg font-bold ${
								summary.growthTrend > 0
									? "text-green-400"
									: summary.growthTrend < 0
										? "text-red-400"
										: "text-gray-400"
							}`}
						>
							{summary.growthTrend > 0 ? "+" : ""}
							{summary.growthTrend?.toFixed(1) || 0}%
						</p>
					</div>
				</div>

				{/* Main Performance Chart */}
				<div className="space-y-4">
					<GoldengateLineChart
						title="Revenue & Contract Trends"
						data={chartData}
						options={chartOptions}
						height={height}
						liveIndicator={true}
						liveText="TRACKING"
					/>

					{showComparison && (
						<GoldengateLineChart
							title="Growth Rate Analysis"
							data={growthChartData}
							height={200}
							liveIndicator={true}
							liveText="YOY"
							options={{
								scales: {
									y: {
										grid: { color: "rgba(0, 217, 255, 0.1)" },
										ticks: {
											color: "#00D9FF",
											callback: (value: any) => `${value}%`,
										},
									},
								},
								plugins: {
									legend: { display: false },
								},
							}}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
