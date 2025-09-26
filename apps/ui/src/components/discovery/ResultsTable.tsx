import { BarChart3, Copy, Database, Download, History } from "lucide-react";
import React from "react";
import type { Contractor } from "./types/discovery";

interface ResultsTableProps {
	viewMode: "table" | "chart";
	onViewModeChange: (mode: "table" | "chart") => void;
	queryResults: Contractor[];
	queryColumns: string[];
	selectedRows: Set<number>;
	onRowSelect: (rowIndex: number) => void;
	isExecuting: boolean;
	queryExecutionTime: number;
	showColumnSelector: boolean;
	onToggleColumnSelector: () => void;
	onExport: () => void;
	onShowHistory: () => void;
}

export function ResultsTable({
	viewMode,
	onViewModeChange,
	queryResults,
	queryColumns,
	selectedRows,
	onRowSelect,
	isExecuting,
	queryExecutionTime,
	showColumnSelector,
	onToggleColumnSelector,
	onExport,
	onShowHistory,
}: ResultsTableProps) {
	return (
		<div className="border border-gray-700 rounded-lg p-3 bg-gray-800">
			{/* Results/Chart Tabs - Snowflake Style */}
			<div className="bg-gray-800 mb-3">
				<div className="flex items-center justify-between">
					<div className="flex">
						<button
							onClick={() => onViewModeChange("table")}
							className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
								viewMode === "table"
									? "text-blue-400 border-blue-400 bg-blue-500/10"
									: "text-gray-400 border-transparent hover:text-gray-300"
							}`}
						>
							<Database className="w-4 h-4" />
							Results
						</button>
						<button
							onClick={() => onViewModeChange("chart")}
							className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
								viewMode === "chart"
									? "text-blue-400 border-blue-400 bg-blue-500/10"
									: "text-gray-400 border-transparent hover:text-gray-300"
							}`}
						>
							<BarChart3 className="w-4 h-4" />
							Chart
						</button>
					</div>

					{/* Snowflake-style toolbar */}
					<div className="flex items-center gap-1 px-4">
						<button
							className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors"
							title="Copy"
						>
							<Copy className="w-4 h-4" />
						</button>
						<button
							onClick={onExport}
							className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors"
							title="Download"
						>
							<Download className="w-4 h-4" />
						</button>
						<button
							onClick={onShowHistory}
							className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors"
							title="History"
						>
							<History className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>

			{/* Results Content Area - Only this section has orange border */}
			<div className="border border-[#F97316]/40 rounded-lg overflow-hidden bg-gray-900 h-96">
				{viewMode === "table" ? (
					<div className="h-full overflow-auto">
						{queryResults.length > 0 ? (
							<table className="w-full text-sm">
								<thead className="sticky top-0 bg-gray-800 border-b border-gray-700">
									<tr>
										{queryColumns.map((column, index) => (
											<th
												key={index}
												className="text-left p-3 text-gray-300 font-medium border-r border-gray-700 last:border-r-0"
											>
												<div className="flex items-center gap-2">
													<span>{column}</span>
													<div className="text-xs text-gray-500">
														{column.includes("OBLIGATED") ||
														column.includes("VALUE")
															? "NUMBER(38,0)"
															: "VARCHAR(16777216)"}
													</div>
												</div>
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{queryResults.map((row, rowIndex) => (
										<tr
											key={rowIndex}
											className={`border-b border-gray-700 hover:bg-gray-800/50 cursor-pointer ${
												selectedRows.has(rowIndex) ? "bg-blue-500/10" : ""
											}`}
											onClick={() => onRowSelect(rowIndex)}
										>
											{queryColumns.map((column, colIndex) => (
												<td
													key={colIndex}
													className="p-3 text-gray-200 border-r border-gray-700 last:border-r-0 font-mono text-xs"
												>
													{(row as any)[column] || (
														<span className="text-gray-500 italic">null</span>
													)}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						) : isExecuting ? (
							<div className="h-full flex items-center justify-center">
								<div className="text-center">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4" />
									<div className="text-gray-400">Executing query...</div>
									<div className="text-xs text-gray-500 mt-1">
										{queryExecutionTime}s elapsed
									</div>
								</div>
							</div>
						) : (
							<div className="h-full flex items-center justify-center">
								<div className="text-center text-gray-500">
									<Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
									<div>No data to display</div>
									<div className="text-xs mt-2">Run a query to see results</div>
								</div>
							</div>
						)}
					</div>
				) : (
					<div className="h-full flex items-center justify-center">
						<div className="text-center text-gray-500">
							<BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
							<div>Chart view</div>
							<div className="text-xs mt-2">Visualization coming soon</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
