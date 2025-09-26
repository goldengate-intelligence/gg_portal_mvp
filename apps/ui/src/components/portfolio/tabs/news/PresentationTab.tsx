import {
	AlertCircle,
	ArrowRight,
	Bot,
	Check,
	Download,
	FileSpreadsheet,
	FileText,
	Presentation,
	Trash2,
	Upload,
	Zap,
} from "lucide-react";
import type React from "react";
import { useCallback, useState } from "react";
import { Button } from "../../../ui/button";

// Design Framework Components - Indigo Theme
const ExternalPanelContainer = ({
	children,
}: { children: React.ReactNode }) => (
	<div className="h-full border border-[#8B8EFF]/30 rounded-xl overflow-hidden shadow-2xl hover:border-[#8B8EFF]/50 transition-all duration-500 group relative bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 backdrop-blur-sm">
		{/* Animated background grid */}
		<div className="absolute inset-0 opacity-5 z-0">
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: `
          linear-gradient(90deg, #8B8EFF 1px, transparent 1px),
          linear-gradient(180deg, #8B8EFF 1px, transparent 1px)
        `,
					backgroundSize: "15px 15px",
				}}
			/>
		</div>

		{/* Glow effect on hover */}
		<div
			className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-0"
			style={{ background: "linear-gradient(135deg, #8B8EFF20, transparent)" }}
		/>

		{children}
	</div>
);

// Chart-Style Container
const ChartStyleContainer = ({ children }: { children: React.ReactNode }) => (
	<div
		className="rounded-lg p-4"
		style={{
			backgroundColor: "#223040",
		}}
	>
		{children}
	</div>
);

const InternalContentContainer = ({
	children,
}: { children: React.ReactNode }) => (
	<div className="p-4 h-full flex flex-col relative z-10">{children}</div>
);

const PanelTitle = ({ children }: { children: React.ReactNode }) => (
	<h3
		className="text-gray-200 font-normal uppercase tracking-wider"
		style={{
			fontFamily: "Genos, sans-serif",
			fontSize: "18px",
			letterSpacing: "0.0125em",
		}}
	>
		{children}
	</h3>
);

// Supported file types for integration
const supportedFileTypes = [
	{
		type: "presentation",
		extensions: [".pptx", ".ppt"],
		icon: Presentation,
		name: "PowerPoint Deck",
		color: "#D83B01",
	},
	{
		type: "spreadsheet",
		extensions: [".xlsx", ".xls", ".csv"],
		icon: FileSpreadsheet,
		name: "Excel/CSV",
		color: "#107C41",
	},
	{
		type: "document",
		extensions: [".docx", ".doc"],
		icon: FileText,
		name: "Word Document",
		color: "#2B579A",
	},
	{
		type: "pdf",
		extensions: [".pdf"],
		icon: FileText,
		name: "PDF Document",
		color: "#DC3545",
	},
];

// Available data integration options
const integrationOptions = [
	{
		id: "contractor-profiles",
		name: "Contractor Profiles",
		description: "Company overviews, performance metrics, contact information",
	},
	{
		id: "financial-data",
		name: "Financial Data",
		description: "Revenue history, award amounts, contract values",
	},
	{
		id: "performance-metrics",
		name: "Performance Metrics",
		description: "Composite scores, efficiency ratings, reliability metrics",
	},
	{
		id: "network-analysis",
		name: "Network Analysis",
		description: "Relationship maps, partnership data, subcontractor networks",
	},
	{
		id: "market-intelligence",
		name: "Market Intelligence",
		description: "Competitive positioning, market share, industry benchmarks",
	},
	{
		id: "compliance-data",
		name: "Compliance Data",
		description: "Certifications, regulatory status, audit results",
	},
];

interface UploadedFile {
	id: string;
	name: string;
	type: string;
	size: number;
	uploadedAt: Date;
	status: "uploaded" | "analyzing" | "ready" | "error";
	suggestions?: string[];
}

