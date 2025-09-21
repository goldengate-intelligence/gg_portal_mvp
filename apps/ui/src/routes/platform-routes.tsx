import { createRoute, useParams } from '@tanstack/react-router';
import { ProtectedRoute } from '../components/protected-route';
import PlatformComponent from './platform';
import { UEIProfile } from './platform/uei-profile';
import { ContractorNetwork } from './platform/contractor-network';
import ContractorDetail from './platform/contractor-detail';
import Discovery from './platform/discovery';
import { ViewPortfolio } from './platform/portfolio';
import { CONTRACTOR_DETAIL_COLORS } from '../lib/utils';

// Parent platform route
export const platformRoute = (rootRoute: any) => createRoute({
  getParentRoute: () => rootRoute,
  path: '/platform',
  component: PlatformComponent,
});

// Company Profile route - /platform/company-profile/:id - ARCHIVED
// export const companyProfileRoute = (rootRoute: any) => createRoute({
//   getParentRoute: () => rootRoute,
//   path: '/platform/company-profile/$id',
//   component: function CompanyProfileRoute() {
//     return <div>Company Profile - Component Archived</div>;
//   },
// });

// UEI Profile route - /platform/uei-profile/:uei
export const ueiProfileRoute = (rootRoute: any) => createRoute({
  getParentRoute: () => rootRoute,
  path: '/platform/uei-profile/$uei',
  component: function UEIProfileRoute() {
    const { uei } = useParams({ from: '/platform/uei-profile/$uei' });
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-white">
          <div className="container mx-auto px-6 py-6">
            <UEIProfile uei={uei} />
          </div>
        </div>
      </ProtectedRoute>
    );
  },
});

// Contractor Network route - /platform/contractor-network/:id
export const contractorNetworkRoute = (rootRoute: any) => createRoute({
  getParentRoute: () => rootRoute,
  path: '/platform/contractor-network/$id',
  component: function ContractorNetworkRoute() {
    const { id } = useParams({ from: '/platform/contractor-network/$id' });
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black text-white">
          <div className="container mx-auto px-6 py-6">
            <ContractorNetwork id={id} />
          </div>
        </div>
      </ProtectedRoute>
    );
  },
});

// Discovery route - /platform/discovery
export const discoveryRoute = (rootRoute: any) => createRoute({
  getParentRoute: () => rootRoute,
  path: '/platform/discovery',
  component: function DiscoveryRoute() {
    return (
      <ProtectedRoute>
        <Discovery />
      </ProtectedRoute>
    );
  },
});

// Portfolio route - /platform/portfolio
export const portfolioRoute = (rootRoute: any) => createRoute({
  getParentRoute: () => rootRoute,
  path: '/platform/portfolio',
  component: function PortfolioRoute() {
    return (
      <ProtectedRoute>
        <ViewPortfolio />
      </ProtectedRoute>
    );
  },
});

// Contractor Detail route - /platform/contractor-detail/:contractorId
export const contractorDetailRoute = (rootRoute: any) => createRoute({
  getParentRoute: () => rootRoute,
  path: '/platform/contractor-detail/$contractorId',
  component: function ContractorDetailRoute() {
    return (
      <ProtectedRoute>
        <ContractorDetail />
      </ProtectedRoute>
    );
  },
});

export default {
  platformRoute,
  discoveryRoute,
  portfolioRoute,
  ueiProfileRoute,
  contractorNetworkRoute,
  contractorDetailRoute
};