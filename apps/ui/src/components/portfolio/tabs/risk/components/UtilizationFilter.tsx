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
  const [monitoringType, setMonitoringType] = useState<'central_band' | 'linear'>('central_band');

  const handleSaveFilter = () => {
    const entityId = tempSettings.utilization.entityId || 'all_entities';
    const feature = tempSettings.utilization.feature || 'award_utilization';

    // Check if a filter with this entity/feature combo already exists
    const existingFilterIndex = savedFilters.findIndex(filter =>
      filter.config.entityId === entityId && filter.config.feature === feature
    );

    if (existingFilterIndex !== -1) {
      // Update existing filter
      const updatedFilter: SavedUtilizationFilter = {
        ...savedFilters[existingFilterIndex],
        name: tempSettings.utilization.name || `${entityId === 'all_entities' ? 'All Entities' : portfolioAssets.find(a => a.uei === entityId)?.companyName || entityId} ${tempSettings.utilization.name || 'Utilization'}`,
        config: { ...tempSettings.utilization },
        createdAt: new Date()
      };

      setSavedFilters(prev => prev.map((filter, index) =>
        index === existingFilterIndex ? updatedFilter : filter
      ));
      setActiveTab(updatedFilter.id);
    } else {
      // Create new filter
      const newFilter: SavedUtilizationFilter = {
        id: `utilization-${Date.now()}`,
        name: tempSettings.utilization.name || `${entityId === 'all_entities' ? 'All Entities' : portfolioAssets.find(a => a.uei === entityId)?.companyName || entityId} ${tempSettings.utilization.name || 'Utilization'}`,
        config: { ...tempSettings.utilization },
        createdAt: new Date()
      };

      setSavedFilters(prev => [...prev, newFilter]);
      setActiveTab(newFilter.id);
    }

    setIsCreatingFilter(false);
    console.log('Saved utilization filter with entity/feature combo logic');
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

      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-white">
            Utilization Monitoring
          </h3>
          <div className="text-sm px-3 py-1 bg-indigo-500/20 text-indigo-400 border-indigo-500/30 rounded-lg border font-medium">
            {monitoringType === 'central_band' ? 'CENTRAL BAND MONITORING' : 'LINEAR MONITORING'}
          </div>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{tempSettings.utilization.description}</p>
      </div>

      {/* Entity and Feature Selection */}
      <div className="rounded-lg p-4 border border-gray-700 mb-6" style={{ backgroundColor: '#111827' }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-200">Filter Target</h4>
          <div className="flex bg-gray-800 rounded-lg border border-gray-600/50">
            <button
              onClick={() => setMonitoringType('linear')}
              className={`px-3 py-1 text-xs rounded-l-lg transition-all ${
                monitoringType === 'linear'
                  ? 'bg-indigo-500/30 text-indigo-300 border-indigo-400/50'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Linear
            </button>
            <button
              onClick={() => setMonitoringType('central_band')}
              className={`px-3 py-1 text-xs rounded-r-lg transition-all ${
                monitoringType === 'central_band'
                  ? 'bg-indigo-500/30 text-indigo-300 border-indigo-400/50'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Central Band
            </button>
          </div>
        </div>
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
              value={tempSettings.utilization.feature || 'award_utilization'}
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
              {Object.entries(featureOptions)
                .filter(([key, option]) => option.category === 'utilization')
                .map(([key, option]) => (
                  <option key={key} value={key}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dynamic Range Controls */}
      <div className="rounded-lg p-4 border border-gray-700 mb-6" style={{ backgroundColor: '#111827' }}>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium text-gray-200">{monitoringType === 'central_band' ? 'Central Band Configuration' : 'Range Configuration'}</h4>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Percentage</span>
        </div>
        {monitoringType === 'central_band' ? (
          <div className="space-y-4">
            {/* Optimal Band Controls */}
            <div>
              <div className="flex items-center space-x-3 mb-2">
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
                    min="40"
                    max="80"
                    value={tempSettings.utilization.optimal.min}
                    onChange={(e) => {
                      const newOptimalMin = parseInt(e.target.value);
                      setTempSettings(prev => ({
                        ...prev,
                        utilization: {
                          ...prev.utilization,
                          optimal: { ...prev.utilization.optimal, min: newOptimalMin },
                          caution: {
                            ...prev.utilization.caution,
                            min: Math.min(prev.utilization.caution.min, newOptimalMin - 5),
                            max: Math.max(prev.utilization.caution.max, newOptimalMin)
                          }
                        }
                      }));
                    }}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-400"
                  />
                  <span className="text-sm text-gray-400 w-12 text-right">{tempSettings.utilization.optimal.min}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-green-400 w-16">MAX</span>
                  <input
                    type="range"
                    min="60"
                    max="95"
                    value={tempSettings.utilization.optimal.max}
                    onChange={(e) => {
                      const newOptimalMax = parseInt(e.target.value);
                      setTempSettings(prev => ({
                        ...prev,
                        utilization: {
                          ...prev.utilization,
                          optimal: { ...prev.utilization.optimal, max: newOptimalMax },
                          caution: {
                            ...prev.utilization.caution,
                            min: Math.min(prev.utilization.caution.min, newOptimalMax),
                            max: Math.max(prev.utilization.caution.max, newOptimalMax + 5)
                          }
                        }
                      }));
                    }}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-400"
                  />
                  <span className="text-sm text-gray-400 w-12 text-right">{tempSettings.utilization.optimal.max}%</span>
                </div>
              </div>
            </div>

            {/* Caution Band Controls */}
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-xs text-yellow-400 w-20">CAUTION</span>
                <span className="text-xs text-gray-500">
                  {tempSettings.utilization.caution.min}% - {tempSettings.utilization.caution.max}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-yellow-400 w-16">MIN</span>
                  <input
                    type="range"
                    min="10"
                    max={tempSettings.utilization.optimal.min - 1}
                    value={tempSettings.utilization.caution.min}
                    onChange={(e) => setTempSettings(prev => ({
                      ...prev,
                      utilization: {
                        ...prev.utilization,
                        caution: { ...prev.utilization.caution, min: parseInt(e.target.value) }
                      }
                    }))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-400"
                  />
                  <span className="text-sm text-gray-400 w-12 text-right">{tempSettings.utilization.caution.min}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-yellow-400 w-16">MAX</span>
                  <input
                    type="range"
                    min={tempSettings.utilization.optimal.max + 1}
                    max="98"
                    value={tempSettings.utilization.caution.max}
                    onChange={(e) => setTempSettings(prev => ({
                      ...prev,
                      utilization: {
                        ...prev.utilization,
                        caution: { ...prev.utilization.caution, max: parseInt(e.target.value) }
                      }
                    }))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-400"
                  />
                  <span className="text-sm text-gray-400 w-12 text-right">{tempSettings.utilization.caution.max}%</span>
                </div>
              </div>
            </div>

            {/* Visual Band Breakdown */}
            <div className="border-t border-gray-600/30 pt-3 mt-4">
              <div className="text-xs space-y-1">
                <div className="flex justify-between text-red-400">
                  <span>Critical (Under-utilization)</span>
                  <span className="text-right">0%-{tempSettings.utilization.caution.min - 1}%</span>
                </div>
                <div className="flex justify-between text-yellow-400">
                  <span>Caution (Low Monitoring Zone)</span>
                  <span className="text-right">{tempSettings.utilization.caution.min}%-{tempSettings.utilization.optimal.min - 1}%</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Optimal (Target Zone)</span>
                  <span className="text-right">{tempSettings.utilization.optimal.min}%-{tempSettings.utilization.optimal.max}%</span>
                </div>
                <div className="flex justify-between text-yellow-400">
                  <span>Caution (High Monitoring Zone)</span>
                  <span className="text-right">{tempSettings.utilization.optimal.max + 1}%-{tempSettings.utilization.caution.max}%</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Critical (Over-utilization)</span>
                  <span className="text-right">{tempSettings.utilization.caution.max + 1}%+</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Linear Range Configuration (similar to Performance Filter)
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs text-green-400 w-20">OPTIMAL {'>'}</span>
              <input
                type="range"
                min="60"
                max="95"
                value={tempSettings.utilization.optimal.min}
                onChange={(e) => {
                  const newOptimalValue = parseInt(e.target.value);
                  setTempSettings(prev => ({
                    ...prev,
                    utilization: {
                      ...prev.utilization,
                      optimal: { ...prev.utilization.optimal, min: newOptimalValue },
                      caution: {
                        ...prev.utilization.caution,
                        min: Math.min(prev.utilization.caution.min, newOptimalValue - 1),
                        max: Math.max(prev.utilization.caution.max, newOptimalValue)
                      },
                      critical: {
                        ...prev.utilization.critical,
                        max: Math.min(prev.utilization.critical.max, newOptimalValue - 1)
                      }
                    }
                  }));
                }}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-400"
              />
              <span className="text-sm text-gray-400 w-12 text-right">{tempSettings.utilization.optimal.min}%</span>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-yellow-400 w-20">CAUTION {'>'}</span>
              <input
                type="range"
                min="20"
                max={tempSettings.utilization.optimal.min - 1}
                value={tempSettings.utilization.caution.min}
                onChange={(e) => {
                  const newCautionValue = parseInt(e.target.value);
                  setTempSettings(prev => ({
                    ...prev,
                    utilization: {
                      ...prev.utilization,
                      caution: { ...prev.utilization.caution, min: newCautionValue },
                      critical: {
                        ...prev.utilization.critical,
                        max: Math.min(prev.utilization.critical.max, newCautionValue - 1)
                      }
                    }
                  }));
                }}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-400"
              />
              <span className="text-sm text-gray-400 w-12 text-right">{tempSettings.utilization.caution.min}%</span>
            </div>

            {/* Linear Range Breakdown */}
            <div className="border-t border-gray-600/30 pt-3 mt-4">
              <div className="text-xs space-y-1">
                <div className="flex justify-between text-green-400">
                  <span>Optimal (High Utilization)</span>
                  <span className="text-right">{tempSettings.utilization.optimal.min}%+</span>
                </div>
                <div className="flex justify-between text-yellow-400">
                  <span>Caution (Borderline Utilization)</span>
                  <span className="text-right">{tempSettings.utilization.caution.min}%-{tempSettings.utilization.optimal.min - 1}%</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Critical (Low Utilization)</span>
                  <span className="text-right">0%-{tempSettings.utilization.critical.max}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
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