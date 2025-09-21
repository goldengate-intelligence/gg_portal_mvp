/**
 * NETWORK SUMMARY PANEL BACKUP (UPDATED)
 * Saved: 2024-12-17
 *
 * This backup contains the complete Network Summary panel from NetworkV1Layout.tsx with:
 * - Panel title changed from "Network Overview" to "Network Summary"
 * - Combined Network Summary panel with AI Analysis and Network Graph
 * - Supply Chain Position content integrated into Contractor Profile
 * - Dynamic bubble sizing based on node count
 * - Simplified green/red financial flow visualization
 * - No physics constraints (disabled updatePhysics)
 * - Larger default bubble sizes (48px base)
 * - "SPECIALIZED FABRICATOR" in white with SUPPLY CHAIN ROLE label
 * - Clean bullet point formatting
 * - Located in first row as full-width panel
 */

{/* Network Summary Panel - Full Width */}
<div className="w-full">
  <HudCard variant="default" priority="high" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
    <div className="p-4 h-full flex flex-col">
      <h3 className="text-gray-200 font-normal tracking-wider mb-4 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
        NETWORK SUMMARY
      </h3>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6 flex-1">

        {/* Left Column: AI Analysis */}
        <div className="col-span-1">
          <div className="border border-gray-600/20 rounded-xl backdrop-blur-sm p-4 h-full" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                AI ANALYSIS
              </h4>
            </div>
          <div>
          <div className="space-y-3">
            {/* Supply Chain Intelligence */}
            <div className="space-y-3">
              {/* Core Capabilities - Redesigned */}
              <div className="bg-gradient-to-br from-[#D2AC38]/5 to-black/30 rounded-lg p-3 border border-[#D2AC38]/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[12px] uppercase tracking-wider text-[#D2AC38] font-semibold" style={{ fontFamily: 'Genos, sans-serif' }}>
                    CONTRACTOR PROFILE
                  </div>
                  <div className="flex gap-2">
                    <div className="px-2 py-0.5 bg-[#D2AC38]/10 rounded text-[9px] text-[#D2AC38]">NAICS 332312</div>
                  </div>
                </div>

                {/* Position Title */}
                <div className="mb-2">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">SUPPLY CHAIN ROLE</div>
                  <div className="text-[14px] font-medium text-white">
                    SPECIALIZED FABRICATOR
                  </div>
                </div>

                {/* Description */}
                <div className="text-[11px] text-gray-400 leading-relaxed mb-2">
                  Manufacturing armor systems and structural components for defense vehicles.
                  Trusted by <span className="text-[#7B61FF]">DOD</span> with direct awards,
                  integrated with <span className="text-[#5BC0EB]">major primes</span>,
                  managing <span className="text-[#FF4C4C]">specialized suppliers</span>.
                </div>

                {/* Core Capabilities */}
                <div className="text-[10px] text-gray-300 mb-2">
                  Military vehicle armor • Structural assemblies • Precision hardware
                </div>

                <div className="mt-2 pt-2 border-t border-gray-700/30">
                  <div className="text-[10px]">
                    <span className="text-gray-500">PSC:</span> <span className="text-gray-300">5110, 5340, 9515</span>
                  </div>
                </div>
              </div>

              {/* Relationship Flow - Larger */}
              <div className="space-y-3">
                {/* Agency Direct */}
                <div className="flex items-start gap-3 bg-black/20 rounded-lg p-3 border border-gray-700/20">
                  <div className="mt-0.5">
                    <div className="w-10 h-10 rounded-full bg-[#7B61FF]/20 border-2 border-[#7B61FF]/60 flex items-center justify-center">
                      <span className="text-[14px] text-[#7B61FF] font-bold">A</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-gray-200">AGENCY CLIENTS</span>
                      <span className="text-[11px] text-[#7B61FF]">→ DIRECT AWARDS</span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      DOD contracts for vehicle armor systems, field equipment hardware
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">$50M • 1 Award • Department of Defense</div>
                  </div>
                </div>

                {/* Prime Work */}
                <div className="flex items-start gap-3 bg-black/20 rounded-lg p-3 border border-gray-700/20">
                  <div className="mt-0.5">
                    <div className="w-10 h-10 rounded-full bg-[#5BC0EB]/20 border-2 border-[#5BC0EB]/60 flex items-center justify-center">
                      <span className="text-[14px] text-[#5BC0EB] font-bold">P</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-gray-200">PRIME PARTNERS</span>
                      <span className="text-[11px] text-[#5BC0EB]">→ SUBCONTRACT AWARDS</span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Manufacturing support for MegaCorp Industries & Global Defense Systems
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">$380M • 91 Awards • 2 Prime Contractors</div>
                  </div>
                </div>

                {/* Sub Work */}
                <div className="flex items-start gap-3 bg-black/20 rounded-lg p-3 border border-gray-700/20">
                  <div className="mt-0.5">
                    <div className="w-10 h-10 rounded-full bg-[#FF4C4C]/20 border-2 border-[#FF4C4C]/60 flex items-center justify-center">
                      <span className="text-[14px] text-[#FF4C4C] font-bold">S</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-gray-200">SUPPLY BASE</span>
                      <span className="text-[11px] text-[#FF4C4C]">→ PROCUREMENT ORDERS</span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Raw materials, specialized coatings, precision machining services
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">$29M • 25 Orders • 3 Suppliers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

        {/* Right Column: Network Graph */}
        <div className="col-span-1">
          <div className="border border-gray-600/20 rounded-xl backdrop-blur-sm p-4 flex flex-col h-full" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
              OPERATIONAL STRUCTURE
            </h4>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
              <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                TRACKING
              </span>
            </div>
          </div>
        <div className="flex-1 relative overflow-hidden rounded-lg transition-all duration-300 min-h-[300px]">

          <GoldengateNetworkGraph
            title="Contractor Network"
            height="100%"
            liveIndicator={false}
            liveText="TRACKING"
            className="w-full h-full"
            nodes={[
              {
                id: contractor.uei,
                label: contractor.name === 'Loading...' ? 'Trio' : contractor.name.split(' ')[0],
                type: 'hybrid' as const,
                value: contractor.totalContractValue || 0
              },
              // DOD direct award node
              {
                id: 'DOD-DIRECT',
                label: 'DOD',
                type: 'agency' as const,
                value: 50000000
              },
              ...(networkData.relationships?.asSubcontractor?.partners?.slice(0, 8).map((p: any) => ({
                id: p.primeUei,
                label: p.primeName.split(' ')[0],
                type: 'prime' as const,
                value: p.sharedRevenue || 0
              })) || []),
              ...(networkData.relationships?.asPrime?.partners?.slice(0, 8).map((p: any) => ({
                id: p.subUei,
                label: p.subName.split(' ')[0],
                type: 'sub' as const,
                value: p.sharedRevenue || 0
              })) || [])
            ]}
            edges={[
              // DOD direct award edge
              {
                source: 'DOD-DIRECT',
                target: contractor.uei,
                weight: 100,
                revenue: 50000000,
                contracts: 1
              },
              ...(networkData.relationships?.asSubcontractor?.partners?.slice(0, 8).map((p: any) => ({
                source: p.primeUei,
                target: contractor.uei,
                weight: p.strengthScore || 50,
                revenue: p.sharedRevenue || 0,
                contracts: p.sharedContracts || 0
              })) || []),
              ...(networkData.relationships?.asPrime?.partners?.slice(0, 8).map((p: any) => ({
                source: contractor.uei,
                target: p.subUei,
                weight: p.strengthScore || 50,
                revenue: p.sharedRevenue || 0,
                contracts: p.sharedContracts || 0
              })) || [])
            ]}
          />
        </div>

        {/* Financial Overview Panel */}
        <div className="bg-black/40 border border-gray-700/50 rounded-lg p-3 mt-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1" style={{ fontFamily: 'Genos, sans-serif' }}>INFLOWS</div>
              <div className="text-green-400 font-medium text-lg">+${(50 + (networkData.relationships?.asSubcontractor?.totalValue || 0) / 1000000).toFixed(1)}M</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1" style={{ fontFamily: 'Genos, sans-serif' }}>OUTFLOWS</div>
              <div className="text-red-400 font-medium text-lg">-${((networkData.relationships?.asPrime?.totalValue || 0) / 1000000).toFixed(1)}M</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1" style={{ fontFamily: 'Genos, sans-serif' }}>NET FLOW</div>
              <div className="text-green-400 font-medium text-lg">+${(50 + (networkData.relationships?.asSubcontractor?.totalValue || 0) / 1000000 - (networkData.relationships?.asPrime?.totalValue || 0) / 1000000).toFixed(1)}M</div>
            </div>
          </div>
        </div>
        </div>
      </div>

      </div>
    </div>
  </HudCard>
