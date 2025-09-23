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
            {tempSettings.performance.name}
          </h3>
          <div className="text-sm px-3 py-1 bg-cyan-500/20 text-cyan-400 border-cyan-500/30 rounded-lg border font-medium">
            LINEAR MONITORING
          </div>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{tempSettings.performance.description}</p>
      </div>

      {/* Entity and Feature Selection */}
      <div className="rounded-lg p-4 border border-gray-700 mb-6" style={{ backgroundColor: '#223040' }}>
        <h4 className="text-sm font-medium text-gray-200 mb-3">Filter Target</h4>
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
              value={tempSettings.performance.feature || 'performance_score'}
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
              {Object.entries(featureOptions).map(([key, option]) => (
                <option key={key} value={key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Range Controls with Dynamic Border Fader */}
      <div className="rounded-lg p-4 border border-gray-700 mb-6" style={{ backgroundColor: '#223040' }}>
        <h4 className="text-sm font-medium text-gray-200 mb-3">Range Configuration</h4>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-green-400 w-20">ACCEPT {'>'}</span>
            <input
              type="range"
              min="2"
              max="98"
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
            <span className="text-sm text-gray-400 w-12">{tempSettings.performance.optimal.min}</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-yellow-400 w-20">BORDER {'>'}</span>
            <input
              type="range"
              min="1"
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
            <span className="text-sm text-gray-400 w-12">{tempSettings.performance.caution.min}</span>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <div>• Accept: {tempSettings.performance.optimal.min}+ (Optimal Performance)</div>
            <div>• Border: {tempSettings.performance.caution.min}-{tempSettings.performance.optimal.min - 1} (Caution Zone)</div>
            <div>• Reject: 0-{tempSettings.performance.critical.max} (Critical Zone)</div>
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