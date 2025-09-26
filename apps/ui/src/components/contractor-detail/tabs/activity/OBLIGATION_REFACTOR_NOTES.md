# Obligation Card View Refactor

## Overview

The original `ObligationCardView.tsx` (676 lines) has been carefully broken down into focused, maintainable components while preserving ALL functionality, business logic, and UI interactions exactly as they were.

## Key Differences from AwardCardView

### **Unique Features Preserved:**
- **4-icon toolbar** (vs 7 icons in AwardCardView): Expand, Research, Attach, Folder
- **Obligation-specific metrics**: "Obligation Amount", "Recorded Outlays", "Recipient Count"
- **EVENT_ID display**: Shows event ID in header vs award key
- **Direct ActivityEvent processing**: No relationship layer transformation
- **Obligation terminology**: "Obligation Inflows/Outflows" vs "Agency Awards/Vendor Orders"

### **Exact Business Logic Preserved:**
- ✅ **Data filtering**: By `contract_id` and `flow_direction`
- ✅ **Transformation logic**: ActivityEvent → ObligationEvent mapping
- ✅ **Fallback handling**: "No Obligations Available" state
- ✅ **Sorting**: Most recent event_date first
- ✅ **Financial calculations**: 60% outlays, static utilization
- ✅ **Temperature status**: HOT/WARM/COLD based on action date recency

## File Structure

### **Main Components**
```
ObligationCardViewRefactored.tsx    # Main orchestration (~50 lines)
├── components/
│   ├── ObligationCardHeader.tsx    # Header with contract info (~35 lines)
│   ├── ObligationContainer.tsx     # Container for obligations list (~70 lines)
│   ├── ObligationItem.tsx         # Individual obligation card (~70 lines)
│   ├── ObligationItemHeader.tsx   # Obligation title and details (~45 lines)
│   ├── ObligationItemToolbar.tsx  # 4-icon action toolbar (~100 lines)
│   ├── ObligationItemExpandedContent.tsx # Metrics grid (~85 lines)
│   └── types/obligationCardTypes.ts # TypeScript interfaces (~95 lines)
├── utils/
│   ├── obligationCardUtils.ts     # Business logic utilities (~80 lines)
│   └── obligationTransformer.ts   # ActivityEvent → ObligationEvent (~85 lines)
├── hooks/ (shared with AwardCardView)
│   ├── useAwardExpansion.ts       # Expansion state management
│   └── useTooltipState.ts         # Tooltip visibility management
└── obligationComponents.ts        # Barrel exports
```

## Critical Preservation Details

### **State Management** (Exact Same):
- `activeTooltip: string | null` - Tooltip visibility state
- `expandedItems: Set<string>` - Per-item expansion tracking
- Uses `obligation.EVENT_ID` for unique identification

### **Data Transformation** (Preserved Exactly):
- Filters by `event.contract_id === contractId`
- Filters by `flow_direction` matching `originContainer`
- Maps ActivityEvent fields to ObligationEvent interface
- Applies 60% outlay calculation: `event_amount * 0.6`
- Uses static utilization of 50%
- Generates fallback obligation when no data exists

### **UI Interactions** (All Preserved):
- **4-icon toolbar**: DollarSign (expand), Search (research), Paperclip (attach), Folder (manager)
- **Hover effects**: Dynamic box-shadow changes
- **Temperature badges**: HOT/WARM/COLD status display
- **Timeline progress**: Performance period visualization
- **Tooltip positioning**: Smart tooltip placement logic
- **Expansion animation**: Smooth expand/collapse transitions

### **Visual Styling** (Identical):
- Uses `CONTRACTOR_DETAIL_COLORS.backgroundColor`
- Gradient backgrounds and hover effects
- Icon colors: Green ($22C55E), Indigo ($6366F1), Amber ($F59E0B), Purple ($8B5CF6)
- Temperature colors and styling
- Grid layouts and spacing

## Migration Guide

### **Drop-in Replacement:**
```tsx
// Old
import { ObligationCardView } from './ObligationCardView';

// New
import { ObligationCardView } from './ObligationCardViewRefactored';
```

### **Same Props Interface:**
- `contractId: string`
- `contractTitle: string`
- `originContainer?: "inflow" | "outflow"`
- `activityEvents?: ActivityEvent[]`
- `onBack: () => void`

### **No Breaking Changes:**
- All functionality works exactly the same
- Same visual appearance
- Same user interactions
- Same performance characteristics

## Benefits

### **Maintainability:**
- **Single responsibility**: Each component has one clear purpose
- **Isolated testing**: Components can be unit tested separately
- **Easier debugging**: Issues isolated to specific components
- **Code reuse**: Shared hooks and utilities with AwardCardView

### **Type Safety:**
- Comprehensive TypeScript interfaces
- Proper separation of ActivityEvent vs ObligationEvent
- Clear prop definitions for all components

### **Performance:**
- Enables React.memo optimizations
- Memoized calculations and callbacks
- Cleaner re-render patterns

## Preserved Complex Logic

### **Temperature Status Calculation:**
```typescript
const getTemperatureStatus = (actionDate: string): TemperatureStatus => {
  const actionDateObj = new Date(actionDate);
  const now = new Date();
  const diffInMonths = (now.getTime() - actionDateObj.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (diffInMonths <= 3) return "hot";
  if (diffInMonths <= 12) return "warm";
  return "cold";
};
```

### **Financial Calculations:**
- **Obligation Amount**: Direct from `event.event_amount`
- **Recorded Outlays**: Exactly 60% of event amount
- **Recipient Count**: Static value of 1

### **Data Flow:**
```
activityEvents → filter by contract_id & flow_direction →
transform to ObligationEvent → sort by date → render cards
```

## Testing Strategy

Each component can be tested independently:

```tsx
describe('ObligationItemToolbar', () => {
  it('renders 4 icons with correct tooltips', () => { ... });
  it('handles expansion toggle correctly', () => { ... });
});

describe('obligationTransformer', () => {
  it('filters events by contract ID correctly', () => { ... });
  it('calculates outlays as 60% of event amount', () => { ... });
});
```

The refactored structure maintains every aspect of the original component while providing a much cleaner, more maintainable architecture.