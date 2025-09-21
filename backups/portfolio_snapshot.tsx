/**
 * PORTFOLIO SNAPSHOT COMPONENT BACKUP
 * Saved: 2024-12-16
 *
 * This backup contains the contractor detail Portfolio Snapshot panel with:
 * - 1-column span in 4-column grid
 * - Four TacticalDisplay components showing key metrics
 * - Bottom disclosure about duration calculation
 * - Proper height alignment with sibling panels
 * - Flex layout for vertical expansion
 */

{/* Portfolio Snapshot */}
<div className="col-span-1 h-full">
<HudCard variant="default" priority="high" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
  <div className="p-4 h-full flex flex-col">
    <h3 className="font-normal tracking-wide mb-3 text-gray-200 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
      PORTFOLIO SNAPSHOT
    </h3>
    <div className="space-y-2 flex-1">
      <TacticalDisplay
        label="TOP CLIENT"
        value="DOD"
        size="md"
      />
      <TacticalDisplay
        label="TOP NAICS"
        value={contractor.primaryNaicsCode || '541511'}
        size="md"
      />
      <TacticalDisplay
        label="TOP PSC"
        value="R425"
        size="md"
      />
      <TacticalDisplay
        label="PORTFOLIO DURATION"
        value="3.2 Years"
        size="md"
      />
    </div>
    <div className="mt-3 pt-3 border-t border-gray-700">
      <p className="text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '12px' }}>
        DURATION IS DOLLAR-WEIGHTED AVG LIFESPAN
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
 *    - Consistent with sibling panels for height alignment
 *
 * 2. Content Organization:
 *    - Title section with Genos 18px uppercase
 *    - Four TacticalDisplay components
 *    - space-y-2 for vertical spacing between displays
 *    - flex-1 allows content to expand
 *
 * 3. TacticalDisplay Items:
 *    - TOP CLIENT: Shows primary agency (DOD)
 *    - TOP NAICS: Dynamic contractor NAICS code (fallback to 541511)
 *    - TOP PSC: Product Service Code (R425)
 *    - PORTFOLIO DURATION: Average contract duration (3.2 Years)
 *    - All use size="md" for consistent sizing
 *
 * 4. Typography:
 *    - Title: Genos 18px uppercase, gray-200
 *    - Disclosure: Genos 12px uppercase, gray-500
 *    - tracking-wider for better letter spacing
 *
 * 5. Visual Elements:
 *    - border-gray-700/30 for panel border
 *    - hover:border-gray-600/20 for interaction
 *    - shadow-2xl for depth
 *    - border-t border-gray-700 for divider line
 *
 * 6. Spacing:
 *    - p-4 container padding
 *    - mb-3 after title
 *    - space-y-2 between TacticalDisplays
 *    - mt-3 pt-3 for disclosure section
 *
 * 7. Data Values:
 *    - TOP CLIENT: Hardcoded "DOD"
 *    - TOP NAICS: Dynamic from contractor data
 *    - TOP PSC: Hardcoded "R425"
 *    - PORTFOLIO DURATION: Hardcoded "3.2 Years"
 *
 * 8. Disclosure Text:
 *    - "DURATION IS DOLLAR-WEIGHTED AVG LIFESPAN"
 *    - Explains the portfolio duration calculation method
 *    - Consistent styling with other snapshot panels
 */