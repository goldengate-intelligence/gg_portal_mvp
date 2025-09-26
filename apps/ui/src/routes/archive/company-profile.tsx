import { useNavigate } from "@tanstack/react-router";
import {
	Activity,
	AlertTriangle,
	ArrowLeft,
	Award,
	Briefcase,
	Building,
	ChevronRight,
	Crosshair,
	DollarSign,
	Download,
	FileText,
	Globe,
	MapPin,
	Network,
	Radio,
	Share2,
	Shield,
	Target,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import React, { useState, useEffect } from "react";
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
	HudCard,
	HudCardContent,
	HudCardDescription,
	HudCardHeader,
	HudCardTitle,
	TacticalDisplay,
	TargetReticle,
} from "../../components/ui/hud-card";
import { LoadingState } from "../../components/ui/skeleton";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../../components/ui/tabs";
import { apiClient } from "../../services/api-client";
import {
	GoldengateAreaChart,
	GoldengateBarChart,
	GoldengateDoughnutChart,
	GoldengateLineChart,
	GoldengateMixedChart,
	GoldengatePolarChart,
	GoldengateRadarChart,
	GoldengateScatterChart,
} from "../../ui/charts/components";
import { formatCurrency } from "../../utils/contractor-profile-transform";

interface CompanyProfile {
	id: string;
	canonicalName: string;
	displayName: string;
	totalUeis: number;
	totalContracts: number;
	totalObligated: string;
	avgContractValue: string;
	primaryAgency: string | null;
	totalAgencies: number;
	agencyDiversity: number;
	headquartersState: string | null;
	totalStates: number;
	statesList: string[];
	primaryNaicsCode: string | null;
	primaryNaicsDescription: string | null;
	primaryIndustryCluster: string | null;
	industryClusters: string[];
	dominantSizeTier: string | null;
	dominantLifecycleStage: string | null;
	performanceScore: number | null;
	riskScore: number | null;
	growthTrend: string | null;
	isActive: boolean;
	profileCompleteness: number;
	ueis?: Array<{
		id: string;
		uei: string;
		contractorName: string;
		totalContracts: number;
		totalObligated: string;
		primaryAgency: string | null;
		state: string | null;
	}>;
	agencies?: Array<{
		agency: string;
		totalContracts: number;
		totalObligated: string;
		isPrimary: boolean;
	}>;
}

interface CompanyProfileProps {
	id: string;
}

