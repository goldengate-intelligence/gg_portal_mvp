import { TrendingUp, Users } from "lucide-react";
import React from "react";
import {
	Legend,
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import { Badge } from "../ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";

interface ComparisonMetric {
	metric: string;
	contractor: number;
	peerAverage: number;
	topPerformer: number;
}

interface PeerComparisonChartProps {
	data: ComparisonMetric[];
	contractorName: string;
	percentile?: number;
}

export function PeerComparisonChart({
	data,
	contractorName,
	percentile = 75,
}: PeerComparisonChartProps) {
	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const metric = payload[0].payload.metric;
			return (
				<div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
					<p className="text-sm font-medium text-white mb-2">{metric}</p>
					{payload.map((entry: any, index: number) => (
						<div
							key={index}
							className="flex items-center justify-between gap-4 text-xs"
						>
							<span className="text-gray-400">{entry.name}:</span>
							<span className="font-medium" style={{ color: entry.color }}>
								{entry.value}/100
							</span>
						</div>
					))}
				</div>
			);
		}
		return null;
	};

	const getPercentileColor = () => {
		if (percentile >= 90) return "text-green-500";
		if (percentile >= 75) return "text-yellow-500";
		if (percentile >= 50) return "text-orange-500";
		return "text-red-500";
	};

	const getPercentileBadge = () => {
		if (percentile >= 90) return "success";
		if (percentile >= 75) return "warning";
		if (percentile >= 50) return "secondary";
		return "destructive";
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Peer Comparison Analysis</CardTitle>
						<CardDescription>
							Performance metrics vs industry peers
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Users className="h-4 w-4 text-gray-400" />
						<Badge variant={getPercentileBadge() as any}>
							{percentile}th Percentile
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={400}>
					<RadarChart data={data}>
						<PolarGrid
							stroke="#374151"
							strokeDasharray="3 3"
							radialLines={false}
						/>
						<PolarAngleAxis
							dataKey="metric"
							stroke="#9ca3af"
							tick={{ fontSize: 11 }}
						/>
						<PolarRadiusAxis
							domain={[0, 100]}
							stroke="#374151"
							tick={{ fontSize: 10, fill: "#9ca3af" }}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Legend wrapperStyle={{ fontSize: 12 }} iconType="line" />
						<Radar
							name={contractorName}
							dataKey="contractor"
							stroke="#d2ac38"
							fill="#d2ac38"
							fillOpacity={0.6}
							strokeWidth={2}
						/>
						<Radar
							name="Peer Average"
							dataKey="peerAverage"
							stroke="#6b7280"
							fill="#6b7280"
							fillOpacity={0.3}
							strokeWidth={1}
							strokeDasharray="5 5"
						/>
						<Radar
							name="Top Performer"
							dataKey="topPerformer"
							stroke="#10b981"
							fill="#10b981"
							fillOpacity={0.2}
							strokeWidth={1}
							strokeDasharray="3 3"
						/>
					</RadarChart>
				</ResponsiveContainer>

				<div className="mt-6 space-y-3">
					<div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 bg-yellow-500 rounded-full" />
							<span className="text-sm text-gray-300">Your Performance</span>
						</div>
						<span className={`text-sm font-semibold ${getPercentileColor()}`}>
							{percentile}th Percentile
						</span>
					</div>

					<div className="grid grid-cols-2 gap-3">
						{data.map((item) => {
							const diff = item.contractor - item.peerAverage;
							const isAbove = diff > 0;
							return (
								<div key={item.metric} className="p-2 bg-gray-800/50 rounded">
									<p className="text-xs text-gray-400">{item.metric}</p>
									<div className="flex items-center gap-1 mt-1">
										<span className="text-sm font-medium text-white">
											{item.contractor}
										</span>
										<span
											className={`text-xs ${isAbove ? "text-green-500" : "text-red-500"}`}
										>
											{isAbove ? "+" : ""}
											{diff.toFixed(0)}
										</span>
										{isAbove ? (
											<TrendingUp className="h-3 w-3 text-green-500" />
										) : (
											<TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
										)}
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
