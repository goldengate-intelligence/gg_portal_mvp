import {
	Archive,
	Calendar,
	Download,
	Eye,
	File,
	FileSpreadsheet,
	FileText,
	Folder,
	Image,
	Music,
	Search,
	Trash2,
	User,
	Video,
	X,
} from "lucide-react";
import React, { useState } from "react";
import { CONTRACTOR_DETAIL_COLORS } from "../../logic/utils";
import { Button } from "../ui/button";

interface KnowledgeBaseModalProps {
	isOpen: boolean;
	onClose: () => void;
	entityId: string;
	entityName: string;
	entityType: "contractor" | "opportunity" | "portfolio";
}

interface KnowledgeBaseFile {
	id: string;
	name: string;
	type: string;
	size: number;
	uploadedAt: Date;
	uploadedBy: string;
	tags?: string[];
	description?: string;
}

export function KnowledgeBaseModal({
	isOpen,
	onClose,
	entityId,
	entityName,
	entityType,
}: KnowledgeBaseModalProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFile, setSelectedFile] = useState<KnowledgeBaseFile | null>(
		null,
	);

	// Mock data - in real implementation, this would come from API
	const [files] = useState<KnowledgeBaseFile[]>([
		{
			id: "1",
			name: "Company Overview Presentation.pdf",
			type: "application/pdf",
			size: 2456789,
			uploadedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
			uploadedBy: "John Smith",
			tags: ["presentation", "overview"],
			description: "Executive overview presentation for potential partnerships",
		},
		{
			id: "2",
			name: "Financial Statements Q3.xlsx",
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			size: 1234567,
			uploadedAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
			uploadedBy: "Sarah Johnson",
			tags: ["financial", "q3", "reports"],
			description: "Q3 financial performance and projections",
		},
		{
			id: "3",
			name: "Meeting Notes - Partnership Discussion.md",
			type: "text/markdown",
			size: 45678,
			uploadedAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
			uploadedBy: "You",
			tags: ["notes", "partnership", "meeting"],
			description: "Notes from initial partnership discussion meeting",
		},
		{
			id: "4",
			name: "Company Logo and Assets.zip",
			type: "application/zip",
			size: 8901234,
			uploadedAt: new Date(Date.now() - 86400000 * 7), // 1 week ago
			uploadedBy: "Design Team",
			tags: ["branding", "assets"],
			description: "Brand assets and logo variations",
		},
		{
			id: "5",
			name: "Capability Statement.pdf",
			type: "application/pdf",
			size: 987654,
			uploadedAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
			uploadedBy: "Lisa Chen",
			tags: ["capabilities", "statement"],
			description: "Official capability statement document",
		},
	]);

	const getFileIcon = (type: string, name: string) => {
		const lowerType = type.toLowerCase();
		const extension = name.split(".").pop()?.toLowerCase();

		if (lowerType.startsWith("image/"))
			return <Image className="w-4 h-4 text-green-400" />;
		if (lowerType.startsWith("video/"))
			return <Video className="w-4 h-4 text-purple-400" />;
		if (lowerType.startsWith("audio/"))
			return <Music className="w-4 h-4 text-pink-400" />;
		if (
			lowerType.includes("pdf") ||
			lowerType.includes("document") ||
			lowerType.includes("text") ||
			extension === "md"
		)
			return <FileText className="w-4 h-4 text-red-400" />;
		if (
			lowerType.includes("spreadsheet") ||
			extension === "xlsx" ||
			extension === "csv"
		)
			return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
		if (
			lowerType.includes("zip") ||
			lowerType.includes("rar") ||
			extension === "7z"
		)
			return <Archive className="w-4 h-4 text-orange-400" />;

		return <File className="w-4 h-4 text-gray-400" />;
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	};

	const formatDate = (date: Date) => {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days === 0) return "Today";
		if (days === 1) return "Yesterday";
		if (days < 7) return `${days} days ago`;
		return date.toLocaleDateString();
	};

	const filteredFiles = files.filter(
		(file) =>
			file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			file.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			file.tags?.some((tag) =>
				tag.toLowerCase().includes(searchQuery.toLowerCase()),
			),
	);

	const handleFileAction = (action: string, file: KnowledgeBaseFile) => {
		switch (action) {
			case "view":
				console.log("View file:", file.name);
				// TODO: Implement file viewer
				break;
			case "download":
				console.log("Download file:", file.name);
				// TODO: Implement download
				break;
			case "delete":
				console.log("Delete file:", file.name);
				// TODO: Implement delete with confirmation
				break;
		}
	};

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					e.stopPropagation();
					onClose();
				}
			}}
		>
			<div
				className="w-full max-w-3xl max-h-[75vh] shadow-2xl overflow-hidden flex flex-col rounded-xl border border-gray-700"
				style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div
					className="border-b border-gray-700/30 px-6 py-4 flex items-center justify-between flex-shrink-0"
					style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}
				>
					<div className="flex items-center space-x-3">
						<div className="h-8 w-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
							<Folder className="h-4 w-4 text-teal-400" />
						</div>
						<div>
							<h3
								className="text-gray-200 font-normal tracking-wider uppercase"
								style={{
									fontFamily: "system-ui, -apple-system, sans-serif",
									fontSize: "16px",
								}}
							>
								KNOWLEDGE BASE
							</h3>
							<p className="text-xs text-gray-400 mt-1">
								{entityName} ({entityId})
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<span className="text-xs text-gray-500">
							{filteredFiles.length}{" "}
							{filteredFiles.length === 1 ? "file" : "files"}
						</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								e.preventDefault();
								onClose();
							}}
							className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-800/50"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Search Bar */}
				<div
					className="border-b border-gray-700/30 px-6 py-3"
					style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}
				>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search files, descriptions, or tags..."
							className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50"
						/>
					</div>
				</div>

				{/* Content */}
				<div
					className="flex-1 overflow-y-auto"
					style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}
				>
					{filteredFiles.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-64 text-center p-6">
							<Folder className="w-16 h-16 text-gray-500 mb-4" />
							{searchQuery ? (
								<>
									<h3 className="text-lg font-medium text-gray-300 mb-2">
										No files found
									</h3>
									<p className="text-sm text-gray-500">
										Try adjusting your search terms
									</p>
								</>
							) : (
								<>
									<h3 className="text-lg font-medium text-gray-300 mb-2">
										Knowledge base is empty
									</h3>
									<p className="text-sm text-gray-500">
										Upload files using the attachment icon to build your
										knowledge base
									</p>
								</>
							)}
						</div>
					) : (
						<div className="p-6">
							<div className="grid gap-3">
								{filteredFiles.map((file) => (
									<div
										key={file.id}
										className="flex items-center gap-4 p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-800/70 transition-colors group"
									>
										{/* File Icon */}
										<div className="flex-shrink-0">
											{getFileIcon(file.type, file.name)}
										</div>

										{/* File Info */}
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between">
												<div className="min-w-0 flex-1">
													<h4 className="text-sm font-medium text-gray-200 truncate">
														{file.name}
													</h4>
													{file.description && (
														<p className="text-xs text-gray-400 mt-1 line-clamp-2">
															{file.description}
														</p>
													)}
													<div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
														<span>{formatFileSize(file.size)}</span>
														<div className="flex items-center gap-1">
															<Calendar className="w-3 h-3" />
															<span>{formatDate(file.uploadedAt)}</span>
														</div>
														<div className="flex items-center gap-1">
															<User className="w-3 h-3" />
															<span>{file.uploadedBy}</span>
														</div>
													</div>
													{file.tags && file.tags.length > 0 && (
														<div className="flex flex-wrap gap-1 mt-2">
															{file.tags.map((tag, index) => (
																<span
																	key={index}
																	className="px-2 py-1 text-xs bg-teal-500/20 text-teal-400 border border-teal-500/40 rounded"
																>
																	{tag}
																</span>
															))}
														</div>
													)}
												</div>
											</div>
										</div>

										{/* Action Buttons */}
										<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
											<button
												onClick={() => handleFileAction("view", file)}
												className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700/50 rounded transition-colors"
												title="View file"
											>
												<Eye className="w-4 h-4" />
											</button>
											<button
												onClick={() => handleFileAction("download", file)}
												className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700/50 rounded transition-colors"
												title="Download file"
											>
												<Download className="w-4 h-4" />
											</button>
											<button
												onClick={() => handleFileAction("delete", file)}
												className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded transition-colors"
												title="Delete file"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div
					className="border-t border-gray-700/30 px-6 py-4 flex justify-between items-center"
					style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}
				>
					<p className="text-xs text-gray-500">
						Documents and files for {entityName}
					</p>
					<div className="flex gap-3">
						<Button
							variant="outline"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								e.preventDefault();
								onClose();
							}}
							className="border-gray-600 text-gray-300 hover:bg-gray-800"
						>
							Close
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
