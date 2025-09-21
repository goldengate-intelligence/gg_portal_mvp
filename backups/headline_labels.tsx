/**
 * HEADLINE LABELS FRAMEWORK BACKUP
 * Saved: 2024-12-16
 *
 * This backup contains the contractor detail headline labels system with:
 * - Company name and action buttons row
 * - UEI/ACTIVITY/PERFORMANCE row with 6-column grid
 * - LOCATION/SECTOR/AGENCY FOCUS row with 6-column grid
 * - Precise alignment between rows using grid positioning
 */

{/* Right Section - Company Details */}
<div className="col-span-3">
  {/* Header Row - Company Name and Buttons */}
  <div className="flex items-start justify-between mb-3">
    <div className="flex items-center gap-4">
      <h1 className="text-4xl font-light text-white tracking-wide font-sans">
        {contractor?.name || 'Trio Fabrication LLC'}
      </h1>
    </div>
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: '/platform/identify' })}
        className="text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-white hover:text-[#D2AC38] border border-gray-800 hover:border-gray-600/30"
      >
        <FolderOpen className="h-4 w-4 mr-2" />
        Save
      </Button>
    </div>
  </div>

  {/* UEI/Activity/Performance Grid - Aligned with Location Grid */}
  <div className="grid grid-cols-6 gap-8 mb-4 text-gray-400">
    <div className="col-span-1 flex items-center gap-2">
      <span className="text-gray-500 font-light uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>UEI:</span>
      <span className="px-1.5 py-0.5 bg-gray-600/20 border border-gray-600/40 rounded-full uppercase tracking-wider text-gray-300 font-sans font-normal" style={{ fontSize: '10px' }}>{contractor?.uei || 'TFL2024XA001'}</span>
    </div>
    <div className="col-span-1 flex items-center gap-2">
      <span className="text-gray-500 font-light uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>ACTIVITY:</span>
      <span className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/40 rounded-full uppercase tracking-wider text-red-400 font-sans font-normal" style={{ fontSize: '10px' }}>Hot</span>
    </div>
    <div className="col-span-2 col-start-3 flex items-center gap-2">
      <span className="text-gray-500 font-light uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>PERFORMANCE:</span>
      <span className="px-1.5 py-0.5 bg-green-500/20 border border-green-500/40 rounded-full uppercase tracking-wider text-green-400 font-sans font-normal" style={{ fontSize: '10px' }}>Elite</span>
    </div>
  </div>

  {/* Company Description Paragraph */}
  <p className="text-white leading-relaxed max-w-3xl mb-6">
    {contractor?.establishedDate && `Established in ${new Date(contractor.establishedDate).getFullYear()}, `}
    {contractor?.name || 'Trio Fabrication LLC'} builds solutions for the {contractor?.industry?.replace('-', ' ') || 'manufacturing'} sector,
    focusing on {contractor?.primaryAgency || 'Defense'} contracts
    {contractor?.primaryNaicsDescription && ` with specialization in ${contractor.primaryNaicsDescription.toLowerCase()}`}.
  </p>

  {/* Location/Sector/Agency Grid - Flat with HUD accents */}
  <div className="grid grid-cols-6 gap-8 mb-8">
    <div className="col-span-2">
      <div className="text-gray-500 font-light uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>LOCATION</div>
      <div className="text-lg text-white font-light">{contractor?.state || 'Texas'}, USA</div>
    </div>
    <div className="col-span-2">
      <div className="text-gray-500 font-light uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>SECTOR</div>
      <div className="text-lg text-white font-light">{contractor?.industry?.replace('-', ' ') || 'Manufacturing'}</div>
    </div>
    <div className="col-span-2">
      <div className="text-gray-500 font-light uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>AGENCY FOCUS</div>
      <div className="text-lg text-white font-light">{contractor?.primaryAgency || 'Defense'}</div>
    </div>
  </div>
</div>

/**
 * KEY DESIGN ELEMENTS:
 *
 * 1. Grid System:
 *    - Both label rows use grid-cols-6 for precise positioning control
 *    - Allows for flexible column spanning and positioning
 *    - Maintains perfect alignment during window resize
 *
 * 2. UEI/ACTIVITY/PERFORMANCE Row:
 *    - UEI: col-span-1 (column 1)
 *    - ACTIVITY: col-span-1 (column 2)
 *    - PERFORMANCE: col-span-2 col-start-3 (columns 3-4)
 *    - Intentionally aligned so PERFORMANCE starts at column 3 to match SECTOR
 *
 * 3. LOCATION/SECTOR/AGENCY Row:
 *    - LOCATION: col-span-2 (columns 1-2)
 *    - SECTOR: col-span-2 (columns 3-4)
 *    - AGENCY FOCUS: col-span-2 (columns 5-6)
 *
 * 4. Typography:
 *    - Labels: Genos font, 18px, uppercase, gray-500
 *    - Values: text-lg for location row, various for UEI row
 *    - Company name: text-4xl font-light
 *
 * 5. Badge Styling (UEI/ACTIVITY/PERFORMANCE):
 *    - Padding: px-1.5 py-0.5 (reduced from px-2 py-1)
 *    - Font size: 10px
 *    - Rounded full with border
 *    - Color-coded backgrounds and borders:
 *      - UEI: gray-600/20 background, gray-600/40 border
 *      - ACTIVITY: red-500/20 background, red-500/40 border
 *      - PERFORMANCE: green-500/20 background, green-500/40 border
 *
 * 6. Layout Structure:
 *    - Both grids at same hierarchical level (direct children of col-span-3)
 *    - No flex containers constraining grid widths
 *    - Consistent gap-8 spacing in both grids
 *    - Description paragraph between the two grid rows
 *
 * 7. Responsive Behavior:
 *    - Grids maintain alignment at all viewport sizes
 *    - Text truncates within grid cells rather than breaking layout
 *    - No manual margins that could break at different sizes
 */