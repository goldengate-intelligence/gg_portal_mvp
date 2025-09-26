import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FolderOpen } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { CONTRACTOR_DETAIL_COLORS } from "../../logic/utils";
import { contractorLogoService } from "../../services/contractors/contractor-logo-service";
import { lushaEnrichmentService } from "../../services/contractors/lusha-enrichment-service";
import { useIndustrySummary } from "../../services/reference-data";
import type { Contractor } from "../../types";
import type { ActivityEvent } from "./tabs/network/types";
import type { UniversalMetrics, PeerComparisonData, UnifiedContractorData } from "./services/unified-data-adapter";
import { Button } from "../ui/button";

interface ContractorDetailHeaderProps {
	// Use unified contractor data for proper data sourcing
	unifiedData?: UnifiedContractorData;
	// Legacy contractor for backward compatibility
	contractor?: Contractor | null;
}

export function ContractorDetailHeader({
	unifiedData,
	contractor,
}: ContractorDetailHeaderProps) {
	// Extract data from unified data or fallback to legacy contractor
	const contractorInfo = unifiedData?.contractor || {
		uei: contractor?.uei || "UNKNOWN12345",
		name: contractor?.name || "Trio Fabrication LLC",
		location: {
			state: contractor?.state,
			city: contractor?.city
		}
	};
	const activityEvents = unifiedData?.activityEvents;
	const metrics = unifiedData?.metrics;
	const peerData = unifiedData?.peerData;

	// Calculate Primary NAICS (heaviest dollar weight among active awards)
	const primaryNAICS = useMemo(() => {
		if (!activityEvents?.length) return null;

		const naicsWeights = new Map<string, number>();

		activityEvents.forEach(event => {
			// Only consider inflow events (where this contractor is the recipient)
			if (event.FLOW_DIRECTION === 'INFLOW' && event.NAICS_CODE && event.EVENT_AMOUNT) {
				const current = naicsWeights.get(event.NAICS_CODE) || 0;
				naicsWeights.set(event.NAICS_CODE, current + event.EVENT_AMOUNT);
			}
		});

		if (naicsWeights.size === 0) return null;

		// Find NAICS with highest total award value
		const sortedNAICS = Array.from(naicsWeights.entries())
			.sort((a, b) => b[1] - a[1]);

		return sortedNAICS[0][0];
	}, [activityEvents]);

	// Calculate Agency Focus (Defense vs Civilian based on 50%+ defense awards)
	const agencyFocus = useMemo(() => {
		if (!activityEvents?.length) return "Defense";

		let totalAwardValue = 0;
		let defenseAwardValue = 0;

		// Defense agencies (common patterns)
		const defenseAgencies = [
			'DEPARTMENT OF DEFENSE',
			'DEPT OF DEFENSE',
			'DOD',
			'DEFENSE',
			'ARMY',
			'NAVY',
			'AIR FORCE',
			'MARINES',
			'COAST GUARD'
		];

		activityEvents.forEach(event => {
			if (event.FLOW_DIRECTION === 'INFLOW' && event.EVENT_AMOUNT) {
				totalAwardValue += event.EVENT_AMOUNT;

				// Check if it's a defense agency
				const agencyName = event.RELATED_ENTITY_NAME?.toUpperCase() || '';
				const isDefense = defenseAgencies.some(defenseKeyword =>
					agencyName.includes(defenseKeyword)
				);

				if (isDefense) {
					defenseAwardValue += event.EVENT_AMOUNT;
				}
			}
		});

		if (totalAwardValue === 0) return "Defense";

		const defensePercentage = defenseAwardValue / totalAwardValue;
		return defensePercentage >= 0.5 ? "Defense" : "Civilian";
	}, [activityEvents]);

	// Get industry summary from primary NAICS for sector display
	const { industrySummary } = useIndustrySummary(primaryNAICS);

	const navigate = useNavigate();
	const [contractorLogo, setContractorLogo] = useState<string | null>(null);
	const [contractorWebsite, setContractorWebsite] = useState<string | null>(null);
	const [websiteLoading, setWebsiteLoading] = useState(false);

	// Calculate activity temperature based on latest INFLOW action date (matches award card logic)
	const getActivityTemperature = () => {
		if (!activityEvents?.length) return { label: "COLD", color: "#3b82f6", bgColor: "#3b82f610" };

		// Filter for inflow events (where this contractor is the recipient)
		const inflowEvents = activityEvents.filter(event =>
			event.FLOW_DIRECTION === 'INFLOW'
		);

		if (inflowEvents.length === 0) return { label: "COLD", color: "#3b82f6", bgColor: "#3b82f610" };

		// Find the latest inflow action date
		const sortedEvents = inflowEvents
			.map(event => new Date(event.EVENT_DATE))
			.filter(date => !isNaN(date.getTime()))
			.sort((a, b) => b.getTime() - a.getTime());

		if (sortedEvents.length === 0) return { label: "COLD", color: "#3b82f6", bgColor: "#3b82f610" };

		const latestActionDate = sortedEvents[0];
		const currentDate = new Date();
		const daysDiff = Math.floor(
			(currentDate.getTime() - latestActionDate.getTime()) / (1000 * 60 * 60 * 24)
		);

		// Use exact same logic as award cards
		if (daysDiff <= 30)
			return { label: "HOT", color: "#dc2626", bgColor: "#dc262610" }; // Red
		if (daysDiff <= 365)
			return { label: "WARM", color: "#f87171", bgColor: "#f8717110" }; // Light red
		return { label: "COLD", color: "#3b82f6", bgColor: "#3b82f610" }; // Blue
	};

	// Calculate performance tier based on peer composite score
	const getPerformanceTier = () => {
		if (!peerData?.scores?.composite) return { label: "Strong", color: "#84cc16", bgColor: "#84cc1620" };

		const compositeScore = peerData.scores.composite;

		// Elite: 75-100, Strong: 50-74, Weak: 25-49, Deficient: 0-24
		if (compositeScore >= 75) return { label: "Elite", color: "#22c55e", bgColor: "#22c55e20" };
		if (compositeScore >= 50) return { label: "Strong", color: "#84cc16", bgColor: "#84cc1620" };
		if (compositeScore >= 25) return { label: "Weak", color: "#f59e0b", bgColor: "#f59e0b20" };
		return { label: "Deficient", color: "#ef4444", bgColor: "#ef444420" };
	};

	const activityTemp = getActivityTemperature();
	const performanceTier = getPerformanceTier();

	useEffect(() => {
		if (contractorInfo.uei && contractorInfo.name) {
			contractorLogoService
				.getContractorLogo(contractorInfo.uei, contractorInfo.name)
				.then((response) => setContractorLogo(response.logoUrl))
				.catch(() => setContractorLogo(null));
		}
	}, [contractorInfo.uei, contractorInfo.name]);

	// Fetch website data from Lusha
	useEffect(() => {
		if (contractorInfo.name && !contractor?.website) {
			setWebsiteLoading(true);
			lushaEnrichmentService
				.getCompanyWebsite(contractorInfo.name)
				.then((website) => {
					setContractorWebsite(website);
					setWebsiteLoading(false);
				})
				.catch((error) => {
					console.warn('Failed to get website from Lusha:', error);
					setContractorWebsite(null);
					setWebsiteLoading(false);
				});
		} else if (contractor?.website) {
			// Use existing website data if available
			setContractorWebsite(contractor.website);
			setWebsiteLoading(false);
		}
	}, [contractorInfo.name, contractor?.website]);

	return (
		<div className="w-full">
			{/* Grid container with two separate panels */}
			<div className="grid grid-cols-4 gap-6 h-full">
				{/* Photo Panel - 1 column */}
				<div className="col-span-1">
					<div className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 relative p-3 border border-gray-700/50 hover:border-gray-600/40">
						{/* Gradient background matching financial metric cards */}
						<div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl" />
						<div className="relative z-10">
							<div className="relative">
								{/* Company Logo with HUD overlay */}
								<div
									className="w-full aspect-square border border-[#D2AC38]/50 hover:border-[#D2AC38]/70 transition-all duration-500 rounded-lg overflow-hidden relative"
									style={{ backgroundColor: "#010204" }}
								>
									{contractorLogo ? (
										<img
											src={contractorLogo}
											alt={`${contractorInfo.name || "Company"} logo`}
											className="w-full h-full object-contain p-4"
											style={{ backgroundColor: "rgba(1, 2, 4, 0.8)" }}
											onError={(e) => {
												// Fallback to initials if logo fails to load
												e.currentTarget.style.display = "none";
												const fallbackElement = e.currentTarget
													.nextElementSibling as HTMLElement;
												if (fallbackElement) {
													fallbackElement.style.display = "flex";
												}
											}}
										/>
									) : null}
									<div
										className="absolute inset-0 flex items-center justify-center h-full p-6"
										style={{
											background:
												"linear-gradient(135deg, #010204CC, #01020499)",
											display: contractorLogo ? "none" : "flex",
										}}
									>
										<div className="relative z-10 flex flex-col items-center justify-center">
											{/* Company Logo/Initials */}
											<div
												className="font-black tracking-wider text-gray-200"
												style={{
													fontFamily: "system-ui, -apple-system, sans-serif",
													fontSize: "62px",
												}}
											>
												TFL
											</div>
											<div
												className="text-xs font-semibold tracking-[0.3em] text-gray-400 mt-2"
												style={{
													fontFamily: "system-ui, -apple-system, sans-serif",
												}}
											>
												{contractorInfo.name?.toUpperCase() || "TRIO FABRICATION"}
											</div>
											<div
												className="text-xs font-normal tracking-[0.4em] text-gray-500"
												style={{
													fontFamily: "system-ui, -apple-system, sans-serif",
												}}
											>
												{contractorInfo.name?.includes("LLC")
													? "LLC"
													: contractorInfo.name?.includes("INC")
														? "INC"
														: contractorInfo.name?.includes("CORP")
															? "CORP"
															: "LLC"}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Data Panel - 3 columns */}
				<div className="col-span-3">
					<div className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 relative p-6 border border-gray-700/50 hover:border-gray-600/40">
						{/* Gradient background matching financial metric cards */}
						<div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl" />
						<div className="relative z-10">
							<div className="flex items-start justify-between mb-3">
								<div className="flex items-center gap-4">
									<h1
										className="text-4xl text-white tracking-wide font-sans"
										style={{ fontWeight: "250" }}
									>
										{contractorInfo.name || "Trio Fabrication LLC"}
									</h1>
								</div>
								<div className="flex items-center gap-3">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => window.history.back()}
										className="text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700"
									>
										<ArrowLeft className="w-4 h-4 mr-2" />
										Back
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="text-white hover:text-[#D2AC38] border border-gray-800 hover:border-gray-600/30"
									>
										<FolderOpen className="h-4 w-4 mr-2" />
										Save
									</Button>
								</div>
							</div>

							{/* Website and Bubbles */}
							<div className="flex items-center gap-4 mb-6" style={{ alignItems: 'center' }}>
								{websiteLoading ? (
									<span
										className="text-gray-500 font-sans font-normal"
										style={{ fontSize: "16px" }}
									>
										Loading website...
									</span>
								) : contractorWebsite ? (
									<a
										href={`https://${contractorWebsite}`}
										target="_blank"
										rel="noopener noreferrer"
										className="text-[#D2AC38] font-sans font-normal hover:text-[#D2AC38]/80 transition-colors cursor-pointer"
										style={{ fontSize: "16px" }}
									>
										{contractorWebsite}
									</a>
								) : (
									<span
										className="text-gray-500 font-sans font-normal italic"
										style={{ fontSize: "16px" }}
									>
										Website not available
									</span>
								)}
								<div className="relative group" style={{ alignSelf: 'center' }}>
									<span
										className="px-1.5 py-0.5 bg-gray-500/20 border border-gray-500/40 rounded-full uppercase tracking-wider text-gray-400 font-sans font-normal inline-flex items-center"
										style={{ fontSize: "10px", height: '24px' }}
									>
										{contractorInfo.uei || "UNKNOWN12345"}
									</span>
									<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
										<div className="text-center font-medium">UEI Number</div>
									</div>
								</div>
								<div className="relative group" style={{ alignSelf: 'center' }}>
									<span
										className="px-1.5 py-0.5 rounded-full uppercase tracking-wider font-sans font-normal inline-flex items-center"
										style={{
											fontSize: "10px",
											height: '24px',
											backgroundColor: activityTemp.bgColor,
											borderColor: `${activityTemp.color}40`,
											color: activityTemp.color,
											border: `1px solid ${activityTemp.color}40`
										}}
									>
										{activityTemp.label}
									</span>
									<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
										<div className="text-center font-medium">
											Award Activity ≤30 Days
										</div>
									</div>
								</div>
								<div className="relative group" style={{ alignSelf: 'center' }}>
									<span
										className="px-1.5 py-0.5 rounded-full uppercase tracking-wider font-sans font-normal inline-flex items-center"
										style={{
											fontSize: "10px",
											height: '24px',
											backgroundColor: performanceTier.bgColor,
											borderColor: `${performanceTier.color}40`,
											color: performanceTier.color,
											border: `1px solid ${performanceTier.color}40`
										}}
									>
										{performanceTier.label}
									</span>
									<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
										<div className="text-center font-medium">
											Performance Tier
										</div>
									</div>
								</div>
							</div>

							<p
								className="text-lg text-gray-300 leading-relaxed max-w-3xl mb-6"
								style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							>
								Defense contractor specializing in structural metal
								manufacturing and fabrication.
							</p>

							{/* Location/Sector/Agency Grid - Flat with HUD accents */}
							<div className="grid grid-cols-6 gap-8 mb-8">
								<div className="col-span-2">
									<div
										className="font-light uppercase tracking-wider"
										style={{
											fontFamily: "Genos, sans-serif",
											fontSize: "18px",
											color: "#D2AC38",
										}}
									>
										LOCATION
									</div>
									<div className="text-lg text-white font-light">
										{contractorInfo.location?.city && contractorInfo.location?.state
											? contractorInfo.location.state === "DC"
												? `${contractorInfo.location.city}, DC`
												: `${contractorInfo.location.city}, ${contractorInfo.location.state}`
											: contractorInfo.location?.state === "DC"
												? "Washington, DC"
												: contractorInfo.location?.state
													? `${contractorInfo.location.state}, USA`
													: "Location Unknown"}
									</div>
								</div>
								<div className="col-span-2">
									<div
										className="font-light uppercase tracking-wider"
										style={{
											fontFamily: "Genos, sans-serif",
											fontSize: "18px",
											color: "#D2AC38",
										}}
									>
										SECTOR
									</div>
									<div className="text-lg text-white font-light">
										{industrySummary ||
											contractor?.industry
												?.replace("-", " ")
												.replace(/\b\w/g, (l) => l.toUpperCase()) ||
											"Manufacturing"}
									</div>
								</div>
								<div className="col-span-2">
									<div
										className="font-light uppercase tracking-wider"
										style={{
											fontFamily: "Genos, sans-serif",
											fontSize: "18px",
											color: "#D2AC38",
										}}
									>
										AGENCY FOCUS
									</div>
									<div className="text-lg text-white font-light">
										{agencyFocus}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
