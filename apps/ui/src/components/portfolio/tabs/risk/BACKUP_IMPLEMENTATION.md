# Risk Tab Implementation Backup
## Date: 2025-09-23

This backup contains all the sophisticated scoring/heuristics implementation we built for targeted monitoring. This should be preserved for later use when we focus on specific targeting.

## Key Components Saved:

### 1. Expandable Compact Grid System
- Located in: MonitoringDashboard.tsx
- Features: Score-based monitoring with status indicators
- Interaction: Toggle between collapsed/expanded states
- Visual: Color-coded feature cards with alert statuses

### 2. Feature Data Structure
```typescript
const activityFeatures = [
  { name: 'New Awards', score: 85, status: 'alert', weight: 42 },
  { name: 'Modifications', score: 91, status: 'normal', weight: 28 },
  { name: 'Pipeline Activity', score: 78, status: 'alert', weight: 20 },
];

const performanceFeatures = [
  { name: 'Composite Score', score: 87, status: 'normal', weight: 45 },
  { name: 'Revenue Performance', score: 92, status: 'normal', weight: 35 },
  { name: 'Growth Rate', score: 73, status: 'caution', weight: 20 },
];

const utilizationFeatures = [
  { name: 'Award Utilization', score: 94, status: 'critical', weight: 60 },
  { name: 'Resource Efficiency', score: 82, status: 'normal', weight: 40 },
];
```

### 3. State Management System
```typescript
const [expandedCard, setExpandedCard] = useState<string | null>(null);

const toggleCard = (cardType: string) => {
  setExpandedCard(expandedCard === cardType ? null : cardType);
};
```

### 4. Expandable Card Template
```jsx
{/* Expanded Content */}
{expandedCard === 'activity' ? (
  <div className="p-4">
    <div className="mb-4">
      <div className="text-xs text-gray-400 mb-3">Active Features:</div>
      <div className="grid grid-cols-3 gap-2">
        {activityFeatures.map((feature) => (
          <div key={feature.name} className="bg-gray-800/30 border border-gray-600/30 rounded p-2 text-center">
            <div className="text-xs text-gray-400 mb-1">{feature.name}</div>
            <div className="text-lg font-bold text-orange-400">{feature.score}</div>
            <div className="flex items-center justify-center mt-1">
              {feature.status === 'alert' && <span className="text-red-400 text-xs">⚠ Alert</span>}
              {feature.status === 'normal' && <span className="text-green-400 text-xs">✓ Normal</span>}
              {feature.status === 'caution' && <span className="text-yellow-400 text-xs">⚠ Caution</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="mb-4">
      <div className="text-xs text-gray-400 mb-2">
        Inactive: {inactiveActivityFeatures.join(', ')}
      </div>
      <button
        onClick={onShowFilterSettings}
        className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
      >
        <Plus className="w-3 h-3" />
        Add Feature Monitoring
      </button>
    </div>
  </div>
) : (
  // Collapsed view with compact visualization
)}
```

### 5. Color Scheme Implementation
- Activity: Orange theme (`bg-orange-500/10`, `text-orange-400`)
- Performance: Cyan theme (`bg-cyan-500/10`, `text-cyan-400`)
- Utilization: Indigo theme (`bg-indigo-500/10`, `text-indigo-400`)

### 6. Filter Configuration System (DO NOT TOUCH)
- ActivityFilter.tsx - State management with entity/feature combo logic
- PerformanceFilter.tsx - Value/Score toggle with dynamic range controls
- UtilizationFilter.tsx - Linear/Central Band monitoring modes
- All filter components have sophisticated state management for saved filters

### 7. Entity/Feature Combo State Management
```typescript
const handleSaveFilter = () => {
  const entityId = tempSettings.activity.entityId || 'all_entities';
  const feature = tempSettings.activity.feature || 'new_awards';

  const existingFilterIndex = savedFilters.findIndex(filter =>
    filter.config.entityId === entityId && filter.config.feature === feature
  );

  if (existingFilterIndex !== -1) {
    // Update existing filter
    setSavedFilters(prev => prev.map((filter, index) =>
      index === existingFilterIndex ? updatedFilter : filter
    ));
  } else {
    // Create new filter
    setSavedFilters(prev => [...prev, newFilter]);
  }
};
```

## Usage Notes:
- This scoring/heuristics system is perfect for targeted monitoring
- The visual indicators and status system provide quick insights
- The expandable grid system scales well with multiple features
- All filter components are working and should not be modified
- Portfolio-level defaults are properly configured

## Next Phase:
Replace the current expanded content with simple spreadsheet-style data views showing:
1. ALL available features (not just scored ones)
2. Actual values (not scores)
3. Portfolio asset contribution breakdown
4. Basic heuristics without subjective scoring

This backup preserves all the sophisticated work for future targeted monitoring implementation.