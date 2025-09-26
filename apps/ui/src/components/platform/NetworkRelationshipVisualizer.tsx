import {
	Building,
	DollarSign,
	Filter,
	Info,
	Link,
	Maximize2,
	Network,
	Users,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import React, { useRef, useCallback, useMemo, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { formatCurrency } from "./services/contractor-profile-transform";

interface NetworkNode {
	id: string;
	name: string;
	type: "prime" | "sub" | "hybrid";
	revenue?: number;
	contracts?: number;
	group?: number;
	color?: string;
	size?: number;
}

interface NetworkLink {
	source: string;
	target: string;
	value: number;
	strength: number;
	revenue: number;
	frequency?: string;
	color?: string;
}

interface NetworkData {
	nodes: NetworkNode[];
	links: NetworkLink[];
}

interface NetworkRelationshipVisualizerProps {
	contractorId: string;
	contractorName: string;
	networkData: {
		asPrime: {
			partners: Array<{
				subUei: string;
				subName: string;
				strengthScore: number;
				sharedRevenue: number;
				frequency: string;
			}>;
		};
		asSubcontractor: {
			partners: Array<{
				primeUei: string;
				primeName: string;
				strengthScore: number;
				sharedRevenue: number;
				frequency: string;
			}>;
		};
	};
}

export function NetworkRelationshipVisualizer({
	contractorId,
	contractorName,
	networkData,
}: NetworkRelationshipVisualizerProps) {
	const fgRef = useRef<any>(null);
	const [highlightNodes, setHighlightNodes] = useState(new Set());
	const [highlightLinks, setHighlightLinks] = useState(new Set());
	const [hoverNode, setHoverNode] = useState<string | null>(null);
	const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
	const [filterThreshold, setFilterThreshold] = useState(0);

	// Prepare graph data
	const graphData = useMemo<NetworkData>(() => {
		const nodes: NetworkNode[] = [];
		const links: NetworkLink[] = [];
		const nodeMap = new Map<string, NetworkNode>();

		// Add central contractor node
		const centralNode: NetworkNode = {
			id: contractorId,
			name: contractorName,
			type: "hybrid",
			color: "#facc15", // yellow-400
			size: 20,
			group: 1,
		};
		nodes.push(centralNode);
		nodeMap.set(contractorId, centralNode);

		// Add prime partners (where this contractor is a sub)
		networkData.asSubcontractor.partners.forEach((partner) => {
			if (!nodeMap.has(partner.primeUei)) {
				const node: NetworkNode = {
					id: partner.primeUei,
					name: partner.primeName,
					type: "prime",
					revenue: partner.sharedRevenue,
					color: "#10b981", // green-500
					size: Math.max(8, Math.min(15, partner.strengthScore / 5)),
					group: 2,
				};
				nodes.push(node);
				nodeMap.set(partner.primeUei, node);
			}

			// Add link from prime to this contractor
			if (partner.strengthScore >= filterThreshold) {
				links.push({
					source: partner.primeUei,
					target: contractorId,
					value: partner.strengthScore / 10,
					strength: partner.strengthScore,
					revenue: partner.sharedRevenue,
					frequency: partner.frequency,
					color: "rgba(16, 185, 129, 0.5)", // green with transparency
				});
			}
		});

		// Add sub partners (where this contractor is prime)
		networkData.asPrime.partners.forEach((partner) => {
			if (!nodeMap.has(partner.subUei)) {
				const node: NetworkNode = {
					id: partner.subUei,
					name: partner.subName,
					type: "sub",
					revenue: partner.sharedRevenue,
					color: "#3b82f6", // blue-500
					size: Math.max(8, Math.min(15, partner.strengthScore / 5)),
					group: 3,
				};
				nodes.push(node);
				nodeMap.set(partner.subUei, node);
			}

			// Add link from this contractor to sub
			if (partner.strengthScore >= filterThreshold) {
				links.push({
					source: contractorId,
					target: partner.subUei,
					value: partner.strengthScore / 10,
					strength: partner.strengthScore,
					revenue: partner.sharedRevenue,
					frequency: partner.frequency,
					color: "rgba(59, 130, 246, 0.5)", // blue with transparency
				});
			}
		});

		return { nodes, links };
	}, [contractorId, contractorName, networkData, filterThreshold]);

	// Node hover handlers
	const handleNodeHover = useCallback(
		(node: NetworkNode | null) => {
			setHighlightNodes(new Set());
			setHighlightLinks(new Set());
			setHoverNode(null);

			if (node) {
				const neighbors = new Set<string>();
				const links = new Set<string>();

				graphData.links.forEach((link) => {
					if (link.source === node.id || (link.source as any).id === node.id) {
						neighbors.add(
							typeof link.target === "string"
								? link.target
								: (link.target as any).id,
						);
						links.add(`${link.source}-${link.target}`);
					}
					if (link.target === node.id || (link.target as any).id === node.id) {
						neighbors.add(
							typeof link.source === "string"
								? link.source
								: (link.source as any).id,
						);
						links.add(`${link.source}-${link.target}`);
					}
				});

				neighbors.add(node.id);
				setHighlightNodes(neighbors);
				setHighlightLinks(links);
				setHoverNode(node.id);
			}
		},
		[graphData],
	);

	// Node click handler
	const handleNodeClick = useCallback((node: NetworkNode) => {
		setSelectedNode(node);
	}, []);

	// Control functions
	const handleZoomIn = () => fgRef.current?.zoom(1.2, 400);
	const handleZoomOut = () => fgRef.current?.zoom(0.8, 400);
	const handleCenter = () => fgRef.current?.centerAt(0, 0, 400);
	const handleFit = () => fgRef.current?.zoomToFit(400);

	// Calculate network metrics
	const metrics = useMemo(() => {
		const totalPartners = graphData.nodes.length - 1;
		const primePartners = graphData.nodes.filter(
			(n) => n.type === "prime",
		).length;
		const subPartners = graphData.nodes.filter((n) => n.type === "sub").length;
		const totalRevenue = graphData.links.reduce(
			(sum, link) => sum + link.revenue,
			0,
		);
		const avgStrength =
			graphData.links.length > 0
				? graphData.links.reduce((sum, link) => sum + link.strength, 0) /
					graphData.links.length
				: 0;

		return {
			totalPartners,
			primePartners,
			subPartners,
			totalRevenue,
			avgStrength,
		};
	}, [graphData]);

	return (
		<Card className="bg-medium-gray border-yellow-500/20">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Network className="h-6 w-6 text-yellow-400" />
						<div>
							<CardTitle className="text-xl text-white">
								Network Relationships
							</CardTitle>
							<CardDescription className="text-gray-400">
								Prime-Sub contractor collaboration network
							</CardDescription>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							onClick={handleZoomIn}
							size="sm"
							variant="outline"
							className="border-gray-600"
						>
							<ZoomIn className="h-4 w-4" />
						</Button>
						<Button
							onClick={handleZoomOut}
							size="sm"
							variant="outline"
							className="border-gray-600"
						>
							<ZoomOut className="h-4 w-4" />
						</Button>
						<Button
							onClick={handleFit}
							size="sm"
							variant="outline"
							className="border-gray-600"
						>
							<Maximize2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent className="p-0">
				{/* Network Stats */}
				<div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-700">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<Users className="h-4 w-4 text-gray-400" />
							<span className="text-xs text-gray-400">Total Partners</span>
						</div>
						<p className="text-lg font-semibold text-white">
							{metrics.totalPartners}
						</p>
					</div>
					<div>
						<div className="flex items-center gap-2 mb-1">
							<Building className="h-4 w-4 text-green-400" />
							<span className="text-xs text-gray-400">As Subcontractor To</span>
						</div>
						<p className="text-lg font-semibold text-green-400">
							{metrics.primePartners}
						</p>
					</div>
					<div>
						<div className="flex items-center gap-2 mb-1">
							<Building className="h-4 w-4 text-blue-400" />
							<span className="text-xs text-gray-400">As Prime Over</span>
						</div>
						<p className="text-lg font-semibold text-blue-400">
							{metrics.subPartners}
						</p>
					</div>
					<div>
						<div className="flex items-center gap-2 mb-1">
							<DollarSign className="h-4 w-4 text-yellow-400" />
							<span className="text-xs text-gray-400">Network Value</span>
						</div>
						<p className="text-lg font-semibold text-yellow-400">
							{formatCurrency(metrics.totalRevenue)}
						</p>
					</div>
					<div>
						<div className="flex items-center gap-2 mb-1">
							<Link className="h-4 w-4 text-purple-400" />
							<span className="text-xs text-gray-400">Avg Strength</span>
						</div>
						<p className="text-lg font-semibold text-purple-400">
							{metrics.avgStrength.toFixed(0)}/100
						</p>
					</div>
				</div>

				{/* Filter Controls */}
				<div className="flex items-center gap-4 p-4 border-b border-gray-700">
					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 text-gray-400" />
						<span className="text-sm text-gray-400">Min Strength:</span>
						<input
							type="range"
							min="0"
							max="100"
							value={filterThreshold}
							onChange={(e) =>
								setFilterThreshold(Number.parseInt(e.target.value))
							}
							className="w-32"
						/>
						<span className="text-sm text-white font-sans">
							{filterThreshold}
						</span>
					</div>
					<div className="flex items-center gap-2 ml-auto">
						<Badge className="bg-green-500/20 text-green-400 border-green-500/50">
							Prime Partners
						</Badge>
						<Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
							Your Company
						</Badge>
						<Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
							Sub Partners
						</Badge>
					</div>
				</div>

				{/* Graph Visualization */}
				<div className="relative bg-black/50" style={{ height: "600px" }}>
					<ForceGraph2D
						ref={fgRef}
						graphData={graphData}
						nodeLabel="name"
						nodeColor={(node: any) =>
							highlightNodes.has(node.id)
								? node.color
								: hoverNode && !highlightNodes.has(node.id)
									? "rgba(75, 85, 99, 0.3)"
									: node.color
						}
						nodeRelSize={1}
						nodeVal={(node: any) => node.size || 10}
						linkColor={(link: any) =>
							highlightLinks.has(
								`${link.source.id || link.source}-${link.target.id || link.target}`,
							)
								? link.color
								: "rgba(75, 85, 99, 0.2)"
						}
						linkWidth={(link: any) =>
							highlightLinks.has(
								`${link.source.id || link.source}-${link.target.id || link.target}`,
							)
								? link.value
								: 1
						}
						linkDirectionalParticles={2}
						linkDirectionalParticleSpeed={0.005}
						onNodeHover={handleNodeHover}
						onNodeClick={handleNodeClick}
						cooldownTicks={100}
						onEngineStop={() => fgRef.current?.zoomToFit(400)}
						backgroundColor="transparent"
					/>

					{/* Selected Node Details */}
					{selectedNode && (
						<div className="absolute top-4 right-4 bg-dark-gray border border-yellow-500/20 rounded-lg p-4 max-w-xs">
							<div className="flex items-center justify-between mb-3">
								<h4 className="font-semibold text-white text-sm">
									{selectedNode.name}
								</h4>
								<button
									onClick={() => setSelectedNode(null)}
									className="text-gray-400 hover:text-white"
								>
									×
								</button>
							</div>
							<div className="space-y-2">
								<div className="flex items-center justify-between text-xs">
									<span className="text-gray-400">Type:</span>
									<Badge
										className={`text-xs ${
											selectedNode.type === "prime"
												? "bg-green-500/20 text-green-400"
												: selectedNode.type === "sub"
													? "bg-blue-500/20 text-blue-400"
													: "bg-yellow-500/20 text-yellow-400"
										}`}
									>
										{selectedNode.type === "prime"
											? "Prime Contractor"
											: selectedNode.type === "sub"
												? "Subcontractor"
												: "Hybrid"}
									</Badge>
								</div>
								{selectedNode.revenue && (
									<div className="flex items-center justify-between text-xs">
										<span className="text-gray-400">Shared Revenue:</span>
										<span className="text-yellow-400 font-sans">
											{formatCurrency(selectedNode.revenue)}
										</span>
									</div>
								)}
								<div className="flex items-center justify-between text-xs">
									<span className="text-gray-400">UEI:</span>
									<span className="text-gray-300 font-sans">
										{selectedNode.id}
									</span>
								</div>
							</div>
						</div>
					)}

					{/* Hover Tooltip */}
					{hoverNode && !selectedNode && (
						<div className="absolute top-4 left-4 bg-black/80 text-white text-xs p-2 rounded pointer-events-none">
							Click node for details
						</div>
					)}
				</div>

				{/* Legend */}
				<div className="p-4 bg-dark-gray/50 border-t border-gray-700">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4 text-xs">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full bg-green-500" />
								<span className="text-gray-400">Prime → You (as sub)</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full bg-blue-500" />
								<span className="text-gray-400">You → Sub (as prime)</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full bg-yellow-500" />
								<span className="text-gray-400">Your position</span>
							</div>
						</div>
						<div className="text-xs text-gray-500">
							<Info className="h-3 w-3 inline mr-1" />
							Line thickness = relationship strength
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
