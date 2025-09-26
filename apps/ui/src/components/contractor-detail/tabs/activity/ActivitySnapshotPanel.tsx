import {
	Activity,
	Calendar,
	Clock,
	Package,
	TrendingDown,
	TrendingUp,
	Zap,
} from "lucide-react";
import React from "react";
import { CONTRACTOR_DETAIL_COLORS, cn } from "../../../../logic/utils";

interface ActivitySnapshotPanelProps {
	contractor: any;
	performanceData: any;
	activityEvents?: any[]; // Add activity events from Snowflake
	metrics?: any; // Add unified metrics
}

export function ActivitySnapshotPanel({
	contractor,
	performanceData,
	activityEvents,
	metrics,
}: ActivitySnapshotPanelProps) {
	// Format currency values
	const formatCurrency = (amount: number): string => {
		if (amount >= 1e9) return `$${(amount / 1e9).toFixed(0)}B`;
		if (amount >= 1e6) return `$${(amount / 1e6).toFixed(0)}M`;
		if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
		return `$${amount.toLocaleString()}`;
	};

	// Calculate real inflow/outflow metrics from activity events
	const calculateActivityMetrics = () => {
		if (!activityEvents?.length) {
			return {
				inflowTotal: 0,
				outflowTotal: 0,
				inflowCount: 0,
				outflowCount: 0,
				inflowGrowth: 0,
				outflowGrowth: 0,
				avgVelocity: 42 // fallback
			};
		}

		// Current quarter (last 3 months)
		const now = new Date();
		const currentQuarter = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
		const previousQuarter = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

		// Filter events by time periods
		const currentInflows = activityEvents.filter(e =>
			e.FLOW_DIRECTION === 'INFLOW' && new Date(e.EVENT_DATE) >= currentQuarter
		);
		const currentOutflows = activityEvents.filter(e =>
			e.FLOW_DIRECTION === 'OUTFLOW' && new Date(e.EVENT_DATE) >= currentQuarter
		);
		const previousInflows = activityEvents.filter(e =>
			e.FLOW_DIRECTION === 'INFLOW' &&
			new Date(e.EVENT_DATE) >= previousQuarter &&
			new Date(e.EVENT_DATE) < currentQuarter
		);
		const previousOutflows = activityEvents.filter(e =>
			e.FLOW_DIRECTION === 'OUTFLOW' &&
			new Date(e.EVENT_DATE) >= previousQuarter &&
			new Date(e.EVENT_DATE) < currentQuarter
		);

		// Calculate totals
		const inflowTotal = currentInflows.reduce((sum, e) => sum + Math.abs(e.EVENT_AMOUNT), 0);
		const outflowTotal = currentOutflows.reduce((sum, e) => sum + Math.abs(e.EVENT_AMOUNT), 0);
		const prevInflowTotal = previousInflows.reduce((sum, e) => sum + Math.abs(e.EVENT_AMOUNT), 0);
		const prevOutflowTotal = previousOutflows.reduce((sum, e) => sum + Math.abs(e.EVENT_AMOUNT), 0);

		// Calculate growth rates
		const inflowGrowth = prevInflowTotal > 0 ? ((inflowTotal - prevInflowTotal) / prevInflowTotal) * 100 : 0;
		const outflowGrowth = prevOutflowTotal > 0 ? ((outflowTotal - prevOutflowTotal) / prevOutflowTotal) * 100 : 0;

		// Calculate average contract velocity (days from start to first payment)
		const velocityDays = activityEvents
			.filter(e => e.AWARD_START_DATE && e.EVENT_DATE)
			.map(e => {
				const start = new Date(e.AWARD_START_DATE);
				const payment = new Date(e.EVENT_DATE);
				return Math.abs(payment.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
			})
			.filter(days => days > 0 && days < 365); // reasonable range

		const avgVelocity = velocityDays.length > 0
			? Math.round(velocityDays.reduce((sum, days) => sum + days, 0) / velocityDays.length)
			: metrics?.portfolio?.avgContractDuration || 42;

		return {
			inflowTotal,
			outflowTotal,
			inflowCount: currentInflows.length,
			outflowCount: currentOutflows.length,
			inflowGrowth,
			outflowGrowth,
			avgVelocity
		};
	};

	const activityMetrics = calculateActivityMetrics();
	return (
		<div
			className="h-full rounded-lg border border-gray-700"
			style={{ backgroundColor: "#223040" }}
		>
			{/* Header */}
			<div className="px-6 py-3">
				<div className="flex items-center justify-between">
					<h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
						ACTIVITY PERIOD
					</h4>
					<div className="flex items-center gap-2">
						<span
							className="w-1.5 h-1.5 rounded-full animate-pulse"
							style={{
								backgroundColor: "#22c55e",
								boxShadow: "0 0 10px rgba(34,197,94,0.5)",
							}}
						/>
						<span
							className="text-[10px] tracking-wider font-light"
							style={{ fontFamily: "Genos, sans-serif", color: "#22c55e" }}
						>
							TRACKING
						</span>
					</div>
				</div>
			</div>

			{/* Content Area */}
			<div className="p-6 flex-1">
				{/* Enhanced Activity Flow Display */}
				<div className="h-full flex flex-col">
					{/* Main Flow Visualization */}
					<div className="mb-8">
						<div className="flex items-center justify-between">
							{/* Inflow Side */}
							<div className="flex flex-col items-center flex-1">
								<div className="w-16 h-16 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center mb-4 relative">
									<TrendingUp className="w-6 h-6 text-[#22c55e]" />
									<div className="absolute -top-1 -right-1 w-4 h-4 bg-[#22c55e] rounded-full flex items-center justify-center">
										<span className="text-xs text-black font-bold">{activityMetrics.inflowCount}</span>
									</div>
								</div>
								<div className="text-2xl font-bold text-[#22c55e] mb-1">
									{formatCurrency(activityMetrics.inflowTotal)}
								</div>
								<div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
									Obligation Inflows
								</div>
								<div className={`text-xs px-2 py-1 rounded-full ${activityMetrics.inflowGrowth >= 0 ? 'text-[#22c55e] bg-[#22c55e]/10' : 'text-[#ef4444] bg-[#ef4444]/10'}`}>
									{activityMetrics.inflowGrowth >= 0 ? '+' : ''}{activityMetrics.inflowGrowth.toFixed(0)}% vs Q3
								</div>
							</div>

							{/* Center Flow Arrow with Speed Indicator */}
							<div className="flex-1 flex flex-col items-center justify-center">
								<div className="relative mb-2">
									<div className="w-20 h-1 bg-gradient-to-r from-[#22c55e] via-[#D2AC38] to-[#FF4C4C] relative rounded-full">
										<div className="absolute right-0 top-1/2 transform -translate-y-1/2">
											<div className="w-0 h-0 border-l-[8px] border-l-[#FF4C4C] border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent" />
										</div>
									</div>
								</div>
								<div className="text-xs text-[#D2AC38] uppercase tracking-wider">
									Contract Velocity
								</div>
								<div className="text-xs text-gray-500">{activityMetrics.avgVelocity} days avg</div>
							</div>

							{/* Outflow Side */}
							<div className="flex flex-col items-center flex-1">
								<div className="w-16 h-16 rounded-full bg-[#FF4C4C]/20 border border-[#FF4C4C]/40 flex items-center justify-center mb-4 relative">
									<TrendingDown className="w-6 h-6 text-[#FF4C4C]" />
									<div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF4C4C] rounded-full flex items-center justify-center">
										<span className="text-xs text-white font-bold">{activityMetrics.outflowCount}</span>
									</div>
								</div>
								<div className="text-2xl font-bold text-[#FF4C4C] mb-1">
									{formatCurrency(activityMetrics.outflowTotal)}
								</div>
								<div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
									Obligation Outflows
								</div>
								<div className={`text-xs px-2 py-1 rounded-full ${activityMetrics.outflowGrowth >= 0 ? 'text-[#22c55e] bg-[#22c55e]/10' : 'text-[#ef4444] bg-[#ef4444]/10'}`}>
									{activityMetrics.outflowGrowth >= 0 ? '+' : ''}{activityMetrics.outflowGrowth.toFixed(0)}% vs Q3
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
