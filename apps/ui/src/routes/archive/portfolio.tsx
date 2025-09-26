import {
	ChevronRight,
	Download,
	Edit2,
	Folder,
	Plus,
	Share2,
	Star,
	Trash2,
} from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import { HudContractorCard } from "../../components/ui/hud-contractor-card";
import { SearchInput } from "../../components/ui/input";
import { EmptyState, LoadingState } from "../../components/ui/skeleton";
import { ContractorTable } from "../../components/ui/table";
import {
	useContractorListItems,
	useContractorLists,
} from "../../hooks/useContractorLists";
import { cn } from "../../logic/utils";
import type { Contractor } from "../../types";
import { formatCurrency } from "../../utils/contractor-profile-transform";
import { exportContractors } from "../../utils/export";

export function ViewPortfolio() {
	const {
		lists,
		isLoading: listsLoading,
		createList,
		updateList,
		deleteList,
	} = useContractorLists();
	const [selectedListId, setSelectedListId] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	const {
		list: selectedList,
		items: listItems,
		isLoading: itemsLoading,
		removeFromList,
	} = useContractorListItems(selectedListId);

	// Select default list by default
	useEffect(() => {
		if (lists && lists.length > 0 && !selectedListId) {
			const defaultList = lists.find((l) => l.isDefault);
			if (defaultList) {
				setSelectedListId(defaultList.id);
			} else {
				setSelectedListId(lists[0].id);
			}
		}
	}, [lists, selectedListId]);

	// Calculate portfolio metrics
	const portfolioMetrics = useMemo(() => {
		if (!listItems || listItems.length === 0) return null;

		const totalValue = listItems.reduce((sum, item) => {
			return sum + (Number.parseFloat(item.contractor.totalObligated) || 0);
		}, 0);
		const avgPerformance =
			listItems.reduce((sum, item) => {
				return sum + (item.contractor.performanceScore || 0);
			}, 0) / listItems.length;
		const activeContracts = listItems.reduce((sum, item) => {
			return sum + (item.contractor.totalContracts || 0);
		}, 0);

		// Risk calculation
		const highRiskCount = listItems.filter((item) => {
			return (item.contractor.performanceScore || 100) < 80;
		}).length;
		const riskLevel =
			highRiskCount > listItems.length * 0.3
				? "high"
				: highRiskCount > listItems.length * 0.1
					? "medium"
					: "low";

		return {
			totalValue,
			avgPerformance: Math.round(avgPerformance),
			activeContracts,
			contractorCount: listItems.length,
			riskLevel,
		};
	}, [listItems]);

	// Filter portfolio items based on search
	const filteredItems = useMemo(() => {
		if (!listItems) return [];

		if (!searchQuery) return listItems;

		const query = searchQuery.toLowerCase();
		return listItems.filter(
			(item) =>
				item.contractor.displayName.toLowerCase().includes(query) ||
				(item.contractor.primaryIndustryCluster || "")
					.toLowerCase()
					.includes(query),
		);
	}, [listItems, searchQuery]);

	const handleExportPortfolio = () => {
		if (!listItems) return;
		// Transform contractor data for export
		const contractors = listItems.map((item) => ({
			id: item.contractor.id,
			name: item.contractor.displayName,
			totalContractValue: Number.parseFloat(item.contractor.totalObligated),
			// Add other fields as needed
		}));
		// TODO: Implement proper export
		console.log("Exporting contractors:", contractors);
	};

	const handleSharePortfolio = () => {
		console.log("Sharing list:", selectedList);
		// TODO: Implement share functionality
	};

	const handleAddContractor = () => {
		// Navigate to identify page to add contractors
		window.location.href = "/platform/identify";
	};

	const handleRemoveContractor = async (contractorProfileId: string) => {
		if (!selectedListId) return;

		try {
			const { removeFromList } = useContractorListItems(selectedListId);
			await removeFromList(contractorProfileId);
		} catch (error) {
			console.error("Failed to remove from list:", error);
		}
	};

	const handleCreateList = async () => {
		const name = prompt("Enter list name:");
		if (name) {
			try {
				const newList = await createList({
					name,
					description: "",
					color: "#EAB308",
				});
				setSelectedListId(newList.id);
			} catch (error) {
				console.error("Failed to create list:", error);
			}
		}
	};

	const handleDeleteList = async (listId: string) => {
		if (confirm("Are you sure you want to delete this list?")) {
			try {
				await deleteList(listId);
				if (selectedListId === listId) {
					setSelectedListId(lists[0]?.id || null);
				}
			} catch (error) {
				console.error("Failed to delete list:", error);
				alert(error instanceof Error ? error.message : "Failed to delete list");
			}
		}
	};

	if (listsLoading) {
		return <LoadingState />;
	}

	if (!selectedList && (!lists || lists.length === 0)) {
		return (
			<div className="relative w-full bg-black/50 backdrop-blur-sm border-2 border-cyan-500/30 rounded-lg shadow-[0_0_50px_rgba(0,217,255,0.15)] min-h-[400px] flex items-center justify-center">
				{/* Tactical grid overlay */}
				<div className="absolute inset-0 opacity-5 pointer-events-none rounded-lg overflow-hidden">
					<div className="absolute inset-0 tactical-grid" />
				</div>

				{/* HUD Corner accents */}
				<div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-yellow-400/60" />
				<div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-yellow-400/60" />
				<div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-yellow-400/60" />
				<div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-yellow-400/60" />

				<div className="relative z-10 text-center">
					<div className="w-16 h-16 mx-auto mb-6 border-2 border-yellow-400/50 rounded-full flex items-center justify-center">
						<div className="w-8 h-8 border-2 border-yellow-400/70 rounded-full animate-pulse" />
					</div>
					<div className="text-lg font-bold text-yellow-400 uppercase tracking-wider mb-2 font-orbitron">
						NO PORTFOLIO DEPLOYED
					</div>
					<div className="text-sm text-cyan-400/60 font-sans uppercase tracking-wide mb-4">
						FIRST PORTFOLIO WILL BE AUTO-GENERATED WHEN ASSETS ARE MARKED
					</div>
					<button
						onClick={() => (window.location.href = "/platform/identify")}
						className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-400 hover:bg-yellow-500/30 transition-all font-sans text-sm uppercase tracking-wider"
					>
						DEPLOY ASSETS
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg">
			{/* Command Header */}
			<div className="p-4 border-b border-cyan-500/20">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
							<Folder className="w-5 h-5 text-yellow-400" />
						</div>
						<div>
							<h1 className="text-xl font-orbitron font-bold text-yellow-400 uppercase tracking-wider">
								{selectedList?.name || "PORTFOLIO COMMAND"}
							</h1>
							<p className="text-xs text-cyan-400 font-sans mt-1">
								ASSET MANAGEMENT AND TRACKING SYSTEM • {listItems?.length || 0}{" "}
								ASSETS DEPLOYED
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
						<span className="text-xs text-gray-400 font-sans uppercase">
							ACTIVE
						</span>
					</div>
				</div>
			</div>

			<div className="p-0">
				<div className="px-6 py-4 border-b border-cyan-500/20">
					{/* Controls Row */}
					<div className="flex items-center justify-between mb-4">
						{/* View Mode and Actions */}
						<div className="flex items-center gap-3">
							{/* View Mode Toggle - Military Style */}
							<div className="flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded">
								<span className="text-xs text-gray-400 font-sans uppercase">
									Display:
								</span>
								<button
									onClick={() => setViewMode("grid")}
									className={cn(
										"px-3 py-1 text-xs font-sans uppercase transition-all",
										viewMode === "grid"
											? "text-yellow-400 bg-yellow-500/20 border border-yellow-500/30 rounded"
											: "text-gray-400 hover:text-cyan-400",
									)}
								>
									TACTICAL
								</button>
								<button
									onClick={() => setViewMode("list")}
									className={cn(
										"px-3 py-1 text-xs font-sans uppercase transition-all",
										viewMode === "list"
											? "text-yellow-400 bg-yellow-500/20 border border-yellow-500/30 rounded"
											: "text-gray-400 hover:text-cyan-400",
									)}
								>
									MATRIX
								</button>
							</div>

							<div className="h-6 w-px bg-cyan-500/20" />

							<button
								onClick={handleAddContractor}
								className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded text-cyan-400 hover:text-yellow-400 hover:border-yellow-500/30 transition-all"
							>
								<Plus className="h-3 w-3" />
								<span className="text-xs font-sans uppercase">Deploy</span>
							</button>
							<button
								onClick={handleSharePortfolio}
								className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded text-cyan-400 hover:text-yellow-400 hover:border-yellow-500/30 transition-all"
							>
								<Share2 className="h-3 w-3" />
								<span className="text-xs font-sans uppercase">Share</span>
							</button>
							<button
								onClick={handleExportPortfolio}
								className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded text-cyan-400 hover:text-yellow-400 hover:border-yellow-500/30 transition-all"
							>
								<Download className="h-3 w-3" />
								<span className="text-xs font-sans uppercase">Extract</span>
							</button>
						</div>
					</div>

					{/* Search and Filter Bar - Military Style */}
					<div className="mt-4 pt-4 border-t border-cyan-500/10">
						<div className="flex gap-3">
							<div className="flex-1 relative">
								<SearchInput
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Enter target designation, UEI, or codename..."
									className="w-full bg-black/50 border-cyan-500/30 text-cyan-400 placeholder-gray-500 font-sans text-sm"
								/>
								<div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-sans">
									QUERY
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Content Area - Tactical Display */}
			<div className="p-6">
				{/* Status Bar */}
				<div className="mb-4 px-4 py-2 bg-black/50 border border-cyan-500/20 rounded backdrop-blur-sm">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
								<span className="text-xs text-gray-400 font-sans uppercase">
									Status:
								</span>
								<span className="text-xs text-green-400 font-sans uppercase font-bold">
									ACTIVE
								</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-xs text-gray-400 font-sans uppercase">
									Assets:
								</span>
								<span className="text-xs text-cyan-400 font-sans font-bold">
									{filteredItems?.length || 0}
								</span>
							</div>
							{portfolioMetrics && (
								<div className="flex items-center gap-2">
									<span className="text-xs text-gray-400 font-sans uppercase">
										Value:
									</span>
									<span className="text-xs text-yellow-400 font-sans font-bold">
										{formatCurrency(portfolioMetrics.totalValue)}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Portfolio List */}
				{filteredItems.length === 0 ? (
					<EmptyState
						title="No contractors in this list"
						description="Start adding contractors from the Identify Targets page"
						action={
							<Button
								onClick={() => (window.location.href = "/platform/identify")}
								className="bg-yellow-500 hover:bg-yellow-600 text-black"
							>
								Browse Contractors
							</Button>
						}
					/>
				) : viewMode === "grid" ? (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{filteredItems.map((item) => (
							<div key={item.id} className="relative group">
								<HudContractorCard
									contractor={{
										id: item.contractor.id,
										name: item.contractor.displayName,
										industry: item.contractor.primaryIndustryCluster || "Other",
										location: "US",
										state: item.contractor.headquartersState,
										totalContractValue: Number.parseFloat(
											item.contractor.totalObligated,
										),
										pastPerformanceScore: item.contractor.performanceScore,
										totalUeis: item.contractor.totalUeis,
										totalAgencies: item.contractor.totalAgencies,
										activeContracts: item.contractor.totalContracts,
									}}
									isFavorite={true} // Always true since they're in the portfolio
									onToggleFavorite={(contractorId) =>
										handleRemoveContractor(item.contractorProfileId)
									}
									onClick={() => {
										// Navigate to contractor detail
										console.log(
											"View contractor:",
											item.contractor.displayName,
										);
									}}
								/>
								<button
									onClick={() =>
										handleRemoveContractor(item.contractorProfileId)
									}
									className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30"
									title="Remove from list"
								>
									<Trash2 className="h-4 w-4" />
								</button>
							</div>
						))}
					</div>
				) : (
					<ContractorTable
						contractors={filteredItems.map((item) => ({
							id: item.contractor.id,
							name: item.contractor.displayName,
							uei: `PROFILE-${item.contractor.totalUeis}`, // Profile ID with UEI count
							industry: item.contractor.primaryIndustryCluster || "Other",
							location: "US",
							state: item.contractor.headquartersState,
							totalContractValue: Number.parseFloat(
								item.contractor.totalObligated,
							),
							pastPerformanceScore: item.contractor.performanceScore,
							totalUeis: item.contractor.totalUeis,
							totalAgencies: item.contractor.totalAgencies,
							activeContracts: item.contractor.totalContracts,
						}))}
						onRowClick={(contractor) => {
							console.log("View contractor:", contractor.name);
						}}
					/>
				)}
			</div>
		</div>
	);
}
