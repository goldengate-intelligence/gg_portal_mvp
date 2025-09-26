import {
	AlertCircle,
	Brain,
	Building,
	Calendar,
	ChevronRight,
	Clock,
	Search,
	Shield,
	Sliders,
	TrendingUp,
	X,
} from "lucide-react";
import React, { useState } from "react";
import { mockContractors } from "../../data/mock-data";
import type { AnalysisType, Contractor } from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/checkbox";
import { SearchInput } from "../ui/input";
import { Label } from "../ui/label";
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "../ui/modal";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";

interface DeploymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	analysisType: AnalysisType;
	onDeploy: (contractor: Contractor, parameters: any) => void;
}

export function DeploymentModal({
	isOpen,
	onClose,
	analysisType,
	onDeploy,
}: DeploymentModalProps) {
	const [selectedContractor, setSelectedContractor] =
		useState<Contractor | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [parameters, setParameters] = useState({
		timeRange: "12-months",
		comparisonMode: "peers",
		detailLevel: "standard",
		includeForecasting: true,
		confidenceThreshold: 85,
	});

	const getAnalysisIcon = () => {
		switch (analysisType) {
			case "revenue-analytics":
				return TrendingUp;
			case "forensic-due-diligence":
				return Search;
			case "agency-exposure":
				return Building;
			case "market-perception":
				return Brain;
			default:
				return TrendingUp;
		}
	};

	const getAnalysisTitle = () => {
		switch (analysisType) {
			case "revenue-analytics":
				return "Revenue Analytics Deployment";
			case "forensic-due-diligence":
				return "Forensic Due Diligence Deployment";
			case "agency-exposure":
				return "Agency Exposure Analysis";
			case "market-perception":
				return "Market Perception Analysis";
			default:
				return "Analysis Deployment";
		}
	};

	const filteredContractors = mockContractors
		.filter((c) => {
			if (!searchQuery) return true;
			const query = searchQuery.toLowerCase();
			return (
				c.name.toLowerCase().includes(query) ||
				c.uei.toLowerCase().includes(query) ||
				c.dbaName?.toLowerCase().includes(query)
			);
		})
		.slice(0, 5);

	const handleDeploy = () => {
		if (!selectedContractor) return;
		onDeploy(selectedContractor, parameters);
	};

	const Icon = getAnalysisIcon();

	return (
		<Modal open={isOpen} onOpenChange={onClose}>
			<ModalContent size="lg" className="max-w-2xl">
				<ModalHeader className="border-b border-gray-800 pb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500">
								<Icon className="h-5 w-5 text-yellow-500" />
							</div>
							<div>
								<ModalTitle className="text-xl">
									{getAnalysisTitle()}
								</ModalTitle>
								<p className="text-sm text-gray-400 mt-1">
									Configure and deploy analytical model
								</p>
							</div>
						</div>
						<Button onClick={onClose} variant="ghost" size="sm">
							<X className="h-4 w-4" />
						</Button>
					</div>
				</ModalHeader>

				<ModalBody className="space-y-6 py-6">
					{/* Contractor Selection */}
					<div className="space-y-3">
						<Label className="text-sm font-medium text-gray-300">
							Select Contractor
						</Label>
						<SearchInput
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search contractors by name or UEI..."
							className="w-full"
						/>

						{searchQuery && (
							<div className="space-y-2">
								{filteredContractors.length === 0 ? (
									<div className="text-center py-4 text-gray-500">
										No contractors found
									</div>
								) : (
									filteredContractors.map((contractor) => (
										<div
											key={contractor.id}
											onClick={() => {
												setSelectedContractor(contractor);
												setSearchQuery("");
											}}
											className={`p-3 rounded-lg border cursor-pointer transition-all ${
												selectedContractor?.id === contractor.id
													? "border-yellow-500 bg-yellow-500/10"
													: "border-yellow-500/20 hover:border-yellow-500/30 bg-dark-gold/50"
											}`}
										>
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium text-white">
														{contractor.name}
													</p>
													<p className="text-xs text-gray-400 font-sans">
														{contractor.uei}
													</p>
												</div>
												<ChevronRight className="h-4 w-4 text-gray-400" />
											</div>
										</div>
									))
								)}
							</div>
						)}

						{selectedContractor && !searchQuery && (
							<div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium text-white">
											{selectedContractor.name}
										</p>
										<p className="text-xs text-gray-400 font-sans">
											{selectedContractor.uei}
										</p>
										<div className="flex items-center gap-2 mt-2">
											<Badge variant="outline" className="text-xs">
												{selectedContractor.industry}
											</Badge>
											<Badge variant="outline" className="text-xs">
												{selectedContractor.location}
											</Badge>
										</div>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setSelectedContractor(null)}
									>
										Change
									</Button>
								</div>
							</div>
						)}
					</div>

					{/* Analysis Parameters */}
					<div className="space-y-4">
						<Label className="text-sm font-medium text-gray-300">
							Analysis Parameters
						</Label>

						{/* Time Range */}
						<div className="space-y-2">
							<Label className="text-xs text-gray-400">Time Range</Label>
							<Select
								value={parameters.timeRange}
								onValueChange={(value) =>
									setParameters((prev) => ({ ...prev, timeRange: value }))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="3-months">Last 3 Months</SelectItem>
									<SelectItem value="6-months">Last 6 Months</SelectItem>
									<SelectItem value="12-months">Last 12 Months</SelectItem>
									<SelectItem value="24-months">Last 24 Months</SelectItem>
									<SelectItem value="all-time">All Time</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Comparison Mode */}
						<div className="space-y-2">
							<Label className="text-xs text-gray-400">Comparison Mode</Label>
							<RadioGroup
								value={parameters.comparisonMode}
								onValueChange={(value) =>
									setParameters((prev) => ({ ...prev, comparisonMode: value }))
								}
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="peers" id="peers" />
									<Label
										htmlFor="peers"
										className="text-sm text-gray-300 cursor-pointer"
									>
										Compare with Industry Peers
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="historical" id="historical" />
									<Label
										htmlFor="historical"
										className="text-sm text-gray-300 cursor-pointer"
									>
										Historical Performance Only
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="market" id="market" />
									<Label
										htmlFor="market"
										className="text-sm text-gray-300 cursor-pointer"
									>
										Market-wide Benchmarking
									</Label>
								</div>
							</RadioGroup>
						</div>

						{/* Detail Level */}
						<div className="space-y-2">
							<Label className="text-xs text-gray-400">
								Analysis Detail Level
							</Label>
							<Select
								value={parameters.detailLevel}
								onValueChange={(value) =>
									setParameters((prev) => ({ ...prev, detailLevel: value }))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="summary">Summary Only</SelectItem>
									<SelectItem value="standard">Standard Analysis</SelectItem>
									<SelectItem value="detailed">Detailed Deep Dive</SelectItem>
									<SelectItem value="comprehensive">
										Comprehensive Report
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Confidence Threshold */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label className="text-xs text-gray-400">
									Confidence Threshold
								</Label>
								<span className="text-xs text-yellow-500">
									{parameters.confidenceThreshold}%
								</span>
							</div>
							<Slider
								value={[parameters.confidenceThreshold]}
								onValueChange={(value) =>
									setParameters((prev) => ({
										...prev,
										confidenceThreshold: value[0],
									}))
								}
								min={50}
								max={100}
								step={5}
								className="w-full"
							/>
							<p className="text-xs text-gray-500">
								Only show insights with confidence above this threshold
							</p>
						</div>
					</div>

					{/* Estimated Processing Time */}
					<div className="p-4 rounded-lg bg-dark-gold border border-yellow-500/20">
						<div className="flex items-start gap-3">
							<Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
							<div>
								<p className="text-sm font-medium text-white">
									Estimated Processing Time
								</p>
								<p className="text-xs text-gray-400 mt-1">
									{parameters.detailLevel === "summary" && "1-2 minutes"}
									{parameters.detailLevel === "standard" && "3-5 minutes"}
									{parameters.detailLevel === "detailed" && "5-8 minutes"}
									{parameters.detailLevel === "comprehensive" &&
										"10-15 minutes"}
								</p>
							</div>
						</div>
					</div>

					{/* Warning if no contractor selected */}
					{!selectedContractor && (
						<div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/50">
							<div className="flex items-start gap-3">
								<AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
								<div>
									<p className="text-sm font-medium text-orange-400">
										No Contractor Selected
									</p>
									<p className="text-xs text-gray-400 mt-1">
										Please search and select a contractor to analyze
									</p>
								</div>
							</div>
						</div>
					)}
				</ModalBody>

				<ModalFooter className="border-t border-gray-800 pt-4">
					<div className="flex justify-between items-center w-full">
						<div className="text-xs text-gray-400">
							<Sliders className="h-3 w-3 inline mr-1" />
							{Object.keys(parameters).length} parameters configured
						</div>
						<div className="flex gap-3">
							<Button
								variant="outline"
								onClick={onClose}
								className="border-gray-600"
							>
								Cancel
							</Button>
							<Button
								onClick={handleDeploy}
								disabled={!selectedContractor}
								className="bg-yellow-500 hover:bg-yellow-600 text-black disabled:opacity-50"
							>
								Deploy Analysis
							</Button>
						</div>
					</div>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
