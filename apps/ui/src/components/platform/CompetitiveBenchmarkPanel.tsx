import {
	AlertCircle,
	Award,
	Target,
	TrendingUp,
	Trophy,
	Users,
} from "lucide-react";
import React from "react";
import {
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
} from "recharts";
import { Badge } from "../ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { formatCurrency } from "./services/contractor-profile-transform";

interface PeerComparisonData {
	currentPercentiles: {
		revenue: number;
		growth: number;
		performance: number;
		overall: number;
	} | null;
	peerGroup: {
		size: number;
		classification: string;
		marketPosition: string;
	} | null;
	historicalComparisons?: Array<{
		monthYear: string;
		revenuePercentile: number;
		growthPercentile: number;
		performancePercentile: number;
		overallPerformanceScore: number;
	}>;
}

interface CompetitiveBenchmarkPanelProps {
	data: PeerComparisonData;
	contractorName?: string;
}

export function CompetitiveBenchmarkPanel({
	data,
	contractorName = "Contractor",
}: CompetitiveBenchmarkPanelProps) {
	if (!data.currentPercentiles || !data.peerGroup) {
		return (
			<Card className="bg-medium-gray border-yellow-500/20">
				<CardContent className="flex items-center justify-center h-64">
					<div className="text-center">
						<AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
						<p className="text-gray-400">No peer comparison data available</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const { currentPercentiles, peerGroup } = data;

	// Prepare radar chart data
	const radarData = [
		{ metric: "Revenue", value: currentPercentiles.revenue, fullMark: 100 },
		{ metric: "Growth", value: currentPercentiles.growth, fullMark: 100 },
		{
			metric: "Performance",
			value: currentPercentiles.performance,
			fullMark: 100,
		},
		{ metric: "Overall", value: currentPercentiles.overall, fullMark: 100 },
	];

	// Get percentile color
	const getPercentileColor = (percentile: number) => {
		if (percentile >= 75) return "text-green-400";
		if (percentile >= 50) return "text-yellow-400";
		if (percentile >= 25) return "text-orange-400";
		return "text-red-400";
	};

	// Get percentile badge variant
	const getPercentileBadgeVariant = (percentile: number) => {
		if (percentile >= 75) return "success";
		if (percentile >= 50) return "warning";
		if (percentile >= 25) return "secondary";
		return "destructive";
	};

	// Get market position icon and color
	const getMarketPositionIcon = (position: string) => {
		switch (position?.toLowerCase()) {
			case "leader":
				return { icon: Trophy, color: "text-yellow-500" };
			case "challenger":
				return { icon: Target, color: "text-blue-500" };
			case "follower":
				return { icon: Users, color: "text-gray-400" };
			default:
				return { icon: Users, color: "text-gray-400" };
		}
	};

	const MarketPositionIcon = getMarketPositionIcon(peerGroup.marketPosition);

	// Calculate percentile rank
	const getPercentileRank = (percentile: number) => {
		if (percentile >= 90) return "Top 10%";
		if (percentile >= 75) return "Top 25%";
		if (percentile >= 50) return "Top 50%";
		return `Bottom ${100 - percentile}%`;
	};

	return (
		<Card className="bg-medium-gray border-yellow-500/20">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-yellow-500 font-aptos">
							Competitive Benchmarking
						</CardTitle>
						<CardDescription className="text-gray-400">
							Peer comparison across {peerGroup.size.toLocaleString()} similar
							contractors
						</CardDescription>
					</div>
					<div className="flex items-center gap-3">
						<Badge className="bg-gray-700/50 text-gray-300 border-gray-600">
							{peerGroup.classification}
						</Badge>
						<div className="flex items-center gap-2">
							<MarketPositionIcon.icon
								className={`h-5 w-5 ${MarketPositionIcon.color}`}
							/>
							<span
								className={`font-semibold ${MarketPositionIcon.color} capitalize`}
							>
								{peerGroup.marketPosition}
							</span>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Radar Chart */}
				<div className="bg-dark-gray rounded-lg p-4">
					<ResponsiveContainer width="100%" height={300}>
						<RadarChart data={radarData}>
							<PolarGrid stroke="#374151" radialLines={false} />
							<PolarAngleAxis
								dataKey="metric"
								stroke="#9ca3af"
								style={{ fontSize: 12 }}
							/>
							<PolarRadiusAxis
								angle={90}
								domain={[0, 100]}
								stroke="#6b7280"
								style={{ fontSize: 10 }}
							/>
							<Radar
								name={contractorName}
								dataKey="value"
								stroke="#eab308"
								fill="#eab308"
								fillOpacity={0.6}
								strokeWidth={2}
							/>
						</RadarChart>
					</ResponsiveContainer>
				</div>

				{/* Percentile Cards */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="bg-dark-gray rounded-lg p-4 border border-gray-700">
						<div className="flex items-center justify-between mb-2">
							<span className="text-xs text-gray-400">Revenue</span>
							<Award className="h-4 w-4 text-gray-500" />
						</div>
						<div
							className={`text-2xl font-bold ${getPercentileColor(currentPercentiles.revenue)}`}
						>
							{currentPercentiles.revenue}
							<span className="text-sm font-normal">th</span>
						</div>
						<p className="text-xs text-gray-500 mt-1">
							{getPercentileRank(currentPercentiles.revenue)}
						</p>
					</div>

					<div className="bg-dark-gray rounded-lg p-4 border border-gray-700">
						<div className="flex items-center justify-between mb-2">
							<span className="text-xs text-gray-400">Growth</span>
							<TrendingUp className="h-4 w-4 text-gray-500" />
						</div>
						<div
							className={`text-2xl font-bold ${getPercentileColor(currentPercentiles.growth)}`}
						>
							{currentPercentiles.growth}
							<span className="text-sm font-normal">th</span>
						</div>
						<p className="text-xs text-gray-500 mt-1">
							{getPercentileRank(currentPercentiles.growth)}
						</p>
					</div>

					<div className="bg-dark-gray rounded-lg p-4 border border-gray-700">
						<div className="flex items-center justify-between mb-2">
							<span className="text-xs text-gray-400">Performance</span>
							<Target className="h-4 w-4 text-gray-500" />
						</div>
						<div
							className={`text-2xl font-bold ${getPercentileColor(currentPercentiles.performance)}`}
						>
							{currentPercentiles.performance}
							<span className="text-sm font-normal">th</span>
						</div>
						<p className="text-xs text-gray-500 mt-1">
							{getPercentileRank(currentPercentiles.performance)}
						</p>
					</div>

					<div className="bg-dark-gray rounded-lg p-4 border border-gray-700">
						<div className="flex items-center justify-between mb-2">
							<span className="text-xs text-gray-400">Overall</span>
							<Trophy className="h-4 w-4 text-gray-500" />
						</div>
						<div
							className={`text-2xl font-bold ${getPercentileColor(currentPercentiles.overall)}`}
						>
							{currentPercentiles.overall}
							<span className="text-sm font-normal">th</span>
						</div>
						<p className="text-xs text-gray-500 mt-1">
							{getPercentileRank(currentPercentiles.overall)}
						</p>
					</div>
				</div>

				{/* Historical Trend (if available) */}
				{data.historicalComparisons &&
					data.historicalComparisons.length > 1 && (
						<div className="bg-dark-gray rounded-lg p-4 border border-gray-700">
							<h4 className="text-sm font-semibold text-gray-300 mb-3">
								Percentile Trends
							</h4>
							<div className="space-y-2">
								{data.historicalComparisons.slice(-3).map((comparison, idx) => (
									<div
										key={idx}
										className="flex items-center justify-between text-xs"
									>
										<span className="text-gray-400">
											{new Date(comparison.monthYear).toLocaleDateString(
												"en-US",
												{
													month: "short",
													year: "numeric",
												},
											)}
										</span>
										<div className="flex gap-4">
											<Badge
												variant={getPercentileBadgeVariant(
													comparison.revenuePercentile,
												)}
											>
												Rev: {comparison.revenuePercentile}
											</Badge>
											<Badge
												variant={getPercentileBadgeVariant(
													comparison.growthPercentile,
												)}
											>
												Grw: {comparison.growthPercentile}
											</Badge>
											<Badge
												variant={getPercentileBadgeVariant(
													comparison.overallPerformanceScore,
												)}
											>
												Ovr: {comparison.overallPerformanceScore}
											</Badge>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

				{/* Competitive Insights */}
				<div className="bg-dark-gray rounded-lg p-4 border border-gray-700">
					<h4 className="text-sm font-semibold text-gray-300 mb-3">
						Competitive Insights
					</h4>
					<div className="space-y-2 text-xs text-gray-400">
						{currentPercentiles.revenue >= 75 && (
							<p>✓ Revenue performance in top quartile of peer group</p>
						)}
						{currentPercentiles.growth >= 75 && (
							<p>✓ Growth rate exceeds 75% of competitors</p>
						)}
						{currentPercentiles.performance >= 75 && (
							<p>✓ Performance metrics place contractor as industry leader</p>
						)}
						{currentPercentiles.revenue < 50 && (
							<p>⚠ Revenue below median - opportunity for growth</p>
						)}
						{currentPercentiles.growth < 50 && (
							<p>⚠ Growth rate lagging peer group average</p>
						)}
						{peerGroup.marketPosition === "leader" && (
							<p>🏆 Recognized as market leader in peer segment</p>
						)}
						{peerGroup.marketPosition === "challenger" && (
							<p>🎯 Positioned as challenger with growth potential</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
