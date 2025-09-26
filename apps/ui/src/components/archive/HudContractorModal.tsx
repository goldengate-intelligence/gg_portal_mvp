import { Database, ExternalLink, Target, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { cn } from "../../logic/utils";
import type { Contractor } from "../../types";
import { ContractorDetail } from "../contractor-detail/ContractorDetail_Orchestrator";
import { TargetReticle } from "../ui/hud-card";
import { Modal, ModalContent } from "../ui/modal";

interface HudContractorModalProps {
	contractor: Contractor | null;
	isOpen: boolean;
	onClose: () => void;
	onAddToPortfolio?: (contractor: Contractor) => void;
}

export function HudContractorModal({
	contractor,
	isOpen,
	onClose,
	onAddToPortfolio,
}: HudContractorModalProps) {
	const [activeTab, setActiveTab] = useState("overview");

	// Format currency values
	const formatCurrency = (value: number): string => {
		if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
		if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
		if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
		return `$${value.toLocaleString()}`;
	};

	// Early return if no contractor
	if (!contractor) return null;

	return (
		<Modal open={isOpen} onOpenChange={onClose}>
			<ModalContent
				size="4xl"
				className="bg-black/95 border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(0,217,255,0.3)] max-h-[90vh] overflow-hidden"
			>
				<div className="relative h-full flex flex-col">
					{/* Animated background grid */}
					<div className="absolute inset-0 opacity-10 pointer-events-none">
						<div className="absolute inset-0 tactical-grid" />
					</div>

					{/* Header - Military Command Style */}
					<div className="relative border-b border-cyan-500/30 bg-black/80 backdrop-blur-xl flex-shrink-0">
						<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-yellow-500/5" />

						<div className="relative p-4">
							<div className="flex items-start justify-between">
								<div className="flex items-start gap-4">
									{/* Target Reticle */}
									<div className="relative">
										<TargetReticle size={50} color="#FFD700" animated={true} />
										<div className="absolute inset-0 flex items-center justify-center">
											<Target className="w-5 h-5 text-yellow-400" />
										</div>
									</div>

									{/* Target Information */}
									<div>
										<div className="flex items-center gap-2 mb-1">
											<span className="text-xs text-cyan-400 font-sans uppercase tracking-wider">
												TARGET PROFILE
											</span>
											<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
											<span className="text-xs text-green-400 font-sans uppercase">
												ACTIVE
											</span>
										</div>
										<h2 className="text-xl font-orbitron font-bold text-yellow-400 uppercase tracking-wide mb-1">
											{contractor.name}
										</h2>
										{contractor.dbaName && (
											<p className="text-sm text-cyan-400/70 font-sans">
												ALIAS: {contractor.dbaName}
											</p>
										)}

										{/* Tactical badges */}
										<div className="flex items-center gap-2 mt-2">
											<div className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded">
												<span className="text-xs text-cyan-400 font-sans">
													UEI: {contractor.uei}
												</span>
											</div>
											<div className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded">
												<span className="text-xs text-yellow-400 font-sans uppercase">
													{contractor.industry.replace("-", " ")}
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex items-center gap-2">
									{onAddToPortfolio && (
										<button
											onClick={() => onAddToPortfolio(contractor)}
											className="px-3 py-2 bg-green-500/10 border border-green-500/30 rounded text-green-400 hover:bg-green-500/20 transition-all text-xs font-sans uppercase tracking-wider"
										>
											ADD TO PORTFOLIO
										</button>
									)}
									<button
										onClick={() =>
											window.open(
												`/platform/contractor-detail/${contractor.id}`,
												"_blank",
											)
										}
										className="px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 hover:bg-cyan-500/20 transition-all text-xs font-sans uppercase tracking-wider"
									>
										<Database className="inline w-3 h-3 mr-2" />
										FULL REPORT
										<ExternalLink className="inline w-3 h-3 ml-2" />
									</button>
									<button
										onClick={onClose}
										className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
									>
										<X className="w-5 h-5" />
									</button>
								</div>
							</div>

							{/* Quick Stats */}
							<div className="mt-4 pt-4 border-t border-cyan-500/10">
								<div className="grid grid-cols-4 gap-4">
									<div className="text-center">
										<div className="text-xs text-gray-400 font-sans uppercase mb-1">
											Contract Value
										</div>
										<div className="text-lg font-bold text-cyan-400 font-sans">
											{contractor.totalContractValue
												? formatCurrency(contractor.totalContractValue)
												: "CLASSIFIED"}
										</div>
									</div>
									<div className="text-center">
										<div className="text-xs text-gray-400 font-sans uppercase mb-1">
											Performance
										</div>
										<div className="text-lg font-bold text-yellow-400 font-sans">
											{contractor.pastPerformanceScore
												? `${contractor.pastPerformanceScore}%`
												: "N/A"}
										</div>
									</div>
									<div className="text-center">
										<div className="text-xs text-gray-400 font-sans uppercase mb-1">
											Active Ops
										</div>
										<div className="text-lg font-bold text-green-400 font-sans">
											{contractor.activeContracts?.toLocaleString() || "N/A"}
										</div>
									</div>
									<div className="text-center">
										<div className="text-xs text-gray-400 font-sans uppercase mb-1">
											Agencies
										</div>
										<div className="text-lg font-bold text-cyan-400 font-sans">
											{contractor.totalAgencies || "N/A"}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Body Content - Modular ContractorDetail */}
					<div className="relative flex-1 overflow-hidden">
						<ContractorDetail
							contractorId={contractor.id}
							onActiveTabChange={setActiveTab}
						/>
					</div>
				</div>
			</ModalContent>
		</Modal>
	);
}
