import {
	Activity,
	AlertTriangle,
	BarChart3,
	Brain,
	Building,
	Clock,
	Download,
	FileText,
	Play,
	Radar,
	Search,
	Share2,
	Shield,
	Target,
	TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { DeploymentModal } from "../../components/platform/DeploymentModal";
import { DeploymentResults } from "../../components/platform/DeploymentResults";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import { mockAnalysisResults, mockContractors } from "../../data/mock-data";
import { cn } from "../../logic/utils";
import type { AnalysisResult, AnalysisType, Contractor } from "../../types";

export function AnalysisMode() {
	const [selectedContractor, setSelectedContractor] =
		useState<Contractor | null>(null);
	const [selectedAnalysisType, setSelectedAnalysisType] =
		useState<AnalysisType | null>(null);
	const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false);
	const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(
		null,
	);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [recentAnalyses, setRecentAnalyses] =
		useState<AnalysisResult[]>(mockAnalysisResults);

	const analysisTypes = [
		{
			id: "revenue-analytics" as AnalysisType,
			title: "Revenue Analytics",
			description:
				"Analyze revenue trends, growth patterns, and financial performance",
			icon: TrendingUp,
			color: "text-green-500",
			bgColor: "bg-green-500/10",
			borderColor: "border-green-500",
			estimatedTime: "2-3 minutes",
			dataPoints: [
				"Historical Revenue",
				"Growth Trends",
				"Peer Comparison",
				"Forecasting",
			],
		},
		{
			id: "forensic-due-diligence" as AnalysisType,
			title: "Forensic Due Diligence",
			description:
				"Deep dive into compliance, risk factors, and operational integrity",
			icon: Search,
			color: "text-gray-400",
			bgColor: "bg-gray-400/10",
			borderColor: "border-gray-400",
			estimatedTime: "5-7 minutes",
			dataPoints: [
				"Compliance History",
				"Risk Assessment",
				"Financial Stability",
				"Operational Review",
			],
		},
		{
			id: "agency-exposure" as AnalysisType,
			title: "Agency Exposure",
			description: "Track agency relationships and contract concentration risk",
			icon: Building,
			color: "text-purple-500",
			bgColor: "bg-purple-500/10",
			borderColor: "border-purple-500",
			estimatedTime: "3-4 minutes",
			dataPoints: [
				"Agency Distribution",
				"Contract Concentration",
				"Relationship Mapping",
				"Risk Analysis",
			],
		},
		{
			id: "market-perception" as AnalysisType,
			title: "Market Perception",
			description: "Analyze market positioning and competitive landscape",
			icon: Brain,
			color: "text-orange-500",
			bgColor: "bg-orange-500/10",
			borderColor: "border-orange-500",
			estimatedTime: "4-5 minutes",
			dataPoints: [
				"Market Position",
				"Competitive Analysis",
				"Industry Trends",
				"Reputation Score",
			],
		},
	];

	const handleDeployAnalysis = (type: AnalysisType) => {
		setSelectedAnalysisType(type);
		setIsDeploymentModalOpen(true);
	};

	const handleRunAnalysis = (contractor: Contractor, parameters: any) => {
		setSelectedContractor(contractor);
		setIsDeploymentModalOpen(false);
		setIsAnalyzing(true);

		// Simulate analysis processing
		setTimeout(() => {
			// Find or create mock analysis result
			const existingResult = mockAnalysisResults.find(
				(r) =>
					r.contractorId === contractor.id && r.type === selectedAnalysisType,
			);

			const result = existingResult || {
				id: Date.now().toString(),
				type: selectedAnalysisType!,
				contractorId: contractor.id,
				userId: "current-user",
				summary: `Analysis completed for ${contractor.name}. Key insights have been generated based on the selected parameters.`,
				keyFindings: [
					"Strong performance metrics identified",
					"Growth trajectory aligns with industry trends",
					"Risk factors within acceptable range",
					"Opportunities for expansion identified",
				],
				riskAssessment: "low" as const,
				confidence: 85,
				metrics: {
					score: 87,
					trend: "positive",
					percentile: 92,
				},
				createdAt: new Date(),
				parameters,
				executionTime: Math.floor(Math.random() * 5000) + 2000,
			};

			setCurrentAnalysis(result);
			setIsAnalyzing(false);

			// Add to recent analyses if not already there
			if (!existingResult) {
				setRecentAnalyses((prev) => [result, ...prev]);
			}
		}, 3000);
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getAnalysisTypeInfo = (type: AnalysisType) => {
		return analysisTypes.find((t) => t.id === type);
	};

	return (
		<div className="w-full bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg">
			{/* Command Header */}
			<div className="p-4 border-b border-cyan-500/20">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
							<Radar className="w-5 h-5 text-yellow-400" />
						</div>
						<div>
							<h1 className="text-xl font-orbitron font-bold text-yellow-400 uppercase tracking-wider">
								INTELLIGENCE OPERATIONS
							</h1>
							<p className="text-xs text-cyan-400 font-sans mt-1">
								ADVANCED ANALYTICAL WARFARE SYSTEMS • {recentAnalyses.length}{" "}
								OPERATIONS COMPLETED
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
						<span className="text-xs text-gray-400 font-sans uppercase">
							{isAnalyzing ? "PROCESSING" : "READY"}
						</span>
					</div>
				</div>
			</div>

			<div className="p-0">
				<div className="px-6 py-4 border-b border-cyan-500/20">
					{/* Controls Row */}
					<div className="flex items-center justify-between mb-4">
						{/* Analysis Status */}
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded">
								<Clock className="h-3 w-3 text-cyan-400" />
								<span className="text-xs text-gray-400 font-sans uppercase">
									Recent:
								</span>
								<span className="text-xs text-cyan-400 font-sans font-bold">
									{recentAnalyses.length}
								</span>
							</div>
							<div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded">
								<Brain className="h-3 w-3 text-cyan-400" />
								<span className="text-xs text-gray-400 font-sans uppercase">
									Models:
								</span>
								<span className="text-xs text-cyan-400 font-sans font-bold">
									{analysisTypes.length}
								</span>
							</div>
							{isAnalyzing && (
								<div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/50 rounded">
									<div className="animate-spin rounded-full h-3 w-3 border-2 border-yellow-400 border-t-transparent" />
									<span className="text-xs text-yellow-400 font-sans uppercase">
										ANALYZING...
									</span>
								</div>
							)}
						</div>

						{/* Actions */}
						<div className="flex items-center gap-2">
							<button
								onClick={() => setCurrentAnalysis(null)}
								disabled={!currentAnalysis}
								className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded text-cyan-400 hover:text-yellow-400 hover:border-yellow-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<FileText className="h-3 w-3" />
								<span className="text-xs font-sans uppercase">History</span>
							</button>
							<button
								onClick={() => console.log("Export all analyses")}
								className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded text-cyan-400 hover:text-yellow-400 hover:border-yellow-500/30 transition-all"
							>
								<Download className="h-3 w-3" />
								<span className="text-xs font-sans uppercase">Export</span>
							</button>
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
									{isAnalyzing ? "OPERATION ACTIVE" : "SYSTEMS READY"}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-xs text-gray-400 font-sans uppercase">
									Workflows:
								</span>
								<span className="text-xs text-cyan-400 font-sans font-bold">
									{analysisTypes.length} AVAILABLE
								</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-xs text-gray-400 font-sans uppercase">
									Completed:
								</span>
								<span className="text-xs text-yellow-400 font-sans font-bold">
									{recentAnalyses.length}
								</span>
							</div>
						</div>
					</div>
				</div>

				{currentAnalysis ? (
					<DeploymentResults
						analysis={currentAnalysis}
						contractor={mockContractors.find(
							(c) => c.id === currentAnalysis.contractorId,
						)}
						onBack={() => setCurrentAnalysis(null)}
						onExport={() => console.log("Exporting analysis...")}
						onShare={() => console.log("Sharing analysis...")}
					/>
				) : (
					<>
						{/* Analysis in Progress Alert */}
						{isAnalyzing && (
							<div className="mb-6 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-lg p-4 relative">
								{/* Tactical grid overlay */}
								<div className="absolute inset-0 opacity-5 pointer-events-none rounded-lg overflow-hidden">
									<div className="absolute inset-0 tactical-grid" />
								</div>

								<div className="relative z-10 flex items-center gap-3">
									<div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent" />
									<div className="flex-1">
										<p className="text-sm text-yellow-400 font-orbitron font-bold uppercase tracking-wider">
											OPERATION IN PROGRESS
										</p>
										<p className="text-xs text-cyan-400 font-sans mt-1">
											EXECUTING{" "}
											{selectedAnalysisType?.replace("-", " ").toUpperCase()} ON
											TARGET: {selectedContractor?.name?.toUpperCase()}
										</p>
									</div>
									<div className="w-32 h-2 bg-black/50 rounded-full overflow-hidden border border-cyan-500/20">
										<div
											className="h-full bg-yellow-400 animate-pulse"
											style={{ width: "60%" }}
										/>
									</div>
								</div>
							</div>
						)}

						{/* Analysis Type Selection */}
						<div className="mb-8">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-lg font-orbitron font-bold text-yellow-400 uppercase tracking-wider">
									AVAILABLE OPERATIONS
								</h2>
								<span className="text-xs text-gray-400 font-sans uppercase">
									SELECT TO DEPLOY
								</span>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{analysisTypes.map((type) => {
									const Icon = type.icon;
									return (
										<div
											key={type.id}
											className="bg-black/30 border border-cyan-500/20 rounded-lg p-6 cursor-pointer hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all duration-200 group relative"
											onClick={() => handleDeployAnalysis(type.id)}
										>
											{/* HUD Corner accents */}
											<div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/40 group-hover:border-yellow-400/60" />
											<div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/40 group-hover:border-yellow-400/60" />
											<div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/40 group-hover:border-yellow-400/60" />
											<div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/40 group-hover:border-yellow-400/60" />

											<div className="flex items-start justify-between mb-4">
												<div className="flex items-center gap-3">
													<div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
														<Icon className="h-5 w-5 text-cyan-400" />
													</div>
													<div>
														<h3 className="text-lg font-orbitron font-bold text-yellow-400 uppercase tracking-wider">
															{type.title.replace(/\s/g, " ")}
														</h3>
														<p className="text-xs text-gray-400 font-sans mt-1 uppercase">
															{type.description}
														</p>
													</div>
												</div>
											</div>

											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<span className="text-xs text-gray-400 font-sans uppercase">
														Duration:
													</span>
													<span className="text-xs text-cyan-400 font-sans">
														{type.estimatedTime}
													</span>
												</div>

												<div className="pt-3 border-t border-cyan-500/20">
													<div className="flex flex-wrap gap-1 mb-3">
														{type.dataPoints.slice(0, 3).map((point) => (
															<span
																key={point}
																className="text-xs px-2 py-1 bg-black/50 rounded text-gray-400 font-sans border border-cyan-500/20"
															>
																{point}
															</span>
														))}
														{type.dataPoints.length > 3 && (
															<span className="text-xs px-2 py-1 text-gray-500 font-sans">
																+{type.dataPoints.length - 3} MORE
															</span>
														)}
													</div>

													<button
														className="w-full opacity-0 group-hover:opacity-100 transition-opacity bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 hover:border-yellow-500/50 rounded py-2 px-3 text-xs font-sans uppercase tracking-wider flex items-center justify-center gap-2"
														onClick={(e) => {
															e.stopPropagation();
															handleDeployAnalysis(type.id);
														}}
													>
														<Target className="h-3 w-3" />
														DEPLOY OPERATION
													</button>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* Recent Operations */}
						<div>
							<h2 className="text-lg font-orbitron font-bold text-yellow-400 uppercase tracking-wider mb-4">
								RECENT OPERATIONS
							</h2>
							{recentAnalyses.length === 0 ? (
								<div className="bg-black/30 border border-cyan-500/20 rounded-lg p-8 text-center relative">
									{/* Tactical grid overlay */}
									<div className="absolute inset-0 opacity-5 pointer-events-none rounded-lg overflow-hidden">
										<div className="absolute inset-0 tactical-grid" />
									</div>

									<div className="relative z-10">
										<div className="w-16 h-16 mx-auto mb-6 border-2 border-cyan-500/30 rounded-full flex items-center justify-center">
											<FileText className="h-8 w-8 text-cyan-400" />
										</div>
										<p className="text-yellow-400 font-orbitron font-bold uppercase tracking-wider mb-2">
											NO OPERATIONS DEPLOYED
										</p>
										<p className="text-xs text-gray-400 font-sans uppercase">
											SELECT AN OPERATION TYPE ABOVE TO INITIALIZE
										</p>
									</div>
								</div>
							) : (
								<div className="space-y-4">
									{recentAnalyses.map((analysis) => {
										const contractor = mockContractors.find(
											(c) => c.id === analysis.contractorId,
										);
										const typeInfo = getAnalysisTypeInfo(analysis.type);
										const TypeIcon = typeInfo?.icon || BarChart3;

										return (
											<div
												key={analysis.id}
												className="bg-black/30 border border-cyan-500/20 rounded-lg p-4 cursor-pointer hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all group"
												onClick={() => setCurrentAnalysis(analysis)}
											>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-4">
														<div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
															<TypeIcon className="h-5 w-5 text-cyan-400" />
														</div>
														<div>
															<div className="flex items-center gap-2">
																<h3 className="font-orbitron font-bold text-yellow-400 uppercase tracking-wider text-sm">
																	{typeInfo?.title || analysis.type}
																</h3>
																<span className="text-cyan-400">•</span>
																<span className="text-xs text-cyan-400 font-sans uppercase">
																	TARGET: {contractor?.name || "UNKNOWN"}
																</span>
															</div>
															<p className="text-xs text-gray-400 font-sans mt-1">
																{formatDate(analysis.createdAt)} •{" "}
																{Math.round(analysis.executionTime / 1000)}S
																EXECUTION
															</p>
														</div>
													</div>
													<div className="flex items-center gap-3">
														<div className="text-right">
															<div className="flex items-center gap-2 mb-1">
																<span className="text-xs text-gray-400 font-sans uppercase">
																	Confidence:
																</span>
																<span
																	className={cn(
																		"text-xs font-sans font-bold",
																		analysis.confidence >= 80
																			? "text-green-400"
																			: analysis.confidence >= 60
																				? "text-yellow-400"
																				: "text-red-400",
																	)}
																>
																	{analysis.confidence}%
																</span>
															</div>
															<div className="flex items-center gap-2">
																<span className="text-xs text-gray-400 font-sans uppercase">
																	Threat:
																</span>
																<span
																	className={cn(
																		"text-xs font-sans font-bold uppercase",
																		analysis.riskAssessment === "low"
																			? "text-green-400"
																			: analysis.riskAssessment === "medium"
																				? "text-yellow-400"
																				: "text-red-400",
																	)}
																>
																	{analysis.riskAssessment}
																</span>
															</div>
														</div>
														<button
															className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 hover:text-yellow-400 hover:border-yellow-500/30 transition-all text-xs font-sans uppercase"
															onClick={(e) => {
																e.stopPropagation();
																setCurrentAnalysis(analysis);
															}}
														>
															ACCESS →
														</button>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</>
				)}
			</div>

			{/* Deployment Modal */}
			{selectedAnalysisType && (
				<DeploymentModal
					isOpen={isDeploymentModalOpen}
					onClose={() => {
						setIsDeploymentModalOpen(false);
						setSelectedAnalysisType(null);
					}}
					analysisType={selectedAnalysisType}
					onDeploy={handleRunAnalysis}
				/>
			)}
		</div>
	);
}
