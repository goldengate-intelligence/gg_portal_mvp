import { Linkedin, Mail, Phone, Users } from "lucide-react";
import React from "react";
import { useDesignPatterns } from "../../../../hooks/useDesignPatterns";
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

interface ContactGridPanelProps {
	people: Person[];
	loading: boolean;
	onRevealEmail: (personId: string) => void;
	onRevealPhone: (personId: string) => void;
}

export function ContactGridPanel({
	people,
	loading,
	onRevealEmail,
	onRevealPhone,
}: ContactGridPanelProps) {
	const { Typography, PanelWrapper } = useDesignPatterns();

	if (loading) {
		return (
			<Card className={PanelWrapper.hudCard}>
				<div className="flex items-center justify-center h-64">
					<div className="text-gray-500">Loading contact information...</div>
				</div>
			</Card>
		);
	}

	if (people.length === 0) {
		return (
			<Card className={PanelWrapper.hudCard}>
				<div className="flex flex-col items-center justify-center h-64">
					<Users className="w-12 h-12 mb-4 text-gray-600" />
					<p className="text-gray-500">
						No contacts found matching your criteria
					</p>
				</div>
			</Card>
		);
	}

	return (
		<div className="grid grid-cols-3 gap-4">
			{people.map((person) => (
				<Card
					key={person.id}
					className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative border border-[#D2AC38]/50 hover:border-[#D2AC38]/90"
					style={{ backgroundColor: "#111726" }}
				>
					<div className="p-4 flex flex-col h-full relative z-10">
						{/* Header with subtle accent */}
						<div className="flex items-start justify-between mb-3">
							<div className="flex-1">
								<h3
									className="text-white font-bold tracking-wide mb-1"
									style={{
										fontFamily: "system-ui, -apple-system, sans-serif",
										fontSize: "18px",
									}}
								>
									{person.fullName.toUpperCase()}
								</h3>
								<p
									className="text-sm text-[#D2AC38] font-normal mb-2"
									style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
								>
									{person.jobTitle}
								</p>
								<div className="flex items-center gap-3">
									<span
										className="text-xs px-2 py-0.5 rounded-full"
										style={{
											backgroundColor:
												person.seniority === "C-Level"
													? "rgba(255, 76, 76, 0.15)"
													: person.seniority === "VP"
														? "rgba(255, 209, 102, 0.15)"
														: person.seniority === "Director"
															? "rgba(6, 214, 160, 0.15)"
															: "rgba(17, 138, 178, 0.15)",
											color:
												person.seniority === "C-Level"
													? "#FF4C4C"
													: person.seniority === "VP"
														? "#FFD166"
														: person.seniority === "Director"
															? "#06D6A0"
															: "#118AB2",
										}}
									>
										{person.seniority}
									</span>
									<span
										className="text-xs px-2 py-0.5 rounded-full"
										style={{
											backgroundColor:
												person.department === "Executive"
													? "rgba(210, 172, 56, 0.15)"
													: person.department === "Sales"
														? "rgba(91, 192, 235, 0.15)"
														: person.department === "Engineering"
															? "rgba(162, 89, 255, 0.15)"
															: person.department === "Finance"
																? "rgba(56, 229, 77, 0.15)"
																: "rgba(255, 107, 53, 0.15)",
											color:
												person.department === "Executive"
													? "#D2AC38"
													: person.department === "Sales"
														? "#5BC0EB"
														: person.department === "Engineering"
															? "#A259FF"
															: person.department === "Finance"
																? "#38E54D"
																: "#FF6B35",
										}}
									>
										{person.department}
									</span>
								</div>
							</div>
							{/* Visual element - seniority indicator */}
							<div className="relative">
								<div
									className="w-10 h-10 rounded-full flex items-center justify-center"
									style={{
										background:
											person.seniority === "C-Level"
												? "linear-gradient(135deg, rgba(255, 76, 76, 0.2), rgba(255, 76, 76, 0.05))"
												: person.seniority === "VP"
													? "linear-gradient(135deg, rgba(255, 209, 102, 0.2), rgba(255, 209, 102, 0.05))"
													: person.seniority === "Director"
														? "linear-gradient(135deg, rgba(6, 214, 160, 0.2), rgba(6, 214, 160, 0.05))"
														: "linear-gradient(135deg, rgba(17, 138, 178, 0.2), rgba(17, 138, 178, 0.05))",
										border: `1px solid ${
											person.seniority === "C-Level"
												? "rgba(255, 76, 76, 0.3)"
												: person.seniority === "VP"
													? "rgba(255, 209, 102, 0.3)"
													: person.seniority === "Director"
														? "rgba(6, 214, 160, 0.3)"
														: "rgba(17, 138, 178, 0.3)"
										}`,
									}}
								>
									<span
										className="text-lg font-bold"
										style={{
											color:
												person.seniority === "C-Level"
													? "#FF4C4C"
													: person.seniority === "VP"
														? "#FFD166"
														: person.seniority === "Director"
															? "#06D6A0"
															: "#118AB2",
										}}
									>
										{person.seniority === "C-Level"
											? "C"
											: person.seniority === "VP"
												? "V"
												: person.seniority === "Director"
													? "D"
													: "M"}
									</span>
								</div>
							</div>
						</div>

						{/* Contact Info with container */}
						<div
							className="border border-gray-700 rounded-lg p-3 space-y-2.5"
							style={{
								backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor,
							}}
						>
							{/* Email */}
							<div className="flex items-center justify-between group/email">
								<div className="flex items-center gap-2">
									<Mail className="w-3 h-3 text-[#FFD166]/60" />
									<span className="text-xs text-white">
										{person.emailRevealed ? person.email : person.email}
									</span>
								</div>
								{!person.emailRevealed && (
									<button
										onClick={() => onRevealEmail(person.id)}
										className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800/50 text-gray-400 hover:bg-[#D2AC38]/20 hover:text-[#D2AC38] transition-all opacity-0 group-hover/email:opacity-100"
									>
										REVEAL
									</button>
								)}
							</div>

							{/* Phone */}
							<div className="flex items-center justify-between group/phone">
								<div className="flex items-center gap-2">
									<Phone className="w-3 h-3 text-[#FFD166]/60" />
									<span className="text-xs text-white">
										{person.phoneRevealed ? person.phone : person.phone}
									</span>
								</div>
								{!person.phoneRevealed && (
									<button
										onClick={() => onRevealPhone(person.id)}
										className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800/50 text-gray-400 hover:bg-[#D2AC38]/20 hover:text-[#D2AC38] transition-all opacity-0 group-hover/phone:opacity-100"
									>
										REVEAL
									</button>
								)}
							</div>

							{/* LinkedIn */}
							{person.linkedin && (
								<div className="flex items-center gap-2">
									<Linkedin className="w-3 h-3 text-[#D2AC38]/60" />
									<a
										href={person.linkedin}
										target="_blank"
										rel="noopener noreferrer"
										className="text-xs text-[#D2AC38]/80 hover:text-[#D2AC38] transition-colors"
									>
										LinkedIn
									</a>
								</div>
							)}
						</div>

						{/* Footer with location - pushed to bottom */}
						<div className="mt-auto pt-3">
							<div className="flex items-center justify-between">
								<span className="text-[10px] text-gray-600 uppercase tracking-wider">
									{person.location}
								</span>
								<span className="text-[10px] text-gray-600">
									{person.updateDate}
								</span>
							</div>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}
