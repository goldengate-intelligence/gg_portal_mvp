import React, { useState } from 'react';
import type { GeographicCluster, NetworkData, NetworkFilters } from '../types';

interface MapVisualizationProps {
  clusters: GeographicCluster[];
  networkData: NetworkData;
  filters: NetworkFilters;
  onClusterClick: (cluster: GeographicCluster) => void;
  onFilterChange: (filters: NetworkFilters) => void;
}

export default function MapVisualization({
  clusters,
  networkData,
  filters,
  onClusterClick,
  onFilterChange
}: MapVisualizationProps) {
  const [selectedCluster, setSelectedCluster] = useState<GeographicCluster | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<GeographicCluster | null>(null);

  const formatCurrency = (amount: number): string => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const getClusterSize = (cluster: GeographicCluster): number => {
    const minSize = 20;
    const maxSize = 60;
    const maxValue = Math.max(...clusters.map(c => c.totalValue));

    if (maxValue === 0) return minSize;

    const normalizedValue = cluster.totalValue / maxValue;
    return minSize + (maxSize - minSize) * Math.sqrt(normalizedValue);
  };

  const getClusterColor = (cluster: GeographicCluster): string => {
    // Color intensity based on relationship count
    const maxRelationships = Math.max(...clusters.map(c => c.relationships.length));
    const intensity = cluster.relationships.length / maxRelationships;

    if (intensity > 0.7) return '#dc2626'; // red-600
    if (intensity > 0.4) return '#ea580c'; // orange-600
    if (intensity > 0.2) return '#d97706'; // amber-600
    return '#059669'; // emerald-600
  };

  const handleClusterClick = (cluster: GeographicCluster) => {
    setSelectedCluster(cluster === selectedCluster ? null : cluster);
    onClusterClick(cluster);
  };

  // Group clusters by state for better organization
  const clustersByState = React.useMemo(() => {
    const grouped = new Map<string, GeographicCluster[]>();

    clusters.forEach(cluster => {
      if (!grouped.has(cluster.state)) {
        grouped.set(cluster.state, []);
      }
      grouped.get(cluster.state)!.push(cluster);
    });

    // Sort by total value within each state
    grouped.forEach(stateClusters => {
      stateClusters.sort((a, b) => b.totalValue - a.totalValue);
    });

    return Array.from(grouped.entries())
      .sort((a, b) => {
        const aTotal = a[1].reduce((sum, c) => sum + c.totalValue, 0);
        const bTotal = b[1].reduce((sum, c) => sum + c.totalValue, 0);
        return bTotal - aTotal;
      });
  }, [clusters]);

  if (clusters.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        No geographic data to display
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Map Placeholder */}
      <div className="lg:col-span-2">
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 border border-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
          {/* Simulated US Map Background */}
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 800 400" className="w-full h-full">
              {/* Simplified US outline - in production would use actual map data */}
              <path
                d="M 100 200 Q 150 150 300 160 Q 450 170 600 180 Q 700 190 750 220 L 750 350 Q 600 340 400 330 Q 200 320 100 300 Z"
                fill="#1f2937"
              />
            </svg>
          </div>

          {/* Geographic Clusters Visualization */}
          <div className="relative z-10 w-full h-full">
            <svg viewBox="0 0 800 400" className="w-full h-full">
              {clusters.map((cluster, index) => {
                // Simple positioning based on state (in production would use actual coordinates)
                const x = 100 + (index % 8) * 90;
                const y = 100 + Math.floor(index / 8) * 80;
                const size = getClusterSize(cluster);
                const color = getClusterColor(cluster);

                const isHovered = hoveredCluster === cluster;
                const isSelected = selectedCluster === cluster;

                return (
                  <g key={`${cluster.state}-${cluster.city}`}>
                    {/* Cluster circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={size / 2}
                      fill={color}
                      opacity={isSelected ? 0.9 : isHovered ? 0.7 : 0.6}
                      stroke={isSelected ? '#1d4ed8' : 'white'}
                      strokeWidth={isSelected ? 3 : 2}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredCluster(cluster)}
                      onMouseLeave={() => setHoveredCluster(null)}
                      onClick={() => handleClusterClick(cluster)}
                    />

                    {/* Cluster label */}
                    <text
                      x={x}
                      y={y + size / 2 + 15}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="medium"
                      fill="#374151"
                      pointerEvents="none"
                    >
                      {cluster.state}
                    </text>

                    {/* Relationship count */}
                    <text
                      x={x}
                      y={y + 3}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="white"
                      pointerEvents="none"
                    >
                      {cluster.relationships.length}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Legend */}
          <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">Geographic Activity</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span className="text-xs text-gray-600">High activity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                <span className="text-xs text-gray-600">Medium activity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                <span className="text-xs text-gray-600">Low activity</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Circle size = Total value<br/>
              Number = Relationships
            </div>
          </div>

          {/* Hover Tooltip */}
          {hoveredCluster && (
            <div className="absolute bottom-4 left-4 bg-black text-white text-xs rounded px-3 py-2 pointer-events-none">
              <div className="font-medium">{hoveredCluster.city}, {hoveredCluster.state}</div>
              <div>{formatCurrency(hoveredCluster.totalValue)}</div>
              <div>{hoveredCluster.relationships.length} relationships</div>
            </div>
          )}
        </div>
      </div>

      {/* Geographic Details Panel */}
      <div className="space-y-4 overflow-y-auto">
        <div className="bg-white">
          <h3 className="font-semibold text-gray-900 mb-4">Geographic Distribution</h3>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-gray-900">{clustersByState.length}</div>
              <div className="text-sm text-gray-600">States</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-gray-900">{clusters.length}</div>
              <div className="text-sm text-gray-600">Cities</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(clusters.reduce((sum, c) => sum + c.totalValue, 0))}
              </div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
          </div>

          {/* State-by-State Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">By State</h4>
            {clustersByState.slice(0, 10).map(([state, stateClusters]) => {
              const stateTotal = stateClusters.reduce((sum, c) => sum + c.totalValue, 0);
              const stateRelationships = stateClusters.reduce((sum, c) => sum + c.relationships.length, 0);

              return (
                <div key={state} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{state}</span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(stateTotal)}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    {stateRelationships} relationships in {stateClusters.length} cities
                  </div>

                  {/* Top cities in state */}
                  <div className="space-y-1">
                    {stateClusters.slice(0, 3).map((cluster) => (
                      <button
                        key={`${cluster.state}-${cluster.city}`}
                        onClick={() => handleClusterClick(cluster)}
                        className={`w-full text-left p-2 text-xs rounded transition-colors ${
                          selectedCluster === cluster
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">{cluster.city || 'Statewide'}</span>
                          <div className="text-right">
                            <div className="text-gray-900 font-medium">
                              {formatCurrency(cluster.totalValue)}
                            </div>
                            <div className="text-gray-500">
                              {cluster.relationships.length} relationships
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                    {stateClusters.length > 3 && (
                      <div className="text-xs text-gray-500 px-2">
                        +{stateClusters.length - 3} more cities
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}