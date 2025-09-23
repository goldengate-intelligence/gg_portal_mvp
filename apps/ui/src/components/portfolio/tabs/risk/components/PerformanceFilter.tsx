import React, { useState } from 'react';
import { Button } from '../../../../ui/button';
import { Plus, X } from 'lucide-react';
import type { TempSettings, PortfolioAsset, FeatureOption } from '../types';

interface SavedPerformanceFilter {
  id: string;
  name: string;
  config: TempSettings['performance'];
  createdAt: Date;
}

interface PerformanceFilterProps {
  tempSettings: TempSettings;
  setTempSettings: React.Dispatch<React.SetStateAction<TempSettings>>;
  portfolioAssets: PortfolioAsset[];
  featureOptions: Record<string, FeatureOption>;
}

export function PerformanceFilter({
  tempSettings,
  setTempSettings,
  portfolioAssets,
  featureOptions
}: PerformanceFilterProps) {
  const [savedFilters, setSavedFilters] = useState<SavedPerformanceFilter[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isCreatingFilter, setIsCreatingFilter] = useState(false);
  const [filterMode, setFilterMode] = useState<'value' | 'score'>('score');

  // Effect to handle mode changes and ensure feature compatibility
  React.useEffect(() => {
    const currentFeature = tempSettings.performance.feature;
    if (filterMode === 'value' && currentFeature === 'composite_score') {
      // Switch to a value-compatible feature when composite_score is selected in value mode
      const firstValueFeature = Object.entries(featureOptions)
        .find(([key, option]) => option.category === 'performance' && key !== 'composite_score');
      if (firstValueFeature) {
        const [key, selectedFeature] = firstValueFeature;
        setTempSettings(prev => ({
          ...prev,
          performance: {
            ...prev.performance,
            feature: key,
            name: selectedFeature.label,
            description: selectedFeature.description,
            type: selectedFeature.defaultType
          }
        }));
      }
    }
  }, [filterMode, tempSettings.performance.feature, setTempSettings, featureOptions]);

  // Effect to convert slider values when switching between score/value modes
  React.useEffect(() => {
    const selectedFeature = getSelectedFeature();
    if (!selectedFeature) return;

    // Define reasonable default ranges for different value types
    const getDefaultValueRanges = (unit: string) => {
      switch (unit) {
        case '$M':
          return { optimal: { min: 75, max: 100 }, caution: { min: 40, max: 74 }, critical: { min: 0, max: 39 } };
        case 'yrs':
          return { optimal: { min: 70, max: 100 }, caution: { min: 30, max: 69 }, critical: { min: 0, max: 29 } };
        case '%':
          return { optimal: { min: 60, max: 100 }, caution: { min: 25, max: 59 }, critical: { min: 0, max: 24 } };
        default:
          return { optimal: { min: 70, max: 100 }, caution: { min: 30, max: 69 }, critical: { min: 0, max: 29 } };
      }
    };

    // Only update if we're switching to value mode and the current values look like score values (0-100 range)
    if (filterMode === 'value' && selectedFeature.unit !== 'pts') {
      const currentOptimal = tempSettings.performance.optimal.min;
      const currentCaution = tempSettings.performance.caution.min;

      // Check if current values are in typical score range and need conversion
      if (currentOptimal >= 60 && currentOptimal <= 100 && currentCaution >= 10 && currentCaution <= 60) {
        const defaultRanges = getDefaultValueRanges(selectedFeature.unit);

        setTempSettings(prev => ({
          ...prev,
          performance: {
            ...prev.performance,
            optimal: defaultRanges.optimal,
            caution: defaultRanges.caution,
            critical: defaultRanges.critical
          }
        }));

        console.log('Converted to value mode ranges for', selectedFeature.unit, defaultRanges);
      }
    }

    // Convert back to score ranges when switching to score mode
    if (filterMode === 'score' && selectedFeature.unit === 'pts') {
      const scoreRanges = { optimal: { min: 70, max: 100 }, caution: { min: 30, max: 69 }, critical: { min: 0, max: 29 } };

      setTempSettings(prev => ({
        ...prev,
        performance: {
          ...prev.performance,
          optimal: scoreRanges.optimal,
          caution: scoreRanges.caution,
          critical: scoreRanges.critical
        }
      }));

      console.log('Converted to score mode ranges', scoreRanges);
    }
  }, [filterMode, tempSettings.performance.feature]);

  const handleSaveFilter = () => {
    const newFilter: SavedPerformanceFilter = {
      id: `performance-${Date.now()}`,
      name: tempSettings.performance.name || `Performance Filter ${savedFilters.length + 1}`,
      config: { ...tempSettings.performance },
      createdAt: new Date()
    };

    setSavedFilters(prev => [...prev, newFilter]);
    setActiveTab(newFilter.id);
    setIsCreatingFilter(false);

    console.log('Saved performance filter:', newFilter);
  };

  const loadFilter = (filter: SavedPerformanceFilter) => {
    setTempSettings(prev => ({
      ...prev,
      performance: { ...filter.config }
    }));
    setActiveTab(filter.id);
  };

  const deleteFilter = (filterId: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== filterId));
    if (activeTab === filterId) {
      setActiveTab(null);
    }
  };

  // Helper functions for dynamic range controls
  const getSelectedFeature = () => {
    const feature = featureOptions[tempSettings.performance.feature || 'composite_score'];
    console.log('Selected feature:', tempSettings.performance.feature, feature);
    return feature;
  };

  const rangeConfig = React.useMemo(() => {
    const selectedFeature = getSelectedFeature();
    console.log('getRangeConfig called - filterMode:', filterMode, 'selectedFeature:', selectedFeature);

    if (filterMode === 'score') {
      return {
        min: 0,
        max: 100,
        unit: 'pts',
        formatValue: (val: number) => `${val}`
      };
    }

    // Value mode - adjust based on feature unit
    switch (selectedFeature?.unit) {
      case '$M':
        return {
          min: 0,
          max: 100,
          unit: '$M',
          formatValue: (val: number) => {
            if (val === 0) return '$0M';
            if (val <= 10) return `$${val}M`;
            if (val <= 50) return `$${Math.round(val * 4 - 30)}M`;
            if (val <= 90) return `$${Math.round((val - 50) * 20 + 170)}M`;
            const billions = ((val - 90) * 0.9 + 0.97);
            return `$${billions.toFixed(1)}B`;
          }
        };
      case 'yrs':
        return {
          min: 0,
          max: 100,
          unit: 'yrs',
          formatValue: (val: number) => `${(val * 0.1).toFixed(1)}Y`
        };
      case '%':
        return {
          min: 0,
          max: 100,
          unit: '%',
          formatValue: (val: number) => `${Math.round(val * 10)}%`
        };
      default:
        return {
          min: 0,
          max: 100,
          unit: 'pts',
          formatValue: (val: number) => `${val}`
        };
    }
  }, [filterMode, tempSettings.performance.feature, featureOptions]);

  return (
    <div className="border border-gray-700/30 rounded-xl p-6 bg-cyan-900/40">
      {/* Saved Filters Tabs */}
      {savedFilters.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Saved Performance Filters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((filter) => (
              <div
                key={filter.id}
                onClick={() => loadFilter(filter)}
                className={`px-3 py-2 text-xs rounded-lg border transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === filter.id
                    ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400/50'
                    : 'bg-cyan-500/10 text-cyan-400/70 border-cyan-500/20 hover:bg-cyan-500/20'
                }`}
              >
                <span>{filter.name}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFilter(filter.id);
                  }}
                  className="ml-1 text-red-400 hover:text-red-300 cursor-pointer"
                  role="button"
                  title="Delete filter"
                >
                  ×
                </span>
              </div>
            ))}
            <div
              onClick={() => setIsCreatingFilter(true)}
              className="px-3 py-2 text-xs rounded-lg border border-dashed border-cyan-500/30 text-cyan-400/70 hover:bg-cyan-500/10 transition-all cursor-pointer"
            >
              + New Filter
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-white">
            Performance Monitoring
          </h3>
          <div className="text-sm px-3 py-1 bg-cyan-500/20 text-cyan-400 border-cyan-500/30 rounded-lg border font-medium">
            LINEAR MONITORING
          </div>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{tempSettings.performance.description}</p>
      </div>

      {/* Entity and Feature Selection */}
      <div className="rounded-lg p-4 border border-gray-700 mb-6" style={{ backgroundColor: '#111827' }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-200">Filter Target</h4>
          <div className="flex bg-gray-800 rounded-lg border border-gray-600/50">
            <button
              onClick={() => setFilterMode('value')}
              className={`px-3 py-1 text-xs rounded-l-lg transition-all ${
                filterMode === 'value'
                  ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400/50'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Value
            </button>
            <button
              onClick={() => setFilterMode('score')}
              className={`px-3 py-1 text-xs rounded-r-lg transition-all ${
                filterMode === 'score'
                  ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400/50'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Score
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Entity</label>
            <select
              value={tempSettings.performance.entityId || ''}
              onChange={(e) => setTempSettings(prev => ({
                ...prev,
                performance: { ...prev.performance, entityId: e.target.value }
              }))}
              className="w-full bg-gray-800 border border-gray-600/50 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-400/50"
            >
              <option value="">All Entities</option>
              {portfolioAssets.map(asset => (
                <option key={asset.id} value={asset.uei}>
                  {asset.companyName} ({asset.uei})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Feature</label>
            <select
              value={tempSettings.performance.feature || 'composite_score'}
              onChange={(e) => {
                const selectedFeature = featureOptions[e.target.value];
                setTempSettings(prev => ({
                  ...prev,
                  performance: {
                    ...prev.performance,
                    feature: e.target.value,
                    name: selectedFeature.label,
                    description: selectedFeature.description,
                    type: selectedFeature.defaultType
                  }
                }));
              }}
              className="w-full bg-gray-800 border border-gray-600/50 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-400/50"
            >
              {Object.entries(featureOptions)
                .filter(([key, option]) => {
                  if (option.category !== 'performance') return false;
                  if (filterMode === 'value' && key === 'composite_score') return false;
                  return true;
                })
                .map(([key, option]) => (
                  <option key={key} value={key}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Range Controls with Dynamic Border Fader */}
      <div className="rounded-lg p-4 border border-gray-700 mb-6" style={{ backgroundColor: '#111827' }}>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium text-gray-200">Range Configuration</h4>
          <span className="text-xs text-gray-400 uppercase tracking-wider">{filterMode === 'score' ? 'Score' : 'Value'}</span>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-green-400 w-20">OPTIMAL {'>'}</span>
            <input
              type="range"
              min={rangeConfig.min + 2}
              max={rangeConfig.max - 2}
              value={tempSettings.performance.optimal.min}
              onChange={(e) => {
                const newOptimalValue = parseInt(e.target.value);
                setTempSettings(prev => ({
                  ...prev,
                  performance: {
                    ...prev.performance,
                    optimal: { ...prev.performance.optimal, min: newOptimalValue },
                    caution: {
                      ...prev.performance.caution,
                      min: Math.min(prev.performance.caution.min, newOptimalValue - 1),
                      max: Math.max(prev.performance.caution.max, newOptimalValue)
                    },
                    critical: {
                      ...prev.performance.critical,
                      max: Math.min(prev.performance.critical.max, newOptimalValue - 1)
                    }
                  }
                }));
              }}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
            />
            <span className="text-sm text-gray-400 w-12 text-right">{rangeConfig.formatValue(tempSettings.performance.optimal.min)}</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-yellow-400 w-20">CAUTION {'>'}</span>
            <input
              type="range"
              min={rangeConfig.min + 1}
              max={tempSettings.performance.optimal.min - 1}
              value={tempSettings.performance.caution.min}
              onChange={(e) => {
                const newCautionValue = parseInt(e.target.value);
                setTempSettings(prev => ({
                  ...prev,
                  performance: {
                    ...prev.performance,
                    caution: { ...prev.performance.caution, min: newCautionValue },
                    critical: {
                      ...prev.performance.critical,
                      max: Math.min(prev.performance.critical.max, newCautionValue - 1)
                    }
                  }
                }));
              }}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-400"
            />
            <span className="text-sm text-gray-400 w-12 text-right">{rangeConfig.formatValue(tempSettings.performance.caution.min)}</span>
          </div>

          <div className="border-t border-gray-600/30 pt-3 mt-4">
            <div className="text-xs space-y-1">
              <div className="flex justify-between text-green-400">
                <span>Optimal (High Performance)</span>
                <span className="text-right">{rangeConfig.formatValue(tempSettings.performance.optimal.min)}+</span>
              </div>
              <div className="flex justify-between text-yellow-400">
                <span>Caution (Borderline Performance)</span>
                <span className="text-right">{rangeConfig.formatValue(tempSettings.performance.caution.min)}-{rangeConfig.formatValue(tempSettings.performance.optimal.min - 1)}</span>
              </div>
              <div className="flex justify-between text-red-400">
                <span>Critical (Low Performance)</span>
                <span className="text-right">{rangeConfig.formatValue(0)}-{rangeConfig.formatValue(tempSettings.performance.critical.max)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-4 pt-4 border-t border-gray-700/30">
        <Button
          onClick={handleSaveFilter}
          className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isCreatingFilter ? 'Save New Performance Filter' : 'Save Performance Filter'}
        </Button>
      </div>
    </div>
  );
}