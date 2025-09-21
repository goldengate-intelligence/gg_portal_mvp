import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartContainer } from './ChartContainer';
import type { GoldengateChartProps } from '../types';
import { CHART_CONFIGS, GOLDENGATE_COLORS, COLOR_SCHEMES } from '../config';
import { mergeChartOptions } from '../utils';

export function GoldengateLineChart({
  data,
  options,
  title,
  liveIndicator = true,
  liveText = 'STREAMING',
  className,
  height = 400,
  onDataPointClick
}: GoldengateChartProps<'line'>) {
  
  const chartOptions = mergeChartOptions(CHART_CONFIGS.line, options, {
    onClick: onDataPointClick,
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  });

  // Apply default styling to datasets
  const styledData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      borderColor: COLOR_SCHEMES.primary[index % COLOR_SCHEMES.primary.length],
      backgroundColor: COLOR_SCHEMES.transparentGradient[index % COLOR_SCHEMES.transparentGradient.length],
      tension: 0.4,
      fill: true,
      pointBackgroundColor: COLOR_SCHEMES.primary[index % COLOR_SCHEMES.primary.length],
      pointBorderColor: '#000',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 3,
      ...dataset
    }))
  };

  return (
    <ChartContainer
      title={title}
      liveIndicator={liveIndicator}
      liveText={liveText}
      className={className}
      height={height}
    >
      <Line data={styledData} options={chartOptions} />
    </ChartContainer>
  );
}