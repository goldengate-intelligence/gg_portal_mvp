import { Navigate } from "@tanstack/react-router";
import { hasPermission, useAuth } from "../contexts/auth-context";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRole?: string;
	resource?: string;
	action?: string;
}

export function ProtectedRoute({
	children,
	requiredRole,
	resource,
	action = "access",
}: ProtectedRouteProps) {
	const { user, loading, isAuthenticated } = useAuth();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" />
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (resource && !hasPermission(user, resource, action)) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
					<p className="text-gray-600">
						You don't have permission to access this resource.
					</p>
				</div>
			</div>
		);
	}

	if (requiredRole && user?.role !== requiredRole) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
					<p className="text-gray-600">
						You don't have the required role to access this page.
					</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