interface IntegrationRequest {
	id: string;
	fileId: string;
	dataTypes: string[];
	instructions: string;
	status: "pending" | "processing" | "completed" | "failed";
	result?: string;
}

export function PresentationTab() {
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
	const [integrationRequests, setIntegrationRequests] = useState<
		IntegrationRequest[]
	>([]);
	const [dragOver, setDragOver] = useState(false);
	const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
	const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
	const [integrationInstructions, setIntegrationInstructions] = useState("");

	const handleFileUpload = useCallback((files: FileList | null) => {
		if (!files) return;

		Array.from(files).forEach((file) => {
			const newFile: UploadedFile = {
				id: `file-${Date.now()}-${Math.random()}`,
				name: file.name,
				type: file.type,
				size: file.size,
				uploadedAt: new Date(),
				status: "analyzing",
				suggestions: [],
			};

			setUploadedFiles((prev) => [...prev, newFile]);

			// Simulate file analysis
			setTimeout(() => {
				setUploadedFiles((prev) =>
					prev.map((f) =>
						f.id === newFile.id
							? {
									...f,
									status: "ready",
									suggestions: [
										"Add contractor performance data",
										"Include market analysis",
										"Insert compliance metrics",
									],
								}
							: f,
					),
				);
			}, 2000);
		});
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(true);
	}, []);

	const handleDragLeave = useCallback(() => {
		setDragOver(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setDragOver(false);
			handleFileUpload(e.dataTransfer.files);
		},
		[handleFileUpload],
	);

	const handleDataTypeToggle = (dataTypeId: string) => {
		setSelectedDataTypes((prev) =>
			prev.includes(dataTypeId)
				? prev.filter((id) => id !== dataTypeId)
				: [...prev, dataTypeId],
		);
	};

	const handleStartIntegration = () => {
		if (!selectedFile || selectedDataTypes.length === 0) return;

		const newRequest: IntegrationRequest = {
			id: `request-${Date.now()}`,
			fileId: selectedFile.id,
			dataTypes: selectedDataTypes,
			instructions: integrationInstructions,
			status: "processing",
		};

		setIntegrationRequests((prev) => [...prev, newRequest]);

		// Simulate AI processing
		setTimeout(() => {
			setIntegrationRequests((prev) =>
				prev.map((r) =>
					r.id === newRequest.id
						? {
								...r,
								status: "completed",
								result:
									"Integration completed successfully! Your file has been enhanced with GoldenGate data.",
							}
						: r,
				),
			);
		}, 5000);
	};

	const removeFile = (fileId: string) => {
		setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
		if (selectedFile?.id === fileId) {
			setSelectedFile(null);
		}
	};

	return (
		<div className="min-h-[500px] flex justify-center">
			<div className="w-full max-w-4xl">
				<div className="grid grid-cols-2 gap-4">
					{/* Left Half: Chart Library */}
					<div className="border border-[#8B8EFF]/30 rounded-xl hover:border-[#8B8EFF]/50 transition-all duration-500">
						<InternalContentContainer>
							<div className="flex-1">
								<ChartStyleContainer>
									<div className="relative h-full">
										{/* Title */}
										<div className="absolute top-0 left-0 z-10">
											<h3 className="font-sans text-xs uppercase tracking-wider text-gray-500">
												Chart Library
											</h3>
										</div>

										{/* Live Indicator */}
										<div className="absolute top-0 right-0 z-10 flex items-center gap-2">
											<span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
											<span
												className="text-[10px] text-green-400 tracking-wider font-light"
												style={{ fontFamily: "Genos, sans-serif" }}
											>
												TRACKING
											</span>
										</div>

										{/* Content */}
										<div className="pt-8">
											<div className="space-y-4">
												{/* Category Groups */}
												{[
													"Financial",
													"Performance",
													"Market",
													"Relationships",
													"Portfolio",
													"Activity",
												].map((category) => {
													const categoryCharts = availableCharts.filter(
														(chart) => chart.category === category,
													);
													return (
														<div key={category}>
															<h5 className="text-xs uppercase tracking-wider text-gray-400 mb-3 font-medium">
																{category}
															</h5>
															<div className="grid grid-cols-1 gap-3">
																{categoryCharts.map((chart) => (
																	<div
																		key={chart.id}
																		className={`p-3 border rounded-lg cursor-pointer transition-all ${
																			selectedCharts.some(
																				(slide) => slide.chartType === chart.id,
																			)
																				? "border-[#8B8EFF]/50 bg-[#8B8EFF]/10"
																				: "border-gray-700/30 bg-black/20 hover:border-gray-600/50"
																		}`}
																		onClick={() => handleChartToggle(chart.id)}
																	>
																		<div className="flex items-start gap-3">
																			<div
																				className={`p-2 rounded ${selectedCharts.some((slide) => slide.chartType === chart.id) ? "bg-[#8B8EFF]/20" : "bg-gray-700/30"}`}
																			>
																				<chart.icon
																					className={`w-4 h-4 ${selectedCharts.some((slide) => slide.chartType === chart.id) ? "text-[#8B8EFF]" : "text-gray-400"}`}
																				/>
																			</div>
																			<div className="flex-1">
																				<h6 className="text-sm font-medium text-white mb-1">
																					{chart.name}
																				</h6>
																				<p className="text-xs text-gray-400">
																					{chart.description}
																				</p>
																			</div>
																		</div>
																	</div>
																))}
															</div>
														</div>
													);
												})}
											</div>
										</div>
									</div>
								</ChartStyleContainer>
							</div>
						</InternalContentContainer>
					</div>

					{/* Right Half: Selected Exports */}
					<div className="border border-[#8B8EFF]/30 rounded-xl hover:border-[#8B8EFF]/50 transition-all duration-500">
						<InternalContentContainer>
							<div className="flex-1">
								<ChartStyleContainer>
									<div className="relative h-full">
										{/* Title */}
										<div className="absolute top-0 left-0 z-10">
											<h3 className="font-sans text-xs uppercase tracking-wider text-gray-500">
												Selected Exports
											</h3>
										</div>

										{/* Live Indicator */}
										<div className="absolute top-0 right-0 z-10 flex items-center gap-2">
											<span className="text-xs text-gray-400">
												{selectedCharts.length} selected
											</span>
										</div>

										{/* Content */}
										<div className="pt-8">
											{selectedCharts.length === 0 ? (
												<div className="text-center py-12">
													<Presentation className="w-8 h-8 text-gray-600 mx-auto mb-3" />
													<p className="text-gray-400 text-sm">
														No charts selected
													</p>
													<p className="text-gray-500 text-xs mt-1">
														Select charts from the library to export
													</p>
												</div>
											) : (
												<div className="space-y-3">
													{selectedCharts.map((slide, index) => {
														const chart = availableCharts.find(
															(c) => c.id === slide.chartType,
														);
														if (!chart) return null;

														return (
															<div
																key={slide.id}
																className="p-3 bg-black/20 border border-gray-700/30 rounded-lg"
															>
																<div className="flex items-center justify-between">
																	<div className="flex items-center gap-3">
																		<div className="flex items-center gap-2">
																			<div className="p-1.5 rounded bg-[#8B8EFF]/20">
																				<chart.icon className="w-3 h-3 text-[#8B8EFF]" />
																			</div>
																			<div>
																				<h6 className="text-sm text-white font-medium">
																					{chart.name}
																				</h6>
																				<p className="text-xs text-gray-400">
																					<span className="font-bold">
																						{slide.assetName.toUpperCase()}
																					</span>{" "}
																					• {slide.assetUei.toUpperCase()}
																				</p>
																			</div>
																		</div>
																	</div>
																	<div className="flex items-center gap-1">
																		<button
																			onClick={() => handlePreviewSlide(slide)}
																			className="p-1 text-gray-400 hover:text-[#8B8EFF] transition-colors"
																			title="Preview chart"
																		>
																			<Eye className="w-3 h-3" />
																		</button>
																		<button
																			onClick={() =>
																				removeSelectedChart(slide.id)
																			}
																			className="p-1 text-gray-400 hover:text-red-400 transition-colors"
																		>
																			<Trash2 className="w-3 h-3" />
																		</button>
																	</div>
																</div>
															</div>
														);
													})}
												</div>
											)}

											{selectedCharts.length > 0 && (
												<div className="mt-6 space-y-2">
													<Button
														onClick={handleExportCharts}
														className="w-full bg-[#D2AC38] hover:bg-[#D2AC38]/80 text-black font-medium"
													>
														<Download className="w-4 h-4 mr-2" />
														Export Selected Charts
													</Button>
													<Button
														onClick={handlePreviewAll}
														variant="outline"
														className="w-full border-gray-600 text-gray-300 hover:text-white"
													>
														<ExternalLink className="w-4 h-4 mr-2" />
														View in Contractor Detail
													</Button>
												</div>
											)}
										</div>
									</div>
								</ChartStyleContainer>
							</div>
						</InternalContentContainer>
					</div>
				</div>
			</div>

			{/* Asset Selection Modal */}
			{showAssetModal && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="bg-gray-900 border border-[#8B8EFF]/30 rounded-xl p-6 w-full max-w-md mx-4">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-medium text-white">Select Asset</h3>
							<button
								onClick={() => setShowAssetModal(false)}
								className="p-1 text-gray-400 hover:text-white transition-colors"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
						<p className="text-sm text-gray-400 mb-4">
							Choose which asset to generate this chart for:
						</p>
						<div className="space-y-2">
							{availableAssets.map((asset) => (
								<button
									key={asset.uei}
									onClick={() => handleAssetSelect(asset)}
									className="w-full p-3 text-left bg-black/20 border border-gray-700/30 rounded-lg hover:border-[#8B8EFF]/50 hover:bg-[#8B8EFF]/10 transition-all"
								>
									<div className="text-sm font-medium text-white">
										{asset.name}
									</div>
									<div className="text-xs text-gray-400 uppercase">
										{asset.uei}
									</div>
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Preview Modal */}
			{showPreviewModal && previewSlide && (
				<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
					<div className="h-screen flex items-center justify-center p-4">
						<div className="bg-gray-900 border border-[#8B8EFF]/30 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col">
							<div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/30 flex-shrink-0">
								<div>
									<h3 className="text-base font-medium text-white">
										{previewSlide.title}
									</h3>
									<p className="text-xs text-gray-400">
										<span className="font-bold">
											{previewSlide.assetName.toUpperCase()}
										</span>{" "}
										• {previewSlide.assetUei.toUpperCase()}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<Button
										onClick={() =>
											window.open(
												`/platform/contractor-detail/${previewSlide.assetUei}`,
												"_blank",
											)
										}
										className="bg-[#8B8EFF]/20 hover:bg-[#8B8EFF]/30 text-[#8B8EFF] border border-[#8B8EFF]/40 text-xs px-2 py-1"
									>
										<ExternalLink className="w-3 h-3 mr-1" />
										View Full Detail
									</Button>
									<button
										onClick={() => setShowPreviewModal(false)}
										className="p-1 text-gray-400 hover:text-white transition-colors"
									>
										<X className="w-4 h-4" />
									</button>
								</div>
							</div>

							<div className="flex-1 p-2 overflow-auto">
								<div className="bg-black/20 border border-gray-700/30 rounded-lg h-full overflow-auto">
									<ChartPreviewComponent
										chartType={previewSlide.chartType}
										assetData={previewSlide}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
