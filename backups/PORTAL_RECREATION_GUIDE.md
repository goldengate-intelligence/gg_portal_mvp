# Portal Recreation Guide
## Complete Instructions to Recreate the Contractor Detail Portal

### Overview
This guide contains everything needed to recreate the contractor detail portal from scratch using the backup files in this directory.

---

## 🎯 What These Backups Contain

### Core UI Components (Complete)
1. **contractor-detail_latest_20250917_233251.tsx** (152KB)
   - Complete contractor detail page with all tabs
   - Overview, Performance, Network, and Contracts sections
   - All custom tooltips and interactions
   - Tab navigation with custom icons

2. **NetworkV1Layout_latest_20250917_233113.tsx** (38KB)
   - Complete Network tab layout
   - Network Map with d3-geo integration
   - Network Distribution panel
   - Contracting Activity V3 design
   - All relationship visualizations

3. **GoldengateNetworkGraph_latest_20250917_233308.tsx** (28KB)
   - Network graph visualization component
   - Dynamic bubble sizing logic
   - Custom text styling (#04070a panel color)
   - Force-directed graph implementation

4. **NetworkMapComponent.tsx** (14KB)
   - Standalone US map component
   - D3-geo Albers USA projection (calibrated)
   - Smart tooltip positioning
   - Self-contained with all dependencies documented

### Individual Panel Components
- **executive_summary.tsx** - Executive summary panel
- **performance_snapshot.tsx** - Performance metrics display
- **portfolio_snapshot.tsx** - Portfolio overview
- **headline_cards.tsx** - Top-level metric cards
- **agency_relationships.tsx** - Agency bar chart
- **time_series_performance.tsx** - Time series chart
- **network_summary.tsx** - Network overview panel

---

## 📦 Required Dependencies

### Package.json Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-router": "^1.0.0",
    "react-usa-map": "^1.5.0",
    "d3-geo": "^3.1.0",
    "lucide-react": "^0.263.1",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "tailwindcss": "^3.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.2.2"
  }
}
```

### Installation Commands
```bash
# Create new Vite project
npm create vite@latest contractor-portal -- --template react-ts

# Install core dependencies
npm install @tanstack/react-router
npm install react-usa-map d3-geo
npm install lucide-react
npm install chart.js react-chartjs-2
npm install -D tailwindcss postcss autoprefixer
```

---

## 🏗️ Project Structure Required

```
contractor-portal/
├── src/
│   ├── routes/
│   │   └── platform/
│   │       └── contractor-detail.tsx (from backup)
│   ├── components/
│   │   ├── NetworkV1Layout.tsx (from backup)
│   │   ├── ui/
│   │   │   ├── hud-card.tsx (needs creation)
│   │   │   ├── button.tsx (needs creation)
│   │   │   └── skeleton.tsx (needs creation)
│   │   └── platform/
│   │       └── PlatformFooter.tsx (needs creation)
│   ├── lib/
│   │   ├── utils.ts (see below)
│   │   ├── api-client.ts (needs creation)
│   │   └── charts/
│   │       └── components/
│   │           ├── GoldengateNetworkGraph.tsx (from backup)
│   │           ├── GoldengateLineChart.tsx (needs creation)
│   │           ├── GoldengateBarChart.tsx (needs creation)
│   │           ├── GoldengateAreaChart.tsx (needs creation)
│   │           └── index.ts (export all)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🎨 Required Configuration Files

### 1. tailwind.config.js
```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
```

### 2. src/lib/utils.ts
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CONTRACTOR_DETAIL_COLORS = {
  bannerColor: '#000102',
  backgroundColor: '#04070a',
  panelColor: 'bg-gray-900/30',
  containerColor: '#1F2937',
};
```

### 3. src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Genos:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&display=swap');

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #04070a;
  color: white;
}
```

---

## 🎯 Key Color Scheme

```typescript
const COLOR_SCHEME = {
  // Primary Colors
  agency: '#7B61FF',      // Purple - DOD/Agency
  prime: '#5BC0EB',       // Blue - Prime Partners
  sub: '#FF4C4C',         // Red - Subcontractors
  performance: '#4ade80', // Green - Performance/Success
  contractor: '#D2AC38',  // Gold - Main contractor

  // Chart Colors
  mint: '#4EC9B0',        // Mint/Cyan for charts

  // Background Colors
  panelBg: 'bg-black/40',
  containerBg: '#04070a',

  // Text Colors
  textPrimary: 'text-white',
  textSecondary: 'text-gray-400',
  textMuted: 'text-gray-500',

  // Tooltip Colors
  tooltipBg: 'rgba(0, 0, 0, 1)',
  tooltipBorder: '#4EC9B0',
  tooltipText: '#ffffff',
  tooltipMuted: 'rgba(255, 255, 255, 0.5)'
};
```

---

## 🔧 Minimal API Client (src/lib/api-client.ts)

