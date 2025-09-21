import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartContainer } from './ChartContainer';
import type { GoldengateChartProps } from '../types';
import { CHART_CONFIGS, COLOR_SCHEMES } from '../config';
import { mergeChartOptions } from '../utils';

export function GoldengateAreaChart({
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
    plugins: {
      ...CHART_CONFIGS.line.plugins,
      filler: {
        propagate: false
      }
    }
  });

  // Force area chart styling
  const styledData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      tension: 0.4,
      borderColor: COLOR_SCHEMES.primary[index % COLOR_SCHEMES.primary.length],
      backgroundColor: COLOR_SCHEMES.transparentGradient[index % COLOR_SCHEMES.transparentGradient.length],
      borderWidth: 3,
      pointRadius: 0,
      pointHoverRadius: 5,
      ...dataset,
      fill: true // Ensure fill is always true for area chart
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