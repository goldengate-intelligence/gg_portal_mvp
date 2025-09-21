import React from 'react';
import { PerformanceSummaryPanel } from './PerformanceSummaryPanel';
import { CompetitivePositionPanel } from './CompetitivePositionPanel';

interface PerformanceTabProps {
  performanceData: any;
  benchmarkData: any;
  yAxisMetric: string;
  xAxisMetric: string;
  onYAxisMetricChange: (value: string) => void;
  onXAxisMetricChange: (value: string) => void;
}

export function PerformanceTab({
  performanceData,
  benchmarkData,
  yAxisMetric,
  xAxisMetric,
  onYAxisMetricChange,
  onXAxisMetricChange
}: PerformanceTabProps) {

  return (
    <div className="space-y-6">
      {performanceData && performanceData.metrics && Array.isArray(performanceData.metrics) && performanceData.metrics.length > 0 ? (
        <>
          {/* Performance Summary - Full Width Panel */}
          <div className="w-full mb-6">
            <PerformanceSummaryPanel
              performanceData={performanceData}
            />
          </div>

          {/* Competitive Position Panel */}
          <div className="w-full">
            <CompetitivePositionPanel
              benchmarkData={benchmarkData}
              yAxisMetric={yAxisMetric}
              xAxisMetric={xAxisMetric}
              onYAxisMetricChange={onYAxisMetricChange}
              onXAxisMetricChange={onXAxisMetricChange}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 text-center">
            <div className="text-lg mb-2">No Performance Data Available</div>
            <div className="text-sm">Performance metrics will appear here when data is loaded.</div>
          </div>
        </div>
      )}
    </div>
  );
}