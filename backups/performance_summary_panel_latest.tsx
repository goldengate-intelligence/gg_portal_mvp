/**
 * PERFORMANCE SUMMARY PANEL - LATEST VERSION
 * Saved: 2024-12-17
 *
 * This backup contains the most recent PERFORMANCE SUMMARY panel from contractor-detail.tsx with:
 * - Composite score of 80 (average of 5 subscores: 82+76+91+68+85 / 5)
 * - Performance tier: "Strong" (75-89 range)
 * - Teal color (#4EC9B0) for composite score and Strong tier
 * - Custom tooltips for all subscores with detailed explanations
 * - AI Analysis section with data-driven insights
 * - Green "TRACKING" indicators in both panels
 * - Color-coded progress bars based on performance thresholds
 * - Vertical dividing line between the two containers
 * - Both panels have TRACKING indicators in top-right
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
        <div className="border border-gray-600/20 rounded-xl backdrop-blur-sm p-4 relative" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
              PERFORMANCE SCORES
            </h4>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
              <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                TRACKING
              </span>
            </div>
          </div>
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
                      stroke="#4EC9B0"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 72 * 0.80} ${2 * Math.PI * 72}`}
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
                    <div className="text-5xl font-light" style={{ color: '#4EC9B0' }}>80</div>
                    <div className="text-xs uppercase tracking-wider text-gray-400 -mb-1" style={{ fontFamily: 'Genos, sans-serif' }}>COMPOSITE</div>
                    <div className="text-xs uppercase tracking-wider text-gray-400" style={{ fontFamily: 'Genos, sans-serif' }}>SCORE</div>
                  </div>
                </div>
                {/* Subtitle below radial */}
                <div className="mt-3 pt-3 border-t border-gray-700 text-center">
                  <p className="text-xs text-gray-500 font-sans leading-tight">
                    80th percentile among 247 peers in Q4<br/>with primary NAICS of 541511
                  </p>
                </div>
              </div>
              {/* Subscores - Compact containers */}
              <div className="flex-1 space-y-2 max-w-sm">
                <div className="bg-black/60 border border-gray-700/30 rounded-md p-2 relative group/subscore">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>AWARDS CAPTURED (TTM)</span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 w-12 text-right">$12.4M</span>
                      <span className="text-xs text-gray-500 mx-2">|</span>
                      <span className="text-sm font-light text-white w-6 text-right">82</span>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4EC9B0]" style={{ width: '82%' }}></div>
                  </div>
                  {/* Custom Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 invisible group-hover/subscore:visible opacity-0 group-hover/subscore:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                    <div className="bg-black border border-gray-700 rounded-md px-3 py-2 text-xs text-gray-300 whitespace-nowrap">
                      <div className="font-bold text-[#D2AC38] mb-1">Awards Captured (TTM)</div>
                      <div>How much additional business was captured</div>
                      <div>in the last twelve months.</div>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700"></div>
                  </div>
                </div>

                <div className="bg-black/60 border border-gray-700/30 rounded-md p-2 relative group/subscore">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>ESTIMATED REVENUE (TTM)</span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 w-12 text-right">$8.7M</span>
                      <span className="text-xs text-gray-500 mx-2">|</span>
                      <span className="text-sm font-light text-white w-6 text-right">76</span>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4EC9B0]" style={{ width: '76%' }}></div>
                  </div>
                  {/* Custom Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 invisible group-hover/subscore:visible opacity-0 group-hover/subscore:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                    <div className="bg-black border border-gray-700 rounded-md px-3 py-2 text-xs text-gray-300 whitespace-nowrap">
                      <div className="font-bold text-[#D2AC38] mb-1">Estimated Revenue (TTM)</div>
                      <div>Straight-line revenue recognized from active</div>
                      <div>awards in the last twelve months.</div>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700"></div>
                  </div>
                </div>

                <div className="bg-black/60 border border-gray-700/30 rounded-md p-2 relative group/subscore">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>TOTAL PIPELINE</span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 w-12 text-right">$45.2M</span>
                      <span className="text-xs text-gray-500 mx-2">|</span>
                      <span className="text-sm font-light text-white w-6 text-right">91</span>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#38E54D]" style={{ width: '91%' }}></div>
                  </div>
                  {/* Custom Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 invisible group-hover/subscore:visible opacity-0 group-hover/subscore:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                    <div className="bg-black border border-gray-700 rounded-md px-3 py-2 text-xs text-gray-300 whitespace-nowrap">
                      <div className="font-bold text-[#D2AC38] mb-1">Total Pipeline</div>
                      <div>Lifetime awards minus lifetime revenue as</div>
                      <div>recognized on a straight-line basis over</div>
                      <div>the respective performance periods.</div>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700"></div>
                  </div>
                </div>

                <div className="bg-black/60 border border-gray-700/30 rounded-md p-2 relative group/subscore">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>PORTFOLIO DURATION</span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 w-12 text-right">3.2 yrs</span>
                      <span className="text-xs text-gray-500 mx-2">|</span>
                      <span className="text-sm font-light text-white w-6 text-right">68</span>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FFD166]" style={{ width: '68%' }}></div>
                  </div>
                  {/* Custom Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 invisible group-hover/subscore:visible opacity-0 group-hover/subscore:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                    <div className="bg-black border border-gray-700 rounded-md px-3 py-2 text-xs text-gray-300 whitespace-nowrap">
                      <div className="font-bold text-[#D2AC38] mb-1">Portfolio Duration</div>
                      <div>Dollar-weighted average lifespan</div>
                      <div>of active awards.</div>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700"></div>
                  </div>
                </div>

                <div className="bg-black/60 border border-gray-700/30 rounded-md p-2 relative group/subscore">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>BLENDED GROWTH</span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 w-12 text-right">+24%</span>
                      <span className="text-xs text-gray-500 mx-2">|</span>
                      <span className="text-sm font-light text-white w-6 text-right">85</span>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4EC9B0]" style={{ width: '85%' }}></div>
                  </div>
                  {/* Custom Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 invisible group-hover/subscore:visible opacity-0 group-hover/subscore:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                    <div className="bg-black border border-gray-700 rounded-md px-3 py-2 text-xs text-gray-300 whitespace-nowrap">
                      <div className="font-bold text-[#D2AC38] mb-1">Blended Growth</div>
                      <div>Multi-year revenue growth:</div>
                      <div>50% year-over-year, 30% 2yr AVG,</div>
                      <div>20% 3yr AVG.</div>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700"></div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Vertical Dividing Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-700/50 -translate-x-1/2"></div>

        {/* Right Container - Peer Group Details */}
        <div className="border border-gray-600/20 rounded-xl backdrop-blur-sm p-4 relative" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
              PEER GROUP DETAILS
            </h4>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
              <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                TRACKING
              </span>
            </div>
          </div>
            <div className="grid grid-cols-2 gap-4 h-64">
              <div className="bg-black/60 border border-gray-700/50 rounded-lg p-4 flex flex-col">
                <div className="text-xs text-gray-500 uppercase tracking-wider text-center" style={{ fontFamily: 'Genos, sans-serif' }}>PERFORMANCE</div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-2xl font-light text-[#4EC9B0]">Strong</div>
                </div>
                <div className="text-gray-400 text-center font-sans" style={{ fontSize: '10px' }}>Tier</div>
              </div>
              <div className="bg-black/60 border border-gray-700/50 rounded-lg p-4 flex flex-col">
                <div className="text-xs text-gray-500 uppercase tracking-wider text-center" style={{ fontFamily: 'Genos, sans-serif' }}>NAICS CODE</div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-2xl font-light text-white">541511</div>
                </div>
                <div className="text-gray-400 text-center font-sans" style={{ fontSize: '10px' }}>Custom Computer Programming Services</div>
              </div>
              <div className="bg-black/60 border border-gray-700/50 rounded-lg p-4 flex flex-col">
                <div className="text-xs text-gray-500 uppercase tracking-wider text-center" style={{ fontFamily: 'Genos, sans-serif' }}>SIZE QUARTILE</div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-2xl font-light text-white">Q4</div>
                </div>
                <div className="text-gray-400 text-center font-sans" style={{ fontSize: '10px' }}>Lifetime Awards</div>
              </div>
              <div className="bg-black/60 border border-gray-700/50 rounded-lg p-4 flex flex-col">
                <div className="text-xs text-gray-500 uppercase tracking-wider text-center" style={{ fontFamily: 'Genos, sans-serif' }}>GROUP SIZE</div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-2xl font-light text-white text-center">247</div>
                </div>
                <div className="text-gray-400 text-center font-sans" style={{ fontSize: '10px' }}>Peer Count</div>
              </div>
            </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="pt-4 border-t border-gray-700/50">
        <h4 className="font-normal uppercase tracking-wider mb-2" style={{ fontFamily: 'Genos, sans-serif', fontSize: '14px', color: '#D2AC38' }}>
          AI ANALYSIS
        </h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          This contractor demonstrates <span className="text-[#4EC9B0] font-medium">strong performance</span> with a composite score of <span className="text-[#4EC9B0] font-medium">80/100</span>,
          placing them in the <span className="text-[#4EC9B0] font-medium">high performance</span> tier of their peer group.
          The <span className="text-[#38E54D]">91st percentile pipeline value</span> coupled with <span className="text-[#FFD166]">68th percentile portfolio duration</span> indicates
          strong new business acquisition but potential contract retention challenges. Their <span className="text-[#4EC9B0]">82nd percentile award capture rate</span>
          suggests effective bid strategies, though <span className="text-[#4EC9B0]">revenue conversion</span> at 76th percentile shows room for maximizing contract value.
        </p>
      </div>
    </div>
  </HudCard>
</div>

/**
 * KEY FEATURES IN LATEST VERSION:
 *
 * 1. COMPOSITE SCORE:
 *    - Score: 80 (average of subscores: 82+76+91+68+85 / 5 = 80.4)
 *    - Color: #4EC9B0 (Teal Mint) for 75-89 "Strong" range
 *    - Stroke completion: 80% (0.80 in strokeDasharray)
 *    - Percentile: 80th percentile text
 *
 * 2. PERFORMANCE TIER:
 *    - Tier: "Strong" (75-89 range)
 *    - Color: #4EC9B0 (Teal Mint)
 *    - Displayed in Peer Group Details panel
 *
 * 3. SUBSCORE DETAILS:
 *    - Awards Captured (82): $12.4M | #4EC9B0 bar
 *    - Estimated Revenue (76): $8.7M | #4EC9B0 bar
 *    - Total Pipeline (91): $45.2M | #38E54D bar (green for Elite)
 *    - Portfolio Duration (68): 3.2 yrs | #FFD166 bar (amber for Stable)
 *    - Blended Growth (85): +24% | #4EC9B0 bar
 *
 * 4. CUSTOM TOOLTIPS:
 *    - Black background with gray-700 border
 *    - Bold title in #D2AC38 (golden)
 *    - Multi-line explanations
 *    - Arrow pointer at bottom
 *    - Fully opaque (bg-black not bg-black/90)
 *
 * 5. TRACKING INDICATORS:
 *    - Both panels have green TRACKING text
 *    - Pulsing green dot with shadow glow
 *    - Top-right positioning
 *    - 10px font size in Genos font
 *
 * 6. LAYOUT FEATURES:
 *    - Two-column grid with 8-unit gap
 *    - Vertical dividing line (gray-700/50)
 *    - Both containers have gray-600/20 borders
 *    - Background: CONTRACTOR_DETAIL_COLORS.containerColor
 *
 * 7. AI ANALYSIS:
 *    - Header in golden (#D2AC38) at 14px
 *    - Updated to reference score of 80
 *    - "Strong performance" instead of "elite"
 *    - Color-coded insights matching thresholds
 *
 * 8. COLOR THRESHOLDS:
 *    - 90+ Elite: #38E54D (Fresh Green)
 *    - 75-89 Strong: #4EC9B0 (Teal Mint)
 *    - 50-74 Stable: #FFD166 (Soft Amber)
 *    - <50 Emerging: #FF4C4C (Crimson Red)
 */