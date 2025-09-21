# Goldengate Design System

## Color Palette

### Base Colors
These colors define the hierarchical structure of the UI, from outermost containers to innermost content areas.

- **Banner Color**: `#000102` - Top and bottom fixed banners (header/footer)
- **Background Color**: `#04070a` - Main page background and primary contractor info section
- **Panel Color**: `bg-gray-900/30` - Cards/panels hovering on top of background (translucent)
- **Container Color**: `#1F2937` - Elements inside panels (Executive Summary text, charts, network graphs, etc.)

### Accent Colors
Brand colors used for data visualization, highlights, and interactive elements.

- **Goldengate Gold**: `#D2AC38` - Primary brand color, used for main contractor and key metrics
- **Burnt Orange**: `#FF6B35` - Used for performance indicators and warnings
- **Teal Mint**: `#4EC9B0` - Used for award bars and success states
- **Bright Purple**: `#A259FF` - Used for special highlights and secondary data
- **Sky Blue**: `#5BC0EB` - Used for Award Inflows (prime contractors)
- **Crimson Red**: `#FF4C4C` - Used for Award Outflows (subcontractors)
- **Fresh Green**: `#38E54D` - Used for positive growth and active states
- **Soft Amber**: `#FFD166` - Used for neutral highlights and tooltips
- **Aqua Jade**: `#06D6A0` - Used for secondary success states
- **Deep Blue**: `#118AB2` - Used for tertiary data and alternative highlights

## Typography

### Font Families
- **Headers/Branding**: `Michroma, sans-serif` - Used for main branding
- **Panel Titles**: `Genos, sans-serif` - Used for all panel-level text
- **Container Content**: `system-ui, -apple-system, sans-serif` - Used for content within containers
- **Data/Technical**: `Orbitron, monospace` - Used for technical displays and network graphs

### Font Sizes
- **Panel Titles**: `text-2xl` (24px)
- **Metric Values**: `50px` (Genos) with `34px` dollar signs (system font)
- **Tab Navigation**: `text-xl` (20px)
- **Body Text**: `text-sm` (14px)

## Component Hierarchy

1. **Banner Level** - Fixed navigation elements
2. **Background Level** - Main page structure
3. **Panel Level** - Interactive cards and sections
4. **Container Level** - Content within panels

## Component Groups

### HeadlineGroup
The four primary metric boxes displayed at the top of contractor detail pages:
- Lifetime Awards
- Active Awards
- Estimated Revenue (TTM)
- Estimated Pipeline

These components use the panelColor (bg-gray-900/30) background and display key financial metrics with:
- Genos font for titles and labels
- System font for dollar signs (34px)
- Genos font for values (50px)
- Gold (#D2AC38) for metric values

## Usage Guidelines

### Color Application
- Maintain the 4-level hierarchy consistently across all pages
- Use accent colors sparingly for emphasis
- Ensure sufficient contrast for accessibility
- Apply translucency only at the panel level

### Typography Rules
- Dollar signs always use system font, scaled proportionally to accompanying numbers
- Genos font for all panel-level elements
- System fonts for all container content
- Maintain consistent sizing across similar elements