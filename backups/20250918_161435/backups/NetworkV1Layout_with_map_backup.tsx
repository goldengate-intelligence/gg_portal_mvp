import React from 'react';
import { HudCard } from './ui/hud-card';
import { GoldengateNetworkGraph } from '../lib/charts';
import USAMap from 'react-usa-map';
import { CONTRACTOR_DETAIL_COLORS } from '../lib/utils';
import { USA_STATE_COORDINATES_PRECISE } from '../lib/map-coordinates.js';

interface NetworkV1LayoutProps {
  contractor: any;
  networkData: any;
  getMapPosition: (zipCode?: string, city?: string, state?: string) => { left: string; top: string };
  parsePlaceOfPerformance: (location: string) => { city: string; state: string };
}

// Convert normalized coordinates to actual pixel positions using precise SVG-based data
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
                <div className="border border-gray-600/20 rounded-xl backdrop-blur-sm p-4 h-full" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                      AI ANALYSIS
                    </h4>
                  </div>
                <div>
                <div className="space-y-3">
                  {/* Supply Chain Intelligence */}
                  <div className="space-y-3">
                    {/* Core Capabilities - Redesigned */}
                    <div className="bg-gradient-to-br from-[#D2AC38]/5 to-black/30 rounded-lg p-3 border border-[#D2AC38]/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-[12px] uppercase tracking-wider text-[#D2AC38] font-semibold" style={{ fontFamily: 'Genos, sans-serif' }}>
                          CONTRACTOR PROFILE
                        </div>
                        <div className="flex gap-2">
                          <div className="px-2 py-0.5 bg-[#D2AC38]/10 rounded text-[9px] text-[#D2AC38]">NAICS 541511</div>
                        </div>
                      </div>

                      {/* Position Title */}
                      <div className="mb-2">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">SUPPLY CHAIN ROLE</div>
                        <div className="text-[14px] font-medium text-white">
                          SPECIALIZED FABRICATOR
                        </div>
                      </div>

                      {/* Description */}
                      <div className="text-[11px] text-gray-400 leading-relaxed mb-2">
                        Manufacturing armor systems and structural components for defense vehicles.
                        Trusted by <span className="text-[#7B61FF]">DOD</span> with direct awards,
                        integrated with <span className="text-[#5BC0EB]">major primes</span>,
                        managing <span className="text-[#FF4C4C]">specialized suppliers</span>.
                      </div>

                      {/* Core Capabilities */}
                      <div className="text-[10px] text-gray-300 mb-2">
                        Military vehicle armor • Structural assemblies • Precision hardware
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-700/30">
                        <div className="text-[10px]">
                          <span className="text-gray-500">PSC:</span> <span className="text-gray-300">R425</span>
                        </div>
                      </div>
                    </div>

                    {/* Relationship Flow - Larger */}
                    <div className="space-y-3">
                      {/* Agency Direct */}
                      <div className="flex items-start gap-3 bg-black/20 rounded-lg p-3 border border-gray-700/20">
                        <div className="mt-0.5">
                          <div className="w-10 h-10 rounded-full bg-[#7B61FF]/20 border-2 border-[#7B61FF]/60 flex items-center justify-center">
                            <span className="text-[14px] text-[#7B61FF] font-bold">A</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-semibold text-gray-200">AGENCY CLIENTS</span>
                            <span className="text-[11px] text-[#7B61FF]">→ DIRECT AWARDS</span>
                          </div>
                          <div className="text-[11px] text-gray-400">
                            DOD contracts for vehicle armor systems, field equipment hardware
                          </div>
                          <div className="text-[10px] text-gray-500 mt-1">$50M • 1 Award • Department of Defense</div>
                        </div>
                      </div>

                      {/* Prime Work */}
                      <div className="flex items-start gap-3 bg-black/20 rounded-lg p-3 border border-gray-700/20">
                        <div className="mt-0.5">
                          <div className="w-10 h-10 rounded-full bg-[#5BC0EB]/20 border-2 border-[#5BC0EB]/60 flex items-center justify-center">
                            <span className="text-[14px] text-[#5BC0EB] font-bold">P</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-semibold text-gray-200">PRIME PARTNERS</span>
                            <span className="text-[11px] text-[#5BC0EB]">→ SUBCONTRACT AWARDS</span>
                          </div>
                          <div className="text-[11px] text-gray-400">
                            Manufacturing support for MegaCorp Industries & Global Defense Systems
                          </div>
                          <div className="text-[10px] text-gray-500 mt-1">$380M • 91 Awards • 2 Prime Contractors</div>
                        </div>
                      </div>

                      {/* Sub Work */}
                      <div className="flex items-start gap-3 bg-black/20 rounded-lg p-3 border border-gray-700/20">
                        <div className="mt-0.5">
                          <div className="w-10 h-10 rounded-full bg-[#FF4C4C]/20 border-2 border-[#FF4C4C]/60 flex items-center justify-center">
                            <span className="text-[14px] text-[#FF4C4C] font-bold">S</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-semibold text-gray-200">SUPPLY BASE</span>
                            <span className="text-[11px] text-[#FF4C4C]">→ PROCUREMENT ORDERS</span>
                          </div>
                          <div className="text-[11px] text-gray-400">
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
                <div className="border border-gray-600/20 rounded-xl backdrop-blur-sm p-4 flex flex-col h-full" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
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
              <div className="bg-black/40 border border-gray-700/50 rounded-lg p-3 mt-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1" style={{ fontFamily: 'Genos, sans-serif' }}>INFLOWS</div>
                    <div className="text-green-400 font-medium text-lg">+${formatMoney(50 + (networkData.relationships?.asSubcontractor?.totalValue || 0) / 1000000)}M</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1" style={{ fontFamily: 'Genos, sans-serif' }}>OUTFLOWS</div>
                    <div className="text-red-400 font-medium text-lg">-${formatMoney((networkData.relationships?.asPrime?.totalValue || 0) / 1000000)}M</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1" style={{ fontFamily: 'Genos, sans-serif' }}>NET FLOW</div>
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
            <div className="flex-1 border border-gray-600/20 rounded-xl backdrop-blur-sm p-4 flex flex-col" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
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
            <div className="flex-1 relative rounded-lg overflow-hidden min-h-[300px]">
            {/* Three Column Container Layout */}
            <div className="grid grid-cols-3 gap-0 h-full">

              {/* Left: Direct Awards */}
              <div className="col-span-1 h-full">
                <div className="bg-gradient-to-br from-[#7B61FF]/10 to-[#7B61FF]/5 border border-[#7B61FF]/20 rounded-l-lg p-4 h-full flex flex-col">
                  customize={{
                    "AL": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "AK": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "AZ": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "AR": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "CA": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                    "CO": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "CT": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "DE": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "FL": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "GA": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                    "HI": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "ID": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "IL": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "IN": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "IA": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                    "KS": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "KY": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "LA": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "ME": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "MD": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                    "MA": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "MI": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "MN": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "MS": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "MO": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                    "MT": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "NE": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "NV": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "NH": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "NJ": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                    "NM": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "NY": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "NC": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "ND": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "OH": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                    "OK": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "OR": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "PA": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "RI": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "SC": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                    "SD": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "TN": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "TX": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "UT": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "VT": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2},
                    "VA": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "WA": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "WV": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "WI": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "WY": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}, "DC": {fill: "#04070a", stroke: "rgba(255, 255, 255, 1)", strokeWidth: 2}
                  }}
                  onClick={(event) => console.log('State clicked:', event.target.dataset.name)}
                />
              </div>
              
              {/* Overlay dots for network relationships */}
              <div className="absolute inset-0 pointer-events-none" style={{ transform: 'scale(0.45)', transformOrigin: 'left top', left: '12%', top: '2%' }}>
                {/* Network dots using reference grid system */}
                {[
                  { state: 'FL', type: 'contractor', color: '#D2AC38', title: 'Contractor - Florida' },
                  { state: 'CA', type: 'parent', color: '#5BC0EB', title: 'Parent Company - California' },
                  { state: 'TX', type: 'child', color: '#FF4C4C', title: 'Child Contractor - Texas' },
                  { state: 'WA', type: 'parent', color: '#5BC0EB', title: 'Parent Company - Washington' },
                  { state: 'KS', type: 'performance', color: '#4ade80', title: 'Performance Location - Kansas' },
                  { state: 'NY', type: 'child', color: '#FF4C4C', title: 'Child Contractor - New York' },
                  { state: 'IL', type: 'performance', color: '#4ade80', title: 'Performance Location - Illinois' },
                  { state: 'CO', type: 'child', color: '#FF4C4C', title: 'Child Contractor - Colorado' },
                ].map((dot, index) => {
                  const position = getStatePosition(dot.state);
                  const isContractor = dot.type === 'contractor';
                  const animationDelay = dot.type === 'parent' ? '0.3s' : dot.type === 'child' ? '0.7s' : `${0.2 + (index % 3) * 0.2}s`;
                  
                  return (
                    <div 
                      key={`${dot.state}-${dot.type}`}
                      className="relative"
                      style={{ 
                        position: 'absolute',
                        left: position.left,
                        top: position.top,
                        transform: 'translate(-50%, -50%)'
                      }}
                      title={dot.title}
                    >
                      <div 
                        className="absolute inset-0 w-8 h-8 rounded-full opacity-30 animate-ping" 
                        style={{
                          backgroundColor: dot.color,
                          animationDuration: isContractor ? '3s' : undefined
                        }}
                      ></div>
                      {!isContractor && (
                        <div 
                          className="absolute inset-0 w-8 h-8 rounded-full opacity-20 animate-ping" 
                          style={{
                            backgroundColor: dot.color,
                            animationDelay: animationDelay
                          }}
                        ></div>
                      )}
                      <div 
                        className={`w-8 h-8 rounded-full relative z-10 ${isContractor ? 'border-2 border-black' : dot.type === 'parent' ? 'border border-cyan-200' : dot.type === 'child' ? 'border border-pink-200' : 'border border-green-200'}`}
                        style={{
                          backgroundColor: dot.color,
                          boxShadow: `0 0 ${isContractor ? '8px' : dot.type === 'performance' ? '4px' : '6px'} ${dot.color}80`
                        }}
                      ></div>
                    </div>
                  );
                })}
              </div>
              
            </div>
            {/* Legend - Moved outside the inner container */}
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

      {/* Right: Network Map */}
      <div className="col-span-1">
        <HudCard variant="default" priority="medium" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
          <div className="p-4 relative flex flex-col h-full">
            <h3 className="text-gray-200 font-normal tracking-wider mb-4 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
              NETWORK MAP
            </h3>
            {/* Internal Container */}
            <div className="flex-1 border border-gray-600/20 rounded-xl backdrop-blur-sm p-4 flex flex-col" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
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
            <div className="flex-1 relative rounded-lg overflow-hidden min-h-[300px]">
            {/* Three Column Container Layout */}
            <div className="grid grid-cols-3 gap-0 h-full">

              {/* Left: Direct Awards */}
              <div className="col-span-1 h-full">
                <div className="bg-gradient-to-br from-[#7B61FF]/10 to-[#7B61FF]/5 border border-[#7B61FF]/20 rounded-l-lg p-4 h-full flex flex-col">
                  <div className="text-sm font-normal text-[#7B61FF] uppercase tracking-wider mb-3" style={{ fontFamily: 'Genos, sans-serif' }}>
                    Direct Awards
                  </div>
                  <div className="font-medium text-green-400 mb-2">
                    <span style={{ fontSize: '36px' }}>$50M</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-4" style={{ fontFamily: 'Genos, sans-serif' }}>
                    1 Agency • 1 Award
                  </div>

                  {/* Direct Awards List */}
                  <div className="space-y-2 overflow-y-auto flex-1">
                    <div className="border-l-2 border-[#7B61FF] pl-2">
                      <div className="text-xs text-gray-300">Department of Defense</div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-green-400">$50M</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>• 1 ACTIVE</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle: Prime Awards (formerly Award Inflows) */}
              <div className="col-span-1 h-full">
                <div className="bg-gradient-to-br from-[#5BC0EB]/10 to-[#5BC0EB]/5 border-y border-[#5BC0EB]/20 p-4 h-full flex flex-col">
                  <div className="text-sm font-normal text-[#5BC0EB] uppercase tracking-wider mb-3" style={{ fontFamily: 'Genos, sans-serif' }}>
                    Prime Awards
                  </div>
                  <div className="font-medium text-green-400 mb-2">
                    <span style={{ fontSize: '36px' }}>
                      ${formatMoney((networkData.relationships?.asSubcontractor?.totalValue || 0) / 1000000)}M
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mb-4" style={{ fontFamily: 'Genos, sans-serif' }}>
                    2 Primes • {(networkData.relationships?.asSubcontractor?.partners?.reduce((sum: number, p: any) => sum + (p.sharedContracts || 0), 0) || 0)} Awards
                  </div>

                  {/* Prime Partners List */}
                  <div className="space-y-2 overflow-y-auto flex-1">
                    {networkData.relationships?.asSubcontractor?.partners?.slice(0, 3).map((partner: any, index: number) => (
                      <div key={`prime-${index}`} className="border-l-2 border-[#5BC0EB] pl-2">
                        <div className="text-xs text-gray-300">{partner.primeName}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-green-400">
                            ${formatMoney(partner.sharedRevenue / 1000000)}M
                          </div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>• {partner.sharedContracts || 1} ACTIVE</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Subcontracting (formerly Award Outflows) */}
              <div className="col-span-1 h-full">
                <div className="bg-gradient-to-br from-[#FF4C4C]/10 to-[#FF4C4C]/5 border border-[#FF4C4C]/20 rounded-r-lg p-4 h-full flex flex-col">
                  <div className="text-sm font-normal text-[#FF4C4C] uppercase tracking-wider mb-3" style={{ fontFamily: 'Genos, sans-serif' }}>
                    Sub Orders
                  </div>
                  <div className="font-medium text-red-400 mb-2">
                    <span style={{ fontSize: '36px' }}>
                      ${formatMoney((networkData.relationships?.asPrime?.totalValue || 0) / 1000000)}M
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mb-4" style={{ fontFamily: 'Genos, sans-serif' }}>
                    3 Subs • {(networkData.relationships?.asPrime?.partners?.reduce((sum: number, p: any) => sum + (p.sharedContracts || 0), 0) || 0)} Awards
                  </div>

                  {/* Sub Partners List */}
                  <div className="space-y-2 overflow-y-auto flex-1">
                    {networkData.relationships?.asPrime?.partners?.slice(0, 3).map((partner: any, index: number) => (
                      <div key={`sub-${index}`} className="border-l-2 border-[#FF4C4C] pl-2">
                        <div className="text-xs text-gray-300">{partner.subName}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-red-400">
                            ${formatMoney(partner.sharedRevenue / 1000000)}M
                          </div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif' }}>• {partner.sharedContracts || 1} ACTIVE</div>
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
        </HudCard>
      </div>

    </div>

  </div>
  );
};