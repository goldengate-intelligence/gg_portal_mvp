import React from "react";
import { Bar } from "react-chartjs-2";
import { CHART_CONFIGS } from "../config";
import type { GoldengateChartProps } from "../types";
import { mergeChartOptions } from "../utils";
import { ChartContainer } from "./ChartContainer";

export function GoldengateWaterfallChart({
	data,
	options = {},
	title,
	liveIndicator = false,
	liveText = "LIVE",
	className,
	height = 400,
	onDataPointClick,
}: GoldengateChartProps<"bar">) {
	// Process data for waterfall effect
	const processedData = React.useMemo(() => {
		if (!data.datasets?.[0]?.data) return data;

		const dataset = data.datasets[0];
		const values = dataset.data as number[];
		let cumulative = 0;
		const floatingBars: [number, number][] = [];

		values.forEach((value, index) => {
			if (index === values.length - 1) {
				// Total bar
				floatingBars.push([0, cumulative + value]);
			} else {
				floatingBars.push([cumulative, cumulative + value]);
				cumulative += value;
			}
		});

		return {
			...data,
			datasets: [
				{
					...dataset,
					data: floatingBars,
					backgroundColor: (context: any) => {
						const value = values[context.dataIndex];
						if (context.dataIndex === values.length - 1) {
							return "rgba(123, 97, 255, 0.8)"; // Total bar
						}
						return value >= 0
							? "rgba(0, 255, 136, 0.8)"
							: "rgba(255, 0, 102, 0.8)";
					},
					borderColor: (context: any) => {
						const value = values[context.dataIndex];
						if (context.dataIndex === values.length - 1) {
							return "#7B61FF";
						}
						return value >= 0 ? "#00FF88" : "#FF0066";
					},
				},
			],
		};
	}, [data]);

	const chartOptions = mergeChartOptions(
		{
			...CHART_CONFIGS.bar,
			scales: {
				...CHART_CONFIGS.bar.scales,
				y: {
					...CHART_CONFIGS.bar.scales?.y,
					beginAtZero: false,
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
			<Bar data={processedData} options={chartOptions} />
		</ChartContainer>
	);
}
