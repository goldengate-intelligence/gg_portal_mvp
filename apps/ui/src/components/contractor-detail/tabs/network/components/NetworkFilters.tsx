import React, { useState } from 'react';
import type { NetworkFilters, NetworkData } from '../types';

interface NetworkFiltersProps {
  filters: NetworkFilters;
  onFiltersChange: (filters: NetworkFilters) => void;
  networkData: NetworkData;
}

export default function NetworkFiltersComponent({
  filters,
  onFiltersChange,
  networkData
}: NetworkFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get available filter options from network data
  const availableStates = React.useMemo(() => {
    const states = new Set<string>();
    networkData.edges.forEach(edge => {
      edge.geographic.performanceStates.forEach(state => {
        if (state) states.add(state);
      });
    });
    return Array.from(states).sort();
  }, [networkData.edges]);

  const availableRelationshipTypes = [
    { value: 'PRIME', label: 'Government Contracts', description: 'Direct government awards' },
    { value: 'SUBAWARD', label: 'Subcontracts', description: 'Prime-to-sub relationships' },
    { value: 'SUBSIDIARY_OBLIGATION', label: 'Subsidiary Allocations', description: 'Parent-to-subsidiary flows' }
  ];

  const formatCurrency = (amount: number): string => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const handleRelationshipTypeToggle = (type: string) => {
    const updatedTypes = filters.relationshipTypes.includes(type)
      ? filters.relationshipTypes.filter(t => t !== type)
      : [...filters.relationshipTypes, type];

    onFiltersChange({
      ...filters,
      relationshipTypes: updatedTypes
    });
  };

  const handleStateToggle = (state: string) => {
    const updatedStates = filters.states.includes(state)
      ? filters.states.filter(s => s !== state)
      : [...filters.states, state];

    onFiltersChange({
      ...filters,
      states: updatedStates
    });
  };

  const handleValueRangeChange = (field: 'minValue' | 'maxValue', value: string) => {
    const numValue = value === '' ? (field === 'minValue' ? 0 : Number.MAX_SAFE_INTEGER) : parseFloat(value);

    onFiltersChange({
      ...filters,
      [field]: numValue
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      relationshipTypes: [],
      minValue: 0,
      maxValue: Number.MAX_SAFE_INTEGER,
      states: [],
      activeOnly: true,
      timeRange: filters.timeRange // Keep time range
    });
  };

  const activeFilterCount = filters.relationshipTypes.length + filters.states.length +
    (filters.minValue > 0 ? 1 : 0) +
    (filters.maxValue < Number.MAX_SAFE_INTEGER ? 1 : 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-medium">Filters</span>
          </button>

          {activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Relationship Types */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Relationship Types</h3>
            <div className="space-y-3">
              {availableRelationshipTypes.map((type) => (
                <label key={type.value} className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={filters.relationshipTypes.includes(type.value)}
                    onChange={() => handleRelationshipTypeToggle(type.value)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Value Range */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Award Value Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Minimum Value</label>
                <input
                  type="number"
                  placeholder="$0"
                  value={filters.minValue > 0 ? filters.minValue : ''}
                  onChange={(e) => handleValueRangeChange('minValue', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Maximum Value</label>
                <input
                  type="number"
                  placeholder="No limit"
                  value={filters.maxValue < Number.MAX_SAFE_INTEGER ? filters.maxValue : ''}
                  onChange={(e) => handleValueRangeChange('maxValue', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Geographic Filter */}
          {availableStates.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                Performance States ({availableStates.length})
              </h3>
              <div className="max-h-40 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {availableStates.map((state) => (
                    <label key={state} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.states.includes(state)}
                        onChange={() => handleStateToggle(state)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{state}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Only Toggle */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={filters.activeOnly}
                onChange={(e) => onFiltersChange({ ...filters, activeOnly: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Active Awards Only</div>
                <div className="text-sm text-gray-500">
                  Show only currently active contracts and relationships
                </div>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}