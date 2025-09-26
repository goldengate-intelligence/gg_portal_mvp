import React from "react";
import { Bar } from "react-chartjs-2";
import { CHART_CONFIGS, GOLDENGATE_COLORS } from "../config";
import type { GoldengateChartProps } from "../types";
import { mergeChartOptions } from "../utils";
import { ChartContainer } from "./ChartContainer";

export function GoldengateBarChart({
	data,
	options,
	title,
	liveIndicator = true,
	liveText = "LIVE",
	className,
	height = 400,
	onDataPointClick,
}: GoldengateChartProps<"bar">) {
	// Merge default bar chart config with custom options
	const chartOptions = mergeChartOptions(
		CHART_CONFIGS.bar,
		{
			onClick: onDataPointClick,
		},
		options,
	);

	// Apply default styling to datasets if not provided
	const styledData = {
		...data,
		datasets: data.datasets.map((dataset, index) => ({
			backgroundColor: GOLDENGATE_COLORS.gold,
			borderColor: GOLDENGATE_COLORS.goldBright,
			borderWidth: 2,
			borderRadius: 4,
			hoverBackgroundColor: GOLDENGATE_COLORS.goldBright,
			...dataset,
		})),
	};

	return (
		<ChartContainer
			title={title}
			liveIndicator={liveIndicator}
			liveText={liveText}
			className={className}
			height={height}
		>
			<Bar data={styledData} options={chartOptions} />
		</ChartContainer>
	);
}
