import React, { useMemo } from "react";

interface PartnershipData {
	partnerName: string;
	partnerUei: string;
	concentration: number; // 0-100
	freshness: number; // 0-100 (engagement velocity)
	geoSynergy: number; // 0-100 (geographic optimization)
	dependency: number; // 0-100 (strategic dependency)
	composite: number; // 0-100 (partnership momentum score)
	ttmValue: number; // in millions
	relationshipType: "prime" | "sub";
}

interface PartnershipVelocityHeatmapProps {
	data: PartnershipData[];
	title?: string;
	height?: number;
}

const PartnershipVelocityHeatmap: React.FC<PartnershipVelocityHeatmapProps> = ({
	data,
	title = "Partnership Velocity Analysis",
	height = 400,
}) => {
	// Color gradient function: crimson (high) -> purple (mid) -> blue (low)
	const getColorForScore = (score: number): string => {
		// Normalize score to 0-1
		const normalized = Math.max(0, Math.min(100, score)) / 100;

		if (normalized >= 0.8) {
			// Crimson range (80-100)
			return "rgb(220, 20, 60)"; // Crimson
		}
		if (normalized >= 0.7) {
			// Deep red (70-80)
			return "rgb(200, 30, 60)";
		}
		if (normalized >= 0.6) {
			// Red-purple blend (60-70)
			return "rgb(180, 40, 80)";
		}
		if (normalized >= 0.4) {
			// Purple (40-60) - midpoint
			return "rgb(128, 0, 128)";
		}
		if (normalized >= 0.2) {
			// Purple-blue blend (20-40)
			return "rgb(80, 50, 180)";
		}
		if (normalized >= 0.1) {
			// Deep blue (10-20)
			return "rgb(40, 80, 200)";
		}
		// Ice blue (0-10)
		return "rgb(70, 130, 180)"; // Steel blue
	};

	// Sort data by composite score (highest first)
	const sortedData = useMemo(() => {
		return [...data].sort((a, b) => b.composite - a.composite);
	}, [data]);

	const columns = [
		{
			key: "concentration",
			label: "Concentration",
			tooltip: "Revenue concentration from this partner",
		},
		{
			key: "freshness",
			label: "Freshness",
			tooltip: "Engagement velocity and recency",
		},
		{
			key: "geoSynergy",
			label: "Geo Synergy",
			tooltip: "Geographic optimization score",
		},
		{
			key: "dependency",
			label: "Dependency",
			tooltip: "Strategic dependency level",
		},
		{
			key: "composite",
			label: "Composite",
			tooltip: "Overall partnership momentum score",
		},
	];

	return (
		<div className="w-full h-full flex flex-col">
			<h3
				className="text-2xl text-gray-200 font-normal tracking-wider mb-4"
				style={{ fontFamily: "Genos, sans-serif" }}
			>
				{title}
			</h3>

			<div className="flex-1 overflow-auto" style={{ maxHeight: height }}>
				<div className="grid grid-cols-6 gap-0.5 bg-gray-800/30 p-2 rounded">
					{/* Header Row */}
					<div className="text-xs text-gray-400 font-medium p-2 text-left">
						Partner
					</div>
					{columns.map((col) => (
						<div
							key={col.key}
							className="text-xs text-gray-400 font-medium p-2 text-center"
							title={col.tooltip}
						>
							{col.label}
						</div>
					))}

					{/* Data Rows */}
					{sortedData.slice(0, 10).map((partner, idx) => (
						<React.Fragment key={partner.partnerUei}>
							{/* Partner Name Cell */}
							<div className="text-xs text-gray-300 p-2 flex items-center gap-2 bg-gray-900/40">
								<span
									className={`text-xs ${partner.relationshipType === "prime" ? "text-[#5BC0EB]" : "text-[#FF4C4C]"}`}
								>
									{partner.relationshipType === "prime" ? "▲" : "▼"}
								</span>
								<span className="truncate" title={partner.partnerName}>
									{partner.partnerName.length > 20
										? `${partner.partnerName.substring(0, 18)}...`
										: partner.partnerName}
								</span>
							</div>

							{/* Score Cells */}
							{columns.map((col) => {
								const score = partner[
									col.key as keyof PartnershipData
								] as number;
								const isComposite = col.key === "composite";

								return (
									<div
										key={col.key}
										className={`relative text-center p-2 text-xs font-medium text-white transition-all duration-300 hover:scale-105 ${
											isComposite ? "ring-1 ring-[#D2AC38]/50" : ""
										}`}
										style={{
											backgroundColor: getColorForScore(score),
											textShadow: "0 1px 2px rgba(0,0,0,0.5)",
										}}
										title={`${col.label}: ${score.toFixed(1)}`}
									>
										<span className="relative z-10">{score.toFixed(0)}</span>
										{isComposite && (
											<div className="absolute inset-0 ring-1 ring-[#D2AC38] opacity-50" />
										)}
									</div>
								);
							})}
						</React.Fragment>
					))}
				</div>

				{/* Legend */}
				<div className="mt-4 flex items-center justify-between text-xs text-gray-400">
					<div className="flex items-center gap-4">
						<span>Score Range:</span>
						<div className="flex items-center gap-2">
							<div
								className="w-4 h-4 rounded"
								style={{ backgroundColor: "rgb(220, 20, 60)" }}
							/>
							<span>80-100 (Hot)</span>
						</div>
						<div className="flex items-center gap-2">
							<div
								className="w-4 h-4 rounded"
								style={{ backgroundColor: "rgb(128, 0, 128)" }}
							/>
							<span>40-60 (Moderate)</span>
						</div>
						<div className="flex items-center gap-2">
							<div
								className="w-4 h-4 rounded"
								style={{ backgroundColor: "rgb(70, 130, 180)" }}
							/>
							<span>0-20 (Cold)</span>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-[#5BC0EB]">▲ As Prime</span>
						<span className="text-[#FF4C4C]">▼ As Sub</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PartnershipVelocityHeatmap;
