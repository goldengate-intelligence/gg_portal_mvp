import React from 'react';
import { Bar } from 'react-chartjs-2';
import type { GoldengateChartProps } from '../types';
import { ChartContainer } from './ChartContainer';
import { mergeChartOptions } from '../utils';
import { CHART_CONFIGS } from '../config';

export function GoldengateHorizontalBarChart({
  data,
  options = {},
  title,
  liveIndicator = false,
  liveText = 'LIVE',
  className,
  height = 400,
  onDataPointClick
}: GoldengateChartProps<'bar'>) {
  
  const chartOptions = mergeChartOptions(
    {
      ...CHART_CONFIGS.bar,
      indexAxis: 'y' as const,
      onClick: onDataPointClick
    },
    options
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