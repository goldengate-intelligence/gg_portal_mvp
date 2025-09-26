import { Bot, MessageSquare, Paperclip, X } from "lucide-react";
import React, { useEffect } from "react";
import { FileUploadModal } from "../portfolio/FileUploadModal";
import { QueryHistory } from "./QueryHistory";
import { QueryTabs } from "./QueryTabs";
import { ResultsTable } from "./ResultsTable";
import { SearchToolbar } from "./SearchToolbar";
import { useDiscoveryState } from "./logic/useDiscoveryState";
import { contractorApi } from "./services/contractorApi";

const ExternalPanelContainer = ({
	children,
}: { children: React.ReactNode }) => (
	<div className="h-full border border-[#F97316]/30 rounded-xl hover:border-[#F97316]/50 transition-all duration-500">
		{children}
	</div>
);

const ChartStyleContainer = ({ children }: { children: React.ReactNode }) => (
	<div
		className="rounded-lg p-4"
		style={{
			backgroundColor: "#223040",
		}}
	>
		{children}
	</div>
);

const InternalContentContainer = ({
	children,
}: { children: React.ReactNode }) => (
	<div className="p-4 h-full flex flex-col relative z-10">{children}</div>
);

const PanelTitle = ({ children }: { children: React.ReactNode }) => (
	<h3
		className="uppercase text-lg tracking-wider mb-6"
		style={{
			fontFamily: "monospace",
			fontSize: "18px",
			fontWeight: "bold",
			color: "#D2AC38",
			textShadow: "0 0 10px rgba(210, 172, 56, 0.3)",
		}}
	>
		{children}
	</h3>
);

export function DiscoveryInterface() {
	const { state, actions } = useDiscoveryState();
	const [showHistoryModal, setShowHistoryModal] = React.useState(false);
	const [isFileUploadOpen, setIsFileUploadOpen] = React.useState(false);

	// Handle search
	const handleSearch = async () => {
		if (!state.searchQuery.trim() || state.isSearching) return;

		actions.setIsSearching(true);
		actions.setQueryExecutionTime(0);

		// Start execution timer
		const startTime = Date.now();
		const timer = setInterval(() => {
			actions.setQueryExecutionTime(Date.now() - startTime);
		}, 100);

		try {
			const response = await contractorApi.search({
				query: state.searchQuery,
				limit: 50,
			});

			// Update active tab with results
			actions.updateQueryTab(state.activeQueryTab, {
				query: state.searchQuery,
				results: response.results,
				columns: response.columns,
				status: "success",
				lastExecuted: new Date(),
			});

			// Add to history
			actions.addQueryToHistory(
				state.searchQuery,
				"completed",
				response.results.length,
			);

			actions.clearSelectedRows();
		} catch (error) {
			actions.addQueryToHistory(state.searchQuery, "failed");
			actions.updateQueryTab(state.activeQueryTab, {
				status: "error",
			});
		} finally {
			clearInterval(timer);
			actions.setIsSearching(false);
		}
	};

	const handleExport = async () => {
		const activeTab = state.queryTabs[state.activeQueryTab];
		if (activeTab.results.length === 0) return;

		try {
			const blob = await contractorApi.exportResults(activeTab.results, "csv");
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `contractor-search-results-${new Date().toISOString().split("T")[0]}.csv`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Export failed:", error);
		}
	};

	// Function to trigger Smart Search via PlatformFooter's AI Chat
	const triggerSmartSearch = () => {
		// Dispatch a custom event that PlatformFooter can listen to
		window.dispatchEvent(new CustomEvent("openSmartSearch"));
	};

	const activeTab = state.queryTabs[state.activeQueryTab];

	return (
		<>
			<div className="mb-8 mt-6">
				<div className="w-full max-w-5xl mx-auto">
					<div className="w-full">
						{/* Main Query Results Panel */}
						<div className="w-full">
							<ExternalPanelContainer>
								<InternalContentContainer>
									<div className="flex-1">
										<ChartStyleContainer>
											<div className="relative h-full">
												{/* Title */}
												<div className="mb-4">
													<h3 className="font-sans text-xs uppercase tracking-wider text-gray-500">
														GOLDENGATE RESEARCH TERMINAL
													</h3>
												</div>

												{/* Context Controls */}
												<div className="flex items-center justify-between mb-4">
													<div className="flex items-center gap-2">
														<button
															onClick={triggerSmartSearch}
															className="flex items-center gap-2 px-3 py-2 bg-[#F97316]/10 border border-[#F97316]/30 rounded-lg text-[#F97316] hover:bg-[#F97316]/20 transition-colors text-sm"
														>
															<Bot className="w-4 h-4" />
															Smart Search
														</button>
														<button
															className="flex items-center gap-2 px-3 py-2 bg-cyan-400/10 border border-cyan-400/30 rounded-lg text-cyan-400 hover:bg-cyan-400/20 transition-colors text-sm"
															onClick={() => setIsFileUploadOpen(true)}
														>
															<Paperclip className="w-4 h-4" />
															Attach Context
														</button>
													</div>
													<div className="text-xs text-gray-500">
														Enhanced with portfolio knowledge base
													</div>
												</div>

												{/* Search Toolbar */}
												<SearchToolbar
													searchQuery={state.searchQuery}
													onSearchChange={actions.setSearchQuery}
													onSearch={handleSearch}
													isSearching={state.isSearching}
												/>

												{/* Results Table */}
												<ResultsTable
													viewMode={state.viewMode}
													onViewModeChange={actions.setViewMode}
													queryResults={activeTab.results}
													queryColumns={activeTab.columns}
													selectedRows={state.selectedRows}
													onRowSelect={actions.toggleRowSelection}
													isExecuting={state.isSearching}
													queryExecutionTime={state.queryExecutionTime}
													showColumnSelector={state.showColumnSelector}
													onToggleColumnSelector={() =>
														actions.setShowColumnSelector(
															!state.showColumnSelector,
														)
													}
													onExport={handleExport}
													onShowHistory={() => setShowHistoryModal(true)}
												/>
											</div>
										</ChartStyleContainer>
									</div>
								</InternalContentContainer>
							</ExternalPanelContainer>
						</div>
					</div>
				</div>
			</div>

			{/* Query History Modal */}
			{showHistoryModal && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
					<div className="bg-gray-900 border border-[#F97316]/30 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
						{/* Header */}
						<div className="flex items-center justify-between p-6 border-b border-gray-700">
							<h3 className="text-lg font-medium text-gray-200">
								Query History
							</h3>
							<button
								onClick={() => setShowHistoryModal(false)}
								className="h-8 w-8 p-0 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-gray-300 rounded-md flex items-center justify-center"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						{/* Content */}
						<div className="p-6" style={{ backgroundColor: "#223040" }}>
							<QueryHistory
								queryHistory={state.queryHistory}
								isExecuting={state.isSearching}
								queryExecutionTime={state.queryExecutionTime}
								onCancelQuery={() => actions.setIsSearching(false)}
								onRerunQuery={(query) => {
									actions.setSearchQuery(query);
									handleSearch();
									setShowHistoryModal(false);
								}}
							/>
						</div>
					</div>
				</div>
			)}

			{/* File Upload Modal */}
			<FileUploadModal
				isOpen={isFileUploadOpen}
				onClose={() => setIsFileUploadOpen(false)}
				entityId="discovery"
				entityName="Discovery Context"
				entityType="portfolio"
			/>
		</>
	);
}
