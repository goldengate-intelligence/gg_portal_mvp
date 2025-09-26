import { Activity, BarChart3, Globe, Share2, Users } from "lucide-react";
import React, { useState, useEffect } from "react";
import { CONTRACTOR_DETAIL_COLORS, cn } from "../../logic/utils";
import type { Contractor } from "../../types";
import { ContractorDetailHeader } from "./ContractorDetail_Header";
import { HeadlineMetrics } from "./Headline_Metrics";
import { contractorDataOrchestrator } from "./services/contractor-data";
import { unifiedDataAdapter } from "./services/unified-data-adapter";
import type {
	ContractorDetailData,
	ContractorNetworkData,
	ContractorPerformanceData,
} from "./services/contractor-data";
import type { UnifiedContractorData } from "./services/unified-data-adapter";
import {
	coordinatesToMapPercentage,
	getLocationCoordinates,
	parsePlaceOfPerformance,
} from "./services/geocoding";
import { ActivityTab } from "./tabs/activity";
import { ContactsTab } from "./tabs/contacts";
import { OverviewTab } from "./tabs/overview";
import { PerformanceTab } from "./tabs/performance";
import { NetworkTab } from "./tabs/relationships";
import { NetworkTab as UnifiedNetworkTab } from "./tabs/network";

interface ContractorDetailProps {
	contractorId: string;
	onActiveTabChange?: (tab: string) => void;
}

