import React from 'react';
import { Card } from "../../../ui/card";
import { CONTRACTOR_DETAIL_COLORS } from '../../../../lib/utils';
import USAMap from 'react-usa-map';
import * as d3 from 'd3-geo';

interface NetworkMapPanelProps {
  contractor: any;
  networkData: any;
}

export function NetworkMapPanel({
  contractor,
  networkData
}: NetworkMapPanelProps) {

  // State to track which dot is being hovered
  const [hoveredDot, setHoveredDot] = React.useState<string | null>(null);

  return (
    <div className="col-span-1">
      <Card className="h-full border-[#D2AC38]/30 rounded-xl overflow-hidden shadow-2xl hover:border-[#D2AC38]/50 transition-all duration-500 group relative bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 backdrop-blur-sm">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-5 z-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, #D2AC38 1px, transparent 1px),
              linear-gradient(180deg, #D2AC38 1px, transparent 1px)
            `,
            backgroundSize: '15px 15px'
          }} />
        </div>

        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-0" style={{ background: 'linear-gradient(135deg, #D2AC3820, transparent)' }} />
        <div className="p-4 relative flex flex-col h-full z-10">
          <h3 className="text-gray-200 font-normal tracking-wider mb-4 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
            NETWORK MAP
          </h3>
          {/* Internal Container */}
          <div className="flex-1 border border-gray-700 rounded-xl backdrop-blur-sm p-4 flex flex-col" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                Network Locations
              </h4>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                  TRACKING
                </span>
              </div>
            </div>
            <div className="flex-1 relative rounded-lg overflow-hidden min-h-[316px]">
              {/* USA Map visualization */}
              <div className="relative w-full h-full">
                <USAMap
                  width="100%"
                  height="100%"
                  defaultFill={CONTRACTOR_DETAIL_COLORS.backgroundColor}
                  customize={{}}
                  className="transition-all duration-300"
                />

                {/* Overlay dots for network relationships */}
                <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                  {/* Network relationship dots with geo projection */}
                  {[
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
                    ...(networkData.relationships?.asSubcontractor?.partners?.slice(0, 2).map((partner: any, index: number) => ({
                      zip: index === 0 ? '10001' : '90210',
                      coords: index === 0 ? [-73.9967, 40.7484] : [-118.4065, 34.0901],
                      type: 'prime',
                      color: '#5BC0EB',
                      name: partner.primeName || (index === 0 ? 'MegaCorp Industries' : 'Global Defense Systems'),
                      location: index === 0 ? 'New York, NY 10001' : 'Beverly Hills, CA 90210'
                    })) || []),

                    // Sub contractors - from actual network data (asPrime.partners)
                    ...(networkData.relationships?.asPrime?.partners?.slice(0, 3).map((partner: any, index: number) => ({
                      zip: index === 0 ? '75201' : index === 1 ? '73102' : '59601',
                      coords: index === 0 ? [-96.7970, 32.7767] : index === 1 ? [-97.5171, 35.4676] : [-104.0446, 45.6796],
                      type: 'sub',
                      color: '#FF4C4C',
                      name: partner.subName || (index === 0 ? 'Texas Materials Inc' : index === 1 ? 'Oklahoma Precision' : 'Montana Coatings LLC'),
                      location: index === 0 ? 'Dallas, TX 75201' : index === 1 ? 'Oklahoma City, OK 73102' : 'Helena, MT 59601'
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
                  ].map((dot, index) => {
                    // react-usa-map uses viewBox="0 0 959 593"
                    // We need to map our projection to this exact coordinate space
                    const mapWidth = 959;
                    const mapHeight = 593;

                    // Create projection that matches react-usa-map's internal coordinate system
                    // Fine-tuning scale and translate to better match react-usa-map
                    const projection = d3.geoAlbersUsa()
                      .scale(1240)  // Adjusted scale per testing
                      .translate([mapWidth / 2 - 3, mapHeight / 2 - 8]);

                    const projectedCoords = projection(dot.coords);

                    if (!projectedCoords) return null; // Skip if coordinates can't be projected

                    // Convert SVG coordinates to percentage of container
                    const leftPercent = (projectedCoords[0] / mapWidth) * 100;
                    const topPercent = (projectedCoords[1] / mapHeight) * 100;

                    const dotId = `${dot.zip}-${dot.type}`;

                    // Calculate if tooltip should appear above or below based on position
                    const isNearTop = topPercent < 20;

                    // Calculate if tooltip should be adjusted left/right based on position
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
                        <div
                          className="absolute inset-0 w-3 h-3 rounded-full opacity-40 animate-ping"
                          style={{
                            backgroundColor: dot.color,
                            pointerEvents: 'none'
                          }}
                        />
                        <div
                          className="relative w-3 h-3 rounded-full cursor-pointer"
                          style={{
                            backgroundColor: dot.color,
                            boxShadow: `0 0 8px ${dot.color}`
                          }}
                        />

                        {/* Custom Tooltip */}
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
                  })}
                </div>
              </div>
            </div>

            {/* Legend - Outside the inner container */}
            <div className="mt-2">
              <div className="flex justify-center gap-4 font-light" style={{ fontSize: '14px' }}>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#D2AC38]"></div>
                  <span className="text-[#D2AC38]">Contractor HQ</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#5BC0EB]"></div>
                  <span className="text-[#5BC0EB]">Parent HQ</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#FF4C4C]"></div>
                  <span className="text-[#FF4C4C]">Child HQ</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-green-400">Place of Performance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}