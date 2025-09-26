import React from "react";
import { Doughnut } from "react-chartjs-2";
import { CHART_CONFIGS, COLOR_SCHEMES } from "../config";
import type { GoldengateChartProps } from "../types";
import { mergeChartOptions } from "../utils";
import { ChartContainer } from "./ChartContainer";

export function GoldengateDoughnutChart({
	data,
	options,
	title,
	liveIndicator = true,
	liveText = "ANALYZING",
	className,
	height = 400,
	onDataPointClick,
	cutout = "70%",
}: GoldengateChartProps<"doughnut"> & { cutout?: string }) {
	const chartOptions = mergeChartOptions(
		CHART_CONFIGS.doughnut,
		{
			onClick: onDataPointClick,
			cutout: cutout,
			plugins: {
				...CHART_CONFIGS.doughnut.plugins,
				tooltip: {
					...CHART_CONFIGS.doughnut.plugins?.tooltip,
					callbacks: {
						label: (context: any) => {
							const label = context.label || "";
							const value = context.parsed || 0;
							const total = context.chart._metasets[0].total;
							const percentage = ((value / total) * 100).toFixed(1);
							return `${label}: ${percentage}%`;
						},
					},
				},
			},
		},
		options,
	);

	// Apply default styling to datasets
	const styledData = {
		...data,
		datasets: data.datasets.map((dataset) => ({
			backgroundColor: COLOR_SCHEMES.gradient,
			borderColor: "#000",
			borderWidth: 2,
			hoverOffset: 10,
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
			<Doughnut data={styledData} options={chartOptions} />
		</ChartContainer>
	);
}
