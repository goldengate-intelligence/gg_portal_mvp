import { X } from "lucide-react";
import type React from "react";
import type { ActiveMonitor } from "../types";
import { ChartStyleContainer } from "../ui/ChartStyleContainer";

const InternalContentContainer = ({
	children,
}: { children: React.ReactNode }) => (
	<div className="p-4 h-full flex flex-col relative z-10">{children}</div>
);

interface ActiveMonitorsListProps {
	activeMonitors: ActiveMonitor[];
	onRemoveMonitor: (monitorId: string) => void;
}

export function ActiveMonitorsList({
	activeMonitors,
	onRemoveMonitor,
}: ActiveMonitorsListProps) {
	if (activeMonitors.length === 0) return null;

	return (
		<div className="mt-6">
			<div className="border border-[#8B8EFF]/30 rounded-xl hover:border-[#8B8EFF]/50 transition-all duration-500">
				<InternalContentContainer>
					<ChartStyleContainer>
						<div className="relative">
							{/* Title */}
							<div className="absolute top-0 left-0 z-10">
								<h3 className="font-sans text-xs uppercase tracking-wider text-gray-500">
									Active Monitors
								</h3>
							</div>

							{/* Live Indicator */}
							<div className="absolute top-0 right-0 z-10 flex items-center gap-2">
								<span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
								<span
									className="text-[10px] text-green-400 tracking-wider font-light"
									style={{ fontFamily: "Genos, sans-serif" }}
								>
									ACTIVE
								</span>
							</div>

							{/* Content */}
							<div className="pt-8">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{activeMonitors.map((monitor) => (
										<div
											key={monitor.id}
											className={`p-4 rounded-lg border relative group hover:border-opacity-70 transition-all ${
												monitor.type === "activity"
													? "bg-orange-500/10 border-orange-500/30 hover:border-orange-400/50"
													: monitor.type === "performance"
														? "bg-cyan-500/10 border-cyan-500/30 hover:border-cyan-400/50"
														: "bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-400/50"
											}`}
										>
											{/* Monitor Type Badge */}
											<div
												className={`text-xs px-2 py-1 rounded-md font-medium mb-2 inline-block ${
													monitor.type === "activity"
														? "bg-orange-500/20 text-orange-400"
														: monitor.type === "performance"
															? "bg-cyan-500/20 text-cyan-400"
															: "bg-indigo-500/20 text-indigo-400"
												}`}
											>
												{monitor.type.toUpperCase()}
											</div>

											{/* Monitor Name */}
											<h4 className="text-sm font-medium text-white mb-1">
												{monitor.name}
											</h4>

											{/* Entity and Feature */}
											<div className="text-xs text-gray-400 mb-2">
												<div>{monitor.entityName}</div>
												<div>{monitor.featureName}</div>
											</div>

											{/* Configuration Summary */}
											<div className="text-xs text-gray-500 mb-2">
												{monitor.type === "activity" && (
													<div>Threshold: {monitor.config.redThreshold}</div>
												)}
												{monitor.type === "performance" &&
													monitor.config.type === "range" && (
														<div>
															Range: {monitor.config.critical?.max}-
															{monitor.config.optimal?.min}
														</div>
													)}
												{monitor.type === "utilization" &&
													monitor.config.type === "range" && (
														<div>
															Range: {monitor.config.caution?.max ?? 85}%+
														</div>
													)}
											</div>

											{/* Status */}
											<div className="flex items-center justify-between">
												<span className="text-xs text-green-400">● Active</span>
												<button
													onClick={() => onRemoveMonitor(monitor.id)}
													className="text-gray-500 hover:text-red-400 transition-colors"
													title="Remove Monitor"
												>
													<X className="w-3 h-3" />
												</button>
											</div>
										</div>
									))}
								</div>

								{/* Summary */}
								<div className="mt-4 text-center">
									<p className="text-xs text-gray-500">
										{activeMonitors.length} active monitor
										{activeMonitors.length !== 1 ? "s" : ""} • Real-time
										monitoring enabled
									</p>
								</div>
							</div>
						</div>
					</ChartStyleContainer>
				</InternalContentContainer>
			</div>
		</div>
	);
}
