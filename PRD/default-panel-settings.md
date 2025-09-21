# Default Panel Settings

This document preserves the original/default panel and container settings for the GoldenGate contractor detail pages.

## Original CONTRACTOR_DETAIL_COLORS Settings

```typescript
export const CONTRACTOR_DETAIL_COLORS = {
  bannerColor: '#000102',      // Top and bottom fixed banners
  backgroundColor: '#010204',   // Main page background and primary contractor info section - midpoint between original and pure black
  panelColor: 'bg-gray-900/30',       // Cards/panels hovering on top of background (Tailwind class)
  panelColorHex: '#111827',    // Cards/panels hovering on top of background (hex color - gray-900)
  containerColor: '#1F2937', // Elements inside panels (Executive Summary text, charts, network graphs, etc.)
}
```

## Usage Context

### panelColor (`bg-gray-900/30`)
- Used for main panel backgrounds in contractor detail tabs
- Applied to Card components and major section containers
- Creates a subtle dark overlay effect

### containerColor (`#1F2937`)
- Used for content containers within panels
- Applied to chart backgrounds, text content areas, and nested components
- Provides a solid dark gray background for readability

### Example Usage in Code
```tsx
// Main panel styling
<Card style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}>

// Internal container styling
<div style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
```

## Components That Use These Settings

- Executive Summary Panel
- Performance Summary Panel
- Activity Analysis Panel
- Network Summary Panel
- Contact Filter Panel
- All tab content containers

## Restore Command
To restore these defaults if needed:
```bash
# Update utils.ts with the original values above
```

---
*Last updated: Current session*
*Purpose: Preserve default styling for potential restoration*