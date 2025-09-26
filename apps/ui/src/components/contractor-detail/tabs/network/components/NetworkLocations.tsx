/**
 * Network Locations Component
 *
 * Right panel showing USA map with network location dots
 */

import React from 'react';
import USAMap from 'react-usa-map';
import { CONTRACTOR_DETAIL_COLORS, formatMoney } from '../../../index';
import { formatNetworkPercentage } from '../../../../../services/network-insights/networkDistributionService';
import { MapDot } from './MapDot';
import { MapLegend } from './MapLegend';
import { DEFAULT_LOCATION_COORDINATES } from '../../../../../shared-config';
import type { NetworkLocationsProps, NetworkLocationDot } from './types/networkDistributionTypes';

export const NetworkLocations: React.FC<NetworkLocationsProps> = ({
  contractor,
  distributionData,
  activityEvents,
  hoveredDot,
  onDotHover
}) => {
  // Generate network location dots from activity data
  const networkDots: NetworkLocationDot[] = React.useMemo(() => {
    const dots: NetworkLocationDot[] = [];

    // Contractor HQ - Use real location from activity events
    if (activityEvents && activityEvents.length > 0) {
      dots.push({
        city: activityEvents[0]?.CONTRACTOR_CITY,
        state: activityEvents[0]?.CONTRACTOR_STATE,
        type: 'contractor',
        color: '#D2AC38',
        name: contractor?.name || 'Current Contractor',
        location: `${activityEvents[0]?.CONTRACTOR_CITY || ''}, ${activityEvents[0]?.CONTRACTOR_STATE || ''}`
      });
    }

    // Government agencies (purple dots) - TODO: Need agency location lookup service
    if (distributionData?.agencyDirectAwards?.relationships) {
      distributionData.agencyDirectAwards.relationships.slice(0, 3).forEach((rel: any, idx: number) => {
        dots.push({
          zip: DEFAULT_LOCATION_COORDINATES.agencies, // Default to DC for government agencies
          type: 'agency',
          color: '#9B7EBD',
          name: rel.entityName,
          location: `${formatMoney(rel.totalAmount)} (${formatNetworkPercentage(rel.percentage)})`
        });
      });
    }

    // Prime contractors (blue dots) - TODO: Need entity zip lookup service
    if (distributionData?.primeSubAwards?.relationships) {
      distributionData.primeSubAwards.relationships.slice(0, 3).forEach((rel: any, idx: number) => {
        dots.push({
          zip: DEFAULT_LOCATION_COORDINATES.primes, // Default to San Francisco for prime contractors
          type: 'prime',
          color: '#5BC0EB',
          name: rel.entityName,
          location: `${formatMoney(rel.totalAmount)} (${formatNetworkPercentage(rel.percentage)})`
        });
      });
    }

    // Sub contractors (red dots) - TODO: Need entity zip lookup service
    if (distributionData?.vendorProcurement?.relationships) {
      distributionData.vendorProcurement.relationships.slice(0, 3).forEach((rel: any, idx: number) => {
        dots.push({
          zip: DEFAULT_LOCATION_COORDINATES.subs, // Default to Dallas for sub contractors
          type: 'sub',
          color: '#FF4C4C',
          name: rel.entityName,
          location: `${formatMoney(rel.totalAmount)} (${formatNetworkPercentage(rel.percentage)})`
        });
      });
    }

    // Places of Performance (green dots) - Use real performance locations
    if (activityEvents) {
      activityEvents
        .slice(0, 5)
        .filter(event => event.PERFORMANCE_CITY && event.PERFORMANCE_STATE)
        .forEach((event, idx) => {
          dots.push({
            city: event.PERFORMANCE_CITY,
            state: event.PERFORMANCE_STATE,
            type: 'performance',
            color: '#22c55e',
            name: 'Place of Performance',
            location: `${event.PERFORMANCE_CITY}, ${event.PERFORMANCE_STATE}`
          });
        });
    }

    return dots;
  }, [contractor, distributionData, activityEvents]);

  return (
    <div className="border border-gray-700 rounded-xl backdrop-blur-sm p-4 flex flex-col" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
          Network Locations
        </h4>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          <span className="text-[10px] text-[#22c55e] font-light" style={{ fontFamily: 'Genos, sans-serif', letterSpacing: '0.0125em' }}>
            TRACKING
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative rounded-lg overflow-hidden min-h-[316px]">
        <div className="relative w-full h-full">
          {/* USA Map */}
          <USAMap
            width="100%"
            height="100%"
            defaultFill={CONTRACTOR_DETAIL_COLORS.backgroundColor}
            customize={{}}
            className="transition-all duration-300"
          />

          {/* Overlay dots for network relationships */}
          <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
            {networkDots.map((dot, index) => (
              <MapDot
                key={`${dot.city || dot.zip || 'unknown'}-${dot.type}-${index}`}
                dot={dot}
                index={index}
                hoveredDot={hoveredDot}
                onDotHover={onDotHover}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <MapLegend />
    </div>
  );
};