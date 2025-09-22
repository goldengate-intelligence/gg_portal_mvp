import React from 'react';
import type { ChartContainerProps } from '../types';
import { CONTRACTOR_DETAIL_COLORS } from '../../../logic/utils';

export function ChartContainer({
  title,
  liveIndicator = false,
  liveText = 'LIVE',
  className = '',
  children,
  height = 400
}: ChartContainerProps) {
  return (
    <div
      className={`
        relative overflow-hidden
        border border-gray-700
        rounded-lg p-6
        backdrop-blur-sm
        transition-all duration-300
        ${className}
      `}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor
      }}
    >
      {/* Scanning line effect */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300/10 to-transparent animate-scan" />
      
      {/* Title */}
      {title && (
        <div className="absolute top-3 left-5 z-10">
          <h3 className="font-sans text-xs uppercase tracking-wider text-gray-500">
            {title}
          </h3>
        </div>
      )}
      
      {/* Live Indicator */}
      {liveIndicator && (
        <div className="absolute top-3 right-5 z-10 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
          <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
            {liveText}
          </span>
        </div>
      )}
      
      {/* Chart Content */}
      <div className="w-full h-full flex items-center justify-center pt-8">
        {children}
      </div>
      
    </div>
  );
}