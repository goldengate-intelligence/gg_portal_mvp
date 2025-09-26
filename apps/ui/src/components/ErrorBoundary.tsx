import {
	AlertTriangle,
	ChevronDown,
	ChevronUp,
	Home,
	RefreshCw,
} from "lucide-react";
import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
	showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
		errorInfo: null,
		showDetails: false,
	};

	public static getDerivedStateFromError(error: Error): State {
		return {
			hasError: true,
			error,
			errorInfo: null,
			showDetails: false,
		};
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Uncaught error:", error, errorInfo);

		// Log to error reporting service
		this.logErrorToService(error, errorInfo);

		this.setState({
			error,
			errorInfo,
		});
	}

	private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
		// Send error to monitoring service (e.g., Sentry, LogRocket)
		const errorData = {
			message: error.message,
			stack: error.stack,
			componentStack: errorInfo.componentStack,
			timestamp: new Date().toISOString(),
			userAgent: navigator.userAgent,
			url: window.location.href,
		};

		// In production, send to error tracking service
		if (import.meta.env.PROD) {
			// Example: window.Sentry?.captureException(error);
			console.error("Error logged to service:", errorData);
		} else {
			console.error("Development error:", errorData);
		}
	};

	private handleReset = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
			showDetails: false,
		});
	};

	private handleRefresh = () => {
		window.location.reload();
	};

	private handleGoHome = () => {
		window.location.href = "/";
	};

	private toggleDetails = () => {
		this.setState((prevState) => ({
			showDetails: !prevState.showDetails,
		}));
	};

	public render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return <>{this.props.fallback}</>;
			}

			return (
				<div className="min-h-screen bg-black flex items-center justify-center p-4">
					<Card className="max-w-2xl w-full">
						<CardContent className="p-8">
							<div className="text-center">
								<div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
									<AlertTriangle className="h-10 w-10 text-red-500" />
								</div>

								<h1 className="text-2xl font-bold text-white mb-2">
									Oops! Something went wrong
								</h1>

								<p className="text-gray-400 mb-6">
									We encountered an unexpected error. The issue has been logged
									and our team will investigate.
								</p>

								{/* Error Message */}
								{this.state.error && (
									<div className="bg-dark-gold rounded-lg p-4 mb-6 text-left">
										<p className="text-sm font-sans text-red-400">
											{this.state.error.message}
										</p>
									</div>
								)}

								{/* Action Buttons */}
								<div className="flex justify-center gap-3 mb-6">
									<Button
										onClick={this.handleReset}
										className="bg-yellow-500 hover:bg-yellow-600 text-black"
									>
										<RefreshCw className="h-4 w-4 mr-2" />
										Try Again
									</Button>
									<Button onClick={this.handleRefresh} variant="outline">
										Refresh Page
									</Button>
									<Button onClick={this.handleGoHome} variant="outline">
										<Home className="h-4 w-4 mr-2" />
										Go Home
									</Button>
								</div>

								{/* Technical Details Toggle */}
								<button
									type="button"
									onClick={this.toggleDetails}
									className="text-sm text-gray-500 hover:text-gray-400 flex items-center gap-1 mx-auto"
								>
									Technical Details
									{this.state.showDetails ? (
										<ChevronUp className="h-4 w-4" />
									) : (
										<ChevronDown className="h-4 w-4" />
									)}
								</button>

								{/* Technical Details */}
								{this.state.showDetails && this.state.errorInfo && (
									<div className="mt-4 text-left">
										<div className="bg-medium-gray rounded-lg p-4 max-h-64 overflow-y-auto">
											<h3 className="text-sm font-semibold text-gray-300 mb-2">
												Stack Trace:
											</h3>
											<pre className="text-xs text-gray-500 whitespace-pre-wrap font-sans">
												{this.state.error?.stack}
											</pre>

											<h3 className="text-sm font-semibold text-gray-300 mb-2 mt-4">
												Component Stack:
											</h3>
											<pre className="text-xs text-gray-500 whitespace-pre-wrap font-sans">
												{this.state.errorInfo.componentStack}
											</pre>
										</div>

										<p className="text-xs text-gray-600 mt-3">
											Error ID: {Date.now().toString(36).toUpperCase()}
										</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}

// Async Error Boundary for handling promise rejections
export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
	React.useEffect(() => {
		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			console.error("Unhandled promise rejection:", event.reason);
			// Could trigger a toast notification or modal here
		};

		window.addEventListener("unhandledrejection", handleUnhandledRejection);

		return () => {
			window.removeEventListener(
				"unhandledrejection",
				handleUnhandledRejection,
			);
		};
	}, []);

	return <>{children}</>;
}

// Hook for error handling in functional components
export function useErrorHandler() {
	const [error, setError] = React.useState<Error | null>(null);

	React.useEffect(() => {
		if (error) {
			throw error;
		}
	}, [error]);

	const resetError = () => setError(null);
	const captureError = (error: Error) => setError(error);

	return { resetError, captureError };
}