export function CompanyProfile({ id }: CompanyProfileProps) {
	const navigate = useNavigate();
	const [profile, setProfile] = useState<CompanyProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");
	const [performanceData, setPerformanceData] = useState<any>(null);
	const [networkData, setNetworkData] = useState<any>(null);

	useEffect(() => {
		if (id) {
			fetchCompanyProfile();
			fetchPerformanceData();
			fetchNetworkData();
		}
	}, [id]);

	const fetchCompanyProfile = async () => {
		if (!id) return;

		setIsLoading(true);
		try {
			const data = await apiClient.getContractorProfile(id);
			setProfile(data);
		} catch (error) {
			console.error("Failed to fetch company profile:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchPerformanceData = async () => {
		if (!id) return;
		try {
			const data = await apiClient.getContractorPerformanceMetrics(id, 36);
			setPerformanceData(data);
		} catch (error) {
			console.error("Failed to fetch performance data:", error);
		}
	};

	const fetchNetworkData = async () => {
		if (!id) return;
		try {
			const data = await apiClient.getContractorNetwork(id, 50);
			setNetworkData(data);
		} catch (error) {
			console.error("Failed to fetch network data:", error);
		}
	};

	if (isLoading) {
		return <LoadingState />;
	}

	if (!profile) {
		return (
			<div className="p-6">
				<Card className="bg-medium-gray border-red-500/20">
					<CardContent className="p-6">
						<p className="text-red-400">Company profile not found</p>
						<Button
							onClick={() => window.history.back()}
							className="mt-4"
							variant="outline"
						>
							Go Back
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Prepare chart data
	const revenueByUEI =
		profile.ueis?.map((uei) => ({
			name: uei.contractorName,
			value: Number.parseFloat(uei.totalObligated),
		})) || [];

	const agencyDistribution =
		profile.agencies?.slice(0, 6).map((agency) => ({
			name: agency.agency,
			value: Number.parseFloat(agency.totalObligated),
		})) || [];

	const geographicDistribution =
		profile.statesList?.map((state) => ({
			name: state,
			value: Math.random() * 100, // Mock data - replace with actual
		})) || [];

	return (
		<div className="space-y-6">
			{/* Tactical Command Header - Military HUD */}
			<HudCard
				className="mb-6"
				variant="default"
				priority="high"
				scanning={true}
				targetLocked={true}
			>
				<div className="relative p-6">
					{/* Tactical Grid Overlay */}
					<div className="absolute inset-0 opacity-10 pointer-events-none">
						<div className="absolute top-0 left-0 w-full h-full grid grid-cols-12 grid-rows-6">
							{Array.from({ length: 72 }).map((_, i) => (
								<div key={i} className="border border-cyan-500/10" />
							))}
						</div>
					</div>

					{/* Target Reticle Background */}
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10">
						<TargetReticle size={300} color="#00D9FF" animated={true} />
					</div>

					{/* Command Controls */}
					<div className="relative flex items-center justify-between mb-6">
						<Button
							onClick={() => window.history.back()}
							className="bg-black/50 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 backdrop-blur-sm"
							size="sm"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							<span className="font-sans text-xs uppercase tracking-wider">
								Tactical Return
							</span>
						</Button>

						<div className="flex items-center gap-2">
							<div className="flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded">
								<Radio className="h-3 w-3 text-red-400 animate-pulse" />
								<span className="text-xs text-red-400 font-sans uppercase">
									LIVE
								</span>
							</div>

							<Button
								size="sm"
								className="bg-black/50 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/50 backdrop-blur-sm"
							>
								<Download className="h-4 w-4 mr-2" />
								<span className="font-sans text-xs uppercase tracking-wider">
									Extract
								</span>
							</Button>

							<Button
								size="sm"
								className="bg-black/50 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/50 backdrop-blur-sm"
							>
								<Share2 className="h-4 w-4 mr-2" />
								<span className="font-sans text-xs uppercase tracking-wider">
									Transmit
								</span>
							</Button>
						</div>
					</div>

					{/* Entity Identification */}
					<div className="relative grid grid-cols-3 gap-6">
						{/* Left: Entity Data */}
						<div className="col-span-2">
							<div className="mb-4">
								<div className="flex items-center gap-3 mb-2">
									<Shield className="h-6 w-6 text-yellow-400" />
									<span className="text-xs text-cyan-400 font-sans uppercase tracking-wider">
										◆ Entity Designation ◆
									</span>
								</div>
								<h1 className="text-4xl font-orbitron font-bold text-yellow-400 tracking-wider mb-1">
									{profile.displayName}
								</h1>
								<p className="text-sm text-cyan-400/70 font-sans">
									CANONICAL: {profile.canonicalName}
								</p>
							</div>

							{/* Tactical Tags */}
							<div className="flex flex-wrap gap-2">
								<div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded flex items-center gap-2">
									<Crosshair className="h-3 w-3 text-yellow-400" />
									<span className="text-xs text-yellow-400 font-sans uppercase">
										{profile.totalUeis} UEI TARGETS
									</span>
								</div>
								<div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded flex items-center gap-2">
									<MapPin className="h-3 w-3 text-cyan-400" />
									<span className="text-xs text-cyan-400 font-sans uppercase">
										{profile.headquartersState || "MULTI"} HQ
									</span>
								</div>
								<div className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded flex items-center gap-2">
									<Briefcase className="h-3 w-3 text-purple-400" />
									<span className="text-xs text-purple-400 font-sans uppercase">
										{profile.primaryIndustryCluster || "DIVERSIFIED"}
									</span>
								</div>
								{profile.dominantSizeTier && (
									<div className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded flex items-center gap-2">
										<Zap className="h-3 w-3 text-green-400" />
										<span className="text-xs text-green-400 font-sans uppercase">
											{profile.dominantSizeTier}
										</span>
									</div>
								)}
							</div>
						</div>

						{/* Right: Value Assessment */}
						<div className="text-right">
							<div className="p-4 bg-black/30 border border-yellow-500/30 rounded backdrop-blur-sm">
								<div className="flex items-center justify-end gap-2 mb-2">
									<span className="text-xs text-yellow-400/70 font-sans uppercase">
										Contract Value
									</span>
									<AlertTriangle className="h-4 w-4 text-yellow-400 animate-pulse" />
								</div>
								<p className="text-4xl font-orbitron font-bold text-yellow-400 tracking-tight">
									{formatCurrency(Number.parseFloat(profile.totalObligated))}
								</p>
								<div className="mt-2 pt-2 border-t border-yellow-500/20">
									<p className="text-sm text-cyan-400 font-sans">
										<span className="text-yellow-400">
											{profile.totalContracts}
										</span>{" "}
										ACTIVE CONTRACTS
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</HudCard>

			{/* Tactical Metrics Display - Military HUD Style */}
			<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
				<HudCard variant="default" priority="high" dataStream={true}>
					<HudCardContent>
						<TacticalDisplay
							label="AVG CONTRACT"
							value={formatCurrency(
								Number.parseFloat(profile.avgContractValue),
							)}
							trend="up"
						/>
					</HudCardContent>
				</HudCard>

				<HudCard variant="info" priority="medium" scanning={true}>
					<HudCardContent>
						<TacticalDisplay
							label="AGENCY DIVERSITY"
							value={profile.totalAgencies}
							unit="AGENCIES"
							trend="stable"
						/>
					</HudCardContent>
				</HudCard>

				<HudCard variant="default" priority="medium">
					<HudCardContent>
						<TacticalDisplay
							label="STATE COVERAGE"
							value={profile.totalStates}
							unit="STATES"
							trend="up"
						/>
					</HudCardContent>
				</HudCard>

				<HudCard
					variant="success"
					priority={
						profile.performanceScore && profile.performanceScore > 80
							? "high"
							: "medium"
					}
					targetLocked={
						profile.performanceScore && profile.performanceScore > 90
					}
				>
					<HudCardContent>
						<TacticalDisplay
							label="PERFORMANCE"
							value={profile.performanceScore || "N/A"}
							unit={profile.performanceScore ? "/100" : ""}
							trend={
								profile.performanceScore && profile.performanceScore > 80
									? "up"
									: "stable"
							}
						/>
					</HudCardContent>
				</HudCard>

				<HudCard
					variant={
						profile.riskScore && profile.riskScore > 50 ? "warning" : "default"
					}
					priority={
						profile.riskScore && profile.riskScore > 70 ? "critical" : "low"
					}
				>
					<HudCardContent>
						<TacticalDisplay
							label="RISK SCORE"
							value={profile.riskScore || "N/A"}
							unit={profile.riskScore ? "/100" : ""}
							trend={
								profile.riskScore && profile.riskScore > 50 ? "up" : "down"
							}
							alert={profile.riskScore && profile.riskScore > 70}
						/>
					</HudCardContent>
				</HudCard>
			</div>

			{/* Tabbed Content */}
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="space-y-6"
			>
				<TabsList className="bg-gray-800/50 border border-gray-700">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="performance">Performance</TabsTrigger>
					<TabsTrigger value="portfolio">UEI Portfolio</TabsTrigger>
					<TabsTrigger value="agencies">Agencies</TabsTrigger>
					<TabsTrigger value="geographic">Geographic</TabsTrigger>
					<TabsTrigger value="network">Network</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Revenue Distribution by UEI */}
						<GoldengateDoughnutChart
							title="Revenue by Entity (UEI)"
							data={{
								labels: revenueByUEI.slice(0, 6).map((d) => d.name),
								datasets: [
									{
										data: revenueByUEI
											.slice(0, 6)
											.map((d) => d.value / 1000000),
									},
								],
							}}
							height={400}
							liveIndicator={true}
							liveText="PORTFOLIO"
						/>

						{/* Agency Distribution */}
						<GoldengateBarChart
							title="Top Agency Partners"
							data={{
								labels: agencyDistribution.map((d) => d.name),
								datasets: [
									{
										label: "Contract Value",
										data: agencyDistribution.map((d) => d.value / 1000000),
									},
								],
							}}
							height={400}
							liveIndicator={true}
							liveText="AGENCIES"
							options={{
								scales: {
									y: {
										ticks: {
											callback: (value: any) => `$${value}M`,
										},
									},
								},
							}}
						/>
					</div>

					{/* Industry Capabilities Radar */}
					<GoldengateRadarChart
						title="Industry Capabilities Matrix"
						data={{
							labels: profile.industryClusters || [
								"Defense",
								"IT",
								"Construction",
								"Professional Services",
								"R&D",
							],
							datasets: [
								{
									label: "Revenue Distribution",
									data: (
										profile.industryClusters || [
											"Defense",
											"IT",
											"Construction",
											"Professional Services",
											"R&D",
										]
									).map(() => Math.random() * 100),
								},
							],
						}}
						height={400}
						liveIndicator={true}
						liveText="CAPABILITIES"
					/>
				</TabsContent>

				{/* Performance Tab */}
				<TabsContent value="performance" className="space-y-6">
					{performanceData && (
						<>
							{/* Revenue Trend */}
							<GoldengateAreaChart
								title="36-Month Revenue Trend"
								data={{
									labels:
										performanceData.metrics?.map((m: any) =>
											new Date(m.monthYear).toLocaleDateString("en-US", {
												month: "short",
												year: "2-digit",
											}),
										) || [],
									datasets: [
										{
											label: "Monthly Revenue",
											data:
												performanceData.metrics?.map(
													(m: any) => m.monthlyRevenue / 1000000,
												) || [],
										},
									],
								}}
								height={400}
								liveIndicator={true}
								liveText="TRENDING"
								options={{
									scales: {
										y: {
											ticks: {
												callback: (value: any) => `$${value}M`,
											},
										},
									},
								}}
							/>

							{/* Contract Activity */}
							<GoldengateMixedChart
								title="Revenue vs Contract Activity"
								data={{
									labels:
										performanceData.metrics?.slice(-12).map((m: any) =>
											new Date(m.monthYear).toLocaleDateString("en-US", {
												month: "short",
											}),
										) || [],
									datasets: [
										{
											label: "Revenue ($M)",
											type: "bar" as const,
											data:
												performanceData.metrics
													?.slice(-12)
													.map((m: any) => m.monthlyRevenue / 1000000) || [],
											yAxisID: "y",
										},
										{
											label: "Active Contracts",
											type: "line" as const,
											data:
												performanceData.metrics
													?.slice(-12)
													.map((m: any) => m.activeContracts) || [],
											yAxisID: "y1",
										},
									],
								}}
								height={400}
								liveIndicator={true}
								liveText="ACTIVITY"
							/>
						</>
					)}
				</TabsContent>

				{/* UEI Portfolio Tab - Tactical Entity Display */}
				<TabsContent value="portfolio" className="space-y-6">
					<div className="grid gap-4">
						{profile.ueis?.map((uei, index) => (
							<HudCard
								key={uei.id}
								variant="default"
								priority={
									Number.parseFloat(uei.totalObligated) > 10000000
										? "high"
										: "medium"
								}
								scanning={index === 0}
								className="cursor-pointer transform transition-all hover:scale-[1.02] hover:z-10"
								onClick={() =>
									navigate({ to: `/platform/uei-profile/${uei.uei}` })
								}
							>
								<HudCardContent>
									<div className="flex items-center justify-between">
										{/* Left: Entity Intel */}
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<div className="relative">
													<TargetReticle
														size={40}
														color="#FFD700"
														animated={false}
													/>
													<div className="absolute inset-0 flex items-center justify-center">
														<span className="text-xs font-bold text-yellow-400">
															{index + 1}
														</span>
													</div>
												</div>
												<div>
													<h3 className="font-orbitron text-yellow-400 text-sm uppercase tracking-wider">
														{uei.contractorName}
													</h3>
													<p className="text-xs text-cyan-400/70 font-sans">
														UEI: {uei.uei}
													</p>
												</div>
											</div>

											{/* Location & Agency Intel */}
											<div className="flex gap-4 ml-12">
												<div className="flex items-center gap-1">
													<MapPin className="h-3 w-3 text-cyan-400/50" />
													<span className="text-xs text-cyan-400/70 font-sans uppercase">
														{uei.state || "CLASSIFIED"}
													</span>
												</div>
												<div className="flex items-center gap-1">
													<Shield className="h-3 w-3 text-cyan-400/50" />
													<span className="text-xs text-cyan-400/70 font-sans uppercase">
														{uei.primaryAgency || "MULTI-AGENCY"}
													</span>
												</div>
											</div>
										</div>

										{/* Right: Value Assessment */}
										<div className="flex items-center gap-4">
											<div className="text-right">
												<p className="text-xs text-cyan-400/50 font-sans uppercase mb-1">
													CONTRACT VALUE
												</p>
												<p className="text-xl font-orbitron font-bold text-yellow-400">
													{formatCurrency(
														Number.parseFloat(uei.totalObligated),
													)}
												</p>
												<p className="text-xs text-cyan-400/70 font-sans mt-1">
													{uei.totalContracts} ACTIVE OPS
												</p>
											</div>

											{/* Engagement Indicator */}
											<div className="flex flex-col items-center gap-1">
												<ChevronRight className="h-5 w-5 text-yellow-400 animate-pulse" />
												<span className="text-xs text-yellow-400/50 font-sans">
													ENGAGE
												</span>
											</div>
										</div>
									</div>

									{/* Bottom Status Bar */}
									<div className="mt-3 pt-3 border-t border-cyan-500/10 flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
											<span className="text-xs text-green-400/70 font-sans uppercase">
												ACTIVE
											</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-xs text-cyan-400/50 font-sans">
												PRIORITY:
											</span>
											<div className="flex gap-1">
												{Array.from({ length: 5 }).map((_, i) => (
													<div
														key={i}
														className={`w-2 h-2 ${
															i <
															(Number.parseFloat(uei.totalObligated) / 5000000)
																? "bg-yellow-400"
																: "bg-gray-600"
														}`}
													/>
												))}
											</div>
										</div>
									</div>
								</HudCardContent>
							</HudCard>
						))}
					</div>

					{/* UEI Comparison Scatter */}
					<GoldengateScatterChart
						title="UEI Performance Matrix"
						data={{
							datasets: [
								{
									label: "UEI Entities",
									data:
										profile.ueis?.map((uei) => ({
											x: uei.totalContracts,
											y: Number.parseFloat(uei.totalObligated) / 1000000,
										})) || [],
								},
							],
						}}
						height={400}
						liveIndicator={true}
						liveText="COMPARISON"
						options={{
							scales: {
								x: {
									title: {
										display: true,
										text: "Total Contracts",
									},
								},
								y: {
									title: {
										display: true,
										text: "Total Revenue ($M)",
									},
									ticks: {
										callback: (value: any) => `$${value}M`,
									},
								},
							},
						}}
					/>
				</TabsContent>

				{/* Agencies Tab */}
				<TabsContent value="agencies" className="space-y-6">
					<GoldengateBarChart
						title="Agency Revenue Distribution"
						data={{
							labels: profile.agencies?.map((a) => a.agency) || [],
							datasets: [
								{
									label: "Contract Value",
									data:
										profile.agencies?.map(
											(a) => Number.parseFloat(a.totalObligated) / 1000000,
										) || [],
								},
							],
						}}
						height={500}
						liveIndicator={true}
						liveText="AGENCIES"
						options={{
							indexAxis: "y" as const,
							scales: {
								x: {
									ticks: {
										callback: (value: any) => `$${value}M`,
									},
								},
							},
						}}
					/>

					{/* Agency Diversity Score */}
					<Card className="bg-medium-gray border-yellow-500/20">
						<CardHeader>
							<CardTitle>Agency Diversification Analysis</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-3 gap-4">
								<div className="text-center">
									<p className="text-3xl font-bold text-yellow-400">
										{profile.totalAgencies}
									</p>
									<p className="text-sm text-gray-400">Total Agencies</p>
								</div>
								<div className="text-center">
									<p className="text-3xl font-bold text-cyan-400">
										{profile.agencyDiversity}
									</p>
									<p className="text-sm text-gray-400">Diversity Score</p>
								</div>
								<div className="text-center">
									<p className="text-3xl font-bold text-green-400">
										{(
											((profile.agencies?.[0]?.totalObligated || 0) /
												Number.parseFloat(profile.totalObligated)) *
											100
										).toFixed(0)}
										%
									</p>
									<p className="text-sm text-gray-400">
										Top Agency Concentration
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Geographic Tab */}
				<TabsContent value="geographic" className="space-y-6">
					<GoldengatePolarChart
						title="State Coverage Distribution"
						data={{
							labels: profile.statesList || [],
							datasets: [
								{
									data: geographicDistribution.map((d) => d.value),
								},
							],
						}}
						height={500}
						liveIndicator={true}
						liveText="GEOGRAPHIC"
					/>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{profile.statesList?.map((state) => (
							<Card key={state} className="bg-dark-gray border-gray-700">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<span className="text-sm font-semibold text-white">
											{state}
										</span>
										<MapPin className="h-4 w-4 text-cyan-400" />
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>

				{/* Network Tab */}
				<TabsContent value="network" className="space-y-6">
					{networkData && (
						<>
							<div className="grid grid-cols-2 gap-6">
								<Card className="bg-medium-gray border-green-500/20">
									<CardHeader>
										<CardTitle className="text-green-400">
											Prime Partnerships
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-3xl font-bold text-white">
											{networkData.relationships?.asSubcontractor?.count || 0}
										</p>
										<p className="text-sm text-gray-400">
											Acting as subcontractor
										</p>
									</CardContent>
								</Card>

								<Card className="bg-medium-gray border-blue-500/20">
									<CardHeader>
										<CardTitle className="text-blue-400">
											Subcontractor Network
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-3xl font-bold text-white">
											{networkData.relationships?.asPrime?.count || 0}
										</p>
										<p className="text-sm text-gray-400">Acting as prime</p>
									</CardContent>
								</Card>
							</div>

							<Button
								onClick={() =>
									navigate({ to: `/platform/contractor-network/${id}` })
								}
								className="w-full bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30"
							>
								<Network className="h-4 w-4 mr-2" />
								View Full Network Analysis
							</Button>
						</>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
