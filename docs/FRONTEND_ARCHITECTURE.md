# GoldenGate Frontend Architecture Documentation

## Overview

The GoldenGate frontend is a modern React application built with TypeScript, providing a sophisticated interface for federal contractor intelligence and portfolio management. It features a component-based architecture with real-time data synchronization, advanced filtering capabilities, and a comprehensive design system.

## Technology Stack

### Core Technologies
- **React 19**: Latest React version with concurrent features
- **TypeScript 5.7**: Type-safe development experience
- **Vite 6**: Fast build tool and development server
- **TanStack Router**: Type-safe routing solution
- **TanStack Query**: Powerful data fetching and caching

### UI & Styling
- **Tailwind CSS v4**: Utility-first CSS framework
- **Custom Component Library**: Based on shadcn/ui patterns
- **Class Variance Authority**: Component variant management
- **Lucide Icons**: Comprehensive icon library

### State Management
- **TanStack Query**: Server state management
- **React Context**: Authentication and global state
- **Local Storage**: Persistent user preferences

## Project Structure

```
apps/ui/
├── src/
│   ├── main.tsx                 # Application entry point
│   ├── App.tsx                  # Root component
│   ├── styles.css               # Global styles and Tailwind
│   │
│   ├── components/              # Reusable components
│   │   ├── ui/                  # Core UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── platform/            # Business-specific components
│   │   │   ├── ContractorDetailModal.tsx
│   │   │   ├── FilterSidebar.tsx
│   │   │   ├── PortfolioList.tsx
│   │   │   └── ...
│   │   ├── charts/              # Data visualization
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── AgencyExposureChart.tsx
│   │   │   └── PeerComparisonChart.tsx
│   │   └── auth/                # Authentication components
│   │       ├── login-form.tsx
│   │       └── register-form.tsx
│   │
│   ├── routes/                  # Application routes
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── dashboard.tsx
│   │   ├── platform.tsx
│   │   └── platform/
│   │       ├── identify.tsx     # Contractor discovery
│   │       ├── portfolio.tsx    # Portfolio management
│   │       └── analysis.tsx     # Analytics dashboard
│   │
│   ├── contexts/                # React contexts
│   │   └── auth-context.tsx     # Authentication provider
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useContractors.ts
│   │   ├── useContractorProfiles.ts
│   │   ├── useContractorLists.ts
│   │   └── useKeyboardShortcuts.ts
│   │
│   ├── lib/                     # Core libraries
│   │   ├── api-client.ts        # API communication layer
│   │   └── utils.ts             # Utility functions
│   │
│   ├── utils/                   # Helper utilities
│   │   ├── contractor-transform.ts
│   │   ├── contractor-profile-transform.ts
│   │   └── export.ts
│   │
│   ├── types/                   # TypeScript definitions
│   │   └── index.ts
│   │
│   └── data/                    # Static data and constants
│       ├── industries.ts
│       └── mock-data.ts
│
├── public/                      # Static assets
│   ├── fonts/                   # Custom fonts
│   └── images/                  # Industry icons
│
└── configuration files
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── tailwind.config.ts
```

## Core Features

### 1. Authentication System
- **JWT-based authentication** with secure token storage
- **Role-based access control** (admin, manager, analyst, viewer)
- **Protected routes** with automatic redirection
- **Session management** with auto-logout on expiry

### 2. Platform Modes

#### Identify Targets Mode
- Advanced contractor search with real-time filtering
- Multi-criteria filtering (location, industry, size, etc.)
- Card and table view modes
- Contractor detail modals with comprehensive information
- Export functionality (CSV, JSON)

#### Portfolio Management
- Create and manage contractor lists
- Drag-and-drop list organization
- Favorites system with quick toggle
- Bulk operations and tagging
- Portfolio analytics and summaries

#### Analysis Mode
- Delta analysis for change tracking
- Competitive intelligence dashboards
- Revenue and contract trend analysis
- Agency exposure visualization
- Peer comparison tools

### 3. Data Management

#### API Integration
- Centralized API client with automatic auth headers
- Request/response interceptors for error handling
- Automatic token refresh logic
- Multi-tenant support with tenant ID headers

