import type React from "react";
import { useAgentChatContext } from "../../../../contexts/agent-chat-context";
import { ActiveMonitorsList } from "./components/ActiveMonitorsList";
import { FilterConfigurationModal } from "./components/FilterConfigurationModal";
import { MonitoringDashboard } from "./components/MonitoringDashboard";
import { useRiskMonitoring } from "./hooks/useRiskMonitoring";

// Design Framework Components - Indigo Theme
const InternalContentContainer = ({
	children,
}: { children: React.ReactNode }) => (
	<div className="p-4 h-full flex flex-col relative z-10">{children}</div>
);

export function RiskTab() {
	const chatContext = useAgentChatContext();
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
			<div className="w-full max-w-4xl">
				<div className="border border-[#8B8EFF]/30 rounded-xl hover:border-[#8B8EFF]/50 transition-all duration-500">
					<InternalContentContainer>
						{/* Content Section */}
						<div className="flex-1">
							<MonitoringDashboard
								filterSettings={filterSettings}
								onAIConfigureClick={handleAIConfigureClick}
								onShowFilterSettings={() => setShowFilterSettings(true)}
							/>
						</div>
					</InternalContentContainer>
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
