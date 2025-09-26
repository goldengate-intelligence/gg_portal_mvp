import React, { useState, useMemo, useEffect } from 'react';
import type { ActivityEvent, NetworkData, NetworkFilters, GeographicCluster } from './types';
import {
  buildNetworkData,
  buildGeographicClusters,
  applyNetworkFilters,
  defaultNetworkFilters
} from './utils';
import NetworkVisualization from './components/NetworkVisualization';
import MapVisualization from './components/MapVisualization';
import NetworkSummary from './components/NetworkSummary';
import NetworkFiltersComponent from './components/NetworkFilters';

interface NetworkTabProps {
  contractorUEI: string;
  activityEvents: ActivityEvent[];
  isLoading?: boolean;
}

export default function NetworkTab({
  contractorUEI,
  activityEvents,
  isLoading = false
}: NetworkTabProps) {
  const [filters, setFilters] = useState<NetworkFilters>(defaultNetworkFilters);
  const [activeView, setActiveView] = useState<'network' | 'map'>('network');
  const [selectedNodeUEI, setSelectedNodeUEI] = useState<string | null>(null);

  // Build network data from activity events (memoized for performance)
  const networkData: NetworkData = useMemo(() => {
    if (!activityEvents || activityEvents.length === 0) {
      return {
        nodes: [],
        edges: [],
        mainContractor: {
          uei: contractorUEI,
          name: '',
          type: 'contractor',
          location: {},
          metrics: { totalActiveValue: 0, activeAwardsCount: 0, relationshipCount: 0 },
          isMainContractor: true
        },
        summary: {
          totalActiveValue: 0,
          totalRelationships: 0,
          inflowRelationships: 0,
          outflowRelationships: 0,
          geographicReach: { states: 0, cities: 0, primaryState: '' },
          relationshipTypes: { agencies: 0, primes: 0, subs: 0, subsidiaries: 0 }
        }
      };
    }

    return buildNetworkData(activityEvents, contractorUEI);
  }, [activityEvents, contractorUEI]);

  // Build geographic clusters for map view
  const geographicClusters: GeographicCluster[] = useMemo(() => {
    return buildGeographicClusters(networkData, filters);
  }, [networkData, filters]);

  // Apply filters to network data
  const filteredEdges = useMemo(() => {
    return applyNetworkFilters(networkData.edges, filters);
  }, [networkData.edges, filters]);

  const filteredNetworkData: NetworkData = useMemo(() => {
    return {
      ...networkData,
      edges: filteredEdges
    };
  }, [networkData, filteredEdges]);

  // Handle node selection
  const handleNodeClick = (nodeUEI: string) => {
    setSelectedNodeUEI(nodeUEI === selectedNodeUEI ? null : nodeUEI);
  };

  // Handle edge selection
  const handleEdgeClick = (edgeId: string) => {
    // Could expand to show edge details
    console.log('Edge clicked:', edgeId);
  };

  // Handle cluster selection
  const handleClusterClick = (cluster: GeographicCluster) => {
    // Focus on relationships in this geographic area
    setFilters(prev => ({
      ...prev,
      states: [cluster.state]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading network data...</span>
      </div>
    );
  }

  if (!activityEvents || activityEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No active network relationships found</div>
        <div className="text-gray-400 text-sm mt-2">
          This contractor has no currently active awards or subcontracts
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Network Summary */}
      <NetworkSummary
        summary={networkData.summary}
        mainContractor={networkData.mainContractor}
      />

      {/* View Toggle */}
      <div className="flex items-center space-x-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveView('network')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'network'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Network Graph
          </button>
          <button
            onClick={() => setActiveView('map')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'map'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Geographic Map
          </button>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          {filteredEdges.length} relationships • {geographicClusters.length} locations
        </div>
      </div>

      {/* Filters */}
      <NetworkFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        networkData={networkData}
      />

      {/* Visualization */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeView === 'network' ? (
          <NetworkVisualization
            networkData={filteredNetworkData}
            filters={filters}
            selectedNodeUEI={selectedNodeUEI}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onFilterChange={setFilters}
          />
        ) : (
          <MapVisualization
            clusters={geographicClusters}
            networkData={filteredNetworkData}
            filters={filters}
            onClusterClick={handleClusterClick}
            onFilterChange={setFilters}
          />
        )}
      </div>

      {/* Relationship Details Panel */}
      {selectedNodeUEI && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            Relationship Details: {
              networkData.nodes.find(n => n.uei === selectedNodeUEI)?.name
            }
          </h3>
          {/* This would show detailed relationship information */}
          <div className="text-gray-600">
            <p>Connected relationships and contract details would be shown here</p>
            <p className="text-sm mt-2">
              Selected node: {selectedNodeUEI}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}