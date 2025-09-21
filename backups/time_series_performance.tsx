/**
 * TIME-SERIES PERFORMANCE PANEL BACKUP
 * Saved: 2024-12-16
 *
 * This backup contains the TIME-SERIES PERFORMANCE panel from contractor-detail.tsx with:
 * - Dynamic time period controls (Month/Quarter/Year and 1/2/3/5 Year ranges)
 * - Combined bar and line chart visualization
 * - Optimized date label sizing and chart spacing
 * - Legend positioned at bottom of panel
 * - Responsive grid positioning in 2-column layout
 */

{/* Panel: Time-Series Performance (Left) */}
<div className="col-span-1">
  <HudCard variant="default" priority="medium" isPanel={true} className="h-full  border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-200 font-normal tracking-wider uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
          TIME-SERIES PERFORMANCE ({revenueTimePeriod}Y)
        </h3>
        <div className="flex items-center gap-2">
          <select
            className="bg-black/60 border border-gray-400 text-white text-xs px-2 py-1 rounded font-light focus:border-white focus:outline-none !text-white !border-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            value={revenueTimeAggregation}
            onChange={(e) => setRevenueTimeAggregation(e.target.value)}
          >
            <option value="M">Month</option>
            <option value="Q">Quarter</option>
            <option value="Y">Year</option>
          </select>
          <select
            className="bg-black/60 border border-gray-400 text-white text-xs px-2 py-1 rounded font-light focus:border-white focus:outline-none !text-white !border-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            value={revenueTimePeriod}
            onChange={(e) => setRevenueTimePeriod(e.target.value)}
          >
            <option value="1">1 Year</option>
            <option value="2">2 Years</option>
            <option value="3">3 Years</option>
            <option value="5">5 Years</option>
          </select>
        </div>
      </div>
      <div className="flex-1">
        <GoldengateBarChart
          title="Awards & Revenue History"
          liveIndicator={true}
          liveText="TRACKING"
          height={280}
          data={{
            labels: getFilteredRevenueData().map((d: any) => formatDate(d.monthYear)),
            datasets: [
              {
                type: 'bar' as const,
                label: 'Award Value  ',  // 2 spaces added for legend separation
                data: getFilteredRevenueData().map((d: any) => parseFloat(d.monthlyRevenue) / 1000000),
                backgroundColor: 'rgba(78, 201, 176, 0.7)',
                borderColor: '#4EC9B0',
                borderWidth: 1,
                yAxisID: 'y',
              },
              {
                type: 'line' as const,
                label: 'Smoothed Revenue',
                data: getFilteredRevenueData().map((d: any, index: number) => {
                  const baseValue = parseFloat(d.monthlyRevenue) / 1000000;
                  return baseValue * (1 + (index * 0.02)); // Simple growth projection
                }),
                backgroundColor: 'rgba(210, 172, 56, 0.4)',
                borderColor: '#D2AC38',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointBackgroundColor: '#D2AC38',
                pointBorderColor: '#D2AC38',
                pointRadius: 4,
                yAxisID: 'y',
              }
            ]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            elements: {
              line: {
                borderWidth: 0
              }
            },
            layout: {
              padding: {
                left: 5,
                right: 5,
                top: -10,    // Negative top padding to maximize chart space
                bottom: -10  // Negative bottom padding to push legend down
              }
            },
            interaction: {
              mode: 'index' as const,
              intersect: false,
            },
            plugins: {
              legend: {
                display: true,
                position: 'bottom' as const,
                labels: {
                  color: '#D2AC38',
                  font: { size: 12 },
                  padding: 2,
                  boxWidth: 4,    // Small 4x4 circles for legend items
                  boxHeight: 4,
                  usePointStyle: true  // Use actual chart point styles
                }
              },
              tooltip: {
                enabled: true
              }
            },
            scales: {
              x: {
                ticks: {
                  color: '#D2AC38',
                  font: { family: 'system-ui, -apple-system, sans-serif', size: 7 },  // Very small date labels
                  maxRotation: 45,
                  minRotation: 45,
                  autoSkip: false  // Show all dates
                },
                grid: {
                  color: 'rgba(192, 192, 192, 0.3)',
                  drawBorder: false
                }
              },
              y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                border: {
                  display: false
                },
                ticks: {
                  color: '#D2AC38',
                  font: { family: 'system-ui, -apple-system, sans-serif', size: 10 },
                  callback: function(value: any) { return '$' + value + 'M'; }
                },
                grid: {
                  color: 'rgba(192, 192, 192, 0.3)',
                  drawBorder: false,
                  borderColor: 'transparent',
                  borderWidth: 0
                }
              }
            }
          }}
        />
      </div>
    </div>
  </HudCard>
</div>

/**
 * KEY IMPLEMENTATION NOTES:
 *
 * 1. POSITIONING:
 *    - Located in OVERVIEW tab (moved from PERFORMANCE tab)
 *    - LEFT position in 2-column grid (col-span-1)
 *    - Paired with AGENCY RELATIONSHIPS panel on right
 *    - Part of bottom row in 4-column main grid
 *
 * 2. PANEL STRUCTURE:
 *    - HudCard wrapper with standard panel styling
 *    - overflow-hidden to maintain clean boundaries
 *    - p-4 padding (16px) on inner container
 *    - flex-col layout with flex-1 chart container
 *
 * 3. CONTROLS:
 *    - Two select dropdowns in header:
 *      - Time aggregation: Month/Quarter/Year
 *      - Time period: 1/2/3/5 Years
 *    - Controls update revenueTimeAggregation and revenueTimePeriod state
 *    - Dynamically updates chart title with selected period
 *
 * 4. CHART CONFIGURATION:
 *    - Height: 280px (increased from 240px for more graph space)
 *    - Combined chart with bar (Award Value) and line (Smoothed Revenue)
 *    - Bar chart: Teal color (#4EC9B0) with 0.7 opacity
 *    - Line chart: Gold color (#D2AC38) with smooth tension
 *
 * 5. SPACE OPTIMIZATION:
 *    - X-axis date labels: 7px font size with 45° rotation
 *    - Y-axis value labels: 10px font size
 *    - Legend: 12px font with 4x4 circle indicators
 *    - Layout padding: -10 top and bottom to maximize chart area
 *    - autoSkip: false to show all date labels
 *
 * 6. LEGEND POSITIONING:
 *    - Position: bottom of chart area
 *    - Small 4x4 circles with usePointStyle: true
 *    - 2 spaces added after "Award Value" for separation
 *    - 12px font size for readability
 *
 * 7. DATA PROCESSING:
 *    - getFilteredRevenueData() filters based on selected period
 *    - formatDate() formats monthYear for display
 *    - Values divided by 1,000,000 to show in millions
 *    - Line data includes 2% growth projection per period
 *
 * 8. REQUIRED IMPORTS/DEPENDENCIES:
 *    - GoldengateBarChart component (custom chart wrapper)
 *    - HudCard component for panel styling
 *    - State variables: revenueTimePeriod, revenueTimeAggregation
 *    - Functions: getFilteredRevenueData(), formatDate()
 *
 * 9. IMPORTANT FIX APPLIED:
 *    - GoldengateBarChart component was modified to respect custom options
 *    - Removed forced legend configuration from component
 *    - Allows custom legend positioning and styling to work properly
 *
 * 10. RESPONSIVE BEHAVIOR:
 *     - col-span-1 in 2-column grid layout
 *     - Chart maintains aspect ratio: false
 *     - Responsive: true for automatic resizing
 *     - Text sizes optimized for readability at various sizes
 */