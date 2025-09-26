import {
	AlertTriangle,
	Award,
	Briefcase,
	Building,
	Calendar,
	Clock,
	DollarSign,
	Download,
	ExternalLink,
	FileText,
	MapPin,
	Star,
	TrendingUp,
	X,
} from "lucide-react";
import React from "react";
import type { Opportunity } from "../../types";
import { Badge, RiskBadge } from "../ui/badge";
import { Button } from "../ui/button";
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	ModalTitle,
} from "../ui/modal";

interface OpportunityDetailModalProps {
	opportunity: Opportunity | null;
	isOpen: boolean;
	onClose: () => void;
	isFavorited?: boolean;
	onToggleFavorite?: () => void;
}

export function OpportunityDetailModal({
	opportunity,
	isOpen,
	onClose,
	isFavorited = false,
	onToggleFavorite,
}: OpportunityDetailModalProps) {
	if (!opportunity) return null;

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			notation: "compact",
			maximumFractionDigits: 1,
		}).format(value);
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	const getDaysUntilDeadline = (deadline?: Date) => {
		if (!deadline) return null;
		const days = Math.ceil(
			(new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
		);
		return days;
	};

	const getUrgencyColor = (days: number | null) => {
		if (!days) return "text-gray-400";
		if (days < 0) return "text-red-500";
		if (days <= 3) return "text-red-400";
		if (days <= 7) return "text-orange-400";
		if (days <= 14) return "text-yellow-400";
		return "text-green-400";
	};

	const daysUntilDeadline = getDaysUntilDeadline(opportunity.responseDeadline);

	return (
		<Modal open={isOpen} onOpenChange={onClose}>
			<ModalContent
				size="xl"
				className="max-w-4xl max-h-[90vh] overflow-y-auto"
			>
				<ModalHeader className="border-b border-dark-gray pb-4">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<div className="flex items-center gap-3 mb-2">
								<Badge
									variant={opportunity.type === "AWD" ? "default" : "outline"}
								>
									{opportunity.type === "AWD" ? (
										<Award className="h-3 w-3 mr-1" />
									) : (
										<FileText className="h-3 w-3 mr-1" />
									)}
									{opportunity.type}
								</Badge>
								<Badge variant="outline" className="font-sans text-xs">
									{opportunity.piid}
								</Badge>
								<RiskBadge level={opportunity.riskLevel} />
							</div>
							<ModalTitle className="text-2xl mb-2 pr-4">
								{opportunity.title}
							</ModalTitle>
							<p className="text-sm text-gray-400 font-aptos">
								{opportunity.agency}
							</p>
							{opportunity.subAgency && (
								<p className="text-xs text-gray-500 font-aptos">
									{opportunity.subAgency}
								</p>
							)}
						</div>
						<div className="flex gap-2">
							{onToggleFavorite && (
								<Button onClick={onToggleFavorite} variant="ghost" size="sm">
									<Star
										className={`h-4 w-4 ${isFavorited ? "fill-yellow-500 text-yellow-500" : "text-gray-400"}`}
									/>
								</Button>
							)}
							<Button onClick={onClose} variant="ghost" size="sm">
								<X className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</ModalHeader>

				<ModalBody className="space-y-6">
					{/* Key Metrics */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="bg-medium-gray rounded-lg p-4">
							<div className="flex items-center gap-2 mb-2">
								<DollarSign className="h-4 w-4 text-yellow-500" />
								<span className="text-sm text-gray-400">Total Value</span>
							</div>
							<p className="text-2xl font-bold text-white">
								{formatCurrency(opportunity.totalValue)}
							</p>
							{opportunity.baseValue && opportunity.optionValue && (
								<p className="text-xs text-gray-500 mt-1">
									Base: {formatCurrency(opportunity.baseValue)} + Options:{" "}
									{formatCurrency(opportunity.optionValue)}
								</p>
							)}
						</div>

						<div className="bg-medium-gray rounded-lg p-4">
							<div className="flex items-center gap-2 mb-2">
								<Clock className="h-4 w-4 text-yellow-500" />
								<span className="text-sm text-gray-400">Response Deadline</span>
							</div>
							{opportunity.responseDeadline ? (
								<>
									<p className="text-lg font-semibold text-white">
										{formatDate(opportunity.responseDeadline)}
									</p>
									<p
										className={`text-sm mt-1 font-medium ${getUrgencyColor(daysUntilDeadline)}`}
									>
										{daysUntilDeadline && daysUntilDeadline > 0
											? `${daysUntilDeadline} days remaining`
											: daysUntilDeadline === 0
												? "Due today!"
												: "Expired"}
									</p>
								</>
							) : (
								<p className="text-lg text-gray-500">Not specified</p>
							)}
						</div>

						<div className="bg-medium-gray rounded-lg p-4">
							<div className="flex items-center gap-2 mb-2">
								<Briefcase className="h-4 w-4 text-yellow-500" />
								<span className="text-sm text-gray-400">Competition</span>
							</div>
							<p className="text-lg font-semibold text-white capitalize">
								{opportunity.competitionLevel?.replace("-", " ") || "Unknown"}
							</p>
							{opportunity.estimatedCompetitors && (
								<p className="text-xs text-gray-500 mt-1">
									Est. {opportunity.estimatedCompetitors} competitors
								</p>
							)}
						</div>
					</div>

					{/* Description */}
					<div className="space-y-3">
						<h3 className="text-lg font-semibold text-yellow-500 font-aptos">
							Description
						</h3>
						<p className="text-sm text-gray-300 font-aptos leading-relaxed">
							{opportunity.description}
						</p>
					</div>

					{/* AI Summary */}
					{opportunity.aiSummary && (
						<div className="space-y-3">
							<h3
								className="text-lg font-semibold text-yellow-500 flex items-center gap-2"
								style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							>
								<TrendingUp className="h-4 w-4" />
								AI Analysis
							</h3>
							<div className="bg-medium-gray rounded-lg p-4">
								<p className="text-sm text-gray-300 font-aptos italic">
									{opportunity.aiSummary}
								</p>
							</div>
						</div>
					)}

					{/* Key Requirements */}
					{opportunity.keyRequirements &&
						opportunity.keyRequirements.length > 0 && (
							<div className="space-y-3">
								<h3 className="text-lg font-semibold text-yellow-500 font-aptos">
									Key Requirements
								</h3>
								<div className="grid grid-cols-2 gap-2">
									{opportunity.keyRequirements.map((req, index) => (
										<div key={index} className="flex items-center gap-2">
											<div className="w-2 h-2 bg-yellow-500 rounded-full" />
											<span className="text-sm text-gray-300 font-aptos">
												{req}
											</span>
										</div>
									))}
								</div>
							</div>
						)}

					{/* Contract Details */}
					<div className="space-y-3">
						<h3 className="text-lg font-semibold text-yellow-500 font-aptos">
							Contract Details
						</h3>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-gray-400">Posted Date:</span>
									<span className="text-white">
										{formatDate(opportunity.postedDate)}
									</span>
								</div>
								{opportunity.startDate && (
									<div className="flex justify-between">
										<span className="text-gray-400">Start Date:</span>
										<span className="text-white">
											{formatDate(opportunity.startDate)}
										</span>
									</div>
								)}
								{opportunity.endDate && (
									<div className="flex justify-between">
										<span className="text-gray-400">End Date:</span>
										<span className="text-white">
											{formatDate(opportunity.endDate)}
										</span>
									</div>
								)}
								{opportunity.naicsCode && (
									<div className="flex justify-between">
										<span className="text-gray-400">NAICS Code:</span>
										<span className="text-white font-sans">
											{opportunity.naicsCode}
										</span>
									</div>
								)}
							</div>
							<div className="space-y-2">
								{opportunity.setAsideType && (
									<div className="flex justify-between">
										<span className="text-gray-400">Set-Aside:</span>
										<span className="text-white">
											{opportunity.setAsideType}
										</span>
									</div>
								)}
								{opportunity.placeOfPerformance && (
									<div className="flex justify-between">
										<span className="text-gray-400">Location:</span>
										<span className="text-white">
											{opportunity.placeOfPerformance}
										</span>
									</div>
								)}
								{opportunity.incumbent && (
									<div className="flex justify-between">
										<span className="text-gray-400">Incumbent:</span>
										<span className="text-white">{opportunity.incumbent}</span>
									</div>
								)}
								<div className="flex justify-between">
									<span className="text-gray-400">Risk Level:</span>
									<RiskBadge level={opportunity.riskLevel} />
								</div>
							</div>
						</div>
					</div>

					{/* Timeline Visualization */}
					{(opportunity.startDate || opportunity.endDate) && (
						<div className="space-y-3">
							<h3 className="text-lg font-semibold text-yellow-500 font-aptos">
								Timeline
							</h3>
							<div className="bg-medium-gray rounded-lg p-4">
								<div className="relative">
									<div className="absolute left-0 top-1/2 w-full h-1 bg-dark-gray -translate-y-1/2" />
									<div className="relative flex justify-between">
										{opportunity.postedDate && (
											<div className="flex flex-col items-center">
												<div className="w-3 h-3 bg-gray-500 rounded-full mb-2" />
												<span className="text-xs text-gray-400">Posted</span>
												<span className="text-xs text-gray-500">
													{new Date(
														opportunity.postedDate,
													).toLocaleDateString()}
												</span>
											</div>
										)}
										{opportunity.responseDeadline && (
											<div className="flex flex-col items-center">
												<div className="w-3 h-3 bg-yellow-500 rounded-full mb-2" />
												<span className="text-xs text-yellow-400">
													Deadline
												</span>
												<span className="text-xs text-gray-500">
													{new Date(
														opportunity.responseDeadline,
													).toLocaleDateString()}
												</span>
											</div>
										)}
										{opportunity.startDate && (
											<div className="flex flex-col items-center">
												<div className="w-3 h-3 bg-green-500 rounded-full mb-2" />
												<span className="text-xs text-green-400">Start</span>
												<span className="text-xs text-gray-500">
													{new Date(opportunity.startDate).toLocaleDateString()}
												</span>
											</div>
										)}
										{opportunity.endDate && (
											<div className="flex flex-col items-center">
												<div className="w-3 h-3 bg-red-500 rounded-full mb-2" />
												<span className="text-xs text-red-400">End</span>
												<span className="text-xs text-gray-500">
													{new Date(opportunity.endDate).toLocaleDateString()}
												</span>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Actions */}
					<div className="flex gap-3 pt-4 border-t border-dark-gray">
						<Button
							className="bg-yellow-500 hover:bg-yellow-600 text-black"
							size="sm"
						>
							<Download className="h-4 w-4 mr-2" />
							Download RFP
						</Button>
						<Button variant="outline" size="sm" className="border-dark-gray">
							<ExternalLink className="h-4 w-4 mr-2" />
							View on SAM.gov
						</Button>
						<Button variant="outline" size="sm" className="border-dark-gray">
							Track Opportunity
						</Button>
						<Button variant="outline" size="sm" className="border-dark-gray">
							Create Bid Team
						</Button>
					</div>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
