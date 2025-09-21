# Panel Design Frameworks

## 3-Part Panel System (Asset Management Framework)

This is the official 3-part panel system used throughout the application, demonstrated by the Asset Management panel in `/platform/portfolio`.

### Part 1: External Panel Container

**Base Structure:**
```tsx
const ExternalPanelContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="h-full border border-[#8B8EFF]/30 rounded-xl overflow-hidden shadow-2xl hover:border-[#8B8EFF]/50 transition-all duration-500 group relative bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 backdrop-blur-sm">
    {/* Animated background grid */}
    <div className="absolute inset-0 opacity-5 z-0">
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(90deg, #8B8EFF 1px, transparent 1px),
          linear-gradient(180deg, #8B8EFF 1px, transparent 1px)
        `,
        backgroundSize: '15px 15px'
      }} />
    </div>

    {/* Glow effect on hover */}
    <div className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-0"
         style={{ background: 'linear-gradient(135deg, #8B8EFF20, transparent)' }} />

    {children}
  </div>
);
```

**Key Design Elements:**

1. **Border & Outline:**
   - Base: `border-[accent-color]/30` (Accent color with 30% opacity)
   - Hover: `hover:border-[accent-color]/50` (Accent color with 50% opacity on hover)
   - Style: `rounded-xl` (12px border radius)

2. **Background Gradient:**
   - `bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90`
   - Vertical gradient: black (90% opacity) → gray-900 (50% opacity) → black (90% opacity)
   - Backdrop blur: `backdrop-blur-sm`

3. **Animated Background Grid:**
   - Creates subtle accent color grid pattern at 5% opacity
   - 15px x 15px grid cells
   - 1px accent color lines with transparency
   - Applied absolutely with `z-0`

4. **Hover Glow Effect:**
   - Diagonal gradient glow on hover
   - Uses accent color with 20 hex opacity (`#8B8EFF20`)
   - 300ms transition duration
   - Positioned absolutely with `z-0`

5. **Container Properties:**
   - Height: `h-full`
   - Shadow: `shadow-2xl`
   - Overflow: `overflow-hidden`
   - Positioning: `relative` with `group` for hover effects
   - Transitions: `transition-all duration-500`

### Part 2: Internal Content Container

**Base Structure:**
```tsx
const InternalContentContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 h-full flex flex-col relative z-10">
    {children}
  </div>
);
```

**Key Properties:**
- Padding: `p-4` (16px all sides)
- Layout: `flex flex-col` (vertical flex layout)
- Height: `h-full` (fills parent container)
- Z-index: `z-10` (above background elements)
- Positioning: `relative` for proper stacking context

**Content Structure:**
1. **Header Section** with panel title (`mb-4` spacing)
2. **Content Section** with `flex-1` to fill remaining space

### Part 3: Content Container (Chart-Style)

**Base Structure:**
```tsx
// IMPORTANT: OFFICIAL GUNMETAL COLOR = #223040
// This is our verified gunmetal color for internal containers
// This color was specifically chosen and verified to match the design requirements
// NOTE: No border - the external panel handles the outline
const ChartStyleContainer = ({ children }: { children: React.ReactNode }) => (
  <div
    className="rounded-lg p-4"
    style={{
      backgroundColor: '#223040' // ← VERIFIED CORRECT COLOR FOR GRAY CONTAINERS
    }}
  >
    {children}
  </div>
);
```

**Key Properties:**
- Background Color: `#223040` (Official Gunmetal - verified correct color)
- Padding: `p-4` (16px all sides)
- Border Radius: `rounded-lg` (8px)
- **No Border** - External panel provides the outline styling

**Usage Pattern:**
- Contains the actual content/data display
- Provides consistent internal styling
- Works within the flex-1 content section
- Maintains visual separation from the external container

### Typography Specifications

**Panel Title (Genos Font - Internal Container):**
```tsx
const PanelTitle = ({ children }: { children: React.ReactNode }) => (
  <h3
    className="text-gray-200 font-normal uppercase tracking-wider"
    style={{
      fontFamily: 'Genos, sans-serif',
      fontSize: '18px',
      letterSpacing: '0.0125em'
    }}
  >
    {children}
  </h3>
);
```

