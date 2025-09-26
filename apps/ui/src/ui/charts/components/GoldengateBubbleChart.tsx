import React from "react";
import { Bubble } from "react-chartjs-2";
import { CHART_CONFIGS, COLOR_SCHEMES } from "../config";
import type { GoldengateChartProps } from "../types";
import { mergeChartOptions } from "../utils";
import { ChartContainer } from "./ChartContainer";

export function GoldengateBubbleChart({
	data,
	options,
	title,
	liveIndicator = true,
	liveText = "ANALYZING",
	className,
	height = 400,
	onDataPointClick,
}: GoldengateChartProps<"bubble">) {
	const chartOptions = mergeChartOptions(CHART_CONFIGS.scatter, options, {
		onClick: onDataPointClick,
	});

	const styledData = {
		...data,
		datasets: data.datasets.map((dataset, index) => ({
			backgroundColor:
				COLOR_SCHEMES.transparentGradient[
					index % COLOR_SCHEMES.transparentGradient.length
				],
			borderColor: COLOR_SCHEMES.primary[index % COLOR_SCHEMES.primary.length],
			borderWidth: 2,
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
			<Bubble data={styledData} options={chartOptions} />
		</ChartContainer>
	);
}
