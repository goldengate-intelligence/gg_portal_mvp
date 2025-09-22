import React from 'react';
import { Pie } from 'react-chartjs-2';
import { ChartContainer } from './ChartContainer';
import type { GoldengateChartProps } from '../types';
import { CHART_CONFIGS, COLOR_SCHEMES } from '../config';
import { mergeChartOptions } from '../utils';

export function GoldengatePieChart({
  data,
  options,
  title,
  liveIndicator = true,
  liveText = 'COMPUTING',
  className,
  height = 400,
  onDataPointClick
}: GoldengateChartProps<'pie'>) {
  
  const chartOptions = mergeChartOptions(CHART_CONFIGS.doughnut, options, {
    onClick: onDataPointClick
  });

  const styledData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      backgroundColor: COLOR_SCHEMES.gradient,
      borderColor: '#000',
      borderWidth: 2,
      hoverOffset: 10,
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
      <Pie data={styledData} options={chartOptions} />
    </ChartContainer>
  );
}