**Typography Settings:**
- Font Family: `Genos, sans-serif`
- Font Size: `18px`
- Letter Spacing: `0.0125em` (tight kerning)
- Text Transform: `uppercase`
- Font Weight: `font-normal`
- Color: `text-gray-200` (light gray)

**Content Elements (System Font):**
- Font Family: `system-ui, -apple-system, sans-serif`
- Various sizes depending on content hierarchy
- Standard Tailwind color classes

### Color Scheme System

**Accent Color Variations:**
- Primary: `#8B8EFF` (Purple/Indigo for portfolio)
- Orange: `#F97316` (Primary orange for contractor detail)
- Can be customized per module/section

**Accent Color Usage:**
- Border: `/30` opacity base, `/50` opacity hover
- Grid pattern: At 5% opacity
- Glow effect: With `20` hex opacity suffix

**Background Colors:**
- External gradient: `from-black/90 via-gray-900/50 to-black/90`
- Internal content: `#223040` (Official Gunmetal)

**Text Colors:**
- Panel titles: `text-gray-200`
- Content: Various grays depending on hierarchy

### Layout Structure

**Complete 3-Part Implementation:**
```tsx
<ExternalPanelContainer>
  <InternalContentContainer>
    {/* Header Section */}
    <div className="mb-4">
      <PanelTitle>PANEL TITLE</PanelTitle>
    </div>

    {/* Content Section */}
    <div className="flex-1">
      <ChartStyleContainer>
        {/* Actual content goes here */}
      </ChartStyleContainer>
    </div>
  </InternalContentContainer>
</ExternalPanelContainer>
```

### Animation & Interaction

**Transition Properties:**
- External container: `transition-all duration-500`
- Glow effect: `transition-opacity duration-300`

**Hover States:**
- Border: Increases opacity from 30% to 50%
- Glow: Fades in diagonal accent gradient at 10% opacity

### Technical Implementation Notes

**Z-Index Layering:**
1. Background grid: `z-0` (behind everything)
2. Glow effect: `z-0` (behind everything)
3. Internal content: `z-10` (above backgrounds)

**Color Customization:**
- Accent color can be changed per module
- Maintains consistent opacity relationships
- Grid and glow effects use same accent color

**Performance Considerations:**
- Uses CSS transforms for positioning
- Backdrop blur for performance over pure transparency
- Group hover states for efficient event handling

**Responsive Design:**
- `h-full` containers adapt to parent sizing
- Flex layouts with `flex-1` for content distribution
- Consistent padding and spacing system

---

## Tab Navigation Banner Framework

### External Navigation Container

**Base Structure:**
```tsx
<div className="mb-8">
  <div className="flex items-center gap-2 p-2 border border-[#F97316]/30 rounded-xl backdrop-blur-md w-full bg-gradient-to-b from-gray-900/90 via-gray-800/90 to-gray-900/90 hover:border-[#F97316]/50 transition-all duration-500">
```

**Key Design Elements:**

1. **Border & Outline:**
   - Base: `border-[#F97316]/30` (Orange with 30% opacity)
   - Hover: `hover:border-[#F97316]/50` (Orange with 50% opacity on hover)
   - Style: `rounded-xl` (12px border radius)

2. **Background Gradient:**
   - `bg-gradient-to-b from-gray-900/90 via-gray-800/90 to-gray-900/90`
   - Vertical gradient: gray-900 (90% opacity) → gray-800 (90% opacity) → gray-900 (90% opacity)
   - Backdrop blur: `backdrop-blur-md`

3. **Container Properties:**
   - Layout: `flex items-center gap-2` (horizontal flex with 8px gaps)
   - Padding: `p-2` (8px all sides)
   - Width: `w-full` (full container width)
   - Margin: `mb-8` (32px bottom margin)
   - Transitions: `transition-all duration-500`

### Tab Button Elements

**Base Structure:**
```tsx
<button
  className={cn(
    "flex-1 px-8 py-4 text-base font-normal tracking-tight transition-all duration-500 rounded-lg capitalize text-center",
    activeTab === tab
      ? "text-[#D2AC38]"
      : "text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 hover:backdrop-blur-sm"
  )}
  style={{ fontFamily: 'Michroma, sans-serif', fontSize: '16px' }}
>
```

**Key Properties:**

1. **Layout & Spacing:**
   - Distribution: `flex-1` (equal width distribution)
   - Padding: `px-8 py-4` (32px horizontal, 16px vertical)
   - Border radius: `rounded-lg` (8px)
   - Text alignment: `text-center`

