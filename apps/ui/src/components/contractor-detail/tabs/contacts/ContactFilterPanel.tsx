import { Download, Search } from "lucide-react";
import React from "react";
import { CONTRACTOR_DETAIL_COLORS } from "../../../../logic/utils";
import { Card } from "../../../ui/card";

interface Person {
	id: string;
	fullName: string;
	firstName?: string;
	lastName?: string;
	jobTitle?: string;
	seniority?: string;
	department?: string;
	email?: string;
	emailRevealed?: boolean;
	phone?: string;
	phoneRevealed?: boolean;
	linkedin?: string;
	company?: string;
	location?: string;
	updateDate?: string;
}

interface ContactFilterPanelProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	selectedSeniority: string[];
	setSelectedSeniority: (seniority: string[]) => void;
	selectedDepartment: string[];
	setSelectedDepartment: (department: string[]) => void;
	filteredPeople: Person[];
	onExportCsv?: () => void;
	exportingCsv?: boolean;
}

export function ContactFilterPanel({
	searchQuery,
	setSearchQuery,
	selectedSeniority,
	setSelectedSeniority,
	selectedDepartment,
	setSelectedDepartment,
	filteredPeople,
	onExportCsv,
	exportingCsv = false,
}: ContactFilterPanelProps) {
	// Check which seniority levels are present in filtered results
	const presentSeniorities = new Set(filteredPeople.map((p) => p.seniority));

	return (
		<Card
			className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative border border-[#D2AC38]/50 hover:border-[#D2AC38]/90"
			style={{ backgroundColor: "#111726" }}
		>
			<div className="p-4 relative z-10">
				<div className="flex items-center gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
						<input
							type="text"
							placeholder="Search by name or title..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-4 py-2.5 border border-[#D2AC38]/40 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D2AC38] transition-all"
							style={{
								backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor,
							}}
						/>
					</div>

					<select
						className="px-4 py-2.5 border border-[#D2AC38]/40 rounded-lg text-gray-400 hover:border-[#D2AC38]/60 focus:outline-none focus:border-[#D2AC38] transition-all cursor-pointer"
						style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}
						onChange={(e) =>
							setSelectedSeniority(e.target.value ? [e.target.value] : [])
						}
					>
						<option value="">All Seniority</option>
						<option value="C-Level">C-Level</option>
						<option value="VP">VP</option>
						<option value="Director">Director</option>
						<option value="Manager">Manager</option>
					</select>

					<select
						className="px-4 py-2.5 border border-[#D2AC38]/40 rounded-lg text-gray-400 hover:border-[#D2AC38]/60 focus:outline-none focus:border-[#D2AC38] transition-all cursor-pointer"
						style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}
						onChange={(e) =>
							setSelectedDepartment(e.target.value ? [e.target.value] : [])
						}
					>
						<option value="">All Departments</option>
						<option value="Executive">Executive</option>
						<option value="Sales">Sales</option>
						<option value="Engineering">Engineering</option>
						<option value="Operations">Operations</option>
						<option value="Finance">Finance</option>
					</select>

					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-[#38E54D] rounded-full animate-pulse" />
							<span
								className="text-xs text-gray-400 uppercase tracking-wider"
								style={{ fontFamily: "Genos, sans-serif" }}
							>
								{filteredPeople.length} CONTACTS
							</span>
						</div>

						{/* Export CSV Button */}
						{onExportCsv && (
							<button
								onClick={onExportCsv}
								disabled={exportingCsv || filteredPeople.length === 0}
								className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[#D2AC38]/20 border border-[#D2AC38]/40 rounded-lg hover:bg-[#D2AC38]/30 hover:border-[#D2AC38]/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Download className="w-3 h-3" />
								{exportingCsv ? "Exporting..." : "Export CSV"}
							</button>
						)}
						<div className="flex items-center gap-1.5">
							{presentSeniorities.has("C-Level") && (
								<>
									<div className="w-1.5 h-1.5 rounded-full bg-[#FF4C4C]" />
									<span className="text-[10px] text-[#FF4C4C]">C-LEVEL</span>
								</>
							)}
							{presentSeniorities.has("VP") && (
								<>
									<div className="w-1.5 h-1.5 rounded-full bg-[#FFD166] ml-2" />
									<span className="text-[10px] text-[#FFD166]">VP</span>
								</>
							)}
							{presentSeniorities.has("Director") && (
								<>
									<div className="w-1.5 h-1.5 rounded-full bg-[#06D6A0] ml-2" />
									<span className="text-[10px] text-[#06D6A0]">DIRECTOR</span>
								</>
							)}
							{presentSeniorities.has("Manager") && (
								<>
									<div className="w-1.5 h-1.5 rounded-full bg-[#118AB2] ml-2" />
									<span className="text-[10px] text-[#118AB2]">MANAGER</span>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
}
