import type { ChartData, ChartOptions, ChartType } from "chart.js";

export interface GoldengateChartProps<T extends ChartType = ChartType> {
	data: ChartData<T>;
	options?: ChartOptions<T>;
	title?: string;
	liveIndicator?: boolean;
	liveText?: string;
	className?: string;
	height?: number | string;
	onDataPointClick?: (event: any, elements: any) => void;
}

export interface ChartContainerProps {
	title?: string;
	liveIndicator?: boolean;
	liveText?: string;
	className?: string;
	children: React.ReactNode;
	height?: number | string;
}

export type ChartDataPoint = {
	label: string;
	value: number;
	color?: string;
};

export type TimeSeriesDataPoint = {
	x: Date | string;
	y: number;
};

export type ScatterDataPoint = {
	x: number;
	y: number;
	r?: number; // For bubble charts
};

export interface ChartDataset {
	label: string;
	data: number[] | TimeSeriesDataPoint[] | ScatterDataPoint[];
	backgroundColor?: string | string[];
	borderColor?: string;
	borderWidth?: number;
	tension?: number;
	fill?: boolean;
	pointRadius?: number;
	pointHoverRadius?: number;
}

export interface GoldengateTheme {
	primaryColor: string;
	secondaryColor: string;
	backgroundColor: string;
	gridColor: string;
	textColor: string;
	fontFamily: string;
}

export type ChartUpdateFunction = (newData: any) => void;

export interface AnimatedChartProps {
	animationType?: "default" | "fast" | "slow" | "none";
	animationDelay?: number;
}

export interface InteractiveChartProps {
	enableZoom?: boolean;
	enablePan?: boolean;
	onZoom?: (chart: any) => void;
	onPan?: (chart: any) => void;
}

export interface ResponsiveChartProps {
	breakpoints?: {
		mobile?: number;
		tablet?: number;
		desktop?: number;
	};
	mobileOptions?: ChartOptions;
	tabletOptions?: ChartOptions;
	desktopOptions?: ChartOptions;
}
