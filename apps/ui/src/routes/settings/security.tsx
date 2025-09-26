import { createRoute } from "@tanstack/react-router";
import { AlertTriangle, Key, Shield, Smartphone } from "lucide-react";
import { useState } from "react";
import { ProtectedRoute } from "../../components/protected-route";
import {
	CancelButton,
	FormActions,
	FormCheckbox,
	FormField,
	FormSection,
	SaveButton,
} from "../../components/settings/form-components";
import { SettingsLayout } from "../../components/settings/settings-layout";

function SecuritySettingsComponent() {
	const [loading, setLoading] = useState(false);
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [securitySettings, setSecuritySettings] = useState({
		twoFactorEnabled: false,
		emailNotifications: true,
		loginAlerts: true,
		sessionTimeout: true,
	});

	const [sessions] = useState([
		{
			id: "1",
			device: "MacBook Pro - Chrome",
			location: "New York, NY",
			lastActive: "2 minutes ago",
			current: true,
		},
		{
			id: "2",
			device: "iPhone 14 - Safari",
			location: "New York, NY",
			lastActive: "1 hour ago",
			current: false,
		},
		{
			id: "3",
			device: "Windows PC - Edge",
			location: "Los Angeles, CA",
			lastActive: "3 days ago",
			current: false,
		},
	]);

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPasswordData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSecuritySettingChange = (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		setSecuritySettings((prev) => ({
			...prev,
			[e.target.name]: e.target.checked,
		}));
	};

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			alert("New passwords do not match");
			setLoading(false);
			return;
		}

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log("Password updated");
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} catch (error) {
			console.error("Failed to update password:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSecuritySubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log("Security settings updated:", securitySettings);
		} catch (error) {
			console.error("Failed to update security settings:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSessionTerminate = async (sessionId: string) => {
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 500));
			console.log("Session terminated:", sessionId);
		} catch (error) {
			console.error("Failed to terminate session:", error);
		}
	};

	return (
		<ProtectedRoute>
			<SettingsLayout
				title="Account Security"
				description="Update password and security settings"
			>
				<div className="p-6 space-y-8">
					{/* Password Change Section */}
					<form onSubmit={handlePasswordSubmit}>
						<FormSection
							title="Change Password"
							description="Update your account password to keep your account secure."
						>
							<div className="space-y-4">
								<FormField
									label="Current Password"
									id="currentPassword"
									type="password"
									value={passwordData.currentPassword}
									onChange={handlePasswordChange}
									placeholder="Enter your current password"
									required
								/>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										label="New Password"
										id="newPassword"
										type="password"
										value={passwordData.newPassword}
										onChange={handlePasswordChange}
										placeholder="Enter a new password"
										required
										helpText="Must be at least 8 characters with uppercase, lowercase, and numbers"
									/>
									<FormField
										label="Confirm New Password"
										id="confirmPassword"
										type="password"
										value={passwordData.confirmPassword}
										onChange={handlePasswordChange}
										placeholder="Confirm your new password"
										required
									/>
								</div>
							</div>

							<FormActions>
								<SaveButton loading={loading}>Update Password</SaveButton>
							</FormActions>
						</FormSection>
					</form>

					{/* Two-Factor Authentication */}
					<FormSection
						title="Two-Factor Authentication"
						description="Add an extra layer of security to your account."
					>
						<div className="flex items-start gap-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
							<Shield className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
							<div className="flex-1">
								<h4
									className="text-blue-400 font-medium mb-2"
									style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
								>
									Enhanced Security
								</h4>
								<p
									className="text-gray-300 text-sm mb-4"
									style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
								>
									Two-factor authentication adds an extra layer of security by
									requiring a code from your phone in addition to your password.
								</p>
								{securitySettings.twoFactorEnabled ? (
									<div className="flex items-center gap-2">
										<span className="text-green-400 text-sm font-medium">
											✓ Enabled
										</span>
										<button className="text-red-400 text-sm hover:text-red-300 ml-4">
											Disable
										</button>
									</div>
								) : (
									<button className="bg-[#D2AC38] hover:bg-[#D2AC38]/90 text-black font-medium px-4 py-2 rounded-lg transition-all duration-200">
										Enable 2FA
									</button>
								)}
							</div>
						</div>
					</FormSection>

					{/* Security Preferences */}
					<form onSubmit={handleSecuritySubmit}>
						<FormSection
							title="Security Preferences"
							description="Configure security notifications and session management."
						>
							<div className="space-y-4">
								<FormCheckbox
									label="Email Security Notifications"
									id="emailNotifications"
									checked={securitySettings.emailNotifications}
									onChange={handleSecuritySettingChange}
									helpText="Receive email notifications for important security events"
								/>
								<FormCheckbox
									label="Login Alerts"
									id="loginAlerts"
									checked={securitySettings.loginAlerts}
									onChange={handleSecuritySettingChange}
									helpText="Get notified when someone logs into your account"
								/>
								<FormCheckbox
									label="Automatic Session Timeout"
									id="sessionTimeout"
									checked={securitySettings.sessionTimeout}
									onChange={handleSecuritySettingChange}
									helpText="Automatically log out after 30 minutes of inactivity"
								/>
							</div>

							<FormActions>
								<SaveButton loading={loading}>
									Save Security Settings
								</SaveButton>
							</FormActions>
						</FormSection>
					</form>

					{/* Active Sessions */}
					<FormSection
						title="Active Sessions"
						description="Manage devices and locations where you're currently signed in."
					>
						<div className="space-y-4">
							{sessions.map((session) => (
								<div
									key={session.id}
									className="flex items-center justify-between p-4 rounded-lg border border-gray-600/30 bg-gray-800/30"
								>
									<div className="flex items-start gap-3">
										<div className="p-2 rounded-lg bg-gray-700/50">
											<Smartphone className="w-5 h-5 text-gray-400" />
										</div>
										<div>
											<div className="flex items-center gap-2">
												<span
													className="text-white font-medium"
													style={{
														fontFamily: "system-ui, -apple-system, sans-serif",
													}}
												>
													{session.device}
												</span>
												{session.current && (
													<span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
														Current Session
													</span>
												)}
											</div>
											<p
												className="text-gray-400 text-sm"
												style={{
													fontFamily: "system-ui, -apple-system, sans-serif",
												}}
											>
												{session.location} • Last active {session.lastActive}
											</p>
										</div>
									</div>
									{!session.current && (
										<button
											onClick={() => handleSessionTerminate(session.id)}
											className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1 rounded border border-red-500/30 hover:bg-red-500/10 transition-all"
										>
											Terminate
										</button>
									)}
								</div>
							))}
						</div>
					</FormSection>

					{/* Security Warning */}
					<div className="flex items-start gap-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
						<AlertTriangle className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
						<div>
							<h4
								className="text-amber-400 font-medium mb-2"
								style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							>
								Account Security Tips
							</h4>
							<ul
								className="text-gray-300 text-sm space-y-1"
								style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							>
								<li>• Use a strong, unique password for your account</li>
								<li>
									• Enable two-factor authentication for enhanced security
								</li>
								<li>• Regularly review your active sessions</li>
								<li>• Never share your login credentials with others</li>
							</ul>
						</div>
					</div>
				</div>
			</SettingsLayout>
		</ProtectedRoute>
	);
}

export const securitySettingsRoute = (rootRoute: any) =>
	createRoute({
		getParentRoute: () => rootRoute,
		path: "/settings/security",
		component: SecuritySettingsComponent,
	});

export default securitySettingsRoute;
