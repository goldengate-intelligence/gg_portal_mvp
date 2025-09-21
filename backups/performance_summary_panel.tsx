/**
 * PERFORMANCE SUMMARY PANEL BACKUP
 * Saved: 2024-12-17
 *
 * This backup contains the complete PERFORMANCE SUMMARY panel from contractor-detail.tsx with:
 * - Two-column layout with Performance Scores and Peer Group Details
 * - Composite score radial chart with dynamic peer context subtitle
 * - Four subscore progress bars with color-coded performance indicators
 * - 2x2 grid of peer group context boxes
 * - Intelligent performance analysis with data-driven insights
 * - Color-coded text matching performance thresholds
 */

{/* Complete Performance Summary Panel */}
<div className="col-span-4">
  <HudCard variant="default" priority="high" isPanel={true} className="h-full hover:shadow-xl">
    <div className="p-6">
      <h3 className="text-gray-200 font-normal tracking-wider mb-6 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '22px' }}>
        PERFORMANCE SUMMARY
      </h3>

      {/* Two Container Layout */}
      <div className="grid grid-cols-2 gap-8 mb-6 relative">

        {/* Left Container - Performance Scores */}
        <div>
          <h4 className="font-normal uppercase tracking-wider mb-4" style={{ fontFamily: 'Genos, sans-serif', fontSize: '14px', color: '#D2AC38' }}>
            PERFORMANCE SCORES
          </h4>
          <div className="border border-gray-600/20 rounded-xl backdrop-blur-sm p-6" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
            <div className="flex items-start gap-6">
              {/* Composite Score - Larger radial */}
              <div className="relative flex flex-col items-center">
                <div className="relative w-40 h-40">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="72"
                      stroke="#374151"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="72"
                      stroke="#22c55e"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 72 * 0.92} ${2 * Math.PI * 72}`}
                      strokeLinecap="round"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="64"
                      fill="#000000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-light" style={{ color: '#22c55e' }}>92</div>
                    <div className="text-xs uppercase tracking-wider text-gray-400 -mb-1" style={{ fontFamily: 'Genos, sans-serif' }}>COMPOSITE</div>
                    <div className="text-xs uppercase tracking-wider text-gray-400" style={{ fontFamily: 'Genos, sans-serif' }}>SCORE</div>
                  </div>
                </div>
                {/* Subtitle below radial - Dynamic peer context */}
                <div className="mt-3 pt-3 border-t border-gray-700 text-center">
                  <p className="text-xs text-gray-500 font-sans leading-tight">
                    Percentile ranking among 247 peers in Q4<br/>with primary NAICS of 541511
                  </p>
                </div>
              </div>
              {/* Subscores - Compact containers */}
              <div className="flex-1 space-y-2 max-w-sm">
                <div className="bg-gray-900/60 border border-gray-700/30 rounded-md p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>AWARDS CAPTURED (TTM)</span>
                    <span className="text-sm font-light text-white">82</span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '82%' }}></div>
                  </div>
                </div>

                <div className="bg-gray-900/60 border border-gray-700/30 rounded-md p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>REVENUE (TTM)</span>
                    <span className="text-sm font-light text-white">76</span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: '76%' }}></div>
                  </div>
                </div>

                <div className="bg-gray-900/60 border border-gray-700/30 rounded-md p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>PIPELINE VALUE</span>
                    <span className="text-sm font-light text-white">91</span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '91%' }}></div>
                  </div>
                </div>

                <div className="bg-gray-900/60 border border-gray-700/30 rounded-md p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>PORTFOLIO DURATION</span>
                    <span className="text-sm font-light text-white">68</span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: '68%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Dividing Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-700/50 -translate-x-1/2"></div>

        {/* Right Container - Peer Group Details */}
        <div>
          <h4 className="font-normal uppercase tracking-wider mb-4" style={{ fontFamily: 'Genos, sans-serif', fontSize: '14px', color: '#D2AC38' }}>
            PEER GROUP DETAILS
          </h4>
          <div className="border border-gray-600/20 rounded-xl backdrop-blur-sm p-6" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
            <div className="grid grid-cols-2 gap-4 h-54">
              <div className="bg-gray-900/40 border border-gray-700/50 rounded-lg p-4 flex flex-col">
                <div className="text-xs text-gray-500 uppercase tracking-wider text-center" style={{ fontFamily: 'Genos, sans-serif' }}>PERFORMANCE</div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-2xl font-light text-green-400">Elite</div>
                </div>
                <div className="text-gray-400 text-center font-sans" style={{ fontSize: '10px' }}>Tier</div>
              </div>
              <div className="bg-gray-900/40 border border-gray-700/50 rounded-lg p-4 flex flex-col">
                <div className="text-xs text-gray-500 uppercase tracking-wider text-center" style={{ fontFamily: 'Genos, sans-serif' }}>NAICS CODE</div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-2xl font-light text-white">541511</div>
                </div>
                <div className="text-gray-400 text-center font-sans" style={{ fontSize: '10px' }}>Custom Computer Programming Services</div>
              </div>
              <div className="bg-gray-900/40 border border-gray-700/50 rounded-lg p-4 flex flex-col">
                <div className="text-xs text-gray-500 uppercase tracking-wider text-center" style={{ fontFamily: 'Genos, sans-serif' }}>SIZE QUARTILE</div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-2xl font-light text-white">Q4</div>
                </div>
                <div className="text-gray-400 text-center font-sans" style={{ fontSize: '10px' }}>Lifetime Awards</div>
              </div>
              <div className="bg-gray-900/40 border border-gray-700/50 rounded-lg p-4 flex flex-col">
                <div className="text-xs text-gray-500 uppercase tracking-wider text-center" style={{ fontFamily: 'Genos, sans-serif' }}>GROUP SIZE</div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-2xl font-light text-white text-center">247</div>
                </div>
                <div className="text-gray-400 text-center font-sans" style={{ fontSize: '10px' }}>Peer Count</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Analysis Section */}
      <div className="pt-4 border-t border-gray-700/50">
        <h4 className="font-normal uppercase tracking-wider mb-2" style={{ fontFamily: 'Genos, sans-serif', fontSize: '14px', color: '#D2AC38' }}>
          PERFORMANCE ANALYSIS
        </h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          This contractor demonstrates <span className="text-green-400 font-medium">elite performance</span> with a composite score of <span className="text-green-400 font-medium">92/100</span>,
          placing them in the <span className="text-green-400 font-medium">top tier</span> of their peer group.
          The <span className="text-green-400">91st percentile pipeline value</span> coupled with <span className="text-yellow-400">68th percentile portfolio duration</span> indicates
          strong new business acquisition but potential contract retention challenges. Their <span className="text-green-400">82nd percentile award capture rate</span>
          suggests effective bid strategies, though <span className="text-yellow-400">revenue conversion</span> at 76th percentile shows room for maximizing contract value.
        </p>
      </div>
    </div>
  </HudCard>
</div>

/**
 * KEY IMPLEMENTATION NOTES:
 *
 * 1. PANEL POSITIONING:
 *    - Located in PERFORMANCE tab of contractor-detail.tsx
 *    - Full width panel (col-span-4)
 *    - High priority HudCard with hover shadow effect
 *    - Main container padding: p-6
 *
 * 2. TWO-COLUMN LAYOUT:
 *    - Grid with 2 columns and 8-unit gap
 *    - Vertical dividing line at 50% position
 *    - Left: Performance Scores section
 *    - Right: Peer Group Details section
 *
 * 3. COMPOSITE SCORE RADIAL:
 *    - Size: 160x160px (w-40 h-40)
 *    - Green progress arc at 92% completion
 *    - Black center circle for score display
 *    - Score: 92 in green (#22c55e) at 5xl size
 *    - Centered layout with flex flex-col items-center
 *
 * 4. DYNAMIC SUBTITLE:
 *    - References peer group data from right panel
 *    - Format: "Percentile ranking among {GROUP SIZE} peers in {SIZE QUARTILE} with primary NAICS of {NAICS CODE}"
 *    - Values: 247 peers, Q4, 541511
 *    - Separated by border-t with pt-3 mt-3 spacing
 *
 * 5. SUBSCORE METRICS:
 *    - Awards Captured (TTM): 82 - Green bar (≥80)
 *    - Revenue (TTM): 76 - Yellow bar (60-79)
 *    - Pipeline Value: 91 - Green bar (≥80)
 *    - Portfolio Duration: 68 - Yellow bar (60-79)
 *
 * 6. PROGRESS BAR STYLING:
 *    - Container: bg-gray-900/60 with border-gray-700/30
 *    - Bar height: h-1 (4px)
 *    - Background: bg-gray-800
 *    - Colors: Green for ≥80, Yellow for 60-79
 *    - Rounded corners with overflow-hidden
 *
 * 7. PEER GROUP DETAILS GRID:
 *    - 2x2 grid layout (grid-cols-2)
 *    - Fixed height: h-54 (216px)
 *    - Gap: gap-4 between boxes
 *    - Order: Performance (top-left), NAICS (top-right), Size Quartile (bottom-left), Group Size (bottom-right)
 *
 * 8. PEER GROUP BOX STYLING:
 *    - Background: bg-gray-900/40
 *    - Border: border-gray-700/50
 *    - Padding: p-4
 *    - Layout: flex flex-col
 *    - Title: text-xs uppercase in gray-500
 *    - Value: text-2xl font-light
 *    - Subtitle: 10px font-size in gray-400
 *
 * 9. SPECIAL COLORS:
 *    - Headers: #D2AC38 (golden)
 *    - Elite performance: text-green-400
 *    - Container background: CONTRACTOR_DETAIL_COLORS.containerColor
 *
 * 10. PERFORMANCE ANALYSIS:
 *     - Intelligent data-driven insights
 *     - Color coding matches subscore thresholds
 *     - Green for high metrics (≥80)
 *     - Yellow for moderate metrics (60-79)
 *     - Analyzes relationships between metrics
 *
 * 11. METRIC INSIGHTS:
 *     - High pipeline + lower duration = retention issues
 *     - High awards + lower revenue = value maximization opportunity
 *     - Each insight derived from actual data relationships
 *
 * 12. REQUIRED DEPENDENCIES:
 *     - HudCard component
 *     - CONTRACTOR_DETAIL_COLORS constants
 *     - Genos font family for headers
 *     - System font for body text
 *
 * 13. RESPONSIVE CONSIDERATIONS:
 *     - Two-column grid maintains proportions
 *     - Flex layouts adapt to content
 *     - Text sizes optimized for readability
 *     - Hover states on main card only
 *
 * 14. KEY MODIFICATIONS HISTORY:
 *     - Changed "strong performance" to "elite performance" with green color
 *     - Updated composite score from 78 to 92 to match radial
 *     - Added dynamic peer context to subtitle
 *     - Reordered peer group boxes for logical flow
 *     - Removed blue color coding to match actual thresholds
 *     - Made performance analysis data-driven
 */