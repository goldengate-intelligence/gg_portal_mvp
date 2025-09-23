import React from 'react';
import { Button } from '../../../../ui/button';
import { Bot, Settings, Shield } from 'lucide-react';
import type { FilterSettings } from '../types';
import { ChartStyleContainer } from '../ui/ChartStyleContainer';

interface MonitoringDashboardProps {
  filterSettings: FilterSettings;
  onAIConfigureClick: () => void;
  onShowFilterSettings: () => void;
}

export function MonitoringDashboard({
  filterSettings,
  onAIConfigureClick,
  onShowFilterSettings
}: MonitoringDashboardProps) {
  return (
    <ChartStyleContainer>
      <div className="relative h-full">
        {/* Title */}
        <div className="absolute top-0 left-0 z-10">
          <h3 className="font-sans text-xs uppercase tracking-wider text-gray-500">
            Monitoring Dashboard
          </h3>
        </div>

        {/* Live Indicator */}
        <div className="absolute top-0 right-0 z-10 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
          <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
            TRACKING
          </span>
        </div>

        {/* Content */}
        <div className="pt-8">
          {/* Enhanced Monitoring Grid - 4 Metrics with Smart Filters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* ACTIVITY - Threshold Type */}
            <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg relative group hover:border-gray-400/40 transition-all">
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">{filterSettings.activity.name}</div>
              <div className="text-2xl font-bold text-gray-400 mb-3">12</div>

              {/* Smart Filter Visualization - Threshold Type */}
              <div className="relative h-2 bg-gray-700/50 rounded-full mb-2">
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500/30 via-yellow-500/30 to-red-500/60 rounded-full w-full"></div>
                <div
                  className="absolute top-0 h-full w-1.5 bg-white rounded-full shadow-md border border-gray-400"
                  style={{ left: `${Math.min((12 / filterSettings.activity.redThreshold) * 100, 100)}%` }}
                ></div>
                <div
                  className="absolute top-0 h-full w-0.5 bg-red-400 rounded-full opacity-80"
                  style={{ left: '100%' }}
                ></div>
              </div>

              <div className="text-xs text-gray-400 mb-1">
                {12 > filterSettings.activity.redThreshold ?
                  <span className="text-red-400">⚠ Alert threshold exceeded</span> :
                  `${filterSettings.activity.redThreshold - 12} events until alert`}
              </div>
              <div className="text-[10px] text-gray-500">
                Filter: Threshold @ {filterSettings.activity.redThreshold}
              </div>
            </div>

            {/* PERFORMANCE - Range Type */}
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg relative group hover:border-green-400/40 transition-all">
              <div className="text-xs text-green-400 mb-2 uppercase tracking-wider">{filterSettings.performance.name}</div>
              <div className="text-2xl font-bold text-green-400 mb-3">87th</div>

              {/* Smart Filter Visualization - Range Type */}
              <div className="relative h-2 bg-gray-700/50 rounded-full mb-2">
                <div
                  className="absolute top-0 left-0 h-full bg-red-500/80 rounded-l-full"
                  style={{ width: `${filterSettings.performance.critical.max}%` }}
                ></div>
                <div
                  className="absolute top-0 h-full bg-yellow-500/80"
                  style={{
                    left: `${filterSettings.performance.caution.min}%`,
                    width: `${filterSettings.performance.caution.max - filterSettings.performance.caution.min}%`
                  }}
                ></div>
                <div
                  className="absolute top-0 h-full bg-green-500/80 rounded-r-full"
                  style={{
                    left: `${filterSettings.performance.optimal.min}%`,
                    width: `${filterSettings.performance.optimal.max - filterSettings.performance.optimal.min}%`
                  }}
                ></div>
                <div
                  className="absolute top-0 h-full w-1.5 bg-white rounded-full shadow-md border border-gray-400"
                  style={{ left: '87%' }}
                ></div>
              </div>

              <div className="text-xs text-gray-400 mb-1">
                87th percentile - Acceptable Range
              </div>
              <div className="text-[10px] text-gray-500">
                Filter: Range {filterSettings.performance.critical.max}/{filterSettings.performance.optimal.min}
              </div>
            </div>

            {/* UTILIZATION - Central Band Type */}
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg relative group hover:border-red-400/40 transition-all">
              <div className="text-xs text-red-400 mb-2 uppercase tracking-wider">{filterSettings.utilization.name}</div>
              <div className="text-2xl font-bold text-red-400 mb-3">94%</div>

              {/* Smart Filter Visualization - Central Band Type */}
              <div className="relative h-2 bg-gray-700/50 rounded-full mb-2">
                <div
                  className="absolute top-0 left-0 h-full bg-red-500/80 rounded-l-full"
                  style={{ width: `${filterSettings.utilization.caution.min}%` }}
                ></div>
                <div
                  className="absolute top-0 right-0 h-full bg-red-500/80 rounded-r-full"
                  style={{ width: `${100 - filterSettings.utilization.caution.max}%` }}
                ></div>
                <div
                  className="absolute top-0 h-full bg-yellow-500/80"
                  style={{
                    left: `${filterSettings.utilization.caution.min}%`,
                    width: `${filterSettings.utilization.optimal.min - filterSettings.utilization.caution.min}%`
                  }}
                ></div>
                <div
                  className="absolute top-0 h-full bg-yellow-500/80"
                  style={{
                    left: `${filterSettings.utilization.optimal.max}%`,
                    width: `${filterSettings.utilization.caution.max - filterSettings.utilization.optimal.max}%`
                  }}
                ></div>
                <div
                  className="absolute top-0 h-full bg-green-500/80"
                  style={{
                    left: `${filterSettings.utilization.optimal.min}%`,
                    width: `${filterSettings.utilization.optimal.max - filterSettings.utilization.optimal.min}%`
                  }}
                ></div>
                <div
                  className="absolute top-0 h-full w-1.5 bg-white rounded-full shadow-md border border-gray-400"
                  style={{ left: '94%' }}
                ></div>
              </div>

              <div className="text-xs text-gray-400 mb-1">
                94% - Critical Zone (Over-utilization)
              </div>
              <div className="text-[10px] text-gray-500">
                Filter: Central Band {filterSettings.utilization.optimal.min}-{filterSettings.utilization.optimal.max}%
              </div>
            </div>
          </div>

          {/* Enhanced Portfolio Status Summary */}
          <div className="mb-6 p-4 bg-gray-800/30 border border-gray-700/40 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium text-gray-200">Smart Filter Portfolio Assessment</span>
              </div>
              <div className="text-xs text-gray-400">
                4 Active Filters • 2 Alerts
              </div>
            </div>

            {/* Filter Type Legend */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-400">Threshold: Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400">Range: Acceptable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-red-400">Central Band: Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-yellow-400">Range: Borderline</span>
              </div>
            </div>
          </div>

          {/* Configuration Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              onClick={onAIConfigureClick}
              className="bg-[#8B8EFF]/20 hover:bg-[#8B8EFF]/30 text-[#8B8EFF] border border-[#8B8EFF]/40 hover:border-[#8B8EFF]/60 transition-all duration-200"
            >
              <Bot className="w-4 h-4 mr-2" />
              AI Configuration
            </Button>
            <Button
              onClick={onShowFilterSettings}
              className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200"
            >
              <Settings className="w-4 h-4 mr-2" />
              Filter Settings
            </Button>
          </div>
        </div>
      </div>
    </ChartStyleContainer>
  );
}