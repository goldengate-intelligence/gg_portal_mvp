import { createRoute, useParams } from "@tanstack/react-router";
import { MonitoringSpreadsheet } from "../../components/portfolio/monitoring/MonitoringSpreadsheet";
import { ProtectedRoute } from "../../components/protected-route";

// Portfolio Performance route - /portfolio/performance
export const portfolioPerformanceRoute = (rootRoute: any) =>
	createRoute({
		getParentRoute: () => rootRoute,
		path: "/portfolio/performance",
		component: function PortfolioPerformanceRoute() {
			return (
				<ProtectedRoute>
					<MonitoringSpreadsheet type="performance" />
				</ProtectedRoute>
			);
		},
	});

// Portfolio Activity route - /portfolio/activity
export const portfolioActivityRoute = (rootRoute: any) =>
	createRoute({
		getParentRoute: () => rootRoute,
		path: "/portfolio/activity",
		component: function PortfolioActivityRoute() {
			return (
				<ProtectedRoute>
					<MonitoringSpreadsheet type="activity" />
				</ProtectedRoute>
			);
		},
	});

// Portfolio Utilization route - /portfolio/utilization
export const portfolioUtilizationRoute = (rootRoute: any) =>
	createRoute({
		getParentRoute: () => rootRoute,
		path: "/portfolio/utilization",
		component: function PortfolioUtilizationRoute() {
			return (
				<ProtectedRoute>
					<MonitoringSpreadsheet type="utilization" />
				</ProtectedRoute>
			);
		},
	});
