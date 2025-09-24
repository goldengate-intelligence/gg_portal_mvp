import React, { useState } from 'react';
import { Button } from '../../../../ui/button';
import { Bot, Settings, Shield, ChevronRight } from 'lucide-react';
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
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCard = (cardType: string) => {
    setExpandedCard(expandedCard === cardType ? null : cardType);
  };

  // Portfolio breakdown data
  const activityFeatures = ['New Awards', 'Modifications', 'Pipeline Activity', 'Award Velocity', 'Contract Extensions', 'All Procurement Events'];
  const performanceFeatures = ['Composite Score', 'Revenue Performance', 'Growth Rate', 'Market Share', 'Efficiency Rating', 'Innovation Index'];
  const utilizationFeatures = ['Award Utilization', 'Resource Efficiency', 'Capacity Planning', 'Workforce Optimization'];

  // Mock portfolio entities and their data
  const portfolioEntities = [
    { name: 'Lockheed Martin', uei: 'ABC123DEF456' },
    { name: 'Boeing', uei: 'GHI789JKL012' },
    { name: 'Raytheon', uei: 'MNO345PQR678' },
    { name: 'General Dynamics', uei: 'STU901VWX234' },
    { name: 'Northrop Grumman', uei: 'YZA567BCD890' },
  ];

  // Mock activity data (events count)
  const activityData = {
    'Lockheed Martin': [487, 89, 156, 23, 45, 800],
    'Boeing': [234, 67, 98, 19, 32, 450],
    'Raytheon': [156, 34, 78, 12, 28, 308],
    'General Dynamics': [198, 45, 67, 15, 21, 346],
    'Northrop Grumman': [172, 38, 89, 18, 35, 352],
  };

  // Mock performance data (scores)
  const performanceData = {
    'Lockheed Martin': [85.2, 91.4, 78.6, 82.1, 88.9, 79.3],
    'Boeing': [72.8, 85.2, 69.4, 75.6, 81.2, 74.8],
    'Raytheon': [78.9, 82.1, 74.5, 79.8, 85.6, 77.2],
    'General Dynamics': [81.3, 88.7, 76.2, 83.4, 87.1, 80.5],
    'Northrop Grumman': [79.6, 86.3, 72.8, 81.9, 84.7, 78.9],
  };

  // Mock utilization data (percentages)
  const utilizationData = {
    'Lockheed Martin': [94.2, 87.5, 91.8, 89.6],
    'Boeing': [82.1, 79.3, 85.7, 81.4],
    'Raytheon': [88.9, 84.2, 87.6, 86.1],
    'General Dynamics': [91.3, 88.8, 89.4, 90.1],
    'Northrop Grumman': [85.7, 82.9, 86.3, 84.8],
  };
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
          {/* Enhanced Monitoring Grid - 3 Full Width Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* ACTIVITY - Expandable Compact Grid */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg relative group hover:border-orange-400/40 transition-all">
              {/* Header */}
              <div className="p-4 border-b border-orange-500/20">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-orange-400 uppercase tracking-wider">Portfolio Activity</div>
                  <button
                    onClick={() => toggleCard('activity')}
                    className="text-gray-400 hover:text-orange-400 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-2xl font-bold text-orange-400 mt-2">1,247</div>
                <div className="text-xs text-gray-400">Total Events (12 months)</div>
              </div>

              {/* Portfolio Activity Breakdown */}
              {expandedCard === 'activity' ? (
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-200 mb-3">Portfolio Activity Breakdown</div>

                  {/* Spreadsheet-style table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-600/30">
                          <th className="text-left p-2 text-gray-400 font-medium">Entity</th>
                          {activityFeatures.map((feature) => (
                            <th key={feature} className="text-center p-2 text-orange-400 font-medium min-w-[80px]">
                              {feature}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {portfolioEntities.map((entity) => (
                          <tr key={entity.uei} className="border-b border-gray-700/20 hover:bg-orange-500/5">
                            <td className="p-2 text-gray-300 font-medium">{entity.name}</td>
                            {activityData[entity.name].map((value, index) => (
                              <td key={index} className="p-2 text-center text-gray-200">
                                {value.toLocaleString()}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {/* Portfolio Total Row */}
                        <tr className="border-t-2 border-orange-500/30 bg-orange-500/10">
                          <td className="p-2 text-orange-400 font-bold">Portfolio Total</td>
                          {activityFeatures.map((_, index) => (
                            <td key={index} className="p-2 text-center text-orange-400 font-bold">
                              {portfolioEntities.reduce((sum, entity) => sum + activityData[entity.name][index], 0).toLocaleString()}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  {/* Grayed Out Scale */}
                  <div className="relative h-2 bg-gray-700/30 rounded-full mb-2">
                    <div className="absolute top-0 left-0 h-full bg-gray-600/20 rounded-full w-full"></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Configure thresholds to enable monitoring
                  </div>
                </div>
              )}
            </div>

            {/* PERFORMANCE - Expandable Compact Grid */}
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg relative group hover:border-cyan-400/40 transition-all">
              {/* Header */}
              <div className="p-4 border-b border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-cyan-400 uppercase tracking-wider">Portfolio Performance</div>
                  <button
                    onClick={() => toggleCard('performance')}
                    className="text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-2xl font-bold text-cyan-400 mt-2">78.4</div>
                <div className="text-xs text-gray-400">Aggregate Performance Score</div>
              </div>

              {/* Portfolio Performance Breakdown */}
              {expandedCard === 'performance' ? (
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-200 mb-3">Portfolio Performance Breakdown</div>

                  {/* Spreadsheet-style table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-600/30">
                          <th className="text-left p-2 text-gray-400 font-medium">Entity</th>
                          {performanceFeatures.map((feature) => (
                            <th key={feature} className="text-center p-2 text-cyan-400 font-medium min-w-[80px]">
                              {feature}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {portfolioEntities.map((entity) => (
                          <tr key={entity.uei} className="border-b border-gray-700/20 hover:bg-cyan-500/5">
                            <td className="p-2 text-gray-300 font-medium">{entity.name}</td>
                            {performanceData[entity.name].map((value, index) => (
                              <td key={index} className="p-2 text-center text-gray-200">
                                {value.toFixed(1)}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {/* Portfolio Average Row */}
                        <tr className="border-t-2 border-cyan-500/30 bg-cyan-500/10">
                          <td className="p-2 text-cyan-400 font-bold">Portfolio Average</td>
                          {performanceFeatures.map((_, index) => (
                            <td key={index} className="p-2 text-center text-cyan-400 font-bold">
                              {(portfolioEntities.reduce((sum, entity) => sum + performanceData[entity.name][index], 0) / portfolioEntities.length).toFixed(1)}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  {/* Performance Gradient Scale */}
                  <div className="relative h-2 bg-gray-700/50 rounded-full mb-2">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500/80 via-yellow-500/80 via-[#7ED321]/80 to-green-500/80 rounded-full w-full"></div>
                    <div
                      className="absolute top-0 h-full w-1.5 bg-white rounded-full shadow-md border border-gray-400"
                      style={{ left: '78%' }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Configure thresholds to enable monitoring
                  </div>
                </div>
              )}
            </div>

            {/* UTILIZATION - Expandable Compact Grid */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg relative group hover:border-indigo-400/40 transition-all">
              {/* Header */}
              <div className="p-4 border-b border-indigo-500/20">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-indigo-400 uppercase tracking-wider">Portfolio Utilization</div>
                  <button
                    onClick={() => toggleCard('utilization')}
                    className="text-gray-400 hover:text-indigo-400 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-2xl font-bold text-indigo-400 mt-2">87.2%</div>
                <div className="text-xs text-gray-400">Aggregate Utilization (Inflows)</div>
              </div>

              {/* Portfolio Utilization Breakdown */}
              {expandedCard === 'utilization' ? (
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-200 mb-3">Portfolio Utilization Breakdown</div>

                  {/* Spreadsheet-style table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-600/30">
                          <th className="text-left p-2 text-gray-400 font-medium">Entity</th>
                          {utilizationFeatures.map((feature) => (
                            <th key={feature} className="text-center p-2 text-indigo-400 font-medium min-w-[80px]">
                              {feature}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {portfolioEntities.map((entity) => (
                          <tr key={entity.uei} className="border-b border-gray-700/20 hover:bg-indigo-500/5">
                            <td className="p-2 text-gray-300 font-medium">{entity.name}</td>
                            {utilizationData[entity.name].map((value, index) => (
                              <td key={index} className="p-2 text-center text-gray-200">
                                {value.toFixed(1)}%
                              </td>
                            ))}
                          </tr>
                        ))}
                        {/* Portfolio Average Row */}
                        <tr className="border-t-2 border-indigo-500/30 bg-indigo-500/10">
                          <td className="p-2 text-indigo-400 font-bold">Portfolio Average</td>
                          {utilizationFeatures.map((_, index) => (
                            <td key={index} className="p-2 text-center text-indigo-400 font-bold">
                              {(portfolioEntities.reduce((sum, entity) => sum + utilizationData[entity.name][index], 0) / portfolioEntities.length).toFixed(1)}%
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  {/* Utilization Gradient Scale (Reversed) */}
                  <div className="relative h-2 bg-gray-700/50 rounded-full mb-2">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500/80 via-[#7ED321]/80 via-yellow-500/80 to-red-500/80 rounded-full w-full"></div>
                    <div
                      className="absolute top-0 h-full w-1.5 bg-white rounded-full shadow-md border border-gray-400"
                      style={{ left: '87%' }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Configure thresholds to enable monitoring
                  </div>
                </div>
              )}
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