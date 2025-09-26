import { Bot, ChevronRight, Pin, Send, Trash2, X } from "lucide-react";
import React from "react";
import type { AIConversationItem } from "./types/discovery";

interface AIAssistantProps {
	isOpen: boolean;
	onClose: () => void;
	conversation: AIConversationItem[];
	input: string;
	onInputChange: (value: string) => void;
	onSendMessage: () => void;
	onSuggestedPrompt: (prompt: string) => void;
}

export function AIAssistant({
	isOpen,
	onClose,
	conversation,
	input,
	onInputChange,
	onSendMessage,
	onSuggestedPrompt,
}: AIAssistantProps) {
	const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null);
	const suggestedPrompts = [
		"Show me aerospace contractors with over $100M in contracts",
		"Which agencies have the highest contract spending?",
		"Find contractors with 8(a) certification in Virginia",
		"Show me recent awards for cybersecurity services",
	];

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (input.trim()) {
				onSendMessage();
			}
		}
	};

	const handleMouseEnter = (e: React.MouseEvent) => {
		// Focus the conversation area when mouse enters so scroll works
		const target = e.currentTarget as HTMLElement;
		target.focus();
	};

	// Function to render formatted AI messages
	const renderFormattedMessage = (content: string) => {
		// Split content by lines and process each line
		const lines = content.split("\n");
		const elements: JSX.Element[] = [];

		lines.forEach((line, index) => {
			const trimmedLine = line.trim();

			if (!trimmedLine) {
				// Empty line - add spacing
				elements.push(<div key={index} className="h-3" />);
			} else if (trimmedLine.startsWith("**") && trimmedLine.endsWith("**")) {
				// Bold headers
				const text = trimmedLine.slice(2, -2);
				elements.push(
					<div
						key={index}
						className="font-semibold text-[#D2AC38] text-base mb-2 mt-3"
					>
						{text}
					</div>,
				);
			} else if (trimmedLine.startsWith("•")) {
				// Bullet points
				const text = trimmedLine.slice(1).trim();
				elements.push(
					<div key={index} className="flex items-start gap-2 mb-1 ml-2">
						<span className="text-[#D2AC38] text-xs mt-1">•</span>
						<span className="text-gray-300 text-sm leading-relaxed">
							{text}
						</span>
					</div>,
				);
			} else {
				// Regular text
				elements.push(
					<div
						key={index}
						className="text-gray-300 text-sm leading-relaxed mb-2"
					>
						{trimmedLine}
					</div>,
				);
			}
		});

		return elements;
	};

	return (
		<>
			{isOpen && (
				<div className="fixed top-0 right-0 h-full w-80 bg-gray-900/95 border-l border-gray-700 backdrop-blur-sm z-50">
					{/* AI button inside panel - positioned to match external position */}
					<div className="fixed z-50" style={{ bottom: "24px", right: "24px" }}>
						<button
							onClick={onClose}
							className="p-3 rounded-full shadow-lg transition-all duration-300 bg-[#D2AC38] text-[#223040] hover:bg-[#D2AC38]/80"
							title="Close AI Assistant"
						>
							<Bot className="w-5 h-5" />
						</button>
					</div>
					<div className="px-4 pt-8 pb-4 h-full flex flex-col">
						{/* AI Panel Header */}
						<div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
							<div className="flex items-center gap-2">
								<h3 className="text-white text-xl" style={{ fontFamily: 'Michroma, sans-serif', fontWeight: 250 }}>AI Chat</h3>
							</div>
							<div className="flex items-center gap-2">
								<button
									onClick={onClose}
									className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors"
									title="Close AI Assistant"
								>
									<X className="w-4 h-4" />
								</button>
							</div>
						</div>

						{/* AI Conversation */}
						<div
							className="flex-1 overflow-y-auto mb-4 scroll-smooth focus:outline-none"
							onMouseEnter={handleMouseEnter}
							style={{
								scrollbarWidth: "thin",
								scrollbarColor: "#4B5563 #1F2937",
								scrollbarGutter: "stable",
								paddingRight: "4px",
							}}
						>
							<div className="space-y-3 px-1">
								{/* Welcome Message - Always Visible */}
								<div className="text-center py-8">
									<Bot className="w-8 h-8 text-[#D2AC38] mx-auto mb-3" />
									<p className="text-gray-400 text-sm">
										I'm here to help with all your research and platform needs.
										Ask me anything!
									</p>
									{conversation.length === 0 && (
										<div className="mt-4 space-y-2">
											{suggestedPrompts.slice(0, 2).map((prompt, index) => (
												<button
													key={index}
													onClick={() => onSuggestedPrompt(prompt)}
													className="block w-full text-left px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded text-sm text-gray-300 transition-colors"
												>
													"{prompt}"
												</button>
											))}
										</div>
									)}
								</div>

								{conversation.map((message, index) => (
									<div
										key={index}
										className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
									>
										<div
											className={`max-w-[80%] p-4 rounded-lg ${
												message.type === "user"
													? "bg-gray-800 text-white text-sm"
													: "bg-gray-950 text-white"
											}`}
										>
											{message.type === "user" ? (
												<div className="text-sm">{message.content}</div>
											) : (
												<div className="space-y-1">
													{renderFormattedMessage(message.content)}
												</div>
											)}
											<div className="text-xs opacity-60 mt-3 pt-2 border-t border-gray-700/50">
												{message.timestamp.toLocaleTimeString()}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* AI Input */}
						<div
							className="border-t border-gray-700 pt-3"
							style={{ marginBottom: "64px" }}
						>
							<div className="flex gap-2 items-stretch">
								<textarea
									value={input}
									onChange={(e) => onInputChange(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder="Ask me about contractors, agencies, or search for specific data..."
									className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 resize-none focus:outline-none focus:border-white"
									rows={2}
									style={{ minHeight: "60px" }}
								/>
							</div>
							<div className="text-[10px] text-gray-500 mt-1 px-3">
								Press Enter to send • Shift+Enter for new line • Esc to close
							</div>
						</div>

						{/* Action Icons - Separate container */}
						<div
							className="absolute flex items-center gap-8"
							style={{ left: "24px", bottom: "32px" }}
						>
							{/* Smart Research/Lightbulb Icon */}
							<button
								className="p-0.5 hover:bg-purple-500/30 rounded transition-all relative"
								onMouseEnter={() => setActiveTooltip("smart-research")}
								onMouseLeave={() => setActiveTooltip(null)}
							>
								<svg
									className="w-5 h-5 text-purple-400 hover:text-purple-300"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<circle cx="11" cy="11" r="8" strokeWidth={2} />
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="m21 21-4.35-4.35M8 11h6m-3-3v6"
									/>
								</svg>
								{activeTooltip === "smart-research" && (
									<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black rounded pointer-events-none whitespace-nowrap z-[100]">
										AI pursues context-driven research
									</div>
								)}
							</button>

							{/* Paperclip/Attachment Icon */}
							<button
								className="p-0.5 hover:bg-cyan-500/30 rounded transition-all relative"
								onMouseEnter={() => setActiveTooltip("attach")}
								onMouseLeave={() => setActiveTooltip(null)}
								onClick={() => {
									const fileInput = document.createElement('input');
									fileInput.type = 'file';
									fileInput.multiple = true;
									fileInput.accept = '.pdf,.doc,.docx,.txt,.md';
									fileInput.onchange = (e) => {
										const files = (e.target as HTMLInputElement).files;
										if (files) {
											console.log('Files selected:', Array.from(files).map(f => f.name));
											// TODO: Implement file upload handling
										}
									};
									fileInput.click();
								}}
							>
								<svg
									className="w-5 h-5 text-cyan-400 hover:text-cyan-300"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
									/>
								</svg>
								{activeTooltip === "attach" && (
									<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black rounded pointer-events-none whitespace-nowrap z-[100]">
										Attach documents for context
									</div>
								)}
							</button>

							{/* Knowledge Base/Folder Icon */}
							<button
								className="p-0.5 hover:bg-teal-500/30 rounded transition-all relative"
								onMouseEnter={() => setActiveTooltip("folder")}
								onMouseLeave={() => setActiveTooltip(null)}
								onClick={() => {
									const currentChat = {
										messages: conversation,
										timestamp: new Date(),
										title: conversation.length > 0 ? conversation[0].content.slice(0, 50) + '...' : 'New Chat'
									};
									console.log('Saving to knowledge base:', currentChat);
									// TODO: Implement knowledge base save functionality
									alert('Chat saved to knowledge base!');
								}}
							>
								<svg
									className="w-5 h-5 text-teal-400 hover:text-teal-300"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
									/>
								</svg>
								{activeTooltip === "folder" && (
									<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black rounded pointer-events-none whitespace-nowrap z-[100]">
										Save chat to your knowledge base
									</div>
								)}
							</button>

							{/* Pin Icon */}
							<button
								className="p-0.5 hover:bg-orange-500/30 rounded transition-all relative"
								onMouseEnter={() => setActiveTooltip("pin")}
								onMouseLeave={() => setActiveTooltip(null)}
							>
								<Pin className="w-5 h-5 text-orange-400 hover:text-orange-300" />
								{activeTooltip === "pin" && (
									<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black rounded pointer-events-none whitespace-nowrap z-[100]">
										Pin this chat
									</div>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
