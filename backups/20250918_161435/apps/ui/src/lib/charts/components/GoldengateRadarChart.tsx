import React from 'react';
import { Radar } from 'react-chartjs-2';
import { ChartContainer } from './ChartContainer';
import type { GoldengateChartProps } from '../types';
import { CHART_CONFIGS, GOLDENGATE_COLORS, COLOR_SCHEMES } from '../config';
import { mergeChartOptions } from '../utils';

export function GoldengateRadarChart({
  data,
  options,
  title,
  liveIndicator = true,
  liveText = 'SCANNING',
  className,
  height = 400,
  onDataPointClick
}: GoldengateChartProps<'radar'>) {
  
  const chartOptions = mergeChartOptions(CHART_CONFIGS.radar, options, {
    onClick: onDataPointClick,
    scales: {
      r: {
        ...CHART_CONFIGS.radar.scales?.r,
        beginAtZero: true,
        max: options?.scales?.r?.max || 100
      }
    }
  });

  // Apply default styling to datasets
  const styledData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      borderColor: COLOR_SCHEMES.primary[index % COLOR_SCHEMES.primary.length],
      backgroundColor: COLOR_SCHEMES.transparentGradient[index % COLOR_SCHEMES.transparentGradient.length],
      pointBackgroundColor: COLOR_SCHEMES.primary[index % COLOR_SCHEMES.primary.length],
      pointBorderColor: '#000',
      pointBorderWidth: 2,
      borderWidth: 2,
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
      <Radar data={styledData} options={chartOptions} />
    </ChartContainer>
  );
}