/**
 * HEADLINE CARDS COMPONENT BACKUP
 * Saved: ${new Date().toISOString()}
 *
 * This backup contains the contractor detail headline cards section with:
 * - Four cards: Lifetime Awards, Active Awards, Estimated Revenue (TTM), Estimated Pipeline
 * - Dollar values: $1.2B, $450M, $112.5M, $337.5M
 * - Award counts: 278 Awards, 92 Awards
 * - Typography:
 *   - Card titles: Genos 18px uppercase
 *   - Dollar amounts: system-ui sans-serif 36px
 *   - Award counts: system-ui sans-serif 16px
 *   - Descriptions: Genos 12px (text-xs)
 * - Colors:
 *   - Dollar amounts: #D2AC38 (gold)
 *   - Borders: gray-700 with hover:border-gray-600/30
 * - Layout: grid grid-cols-4 gap-6 mt-4
 */

{/* Metrics Cards - Full Width Under Logo Box */}
<div className="grid grid-cols-4 gap-6 mt-4">
  <div className={cn("rounded-lg p-4 border border-gray-700 hover:border-gray-600/30 transition-all group", CONTRACTOR_DETAIL_COLORS.panelColor)}>
    <div className="text-white font-normal uppercase tracking-wider mb-2" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>Lifetime Awards</div>
    <div className="flex items-baseline gap-2">
      <span className="font-medium text-[#D2AC38] transition-colors">
        <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '36px' }}>$</span>
        <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '36px' }}>1.2B</span>
      </span>
      <span className="text-gray-600">|</span>
      <span className="text-white font-normal" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '16px' }}>
        278 Awards
      </span>
    </div>
    <div className="text-xs text-gray-600 mt-1 font-normal" style={{ fontFamily: 'Genos, sans-serif' }}>
      Total value and number of historical definitive awards
    </div>
  </div>

  <div className={cn("rounded-lg p-4 border border-gray-700 hover:border-gray-600/30 transition-all group", CONTRACTOR_DETAIL_COLORS.panelColor)}>
    <div className="text-white font-normal uppercase tracking-wider mb-2" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>Active Awards</div>
    <div className="flex items-baseline gap-2">
      <span className="font-medium text-[#D2AC38] transition-colors">
        <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '36px' }}>$</span>
        <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '36px' }}>450M</span>
      </span>
      <span className="text-gray-600">|</span>
      <span className="text-white font-normal" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '16px' }}>
        92 Awards
      </span>
    </div>
    <div className="text-xs text-gray-600 mt-1 font-normal" style={{ fontFamily: 'Genos, sans-serif' }}>
      Total value and number of active definitive awards
    </div>
  </div>

  <div className={cn("rounded-lg p-4 border border-gray-700 hover:border-gray-600/30 transition-all group", CONTRACTOR_DETAIL_COLORS.panelColor)}>
    <div className="text-white font-normal uppercase tracking-wider mb-2" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>Estimated Revenue (TTM)</div>
    <div className="flex items-baseline gap-2">
      <span className="font-medium text-[#D2AC38] transition-colors">
        <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '36px' }}>$</span>
        <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '36px' }}>112.5M</span>
      </span>
    </div>
    <div className="text-xs text-gray-600 mt-1 font-normal" style={{ fontFamily: 'Genos, sans-serif' }}>
      Estimated trailing twelve month revenue
    </div>
  </div>

  <div className={cn("rounded-lg p-4 border border-gray-700 hover:border-gray-600/30 transition-all group", CONTRACTOR_DETAIL_COLORS.panelColor)}>
    <div className="text-white font-normal uppercase tracking-wider mb-2" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>Estimated Pipeline</div>
    <div className="flex items-baseline gap-2">
      <span className="font-medium text-[#D2AC38] transition-colors">
        <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '36px' }}>$</span>
        <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '36px' }}>337.5M</span>
      </span>
    </div>
    <div className="text-xs text-gray-600 mt-1 font-normal" style={{ fontFamily: 'Genos, sans-serif' }}>
      Estimated value of remaining and upcoming awards
    </div>
  </div>
</div>

/**
 * KEY IMPLEMENTATION NOTES:
 *
 * 1. Layout: 4-column grid with equal width cards
 * 2. Typography hierarchy:
 *    - Titles: Genos 18px for consistency with other labels
 *    - Values: Large 36px sans-serif for emphasis
 *    - Awards count: 16px sans-serif (reduced from 20px)
 *    - Descriptions: Small Genos text for supporting info
 * 3. Color scheme:
 *    - Primary value color: #D2AC38 (golden)
 *    - Separator: gray-600
 *    - Description text: gray-600
 * 4. Interactive states:
 *    - Hover border changes from gray-700 to gray-600/30
 *    - Smooth transitions on all interactive elements
 * 5. Data displayed:
 *    - Card 1: $1.2B | 278 Awards
 *    - Card 2: $450M | 92 Awards
 *    - Card 3: $112.5M (no award count)
 *    - Card 4: $337.5M (no award count)
 * 6. Spacing:
 *    - mt-4 spacing from the section above
 *    - gap-6 between cards
 *    - p-4 internal padding
 */