import React from 'react';
import { HudCard } from './ui/hud-card';
import { GoldengateNetworkGraph } from '../lib/charts';
import USAMap from 'react-usa-map';
import { CONTRACTOR_DETAIL_COLORS } from '../lib/utils';
import { USA_STATE_COORDINATES_PRECISE } from '../lib/map-coordinates.js';
import * as d3 from 'd3-geo';

interface NetworkV1LayoutProps {
  contractor: any;
  networkData: any;
  getMapPosition: (zipCode?: string, city?: string, state?: string) => { left: string; top: string };
  parsePlaceOfPerformance: (location: string) => { city: string; state: string };
}

// Create Albers USA projection for accurate geographic positioning
// Adjusted to match react-usa-map's SVG viewBox proportions
const createProjection = (width: number = 959, height: number = 593) => {
  return d3.geoAlbersUsa()
    .scale(1280)
    .translate([width / 2, height / 2]);
};

// Get position using longitude/latitude coordinates
const getGeoPosition = (longitude: number, latitude: number, containerWidth: number = 959, containerHeight: number = 593) => {
  const projection = createProjection(containerWidth, containerHeight);
  const coords = projection([longitude, latitude]);

  if (!coords) return { left: '50%', top: '50%' }; // fallback for coordinates outside USA

  // Scale coordinates to match the container's transform
  return {
    left: `${coords[0]}px`,
    top: `${coords[1]}px`
  };
};

// Convert state code to position (for backward compatibility)
const getStatePosition = (stateCode: string, containerWidth: number = 800, containerHeight: number = 500) => {
  const coords = USA_STATE_COORDINATES_PRECISE[stateCode];
  if (!coords) return { left: '50%', top: '50%' }; // fallback to center

  return {
    left: `${coords.x * containerWidth}px`,
    top: `${coords.y * containerHeight}px`
  };
};

