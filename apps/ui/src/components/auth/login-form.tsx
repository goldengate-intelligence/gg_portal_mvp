import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../../contexts/auth-context";
import { CONTRACTOR_DETAIL_COLORS } from "../../logic/utils";
import { Button } from "../ui/button";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const { login } = useAuth();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			await login(email, password);
			router.navigate({ to: "/dashboard" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen w-full flex items-center justify-center text-white px-4 relative bg-gradient-to-t from-black/90 via-gray-900/50 to-black/90">
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

			<div
				className="w-full max-w-md space-y-8 border border-[#D2AC38]/30 rounded-xl p-8 backdrop-blur-sm relative z-10 hover:border-[#D2AC38]/50 transition-all duration-500"
				style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}
			>
				{/* Header glow effect */}
				<div
					className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 hover:opacity-5 transition-opacity duration-300 z-0"
					style={{
						background: "linear-gradient(135deg, #D2AC3820, transparent)",
					}}
				/>

				<div className="text-center relative z-10">
					<h2
						className="text-2xl font-medium mb-8"
						style={{
							fontFamily: "system-ui, -apple-system, sans-serif",
							color: "#D2AC38",
						}}
					>
						Sign in to your account
					</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-300 mb-2"
								style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							>
								Email address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="appearance-none relative block w-full px-4 py-3 border border-gray-600/20 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D2AC38]/50 focus:border-[#D2AC38]/50 sm:text-sm backdrop-blur-sm hover:border-gray-500/30 transition-all duration-200"
								style={{
									backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor,
									fontFamily: "system-ui, -apple-system, sans-serif",
								}}
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-300 mb-2"
								style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							>
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								className="appearance-none relative block w-full px-4 py-3 border border-gray-600/20 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D2AC38]/50 focus:border-[#D2AC38]/50 sm:text-sm backdrop-blur-sm hover:border-gray-500/30 transition-all duration-200"
								style={{
									backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor,
									fontFamily: "system-ui, -apple-system, sans-serif",
								}}
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
					</div>

					{error && (
						<div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 backdrop-blur-sm">
							<div
								className="text-sm text-red-400"
								style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							>
								{error}
							</div>
						</div>
					)}

					<div className="flex items-center justify-start mb-6">
						<div className="text-sm">
							<a
								href="#"
								className="text-gray-300 hover:text-gray-300/80 transition-colors duration-200"
								style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							>
								Forgot your password
							</a>
						</div>
					</div>

					<div>
						<Button
							type="submit"
							disabled={loading}
							className="w-full bg-[#D2AC38] hover:bg-[#D2AC38]/90 text-black font-medium py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#D2AC38]/20 disabled:opacity-50 disabled:cursor-not-allowed"
							style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
						>
							{loading ? "Signing in..." : "Sign in"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
