/**
 * Map Dot Component
 *
 * Individual interactive dot on the network locations map with tooltip
 */

import React from 'react';
import { getLocationCoordinates, coordinatesToMapPercentage } from '../../../services/geocoding';
import type { MapDotProps } from './types/networkDistributionTypes';

export const MapDot: React.FC<MapDotProps> = ({
  dot,
  index,
  hoveredDot,
  onDotHover
}) => {
  // Use existing geocoding service to get coordinates from city/state or zip
  const locationData = getLocationCoordinates(dot.zip, dot.city, dot.state);
  if (!locationData) return null;

  // Convert coordinates to map percentage positioning
  const mapPosition = coordinatesToMapPercentage(locationData.coordinates);
  const leftPercent = parseFloat(mapPosition.left);
  const topPercent = parseFloat(mapPosition.top);

  const dotId = `${dot.city || dot.zip || 'unknown'}-${dot.type}`;

  // Calculate tooltip positioning
  const isNearTop = topPercent < 20;
  const isNearLeft = leftPercent < 15;
  const isNearRight = leftPercent > 85;

  return (
    <div
      className="absolute"
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: hoveredDot === dotId ? 200 : 100,
        pointerEvents: 'auto'
      }}
      onMouseEnter={() => onDotHover(dotId)}
      onMouseLeave={() => onDotHover(null)}
    >
      {/* Animated ping effect */}
      <div
        className="absolute inset-0 w-3 h-3 rounded-full opacity-40 animate-ping"
        style={{
          backgroundColor: dot.color,
          pointerEvents: 'none'
        }}
      />

      {/* Main dot */}
      <div
        className="relative w-3 h-3 rounded-full cursor-pointer"
        style={{
          backgroundColor: dot.color,
          boxShadow: `0 0 8px ${dot.color}`
        }}
      />

      {/* Tooltip */}
      <div
        className={`absolute transition-opacity duration-200 pointer-events-none ${
          hoveredDot === dotId ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          zIndex: 1000,
          ...(isNearTop ? {
            top: '100%',
            marginTop: '8px'
          } : {
            bottom: '100%',
            marginBottom: '8px'
          }),
          ...(isNearLeft ? {
            left: '0',
            transform: 'translateX(-25%)'
          } : isNearRight ? {
            right: '0',
            transform: 'translateX(25%)'
          } : {
            left: '50%',
            transform: 'translateX(-50%)'
          })
        }}
      >
        <div
          className="bg-gray-900/95 backdrop-blur-sm border rounded-lg p-2 whitespace-nowrap shadow-xl"
          style={{ borderColor: `${dot.color}66` }}
        >
          <div className="text-xs font-bold text-gray-100 mb-0.5">
            {dot.name}
          </div>
          <div className="text-[10px] text-gray-400">
            {dot.location}
          </div>
        </div>

        {/* Tooltip Arrow */}
        <div
          className="absolute"
          style={{
            ...(isNearTop ? {
              bottom: '100%',
              left: isNearLeft ? '25%' : isNearRight ? '75%' : '50%',
              transform: 'translateX(-50%)',
              marginBottom: '-1px'
            } : {
              top: '100%',
              left: isNearLeft ? '25%' : isNearRight ? '75%' : '50%',
              transform: 'translateX(-50%)',
              marginTop: '-1px'
            })
          }}
        >
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              ...(isNearTop ? {
                borderBottom: '4px solid rgb(17 24 39 / 0.95)'
              } : {
                borderTop: '4px solid rgb(17 24 39 / 0.95)'
              })
            }}
          />
        </div>
      </div>
    </div>
  );
};