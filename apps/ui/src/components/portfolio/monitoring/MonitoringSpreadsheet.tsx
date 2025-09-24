import React, { useMemo } from 'react';
import { ArrowLeft, Database, Download, BarChart3 } from 'lucide-react';
import { portfolioAssets } from '../tabs/risk/logic/portfolioAssets';

interface MonitoringSpreadsheetProps {
  type: 'performance' | 'activity' | 'utilization';
}

// Column definitions for each monitoring type
const getColumns = (type: string) => {
  switch (type) {
    case 'performance':
      return [
        'Composite Score',
        'Awards Captured (TTM)',
        'Estimated Revenue (TTM)',
        'Estimated Total Pipeline',
        'Portfolio Duration',
        'Blended Growth Score'
      ];
    case 'activity':
      return [
        'New Awards',
        'Modifications',
        'Pipeline Activity',
        'Award Velocity',
        'Contract Extensions',
        'All Procurement Events'
      ];
    case 'utilization':
      return [
        'Award Utilization',
        'Resource Efficiency',
        'Capacity Planning',
        'Workforce Optimization'
      ];
    default:
      return [];
  }
};

// Generate mock data for contractors sorted by active awards (descending)
const generateMockData = (type: string) => {
  const contractors = [
    { name: 'Lockheed Martin', activeAwards: 487000000 },
    { name: 'Boeing', activeAwards: 234000000 },
    { name: 'General Dynamics', activeAwards: 198000000 },
    { name: 'Northrop Grumman', activeAwards: 172000000 },
    { name: 'Raytheon', activeAwards: 156000000 },
  ].sort((a, b) => b.activeAwards - a.activeAwards);

  const columns = getColumns(type);

  return contractors.map(contractor => {
    const data = [contractor.name];

    // Generate mock values based on type
    columns.forEach((_, index) => {
      switch (type) {
        case 'performance':
          const perfValues = [
            (70 + Math.random() * 30).toFixed(1), // Composite Score
            '$' + (contractor.activeAwards / 1000000 * (0.8 + Math.random() * 0.4)).toFixed(1) + 'M', // Awards Captured
            '$' + (contractor.activeAwards / 1000000 * (0.6 + Math.random() * 0.8)).toFixed(1) + 'M', // Revenue
            '$' + (contractor.activeAwards / 1000000 * (1.5 + Math.random() * 2)).toFixed(1) + 'M', // Pipeline
            (2 + Math.random() * 4).toFixed(1) + ' yrs', // Duration
            (Math.random() * 20 - 10).toFixed(1) + '%' // Growth
          ];
          data.push(perfValues[index]);
          break;
        case 'activity':
          const activityValues = [
            Math.floor(contractor.activeAwards / 5000000 * (0.8 + Math.random() * 0.4)), // New Awards
            Math.floor(contractor.activeAwards / 8000000 * (0.6 + Math.random() * 0.8)), // Modifications
            Math.floor(contractor.activeAwards / 6000000 * (0.7 + Math.random() * 0.6)), // Pipeline Activity
            Math.floor(contractor.activeAwards / 10000000 * (0.5 + Math.random() * 1)), // Award Velocity
            Math.floor(contractor.activeAwards / 12000000 * (0.4 + Math.random() * 1.2)), // Contract Extensions
            Math.floor(contractor.activeAwards / 3000000 * (1.2 + Math.random() * 0.6)) // All Events
          ];
          data.push(activityValues[index].toLocaleString());
          break;
        case 'utilization':
          const utilValues = [
            (60 + Math.random() * 35).toFixed(1) + '%', // Award Utilization
            (70 + Math.random() * 25).toFixed(1) + '%', // Resource Efficiency
            (65 + Math.random() * 30).toFixed(1) + '%', // Capacity Planning
            (55 + Math.random() * 40).toFixed(1) + '%'  // Workforce Optimization
          ];
          data.push(utilValues[index]);
          break;
      }
    });

    return data;
  });
};

const getTypeConfig = (type: string) => {
  switch (type) {
    case 'performance':
      return {
        title: 'Portfolio Performance Monitoring',
        color: 'cyan',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/20',
        textColor: 'text-cyan-400'
      };
    case 'activity':
      return {
        title: 'Portfolio Activity Monitoring',
        color: 'orange',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        textColor: 'text-orange-400'
      };
    case 'utilization':
      return {
        title: 'Portfolio Utilization Monitoring',
        color: 'indigo',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/20',
        textColor: 'text-indigo-400'
      };
    default:
      return {
        title: 'Portfolio Monitoring',
        color: 'gray',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/20',
        textColor: 'text-gray-400'
      };
  }
};

export function MonitoringSpreadsheet({ type }: MonitoringSpreadsheetProps) {
  const columns = useMemo(() => getColumns(type), [type]);
  const data = useMemo(() => generateMockData(type), [type]);
  const config = useMemo(() => getTypeConfig(type), [type]);

  const handleBack = () => {
    window.history.back();
  };

  const handleExport = () => {
    console.log('Exporting monitoring data...');
  };

  return (
    <div className="min-h-[500px] flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Monitoring Dashboard
          </button>
        </div>

        {/* Monitoring Spreadsheet Container */}
        <div className="rounded-xl">
          <div className="rounded-xl p-4" style={{ backgroundColor: '#223040' }}>
            <div className="relative h-full">
              {/* Title */}
              <div className="absolute top-0 left-0 z-10">
                <h3 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                  {config.title}
                </h3>
              </div>

              {/* Live Indicator */}
              <div className="absolute top-0 right-0 z-10 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                  LIVE
                </span>
              </div>

              {/* Export Button */}
              <div className="absolute top-0 right-20 z-10">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Export
                </button>
              </div>

              {/* Spreadsheet Content */}
              <div className="pt-8">
                {/* Results Panel - Discovery Engine Style */}
                <div className="border border-gray-700 rounded-lg bg-gray-800">
                  {/* Results Tabs */}
                  <div className="bg-gray-800 border-b border-gray-700/50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex">
                        <button className="px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 text-blue-400 border-blue-400 bg-blue-500/10">
                          <Database className="w-4 h-4" />
                          Results
                        </button>
                        <button className="px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 text-gray-400 border-transparent hover:text-gray-300">
                          <BarChart3 className="w-4 h-4" />
                          Chart
                        </button>
                      </div>
                      <div className="text-xs text-gray-400">
                        {data.length} contractors • Sorted by active awards value
                      </div>
                    </div>
                  </div>

                  {/* Spreadsheet Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-900/50">
                        <tr>
                          <th className="text-left p-3 text-gray-300 font-medium border-b border-gray-700/50">
                            Portfolio
                          </th>
                          {columns.map((column, index) => (
                            <th key={index} className={`text-center p-3 ${config.textColor} font-medium border-b border-gray-700/50 min-w-[120px]`}>
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-700/30 transition-colors border-b border-gray-800/50">
                            <td className="p-3 text-white font-medium">
                              {row[0]}
                            </td>
                            {row.slice(1).map((cell, cellIndex) => (
                              <td key={cellIndex} className="p-3 text-center text-gray-200">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer Stats */}
                  <div className="bg-gray-900/50 border-t border-gray-700/50 p-3">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div>
                        Query executed in 127ms
                      </div>
                      <div>
                        Total portfolio value: ${data.reduce((sum, row) => sum + Math.random() * 100, 0).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}