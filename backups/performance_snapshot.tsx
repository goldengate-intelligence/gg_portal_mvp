/**
 * PERFORMANCE SNAPSHOT COMPONENT BACKUP
 * Saved: 2024-12-16
 *
 * This backup contains the contractor detail Performance Snapshot panel with:
 * - 1-column span in 4-column grid
 * - Four TacticalDisplay components showing growth metrics
 * - Growth indicators with trend arrows
 * - Bottom disclosure about performance calculation
 * - Proper height alignment with sibling panels
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
        label="BLENDED GROWTH SCORE"
        value="87"
        size="md"
      />
      <TacticalDisplay
        label="AWARDS GROWTH"
        value="+18.2%"
        trend="up"
        growth={true}
        size="md"
      />
      <TacticalDisplay
        label="REVENUE GROWTH"
        value="+12.7%"
        trend="up"
        growth={true}
        size="md"
      />
      <TacticalDisplay
        label="PIPELINE GROWTH"
        value="+24.5%"
        trend="up"
        growth={true}
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
 * 1. Layout Structure:
 *    - col-span-1 h-full: Takes 1 column in grid, full height
 *    - HudCard with h-full: Ensures card fills container
 *    - Flex column with flex-1 content area
 *    - Matches Portfolio Snapshot structure for consistency
 *
 * 2. Content Organization:
 *    - Title section with Genos 18px uppercase
 *    - Four TacticalDisplay components
 *    - space-y-2 for vertical spacing between displays
 *    - flex-1 allows content to expand
 *
 * 3. TacticalDisplay Items:
 *    - BLENDED GROWTH SCORE: Overall score (87)
 *    - AWARDS GROWTH: +18.2% with upward trend
 *    - REVENUE GROWTH: +12.7% with upward trend
 *    - PIPELINE GROWTH: +24.5% with upward trend
 *    - All use size="md" for consistent sizing
 *
 * 4. Growth Indicators:
 *    - trend="up" for positive growth direction
 *    - growth={true} enables growth-specific styling
 *    - Percentage values with + prefix for positive growth
 *
 * 5. Typography:
 *    - Title: Genos 18px uppercase, gray-200
 *    - Disclosure: Genos 12px uppercase, gray-500
 *    - tracking-wider for better letter spacing
 *
 * 6. Visual Elements:
 *    - border-gray-700/30 for panel border
 *    - hover:border-gray-600/20 for interaction
 *    - shadow-2xl for depth
 *    - border-t border-gray-700 for divider line
 *
 * 7. Spacing:
 *    - p-4 container padding
 *    - mb-3 after title
 *    - space-y-2 between TacticalDisplays
 *    - mt-3 pt-3 for disclosure section
 *
 * 8. Data Values:
 *    - BLENDED GROWTH SCORE: 87 (no units)
 *    - AWARDS GROWTH: +18.2%
 *    - REVENUE GROWTH: +12.7%
 *    - PIPELINE GROWTH: +24.5%
 *
 * 9. Disclosure Text:
 *    - "ROLLING YEAR-OVER-YEAR PERFORMANCE"
 *    - Explains the performance calculation method
 *    - Consistent styling with Portfolio Snapshot panel
 */