2. **Typography (Michroma Font):**
   - Font Family: `Michroma, sans-serif`
   - Font Size: `16px`
   - Font Weight: `font-normal`
   - Text Transform: `capitalize`
   - Letter Spacing: `tracking-tight` (tight kerning)

3. **State Management:**
   - **Active State:**
     - Text color: `text-[#D2AC38]` (gold)
   - **Inactive State:**
     - Text color: `text-gray-400`
     - Hover text: `hover:text-gray-200`
     - Hover background: `hover:bg-gray-900/40`
     - Hover backdrop: `hover:backdrop-blur-sm`

4. **Icon Integration:**
   ```tsx
   {tab === 'overview' && <Globe className="inline w-5 h-5 mr-2" />}
   {tab === 'performance' && <BarChart3 className="inline w-5 h-5 mr-2" />}
   {tab === 'network' && <Share2 className="inline w-5 h-5 mr-2" />}
   {tab === 'activity' && <Activity className="inline w-5 h-5 mr-2" />}
   {tab === 'contacts' && <Users className="inline w-5 h-5 mr-2" />}
   ```
   - Icon size: `w-5 h-5` (20px x 20px)
   - Icon spacing: `mr-2` (8px right margin)
   - Display: `inline` (inline with text)

### Color Scheme

**Primary Colors:**
- Orange Border: `#F97316` at 30%/50% opacity
- Gold Active Text: `#D2AC38`

**Background Colors:**
- Container: `from-gray-900/90 via-gray-800/90 to-gray-900/90`
- Button hover: `bg-gray-900/40`

**Text Colors:**
- Active: `#D2AC38` (gold)
- Inactive: `text-gray-400`
- Hover: `text-gray-200`

### Animation & Interaction

**Transition Properties:**
- Container: `transition-all duration-500`
- Buttons: `transition-all duration-500`

**Hover States:**
- Container border: Increases opacity from 30% to 50%
- Button text: Gray-400 → Gray-200
- Button background: Transparent → Gray-900 at 40% opacity
- Backdrop blur activation on button hover

### Layout Structure

**Container Layout:**
- Horizontal flex container with equal-width distribution
- 8px gaps between tab buttons
- 8px internal padding in container

**Button Layout:**
- Equal flex distribution (`flex-1`)
- Centered text and icon alignment
- Icon-text horizontal layout with 8px spacing

### Technical Implementation Notes

**Font Loading:**
- Uses Michroma font (ensure proper font loading)
- Fallback to sans-serif for compatibility

**State Management:**
- Conditional styling based on `activeTab` state
- Hover states independent of active state

**Accessibility:**
- Proper button semantics
- Focus states inherit from button defaults
- Color contrast maintained for text visibility

---

## Key Metric Cards Framework

### External Metric Card Container

**Base Structure:**
```tsx
<div className="rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/40 transition-all group relative overflow-hidden">
```

**Key Design Elements:**

1. **Border & Outline:**
   - Base: `border-gray-700/50` (Gray-700 with 50% opacity)
   - Hover: `hover:border-gray-600/40` (Gray-600 with 40% opacity on hover)
   - Style: `rounded-lg` (8px border radius)

2. **Background Gradient:**
   ```tsx
   <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-lg"></div>
   ```
   - Vertical gradient: gray-900 (50% opacity) → gray-800 (25% opacity) → gray-900 (50% opacity)
   - Positioned absolutely to fill container

3. **Color Accent Bar:**
   ```tsx
   <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ backgroundColor: accentColor }}></div>
   ```
   - Full-height vertical bar on left edge
   - 2px width with dynamic accent color
   - Positioned absolutely from top to bottom

4. **Container Properties:**
   - Padding: `p-4` (16px all sides)
   - Transitions: `transition-all` (all properties animated)
   - Group hover: `group` for coordinated hover effects
   - Overflow: `overflow-hidden` (clips background elements)

### Internal Content Structure

**Base Structure:**
```tsx
<div className="relative z-10">
  <div className="pl-2">
```

**Key Properties:**
- Z-index: `z-10` (above background elements)
- Left padding: `pl-2` (8px to offset from accent bar)

### Typography Specifications

