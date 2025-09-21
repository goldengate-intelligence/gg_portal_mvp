import React from 'react';
import { Card } from "../../../ui/card";
import { GoldengateBarChart } from '../../../../lib/charts';
import { useDesignPatterns } from '../../../../hooks/useDesignPatterns';
import { CONTRACTOR_DETAIL_COLORS } from '../../../../lib/utils';

interface TopRelationshipsPanelProps {
  networkData: any;
}

export function TopRelationshipsPanel({ networkData }: TopRelationshipsPanelProps) {
  const { Typography, PanelWrapper } = useDesignPatterns();

  return (
    <Card className="h-full border-[#F97316]/30 rounded-xl overflow-hidden shadow-2xl hover:border-[#F97316]/50 transition-all duration-500 group relative bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 backdrop-blur-sm">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-5 z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, #F97316 1px, transparent 1px),
            linear-gradient(180deg, #F97316 1px, transparent 1px)
          `,
          backgroundSize: '15px 15px'
        }} />
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-0" style={{ background: 'linear-gradient(135deg, #F9731620, transparent)' }} />
      <div className="p-4 h-full flex flex-col relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3
            className={Typography.panelTitle}
            style={Typography.panelTitleFont}
          >
            TOP RELATIONSHIPS
          </h3>
          {/* Legend */}
          <div className="flex items-center gap-4 text-[10px] text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#9B7EBD' }}></div>
              <span>AGENCIES</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#5BC0EB' }}></div>
              <span>PRIMES</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FF4C4C' }}></div>
              <span>SUBS</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-2">
          {/* Inflows Chart - Left */}
          <div className="w-1/2">
            <GoldengateBarChart
              title="Lifetime Inflows"
              liveIndicator={true}
              liveText="TRACKING"
              height={280}
              data={{
                labels: [
                  'MegaCorp',   // Top prime (money in) - from network data
                  'DOD',        // Agency prime (money in)
                  'Global Def', // Second prime (money in) - from network data
                ],
                datasets: [{
                  label: 'Value ($M)',
                  data: [
                    280,   // MegaCorp Industries (lifetime is higher than network's 250M)
                    165,   // DOD as agency prime (lifetime activity)
                    145,   // Global Defense Systems (lifetime is higher than network's 130M)
                  ],
                  backgroundColor: (context: any) => {
                    const label = context.chart.data.labels[context.dataIndex];
                    // Agencies get lavender, companies get sky blue
                    if (label === 'DOD' || label === 'GSA' || label === 'VA' || label === 'NASA' || label === 'DHS') {
                      return 'rgba(155, 126, 189, 0.7)'; // Lavender for agencies
                    } else {
                      return 'rgba(91, 192, 235, 0.7)'; // Sky blue for companies
                    }
                  },
                  borderColor: (context: any) => {
                    const label = context.chart.data.labels[context.dataIndex];
                    if (label === 'DOD' || label === 'GSA' || label === 'VA' || label === 'NASA' || label === 'DHS') {
                      return '#9B7EBD'; // Lavender for agencies
                    } else {
                      return '#5BC0EB'; // Sky blue for companies
                    }
                  },
                  borderWidth: 2,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                  padding: {
                    left: 5,
                    right: 5,
                    top: -10,
                    bottom: 0
                  }
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    enabled: false,
                    external: function(context: any) {
                      // Get or create tooltip element
                      let tooltipEl = document.getElementById('chartjs-tooltip-inflows');

                      if (!tooltipEl) {
                        tooltipEl = document.createElement('div');
                        tooltipEl.id = 'chartjs-tooltip-inflows';
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
                          min-width: 140px;
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
                        const dataIndex = tooltipModel.dataPoints[0].dataIndex;
                        const label = tooltipModel.dataPoints[0].label;
                        const value = tooltipModel.dataPoints[0].parsed.y;

                        // Determine border color based on bar type
                        const borderColor = (label === 'DOD' || label === 'GSA' || label === 'VA' || label === 'NASA' || label === 'DHS') ? '#9B7EBD' : '#5BC0EB';
                        tooltipEl.style.border = `1px solid ${borderColor}`;

                        // Full names for companies/agencies
                        const fullNames: Record<string, string> = {
                          'MegaCorp': 'MegaCorp Industries',
                          'DOD': 'Department of Defense',
                          'Global Def': 'Global Defense Systems'
                        };

                        const startDates: Record<string, string> = {
                          'MegaCorp': '2019',
                          'DOD': '2018',
                          'Global Def': '2020'
                        };

                        const fullName = fullNames[label] || label;

                        tooltipEl.innerHTML = `
                          <div style="font-weight: bold; margin-bottom: 4px;">${fullName}</div>
                          <div style="color: #9CA3AF; font-size: 11px;">
                            $${Math.round(value)}M | Since ${startDates[label] || '2021'}
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
                    ticks: {
                      color: '#D2AC38',
                      font: { size: 8 },
                      maxRotation: 0,
                      minRotation: 0,
                      autoSkip: false
                    },
                    grid: { color: 'rgba(192, 192, 192, 0.3)' },
                    border: { display: false }
                  },
                  y: {
                    ticks: {
                      color: '#D2AC38',
                      font: { size: 10 },
                      callback: function(value: any) {
                        return '$' + Math.round(value) + 'M';
                      }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    border: { display: false }
                  }
                }
              }}
            />
          </div>

          {/* Outflows Chart - Right */}
          <div className="w-1/2">
            <GoldengateBarChart
              title="Lifetime Outflows"
              liveIndicator={true}
              liveText="TRACKING"
              height={280}
              data={{
                labels: [
                  'Alpha Sol',    // Top sub (money out) - from network data
                  'Beta Tech',    // Second sub (money out) - from network data
                  'Gamma'         // Third sub (money out) - from network data
                ],
                datasets: [{
                  label: 'Value ($M)',
                  data: [
                    12.5,  // Alpha Solutions (money out to subs)
                    8.7,   // Beta Technologies (money out to subs)
                    7.8    // Gamma Corp (money out to subs)
                  ],
                  backgroundColor: 'rgba(255, 76, 76, 0.7)', // Red for outflows
                  borderColor: '#FF4C4C',
                  borderWidth: 2,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                  padding: {
                    left: 5,
                    right: 5,
                    top: -10,
                    bottom: 0
                  }
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    enabled: false,
                    external: function(context: any) {
                      // Get or create tooltip element
                      let tooltipEl = document.getElementById('chartjs-tooltip-outflows');

                      if (!tooltipEl) {
                        tooltipEl = document.createElement('div');
                        tooltipEl.id = 'chartjs-tooltip-outflows';
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
                          min-width: 140px;
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
                        const dataIndex = tooltipModel.dataPoints[0].dataIndex;
                        const label = tooltipModel.dataPoints[0].label;
                        const value = tooltipModel.dataPoints[0].parsed.y;

                        // Set border color for outflows (always red)
                        tooltipEl.style.border = '1px solid #FF4C4C';

                        // Full names for subcontractors
                        const fullNames: Record<string, string> = {
                          'Alpha Sol': 'Alpha Solutions LLC',
                          'Beta Tech': 'Beta Technologies Inc',
                          'Gamma': 'Gamma Corporation'
                        };

                        const startDates: Record<string, string> = {
                          'Alpha Sol': '2020',
                          'Beta Tech': '2021',
                          'Gamma': '2019'
                        };

                        const fullName = fullNames[label] || label;

                        tooltipEl.innerHTML = `
                          <div style="font-weight: bold; margin-bottom: 4px;">${fullName}</div>
                          <div style="color: #9CA3AF; font-size: 11px;">
                            $${Math.round(value)}M | Since ${startDates[label] || '2021'}
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
                    ticks: {
                      color: '#D2AC38',
                      font: { size: 8 },
                      maxRotation: 0,
                      minRotation: 0,
                      autoSkip: false
                    },
                    grid: { color: 'rgba(192, 192, 192, 0.3)' },
                    border: { display: false }
                  },
                  y: {
                    ticks: {
                      color: '#D2AC38',
                      font: { size: 10 },
                      callback: function(value: any) {
                        return '$' + Math.round(value) + 'M';
                      }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    border: { display: false }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}