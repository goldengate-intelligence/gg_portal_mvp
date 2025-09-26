import { History, MoreHorizontal, X } from "lucide-react";
import React from "react";
import type { QueryHistoryItem } from "./types/discovery";

interface QueryHistoryProps {
	queryHistory: QueryHistoryItem[];
	isExecuting: boolean;
	queryExecutionTime: number;
	onCancelQuery?: () => void;
	onRerunQuery?: (query: string) => void;
}

export function QueryHistory({
	queryHistory,
	isExecuting,
	queryExecutionTime,
	onCancelQuery,
	onRerunQuery,
}: QueryHistoryProps) {
	const today = new Date().toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	return (
		<div className="h-full flex flex-col">
			{/* History Header */}
			<div className="border-b border-gray-700 p-4">
				<div className="flex items-center justify-between mb-3">
					<h4 className="text-sm font-medium text-gray-200 flex items-center gap-2">
						<History className="w-4 h-4" />
						{queryHistory.length} Queries
					</h4>
					<div className="flex items-center gap-2">
						<span className="text-xs text-gray-400">Status</span>
						<select className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-300">
							<option>All</option>
							<option>Success</option>
							<option>Running</option>
							<option>Failed</option>
						</select>
					</div>
				</div>
			</div>

			{/* Query History Content */}
			<div className="p-4 flex-1 overflow-y-auto">
				<div className="space-y-1">
					<div className="text-xs text-gray-500 mb-3 px-2">{today}</div>

					{/* Current executing query */}
					{isExecuting && (
						<div className="border border-blue-500 bg-blue-500/10 rounded">
							<div className="p-3 border-l-4 border-blue-500">
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
										<span className="text-sm font-medium text-gray-200">
											{new Date().toLocaleTimeString()}
										</span>
										<span className="text-xs text-blue-400">
											{queryExecutionTime}ms
										</span>
									</div>
									{onCancelQuery && (
										<button
											onClick={onCancelQuery}
											className="text-gray-400 hover:text-red-400"
											title="Cancel query"
										>
											<X className="w-3 h-3" />
										</button>
									)}
								</div>
								<div className="text-xs text-gray-300 font-mono truncate">
									Searching contractors...
								</div>
							</div>
						</div>
					)}

					{/* Query history entries */}
					{queryHistory.map((entry) => (
						<div
							key={entry.id}
							className="hover:bg-gray-800/50 rounded cursor-pointer group"
							onClick={() => onRerunQuery?.(entry.query)}
						>
							<div
								className={`p-3 border-l-4 ${
									entry.status === "completed"
										? "border-green-500"
										: entry.status === "failed"
											? "border-red-500"
											: "border-gray-500"
								}`}
							>
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<div
											className={`w-2 h-2 rounded-full ${
												entry.status === "completed"
													? "bg-green-400"
													: entry.status === "failed"
														? "bg-red-400"
														: "bg-gray-400"
											}`}
										/>
										<span className="text-sm text-gray-200">
											{entry.timestamp.toLocaleTimeString()}
										</span>
										{entry.results_count !== undefined && (
											<span className="text-xs text-gray-400">
												{entry.results_count} results
											</span>
										)}
									</div>
									<button
										onClick={(e) => {
											e.stopPropagation();
											// Handle options menu
										}}
										className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-300 transition-opacity"
										title="Options"
									>
										<MoreHorizontal className="w-3 h-3" />
									</button>
								</div>
								<div
									className="text-xs text-gray-300 truncate"
									title={entry.query}
								>
									{entry.query}
								</div>
							</div>
						</div>
					))}

					{queryHistory.length === 0 && !isExecuting && (
						<div className="text-center text-gray-500 py-8">
							<History className="w-8 h-8 mx-auto mb-2 opacity-50" />
							<div className="text-sm">No query history</div>
							<div className="text-xs mt-1">
								Your search history will appear here
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
