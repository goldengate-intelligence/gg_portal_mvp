import React from "react";
import { Scatter } from "react-chartjs-2";
import { CHART_CONFIGS, GOLDENGATE_COLORS } from "../config";
import type { GoldengateChartProps } from "../types";
import { mergeChartOptions } from "../utils";
import { ChartContainer } from "./ChartContainer";

export function GoldengateScatterChart({
	data,
	options,
	title,
	liveIndicator = true,
	liveText = "TRACKING",
	className,
	height = 400,
	onDataPointClick,
}: GoldengateChartProps<"scatter">) {
	const chartOptions = mergeChartOptions(CHART_CONFIGS.scatter, options, {
		onClick: onDataPointClick,
	});

	const styledData = {
		...data,
		datasets: data.datasets.map((dataset, index) => ({
			backgroundColor: "rgba(255, 215, 0, 0.6)",
			borderColor: GOLDENGATE_COLORS.gold,
			borderWidth: 1,
			pointRadius: 6,
			pointHoverRadius: 8,
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
			<Scatter data={styledData} options={chartOptions} />
		</ChartContainer>
	);
}