**Metric Title (Genos Font):**
```tsx
<div className="text-gray-500 font-normal uppercase tracking-wide mb-3"
     style={{ fontFamily: 'Genos, sans-serif', fontSize: '12px' }}>
```

**Typography Settings:**
- Font Family: `Genos, sans-serif`
- Font Size: `12px`
- Font Weight: `font-normal`
- Text Transform: `uppercase`
- Letter Spacing: `tracking-wide`
- Color: `text-gray-500`
- Margin: `mb-3` (12px bottom)

**Metric Value (Large Accent Color):**
```tsx
<span className="font-medium"
      style={{ color: accentColor, fontSize: '30px', lineHeight: '1' }}>
```

**Value Typography:**
- Font Size: `30px`
- Line Height: `1` (tight leading)
- Font Weight: `font-medium`
- Color: Dynamic accent color
- Display: Inline baseline alignment

**Count and Label (Small White/Gray):**
```tsx
<div className="flex items-center justify-between text-[11px]">
  <div className="flex items-baseline gap-1.5">
    <span className="text-white/70 font-medium">{count}</span>
    <span className="text-gray-500 uppercase tracking-wide">{countLabel}</span>
  </div>
  <span className="text-gray-600 uppercase tracking-wider">{timeframe}</span>
</div>
```

**Count/Label Typography:**
- Font Size: `text-[11px]` (11px)
- Count color: `text-white/70` (white with 70% opacity)
- Label color: `text-gray-500`
- Timeframe color: `text-gray-600`
- Text transform: `uppercase`
- Letter spacing: `tracking-wide` and `tracking-wider`
- Gap between elements: `gap-1.5` (6px)

**Description (Tiny Gray):**
```tsx
<div className="text-[9px] text-gray-600 mt-3 uppercase tracking-wider">
```

**Description Typography:**
- Font Size: `text-[9px]` (9px)
- Color: `text-gray-600`
- Text Transform: `uppercase`
- Letter Spacing: `tracking-wider`
- Margin: `mt-3` (12px top)

### Grid Layout System

**Container Grid:**
```tsx
<div className="mt-2 grid grid-cols-4 gap-6">
```

**Grid Properties:**
- Layout: `grid grid-cols-4` (4 equal columns)
- Gap: `gap-6` (24px between cards)
- Margin: `mt-2` (8px top margin)

### Color Scheme

**Accent Colors (Per Metric):**
- Lifetime Awards: `#F97316` (Primary orange)
- Active Awards: `#FFB84D` (Light orange/amber)
- Revenue TTM: `#42D4F4` (Cyan/blue)
- Pipeline: `#8B8EFF` (Purple/lavender)

**Background Colors:**
- Card gradient: `from-gray-900/50 via-gray-800/25 to-gray-900/50`
- Border base: `border-gray-700/50`
- Border hover: `border-gray-600/40`

**Text Colors:**
- Title: `text-gray-500`
- Value: Dynamic accent color
- Count: `text-white/70`
- Label: `text-gray-500`
- Timeframe: `text-gray-600`
- Description: `text-gray-600`

### Layout Hierarchy

**Vertical Structure:**
1. **Title** - Genos 12px, gray-500, uppercase
2. **Value Section** - 30px accent color, baseline aligned
3. **Count/Label Row** - 11px, justified space-between
   - Left: Count (white/70) + Label (gray-500)
   - Right: Timeframe (gray-600)
4. **Description** - 9px, gray-600, uppercase

**Spacing:**
- Title margin: `mb-3` (12px)
- Value section: `space-y-2` (8px vertical gaps)
- Description margin: `mt-3` (12px)
- Container padding: `p-4` (16px)
- Accent bar offset: `pl-2` (8px)

### Animation & Interaction

**Transition Properties:**
- Card hover: `transition-all` (all properties)
- Border state changes on hover

**Hover States:**
- Border: Gray-700/50 → Gray-600/40 (lighter on hover)
- Group coordination for potential child element animations

### Technical Implementation Notes

**Z-Index Layering:**
- Background gradient: Default stacking (behind)
- Accent bar: Default stacking (behind)
- Content container: `z-10` (above backgrounds)

**Dynamic Styling:**
- Accent colors applied via inline styles for flexibility
- Typography mix of Tailwind classes and inline styles

**Responsive Considerations:**
- 4-column grid layout
- Fixed 24px gaps between cards
- Consistent card proportions with padding