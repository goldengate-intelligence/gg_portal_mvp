import React from 'react';
import { PolarArea } from 'react-chartjs-2';
import { ChartContainer } from './ChartContainer';
import type { GoldengateChartProps } from '../types';
import { CHART_CONFIGS, COLOR_SCHEMES, GOLDENGATE_COLORS } from '../config';
import { mergeChartOptions } from '../utils';

export function GoldengatePolarChart({
  data,
  options,
  title,
  liveIndicator = true,
  liveText = 'TRACKING',
  className,
  height = 400,
  onDataPointClick
}: GoldengateChartProps<'polarArea'>) {
  
  const chartOptions = mergeChartOptions(CHART_CONFIGS.doughnut, options, {
    onClick: onDataPointClick,
    scales: {
      r: {
        grid: { color: 'rgba(0, 217, 255, 0.2)' },
        ticks: {
          color: GOLDENGATE_COLORS.cyan,
          backdropColor: 'rgba(0, 0, 0, 0.7)'
        }
      }
    }
  });

  const styledData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      backgroundColor: COLOR_SCHEMES.gradient,
      borderColor: '#000',
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
      <PolarArea data={styledData} options={chartOptions} />
    </ChartContainer>
  );
}