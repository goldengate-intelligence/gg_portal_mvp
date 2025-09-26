import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../../contexts/auth-context";
import { CONTRACTOR_DETAIL_COLORS } from "../../logic/utils";
import { Button } from "../ui/button";

export function RegisterForm() {
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		password: "",
		confirmPassword: "",
		fullName: "",
		companyName: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>(
		{},
	);
	const { register } = useAuth();
	const router = useRouter();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));

		// Clear field error when user starts typing
		if (fieldErrors[e.target.name]) {
			setFieldErrors((prev) => ({
				...prev,
				[e.target.name]: false,
			}));
		}
	};

	const getFieldClassName = (fieldName: string) => {
		const baseClasses =
			"appearance-none relative block w-full px-4 py-3 text-white rounded-lg focus:outline-none sm:text-sm backdrop-blur-sm transition-all duration-200";

		if (fieldErrors[fieldName]) {
			return `${baseClasses} border border-red-500/50 focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 hover:border-red-400/50`;
		}

		return `${baseClasses} border border-gray-600/20 focus:ring-1 focus:ring-[#D2AC38]/50 focus:border-[#D2AC38]/50 hover:border-gray-500/30`;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setFieldErrors({});

		// Validate required fields
		const errors: { [key: string]: boolean } = {};
		const requiredFields = [
			"fullName",
			"companyName",
			"username",
			"email",
			"password",
			"confirmPassword",
		];

		requiredFields.forEach((field) => {
			if (!formData[field as keyof typeof formData].trim()) {
				errors[field] = true;
			}
		});

		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			setError("Please fill in all required fields");
			setLoading(false);
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setFieldErrors({ password: true, confirmPassword: true });
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		try {
			await register({
				email: formData.email,
				username: formData.username,
				password: formData.password,
				fullName: formData.fullName,
				companyName: formData.companyName,
			});
			router.navigate({ to: "/dashboard" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Registration failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className="min-h-screen w-full flex items-center justify-center text-white px-4 relative bg-gradient-to-t from-black/90 via-gray-900/50 to-black/90"
			style={{ paddingTop: "calc(4rem + 60px)", paddingBottom: "60px" }}
		>
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
						Create your account
					</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="fullName"
								className="block text-sm font-medium text-gray-300 mb-2"
								style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							>
								Full Name
							</label>
							<input
								id="fullName"
								name="fullName"
								type="text"
								required
								className={getFieldClassName("fullName")}
								style={{
									backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor,
									fontFamily: "system-ui, -apple-system, sans-serif",
								}}
								placeholder="Enter your full name"
								value={formData.fullName}
								onChange={handleChange}
							/>
						</div>
						<div>
							<label
								htmlFor="companyName"
								className="block text-sm font-medium text-gray-300 mb-2"
								style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							>
								Company Name
							</label>
							<input
								id="companyName"
								name="companyName"
								type="text"
								required
								className={getFieldClassName("companyName")}
								style={{
									backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor,
									fontFamily: "system-ui, -apple-system, sans-serif",
								}}
								placeholder="Enter your company name"
								value={formData.companyName}
								onChange={handleChange}
							/>
						</div>
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-gray-300 mb-2"
								style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							>
								Username
							</label>
							<input
								id="username"
								name="username"
								type="text"
								required
								className={getFieldClassName("username")}
								style={{
									backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor,
									fontFamily: "system-ui, -apple-system, sans-serif",
								}}
								placeholder="Choose a username"
								value={formData.username}
								onChange={handleChange}
							/>
						</div>
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
								className={getFieldClassName("email")}
								style={{
									backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor,
									fontFamily: "system-ui, -apple-system, sans-serif",
								}}
								placeholder="Enter your email"
								value={formData.email}
								onChange={handleChange}
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
								autoComplete="new-password"
								required
								className={getFieldClassName("password")}
								style={{
									backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor,
									fontFamily: "system-ui, -apple-system, sans-serif",
								}}
								placeholder="Create a password"
								value={formData.password}
								onChange={handleChange}
							/>
						</div>
						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-300 mb-2"
								style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							>
								Confirm Password
							</label>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								autoComplete="new-password"
								required
								className={getFieldClassName("confirmPassword")}
								style={{
									backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor,
									fontFamily: "system-ui, -apple-system, sans-serif",
								}}
								placeholder="Confirm your password"
								value={formData.confirmPassword}
								onChange={handleChange}
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

					<div>
						<Button
							type="submit"
							disabled={loading}
							className="w-full bg-[#D2AC38] hover:bg-[#D2AC38]/90 text-black font-medium py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#D2AC38]/20 disabled:opacity-50 disabled:cursor-not-allowed"
							style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
						>
							{loading ? "Creating account..." : "Create account"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
