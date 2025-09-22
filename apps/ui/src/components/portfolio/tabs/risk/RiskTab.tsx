import React, { useState } from 'react';
import { Button } from '../../../ui/button';
import { Shield, Bot, Settings, Plus, X, Check } from 'lucide-react';
import { useAgentChatContext } from '../../../../contexts/agent-chat-context';

// Design Framework Components - Indigo Theme (removed unused ExternalPanelContainer)

const InternalContentContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 h-full flex flex-col relative z-10">
    {children}
  </div>
);

// Chart-Style Container
// IMPORTANT: OFFICIAL GUNMETAL COLOR = #223040
const ChartStyleContainer = ({ children }: { children: React.ReactNode }) => (
  <div
    className="rounded-lg p-4"
    style={{
      backgroundColor: '#223040'
    }}
  >
    {children}
  </div>
);

const PanelTitle = ({ children }: { children: React.ReactNode }) => (
  <h3
    className="text-gray-200 font-normal uppercase tracking-wider"
    style={{
      fontFamily: 'Genos, sans-serif',
      fontSize: '18px',
      letterSpacing: '0.0125em'
    }}
  >
    {children}
  </h3>
);

export function RiskTab() {
  const chatContext = useAgentChatContext();
  const [showFilterSettings, setShowFilterSettings] = useState(false);
  const [filterSettings, setFilterSettings] = useState({
    activity: {
      redThreshold: 10, // Flash red when new events exceed this
    },
    performance: {
      greenMin: 80,    // Green above this
      yellowMin: 60,   // Yellow between yellowMin and greenMin
      redBelow: 60     // Red below this
    },
    utilization: {
      redAbove: 90,    // Red above this
      yellowMin: 70,   // Yellow between yellowMin and redAbove
      greenBelow: 70   // Green below this
    }
  });

  const [tempSettings, setTempSettings] = useState(filterSettings);

  const handleAIConfigureClick = () => {
    console.log('AI Configure button clicked');
    console.log('Chat context:', chatContext);

    // Open AI chat with risk monitoring configuration context
    chatContext.open({
      entityId: 'risk-monitoring',
      entityType: 'risk_configuration',
      entityName: 'Risk Monitoring Dashboard'
    });

    console.log('Chat context open called');
  };

  return (
    <div className="min-h-[500px] flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="border border-[#8B8EFF]/30 rounded-xl hover:border-[#8B8EFF]/50 transition-all duration-500">
          <InternalContentContainer>

          {/* Content Section */}
          <div className="flex-1">
            {/* Chart-Style Container */}
            <ChartStyleContainer>
              {/* Chart Header */}
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
                  {/* Top Row - Activity, Performance, Utilization with Visual Indicators */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    {/* ACTIVITY - Far Left, with threshold visualization */}
                    <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg relative">
                      <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">ACTIVITY</div>
                      <div className="text-2xl font-bold text-gray-400 mb-3">12</div>

                      {/* Activity Threshold Bar */}
                      <div className="relative h-2 bg-gray-700/50 rounded-full mb-2">
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full w-full opacity-40"></div>
                        {/* Current position indicator */}
                        <div
                          className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg"
                          style={{ left: `${Math.min((12 / filterSettings.activity.redThreshold) * 100, 100)}%` }}
                        ></div>
                        {/* Threshold marker */}
                        <div
                          className="absolute top-0 h-full w-0.5 bg-red-400 rounded-full"
                          style={{ left: '100%' }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {12 > filterSettings.activity.redThreshold ? 'Alert threshold exceeded' : `${filterSettings.activity.redThreshold - 12} events until alert`}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">Threshold: {filterSettings.activity.redThreshold}</div>
                    </div>

                    {/* PERFORMANCE - Middle, with percentile visualization */}
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg relative">
                      <div className="text-xs text-green-400 mb-2 uppercase tracking-wider">PERFORMANCE</div>
                      <div className="text-2xl font-bold text-green-400 mb-3">87th</div>

                      {/* Performance Percentile Bar */}
                      <div className="relative h-2 bg-gray-700/50 rounded-full mb-2">
                        {/* Color segments based on thresholds */}
                        <div className="absolute top-0 left-0 h-full bg-red-500 rounded-l-full" style={{ width: `${filterSettings.performance.yellowMin}%` }}></div>
                        <div className="absolute top-0 h-full bg-yellow-500" style={{ left: `${filterSettings.performance.yellowMin}%`, width: `${filterSettings.performance.greenMin - filterSettings.performance.yellowMin}%` }}></div>
                        <div className="absolute top-0 h-full bg-green-500 rounded-r-full" style={{ left: `${filterSettings.performance.greenMin}%`, width: `${100 - filterSettings.performance.greenMin}%` }}></div>

                        {/* Current position indicator */}
                        <div
                          className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg"
                          style={{ left: '87%' }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400">Above {filterSettings.performance.greenMin}th percentile (Green Zone)</div>
                      <div className="text-[11px] text-gray-500 mt-1">Thresholds: {filterSettings.performance.yellowMin} | {filterSettings.performance.greenMin}</div>
                    </div>

                    {/* UTILIZATION - Far Right, with capacity visualization */}
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg relative">
                      <div className="text-xs text-red-400 mb-2 uppercase tracking-wider">UTILIZATION</div>
                      <div className="text-2xl font-bold text-red-400 mb-3">94%</div>

                      {/* Utilization Capacity Bar */}
                      <div className="relative h-2 bg-gray-700/50 rounded-full mb-2">
                        {/* Color segments based on thresholds */}
                        <div className="absolute top-0 left-0 h-full bg-green-500 rounded-l-full" style={{ width: `${filterSettings.utilization.yellowMin}%` }}></div>
                        <div className="absolute top-0 h-full bg-yellow-500" style={{ left: `${filterSettings.utilization.yellowMin}%`, width: `${filterSettings.utilization.redAbove - filterSettings.utilization.yellowMin}%` }}></div>
                        <div className="absolute top-0 h-full bg-red-500 rounded-r-full" style={{ left: `${filterSettings.utilization.redAbove}%`, width: `${100 - filterSettings.utilization.redAbove}%` }}></div>

                        {/* Current position indicator */}
                        <div
                          className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg"
                          style={{ left: '94%' }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400">Above {filterSettings.utilization.redAbove}% critical limit (Red Zone)</div>
                      <div className="text-[11px] text-gray-500 mt-1">Thresholds: {filterSettings.utilization.yellowMin}% | {filterSettings.utilization.redAbove}%</div>
                    </div>
                  </div>

                  {/* Portfolio Status Summary */}
                  <div className="mb-6 p-4 bg-gray-800/30 border border-gray-700/40 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-200">Portfolio Risk Assessment</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="text-gray-400">Low Activity</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-green-400">High Performance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span className="text-red-400">Critical Utilization</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configuration Buttons */}
                  <div className="flex gap-3 justify-end">
                    <Button
                      onClick={handleAIConfigureClick}
                      className="bg-[#8B8EFF]/20 hover:bg-[#8B8EFF]/30 text-[#8B8EFF] border border-[#8B8EFF]/40 hover:border-[#8B8EFF]/60 transition-all duration-200"
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      AI Configuration
                    </Button>
                    <Button
                      onClick={() => setShowFilterSettings(true)}
                      className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Filter Settings
                    </Button>
                  </div>
                </div>
              </div>
            </ChartStyleContainer>
          </div>
        </InternalContentContainer>
        </div>
      </div>

      {/* Filter Settings Modal */}
      {showFilterSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-[#8B8EFF]/30 rounded-xl p-6 w-full max-w-5xl max-h-[80vh] overflow-y-auto my-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-200">Filter Settings</h3>
              <Button
                onClick={() => setShowFilterSettings(false)}
                className="h-8 w-8 p-0 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Settings Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity Alert */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Activity Alert Threshold
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-red-400 w-16">RED {'>'}</span>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={tempSettings.activity.redThreshold}
                      onChange={(e) => setTempSettings(prev => ({
                        ...prev,
                        activity: { ...prev.activity, redThreshold: parseInt(e.target.value) }
                      }))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-gray-400 w-12">{tempSettings.activity.redThreshold}</span>
                  </div>
                  <p className="text-xs text-gray-500">Flash red when new events exceed this number</p>
                </div>
              </div>

              {/* Performance Ranges */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Performance Thresholds (percentile)
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-green-400 w-16">GREEN {'>'}</span>
                    <input
                      type="range"
                      min="70"
                      max="100"
                      value={tempSettings.performance.greenMin}
                      onChange={(e) => setTempSettings(prev => ({
                        ...prev,
                        performance: { ...prev.performance, greenMin: parseInt(e.target.value) }
                      }))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-gray-400 w-12">{tempSettings.performance.greenMin}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-yellow-400 w-16">YELLOW</span>
                    <span className="text-xs text-gray-500 flex-1">{tempSettings.performance.yellowMin} - {tempSettings.performance.greenMin}</span>
                    <input
                      type="range"
                      min="40"
                      max="80"
                      value={tempSettings.performance.yellowMin}
                      onChange={(e) => setTempSettings(prev => ({
                        ...prev,
                        performance: { ...prev.performance, yellowMin: parseInt(e.target.value) }
                      }))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-gray-400 w-12">{tempSettings.performance.yellowMin}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-red-400 w-16">RED {'<'}</span>
                    <span className="text-xs text-gray-500 flex-1">Below {tempSettings.performance.yellowMin}</span>
                  </div>
                </div>
              </div>

              {/* Utilization Ranges */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Utilization Thresholds (%)
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-red-400 w-16">RED {'>'}</span>
                    <input
                      type="range"
                      min="80"
                      max="100"
                      value={tempSettings.utilization.redAbove}
                      onChange={(e) => setTempSettings(prev => ({
                        ...prev,
                        utilization: { ...prev.utilization, redAbove: parseInt(e.target.value) }
                      }))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-gray-400 w-12">{tempSettings.utilization.redAbove}%</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-yellow-400 w-16">YELLOW</span>
                    <span className="text-xs text-gray-500 flex-1">{tempSettings.utilization.yellowMin}% - {tempSettings.utilization.redAbove}%</span>
                    <input
                      type="range"
                      min="50"
                      max="90"
                      value={tempSettings.utilization.yellowMin}
                      onChange={(e) => setTempSettings(prev => ({
                        ...prev,
                        utilization: { ...prev.utilization, yellowMin: parseInt(e.target.value) }
                      }))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-gray-400 w-12">{tempSettings.utilization.yellowMin}%</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-green-400 w-16">GREEN {'<'}</span>
                    <span className="text-xs text-gray-500 flex-1">Below {tempSettings.utilization.yellowMin}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setTempSettings(filterSettings); // Reset to original
                  setShowFilterSettings(false);
                }}
                className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setFilterSettings(tempSettings); // Save changes
                  setShowFilterSettings(false);
                }}
                className="flex-1 bg-[#8B8EFF]/20 hover:bg-[#8B8EFF]/30 text-[#8B8EFF] border border-[#8B8EFF]/40"
              >
                <Check className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}