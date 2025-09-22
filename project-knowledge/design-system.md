# Design System - GoldenGate Platform

## Design Philosophy
**Military/Tactical Aesthetic** with enterprise-grade usability
- Dark theme with strategic color accents
- Typography hierarchy for clear information architecture
- Consistent patterns across all interfaces
- Performance-optimized modular components

## Color System

### Base Colors (Hierarchical Structure)
- **Banner Color**: `#000102` - Top and bottom fixed banners (header/footer)
- **Background Color**: `#04070a` - Main page background and primary contractor info section
- **Panel Color**: `bg-gray-900/30` - Cards/panels hovering on top of background (translucent)
- **Container Color**: `#1F2937` - Elements inside panels (Executive Summary text, charts, network graphs, etc.)

### Accent Colors (Data Visualization & Interaction)
- **Goldengate Gold**: `#D2AC38` - Primary brand color, main contractor and key metrics
- **Burnt Orange**: `#FF6B35` - Performance indicators and warnings
- **Teal Mint**: `#4EC9B0` - Award bars and success states
- **Bright Purple**: `#A259FF` - Special highlights and secondary data
- **Sky Blue**: `#5BC0EB` - Award Inflows (prime contractors)
- **Crimson Red**: `#FF4C4C` - Award Outflows (subcontractors)
- **Fresh Green**: `#38E54D` - Positive growth and active states
- **Soft Amber**: `#FFD166` - Neutral highlights and tooltips
- **Aqua Jade**: `#06D6A0` - Secondary success states
- **Deep Blue**: `#118AB2` - Tertiary data and alternative highlights

## Typography System

### Font Families
- **Headers/Branding**: `Michroma, sans-serif` - Main branding elements
- **Panel Titles**: `Genos, sans-serif` - All panel-level text
- **Container Content**: `system-ui, -apple-system, sans-serif` - Content within containers
- **Data/Technical**: `Orbitron, monospace` - Technical displays and network graphs

### Font Sizes & Patterns
- **Panel Titles**: `text-2xl` (24px)
- **Metric Values**: `50px` (Genos) with `34px` dollar signs (system font)
- **Tab Navigation**: `text-xl` (20px)
- **Body Text**: `text-sm` (14px)
- **Header Pattern**: `text-xs uppercase tracking-wider text-gray-500`

## Component Architecture

### 1. HudCard - Primary Container Component
**Location**: `src/components/ui/hud-card.tsx`

**Properties**:
- `variant`: "default" | "tactical" | "alert"
- `priority`: "low" | "medium" | "high"
- `className`: Additional Tailwind classes
- `isPanel`: Boolean for panel-specific styling

**Usage Pattern**:
```tsx
<HudCard variant="default" priority="high" className="border-gray-700/30">
  <div className="p-4" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
    <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500 mb-3">
      SECTION TITLE
    </h4>
    {/* Content */}
  </div>
</HudCard>
```

### 2. Color Constants
**Location**: `src/lib/utils.ts`

```typescript
export const CONTRACTOR_DETAIL_COLORS = {
  bannerColor: '#000102',          // Top and bottom fixed banners
  backgroundColor: '#010204',       // Main page background
  panelColor: 'bg-gray-900/30',    // Cards/panels (Tailwind class)
  panelColorHex: '#111827',        // Cards/panels (hex equivalent)
  containerColor: '#1F2937',      // Inner container backgrounds
}
```

### 3. Status Indicators
```tsx
{/* Animated tracking indicator */}
<div className="flex items-center gap-2">
  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
  <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
    TRACKING
  </span>
</div>
```

## Component Groups

### HeadlineGroup (Primary Metrics)
Four primary metric boxes for contractor detail pages:
- Lifetime Awards
- Active Awards
- Estimated Revenue (TTM)
- Estimated Pipeline

**Styling**:
- Background: `panelColor` (bg-gray-900/30)
- Typography: Genos font for titles and values
- Dollar signs: System font (34px)
- Values: Genos font (50px)
- Color: Gold (#D2AC38) for metric values

### Input Styling Standards
```tsx
// Consistent input styling across platform
className="bg-black/20 border-gray-700/50 text-gray-300 placeholder-gray-500"
```

## Modular Design Implementation

### Component Hierarchy
1. **Banner Level** - Fixed navigation elements
2. **Background Level** - Main page structure
3. **Panel Level** - Interactive cards and sections
4. **Container Level** - Content within panels

### Refactoring Progress
- **Completed**: HudContractorModal (93% code reduction), AISummaryPanel, NotesSystem
- **In Progress**: DeploymentResults
- **Pending**: NetworkRelationshipVisualizer, ExportManager, CompetitiveBenchmarkPanel

### Migration Pattern
```tsx
// ❌ OLD
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

// ✅ NEW
<HudCard variant="default" priority="medium" className="border-gray-700/30">
  <div className="p-4" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
    <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500 mb-3">
      TITLE
    </h4>
    {/* Content */}
  </div>
</HudCard>
```

## Usage Guidelines

### Color Application
- Maintain 4-level hierarchy consistently across all pages
- Use accent colors sparingly for emphasis
- Ensure sufficient contrast for accessibility
- Apply translucency only at panel level

### Typography Rules
- Dollar signs always use system font, scaled proportionally
- Genos font for all panel-level elements
- System fonts for all container content
- Maintain consistent sizing across similar elements

### Accessibility Standards
- Proper contrast ratios for all text elements
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators for interactive elements

## Performance Considerations
- **Modular Components**: Reduced bundle size through elimination of redundancy
- **Consistent Patterns**: Improved caching and rendering performance
- **Optimized Imports**: Tree-shaking friendly component structure