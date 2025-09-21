/**
 * GROWTH SNAPSHOT PANEL BACKUP (PERFORMANCE SNAPSHOT)
 * Saved: 2024-12-17
 *
 * This backup contains the Growth Snapshot panel from contractor-detail.tsx with:
 * - Renamed to "Performance Snapshot" in the UI
 * - Four growth metrics with percentage values
 * - Color coding based on growth thresholds
 * - No arrow symbols or + signs
 * - Growth value prop for dynamic color determination
 */

{/* Performance Snapshot */}
<div className="col-span-1 h-full">
  <HudCard variant="default" priority="high" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
    <div className="p-4 h-full flex flex-col">
      <h3 className="font-normal tracking-wide mb-3 text-gray-200 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
        PERFORMANCE SNAPSHOT
      </h3>
      <div className="space-y-2 flex-1">
        <TacticalDisplay
          label="BLENDED GROWTH"
          value="24%"
          growth={true}
          growthValue={24}
          size="md"
        />
        <TacticalDisplay
          label="AWARDS GROWTH"
          value="18.2%"
          growth={true}
          growthValue={18.2}
          size="md"
        />
        <TacticalDisplay
          label="REVENUE GROWTH"
          value="12.7%"
          growth={true}
          growthValue={12.7}
          size="md"
        />
        <TacticalDisplay
          label="PIPELINE GROWTH"
          value="24.5%"
          growth={true}
          growthValue={24.5}
          size="md"
        />
      </div>
      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '12px' }}>
          ROLLING YEAR-OVER-YEAR PERFORMANCE
        </p>
      </div>
    </div>
  </HudCard>
</div>

/**
 * KEY IMPLEMENTATION NOTES:
 *
 * 1. PANEL POSITIONING:
 *    - Located in OVERVIEW tab of contractor-detail.tsx
 *    - Part of the 4-column top row grid
 *    - Right-most panel (col-span-1)
 *    - Full height matching sibling panels
 *
 * 2. GROWTH METRICS:
 *    - Blended Growth: 24% (green - ≥1%)
 *    - Awards Growth: 18.2% (green - ≥1%)
 *    - Revenue Growth: 12.7% (green - ≥1%)
 *    - Pipeline Growth: 24.5% (green - ≥1%)
 *
 * 3. COLOR THRESHOLDS:
 *    - Green (#38E54D): ≥1% growth
 *    - Amber (#FFD166): >-1% and <1% (stable)
 *    - Red (#FF4C4C): ≤-1% (declining)
 *
 * 4. TACTICALUPDATES:
 *    - growth prop set to true for all metrics
 *    - growthValue prop passes numeric percentage
 *    - No arrow symbols or trend indicators
 *    - No + signs for positive values
 *    - Clean percentage display (e.g., "24%" not "+24%")
 *
 * 5. COMPONENT DEPENDENCIES:
 *    - TacticalDisplay component from hud-card.tsx
 *    - Updated with getGrowthColor() function
 *    - Dynamic color based on growthValue prop
 *
 * 6. FOOTER TEXT:
 *    - "ROLLING YEAR-OVER-YEAR PERFORMANCE"
 *    - Gray-500 color with uppercase styling
 *    - 12px font size in Genos font family
 *
 * 7. PANEL STYLING:
 *    - HudCard with default variant
 *    - High priority setting
 *    - Border and shadow styling for depth
 *    - Hover state transitions
 *
 * 8. LAYOUT:
 *    - Vertical stacking with space-y-2
 *    - Flex-1 for main content area
 *    - Footer separated by border-t
 *
 * COLOR LOGIC IN TACTICALDISPLAY:
 * ```tsx
 * const getGrowthColor = () => {
 *   if (!growth || growthValue === undefined) return "text-gray-100";
 *   if (alert) return "text-red-400";
 *   if (growthValue >= 1) return "text-green-400";
 *   if (growthValue > -1 && growthValue < 1) return "text-[#D2AC38]";
 *   return "text-red-400";
 * };
 * ```
 */