import React, { useState } from 'react';
import { Button } from '../../../../ui/button';
import { Plus, X } from 'lucide-react';
import type { TempSettings, PortfolioAsset, FeatureOption } from '../types';

interface SavedUtilizationFilter {
  id: string;
  name: string;
  config: TempSettings['utilization'];
  createdAt: Date;
}

interface UtilizationFilterProps {
  tempSettings: TempSettings;
  setTempSettings: React.Dispatch<React.SetStateAction<TempSettings>>;
  portfolioAssets: PortfolioAsset[];
  featureOptions: Record<string, FeatureOption>;
}

export function UtilizationFilter({
  tempSettings,
  setTempSettings,
  portfolioAssets,
  featureOptions
}: UtilizationFilterProps) {
  const [savedFilters, setSavedFilters] = useState<SavedUtilizationFilter[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isCreatingFilter, setIsCreatingFilter] = useState(false);

  const handleSaveFilter = () => {
    const newFilter: SavedUtilizationFilter = {
      id: `utilization-${Date.now()}`,
      name: tempSettings.utilization.name || `Utilization Filter ${savedFilters.length + 1}`,
      config: { ...tempSettings.utilization },
      createdAt: new Date()
    };

    setSavedFilters(prev => [...prev, newFilter]);
    setActiveTab(newFilter.id);
    setIsCreatingFilter(false);

    console.log('Saved utilization filter:', newFilter);
  };

  const loadFilter = (filter: SavedUtilizationFilter) => {
    setTempSettings(prev => ({
      ...prev,
      utilization: { ...filter.config }
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
    <div className="border border-gray-700/30 rounded-xl p-6 bg-indigo-900/40">
      {/* Saved Filters Tabs */}
      {savedFilters.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Saved Utilization Filters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((filter) => (
              <div
                key={filter.id}
                onClick={() => loadFilter(filter)}
                className={`px-3 py-2 text-xs rounded-lg border transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === filter.id
                    ? 'bg-indigo-500/30 text-indigo-300 border-indigo-400/50'
                    : 'bg-indigo-500/10 text-indigo-400/70 border-indigo-500/20 hover:bg-indigo-500/20'
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
              className="px-3 py-2 text-xs rounded-lg border border-dashed border-indigo-500/30 text-indigo-400/70 hover:bg-indigo-500/10 transition-all cursor-pointer"
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
            {tempSettings.utilization.name}
          </h3>
          <div className="text-sm px-3 py-1 bg-indigo-500/20 text-indigo-400 border-indigo-500/30 rounded-lg border font-medium">
            CENTRAL BAND MONITORING
          </div>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{tempSettings.utilization.description}</p>
      </div>

      {/* Entity and Feature Selection */}
      <div className="rounded-lg p-4 border border-gray-700 mb-6" style={{ backgroundColor: '#111827' }}>
        <h4 className="text-sm font-medium text-gray-200 mb-3">Filter Target</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Entity</label>
            <select
              value={tempSettings.utilization.entityId || ''}
              onChange={(e) => setTempSettings(prev => ({
                ...prev,
                utilization: { ...prev.utilization, entityId: e.target.value }
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
              value={tempSettings.utilization.feature || 'utilization'}
              onChange={(e) => {
                const selectedFeature = featureOptions[e.target.value];
                setTempSettings(prev => ({
                  ...prev,
                  utilization: {
                    ...prev.utilization,
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

      {/* Basic Central Band Controls */}
      <div className="rounded-lg p-4 border border-gray-700 mb-6" style={{ backgroundColor: '#111827' }}>
        <h4 className="text-sm font-medium text-gray-200 mb-3">Central Band Configuration</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-green-400 w-20">OPTIMAL</span>
            <span className="text-xs text-gray-500">
              {tempSettings.utilization.optimal.min}% - {tempSettings.utilization.optimal.max}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-green-400 w-16">MIN</span>
              <input
                type="range"
                min="50"
                max="80"
                value={tempSettings.utilization.optimal.min}
                onChange={(e) => setTempSettings(prev => ({
                  ...prev,
                  utilization: {
                    ...prev.utilization,
                    optimal: { ...prev.utilization.optimal, min: parseInt(e.target.value) }
                  }
                }))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-400"
              />
              <span className="text-sm text-gray-400 w-10">{tempSettings.utilization.optimal.min}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-green-400 w-16">MAX</span>
              <input
                type="range"
                min="60"
                max="90"
                value={tempSettings.utilization.optimal.max}
                onChange={(e) => setTempSettings(prev => ({
                  ...prev,
                  utilization: {
                    ...prev.utilization,
                    optimal: { ...prev.utilization.optimal, max: parseInt(e.target.value) }
                  }
                }))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-400"
              />
              <span className="text-sm text-gray-400 w-10">{tempSettings.utilization.optimal.max}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-4 pt-4 border-t border-gray-700/30">
        <Button
          onClick={handleSaveFilter}
          className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/40"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isCreatingFilter ? 'Save New Utilization Filter' : 'Save Utilization Filter'}
        </Button>
      </div>
    </div>
  );
}