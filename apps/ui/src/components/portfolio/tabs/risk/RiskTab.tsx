import React from "react";
import { useAgentChatContext } from "../../../../contexts/agent-chat-context";
import { ActiveMonitorsList } from "./components/ActiveMonitorsList";
import { FilterConfigurationModal } from "./components/FilterConfigurationModal";
import { MonitoringDashboard } from "./components/MonitoringDashboard";
import { useRiskMonitoring } from "./hooks/useRiskMonitoring";
import {
	getAllContractorMetrics,
	getContractorMetrics,
} from "../../services/contractor-metrics-adapter";
import USAMap from 'react-usa-map';
import { CONTRACTOR_DETAIL_COLORS, PortfolioDataService } from "../../../../shared-config";

// Design Framework Components - Indigo Theme
const InternalContentContainer = ({
	children,
}: { children: React.ReactNode }) => (
	<div className="p-4 h-full flex flex-col relative z-10">{children}</div>
);

export function RiskTab() {
	const chatContext = useAgentChatContext();
	const [activeSpreadsheet, setActiveSpreadsheet] = React.useState<string | null>(null);

	const {
		// State
		showFilterSettings,
		filterSettings,
		tempSettings,
		activeMonitors,

		// Actions
		setShowFilterSettings,
		setFilterSettings,
		setTempSettings,
		handleSaveSettings,
		removeMonitor,

		// Data
		portfolioAssets,
		featureOptions,
	} = useRiskMonitoring();

	// Portfolio Data Service - now uses externalized configuration
	const portfolioDataService = {
		...PortfolioDataService,
		getPortfolioAssets: () => {
			const allMetrics = getAllContractorMetrics();
			return Object.values(allMetrics).map((metrics) => ({
				id: metrics.uei,
				companyName: metrics.companyName,
				naicsDescription: PortfolioDataService.getCompanyNAICS(metrics.uei),
				marketType: PortfolioDataService.getMarketType(metrics.primaryAgency) as
					| "defense"
					| "civilian",
				uei: metrics.uei,
				activeAwards: { value: metrics.activeAwards },
				location: PortfolioDataService.getCompanyLocation(metrics.uei),
				employeeCount: PortfolioDataService.getEmployeeCount(metrics.uei),
				yearsInBusiness: PortfolioDataService.getYearsInBusiness(metrics.uei),
				primaryContact: PortfolioDataService.getPrimaryContact(metrics.uei),
				lifetimeAwards: metrics.lifetimeAwards,
				revenue: metrics.revenue,
				pipeline: metrics.pipeline,
				contractCount: metrics.contractCount,
				primaryAgency: metrics.primaryAgency,
			}));
		},
	};

	// Get enriched portfolio assets
	const enrichedPortfolioAssets = portfolioDataService.getPortfolioAssets();

	const handleAIConfigureClick = () => {
		console.log("AI Configure button clicked");
		console.log("Chat context:", chatContext);

		// Open AI chat with risk monitoring configuration context
		if (chatContext?.open) {
			chatContext.open({
				entityId: "risk-monitoring",
				entityType: "risk_configuration",
				entityName: "Risk Monitoring Dashboard",
			});
		}

		console.log("Chat context open called");
	};

	return (
		<div className="min-h-[500px] flex justify-center">
			<div className="w-full max-w-7xl">
				{/* Two-column layout: Monitoring Dashboard + Portfolio Map */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Left Column - Monitoring Dashboard */}
					<div className={`border border-[#8B8EFF]/30 rounded-xl hover:border-[#8B8EFF]/50 transition-all duration-500 ${activeSpreadsheet ? 'lg:col-span-2' : ''}`}>
						<InternalContentContainer>
							<div className="flex-1">
								<MonitoringDashboard
									filterSettings={filterSettings}
									onAIConfigureClick={handleAIConfigureClick}
									onShowFilterSettings={() => setShowFilterSettings(true)}
									onSpreadsheetStateChange={setActiveSpreadsheet}
								/>
							</div>
						</InternalContentContainer>
					</div>

					{/* Right Column - Portfolio Map - Only show when NOT in spreadsheet view */}
					{!activeSpreadsheet && (
						<div className="border border-[#8B8EFF]/30 rounded-xl hover:border-[#8B8EFF]/50 transition-all duration-500">
						<InternalContentContainer>
							<div className="flex-1">
								{/* Chart-Style Container for Map */}
								<div
									className="rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:shadow-[#223040]/20 h-full"
									style={{
										backgroundColor: "#223040",
									}}
								>
									<div className="relative h-full">
										{/* Title */}
										<div className="absolute top-0 left-0 z-10">
											<h3 className="font-sans text-xs uppercase tracking-wider text-gray-500">
												Portfolio Geographic Distribution
											</h3>
										</div>

										{/* Live Indicator */}
										<div className="absolute top-0 right-0 z-10 flex items-center gap-2">
											<span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
											<span
												className="text-[10px] text-green-400 tracking-wider font-light"
												style={{ fontFamily: "Genos, sans-serif" }}
											>
												LIVE
											</span>
										</div>

										{/* Map Content */}
										<div className="pt-8 h-full relative">
											{/* USA Map visualization */}
											<div className="relative w-full h-full">
												<USAMap
													width="100%"
													height="100%"
													defaultFill={CONTRACTOR_DETAIL_COLORS.backgroundColor}
													customize={{}}
													className="transition-all duration-300"
												/>

												{/* Overlay dots for portfolio assets */}
												<div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
													{enrichedPortfolioAssets.map((asset, index) => {
														const [city, state] = asset.location.split(', ');

														// Simple state-based positioning (you can enhance this with precise coordinates later)
														const statePositions: Record<string, { left: string; top: string }> = {
															'TX': { left: '35%', top: '75%' },
															'MA': { left: '85%', top: '25%' },
															'VA': { left: '80%', top: '45%' },
															'WA': { left: '15%', top: '15%' },
															'DC': { left: '82%', top: '42%' },
															'CO': { left: '40%', top: '45%' },
															'OR': { left: '10%', top: '25%' }
														};

														const position = statePositions[state] || { left: '50%', top: '50%' };

														return (
															<div
																key={asset.uei}
																className="absolute"
																style={{
																	left: position.left,
																	top: position.top,
																	transform: 'translate(-50%, -50%)',
																	zIndex: 100,
																	pointerEvents: 'auto'
																}}
																title={`${asset.companyName} - ${asset.location} - ${asset.activeAwards.value}`}
															>
																<div
																	className="absolute inset-0 w-3 h-3 rounded-full opacity-40 animate-ping"
																	style={{
																		backgroundColor: '#8B8EFF',
																		pointerEvents: 'none'
																	}}
																/>
																<div
																	className="relative w-3 h-3 rounded-full cursor-pointer"
																	style={{
																		backgroundColor: '#8B8EFF',
																		boxShadow: '0 0 8px #8B8EFF'
																	}}
																	onClick={() => {
																		window.location.href = `/platform/contractor-detail/${asset.uei}`;
																	}}
																/>
															</div>
														);
													})}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</InternalContentContainer>
					</div>
					)}
				</div>
			</div>

			{/* Active Monitors Section */}
			<ActiveMonitorsList
				activeMonitors={activeMonitors}
				onRemoveMonitor={removeMonitor}
			/>

			{/* Filter Settings Modal */}
			<FilterConfigurationModal
				showFilterSettings={showFilterSettings}
				setShowFilterSettings={setShowFilterSettings}
				filterSettings={filterSettings}
				tempSettings={tempSettings}
				setTempSettings={setTempSettings}
				setFilterSettings={setFilterSettings}
				portfolioAssets={portfolioAssets}
				featureOptions={featureOptions}
				onSaveSettings={handleSaveSettings}
			/>
		</div>
	);
}
