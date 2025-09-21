# Design System Documentation

This folder contains the technical design frameworks and patterns used throughout the contractor detail interface.

## Contents

### 0. `FOUNDATIONAL-container-structure.md` **[FOUNDATIONAL]**
**CRITICAL FOUNDATIONAL DOCUMENT** - Defines the official 3-layer terminology:
- **PANEL (Layer 1)**: Obsidian aesthetic outer framework with grid and glow effects
- **CONTAINER (Layer 2)**: #1F2937 background content organization layer
- **CONTENTBOX (Layer 3)**: Individual content elements/cards within containers
- Communication standards and visual hierarchy documentation
- **DO NOT MODIFY WITHOUT EXPLICIT APPROVAL**

### 1. `panel-frameworks.md`
Complete technical analysis of the 3-part panel system (Asset Management framework), including:
- External panel container with accent colors and animated grids
- Internal content container with proper spacing and layout
- Chart-style content container with official gunmetal background
- Typography system (Genos vs System fonts) and color schemes
- Animation framework and technical implementation details

### 2. `AssetManagement-implementation.tsx`
Complete 3-part panel system (the official framework used throughout the application):
- External panel container with accent colors and animated grids
- Internal content container with proper spacing and z-index
- Chart-style content container with official gunmetal background (#223040)
- Dynamic accent color system and complete usage examples

### 3. `TabNavigation-implementation.tsx`
Complete tab navigation banner framework with reusable components:
- Navigation container with backdrop blur and orange borders
- Tab button components with Michroma typography
- Icon integration system with Lucide React icons
- State management hooks and CSS custom properties
- Design tokens for consistent styling

### 4. `MetricCards-implementation.tsx`
Key metric cards framework with comprehensive styling system:
- Metric card containers with gradient backgrounds and accent bars
- Typography hierarchy from Genos titles to micro descriptions
- Dynamic accent color system with 4-color palette
- Grid layout system for 4-column metric displays
- Complete component library with hooks and CSS custom properties

## Design Principles

### Color System
- **Primary Accent**: `#F97316` (Orange)
- **Opacity Variations**: `/30`, `/50` for borders and hover states
- **Background Gradients**: Black to gray-900 vertical gradients
- **Text Colors**: Gray-200 for titles, white for controls

### Typography Hierarchy
- **Panel Titles**: Genos font, 18px, 0.0125em letter-spacing, uppercase
- **Tab Navigation**: Michroma font, 16px, tight tracking, capitalize
- **Metric Titles**: Genos font, 12px, wide tracking, uppercase
- **Metric Values**: 30px, medium weight, accent colors
- **Controls**: System fonts, 12px, light weight
- **Consistent kerning** across all Genos elements

### Animation Framework
- **Border Transitions**: 500ms for hover states
- **Glow Effects**: 300ms opacity transitions
- **Background Grids**: Subtle 5% opacity patterns

### Layout Patterns
- **External Containers**: Full height cards with rounded corners
- **Internal Containers**: Flexible column layouts with proper z-indexing
- **Header/Content Structure**: Consistent flex layouts with space distribution

## Usage Guidelines

1. **Reusability**: Use the framework components from `AwardsAndRevenueHistory-implementation.tsx`
2. **Consistency**: Follow the design tokens for color, typography, and spacing
3. **Performance**: Maintain the z-index layering for optimal rendering
4. **Accessibility**: Preserve focus states and proper contrast ratios

## Framework Extensions

This framework can be extended to other panel types by:
- Maintaining the external container structure
- Adapting the internal content layout as needed
- Preserving typography and color consistency
- Following the same animation and interaction patterns