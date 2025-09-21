/**
 * NETWORK MAP COMPONENT BACKUP
 * Created: 2024-12-17
 *
 * DESCRIPTION:
 * This is a complete, self-contained Network Map visualization component extracted from NetworkV1Layout.
 * It displays contractor relationships on a US map with accurate geographic positioning.
 *
 * REQUIRED DEPENDENCIES:
 * npm packages:
 * - react-usa-map (for base US map SVG)
 * - d3-geo (for Albers USA projection - geographic coordinate transformation)
 *
 * Installation:
 * npm install react-usa-map d3-geo
 * or
 * yarn add react-usa-map d3-geo
 *
 * FEATURES:
 * - Accurate zip code-level positioning using d3.geoAlbersUsa projection
 * - Smart tooltips that avoid edge cutoff
 * - Color-coded relationship types
 * - Dynamic data binding from network relationships
 * - Hover interactions with custom tooltips
 *
 * PROJECTION CALIBRATION:
 * The projection has been precisely calibrated to match react-usa-map's SVG viewBox.
 * Final calibrated values:
 * - Scale: 1240
 * - Translate X offset: -3px (mapWidth/2 - 3)
 * - Translate Y offset: -8px (mapHeight/2 - 8)
 * - ViewBox dimensions: 959 x 593 (from react-usa-map source)
 *
 * COLOR SCHEME:
 * - Contractor HQ: #D2AC38 (gold) with black outline
 * - Prime Partners: #5BC0EB (blue) with white outline
 * - Sub Contractors: #FF4C4C (red) with white outline
 * - Places of Performance: #4ade80 (green) with white outline
 */

import React from 'react';
import USAMap from 'react-usa-map';
import * as d3 from 'd3-geo';

// Type definitions
interface NetworkMapProps {
  networkData: {
    relationships?: {
      asSubcontractor?: {
        partners?: Array<{
          primeUei: string;
          primeName: string;
          sharedRevenue: number;
          sharedContracts: number;
        }>;
      };
      asPrime?: {
        partners?: Array<{
          subUei: string;
          subName: string;
          sharedRevenue: number;
          sharedContracts: number;
        }>;
      };
    };
  };
  containerColor?: string; // Background color for the map container
}

interface MapDot {
  zip: string;
  coords: [number, number]; // [longitude, latitude]
  type: 'contractor' | 'prime' | 'sub' | 'performance';
  color: string;
  name: string;
  location: string; // "City, ST ZIP" format
}

