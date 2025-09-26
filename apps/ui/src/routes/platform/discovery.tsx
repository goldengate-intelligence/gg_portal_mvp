import { Link } from "@tanstack/react-router";
import { Brain, Target } from "lucide-react";
import React from "react";
import { DiscoveryInterface } from "../../components/discovery/DiscoveryInterface";
import { Button } from "../../components/ui/button";

export function Discovery() {
	return (
		<div
			className="text-white relative bg-gradient-to-b from-gray-900/95 via-black/70 to-gray-900/95 pt-20 pb-20"
			style={{ minHeight: "100vh" }}
		>
			{/* Background grid */}
			<div className="absolute inset-0 opacity-[0.03] z-0">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `
            linear-gradient(90deg, #F97316 1px, transparent 1px),
            linear-gradient(180deg, #F97316 1px, transparent 1px)
          `,
						backgroundSize: "15px 15px",
					}}
				/>
			</div>

			{/* Content wrapper */}
			<div className="relative z-10">
				{/* Hero Discovery Header */}
				<div className="relative overflow-hidden mt-6">
					<div className="container mx-auto px-6 pt-0 pb-4 relative max-w-7xl">
						<div className="w-full">
							<div className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 relative p-6 border border-gray-700/50 hover:border-gray-600/40">
								{/* Gradient background matching financial metric cards */}
								<div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl" />
								<div className="relative z-10">
									<div className="flex items-start justify-between">
										<div>
											<div className="flex items-center gap-4 mb-4">
												<div className="p-3 bg-gradient-to-br from-[#F97316]/20 to-[#F97316]/20 border border-[#F97316]/40 rounded-xl backdrop-blur-sm">
													<Brain className="w-8 h-8 text-[#F97316]" />
												</div>
												<div>
													<h1
														className="text-4xl text-white"
														style={{
															fontFamily:
																"system-ui, -apple-system, sans-serif",
															fontWeight: "250",
														}}
													>
														Discovery Engine
													</h1>
													<p className="text-[#F97316] font-sans text-sm tracking-wide">
														ASSET ORIGINATION • FORENSIC DUE DILIGENCE •
														BUSINESS DEVELOPMENT
													</p>
												</div>
											</div>
											<p
												className="text-lg text-gray-300 leading-relaxed max-w-3xl mb-4"
												style={{
													fontFamily: "system-ui, -apple-system, sans-serif",
												}}
											>
												Research government contractors using intelligent search
												with integrated database access.
											</p>
										</div>

										{/* System Status */}
										<div className="flex items-center gap-4">
											<div className="flex items-center gap-3 px-4 py-2 bg-black/50 border border-[#F97316]/30 rounded-lg backdrop-blur-sm">
												<Target
													className="w-4 h-4 text-[#F97316] animate-pulse"
													style={{
														filter:
															"drop-shadow(0 0 8px rgba(249, 115, 22, 0.8))",
													}}
												/>
												<span className="text-xs text-[#F97316] font-sans uppercase">
													SCANNING
												</span>
											</div>
											<Button
												asChild
												className="bg-[#6366F1] hover:bg-[#6366F1]/80 text-white font-bold w-40"
											>
												<Link to="/platform/portfolio">VIEW PORTFOLIO</Link>
											</Button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Discovery Interface */}
				<DiscoveryInterface />

				{/* Footer Copyright */}
				<div className="mt-16 mb-12 text-center">
					<p
						className="uppercase tracking-wider"
						style={{
							fontFamily: "sans-serif",
							fontSize: "12px",
							color: "#D2AC38",
						}}
					>
						© 2025 GOLDENGATE INTELLIGENCE. ALL RIGHTS RESERVED.
					</p>
				</div>
			</div>
		</div>
	);
}

export default Discovery;
