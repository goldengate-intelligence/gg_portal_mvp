import { ArrowLeft, Users } from "lucide-react";
import React, { useState, useEffect } from "react";
import { AssetCardNew } from "./AssetCardNew";

interface Asset {
	id: string;
	companyName: string;
	naicsDescription: string;
	marketType: "civilian" | "defense";
	uei: string;
	activeAwards: { value: string };
}

interface GroupAsset extends Asset {
	type: "group";
	groupName: string;
	memberAssets: Asset[];
	entityCount: number;
	aggregatedMetrics?: {
		lifetime: string;
		revenue: string;
		pipeline: string;
	};
}

interface GroupDetailViewProps {
	group: GroupAsset;
	onBack: () => void;
	onRemoveMember: (memberUei: string) => void;
	onUpdateGroup: (updatedGroup: GroupAsset) => void;
	onDeleteFromPortfolio?: (memberUei: string) => void;
}

interface GroupDetailViewPropsExtended extends GroupDetailViewProps {
	showDeleteOptions: string | null;
	showPortfolioDeleteConfirm: string | null;
	onShowDeleteOptions: (memberUei: string) => void;
	onCloseDeleteOptions: () => void;
	onShowPortfolioDeleteConfirm: (memberUei: string) => void;
	onClosePortfolioDeleteConfirm: () => void;
}

export function GroupDetailView({
	group,
	onBack,
	onRemoveMember,
	onUpdateGroup,
	onDeleteFromPortfolio,
	showDeleteOptions,
	showPortfolioDeleteConfirm,
	onShowDeleteOptions,
	onCloseDeleteOptions,
	onShowPortfolioDeleteConfirm,
	onClosePortfolioDeleteConfirm,
}: GroupDetailViewPropsExtended) {
	const [members, setMembers] = useState(group.memberAssets);

	// Escape key handler
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				if (showPortfolioDeleteConfirm) {
					onClosePortfolioDeleteConfirm();
				} else if (showDeleteOptions) {
					onCloseDeleteOptions();
				} else {
					onBack();
				}
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [
		onBack,
		showDeleteOptions,
		showPortfolioDeleteConfirm,
		onCloseDeleteOptions,
		onClosePortfolioDeleteConfirm,
	]);

	// Delete handlers
	const handleMemberDelete = (memberUei: string) => {
		onShowDeleteOptions(memberUei);
	};

	return (
		<div className="min-h-[500px] flex justify-center">
			<div className="w-full max-w-4xl">
				{/* Outer Purple Panel wrapping everything */}
				<div className="border border-[#8B8EFF]/30 rounded-xl hover:border-[#8B8EFF]/50 transition-all duration-500">
					<div className="p-4">
						{/* Back Button */}
						<div className="mb-4">
							<button
								onClick={onBack}
								className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
							>
								<ArrowLeft className="w-4 h-4" />
								Back to Portfolio
							</button>
						</div>

						{/* Main Container */}
						<div
							className="rounded-xl p-4"
							style={{ backgroundColor: "#223040" }}
						>
							<div className="relative h-full">
								{/* Title */}
								<div className="absolute top-0 left-0 z-10">
									<h3 className="font-sans text-xs uppercase tracking-wider text-gray-500">
										Group Members
									</h3>
								</div>

								{/* Live Indicator */}
								<div className="absolute top-0 right-0 z-10 flex items-center gap-2">
									<span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
									<span
										className="text-[10px] text-green-400 tracking-wider font-light"
										style={{ fontFamily: "Genos, sans-serif" }}
									>
										LIVE
									</span>
								</div>

								{/* Group Member Cards */}
								<div className="pt-8">
									<div className="grid grid-cols-1 gap-4">
										{members.map((member) => (
											<div
												key={member.id}
												className="relative transition-all duration-300 group opacity-100 scale-100 translate-x-0"
											>
												<AssetCardNew
													companyName={member.companyName}
													naicsDescription={member.naicsDescription}
													marketType={member.marketType}
													uei={member.uei}
													activeAwards={member.activeAwards}
													onClick={() => {
														window.location.href = `/platform/contractor-detail/${member.uei}`;
													}}
													onRemove={() => handleMemberDelete(member.uei)}
												/>
											</div>
										))}

										{members.length === 0 && (
											<div className="text-center py-12">
												<Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
												<p className="text-gray-400">
													No members in this group
												</p>
											</div>
										)}
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
