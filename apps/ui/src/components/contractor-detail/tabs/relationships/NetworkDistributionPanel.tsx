import React from 'react';
import { Card } from "../../../ui/card";
import { CONTRACTOR_DETAIL_COLORS } from '../../../../logic/utils';
import USAMap from 'react-usa-map';
import * as d3 from 'd3-geo';

interface NetworkDistributionPanelProps {
  contractor: any;
  networkData: any;
}

export function NetworkDistributionPanel({
  contractor,
  networkData
}: NetworkDistributionPanelProps) {

  // State to track which dot is being hovered
  const [hoveredDot, setHoveredDot] = React.useState<string | null>(null);

  // Format monetary values - remove .0 from whole numbers
  const formatMoney = (value: number): string => {
    const formatted = value.toFixed(1);
    return formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
  };

  return (
    <div className="col-span-2">
      <Card className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative border border-[#D2AC38]/50 hover:border-[#D2AC38]/90" style={{ backgroundColor: '#111726' }}>
        <div className="p-4 relative flex flex-col h-full">
          <h3 className="font-bold tracking-wide mb-3 text-gray-200 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
            NETWORK DISTRIBUTION
          </h3>
          <div className="flex-1 grid grid-cols-2 gap-4">
            {/* Left side: Network Contracting */}
            <div className="border border-gray-700 rounded-xl backdrop-blur-sm p-4 flex flex-col" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                  Network Contracting
                </h4>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  <span className="text-[10px] text-[#22c55e] font-light" style={{ fontFamily: 'Genos, sans-serif', letterSpacing: '0.0125em' }}>
                    TRACKING
                  </span>
                </div>
              </div>
              <div className="flex-1 relative rounded-lg overflow-hidden min-h-[316px]">
              {/* Three Column Container Layout - V3 Remix with unified flow design */}
              <div className="h-full border border-gray-700 backdrop-blur-sm rounded-lg p-3 flex flex-col" style={{ backgroundColor: '#03070F' }}>

                {/* Top Stats Bar - Compact */}
                <div className="grid grid-cols-3 gap-3 mb-2">
                  <div className="text-center">
                    <div className="text-[12px] uppercase tracking-wider text-[#9B7EBD]" style={{ fontFamily: 'Genos, sans-serif' }}>Agency Direct Awards</div>
                    <div className="py-0.5">
                      <div className="font-bold text-[#22c55e] leading-tight" style={{ fontSize: '38px' }}>$50M</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[12px] uppercase tracking-wider text-[#5BC0EB]" style={{ fontFamily: 'Genos, sans-serif' }}>Prime Sub Awards</div>
                    <div className="py-0.5">
                      <div className="font-bold text-[#22c55e] leading-tight" style={{ fontSize: '38px' }}>
                        ${formatMoney((networkData.relationships?.asSubcontractor?.totalValue || 0) / 1000000)}M
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[12px] uppercase tracking-wider text-[#FF4C4C]" style={{ fontFamily: 'Genos, sans-serif' }}>Vendor Procurement</div>
                    <div className="py-0.5">
                      <div className="font-bold text-red-400 leading-tight" style={{ fontSize: '38px' }}>
                        ${formatMoney((networkData.relationships?.asPrime?.totalValue || 0) / 1000000)}M
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flow Indicator */}
                <div className="relative mb-2">
                  <div className="h-[2px] bg-gradient-to-r from-[#9B7EBD] via-[#5BC0EB] to-[#FF4C4C] rounded-full opacity-60" />
                </div>

                {/* Three Column Content */}
                <div className="grid grid-cols-3 gap-4 flex-1">

                  {/* Left: Direct Awards */}
                  <div className="col-span-1">
                    <div className="h-full">

                      {/* Direct Awards List */}
                      <div className="space-y-2 overflow-y-auto max-h-[220px]">
                        <div className="bg-black/40 rounded-lg p-2 border border-[#9B7EBD]/20 hover:border-[#9B7EBD]/40 transition-colors">
                          <div className="text-xs text-gray-300 font-medium">Department of Defense</div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-base text-[#22c55e] font-semibold">$50M</div>
                            <div className="text-[10px] text-[#9B7EBD]">100%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Prime Awards */}
                  <div className="col-span-1">
                    <div className="h-full">

                      {/* Prime Partners List */}
                      <div className="space-y-2 overflow-y-auto max-h-[220px]">
                        {networkData.relationships?.asSubcontractor?.partners?.slice(0, 5).map((partner: any, index: number) => (
                          <div key={`prime-${index}`} className="bg-black/40 rounded-lg p-2 border border-[#5BC0EB]/20 hover:border-[#5BC0EB]/40 transition-colors">
                            <div className="text-xs text-gray-300 font-medium">{partner.primeName}</div>
                            <div className="flex items-center justify-between mt-1">
                              <div className="text-base text-[#22c55e] font-semibold">
                                ${formatMoney(partner.sharedRevenue / 1000000)}M
                              </div>
                              <div className="text-[10px] text-[#5BC0EB]">
                                {((partner.sharedRevenue / ((networkData.relationships?.asSubcontractor?.totalValue || 0) + (networkData.relationships?.asPrime?.totalValue || 0))) * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Sub Orders */}
                  <div className="col-span-1">
                    <div className="h-full">

                      {/* Sub Partners List */}
                      <div className="space-y-2 overflow-y-auto max-h-[220px]">
                        {networkData.relationships?.asPrime?.partners?.slice(0, 5).map((partner: any, index: number) => (
                          <div key={`sub-${index}`} className="bg-black/40 rounded-lg p-2 border border-[#FF4C4C]/20 hover:border-[#FF4C4C]/40 transition-colors">
                            <div className="text-xs text-gray-300 font-medium">{partner.subName}</div>
                            <div className="flex items-center justify-between mt-1">
                              <div className="text-base text-red-400 font-semibold">
                                ${formatMoney(partner.sharedRevenue / 1000000)}M
                              </div>
                              <div className="text-[10px] text-[#FF4C4C]">
                                {((partner.sharedRevenue / ((networkData.relationships?.asSubcontractor?.totalValue || 0) + (networkData.relationships?.asPrime?.totalValue || 0))) * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              </div>
            </div>

            {/* Right side: Network Locations */}
            <div className="border border-gray-700 rounded-xl backdrop-blur-sm p-4 flex flex-col" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
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
                        color: '#22c55e',
                        name: 'Department of Defense',
                        location: 'Denver, CO 80202'
                      },
                      {
                        zip: '80521',
                        coords: [-105.0875, 40.5853],
                        type: 'performance',
                        color: '#22c55e',
                        name: 'Department of Defense',
                        location: 'Fort Collins, CO 80521'
                      },
                      {
                        zip: '66502',
                        coords: [-96.5560, 39.0119],
                        type: 'performance',
                        color: '#22c55e',
                        name: 'Department of Defense',
                        location: 'Manhattan, KS 66502'
                      },

                      // Additional Places of Performance - Prime Partner projects
                      {
                        zip: '23185',
                        coords: [-76.4935, 37.2707],
                        type: 'performance',
                        color: '#22c55e',
                        name: networkData.relationships?.asSubcontractor?.partners?.[0]?.primeName || 'MegaCorp Industries',
                        location: 'Williamsburg, VA 23185'
                      },
                      {
                        zip: '31905',
                        coords: [-84.9771, 32.3809],
                        type: 'performance',
                        color: '#22c55e',
                        name: networkData.relationships?.asSubcontractor?.partners?.[0]?.primeName || 'MegaCorp Industries',
                        location: 'Columbus, GA 31905'
                      },
                      {
                        zip: '92134',
                        coords: [-117.1434, 32.7157],
                        type: 'performance',
                        color: '#22c55e',
                        name: networkData.relationships?.asSubcontractor?.partners?.[1]?.primeName || 'Global Defense Systems',
                        location: 'San Diego, CA 92134'
                      },
                      {
                        zip: '85365',
                        coords: [-114.3935, 33.5778],
                        type: 'performance',
                        color: '#22c55e',
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

              {/* Legend */}
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
                    <div className="w-2 h-2 rounded-full bg-[#22c55e]"></div>
                    <span className="text-[#22c55e]">Place of Performance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}