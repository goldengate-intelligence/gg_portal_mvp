import { Loader2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface VirtualizedListProps<T> {
	items: T[];
	itemHeight: number | ((index: number) => number);
	renderItem: (item: T, index: number) => React.ReactNode;
	overscan?: number;
	onLoadMore?: () => void;
	hasMore?: boolean;
	isLoading?: boolean;
	emptyState?: React.ReactNode;
	className?: string;
	height?: number | string;
}

export function VirtualizedList<T>({
	items,
	itemHeight,
	renderItem,
	overscan = 3,
	onLoadMore,
	hasMore = false,
	isLoading = false,
	emptyState,
	className = "",
	height = "100%",
}: VirtualizedListProps<T>) {
	const containerRef = useRef<HTMLDivElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const [scrollTop, setScrollTop] = useState(0);
	const [containerHeight, setContainerHeight] = useState(0);
	const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });

	// Calculate item heights
	const getItemHeight = useCallback(
		(index: number) => {
			return typeof itemHeight === "function" ? itemHeight(index) : itemHeight;
		},
		[itemHeight],
	);

	const getItemOffset = useCallback(
		(index: number) => {
			let offset = 0;
			for (let i = 0; i < index; i++) {
				offset += getItemHeight(i);
			}
			return offset;
		},
		[getItemHeight],
	);

	const getTotalHeight = useCallback(() => {
		let total = 0;
		for (let i = 0; i < items.length; i++) {
			total += getItemHeight(i);
		}
		return total;
	}, [items.length, getItemHeight]);

	// Calculate visible range
	useEffect(() => {
		if (!containerHeight) return;

		let accumulatedHeight = 0;
		let start = 0;
		let end = items.length;

		// Find start index
		for (let i = 0; i < items.length; i++) {
			const height = getItemHeight(i);
			if (accumulatedHeight + height > scrollTop) {
				start = Math.max(0, i - overscan);
				break;
			}
			accumulatedHeight += height;
		}

		// Find end index
		accumulatedHeight = getItemOffset(start);
		for (let i = start; i < items.length; i++) {
			if (accumulatedHeight > scrollTop + containerHeight) {
				end = Math.min(items.length, i + overscan);
				break;
			}
			accumulatedHeight += getItemHeight(i);
		}

		setVisibleRange({ start, end });
	}, [
		scrollTop,
		containerHeight,
		items.length,
		getItemHeight,
		getItemOffset,
		overscan,
	]);

	// Handle container resize
	useEffect(() => {
		const handleResize = () => {
			if (containerRef.current) {
				setContainerHeight(containerRef.current.clientHeight);
			}
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Handle scroll
	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const target = e.currentTarget;
			setScrollTop(target.scrollTop);

			// Infinite scroll
			if (onLoadMore && hasMore && !isLoading) {
				const scrollPercentage =
					(target.scrollTop + target.clientHeight) / target.scrollHeight;

				if (scrollPercentage > 0.9) {
					onLoadMore();
				}
			}
		},
		[onLoadMore, hasMore, isLoading],
	);

	// Render visible items
	const visibleItems = [];
	for (let i = visibleRange.start; i < visibleRange.end; i++) {
		const item = items[i];
		if (!item) continue;

		const offset = getItemOffset(i);
		visibleItems.push(
			<div
				key={i}
				style={{
					position: "absolute",
					top: offset,
					left: 0,
					right: 0,
					height: getItemHeight(i),
				}}
			>
				{renderItem(item, i)}
			</div>,
		);
	}

	if (items.length === 0 && !isLoading && emptyState) {
		return <>{emptyState}</>;
	}

	return (
		<div
			ref={containerRef}
			className={`relative overflow-auto ${className}`}
			style={{ height }}
			onScroll={handleScroll}
		>
			<div
				ref={scrollRef}
				style={{
					height: getTotalHeight(),
					position: "relative",
				}}
			>
				{visibleItems}
			</div>

			{isLoading && (
				<div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
					<div className="flex items-center justify-center">
						<Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
						<span className="ml-2 text-sm text-gray-400">Loading more...</span>
					</div>
				</div>
			)}
		</div>
	);
}

// Hook for infinite scroll without virtualization
export function useInfiniteScroll(
	callback: () => void,
	options?: {
		threshold?: number;
		enabled?: boolean;
		rootMargin?: string;
	},
) {
	const { threshold = 0.9, enabled = true, rootMargin = "0px" } = options || {};
	const observerRef = useRef<IntersectionObserver | null>(null);
	const targetRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!enabled) return;

		const handleIntersection = (entries: IntersectionObserverEntry[]) => {
			const [entry] = entries;
			if (entry.isIntersecting) {
				callback();
			}
		};

		observerRef.current = new IntersectionObserver(handleIntersection, {
			root: null,
			rootMargin,
			threshold,
		});

		if (targetRef.current) {
			observerRef.current.observe(targetRef.current);
		}

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [callback, threshold, enabled, rootMargin]);

	const setTarget = useCallback((element: HTMLElement | null) => {
		if (observerRef.current && targetRef.current) {
			observerRef.current.unobserve(targetRef.current);
		}

		targetRef.current = element;

		if (observerRef.current && element) {
			observerRef.current.observe(element);
		}
	}, []);

	return setTarget;
}

// Pagination hook
export function usePagination<T>(items: T[], itemsPerPage = 10) {
	const [currentPage, setCurrentPage] = useState(1);

	const totalPages = Math.ceil(items.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentItems = items.slice(startIndex, endIndex);

	const goToPage = (page: number) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	};

	const nextPage = () => goToPage(currentPage + 1);
	const prevPage = () => goToPage(currentPage - 1);
	const firstPage = () => goToPage(1);
	const lastPage = () => goToPage(totalPages);

	const canGoPrev = currentPage > 1;
	const canGoNext = currentPage < totalPages;

	const pageNumbers = [];
	const maxVisible = 5;
	const halfVisible = Math.floor(maxVisible / 2);

	let start = Math.max(1, currentPage - halfVisible);
	let end = Math.min(totalPages, currentPage + halfVisible);

	if (currentPage <= halfVisible) {
		end = Math.min(totalPages, maxVisible);
	}
	if (currentPage > totalPages - halfVisible) {
		start = Math.max(1, totalPages - maxVisible + 1);
	}

	for (let i = start; i <= end; i++) {
		pageNumbers.push(i);
	}

	return {
		currentPage,
		totalPages,
		currentItems,
		pageNumbers,
		canGoPrev,
		canGoNext,
		goToPage,
		nextPage,
		prevPage,
		firstPage,
		lastPage,
		startIndex: startIndex + 1,
		endIndex: Math.min(endIndex, items.length),
		totalItems: items.length,
	};
}