#### Data Fetching Patterns
```typescript
// Custom hook example
const useContractorProfiles = (filters) => {
  return useQuery({
    queryKey: ['contractor-profiles', filters],
    queryFn: () => apiClient.getContractorProfiles(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### 4. Component Architecture

#### Design System
- **Atomic Design Pattern**: UI components → Platform components → Routes
- **Variant-based styling**: Using CVA for consistent component variants
- **Composable components**: Built with Radix UI primitives
- **Dark mode support**: Theme-aware component styling

#### Component Examples

**UI Component (Button)**
```tsx
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

**Platform Component (ContractorCard)**
```tsx
export function ContractorCard({ contractor, onToggleFavorite }) {
  // Business logic and UI composition
  return (
    <Card>
      <CardHeader>{contractor.name}</CardHeader>
      <CardContent>
        {/* Contractor details */}
      </CardContent>
      <CardFooter>
        <Button onClick={onToggleFavorite}>
          Add to Portfolio
        </Button>
      </CardFooter>
    </Card>
  );
}
```

## Routing Architecture

### Route Structure
- **Public Routes**: `/`, `/login`, `/register`
- **Protected Routes**: `/dashboard`, `/platform/*`
- **Platform Sub-routes**: `/platform/identify`, `/platform/portfolio`, `/platform/analysis`

### Route Guards
```tsx
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
}
```

## State Management Patterns

### 1. Server State (TanStack Query)
- Automatic caching and background refetching
- Optimistic updates for better UX
- Parallel queries for performance
- Infinite queries for pagination

### 2. Client State (React Context)
- Authentication state
- User preferences
- UI state (modals, sidebars)
- Active filters and selections

### 3. Local Storage
- JWT tokens
- User session data
- View preferences
- Recent searches

## Performance Optimizations

### 1. Code Splitting
- Route-based code splitting
- Lazy loading of heavy components
- Dynamic imports for charts

### 2. Data Optimization
- Virtual scrolling for large lists
- Debounced search inputs
- Memoized expensive computations
- Batch API requests

### 3. Asset Optimization
- Image lazy loading
- Font preloading
- CSS purging in production
- Bundle size monitoring

## Development Workflow

### Setup
```bash
cd apps/ui
bun install
bun run dev
```

### Available Scripts
- `bun run dev`: Start development server (port 3600)
- `bun run build`: Production build
- `bun run test`: Run test suite
- `bun run lint`: Run Biome linter
- `bun run check`: Full code quality check

### Environment Variables
```env
VITE_API_URL=http://localhost:4001
VITE_CLIENT_ID=goldengate-web
VITE_TENANT_ID=default-tenant-id
```

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Hook testing with renderHook
- Utility function testing

### Integration Tests
- API client testing
- Route navigation testing
- Authentication flow testing

### E2E Tests (Planned)
- Critical user journeys
- Cross-browser testing
- Performance testing

## Deployment

### Production Build
```bash
bun run build
# Output in dist/ directory
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] API endpoints verified
- [ ] Authentication flow tested
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] SSL certificates valid

## Security Considerations

### Authentication
- JWT tokens stored in localStorage with XSS protection
- Automatic token expiry handling
- Secure password requirements
- Rate limiting on auth endpoints

### Data Protection
- API requests over HTTPS only
- Sensitive data never logged
- Input sanitization on all forms
- CORS properly configured

### Access Control
- Role-based route protection
- Feature flags for permissions
- Tenant isolation enforced
- Audit logging for sensitive actions

## Accessibility

### Standards Compliance
- WCAG 2.1 Level AA compliance
- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support

### Features
- Focus management in modals
- Skip navigation links
- Screen reader announcements
- High contrast mode support

## Future Enhancements

### Planned Features
1. **Real-time Collaboration**: WebSocket integration for live updates
2. **Advanced Analytics**: ML-powered insights and predictions
3. **Mobile App**: React Native companion application
4. **Offline Support**: Service worker implementation
5. **AI Integration**: Natural language search and recommendations

### Technical Improvements
1. **Micro-frontend Architecture**: Module federation
2. **GraphQL Integration**: More efficient data fetching
3. **State Management**: Consider Zustand or Jotai
4. **Testing Coverage**: Achieve 80%+ coverage
5. **Performance Monitoring**: Implement Sentry

## Support & Resources

### Documentation
- [React Documentation](https://react.dev)
- [TanStack Documentation](https://tanstack.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)

### Internal Resources
- API Documentation: `/apps/api/docs`
- Component Storybook: (Coming Soon)
- Design System: `/docs/design-system.md`

---

*Last Updated: January 2025*
*Version: 1.0.0*