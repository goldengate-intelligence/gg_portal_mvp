import { Trash2 } from "lucide-react";
import React from "react";
import { createPortal } from "react-dom";

interface DeleteConfirmationModalProps {
	isOpen: boolean;
	companyName: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export function DeleteConfirmationModal({
	isOpen,
	companyName,
	onConfirm,
	onCancel,
}: DeleteConfirmationModalProps) {
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
							Delete from Portfolio
						</h3>
						<p className="text-red-400 text-sm">This action cannot be undone</p>
					</div>
				</div>
				<p className="text-gray-400 text-sm mb-6">
					Are you sure you want to permanently remove{" "}
					<span className="font-semibold text-white">{companyName}</span> from
					your portfolio? This will remove all associated data and cannot be
					recovered.
				</p>
				<div className="flex gap-3 justify-end">
					<button
						onClick={onCancel}
						className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600/30 hover:border-gray-500/50 rounded-md transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors"
					>
						Delete from Portfolio
					</button>
				</div>
			</div>
		</div>,
		document.body,
	);
}
