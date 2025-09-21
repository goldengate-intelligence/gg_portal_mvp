# Color Palette Documentation

## Base Colors
These colors form the foundation of the UI, used for backgrounds, panels, and containers.

### Background Colors
| Color | Hex Code | RGB | Usage |
|-------|----------|-----|--------|
| **Primary Background** | `#010204` | rgb(1, 2, 4) | Main page background, primary sections. Midpoint between original dark and pure black |
| **Banner Background** | `#000102` | rgb(0, 1, 2) | Top and bottom fixed banners |
| **Container Color** | `#1F2937` | rgb(31, 41, 55) | Elements inside panels (charts, network graphs, person cards outer) |
| **Panel Overlay** | `#111827` | rgb(17, 24, 39) | Contact info boxes inside person cards (solid gray-900) |
| **Panel Transparent** | `rgba(17, 24, 39, 0.3)` | - | Cards/panels with transparency (bg-gray-900/30) |

### Border & Divider Colors
| Color | Hex Code | Usage |
|-------|----------|--------|
| **Border Primary** | `#374151` | rgb(55, 65, 81) | Primary borders (gray-700) |
| **Border Secondary** | `#1F2937` | rgb(31, 41, 55) | Secondary borders (gray-800) |
| **Border Subtle** | `rgba(55, 65, 81, 0.5)` | Subtle borders (gray-700/50) |
| **Border Hover** | `rgba(75, 85, 99, 0.2)` | Hover state borders (gray-600/20) |

## Accent Colors
These are the vibrant colors used for highlighting, status indicators, metrics, and interactive elements.

### Primary Brand Colors
| Color | Hex Code | Usage |
|-------|----------|--------|
| **Gold** | `#D2AC38` | Primary accent - headers, key metrics, important text, dropdown borders |
| **Mint/Teal** | `#4EC9B0` | Time-series performance bars, active awards, tracking indicators |
| **Coral/Orange** | `#E8744B` | Revenue metrics, warning states |
| **Lavender** | `#9B7EBD` | Pipeline metrics, agency relationships (was purple #7B61FF) |
| **Light Green** | `#22c55e` | Live/tracking indicators, success states |

### Performance Tier Colors
| Color | Hex Code | Usage |
|-------|----------|--------|
| **Elite (Forest Green)** | `#15803d` | 90+ percentile performance, trophy icon background |
| **Strong (Chartreuse)** | `#84cc16` | 70-89 percentile performance, strong metrics |
| **Stable (Yellow)** | `#eab308` | 50-69 percentile performance, growth opportunities, warning icon |

### Status & Semantic Colors
| Color | Hex Code | Usage |
|-------|----------|--------|
| **Red/Danger** | `#FF4C4C` | Critical alerts, hot status, C-level indicators |
| **Yellow/Warning** | `#FFD166` | VP level, medium priority, caution states |
| **Green/Success** | `#06D6A0` | Director level, positive growth, success indicators |
| **Blue/Info** | `#118AB2` | Information, links, interactive elements |
| **Cyan** | `#5BC0EB` | Network relationships, partner connections |

### Text Colors
| Color | Hex Code | Usage |
|-------|----------|--------|
| **Primary Text** | `#FFFFFF` | Main text, headers |
| **Secondary Text** | `#9CA3AF` | Subtitles, labels (gray-400) |
| **Muted Text** | `#6B7280` | Disabled, tertiary text (gray-500) |
| **Dim Text** | `#4B5563` | Very subtle text (gray-600) |

## Usage Guidelines

### Color Hierarchy
1. **Backgrounds**: Progress from darkest (#000102) to lightest (#1F2937)
   - Banners: #000102
   - Main background: #010204
   - Panels: rgba(17, 24, 39, 0.3) or #111827
   - Containers: #1F2937

2. **Accent Usage**:
   - **Gold (#D2AC38)**: Reserved for primary actions, key metrics, and navigation
   - **Mint (#4EC9B0)**: Data visualization, positive trends
   - **Coral (#E8744B)**: Revenue, financial metrics
   - **Lavender (#9B7EBD)**: Secondary metrics, pipeline data
   - **Green shades**: Performance tiers and status indicators

### Component-Specific Colors

#### Key Metric Cards
- Lifetime Awards: Gold (#D2AC38)
- Active Awards: Mint (#4EC9B0)
- Revenue TTM: Coral (#E8744B)
- Pipeline: Lavender (#9B7EBD)

#### Performance Insights
- Elite Performance (91st percentile): Forest Green (#15803d) with trophy icon
- Growth Opportunity (68th percentile): Yellow (#eab308) with warning icon
- Insight card borders match their respective tier colors

#### Charts & Graphs
- Time-Series Performance:
  - Awards bars: Mint (#4EC9B0)
  - Revenue line: Gold (#D2AC38)
- Agency Relationships bars: Mint (#4EC9B0)
- Network nodes:
  - Agencies: Lavender (#9B7EBD)
  - Contractors: Contextual colors based on relationship

#### Interactive Elements
- Dropdown borders: Gold (#D2AC38)
- Hover states: Lighter shade or opacity change
- Active/Live indicators: Light Green (#22c55e) with pulse animation

## Color Tokens in Code

### CONTRACTOR_DETAIL_COLORS object
```typescript
{
  bannerColor: '#000102',
  backgroundColor: '#010204',
  panelColor: 'bg-gray-900/30',
  containerColor: '#1F2937'
}
```

### Tailwind Classes Used
- Background: `bg-gray-900/30`, `bg-black/40`, `bg-black/60`
- Text: `text-white`, `text-gray-400`, `text-gray-500`, `text-gray-600`
- Borders: `border-gray-700/30`, `border-gray-800`, `border-gray-600/20`
- Accent classes: Custom hex values via inline styles

## Notes
- Opacity is frequently used to create depth (10%, 20%, 30%, 40%, 60%)
- Gradient overlays use `from-[color]/30 to-transparent` pattern
- Hover states typically increase opacity or lighten the color
- Animation colors (pulse, glow) use the same accent colors with box-shadow effects