import { cn } from "../../logic/utils";

function Skeleton({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("animate-pulse rounded-md bg-dark-gold", className)}
			{...props}
		/>
	);
}

// Loading spinner component
const LoadingSpinner = ({
	className,
	size = "default",
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	size?: "sm" | "default" | "lg";
}) => {
	const sizes = {
		sm: "w-4 h-4",
		default: "w-6 h-6",
		lg: "w-8 h-8",
	};

	return (
		<div
			className={cn(
				"animate-spin rounded-full border-2 border-yellow-500/30 border-t-yellow-500",
				sizes[size],
				className,
			)}
			{...props}
		/>
	);
};

// Specialized skeleton components
const ContractorCardSkeleton = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => {
	return (
		<div
			className={cn(
				"rounded-lg border border-yellow-500/20 bg-medium-gray p-6",
				className,
			)}
			{...props}
		>
			<div className="space-y-4">
				<div className="space-y-2">
					<Skeleton className="h-4 w-3/4" />
					<Skeleton className="h-3 w-1/2" />
				</div>
				<div className="space-y-2">
					<div className="flex justify-between">
						<Skeleton className="h-3 w-1/3" />
						<Skeleton className="h-3 w-1/4" />
					</div>
					<div className="flex justify-between">
						<Skeleton className="h-3 w-1/3" />
						<Skeleton className="h-3 w-1/4" />
					</div>
				</div>
			</div>
		</div>
	);
};

const OpportunityCardSkeleton = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => {
	return (
		<div
			className={cn(
				"rounded-lg border border-yellow-500/20 bg-medium-gray p-6",
				className,
			)}
			{...props}
		>
			<div className="space-y-4">
				<div className="space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-2/3" />
					<Skeleton className="h-3 w-1/2" />
				</div>
				<div className="space-y-2">
					<div className="flex justify-between">
						<Skeleton className="h-3 w-1/4" />
						<Skeleton className="h-3 w-1/4" />
					</div>
					<div className="flex justify-between">
						<Skeleton className="h-3 w-1/4" />
						<Skeleton className="h-3 w-1/4" />
					</div>
					<div className="flex justify-between">
						<Skeleton className="h-3 w-1/4" />
						<Skeleton className="h-3 w-1/4" />
					</div>
				</div>
			</div>
		</div>
	);
};

const TableSkeleton = ({
	rows = 5,
	columns = 4,
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	rows?: number;
	columns?: number;
}) => {
	return (
		<div className={cn("space-y-4", className)} {...props}>
			{/* Header skeleton */}
			<div
				className="grid gap-4"
				style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
			>
				{Array.from({ length: columns }, (_, i) => (
					<Skeleton key={i} className="h-4 w-full" />
				))}
			</div>

			{/* Rows skeleton */}
			{Array.from({ length: rows }, (_, rowIndex) => (
				<div
					key={rowIndex}
					className="grid gap-4"
					style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
				>
					{Array.from({ length: columns }, (_, colIndex) => (
						<Skeleton key={colIndex} className="h-4 w-full" />
					))}
				</div>
			))}
		</div>
	);
};

const PageSkeleton = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => {
	return (
		<div className={cn("space-y-6 p-6", className)} {...props}>
			{/* Header skeleton */}
			<div className="space-y-2">
				<Skeleton className="h-8 w-1/3" />
				<Skeleton className="h-4 w-2/3" />
			</div>

			{/* Content skeleton */}
			<div className="space-y-4">
				<div className="grid gap-6 md:grid-cols-3">
					<ContractorCardSkeleton />
					<ContractorCardSkeleton />
					<ContractorCardSkeleton />
				</div>
				<div className="space-y-4">
					<Skeleton className="h-10 w-full" />
					<TableSkeleton rows={8} columns={5} />
				</div>
			</div>
		</div>
	);
};

const SearchSkeleton = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => {
	return (
		<div className={cn("space-y-6", className)} {...props}>
			{/* Search bar skeleton */}
			<div className="flex gap-4">
				<Skeleton className="h-10 flex-1" />
				<Skeleton className="h-10 w-24" />
			</div>

			{/* Filters skeleton */}
			<div className="flex gap-2">
				<Skeleton className="h-8 w-20" />
				<Skeleton className="h-8 w-24" />
				<Skeleton className="h-8 w-16" />
				<Skeleton className="h-8 w-20" />
			</div>

			{/* Results skeleton */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 9 }, (_, i) => (
					<ContractorCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
};

// Loading states with messages
const LoadingState = ({
	message = "Loading...",
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	message?: string;
}) => {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center p-8 space-y-4",
				className,
			)}
			{...props}
		>
			<LoadingSpinner size="lg" />
			<p className="text-gray-400 font-aptos">{message}</p>
		</div>
	);
};

const EmptyState = ({
	title = "No data available",
	description,
	action,
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	title?: string;
	description?: string;
	action?: React.ReactNode;
}) => {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center p-12 space-y-4 text-center",
				className,
			)}
			{...props}
		>
			<div className="text-6xl text-gray-600 mb-4">📋</div>
			<h3 className="text-lg font-medium text-white font-aptos">{title}</h3>
			{description && (
				<p className="text-gray-400 font-aptos max-w-md">{description}</p>
			)}
			{action && <div className="mt-4">{action}</div>}
		</div>
	);
};

export {
	Skeleton,
	LoadingSpinner,
	ContractorCardSkeleton,
	OpportunityCardSkeleton,
	TableSkeleton,
	PageSkeleton,
	SearchSkeleton,
	LoadingState,
	EmptyState,
};
