import React from "react";
import { Bar } from "react-chartjs-2";
import { CHART_CONFIGS } from "../config";
import type { GoldengateChartProps } from "../types";
import { mergeChartOptions } from "../utils";
import { ChartContainer } from "./ChartContainer";

export function GoldengateStackedBarChart({
	data,
	options = {},
	title,
	liveIndicator = false,
	liveText = "LIVE",
	className,
	height = 400,
	onDataPointClick,
}: GoldengateChartProps<"bar">) {
	const chartOptions = mergeChartOptions(
		{
			...CHART_CONFIGS.bar,
			scales: {
				...CHART_CONFIGS.bar.scales,
				x: {
					...CHART_CONFIGS.bar.scales?.x,
					stacked: true,
				},
				y: {
					...CHART_CONFIGS.bar.scales?.y,
					stacked: true,
				},
			},
			onClick: onDataPointClick,
		},
		options,
	);

	return (
		<ChartContainer
			title={title}
			liveIndicator={liveIndicator}
			liveText={liveText}
			className={className}
			height={height}
		>
			<Bar data={data} options={chartOptions} />
		</ChartContainer>
	);
}
