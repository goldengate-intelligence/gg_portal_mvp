import { Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	BarChart3,
	Bell,
	Bot,
	HelpCircle,
	Shield,
	User,
} from "lucide-react";
import type { ReactNode } from "react";
import { CONTRACTOR_DETAIL_COLORS } from "../../logic/utils";

interface SettingsLayoutProps {
	children: ReactNode;
	title: string;
	description: string;
}

export function SettingsLayout({
	children,
	title,
	description,
}: SettingsLayoutProps) {
	const settingsNavigation = [
		{ name: "Profile Settings", href: "/settings/profile", icon: User },
		{ name: "Account Security", href: "/settings/security", icon: Shield },
		{ name: "Agent Automation", href: "/settings/agents", icon: Bot },
		{ name: "Usage Analytics", href: "/settings/analytics", icon: BarChart3 },
		{ name: "Notifications", href: "/settings/notifications", icon: Bell },
		{ name: "Help & Support", href: "/settings/support", icon: HelpCircle },
	];

	return (
		<div className="min-h-screen text-white pb-20 bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 relative">
			{/* Background grid */}
			<div className="absolute inset-0 opacity-5 z-0">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `
            linear-gradient(90deg, #D2AC38 1px, transparent 1px),
            linear-gradient(180deg, #D2AC38 1px, transparent 1px)
          `,
						backgroundSize: "15px 15px",
					}}
				/>
			</div>

			<div className="container mx-auto px-6 pt-24 pb-20 relative z-10">
				{/* Header with back navigation */}
				<div className="mb-8">
					<Link
						to="/dashboard"
						className="inline-flex items-center gap-2 text-[#D2AC38] hover:text-[#D2AC38]/80 transition-colors mb-6"
					>
						<ArrowLeft className="w-4 h-4" />
						<span
							className="text-sm font-medium"
							style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
						>
							Back to Dashboard
						</span>
					</Link>

					<div className="mb-8">
						<h1
							className="text-4xl text-white mb-2"
							style={{
								fontFamily: "system-ui, -apple-system, sans-serif",
								fontWeight: "250",
							}}
						>
							{title}
						</h1>
						<p className="text-[#D2AC38] font-sans text-sm tracking-wide">
							{description.toUpperCase()}
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Settings Navigation Sidebar */}
					<div className="lg:col-span-1">
						<div
							className="border border-gray-700/50 hover:border-gray-600/40 rounded-xl overflow-hidden shadow-2xl transition-all duration-500 relative"
							style={{ backgroundColor: "#111726" }}
						>
							{/* Gradient background */}
							<div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl" />

							<div className="p-6 relative z-10">
								<h3
									className="text-gray-200 mb-6 uppercase tracking-wide font-bold"
									style={{ fontFamily: "Genos, sans-serif", fontSize: "18px" }}
								>
									SETTINGS
								</h3>
								<nav className="space-y-2">
									{settingsNavigation.map((item) => (
										<Link
											key={item.name}
											to={item.href}
											className="group flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-[#D2AC38]/10 border border-transparent hover:border-[#D2AC38]/30"
											activeProps={{
												className:
													"bg-[#D2AC38]/20 border-[#D2AC38]/50 text-[#D2AC38]",
											}}
										>
											<item.icon className="w-5 h-5 text-gray-400 group-hover:text-[#D2AC38] transition-colors" />
											<span
												className="text-sm font-medium text-gray-300 group-hover:text-[#D2AC38] transition-colors"
												style={{
													fontFamily: "system-ui, -apple-system, sans-serif",
												}}
											>
												{item.name}
											</span>
										</Link>
									))}
								</nav>
							</div>
						</div>
					</div>

					{/* Main Content Area */}
					<div className="lg:col-span-3">
						<div
							className="border border-gray-700/50 hover:border-gray-600/40 rounded-xl overflow-hidden shadow-2xl transition-all duration-500 relative"
							style={{ backgroundColor: "#111726" }}
						>
							{/* Gradient background */}
							<div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl" />

							<div className="relative z-10">{children}</div>
						</div>
					</div>
				</div>
			</div>

			{/* Footer Copyright */}
			<div className="mt-16 text-center">
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
	);
}
