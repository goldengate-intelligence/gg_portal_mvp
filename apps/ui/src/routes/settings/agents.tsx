import { createRoute } from "@tanstack/react-router";
import {
	AlertCircle,
	Bot,
	Clock,
	Pause,
	Play,
	Settings,
	Target,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { ProtectedRoute } from "../../components/protected-route";
import {
	CancelButton,
	FormActions,
	FormCheckbox,
	FormField,
	FormSection,
	FormSelect,
	FormTextarea,
	SaveButton,
} from "../../components/settings/form-components";
import { SettingsLayout } from "../../components/settings/settings-layout";

function AgentAutomationComponent() {
	const [loading, setLoading] = useState(false);

	const [agents, setAgents] = useState([
		{
			id: "1",
			name: "Portfolio Monitor",
			description: "Monitors portfolio changes and sends alerts",
			enabled: true,
			status: "active",
			lastRun: "2 minutes ago",
			frequency: "real-time",
		},
		{
			id: "2",
			name: "Market Scanner",
			description: "Scans for new investment opportunities",
			enabled: true,
			status: "active",
			lastRun: "15 minutes ago",
			frequency: "hourly",
		},
		{
			id: "3",
			name: "Risk Analyzer",
			description: "Analyzes portfolio risk and compliance",
			enabled: false,
			status: "inactive",
			lastRun: "2 days ago",
			frequency: "daily",
		},
		{
			id: "4",
			name: "Report Generator",
			description: "Generates automated reports and summaries",
			enabled: true,
			status: "active",
			lastRun: "1 hour ago",
			frequency: "daily",
		},
	]);

	const [newAgent, setNewAgent] = useState({
		name: "",
		description: "",
		frequency: "daily",
		enabled: true,
		triggers: "",
		actions: "",
	});

	const [automationSettings, setAutomationSettings] = useState({
		enableGlobalAutomation: true,
		maxConcurrentAgents: 5,
		defaultTimeout: 300,
		enableLogging: true,
		enableNotifications: true,
		pauseDuringMarketClosed: false,
	});

	const frequencyOptions = [
		{ value: "real-time", label: "Real-time" },
		{ value: "every-5-minutes", label: "Every 5 minutes" },
		{ value: "every-15-minutes", label: "Every 15 minutes" },
		{ value: "hourly", label: "Hourly" },
		{ value: "daily", label: "Daily" },
		{ value: "weekly", label: "Weekly" },
	];

	const timeoutOptions = [
		{ value: "60", label: "1 minute" },
		{ value: "300", label: "5 minutes" },
		{ value: "600", label: "10 minutes" },
		{ value: "1800", label: "30 minutes" },
		{ value: "3600", label: "1 hour" },
	];

	const maxAgentOptions = [
		{ value: "3", label: "3 agents" },
		{ value: "5", label: "5 agents" },
		{ value: "10", label: "10 agents" },
		{ value: "20", label: "20 agents" },
	];

	const handleNewAgentChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => {
		setNewAgent((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleAutomationSettingChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const value =
			e.target.type === "checkbox" ? e.target.checked : e.target.value;
		setAutomationSettings((prev) => ({
			...prev,
			[e.target.name]: value,
		}));
	};

	const handleToggleAgent = (agentId: string) => {
		setAgents((prev) =>
			prev.map((agent) =>
				agent.id === agentId
					? {
							...agent,
							enabled: !agent.enabled,
							status: !agent.enabled ? "active" : "inactive",
						}
					: agent,
			),
		);
	};

	const handleCreateAgent = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			const newAgentData = {
				id: String(agents.length + 1),
				...newAgent,
				status: newAgent.enabled ? "active" : "inactive",
				lastRun: "Never",
			};

			setAgents((prev) => [...prev, newAgentData]);
			setNewAgent({
				name: "",
				description: "",
				frequency: "daily",
				enabled: true,
				triggers: "",
				actions: "",
			});
		} catch (error) {
			console.error("Failed to create agent:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSaveSettings = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log("Automation settings updated:", automationSettings);
		} catch (error) {
			console.error("Failed to update settings:", error);
		} finally {
			setLoading(false);
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "active":
				return <Play className="w-4 h-4 text-green-400" />;
			case "inactive":
				return <Pause className="w-4 h-4 text-gray-400" />;
			default:
				return <AlertCircle className="w-4 h-4 text-amber-400" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "text-green-400";
			case "inactive":
				return "text-gray-400";
			default:
				return "text-amber-400";
		}
	};

	return (
		<ProtectedRoute>
			<SettingsLayout
				title="Agent Automation"
				description="Configure AI agents and automated workflows"
			>
				<div className="p-6 space-y-8">
					{/* Global Automation Settings */}
					<form onSubmit={handleSaveSettings}>
						<FormSection
							title="Global Settings"
							description="Configure global automation preferences and limits."
						>
							<div className="space-y-4">
								<FormCheckbox
									label="Enable Global Automation"
									id="enableGlobalAutomation"
									checked={automationSettings.enableGlobalAutomation}
									onChange={handleAutomationSettingChange}
									helpText="Master switch for all automated agents and workflows"
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormSelect
										label="Maximum Concurrent Agents"
										id="maxConcurrentAgents"
										value={String(automationSettings.maxConcurrentAgents)}
										onChange={handleAutomationSettingChange}
										options={maxAgentOptions}
										helpText="Limit the number of agents running simultaneously"
									/>
									<FormSelect
										label="Default Timeout"
										id="defaultTimeout"
										value={String(automationSettings.defaultTimeout)}
										onChange={handleAutomationSettingChange}
										options={timeoutOptions}
										helpText="Default timeout for agent operations"
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormCheckbox
										label="Enable Detailed Logging"
										id="enableLogging"
										checked={automationSettings.enableLogging}
										onChange={handleAutomationSettingChange}
										helpText="Log detailed information about agent activities"
									/>
									<FormCheckbox
										label="Pause During Market Closed"
										id="pauseDuringMarketClosed"
										checked={automationSettings.pauseDuringMarketClosed}
										onChange={handleAutomationSettingChange}
										helpText="Automatically pause market-related agents when markets are closed"
									/>
								</div>
							</div>

							<FormActions>
								<SaveButton loading={loading}>Save Global Settings</SaveButton>
							</FormActions>
						</FormSection>
					</form>

					{/* Active Agents */}
					<FormSection
						title="Active Agents"
						description="Manage your automated agents and their configurations."
					>
						<div className="space-y-4">
							{agents.map((agent) => (
								<div
									key={agent.id}
									className="flex items-center justify-between p-4 rounded-lg border border-gray-600/30 bg-gray-800/30"
								>
									<div className="flex items-start gap-3">
										<div className="p-2 rounded-lg bg-gray-700/50">
											<Bot className="w-5 h-5 text-[#D2AC38]" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-1">
												<span
													className="text-white font-medium"
													style={{
														fontFamily: "system-ui, -apple-system, sans-serif",
													}}
												>
													{agent.name}
												</span>
												<div className="flex items-center gap-1">
													{getStatusIcon(agent.status)}
													<span
														className={`text-xs font-medium ${getStatusColor(agent.status)}`}
													>
														{agent.status.charAt(0).toUpperCase() +
															agent.status.slice(1)}
													</span>
												</div>
											</div>
											<p
												className="text-gray-400 text-sm mb-2"
												style={{
													fontFamily: "system-ui, -apple-system, sans-serif",
												}}
											>
												{agent.description}
											</p>
											<div className="flex items-center gap-4 text-xs text-gray-500">
												<span className="flex items-center gap-1">
													<Clock className="w-3 h-3" />
													Last run: {agent.lastRun}
												</span>
												<span className="flex items-center gap-1">
													<Zap className="w-3 h-3" />
													Frequency: {agent.frequency}
												</span>
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<button
											onClick={() => handleToggleAgent(agent.id)}
											className={`px-3 py-1 rounded text-sm font-medium transition-all ${
												agent.enabled
													? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
													: "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
											}`}
										>
											{agent.enabled ? "Disable" : "Enable"}
										</button>
										<button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded transition-all">
											<Settings className="w-4 h-4" />
										</button>
									</div>
								</div>
							))}
						</div>
					</FormSection>

					{/* Create New Agent */}
					<form onSubmit={handleCreateAgent}>
						<FormSection
							title="Create New Agent"
							description="Build a custom automation agent for your specific needs."
						>
							<div className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										label="Agent Name"
										id="name"
										value={newAgent.name}
										onChange={handleNewAgentChange}
										placeholder="Enter agent name"
										required
									/>
									<FormSelect
										label="Execution Frequency"
										id="frequency"
										value={newAgent.frequency}
										onChange={handleNewAgentChange}
										options={frequencyOptions}
										required
									/>
								</div>

								<FormTextarea
									label="Description"
									id="description"
									value={newAgent.description}
									onChange={handleNewAgentChange}
									placeholder="Describe what this agent does..."
									rows={3}
									required
								/>

								<FormTextarea
									label="Triggers"
									id="triggers"
									value={newAgent.triggers}
									onChange={handleNewAgentChange}
									placeholder="Define the conditions that trigger this agent (e.g., price changes, new data, time-based)..."
									rows={3}
									helpText="Specify what events or conditions should activate this agent"
								/>

								<FormTextarea
									label="Actions"
									id="actions"
									value={newAgent.actions}
									onChange={handleNewAgentChange}
									placeholder="Define what actions this agent should take when triggered (e.g., send alerts, update data, generate reports)..."
									rows={3}
									helpText="Describe the tasks this agent should perform"
								/>

								<FormCheckbox
									label="Enable Agent Immediately"
									id="enabled"
									checked={newAgent.enabled}
									onChange={(e) =>
										setNewAgent((prev) => ({
											...prev,
											enabled: e.target.checked,
										}))
									}
									helpText="Start running this agent as soon as it's created"
								/>
							</div>

							<FormActions>
								<CancelButton
									onClick={() =>
										setNewAgent({
											name: "",
											description: "",
											frequency: "daily",
											enabled: true,
											triggers: "",
											actions: "",
										})
									}
								/>
								<SaveButton loading={loading}>Create Agent</SaveButton>
							</FormActions>
						</FormSection>
					</form>

					{/* Automation Tips */}
					<div className="flex items-start gap-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
						<Target className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
						<div>
							<h4
								className="text-blue-400 font-medium mb-2"
								style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							>
								Automation Best Practices
							</h4>
							<ul
								className="text-gray-300 text-sm space-y-1"
								style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
							>
								<li>
									• Start with simple automation rules and gradually add
									complexity
								</li>
								<li>
									• Test agents with small datasets before deploying to
									production
								</li>
								<li>
									• Monitor agent performance and adjust frequency as needed
								</li>
								<li>
									• Use descriptive names and documentation for easier
									management
								</li>
								<li>
									• Set appropriate timeouts to prevent agents from running
									indefinitely
								</li>
							</ul>
						</div>
					</div>
				</div>
			</SettingsLayout>
		</ProtectedRoute>
	);
}

export const agentAutomationRoute = (rootRoute: any) =>
	createRoute({
		getParentRoute: () => rootRoute,
		path: "/settings/agents",
		component: AgentAutomationComponent,
	});

export default agentAutomationRoute;
