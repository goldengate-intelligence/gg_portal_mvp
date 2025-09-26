import React from "react";
import {
	calculateContractTimeline,
	getTimelineColor,
	getUtilizationColor,
} from "../logic/contractCalculations";
import type { ContractDetailsProps } from "../types";

export function ContractDetails({ contract }: ContractDetailsProps) {
	const { progressPercent, remainingMonths } =
		calculateContractTimeline(contract);

	return (
		<div
			key={contract.id}
			className="ml-6 mb-2 relative border border-gray-700/30 rounded-lg overflow-hidden bg-gray-900/40"
		>
			{/* Contract Status Banner */}
			<div
				className={`h-6 flex items-center px-3 ${
					contract.role === "prime"
						? "bg-gradient-to-r from-[#5BC0EB] to-[#118AB2]"
						: "bg-gradient-to-r from-[#FF4C4C] to-[#dc2626]"
				}`}
			>
				<span className="text-white font-bold text-[10px] uppercase tracking-wider">
					{contract.role === "prime" ? "PRIME CONTRACT" : "SUBCONTRACT"}
				</span>
			</div>

			<div className="p-3">
				{/* Row 1: Client and Value */}
				<div className="flex items-start justify-between mb-2">
					<div className="flex-1">
						{/* Client Display with Type Badge */}
						<div className="mb-1">
							<span className="text-[14px] font-bold text-white">
								{contract.client}
							</span>
							<span
								className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
									contract.clientType === "agency"
										? "bg-[#9B7EBD]/20 text-[#9B7EBD] border border-[#9B7EBD]/30"
										: "bg-[#5BC0EB]/20 text-[#5BC0EB] border border-[#5BC0EB]/30"
								}`}
							>
								{contract.clientType === "agency" ? "Agency" : "Prime"}
							</span>
						</div>
						{/* Description */}
						<div className="font-medium text-gray-300 text-[12px] mb-1">
							{contract.desc}
						</div>
						<div className="flex items-center gap-3 text-[10px] text-gray-400">
							<span className="font-sans text-[#D2AC38]">
								{contract.parentAward}
							</span>
							<span className="font-sans text-gray-500">{contract.type}</span>
						</div>
					</div>

					{/* Value */}
					<div className="text-right">
						<div className="text-[20px] font-bold" style={{ color: "#10B981" }}>
							{contract.currentValue}
						</div>
						{contract.totalValue !== contract.currentValue && (
							<div className="text-[9px] text-gray-500">
								of {contract.totalValue}
							</div>
						)}
					</div>
				</div>

				{/* Row 2: Timeline and Metrics */}
				<div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-700/30">
					{/* Timeline Progress */}
					<div>
						<div className="text-[9px] text-gray-500 uppercase mb-1">
							Timeline
						</div>
						<div className="h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
							<div
								className="h-full rounded-full transition-all duration-500"
								style={{
									width: `${progressPercent}%`,
									backgroundColor: getTimelineColor(remainingMonths),
								}}
							/>
						</div>
						<div className="flex justify-between text-[8px] text-gray-500 mt-1">
							<span>{contract.start}</span>
							<span
								className="font-bold"
								style={{ color: getTimelineColor(remainingMonths) }}
							>
								{remainingMonths}mo left
							</span>
						</div>
					</div>

					{/* Utilization */}
					<div>
						<div className="text-[9px] text-gray-500 uppercase mb-1">
							Utilization
						</div>
						<div className="h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
							<div
								className="h-full rounded-full transition-all duration-500"
								style={{
									width: `${contract.utilization}%`,
									backgroundColor: getUtilizationColor(contract.utilization),
								}}
							/>
						</div>
						<div className="text-[8px] text-center mt-1">
							<span
								className="font-bold"
								style={{ color: getUtilizationColor(contract.utilization) }}
							>
								{contract.utilization}%
							</span>
						</div>
					</div>

					{/* Mods */}
					<div>
						<div className="text-[9px] text-gray-500 uppercase mb-1">
							Modifications
						</div>
						<div className="flex items-center gap-1">
							<span className="text-[14px] font-bold text-white">
								{contract.mods}
							</span>
							<span className="text-[9px] text-gray-500">mods</span>
						</div>
					</div>
				</div>

				{/* Row 3: NAICS/PSC */}
				<div className="flex items-center gap-4 mt-2 text-[9px]">
					<div className="flex items-center gap-1">
						<span className="text-gray-500">NAICS:</span>
						<span className="font-sans text-gray-400">{contract.naics}</span>
					</div>
					<div className="flex items-center gap-1">
						<span className="text-gray-500">PSC:</span>
						<span className="font-sans text-gray-400">{contract.psc}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