</div>

/**
 * KEY IMPLEMENTATION NOTES:
 *
 * 1. PANEL STRUCTURE:
 *    - Title changed from "Network Overview" to "Network Summary"
 *    - Combined panel containing both AI Analysis and Network Graph
 *    - Two-column grid layout with equal spacing
 *    - Full-width panel in first row of NetworkV1Layout
 *
 * 2. AI ANALYSIS SECTION (Left Column):
 *    - Contractor Profile with Supply Chain Role emphasis
 *    - "SPECIALIZED FABRICATOR" displayed in white (text-white)
 *    - Three relationship blocks (A-P-S) with circular badges
 *    - Color-coded relationships: Agency (#7B61FF), Prime (#5BC0EB), Sub (#FF4C4C)
 *
 * 3. NETWORK GRAPH (Right Column):
 *    - Operational Structure title
 *    - Dynamic bubble sizing based on node count
 *    - Base radius of 48px (increased from 32px)
 *    - Simplified green inflows, red outflows visualization
 *    - Physics disabled to prevent overlap issues
 *    - DOD node added with purple color (#7B61FF)
 *
 * 4. CONTRACTOR PROFILE DETAILS:
 *    - SUPPLY CHAIN ROLE label in gray-500
 *    - SPECIALIZED FABRICATOR in white text
 *    - Core capabilities without bullet points
 *    - NAICS and PSC codes included
 *
 * 5. FINANCIAL VALUES:
 *    - DOD Direct Award: $50M
 *    - Prime Awards: $380M (91 awards from 2 primes)
 *    - Sub Orders: $29M (25 orders to 3 suppliers)
 *    - Active Awards total: $480M (shown in contractor-detail)
 *
 * 6. TECHNICAL FIXES APPLIED:
 *    - updatePhysics function disabled in GoldengateNetworkGraph
 *    - Dynamic sizing logic implemented for bubble radius
 *    - Fixed vertical spacing to prevent overlaps
 *    - Removed complex gradient effects for robustness
 *
 * 7. DYNAMIC BUBBLE SIZING LOGIC:
 *    ```tsx
 *    let dynamicBaseRadius = 48;
 *    if (totalNodes > 10) {
 *      dynamicBaseRadius = 35;
 *    } else if (totalNodes > 8) {
 *      dynamicBaseRadius = 38;
 *    } else if (totalNodes > 6) {
 *      dynamicBaseRadius = 42;
 *    } else if (totalNodes > 4) {
 *      dynamicBaseRadius = 45;
 *    }
 *    ```
 *
 * 8. VISUAL STYLING:
 *    - Clean, minimal design with proper contrast
 *    - Genos font for headers (18px)
 *    - Container backgrounds using CONTRACTOR_DETAIL_COLORS
 *    - Hover states and transitions for interactivity
 *
 * 9. DATA FLOW:
 *    - Props: contractor, networkData, getMapPosition, parsePlaceOfPerformance
 *    - Network nodes dynamically generated from relationships data
 *    - Financial calculations based on actual contract values
 *
 * 10. LAYOUT CHANGES IN SECOND ROW:
 *    - Geographic Distribution moved to left side (half-width)
 *    - Relationship Distribution (formerly Active Opportunities) on right side (half-width)
 *    - Both panels share the same row in a 2-column grid
 *    - Placeholder panel at bottom removed
 *
 * 11. RELATIONSHIP DISTRIBUTION UPDATES:
 *    - Panel title changed from "Active Opportunities" to "Relationship Distribution"
 *    - Internal title changed from "Opportunity Distribution" to "Operational Activity"
 *    - Three containers (Direct Awards, Prime Awards, Sub Orders) have no gaps between them
 *    - Left container rounded on left only (rounded-l-lg)
 *    - Middle container no rounding, only top/bottom borders (border-y)
 *    - Right container rounded on right only (rounded-r-lg)
 *    - Each container has flex layout and scrollable content area
 *    - Max height of 400px on main container to prevent expansion
 */