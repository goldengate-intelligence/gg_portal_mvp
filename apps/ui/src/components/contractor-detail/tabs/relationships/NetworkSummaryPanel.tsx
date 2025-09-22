import React from 'react';
import { Card } from "../../../ui/card";
import { GoldengateNetworkGraph } from '../../../../lib/charts';
import { CONTRACTOR_DETAIL_COLORS } from '../../../../lib/utils';

interface NetworkSummaryPanelProps {
  contractor: any;
  networkData: any;
}

export function NetworkSummaryPanel({
  contractor,
  networkData
}: NetworkSummaryPanelProps) {

  // Format monetary values - remove .0 from whole numbers
  const formatMoney = (value: number): string => {
    const formatted = value.toFixed(1);
    return formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
  };

  return (
    <div className="w-full">
      <Card className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative border border-[#D2AC38]/50 hover:border-[#D2AC38]/90" style={{ backgroundColor: '#111726' }}>
        <div className="p-4 h-full flex flex-col relative z-10">
          <h3 className="font-bold tracking-wide mb-3 text-gray-200 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
            NETWORK SUMMARY
          </h3>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-4 flex-1 items-stretch">

            {/* Left Column: AI Analysis */}
            <div className="col-span-1">
              <div className="border border-gray-700 rounded-xl backdrop-blur-sm p-4" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                    NETWORK ANALYSIS
                  </h4>
                </div>
                <div>
                  <div className="space-y-3">
                    {/* Supply Chain Intelligence */}
                    <div className="space-y-3">
                      {/* Core Capabilities - Redesigned */}
                      <div className="rounded-lg p-3 border border-[#D2AC38]/20" style={{ backgroundColor: '#03070F' }}>
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
                          <div className="text-[14px] font-bold text-white">
                            SPECIALIZED FABRICATOR
                          </div>
                        </div>

                        {/* Description */}
                        <div className="text-[13px] text-gray-400 leading-relaxed mb-2">
                          Manufacturing armor systems and structural components for defense vehicles.
                          Trusted by <span className="text-[#9B7EBD]">DOD</span> with direct awards,
                          integrated with <span className="text-[#5BC0EB]">major primes</span>,
                          managing <span className="text-[#FF4C4C]">specialized suppliers</span>.
                        </div>

                        {/* Core Capabilities */}
                        <div className="text-[11px] text-gray-400 mb-2">
                          Military vehicle armor • Structural assemblies • Precision hardware
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-700/30">
                          <div className="text-[11px]">
                            <span className="text-[#d2ac38]">PSC:</span> <span className="text-[#d2ac38]">5110, 5340, 9515</span>
                          </div>
                        </div>
                      </div>

                      {/* Network Flow - Larger */}
                      <div className="space-y-3">
                        {/* Agency Direct */}
                        <div className="flex items-start gap-3 rounded-lg p-3 border border-gray-700" style={{ backgroundColor: '#03070F' }}>
                          <div className="mt-0.5">
                            <div className="w-10 h-10 rounded-full bg-[#9B7EBD]/20 border-2 border-[#9B7EBD]/60 flex items-center justify-center">
                              <span className="text-[14px] text-[#9B7EBD] font-bold">A</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[13px] font-semibold text-gray-200">AGENCY CLIENTS</span>
                              <span className="text-[12px] text-[#9B7EBD]">→ DIRECT AWARDS</span>
                            </div>
                            <div className="text-[13px] text-gray-400">
                              DOD contracts for vehicle armor systems, field equipment hardware
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">$50M • 1 Award • Department of Defense</div>
                          </div>
                        </div>

                        {/* Prime Work */}
                        <div className="flex items-start gap-3 rounded-lg p-3 border border-gray-700" style={{ backgroundColor: '#03070F' }}>
                          <div className="mt-0.5">
                            <div className="w-10 h-10 rounded-full bg-[#5BC0EB]/20 border-2 border-[#5BC0EB]/60 flex items-center justify-center">
                              <span className="text-[14px] text-[#5BC0EB] font-bold">P</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[13px] font-semibold text-gray-200">PRIME CLIENTS</span>
                              <span className="text-[12px] text-[#5BC0EB]">→ SUBCONTRACT AWARDS</span>
                            </div>
                            <div className="text-[13px] text-gray-400">
                              Manufacturing support for MegaCorp Industries & Global Defense Systems
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">$380M • 91 Awards • 2 Prime Contractors</div>
                          </div>
                        </div>

                        {/* Sub Work */}
                        <div className="flex items-start gap-3 rounded-lg p-3 border border-gray-700" style={{ backgroundColor: '#03070F' }}>
                          <div className="mt-0.5">
                            <div className="w-10 h-10 rounded-full bg-[#FF4C4C]/20 border-2 border-[#FF4C4C]/60 flex items-center justify-center">
                              <span className="text-[14px] text-[#FF4C4C] font-bold">S</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[13px] font-semibold text-gray-200">SUB VENDORS</span>
                              <span className="text-[12px] text-[#FF4C4C]">→ PROCUREMENT ORDERS</span>
                            </div>
                            <div className="text-[13px] text-gray-400">
                              Raw materials, specialized coatings, precision machining services
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">$29M • 25 Orders • 3 Suppliers</div>
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
                    NETWORK STRUCTURE
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                    <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                      TRACKING
                    </span>
                  </div>
                </div>
                <div className="flex-1 relative overflow-hidden rounded-lg transition-all duration-300 min-h-[400px] border border-[#D2AC38]/30" style={{ background: 'linear-gradient(to bottom, #0C1524, #0C1524)' }}>
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

                  <div className="relative z-10 w-full h-full">
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
                </div>

              </div>
            </div>

          </div>

        </div>
      </Card>
    </div>
  );
}