import { Trash2 } from "lucide-react";
import React from "react";
import { createPortal } from "react-dom";

interface GroupDeleteModalProps {
	isOpen: boolean;
	companyName: string;
	onRemoveFromGroup: () => void;
	onDeleteFromPortfolio: () => void;
	onCancel: () => void;
}

export function GroupDeleteModal({
	isOpen,
	companyName,
	onRemoveFromGroup,
	onDeleteFromPortfolio,
	onCancel,
}: GroupDeleteModalProps) {
	if (!isOpen) return null;

	return createPortal(
		<div
			className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999999] flex items-center justify-center"
			style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
		>
			<div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-red-500/50 rounded-xl p-6 w-96 max-w-md mx-4 shadow-2xl">
				<div className="flex items-center gap-3 mb-4">
					<div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl">
						<Trash2 className="w-6 h-6 text-red-400" />
					</div>
					<div>
						<h3
							className="text-xl font-light text-white"
							style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
						>
							Remove Member
						</h3>
						<p className="text-red-400 text-sm">Choose removal option</p>
					</div>
				</div>
				<p className="text-gray-400 text-sm mb-6">
					What would you like to do with{" "}
					<span className="font-semibold text-white">{companyName}</span>? You
					can remove them from this group only or delete them completely from
					your portfolio.
				</p>
				<div className="space-y-3">
					<button
						onClick={onRemoveFromGroup}
						className="w-full px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/40 hover:border-blue-500/60 rounded-md transition-colors text-left"
					>
						<div className="font-medium">Remove from Group Only</div>
						<div className="text-xs text-gray-400 mt-1">
							Keep in portfolio as individual asset
						</div>
					</button>
					<button
						onClick={onDeleteFromPortfolio}
						className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 hover:border-red-500/60 rounded-md transition-colors text-left"
					>
						<div className="font-medium">Delete from Portfolio</div>
						<div className="text-xs text-gray-400 mt-1">
							Remove completely from your portfolio
						</div>
					</button>
					<button
						onClick={onCancel}
						className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600/30 hover:border-gray-500/50 rounded-md transition-colors"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>,
		document.body,
	);
}
