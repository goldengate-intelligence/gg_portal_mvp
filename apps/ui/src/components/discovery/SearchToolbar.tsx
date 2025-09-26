import {
	Copy,
	Download,
	Filter,
	History,
	Search,
	Settings,
} from "lucide-react";
import React from "react";

interface SearchToolbarProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	onSearch: () => void;
	isSearching: boolean;
}

export function SearchToolbar({
	searchQuery,
	onSearchChange,
	onSearch,
	isSearching,
}: SearchToolbarProps) {
	return (
		<div className="mb-4">
			{/* Internal Container */}
			<div className="border border-gray-700 rounded-lg p-3 bg-gray-800">
				<div className="flex items-center gap-3">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && onSearch()}
							placeholder="Search by name, UEI, etc... or, click Smart Search for intelligent discovery"
							className="w-full pl-10 pr-4 py-2.5 border border-[#F97316]/40 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F97316] transition-all bg-gray-900"
						/>
					</div>
					<Filter className="w-4 h-4 text-gray-400" />
					<button
						onClick={onSearch}
						disabled={isSearching}
						className="px-4 py-2.5 bg-[#F97316] text-white rounded-lg text-sm hover:bg-[#F97316]/80 transition-colors disabled:opacity-50"
					>
						{isSearching ? "Searching..." : "Search"}
					</button>
				</div>
			</div>
		</div>
	);
}
