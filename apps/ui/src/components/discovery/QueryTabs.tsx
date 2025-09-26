import { Plus, X } from "lucide-react";
import React from "react";
import type { QueryTab } from "./types/discovery";

interface QueryTabsProps {
	queryTabs: QueryTab[];
	activeQueryTab: number;
	onTabChange: (index: number) => void;
	onTabClose: (index: number) => void;
	onNewTab: () => void;
}

export function QueryTabs({
	queryTabs,
	activeQueryTab,
	onTabChange,
	onTabClose,
	onNewTab,
}: QueryTabsProps) {
	return (
		<div className="flex items-center justify-between mb-4">
			<div className="flex items-center gap-1">
				{queryTabs.map((tab, index) => (
					<button
						key={tab.id}
						onClick={() => onTabChange(index)}
						className={`px-3 py-1 text-xs rounded-t transition-colors ${
							activeQueryTab === index
								? "bg-[#D2AC38]/20 text-[#D2AC38] border-t border-l border-r border-[#D2AC38]/40"
								: "bg-gray-800/50 text-gray-400 hover:text-gray-300"
						}`}
					>
						{tab.name}
						{index > 0 && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									onTabClose(index);
								}}
								className="ml-2 text-gray-500 hover:text-red-400"
							>
								<X className="w-3 h-3" />
							</button>
						)}
					</button>
				))}
				<button
					onClick={onNewTab}
					className="px-2 py-1 text-xs text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded-t transition-colors"
				>
					<Plus className="w-3 h-3" />
				</button>
			</div>
		</div>
	);
}