```typescript
export const apiClient = {
  async get(endpoint: string) {
    // Mock data for development
    if (endpoint.includes('/contractors/')) {
      return {
        uei: 'TRIO123456',
        name: 'Trio Fabrication LLC',
        cage: 'ABC123',
        primaryNaicsCode: '332312',
        totalContractValue: 480000000,
        activeAwards: 117,
        address: {
          street: '1234 Defense Way',
          city: 'Washington',
          state: 'DC',
          zip: '20001'
        }
      };
    }

    if (endpoint.includes('/network')) {
      return {
        relationships: {
          asSubcontractor: {
            partners: [
              { primeName: 'MegaCorp Industries', primeUei: '123', sharedRevenue: 185000000, sharedContracts: 45 },
              { primeName: 'Global Defense Systems', primeUei: '456', sharedRevenue: 195000000, sharedContracts: 46 }
            ],
            totalValue: 380000000
          },
          asPrime: {
            partners: [
              { subName: 'Texas Materials Inc', subUei: '789', sharedRevenue: 12000000, sharedContracts: 8 },
              { subName: 'Oklahoma Precision', subUei: '012', sharedRevenue: 9000000, sharedContracts: 10 },
              { subName: 'Montana Coatings LLC', subUei: '345', sharedRevenue: 8000000, sharedContracts: 7 }
            ],
            totalValue: 29000000
          }
        }
      };
    }

    return {};
  }
};
```

---

## 🚀 Setup Instructions

### Step 1: Create Project
```bash
# Create new project
npm create vite@latest contractor-portal -- --template react-ts
cd contractor-portal

# Install all dependencies
npm install @tanstack/react-router react-usa-map d3-geo lucide-react chart.js react-chartjs-2
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: Copy Files from Backups
1. Copy `contractor-detail_latest_*.tsx` to `src/routes/platform/contractor-detail.tsx`
2. Copy `NetworkV1Layout_latest_*.tsx` to `src/components/NetworkV1Layout.tsx`
3. Copy `GoldengateNetworkGraph_latest_*.tsx` to `src/lib/charts/components/GoldengateNetworkGraph.tsx`
4. Copy individual panel components as needed

### Step 3: Create Missing Components
Create minimal versions of required components:

#### src/components/ui/hud-card.tsx
```typescript
export const HudCard = ({ children, className = '' }: any) => (
  <div className={`bg-gray-900/30 rounded-lg ${className}`}>{children}</div>
);

export const HudCardHeader = ({ children }: any) => (
  <div className="p-4 border-b border-gray-700">{children}</div>
);

export const HudCardContent = ({ children }: any) => (
  <div className="p-4">{children}</div>
);

export const TacticalDisplay = ({ label, value, size = 'md' }: any) => (
  <div className="flex justify-between items-center p-2 bg-black/40 rounded">
    <span className="text-gray-400 text-xs">{label}</span>
    <span className="text-white font-bold">{value}</span>
  </div>
);

export const TargetReticle = () => null;
```

### Step 4: Router Setup
Create basic router configuration in App.tsx:

```typescript
import { createBrowserRouter, RouterProvider } from '@tanstack/react-router';
import ContractorDetail from './routes/platform/contractor-detail';

const router = createBrowserRouter([
  {
    path: '/contractor/:uei',
    element: <ContractorDetail />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

### Step 5: Run Development Server
```bash
npm run dev
```

Navigate to: `http://localhost:5173/contractor/TRIO123456`

---

## 📊 Missing Chart Components

You'll need to create wrapper components for the other chart types. Example:

#### src/lib/charts/components/GoldengateBarChart.tsx
```typescript
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const GoldengateBarChart = ({ data, options, height = 300, title, liveIndicator, liveText }: any) => {
  return (
    <div style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
};
```

Create similar wrappers for:
- GoldengateLineChart
- GoldengateAreaChart
- GoldengateDoughnutChart
- GoldengateRadarChart
- GoldengateBubbleChart

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Page loads without errors
- [ ] All tabs are visible and clickable
- [ ] Network map displays with tooltips
- [ ] Network graph shows bubbles with correct colors
- [ ] Charts render with data
- [ ] Tooltips appear on hover
- [ ] Colors match the design (#04070a backgrounds, etc.)
- [ ] Fonts load correctly (Genos for headers)

---

## 🔍 Troubleshooting

### Common Issues:

1. **"Cannot find module" errors**
   - Ensure all chart components are created
   - Check import paths match your structure

2. **Map not displaying**
   - Verify react-usa-map and d3-geo are installed
   - Check browser console for errors

3. **Styling issues**
   - Ensure Tailwind is configured properly
   - Import index.css in main.tsx
   - Check font imports are working

4. **Data not loading**
   - Implement apiClient.get() method
   - Return mock data for development

---

## 📝 Notes

- The backup files contain production-ready UI code
- API integration will need to be implemented based on your backend
- Authentication/authorization not included
- Error boundaries and loading states may need enhancement
- Performance optimizations can be added (React.memo, useMemo, etc.)

---

## 🎉 Result

Following this guide with the backup files will recreate:
- Complete contractor detail page with 4 tabs
- Interactive network visualization with d3-geo map
- All custom charts and tooltips
- Responsive layout with consistent styling
- Manufacturing contractor theme (not software)

Total development time estimate: 2-4 hours with all backups
From scratch without backups: 40-60 hours