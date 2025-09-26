import type React from "react";
import { useEffect, useState } from "react";

interface GroupNamingModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (groupName: string) => void;
	defaultName: string;
}

export function GroupNamingModal({
	isOpen,
	onClose,
	onConfirm,
	defaultName,
}: GroupNamingModalProps) {
	const [groupName, setGroupName] = useState(defaultName);

	useEffect(() => {
		setGroupName(defaultName);
	}, [defaultName]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			return () => document.removeEventListener("keydown", handleEscape);
		}
	}, [isOpen, onClose]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (groupName.trim()) {
			onConfirm(groupName.trim());
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
			<div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-[#D2AC38]/30 rounded-xl p-6 w-96 max-w-md mx-4 shadow-2xl">
				{/* Header */}
				<div className="mb-6">
					<h3
						className="text-xl font-light text-white mb-2"
						style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
					>
						Create Asset Group
					</h3>
					<p className="text-gray-400 text-sm">
						Enter a name for your new contractor group. Press Escape to cancel.
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit}>
					<div className="mb-6">
						<label
							htmlFor="groupName"
							className="block text-sm font-medium text-[#D2AC38]/80 mb-2"
						>
							Group Name
						</label>
						<input
							id="groupName"
							type="text"
							value={groupName}
							onChange={(e) => setGroupName(e.target.value)}
							className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/30 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[#D2AC38]/50 focus:border-[#D2AC38]/50"
							style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							placeholder="Enter group name..."
						/>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-3 justify-end">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600/30 hover:border-gray-500/50 rounded-md transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={!groupName.trim()}
							className="px-4 py-2 bg-[#D2AC38] hover:bg-[#D2AC38]/80 disabled:bg-gray-600/30 disabled:text-gray-500 text-black font-medium rounded-md transition-colors"
						>
							Create Group
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
