import React from 'react';
import { Card } from "../../../ui/card";
import { CONTRACTOR_DETAIL_COLORS } from '../../../../logic/utils';
import { GoldengateBubbleChart } from '../../../../ui/charts/components';

interface CompetitivePositionPanelProps {
  benchmarkData: any;
  yAxisMetric: string;
  xAxisMetric: string;
  onYAxisMetricChange: (value: string) => void;
  onXAxisMetricChange: (value: string) => void;
}

export function CompetitivePositionPanel({
  benchmarkData,
  yAxisMetric,
  xAxisMetric,
  onYAxisMetricChange,
  onXAxisMetricChange
}: CompetitivePositionPanelProps) {

  // Helper function to get Y-axis title
  const getYAxisTitle = (metric: string) => {
    const titles: Record<string, string> = {
      'ttm_awards': 'Awards Captured (TTM)',
      'ttm_revenue': 'Estimated Revenue (TTM)',
      'lifetime_awards': 'Lifetime Awards',
      'lifetime_revenue': 'Lifetime Revenue',
      'total_pipeline': 'Total Pipeline',
      'portfolio_duration': 'Portfolio Duration',
      'blended_growth': 'Blended Growth'
    };
    return titles[metric] || 'Financial Performance';
  };

  // Helper function to get X-axis title
  const getXAxisTitle = (metric: string) => {
    const titles: Record<string, string> = {
      'composite_score': 'Composite Score',
      'awards_captured': 'Awards Captured (TTM)',
      'revenue': 'Estimated Revenue (TTM)',
      'pipeline_value': 'Total Pipeline',
      'portfolio_duration': 'Portfolio Duration',
      'blended_growth': 'Blended Growth'
    };
    return titles[metric] || 'Composite Score';
  };

  const getChartTitle = (yMetric: string, xMetric?: string) => {
    // Get the X-axis title
    const xTitle = xMetric ? getXAxisTitle(xMetric) : 'Composite Score';
    // Get the Y-axis title
    const yTitle = getYAxisTitle(yMetric);
    return `${yTitle} vs ${xTitle}`;
  };

  // Helper function to get X-axis value for bubble chart based on selected metric
  const getXAxisValue = (metric: string) => {
    // These values should match the Performance Scores subscores
    const xValues: Record<string, number> = {
      'composite_score': 80,
      'awards_captured': 82,
      'revenue': 76,
      'pipeline_value': 91,
      'portfolio_duration': 68,
      'blended_growth': 85
    };
    return xValues[metric] || 80;
  };

  // Generate peer data for X-axis
  const generatePeerDataForXAxis = (xMetric: string) => {
    return Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * 100, // Random percentile score
      y: (() => {
        if (yAxisMetric === 'portfolio_duration') {
          return Math.random() * 6 + 1; // 1-7 years
        } else if (yAxisMetric === 'blended_growth') {
          return Math.random() * 40 - 10; // -10% to 30%
        } else {
          return Math.random() * 500 + 50; // 50M to 550M
        }
      })(),
      r: 2
    }));
  };

  return (
    <div className="min-h-[55vh]">
      {/* Cross-Sectional Performance - Full Width */}
      <div className="w-full">
        <Card className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative border border-[#D2AC38]/50 hover:border-[#D2AC38]/90" style={{ backgroundColor: '#111726' }}>
          <div className="p-4 h-full flex flex-col relative z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold tracking-wide mb-3 text-gray-200 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
                COMPETITIVE POSITION
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-400">Y-Axis:</span>
                  <select
                    className="bg-black/60 border border-[#D2AC38] text-white text-xs px-2 py-1 rounded font-light focus:border-[#D2AC38] focus:outline-none"
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    value={yAxisMetric}
                    onChange={(e) => onYAxisMetricChange(e.target.value)}
                  >
                    <option value="ttm_awards">Awards Captured (TTM)</option>
                    <option value="ttm_revenue">Estimated Revenue (TTM)</option>
                    <option value="lifetime_awards">Lifetime Awards</option>
                    <option value="lifetime_revenue">Lifetime Revenue</option>
                    <option value="total_pipeline">Total Pipeline</option>
                    <option value="portfolio_duration">Portfolio Duration</option>
                    <option value="blended_growth">Blended Growth Rate</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-400">X-Axis:</span>
                  <select
                    className="bg-black/60 border border-[#D2AC38] text-white text-xs px-2 py-1 rounded font-light focus:border-[#D2AC38] focus:outline-none"
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    value={xAxisMetric}
                    onChange={(e) => onXAxisMetricChange(e.target.value)}
                  >
                    <option value="composite_score">Composite Score</option>
                    <option value="awards_captured">Awards Captured (TTM)</option>
                    <option value="revenue">Estimated Revenue (TTM)</option>
                    <option value="pipeline_value">Total Pipeline</option>
                    <option value="portfolio_duration">Portfolio Duration</option>
                    <option value="blended_growth">Blended Growth</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <GoldengateBubbleChart
                title={getChartTitle(yAxisMetric, xAxisMetric)}
                liveIndicator={true}
                liveText="TRACKING"
                height={350}
                data={{
                  datasets: [{
                    label: 'Peer Entities',
                    data: generatePeerDataForXAxis(xAxisMetric),
                    backgroundColor: 'rgba(255, 68, 68, 0.6)',
                    borderColor: '#FF4444',
                    borderWidth: 1,
                  }, {
                    label: 'Trio Fabrication LLC',
                    data: [{
                      x: getXAxisValue(xAxisMetric),
                      y: (() => {
                        if (yAxisMetric === 'portfolio_duration') {
                          return 3.2; // Average portfolio duration in years
                        } else if (yAxisMetric === 'blended_growth') {
                          return 24; // 24% growth
                        } else {
                          return 300; // Default value in millions
                        }
                      })(),
                      r: 4
                    }],
                    backgroundColor: 'rgba(210, 172, 56, 0.8)',
                    borderColor: '#D2AC38',
                    borderWidth: 2,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'bottom' as const,
                      labels: {
                        color: '#D2AC38',
                        font: { family: 'sans-serif', size: 12 },
                        usePointStyle: true,
                        padding: 10,
                        pointStyle: 'circle',
                        boxWidth: 6,
                        boxHeight: 6
                      }
                    },
                    tooltip: {
                      enabled: false,
                      external: function(context: any) {
                        // Get or create tooltip element
                        let tooltipEl = document.getElementById('chartjs-tooltip-competitive');

                        if (!tooltipEl) {
                          tooltipEl = document.createElement('div');
                          tooltipEl.id = 'chartjs-tooltip-competitive';
                          tooltipEl.style.cssText = `
                            background: rgba(0, 0, 0, 0.95);
                            border-radius: 6px;
                            color: white;
                            opacity: 1;
                            pointer-events: none;
                            position: absolute;
                            transform: translate(-50%, 0);
                            transition: all .1s ease;
                            font-family: system-ui, -apple-system, sans-serif;
                            font-size: 12px;
                            padding: 8px 12px;
                            z-index: 9999;
                            min-width: 200px;
                          `;
                          document.body.appendChild(tooltipEl);
                        }

                        // Hide if no tooltip
                        const tooltipModel = context.tooltip;
                        if (tooltipModel.opacity === 0) {
                          tooltipEl.style.opacity = '0';
                          return;
                        }

                        // Get data
                        if (tooltipModel.body) {
                          const datasetIndex = tooltipModel.dataPoints[0].datasetIndex;
                          const datasetLabel = context.chart.data.datasets[datasetIndex].label;
                          const isPeerEntity = datasetLabel === 'Peer Entities';

                          const entityName = isPeerEntity ? 'Peer Entity' : datasetLabel;
                          const uei = isPeerEntity ? 'PEER' + Math.floor(Math.random() * 100000) : 'TFL123456789';

                          // Set border color to match the dot color
                          const borderColor = isPeerEntity ? '#FF4444' : '#D2AC38';
                          tooltipEl.style.border = `1px solid ${borderColor}`;

                          const xAxisLabel = getXAxisTitle(xAxisMetric);
                          const yAxisLabel = getYAxisTitle(yAxisMetric);
                          const xValue = Math.round(tooltipModel.dataPoints[0].parsed.x);

                          // Format Y-value based on metric type
                          let yValue;
                          if (yAxisMetric === 'portfolio_duration') {
                            yValue = tooltipModel.dataPoints[0].parsed.y.toFixed(1) + ' yrs';
                          } else if (yAxisMetric === 'blended_growth') {
                            yValue = tooltipModel.dataPoints[0].parsed.y.toFixed(1) + '%';
                          } else {
                            yValue = '$' + Math.round(tooltipModel.dataPoints[0].parsed.y) + 'M';
                          }

                          // Set colors based on entity type
                          const xValueColor = isPeerEntity ? '#FF4444' : '#FFFFFF';
                          const yValueColor = '#D2AC38';

                          tooltipEl.innerHTML = `
                            <div style="font-weight: bold; margin-bottom: 6px; color: #D2AC38;">${entityName}</div>
                            <div style="color: #9CA3AF; font-size: 10px; margin-bottom: 8px;">${uei}</div>
                            <div style="font-size: 11px;">
                              <div style="margin-bottom: 2px; display: flex; justify-content: space-between;"><span>${xAxisLabel}:</span> <span style="color: ${xValueColor}; font-weight: bold;">${xValue}</span></div>
                              <div style="display: flex; justify-content: space-between;"><span>${yAxisLabel}:</span> <span style="color: ${yValueColor}; font-weight: bold;">${yValue}</span></div>
                            </div>
                          `;
                        }

                        const position = context.chart.canvas.getBoundingClientRect();

                        tooltipEl.style.opacity = '1';
                        tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                        tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                      }
                    }
                  },
                  scales: {
                    x: {
                      type: 'linear' as const,
                      position: 'bottom' as const,
                      title: {
                        display: true,
                        text: 'Percentile Score',
                        color: '#9CA3AF',
                        font: { size: 12 }
                      },
                      ticks: {
                        color: '#D2AC38',
                        font: { size: 10 }
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                      }
                    },
                    y: {
                      type: 'linear' as const,
                      title: {
                        display: true,
                        text: 'Value',
                        color: '#9CA3AF',
                        font: { size: 12 }
                      },
                      ticks: {
                        color: '#D2AC38',
                        font: { size: 10 },
                        callback: function(value: any) {
                          if (yAxisMetric === 'portfolio_duration') {
                            return value.toFixed(1) + ' yrs';
                          } else if (yAxisMetric === 'blended_growth') {
                            return value.toFixed(1) + '%';
                          } else {
                            return '$' + Math.round(value) + 'M';
                          }
                        }
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}