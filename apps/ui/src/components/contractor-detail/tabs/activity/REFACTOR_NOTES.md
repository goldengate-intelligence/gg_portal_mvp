# Award Card View Refactor

## Overview

The original `AwardCardView.tsx` (751 lines) has been broken down into focused, maintainable components without sacrificing any functionality or UI complexity.

## File Structure

### **Main Components**
```
AwardCardViewRefactored.tsx         # Main orchestration component (~50 lines)
├── components/
│   ├── AwardCardHeader.tsx         # Header with title and back button (~40 lines)
│   ├── AwardContainer.tsx          # Container for awards list (~80 lines)
│   ├── AwardItem.tsx              # Individual award card (~60 lines)
│   ├── AwardItemHeader.tsx        # Award title and NAICS display (~50 lines)
│   ├── AwardItemToolbar.tsx       # Action icons with tooltips (~120 lines)
│   ├── AwardItemExpandedContent.tsx # Expanded metrics grid (~80 lines)
│   ├── PerformanceProgressBar.tsx  # Timeline visualization (~80 lines)
│   ├── TemperatureStatusBadge.tsx  # Hot/warm/cold status (~25 lines)
│   └── types/awardCardTypes.ts     # TypeScript interfaces (~90 lines)
├── utils/
│   ├── awardCardUtils.ts          # Utility functions (~120 lines)
│   └── contractTransformer.ts     # Contract to Event mapping (~40 lines)
├── hooks/
│   ├── useAwardExpansion.ts       # Expansion state management (~30 lines)
│   └── useTooltipState.ts         # Tooltip visibility management (~25 lines)
└── index.ts                       # Barrel exports
```

## Benefits

### **Maintainability**
- **Single Responsibility**: Each component has one clear purpose
- **Testability**: Smaller components are easier to unit test
- **Debugging**: Issues isolated to specific components

### **Reusability**
- `PerformanceProgressBar` can be reused in other contract displays
- `TemperatureStatusBadge` can be used for any time-based status
- `AwardItemToolbar` pattern can be applied to other item lists

### **Developer Experience**
- **Cleaner Imports**: Specific utilities imported only where needed
- **Better IntelliSense**: Smaller files with focused responsibilities
- **Type Safety**: Comprehensive TypeScript interfaces

## Migration Guide

### **To use the refactored version:**

1. **Replace imports:**
   ```tsx
   // Old
   import { AwardCardView } from './AwardCardView';

   // New
   import { AwardCardView } from './AwardCardViewRefactored';
   ```

2. **All props remain the same** - no breaking changes to the public interface

3. **Formatting utilities** now use shared utilities from `/shared/utils/formatting`

### **Component Architecture**

```
AwardCardView (State Management)
├── useAwardExpansion() (Expansion state)
├── useTooltipState() (Tooltip state)
├── transformContractsToEvents() (Data transformation)
├── AwardCardHeader (Navigation)
└── AwardContainer (List Management)
    └── AwardItem[] (Individual Cards)
        ├── AwardItemHeader (Award Info)
        ├── AwardItemToolbar (Actions & Tooltips)
        │   ├── Pin, Calendar, Location actions
        │   ├── Money (toggle expansion)
        │   └── Folder (view details)
        ├── PerformanceProgressBar (Timeline)
        ├── TemperatureStatusBadge (Hot/Warm/Cold)
        └── AwardItemExpandedContent (Metrics)
            ├── Value, Obligations, Utilization
            ├── Timeline visualization
            ├── Contract details grid
            └── AI description
```

## Preserved Features

✅ **All original functionality maintained:**
- Expansion/collapse of individual awards
- Tooltip system with positioning logic
- Temperature status calculation (hot/warm/cold)
- Progress bar timeline visualization
- Icon toolbar with 7 action buttons
- Sorting by most recent event date
- NAICS/PSC code display
- Comprehensive contract details
- AI description display
- Responsive layout and styling

✅ **Same prop interface** - drop-in replacement

✅ **All business logic preserved** - complex domain calculations intact

## Performance Optimizations

The new structure enables several optimization opportunities:

1. **React.memo** for individual award items
2. **Callback memoization** for expensive calculations
3. **Conditional rendering** optimizations
4. **Code splitting** at the component level

## Testing Strategy

Each component can now be tested in isolation:

```tsx
// Test individual components
describe('PerformanceProgressBar', () => { ... });
describe('TemperatureStatusBadge', () => { ... });
describe('AwardItemToolbar', () => { ... });

// Test hooks separately
describe('useAwardExpansion', () => { ... });
describe('useTooltipState', () => { ... });

// Test utilities
describe('awardCardUtils', () => { ... });
```

## Future Enhancements

The modular structure makes it easy to:
- Add new toolbar actions
- Enhance the progress bar with additional data
- Create different award item layouts
- Add new temperature status types
- Implement keyboard navigation
- Add accessibility improvements