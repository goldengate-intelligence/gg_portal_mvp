/**
 * AGENCY RELATIONSHIPS PANEL BACKUP
 * Saved: 2024-12-16
 *
 * This backup contains the AGENCY RELATIONSHIPS panel from contractor-detail.tsx with:
 * - Static bar chart showing agency distribution
 * - Optimized sizing to match TIME-SERIES PERFORMANCE panel
 * - No legend display for cleaner appearance
 * - Responsive grid positioning in 2-column layout
 */

{/* Agency Distribution (Right) */}
<div className="col-span-1">
  <HudCard variant="default" priority="medium" isPanel={true} className="h-full  border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
    <div className="p-4 h-full flex flex-col">
      <h3 className="text-gray-200 font-normal tracking-wider mb-4 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
        AGENCY RELATIONSHIPS
      </h3>
      <div className="flex-1">
        <GoldengateBarChart
          title="Lifetime Awards"
          liveIndicator={true}
          liveText="TRACKING"
          height={280}
          data={{
            labels: ['DOD', 'GSA', 'VA', 'NASA', 'DHS'],
            datasets: [{
              label: contractor.totalContractValue && contractor.totalContractValue >= 1e9 ? 'Value ($B)' : 'Value ($M)',
              data: [
                (contractor.totalContractValue || 50000000) * 0.4 / (contractor.totalContractValue && contractor.totalContractValue >= 1e9 ? 1e9 : 1e6),
                (contractor.totalContractValue || 50000000) * 0.25 / (contractor.totalContractValue && contractor.totalContractValue >= 1e9 ? 1e9 : 1e6),
                (contractor.totalContractValue || 50000000) * 0.15 / (contractor.totalContractValue && contractor.totalContractValue >= 1e9 ? 1e9 : 1e6),
                (contractor.totalContractValue || 50000000) * 0.12 / (contractor.totalContractValue && contractor.totalContractValue >= 1e9 ? 1e9 : 1e6),
                (contractor.totalContractValue || 50000000) * 0.08 / (contractor.totalContractValue && contractor.totalContractValue >= 1e9 ? 1e9 : 1e6),
              ],
              backgroundColor: 'rgba(78, 201, 176, 0.4)',
              borderColor: '#4EC9B0',
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
                top: -10,    // Negative top padding to maximize chart space
                bottom: 0    // Zero bottom padding (differs from TIME-SERIES which has -10)
              }
            },
            plugins: {
              legend: { display: false },  // No legend for cleaner appearance
              tooltip: {
                enabled: false  // Tooltips disabled
              }
            },
            scales: {
              x: {
                ticks: {
                  color: '#D2AC38',
                  font: { size: 12 },  // Larger than TIME-SERIES (12px vs 7px)
                  maxRotation: 0,      // No rotation (horizontal labels)
                  minRotation: 0,
                  maxTicksLimit: 5,
                  autoSkip: false
                },
                grid: {
                  color: 'rgba(192, 192, 192, 0.3)',  // Matches TIME-SERIES grid color
                  drawBorder: false
                },
                border: { display: false }
              },
              y: {
                ticks: {
                  color: '#D2AC38',
                  font: { size: 12 },  // Larger than TIME-SERIES (12px vs 10px)
                  callback: function(value: any) {
                    return '$' + value + (contractor.totalContractValue && contractor.totalContractValue >= 1e9 ? 'B' : 'M');
                  }
                },
                grid: {
                  color: 'rgba(192, 192, 192, 0.3)',  // Matches TIME-SERIES grid color
                  drawBorder: false
                },
                border: { display: false }
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
 *    - Located in OVERVIEW tab
 *    - RIGHT position in 2-column grid (col-span-1)
 *    - Paired with TIME-SERIES PERFORMANCE panel on left
 *    - Part of bottom row in 4-column main grid
 *    - Originally was col-span-2, reduced to col-span-1 for side-by-side layout
 *
 * 2. PANEL STRUCTURE:
 *    - HudCard wrapper with standard panel styling
 *    - overflow-hidden to maintain clean boundaries
 *    - p-4 padding (16px) on inner container
 *    - flex-col layout with flex-1 chart container
 *    - mb-4 spacing after title
 *
 * 3. CHART CONFIGURATION:
 *    - Height: 280px (increased from 240px to match TIME-SERIES)
 *    - Single dataset bar chart
 *    - Teal color (#4EC9B0) with 0.4 opacity background
 *    - Border width: 2px for definition
 *
 * 4. SIZING SYMMETRY WITH TIME-SERIES:
 *    - Same height: 280px
 *    - Same responsive settings
 *    - Same maintainAspectRatio: false
 *    - Similar layout padding structure
 *    - Difference: bottom padding is 0 vs -10 in TIME-SERIES
 *
 * 5. LABEL CONFIGURATION:
 *    - X-axis: 12px font, no rotation (horizontal)
 *    - Y-axis: 12px font with dynamic $M/$B formatting
 *    - Larger font sizes than TIME-SERIES for better readability
 *    - maxTicksLimit: 5 to prevent overcrowding
 *
 * 6. GRID STYLING:
 *    - Grid color: rgba(192, 192, 192, 0.3) - Light gray 30% opacity
 *    - Matches TIME-SERIES grid color exactly
 *    - No borders displayed for cleaner look
 *    - Changed from original gold tint rgba(210, 172, 56, 0.1)
 *
 * 7. DATA DISTRIBUTION:
 *    - DOD: 40% of total contract value
 *    - GSA: 25% of total contract value
 *    - VA: 15% of total contract value
 *    - NASA: 12% of total contract value
 *    - DHS: 8% of total contract value
 *    - Dynamic B/M unit based on contract value threshold (1 billion)
 *
 * 8. VISUAL FEATURES:
 *    - No legend display for cleaner appearance
 *    - No tooltips (disabled)
 *    - "TRACKING" live indicator in chart header
 *    - Title: "Lifetime Awards"
 *
 * 9. REQUIRED DEPENDENCIES:
 *    - GoldengateBarChart component
 *    - HudCard component for panel styling
 *    - contractor object with totalContractValue property
 *    - CONTRACTOR_DETAIL_COLORS constants
 *
 * 10. RESPONSIVE BEHAVIOR:
 *     - col-span-1 in 2-column grid layout
 *     - Responsive: true for automatic resizing
 *     - Full height (h-full) to match sibling panels
 *     - Consistent spacing with gap-4 grid
 *
 * 11. DIFFERENCES FROM TIME-SERIES:
 *     - No time period controls (static data)
 *     - No legend (TIME-SERIES has legend at bottom)
 *     - Larger font sizes (12px vs 7-10px)
 *     - No date rotation (horizontal labels)
 *     - Single dataset vs dual dataset (bar + line)
 *     - Bottom padding: 0 vs -10
 *
 * 12. PANEL PAIRING:
 *     - Forms bottom row with TIME-SERIES PERFORMANCE
 *     - Both panels have 280px height for symmetry
 *     - Consistent border and shadow styling
 *     - Same HudCard variant and priority settings
 */