export function ContractorDetail({
	contractorId,
	onActiveTabChange,
}: ContractorDetailProps) {
	const [contractorDetailData, setContractorDetailData] =
		useState<ContractorDetailData | null>(null);
	const [unifiedData, setUnifiedData] = useState<UnifiedContractorData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");

	// Notify parent of active tab changes
	useEffect(() => {
		onActiveTabChange?.(activeTab);
	}, [activeTab, onActiveTabChange]);
	const [benchmarkData, setBenchmarkData] = useState<any>(null);
	const [yAxisMetric, setYAxisMetric] = useState("ttm_revenue");
	const [xAxisMetric, setXAxisMetric] = useState("composite_score");
	const [revenueTimeAggregation, setRevenueTimeAggregation] = useState("M");
	const [revenueTimePeriod, setRevenueTimePeriod] = useState("5");

	// Helper function to get geocoded map positions
	const getMapPosition = (zipCode?: string, city?: string, state?: string) => {
		const location = getLocationCoordinates(zipCode, city, state);
		if (location) {
			return coordinatesToMapPercentage(location.coordinates);
		}
		return { left: "50%", top: "50%" }; // fallback to center
	};


	// Reset to overview tab when contractor changes
	useEffect(() => {
		setActiveTab("overview");
	}, [contractorId]);

	// Load contractor detail data using orchestration service
	useEffect(() => {
		let isMounted = true;

		const loadContractorData = async () => {
			setIsLoading(true);
			try {
				// Load both legacy and unified data in parallel
				const [detailData, unifiedContractorData] = await Promise.all([
					contractorDataOrchestrator.getContractorDetail(contractorId),
					unifiedDataAdapter.getContractorData(contractorId)
				]);

				if (isMounted) {
					setContractorDetailData(detailData);
					setUnifiedData(unifiedContractorData);
					setIsLoading(false);
				}
			} catch (error) {
				console.error("Failed to load contractor detail data:", error);
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadContractorData();

		return () => {
			isMounted = false;
		};
	}, [contractorId]);

	const tabs = ["overview", "performance", "network", "activity", "contacts"];

	if (isLoading) {
		return (
			<div
				className={`min-h-screen text-white pb-20 pt-20 relative ${CONTRACTOR_DETAIL_COLORS.backgroundColor}`}
			>
				{/* Background grid */}
				<div className="absolute inset-0 opacity-5 z-0">
					<div
						className="absolute inset-0"
						style={{
							backgroundImage: `
              linear-gradient(90deg, #8B8EFF 1px, transparent 1px),
              linear-gradient(180deg, #8B8EFF 1px, transparent 1px)
            `,
							backgroundSize: "15px 15px",
						}}
					/>
				</div>
				<div className="flex items-center justify-center h-screen relative z-10">
					<div className="text-gray-400">Loading contractor details...</div>
				</div>
			</div>
		);
	}

	const renderTabContent = () => {
		switch (activeTab) {
			case "overview":
				return (
					<OverviewTab
						contractor={unifiedData?.contractor}
						activityEvents={unifiedData?.activityEvents || []}
						metrics={unifiedData?.metrics || ({} as any)}
						peerData={unifiedData?.peerData}
						monthlyHistory={unifiedData?.monthlyHistory || []}
						revenueTimeAggregation={revenueTimeAggregation}
						revenueTimePeriod={revenueTimePeriod}
						onRevenueTimeAggregationChange={setRevenueTimeAggregation}
						onRevenueTimePeriodChange={setRevenueTimePeriod}
						isLoading={isLoading || unifiedData?.isLoading || false}
					/>
				);
			case "performance":
				return (
					<PerformanceTab
						activityEvents={unifiedData?.activityEvents || []}
						metrics={unifiedData?.metrics || ({} as any)}
						peerData={unifiedData?.peerData}
						yAxisMetric={yAxisMetric}
						xAxisMetric={xAxisMetric}
						onYAxisMetricChange={setYAxisMetric}
						onXAxisMetricChange={setXAxisMetric}
						isLoading={isLoading || unifiedData?.isLoading || false}
					/>
				);
			case "network":
				return (
					<UnifiedNetworkTab
						contractorUEI={contractorDetailData?.contractor?.uei || contractorId}
						activityEvents={unifiedData?.activityEvents || []}
						isLoading={isLoading || unifiedData?.isLoading || false}
					/>
				);
			case "activity":
				return (
					<div className="space-y-6">
						<ActivityTab
							activityEvents={unifiedData?.activityEvents || []}
							metrics={unifiedData?.metrics || ({} as any)}
							isLoading={isLoading || unifiedData?.isLoading || false}
						/>
					</div>
				);
			case "contacts":
				return (
					<div className="space-y-6">
						<ContactsTab
							uei={unifiedData?.contractor?.uei || contractorId}
							companyName={unifiedData?.contractor?.name || "Unknown Company"}
							companyDomain="triofab.com"
						/>
					</div>
				);
			default:
				return (
					<OverviewTab
						activityEvents={unifiedData?.activityEvents || []}
						metrics={unifiedData?.metrics || ({} as any)}
						peerData={unifiedData?.peerData}
						monthlyHistory={unifiedData?.monthlyHistory || []}
						revenueTimeAggregation={revenueTimeAggregation}
						revenueTimePeriod={revenueTimePeriod}
						onRevenueTimeAggregationChange={setRevenueTimeAggregation}
						onRevenueTimePeriodChange={setRevenueTimePeriod}
						isLoading={isLoading || unifiedData?.isLoading || false}
					/>
				);
		}
	};

	return (
		<div className="min-h-screen">
			{/* Header - Hybrid Luxury/HUD Design */}
			<div
				className={`relative overflow-x-hidden ${CONTRACTOR_DETAIL_COLORS.backgroundColor}`}
			>
				{/* Background grid */}
				<div className="absolute inset-0 opacity-5 z-0">
					<div
						className="absolute inset-0"
						style={{
							backgroundImage: `
              linear-gradient(90deg, #8B8EFF 1px, transparent 1px),
              linear-gradient(180deg, #8B8EFF 1px, transparent 1px)
            `,
							backgroundSize: "15px 15px",
						}}
					/>
				</div>
				{/* Subtle scan line effect */}
				<div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300/10 to-transparent animate-scan" />

				<div className="container mx-auto px-6 py-8 max-w-7xl relative z-10">
					<ContractorDetailHeader
						contractor={contractorDetailData?.contractor || null}
					/>

					{/* Metrics Cards - Positioned with proper spacing after header section */}
					<div className="mt-6">
						<HeadlineMetrics
							metrics={unifiedData?.metrics}
							isLoading={isLoading || unifiedData?.isLoading}
						/>
					</div>
				</div>
			</div>

			{/* Body Content */}
			<div
				className={`relative min-h-screen ${CONTRACTOR_DETAIL_COLORS.backgroundColor}`}
			>
				{/* Background grid */}
				<div className="absolute inset-0 opacity-5 z-0">
					<div
						className="absolute inset-0"
						style={{
							backgroundImage: `
              linear-gradient(90deg, #8B8EFF 1px, transparent 1px),
              linear-gradient(180deg, #8B8EFF 1px, transparent 1px)
            `,
							backgroundSize: "15px 15px",
						}}
					/>
				</div>
				<div className="py-6 pb-16 min-h-full">
					<div className="container mx-auto px-6 max-w-7xl relative z-10">
						{/* Tab Navigation - Minimal Style */}
						<div className="mb-8">
							<div className="flex items-center gap-1 border-b border-gray-800/50">
								{tabs.map((tab) => (
									<button
										key={tab}
										onClick={() => setActiveTab(tab)}
										className={cn(
											"flex-1 px-6 py-3 text-sm font-normal tracking-tight transition-all duration-300 border-b-2 border-transparent text-center capitalize",
											activeTab === tab
												? "text-[#D2AC38] border-[#D2AC38]"
												: "text-gray-500 hover:text-gray-300 hover:border-gray-600",
										)}
										style={{
											fontFamily: "system-ui, -apple-system, sans-serif",
										}}
									>
										{tab === "overview" && (
											<Globe className="inline w-4 h-4 mr-2" />
										)}
										{tab === "performance" && (
											<BarChart3 className="inline w-4 h-4 mr-2" />
										)}
										{tab === "network" && (
											<Share2 className="inline w-4 h-4 mr-2" />
										)}
										{tab === "activity" && (
											<Activity className="inline w-4 h-4 mr-2" />
										)}
										{tab === "contacts" && (
											<Users className="inline w-4 h-4 mr-2" />
										)}
										{tab}
									</button>
								))}
							</div>
						</div>
						{renderTabContent()}

						{/* Copyright Footer */}
						<div className="mt-16 mb-12 text-center">
							<p
								className="uppercase tracking-wider"
								style={{
									fontFamily: "sans-serif",
									fontSize: "12px",
									color: "#D2AC38",
								}}
							>
								© 2025 GOLDENGATE INTELLIGENCE. ALL RIGHTS RESERVED.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
