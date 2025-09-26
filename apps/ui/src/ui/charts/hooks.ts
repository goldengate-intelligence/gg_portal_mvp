import type { Chart } from "chart.js";
import { useEffect, useRef, useState } from "react";

/**
 * Hook to get chart instance reference
 */
export function useChartInstance() {
	const chartRef = useRef<Chart | null>(null);

	const setChartInstance = (instance: Chart | null) => {
		chartRef.current = instance;
	};

	const getChartInstance = () => chartRef.current;

	return { chartRef, setChartInstance, getChartInstance };
}

/**
 * Hook for real-time chart updates
 */
export function useRealtimeChart(updateInterval = 1000, maxDataPoints = 20) {
	const [data, setData] = useState<any[]>([]);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const addDataPoint = (newPoint: any) => {
		setData((prevData) => {
			const updated = [...prevData, newPoint];
			if (updated.length > maxDataPoints) {
				updated.shift();
			}
			return updated;
		});
	};

	const startUpdates = (updateFunction: () => any) => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		intervalRef.current = setInterval(() => {
			const newPoint = updateFunction();
			addDataPoint(newPoint);
		}, updateInterval);
	};

	const stopUpdates = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	};

	useEffect(() => {
		return () => {
			stopUpdates();
		};
	}, []);

	return {
		data,
		addDataPoint,
		startUpdates,
		stopUpdates,
		setData,
	};
}

/**
 * Hook for responsive chart sizing
 */
export function useResponsiveChart(containerRef: React.RefObject<HTMLElement>) {
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const updateDimensions = () => {
			if (containerRef.current) {
				setDimensions({
					width: containerRef.current.offsetWidth,
					height: containerRef.current.offsetHeight,
				});
			}
		};

		updateDimensions();
		window.addEventListener("resize", updateDimensions);

		return () => {
			window.removeEventListener("resize", updateDimensions);
		};
	}, [containerRef]);

	return dimensions;
}

/**
 * Hook for chart animations
 */
export function useChartAnimation(enabled = true, duration = 1000, delay = 0) {
	const [animationConfig, setAnimationConfig] = useState({
		enabled,
		duration,
		delay,
		easing: "easeInOutQuart" as const,
	});

	const triggerAnimation = () => {
		if (!enabled) return;

		// Force re-render with new animation config
		setAnimationConfig((prev) => ({
			...prev,
			delay: 0,
		}));

		setTimeout(() => {
			setAnimationConfig((prev) => ({
				...prev,
				delay,
			}));
		}, 50);
	};

	return {
		animationConfig,
		triggerAnimation,
		setAnimationConfig,
	};
}

/**
 * Hook for chart data fetching
 */
export function useChartData<T = any>(
	fetchFunction: () => Promise<T>,
	dependencies: any[] = [],
) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let cancelled = false;

		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);
				const result = await fetchFunction();

				if (!cancelled) {
					setData(result);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err as Error);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		fetchData();

		return () => {
			cancelled = true;
		};
	}, dependencies);

	const refetch = async () => {
		try {
			setLoading(true);
			setError(null);
			const result = await fetchFunction();
			setData(result);
		} catch (err) {
			setError(err as Error);
		} finally {
			setLoading(false);
		}
	};

	return {
		data,
		loading,
		error,
		refetch,
	};
}

/**
 * Hook for chart theme management
 */
export function useChartTheme() {
	const [theme, setTheme] = useState<"light" | "dark">("dark");

	useEffect(() => {
		// Check system preference or saved preference
		const savedTheme = localStorage.getItem("chartTheme");
		if (savedTheme) {
			setTheme(savedTheme as "light" | "dark");
		} else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
			setTheme("dark");
		}
	}, []);

	const toggleTheme = () => {
		const newTheme = theme === "dark" ? "light" : "dark";
		setTheme(newTheme);
		localStorage.setItem("chartTheme", newTheme);
	};

	return {
		theme,
		toggleTheme,
		isDark: theme === "dark",
	};
}
