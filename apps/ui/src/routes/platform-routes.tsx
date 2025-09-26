import { createRoute, useParams } from "@tanstack/react-router";
import { ProtectedRoute } from "../components/protected-route";
import { CONTRACTOR_DETAIL_COLORS } from "../logic/utils";
import PlatformComponent from "./platform";
import ContractorDetail from "./platform/contractor-detail";
import Discovery from "./platform/discovery";
import { ViewPortfolio } from "./platform/portfolio";

// Parent platform route
export const platformRoute = (rootRoute: any) =>
	createRoute({
		getParentRoute: () => rootRoute,
		path: "/platform",
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

// Discovery route - /platform/discovery
export const discoveryRoute = (rootRoute: any) =>
	createRoute({
		getParentRoute: () => rootRoute,
		path: "/platform/discovery",
		component: function DiscoveryRoute() {
			return (
				<ProtectedRoute>
					<Discovery />
				</ProtectedRoute>
			);
		},
	});

// Portfolio route - /platform/portfolio
export const portfolioRoute = (rootRoute: any) =>
	createRoute({
		getParentRoute: () => rootRoute,
		path: "/platform/portfolio",
		component: function PortfolioRoute() {
			return (
				<ProtectedRoute>
					<ViewPortfolio />
				</ProtectedRoute>
			);
		},
	});

// Contractor Detail route - /platform/contractor-detail/:contractorId
export const contractorDetailRoute = (rootRoute: any) =>
	createRoute({
		getParentRoute: () => rootRoute,
		path: "/platform/contractor-detail/$contractorId",
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
	contractorDetailRoute,
};
