/**
 * EXECUTIVE SUMMARY COMPONENT BACKUP
 * Saved: 2024-12-16
 *
 * This backup contains the contractor detail Executive Summary panel with:
 * - 2-column span in 4-column grid
 * - Split layout: 40% image, 60% content
 * - Active Contractor status button with animated indicator
 * - Three content sections: summary, subtext, bullet points
 * - Bottom disclosure with timestamp
 * - Proper height alignment with sibling panels
 */

{/* UPPER LEFT: Executive Summary */}
<div className="col-span-2 h-full">
<HudCard variant="default" priority="high" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
  <div className="p-4 h-full flex flex-col">
    <h3 className="font-normal tracking-wide mb-3 text-gray-200 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
      EXECUTIVE SUMMARY
    </h3>
    <div className="flex-1">
      <div className="border border-gray-600/20 rounded-xl backdrop-blur-sm flex overflow-hidden h-full" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
      {/* Left side - Image with gradient */}
      <div className="relative" style={{ width: '40%' }}>
        <img
          src="/stealth-bomber-new.jpg"
          alt="Defense Technology"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-900/80"></div>
      </div>

      {/* Right side - AI Generated Content */}
      <div className="flex-1 px-6 py-4 flex flex-col justify-center">
        {/* Active Contractor Status Button */}
        <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full w-fit" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor, border: '1px solid #4a4a4a' }}>
          <div className="relative flex items-center justify-center">
            <div className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
            <div className="relative w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
          <span className="text-xs text-gray-300 uppercase tracking-widest font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
            Active Contractor
          </span>
        </div>

        {/* Section 1: 3-5 word summary */}
        <h4 className="mb-3" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px', color: '#d2ac38', lineHeight: '1.2' }}>
          Strategic defense technology leader
        </h4>

        {/* Section 2: Subtext */}
        <p className="text-gray-300 text-sm font-light leading-tight mb-3">
          Specializing in advanced systems integration across aerospace and next-generation defense platforms.
        </p>

        {/* Section 3: Three bullet points */}
        <ul className="space-y-0.5" style={{ fontSize: '11px' }}>
          <li className="flex items-start">
            <span style={{ color: '#D2AC38' }} className="mr-2">•</span>
            <span className="text-gray-300 leading-tight">Multi-domain operations command and control systems</span>
          </li>
          <li className="flex items-start">
            <span style={{ color: '#D2AC38' }} className="mr-2">•</span>
            <span className="text-gray-300 leading-tight">Advanced aerospace manufacturing and integration</span>
          </li>
          <li className="flex items-start">
            <span style={{ color: '#D2AC38' }} className="mr-2">•</span>
            <span className="text-gray-300 leading-tight">Next-generation intelligence and surveillance platforms</span>
          </li>
        </ul>
      </div>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-gray-700">
      <p className="text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '12px' }}>
        ANALYSIS AS OF {new Date().toLocaleString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).toUpperCase()}
      </p>
    </div>
  </div>
</HudCard>
</div>

/**
 * KEY IMPLEMENTATION NOTES:
 *
 * 1. Layout Structure:
 *    - col-span-2 h-full: Takes 2 columns in grid, full height
 *    - HudCard with h-full: Ensures card fills container
 *    - Flex column with flex-1 content area
 *
 * 2. Content Container:
 *    - 40/60 split between image and content
 *    - Image has gradient overlay for text readability
 *    - Content centered vertically with justify-center
 *
 * 3. Typography:
 *    - Title: Genos 18px uppercase
 *    - Summary: Genos 18px in gold (#d2ac38)
 *    - Status button: Genos text-xs
 *    - Bullets: 11px font size
 *    - Disclosure: Genos 12px
 *
 * 4. Visual Elements:
 *    - Animated green indicator on status button
 *    - Gradient on image from transparent to gray-900/80
 *    - Border color #4a4a4a on status button
 *    - Gold bullet points (#D2AC38)
 *
 * 5. Spacing:
 *    - p-4 container padding
 *    - mb-3 after major sections
 *    - space-y-0.5 between bullet points
 *    - mt-3 pt-3 for disclosure section
 *
 * 6. Dynamic Timestamp:
 *    - Uses new Date().toLocaleString() for real-time display
 *    - Format: MM/DD/YYYY, H:MM AM/PM
 *    - Converted to uppercase for consistency
 */