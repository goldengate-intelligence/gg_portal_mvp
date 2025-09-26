import React, { useRef, useEffect, useState } from 'react';
import type { NetworkData, NetworkFilters, NetworkNode, NetworkEdge } from '../types';

interface NetworkVisualizationProps {
  networkData: NetworkData;
  filters: NetworkFilters;
  selectedNodeUEI: string | null;
  onNodeClick: (nodeUEI: string) => void;
  onEdgeClick: (edgeId: string) => void;
  onFilterChange: (filters: NetworkFilters) => void;
}

export default function NetworkVisualization({
  networkData,
  filters,
  selectedNodeUEI,
  onNodeClick,
  onEdgeClick,
  onFilterChange
}: NetworkVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        const parent = svgRef.current.parentElement;
        setDimensions({
          width: parent.clientWidth,
          height: Math.max(600, parent.clientHeight)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Simple force-directed layout calculations
  const layoutNodes = React.useMemo(() => {
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;

    // Position main contractor at center
    const mainNode = networkData.nodes.find(n => n.isMainContractor);
    if (!mainNode) return [];

    const positionedNodes = networkData.nodes.map((node, index) => {
      if (node.isMainContractor) {
        return { ...node, x: centerX, y: centerY };
      }

      // Position other nodes in a circle around the main contractor
      const angle = (index / networkData.nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.3;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      return { ...node, x, y };
    });

    return positionedNodes;
  }, [networkData.nodes, dimensions]);

  const getNodeSize = (node: NetworkNode): number => {
    if (node.isMainContractor) return 20;

    // Scale node size based on total value (logarithmic scale)
    const minSize = 8;
    const maxSize = 16;
    const maxValue = Math.max(...networkData.nodes.map(n => n.metrics.totalActiveValue));

    if (maxValue === 0) return minSize;

    const normalizedValue = node.metrics.totalActiveValue / maxValue;
    return minSize + (maxSize - minSize) * Math.sqrt(normalizedValue);
  };

  const getNodeColor = (node: NetworkNode): string => {
    if (node.isMainContractor) return '#2563eb'; // blue-600

    switch (node.type) {
      case 'agency': return '#10b981'; // emerald-500
      case 'prime': return '#8b5cf6'; // violet-500
      case 'sub': return '#f59e0b'; // amber-500
      default: return '#6b7280'; // gray-500
    }
  };

  const getEdgeColor = (edge: NetworkEdge): string => {
    switch (edge.direction) {
      case 'inflow': return '#10b981'; // green for money coming in
      case 'outflow': return '#f59e0b'; // orange for money going out
      default: return '#6b7280';
    }
  };

  const getEdgeWidth = (edge: NetworkEdge): number => {
    const minWidth = 1;
    const maxWidth = 6;
    const maxValue = Math.max(...networkData.edges.map(e => e.metrics.totalValue));

    if (maxValue === 0) return minWidth;

    const normalizedValue = edge.metrics.totalValue / maxValue;
    return minWidth + (maxWidth - minWidth) * Math.sqrt(normalizedValue);
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  if (networkData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        No network relationships to display
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px]">
      {/* SVG Network Visualization */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="border border-gray-100 rounded-lg"
      >
        {/* Background */}
        <rect width={dimensions.width} height={dimensions.height} fill="#fafafa" />

        {/* Edges */}
        <g>
          {networkData.edges.map((edge) => {
            const sourceNode = layoutNodes.find(n => n.uei === edge.source);
            const targetNode = layoutNodes.find(n => n.uei === edge.target);

            if (!sourceNode || !targetNode) return null;

            const isHovered = hoveredEdge === edge.id;
            const isConnectedToSelected = selectedNodeUEI &&
              (edge.source === selectedNodeUEI || edge.target === selectedNodeUEI);

            return (
              <line
                key={edge.id}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={getEdgeColor(edge)}
                strokeWidth={getEdgeWidth(edge) * (isHovered ? 1.5 : 1)}
                opacity={isConnectedToSelected || !selectedNodeUEI ? (isHovered ? 0.9 : 0.6) : 0.2}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredEdge(edge.id)}
                onMouseLeave={() => setHoveredEdge(null)}
                onClick={() => onEdgeClick(edge.id)}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {layoutNodes.map((node) => {
            const isSelected = selectedNodeUEI === node.uei;
            const isHovered = hoveredNode === node.uei;
            const isHighlighted = isSelected || isHovered;
            const isConnectedToSelected = selectedNodeUEI &&
              networkData.edges.some(e =>
                (e.source === selectedNodeUEI && e.target === node.uei) ||
                (e.target === selectedNodeUEI && e.source === node.uei)
              );

            return (
              <g key={node.uei}>
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={getNodeSize(node) * (isHighlighted ? 1.2 : 1)}
                  fill={getNodeColor(node)}
                  stroke={isSelected ? '#1d4ed8' : isHovered ? '#374151' : 'white'}
                  strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                  opacity={isConnectedToSelected || !selectedNodeUEI ? 1 : 0.4}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredNode(node.uei)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => onNodeClick(node.uei)}
                />

                {/* Node label */}
                {(isHighlighted || node.isMainContractor) && (
                  <text
                    x={node.x}
                    y={node.y + getNodeSize(node) + 15}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight={node.isMainContractor ? 'bold' : 'normal'}
                    fill="#374151"
                    pointerEvents="none"
                  >
                    {node.name.length > 20 ? `${node.name.substring(0, 20)}...` : node.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h4 className="font-medium text-gray-900 mb-3">Legend</h4>

        {/* Node Types */}
        <div className="space-y-2 mb-4">
          <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">Node Types</div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-xs text-gray-600">Main Contractor</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-gray-600">Agency</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-violet-500"></div>
            <span className="text-xs text-gray-600">Prime</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-xs text-gray-600">Subcontractor</span>
          </div>
        </div>

        {/* Edge Types */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">Relationships</div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-emerald-500"></div>
            <span className="text-xs text-gray-600">Inflow (to contractor)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-amber-500"></div>
            <span className="text-xs text-gray-600">Outflow (from contractor)</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 bg-black text-white text-xs rounded px-2 py-1 pointer-events-none">
          {(() => {
            const node = networkData.nodes.find(n => n.uei === hoveredNode);
            return node ? (
              <div>
                <div className="font-medium">{node.name}</div>
                <div>{formatCurrency(node.metrics.totalActiveValue)} • {node.metrics.activeAwardsCount} awards</div>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {hoveredEdge && !hoveredNode && (
        <div className="absolute bottom-4 left-4 bg-black text-white text-xs rounded px-2 py-1 pointer-events-none">
          {(() => {
            const edge = networkData.edges.find(e => e.id === hoveredEdge);
            return edge ? (
              <div>
                <div className="font-medium">{edge.relationshipType}</div>
                <div>{formatCurrency(edge.metrics.totalValue)} • {edge.metrics.activeAwards} awards</div>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}