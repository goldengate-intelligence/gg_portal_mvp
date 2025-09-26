# Network Tab

Client-side network analysis and visualization for contractor detail pages.

## Overview

The Network Tab provides interactive visualization of contractor relationships, including:
- **Network Graph**: Interactive node-link diagram showing relationship connections
- **Geographic Map**: Map-based visualization showing performance locations
- **Relationship Analysis**: Detailed breakdown of inflows, outflows, and network strength

## Architecture

### Client-Side Aggregation
All network data is computed client-side from the unified activity events data structure. This approach provides:
- **Single Data Source**: Same activity data powers both Activity and Network tabs
- **Instant Interactivity**: Real-time filtering and visualization updates
- **Consistent Caching**: Shared data fetch reduces server load
- **Active Awards Focus**: Network shows only currently active relationships

### Data Flow
```
ActivityEvent[] (from API)
    ↓
buildNetworkData() - Client-side aggregation
    ↓
NetworkData { nodes, edges, summary }
    ↓
Interactive Visualizations
```

## Components

### NetworkTab (Main Component)
- Orchestrates all network functionality
- Manages filters and view state
- Handles user interactions
- Props: `contractorUEI`, `activityEvents`, `isLoading`

### NetworkSummary
- High-level network metrics and KPIs
- Inflow/outflow relationship breakdown
- Geographic reach and entity type distribution
- Total active value and relationship counts

### NetworkVisualization
- Interactive force-directed network graph
- Node sizing based on relationship value
- Edge thickness represents relationship strength
- Click interactions for node/edge details

### MapVisualization
- Geographic clustering of relationships
- State and city-level performance locations
- Interactive map with cluster details
- Geographic filter integration

### NetworkFilters
- Relationship type filtering (Prime, Subaward, Subsidiary)
- Value range filtering
- Geographic state filtering
- Active/all relationships toggle

## Types

### Core Data Types
```typescript
interface NetworkNode {
  uei: string;
  name: string;
  type: 'contractor' | 'agency' | 'prime' | 'sub';
  location: { state?, city?, coordinates? };
  metrics: { totalActiveValue, activeAwardsCount, relationshipCount };
  isMainContractor: boolean;
}

interface NetworkEdge {
  source: string; // UEI
  target: string; // UEI
  direction: 'inflow' | 'outflow';
  relationshipType: 'PRIME' | 'SUBAWARD' | 'SUBSIDIARY_OBLIGATION';
  metrics: { activeAwards, totalValue, strength, avgAwardSize };
  geographic: { performanceStates, performanceCities };
}
```

## Utilities

### Core Functions

**buildNetworkData(activityEvents, contractorUEI): NetworkData**
- Main aggregation function
- Builds nodes and edges from activity events
- Calculates network metrics and summary statistics

**buildGeographicClusters(networkData, filters): GeographicCluster[]**
- Groups relationships by geographic location
- Creates clusters for map visualization
- Applies current filters to cluster data

**applyNetworkFilters(edges, filters): NetworkEdge[]**
- Filters network edges based on user preferences
- Supports relationship type, value range, and geographic filtering

### Helper Functions
- `determineNodeType()` - Categorizes entities (agency/prime/sub)
- `calculateRelationshipStrength()` - Computes edge strength (0-100)
- `filterActiveAwards()` - Filters for currently active contracts only

## Integration

### With Activity Tab
The Network Tab shares the same `activityEvents` data structure as the Activity Tab:
- Single API call provides data for both tabs
- Consistent entity names and relationships
- Shared loading states and error handling

### Usage Example
```tsx
import { NetworkTab } from '@/components/contractor-detail/tabs/network';

<NetworkTab
  contractorUEI={contractor.uei}
  activityEvents={activityData}
  isLoading={isLoadingActivity}
/>
```

## Features

### Interactive Visualizations
- **Node Selection**: Click nodes to highlight connected relationships
- **Edge Details**: Hover edges to see relationship strength and value
- **Dynamic Filtering**: Real-time filter updates without server requests
- **View Switching**: Toggle between network graph and geographic map

### Geographic Analysis
- **Performance Locations**: Shows where work is actually performed
- **State-Level Clustering**: Groups relationships by state
- **Geographic Reach**: Calculates contractor's geographic footprint
- **Location-Based Filtering**: Filter relationships by performance state

### Relationship Intelligence
- **Flow Direction**: Clearly shows money flowing to/from contractor
- **Relationship Strength**: Calculated based on value, award count, and size
- **Entity Classification**: Automatically categorizes relationship types
- **Active Focus**: Only shows currently active relationships

## Performance

### Optimization Strategies
- **Memoized Calculations**: Network data cached until activity events change
- **Efficient Filtering**: Client-side filtering without data refetch
- **Progressive Enhancement**: Loads visualizations after data is ready
- **Responsive Layout**: Adapts to different screen sizes

### Scalability
- **Handles Large Networks**: Tested with 100+ relationships
- **Memory Efficient**: Only loads active relationships
- **Fast Interactions**: Sub-100ms filter and selection updates
- **Lazy Loading**: Components load as needed

## Future Enhancements

### Potential Features
- **Force-Directed Layout**: D3.js integration for better node positioning
- **Real Map Integration**: Actual US map with coordinate-based positioning
- **Relationship Timeline**: Time-based relationship evolution
- **Export Capabilities**: Network data export to various formats
- **Advanced Filtering**: NAICS/PSC-based relationship filtering

### Technical Improvements
- **WebGL Rendering**: For large network performance
- **Web Workers**: Background network calculations
- **Virtual Scrolling**: For large geographic cluster lists
- **Accessibility**: Keyboard navigation and screen reader support