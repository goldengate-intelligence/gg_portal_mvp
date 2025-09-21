import React from 'react';
import { Chart } from 'react-chartjs-2';
import { ChartContainer } from './ChartContainer';
import type { GoldengateChartProps } from '../types';
import { CHART_CONFIGS, GOLDENGATE_COLORS, COLOR_SCHEMES } from '../config';
import { mergeChartOptions } from '../utils';

export function GoldengateMixedChart({
  data,
  options,
  title,
  liveIndicator = true,
  liveText = 'PROCESSING',
  className,
  height = 400,
  onDataPointClick
}: GoldengateChartProps<'bar'>) {
  
  // Mixed charts typically have bar as base with line overlays
  const chartOptions = mergeChartOptions(CHART_CONFIGS.bar, options, {
    onClick: onDataPointClick,
    scales: {
      ...CHART_CONFIGS.bar.scales,
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: {
          color: GOLDENGATE_COLORS.cyan,
          callback: (value: any) => value + '%'
        }
      }
    }
  });

  // Apply styling based on dataset type
  const styledData = {
    ...data,
    datasets: data.datasets.map((dataset: any, index) => {
      if (dataset.type === 'line') {
        return {
          borderColor: GOLDENGATE_COLORS.cyan,
          backgroundColor: 'rgba(0, 217, 255, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          ...dataset
        };
      }
      return {
        backgroundColor: 'rgba(255, 215, 0, 0.6)',
        borderColor: GOLDENGATE_COLORS.gold,
        borderWidth: 2,
        ...dataset
      };
    })
  };

  return (
    <ChartContainer
      title={title}
      liveIndicator={liveIndicator}
      liveText={liveText}
      className={className}
      height={height}
    >
      <Chart type='bar' data={styledData} options={chartOptions} />
    </ChartContainer>
  );
}