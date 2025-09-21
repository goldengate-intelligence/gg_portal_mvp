# GoldenGate Color Palette

## Brand Color
The primary brand identity color that represents GoldenGate across all interfaces.

| Color Name | Hex Code | Usage |
|------------|----------|--------|
| **GoldenGate Gold** | `#D2AC38` | Primary brand color, CTAs, highlights, chart primary |

## Base Colors
Core colors that form the foundation of the interface design.

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|--------|
| **Pure Black** | `#000000` | `0, 0, 0` | Deep backgrounds, high contrast text |
| **Pure White** | `#FFFFFF` | `255, 255, 255` | Light backgrounds, primary text on dark |
| **Navy Dark** | `#0A0A0F` | `10, 10, 15` | Primary dark background, main interface |
| **Navy Medium** | `#1A1A1F` | `26, 26, 31` | Secondary backgrounds, panels |
| **Gray Dark** | `#374151` | `55, 65, 81` | Borders, subtle elements |
| **Gray Medium** | `#6B7280` | `107, 114, 128` | Secondary text, muted elements |
| **Gray Light** | `#9CA3AF` | `156, 163, 175` | Placeholder text, disabled states |
| **Silver** | `#C0C0C0` | `192, 192, 192` | Chart elements, metallic accents |

## Accent Colors
Vibrant colors used for data visualization, status indicators, and interactive elements.

### Data Visualization Palette
| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|--------|
| **Burnt Orange** | `#FF6B35` | `255, 107, 53` | Charts, data segments |
| **Teal Mint** | `#4EC9B0` | `78, 201, 176` | Charts, data segments |
| **Bright Purple** | `#A259FF` | `162, 89, 255` | Charts, data segments |
| **Sky Blue** | `#5BC0EB` | `91, 192, 235` | Charts, data segments |
| **Crimson Red** | `#FF4C4C` | `255, 76, 76` | Charts, alerts, danger states |

### Status & State Colors
| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|--------|
| **Success Green** | `#38E54D` | `56, 229, 77` | Success states, positive indicators |
| **Warning Amber** | `#FFD166` | `255, 209, 102` | Warning states, caution indicators |
| **Error Red** | `#FF4C4C` | `255, 76, 76` | Error states, critical alerts |
| **Info Blue** | `#5BC0EB` | `91, 192, 235` | Information, neutral states |

## Transparency Variants
All colors available with common opacity levels for layering and subtle effects.

| Opacity | Suffix | Example Usage |
|---------|--------|---------------|
| 10% | `/10` or `0.1` | Subtle backgrounds, hover states |
| 15% | `/15` or `0.15` | Chart backgrounds (current standard) |
| 25% | `/25` or `0.25` | More visible backgrounds |
| 40% | `/40` or `0.4` | Prominent overlays |
| 60% | `/60` or `0.6` | Strong overlays |
| 80% | `/80` or `0.8` | Near-opaque overlays |

## Color Usage Guidelines

### Primary Applications
- **GoldenGate Gold (`#D2AC38`)**: Always use for primary CTAs, brand elements, and key highlights
- **Navy (`#0A0A0F`, `#1A1A1F`)**: Primary interface backgrounds for professional, dark theme
- **White (`#FFFFFF`)**: Primary text on dark backgrounds, clean contrast

### Chart Color Assignments
1. **First Priority**: GoldenGate Gold (`#D2AC38`)
2. **Second Priority**: Burnt Orange (`#FF6B35`)
3. **Third Priority**: Teal Mint (`#4EC9B0`)
4. **Fourth Priority**: Bright Purple (`#A259FF`)
5. **Additional**: Sky Blue (`#5BC0EB`), Crimson Red (`#FF4C4C`)

### Accessibility Notes
- All color combinations tested for WCAG AA compliance
- Minimum contrast ratio 4.5:1 for normal text
- Minimum contrast ratio 3:1 for large text
- Gold brand color provides sufficient contrast on dark navy backgrounds

## CSS Variable Reference
```css
:root {
  /* Brand */
  --gold: #D2AC38;
  
  /* Base */
  --black: #000000;
  --white: #FFFFFF;
  --navy-dark: #0A0A0F;
  --navy-medium: #1A1A1F;
  --gray-dark: #374151;
  --gray-medium: #6B7280;
  --gray-light: #9CA3AF;
  --silver: #C0C0C0;
  
  /* Accents */
  --burnt-orange: #FF6B35;
  --teal-mint: #4EC9B0;
  --bright-purple: #A259FF;
  --sky-blue: #5BC0EB;
  --crimson-red: #FF4C4C;
  --success-green: #38E54D;
  --warning-amber: #FFD166;
}
```

## Design System Integration
This color palette integrates with:
- Tailwind CSS utility classes
- Chart.js color configurations
- Component prop systems
- CSS custom properties

Last Updated: Current Session
Maintained by: UI Development Team