export const NetworkMapComponent: React.FC<NetworkMapProps> = ({
  networkData,
  containerColor = '#04070a'
}) => {
  // State to track which dot is being hovered
  const [hoveredDot, setHoveredDot] = React.useState<string | null>(null);

  // Create the map dots array with actual network data
  const mapDots: MapDot[] = [
    // Contractor HQ - Washington DC
    {
      zip: '20001',
      coords: [-77.0117, 38.9101],
      type: 'contractor',
      color: '#D2AC38',
      name: 'Trio Fabrication LLC',
      location: 'Washington, DC 20001'
    },

    // Parent/Prime contractors - from actual network data (asSubcontractor.partners)
    ...(networkData.relationships?.asSubcontractor?.partners?.slice(0, 2).map((partner, index) => ({
      zip: index === 0 ? '10001' : '90210',
      coords: index === 0 ? [-73.9967, 40.7484] as [number, number] : [-118.4065, 34.0901] as [number, number],
      type: 'prime' as const,
      color: '#5BC0EB',
      name: partner.primeName || (index === 0 ? 'MegaCorp Industries' : 'Global Defense Systems'),
      location: index === 0 ? 'New York, NY 10001' : 'Beverly Hills, CA 90210'
    })) || []),

    // Sub contractors - from actual network data (asPrime.partners)
    ...(networkData.relationships?.asPrime?.partners?.slice(0, 3).map((partner, index) => ({
      zip: index === 0 ? '75201' : index === 1 ? '73102' : '59601',
      coords: (index === 0 ? [-96.7970, 32.7767] :
               index === 1 ? [-97.5171, 35.4676] :
               [-104.0446, 45.6796]) as [number, number],
      type: 'sub' as const,
      color: '#FF4C4C',
      name: partner.subName || (index === 0 ? 'Texas Materials Inc' :
            index === 1 ? 'Oklahoma Precision' :
            'Montana Coatings LLC'),
      location: index === 0 ? 'Dallas, TX 75201' :
                index === 1 ? 'Oklahoma City, OK 73102' :
                'Helena, MT 59601'
    })) || []),

    // Places of Performance - DOD Direct Award projects
    {
      zip: '80202',
      coords: [-104.9903, 39.7392],
      type: 'performance',
      color: '#4ade80',
      name: 'Department of Defense',
      location: 'Denver, CO 80202'
    },
    {
      zip: '80521',
      coords: [-105.0875, 40.5853],
      type: 'performance',
      color: '#4ade80',
      name: 'Department of Defense',
      location: 'Fort Collins, CO 80521'
    },
    {
      zip: '66502',
      coords: [-96.5560, 39.0119],
      type: 'performance',
      color: '#4ade80',
      name: 'Department of Defense',
      location: 'Manhattan, KS 66502'
    },

    // Additional Places of Performance - Prime Partner projects
    {
      zip: '23185',
      coords: [-76.4935, 37.2707],
      type: 'performance',
      color: '#4ade80',
      name: networkData.relationships?.asSubcontractor?.partners?.[0]?.primeName || 'MegaCorp Industries',
      location: 'Williamsburg, VA 23185'
    },
    {
      zip: '31905',
      coords: [-84.9771, 32.3809],
      type: 'performance',
      color: '#4ade80',
      name: networkData.relationships?.asSubcontractor?.partners?.[0]?.primeName || 'MegaCorp Industries',
      location: 'Columbus, GA 31905'
    },
    {
      zip: '92134',
      coords: [-117.1434, 32.7157],
      type: 'performance',
      color: '#4ade80',
      name: networkData.relationships?.asSubcontractor?.partners?.[1]?.primeName || 'Global Defense Systems',
      location: 'San Diego, CA 92134'
    },
    {
      zip: '85365',
      coords: [-114.3935, 33.5778],
      type: 'performance',
      color: '#4ade80',
      name: networkData.relationships?.asSubcontractor?.partners?.[1]?.primeName || 'Global Defense Systems',
      location: 'Yuma, AZ 85365'
    },
  ];

  return (
    <div className="flex-1 relative rounded-lg overflow-hidden min-h-[300px]">
      {/* USA Map visualization */}
      <div className="relative w-full h-full">
        <USAMap
          width="100%"
          height="100%"
          defaultFill={containerColor}
          customize={{}}
          className="transition-all duration-300"
        />

        {/* Overlay dots for network relationships */}
        <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
          {mapDots.map((dot) => {
            // react-usa-map uses viewBox="0 0 959 593"
            // We need to map our projection to this exact coordinate space
            const mapWidth = 959;
            const mapHeight = 593;

            // Create projection that matches react-usa-map's internal coordinate system
            // CALIBRATED VALUES - DO NOT CHANGE WITHOUT TESTING
            const projection = d3.geoAlbersUsa()
              .scale(1240)  // Calibrated scale for accurate positioning
              .translate([mapWidth / 2 - 3, mapHeight / 2 - 8]); // Calibrated offsets

            const projectedCoords = projection(dot.coords);

            if (!projectedCoords) return null; // Skip if coordinates can't be projected (outside USA)

            // Convert SVG coordinates to percentage of container
            const leftPercent = (projectedCoords[0] / mapWidth) * 100;
            const topPercent = (projectedCoords[1] / mapHeight) * 100;

            const dotId = `${dot.zip}-${dot.type}`;

            // Edge detection for smart tooltip positioning
            const isNearTop = topPercent < 20;
            const isNearLeft = leftPercent < 15;
            const isNearRight = leftPercent > 85;

            return (
              <div
                key={dotId}
                className="absolute"
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: hoveredDot === dotId ? 200 : 100,
                  pointerEvents: 'auto'
                }}
                onMouseEnter={() => setHoveredDot(dotId)}
                onMouseLeave={() => setHoveredDot(null)}
              >
                {/* Pulsing animation ring */}
                <div
                  className="absolute inset-0 w-3 h-3 rounded-full opacity-40 animate-ping"
                  style={{
                    backgroundColor: dot.color,
                    pointerEvents: 'none'
                  }}
                />

                {/* Main dot */}
                <div
                  className="relative w-3 h-3 rounded-full border cursor-pointer"
                  style={{
                    backgroundColor: dot.color,
                    borderColor: dot.type === 'contractor' ? '#000000' : '#ffffff',
                    boxShadow: `0 0 8px ${dot.color}`
                  }}
                />

                {/* Custom Tooltip with smart positioning */}
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
                    style={{ borderColor: `${dot.color}66` }} // Border color matches dot with opacity
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
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * USAGE EXAMPLE:
 *
 * import { NetworkMapComponent } from './NetworkMapComponent';
 *
 * function MyComponent() {
 *   const networkData = {
 *     relationships: {
 *       asSubcontractor: {
 *         partners: [
 *           { primeName: 'MegaCorp Industries', primeUei: '123', sharedRevenue: 185000000, sharedContracts: 45 },
 *           { primeName: 'Global Defense Systems', primeUei: '456', sharedRevenue: 195000000, sharedContracts: 46 }
 *         ]
 *       },
 *       asPrime: {
 *         partners: [
 *           { subName: 'Texas Materials Inc', subUei: '789', sharedRevenue: 12000000, sharedContracts: 8 },
 *           { subName: 'Oklahoma Precision', subUei: '012', sharedRevenue: 9000000, sharedContracts: 10 },
 *           { subName: 'Montana Coatings LLC', subUei: '345', sharedRevenue: 8000000, sharedContracts: 7 }
 *         ]
 *       }
 *     }
 *   };
 *
 *   return (
 *     <NetworkMapComponent
 *       networkData={networkData}
 *       containerColor="#04070a"
 *     />
 *   );
 * }
 *
 * TESTING NOTES:
 *
 * Test coordinates used for calibration:
 * - 33131 (Miami, FL): [-80.1918, 25.7617]
 * - 90404 (Santa Monica, CA): [-118.4912, 34.0195]
 * - 20001 (Washington, DC): [-77.0117, 38.9101]
 *
 * The projection was iteratively refined to ensure accurate positioning.
 * Any changes to scale or translate values should be tested with these coordinates.
 *
 * KNOWN LIMITATIONS:
 * - Alaska and Hawaii are not supported (Albers USA projection limitation)
 * - Dots may overlap if too many are in the same geographic area
 * - Map is not interactive (states cannot be clicked)
 *
 * POTENTIAL ENHANCEMENTS:
 * - Add connection lines between related entities
 * - Implement clustering for overlapping dots
 * - Add zoom/pan capabilities
 * - Include state-level data visualization
 * - Add animation for data updates
 *
 * MAINTENANCE NOTES:
 * - The projection calibration is sensitive - test any changes thoroughly
 * - Tooltip positioning logic handles edge cases to prevent cutoff
 * - Z-index management ensures hovered dots appear above others
 * - Color scheme should remain consistent with overall design system
 */