export const NetworkV1Layout: React.FC<NetworkV1LayoutProps> = ({
  contractor,
  networkData,
  getMapPosition,
  parsePlaceOfPerformance
}) => {
  // State to track which dot is being hovered
  const [hoveredDot, setHoveredDot] = React.useState<string | null>(null);

  // Format monetary values - remove .0 from whole numbers
  const formatMoney = (value: number): string => {
    const formatted = value.toFixed(1);
    return formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
  };
  return (
    <div className="space-y-6 min-h-[70vh]">
      
      {/* First Row - Combined Network Overview Panel */}
      <div className="w-full">
        <HudCard variant="default" priority="high" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
          <div className="p-4 h-full flex flex-col">
            <h3 className="text-gray-200 font-normal tracking-wider mb-4 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
              NETWORK SUMMARY
            </h3>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-6 flex-1">

              {/* Left Column: AI Analysis */}
              <div className="col-span-1">
                <div className="border border-gray-700 rounded-xl backdrop-blur-sm p-4 h-full" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                      SUPPLY CHAIN ANALYSIS
                    </h4>
                  </div>
                <div>
                <div className="space-y-3">
                  {/* Supply Chain Intelligence */}
                  <div className="space-y-3">
                    {/* Core Capabilities - Redesigned */}
                    <div className="bg-black/40 rounded-lg p-3 border border-[#D2AC38]/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-[12px] uppercase tracking-wider text-[#D2AC38] font-semibold" style={{ fontFamily: 'Genos, sans-serif' }}>
                          CONTRACTOR PROFILE
                        </div>
                        <div className="flex gap-2">
                          <div className="px-2 py-0.5 bg-[#D2AC38]/10 rounded text-[12px] text-[#D2AC38]">NAICS 332312</div>
                        </div>
                      </div>

                      {/* Position Title */}
                      <div className="mb-2">
                        <div className="text-[10px] text-[#d2ac38] uppercase tracking-wider mb-1">SUPPLY CHAIN ROLE</div>
                        <div className="text-[14px] font-bold text-white">
                          SPECIALIZED FABRICATOR
                        </div>
                      </div>

                      {/* Description */}
                      <div className="text-[12px] text-gray-400 leading-relaxed mb-2">
                        Manufacturing armor systems and structural components for defense vehicles.
                        Trusted by <span className="text-[#7B61FF]">DOD</span> with direct awards,
                        integrated with <span className="text-[#5BC0EB]">major primes</span>,
                        managing <span className="text-[#FF4C4C]">specialized suppliers</span>.
                      </div>

                      {/* Core Capabilities */}
                      <div className="text-[10px] text-[#d2ac38] mb-2">
                        Military vehicle armor • Structural assemblies • Precision hardware
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-700/30">
                        <div className="text-[10px]">
                          <span className="text-[#d2ac38]">PSC:</span> <span className="text-[#d2ac38]">5110, 5340, 9515</span>
                        </div>
                      </div>
                    </div>

                    {/* Relationship Flow - Larger */}
                    <div className="space-y-3">
                      {/* Agency Direct */}
                      <div className="flex items-start gap-3 bg-black/40 rounded-lg p-3 border border-gray-700">
                        <div className="mt-0.5">
                          <div className="w-10 h-10 rounded-full bg-[#7B61FF]/20 border-2 border-[#7B61FF]/60 flex items-center justify-center">
                            <span className="text-[14px] text-[#7B61FF] font-bold">A</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-semibold text-gray-200">AGENCY CLIENTS</span>
                            <span className="text-[12px] text-[#7B61FF]">→ DIRECT AWARDS</span>
                          </div>
                          <div className="text-[12px] text-gray-400">
                            DOD contracts for vehicle armor systems, field equipment hardware
                          </div>
                          <div className="text-[10px] text-gray-500 mt-1">$50M • 1 Award • Department of Defense</div>
                        </div>
                      </div>

                      {/* Prime Work */}
                      <div className="flex items-start gap-3 bg-black/40 rounded-lg p-3 border border-gray-700">
                        <div className="mt-0.5">
                          <div className="w-10 h-10 rounded-full bg-[#5BC0EB]/20 border-2 border-[#5BC0EB]/60 flex items-center justify-center">
                            <span className="text-[14px] text-[#5BC0EB] font-bold">P</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-semibold text-gray-200">PRIME PARTNERS</span>
                            <span className="text-[12px] text-[#5BC0EB]">→ SUBCONTRACT AWARDS</span>
                          </div>
                          <div className="text-[12px] text-gray-400">
                            Manufacturing support for MegaCorp Industries & Global Defense Systems
                          </div>
                          <div className="text-[10px] text-gray-500 mt-1">$380M • 91 Awards • 2 Prime Contractors</div>
                        </div>
                      </div>

                      {/* Sub Work */}
                      <div className="flex items-start gap-3 bg-black/40 rounded-lg p-3 border border-gray-700">
                        <div className="mt-0.5">
                          <div className="w-10 h-10 rounded-full bg-[#FF4C4C]/20 border-2 border-[#FF4C4C]/60 flex items-center justify-center">
                            <span className="text-[14px] text-[#FF4C4C] font-bold">S</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-semibold text-gray-200">SUPPLY BASE</span>
                            <span className="text-[12px] text-[#FF4C4C]">→ PROCUREMENT ORDERS</span>
                          </div>
                          <div className="text-[12px] text-gray-400">
                            Raw materials, specialized coatings, precision machining services
                          </div>
                          <div className="text-[10px] text-gray-500 mt-1">$29M • 25 Orders • 3 Suppliers</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>

              {/* Right Column: Network Graph */}
              <div className="col-span-1">
                <div className="border border-gray-700 rounded-xl backdrop-blur-sm p-4 flex flex-col h-full" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                    OPERATIONAL STRUCTURE
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                    <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                      TRACKING
                    </span>
                  </div>
                </div>
              <div className="flex-1 relative overflow-hidden rounded-lg transition-all duration-300 min-h-[300px]">
                
                <GoldengateNetworkGraph
                  title="Contractor Network"
                  height="100%"
                  liveIndicator={false}
                  liveText="TRACKING"
                  className="w-full h-full"
                  nodes={[
                    {
                      id: contractor.uei,
                      label: contractor.name === 'Loading...' ? 'Trio' : contractor.name.split(' ')[0],
                      type: 'hybrid' as const,
                      value: contractor.totalContractValue || 0
                    },
                    // DOD direct award node
                    {
                      id: 'DOD-DIRECT',
                      label: 'DOD',
                      type: 'agency' as const,
                      value: 50000000
                    },
                    ...(networkData.relationships?.asSubcontractor?.partners?.slice(0, 8).map((p: any) => ({
                      id: p.primeUei,
                      label: p.primeName.split(' ')[0],
                      type: 'prime' as const,
                      value: p.sharedRevenue || 0
                    })) || []),
                    ...(networkData.relationships?.asPrime?.partners?.slice(0, 8).map((p: any) => ({
                      id: p.subUei,
                      label: p.subName.split(' ')[0],
                      type: 'sub' as const,
                      value: p.sharedRevenue || 0
                    })) || [])
                  ]}
                  edges={[
                    // DOD direct award edge
                    {
                      source: 'DOD-DIRECT',
                      target: contractor.uei,
                      weight: 100,
                      revenue: 50000000,
                      contracts: 1
                    },
                    ...(networkData.relationships?.asSubcontractor?.partners?.slice(0, 8).map((p: any) => ({
                      source: p.primeUei,
                      target: contractor.uei,
                      weight: p.strengthScore || 50,
                      revenue: p.sharedRevenue || 0,
                      contracts: p.sharedContracts || 0
                    })) || []),
                    ...(networkData.relationships?.asPrime?.partners?.slice(0, 8).map((p: any) => ({
                      source: contractor.uei,
                      target: p.subUei,
                      weight: p.strengthScore || 50,
                      revenue: p.sharedRevenue || 0,
                      contracts: p.sharedContracts || 0
                    })) || [])
                  ]}
                />
              </div>

              {/* Financial Overview Panel */}
              <div className="bg-black/40 border border-gray-700 rounded-lg p-3 mt-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[12px] uppercase tracking-wider text-gray-500 mb-1" style={{ fontFamily: 'Genos, sans-serif' }}>INFLOWS</div>
                    <div className="text-green-400 font-medium text-lg">+${formatMoney(50 + (networkData.relationships?.asSubcontractor?.totalValue || 0) / 1000000)}M</div>
                  </div>
                  <div>
                    <div className="text-[12px] uppercase tracking-wider text-gray-500 mb-1" style={{ fontFamily: 'Genos, sans-serif' }}>OUTFLOWS</div>
                    <div className="text-red-400 font-medium text-lg">-${formatMoney((networkData.relationships?.asPrime?.totalValue || 0) / 1000000)}M</div>
                  </div>
                  <div>
                    <div className="text-[12px] uppercase tracking-wider text-gray-500 mb-1" style={{ fontFamily: 'Genos, sans-serif' }}>NET FLOW</div>
                    <div className="text-green-400 font-medium text-lg">+${formatMoney(50 + (networkData.relationships?.asSubcontractor?.totalValue || 0) / 1000000 - (networkData.relationships?.asPrime?.totalValue || 0) / 1000000)}M</div>
                  </div>
                </div>
              </div>
              </div>
            </div>

            </div>


          </div>
        </HudCard>
      </div>
      
      {/* Second Row - Network Distribution and Network Map */}
      <div className="grid grid-cols-2 gap-6 items-stretch">

        {/* Left: Network Distribution */}
        <div className="col-span-1">
          <HudCard variant="default" priority="high" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
            <div className="p-4 relative flex flex-col h-full">
            <h3 className="text-gray-200 font-normal tracking-wider mb-4 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
              NETWORK DISTRIBUTION
            </h3>
            <div className="flex-1 border border-gray-700 rounded-xl backdrop-blur-sm p-4 flex flex-col" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                  CONTRACTING ACTIVITY
                </h4>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                  <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                    TRACKING
                  </span>
                </div>
              </div>
            <div className="flex-1 relative rounded-lg overflow-hidden min-h-[316px]">
            {/* Three Column Container Layout - V3 Remix with unified flow design */}
            <div className="h-full bg-black/40 border border-gray-700 backdrop-blur-sm rounded-lg p-3 flex flex-col">

              {/* Top Stats Bar - Compact */}
              <div className="grid grid-cols-3 gap-3 mb-2">
                <div className="text-center">
                  <div className="text-[12px] uppercase tracking-wider text-[#7B61FF]" style={{ fontFamily: 'Genos, sans-serif' }}>DIRECT</div>
                  <div className="py-0.5">
                    <div className="font-bold text-green-400 leading-tight" style={{ fontSize: '38px' }}>$50M</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[12px] uppercase tracking-wider text-[#5BC0EB]" style={{ fontFamily: 'Genos, sans-serif' }}>PRIME</div>
                  <div className="py-0.5">
                    <div className="font-bold text-green-400 leading-tight" style={{ fontSize: '38px' }}>
                      ${formatMoney((networkData.relationships?.asSubcontractor?.totalValue || 0) / 1000000)}M
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[12px] uppercase tracking-wider text-[#FF4C4C]" style={{ fontFamily: 'Genos, sans-serif' }}>SUB</div>
                  <div className="py-0.5">
                    <div className="font-bold text-red-400 leading-tight" style={{ fontSize: '38px' }}>
                      ${formatMoney((networkData.relationships?.asPrime?.totalValue || 0) / 1000000)}M
                    </div>
                  </div>
                </div>
              </div>

              {/* Flow Indicator */}
              <div className="relative mb-2">
                <div className="h-px bg-gray-800/50 rounded-full overflow-hidden">
                  <div className="h-full bg-black/40" />
                </div>
              </div>

              {/* Three Column Content */}
              <div className="grid grid-cols-3 gap-4 flex-1">

              {/* Left: Direct Awards */}
              <div className="col-span-1">
                <div className="h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#7B61FF] rounded-full" />
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide -mt-[1px]" style={{ fontFamily: 'Genos, sans-serif' }}>
                        DIRECT AWARDS
                      </div>
                    </div>
                    <div className="text-[10px] text-[#7B61FF] mt-[1px]">1 ACTIVE</div>
                  </div>

                  {/* Direct Awards List */}
                  <div className="space-y-2 overflow-y-auto max-h-[220px]">
                    <div className="bg-black/40 rounded-lg p-2 border border-[#7B61FF]/20 hover:border-[#7B61FF]/40 transition-colors">
                      <div className="text-xs text-gray-300 font-medium">Department of Defense</div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-base text-green-400 font-semibold">$50M</div>
                        <div className="text-[10px] text-[#7B61FF]">100%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle: Prime Awards */}
              <div className="col-span-1">
                <div className="h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#5BC0EB] rounded-full" />
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide -mt-[1px]" style={{ fontFamily: 'Genos, sans-serif' }}>
                        PRIME AWARDS
                      </div>
                    </div>
                    <div className="text-[10px] text-[#5BC0EB] mt-[1px]">
                      {(networkData.relationships?.asSubcontractor?.partners?.reduce((sum: number, p: any) => sum + (p.sharedContracts || 0), 0) || 0)} ACTIVE
                    </div>
                  </div>

                  {/* Prime Partners List */}
                  <div className="space-y-2 overflow-y-auto max-h-[220px]">
                    {networkData.relationships?.asSubcontractor?.partners?.slice(0, 5).map((partner: any, index: number) => (
                      <div key={`prime-${index}`} className="bg-black/40 rounded-lg p-2 border border-[#5BC0EB]/20 hover:border-[#5BC0EB]/40 transition-colors">
                        <div className="text-xs text-gray-300 font-medium">{partner.primeName}</div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-base text-green-400 font-semibold">
                            ${formatMoney(partner.sharedRevenue / 1000000)}M
                          </div>
                          <div className="text-[10px] text-[#5BC0EB]">
                            {((partner.sharedRevenue / (networkData.relationships?.asSubcontractor?.totalValue || 1)) * 100).toFixed(0)}%
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
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#FF4C4C] rounded-full" />
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide -mt-[1px]" style={{ fontFamily: 'Genos, sans-serif' }}>
                        SUB ORDERS
                      </div>
                    </div>
                    <div className="text-[10px] text-[#FF4C4C] mt-[1px]">
                      {(networkData.relationships?.asPrime?.partners?.reduce((sum: number, p: any) => sum + (p.sharedContracts || 0), 0) || 0)} ACTIVE
                    </div>
                  </div>

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
                            {((partner.sharedRevenue / (networkData.relationships?.asPrime?.totalValue || 1)) * 100).toFixed(0)}%
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
            </div>
        </HudCard>
      </div>

      {/* Right: Network Map */}
      <div className="col-span-1">
        <HudCard variant="default" priority="medium" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
          <div className="p-4 relative flex flex-col h-full">
            <h3 className="text-gray-200 font-normal tracking-wider mb-4 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
              NETWORK MAP
            </h3>
            {/* Internal Container */}
            <div className="flex-1 border border-gray-700 rounded-xl backdrop-blur-sm p-4 flex flex-col" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                  OPERATIONAL ZONES
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
                          className="relative w-3 h-3 rounded-full border cursor-pointer"
                          style={{
                            backgroundColor: dot.color,
                            borderColor: dot.type === 'contractor' ? '#000000' : '#ffffff',
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
        </HudCard>
      </div>

    </div>

  </div>
  );
};