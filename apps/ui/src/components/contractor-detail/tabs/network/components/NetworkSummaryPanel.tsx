import React from 'react';
import { Card } from "../../../../ui/card";
import { GoldengateNetworkGraph } from '../../../../../ui/charts/components';
import { CONTRACTOR_DETAIL_COLORS } from '../../../../../logic/utils';
import { useNetworkInsights } from '../../../../../services/network-insights/useNetworkInsights';
import { processNetworkDistribution, type NetworkDistributionData } from '../../../../../services/network-insights/networkDistributionService';
import { formatMoney } from '../../../../../shared';
import type { ActivityEvent } from '../types';

interface NetworkSummaryPanelProps {
  contractor: any;
  networkData?: any;
  activityEvents?: ActivityEvent[];
  isLoading?: boolean;
}

export function NetworkSummaryPanel({
  contractor,
  networkData,
  activityEvents,
  isLoading
}: NetworkSummaryPanelProps) {

  // Using shared formatMoney utility

  // Prepare data for network insights
  const networkInsightData = contractor && activityEvents ? {
    uei: contractor.uei || contractor.UEI,
    contractorName: contractor.name || contractor.contractor_name,
    naicsCode: contractor.primary_naics || "332312",
    naicsDescription: contractor.naics_description || "Manufacturing",
    primaryPSCs: [contractor.primary_psc || "5340", "9515", "5110"].slice(0, 3),

    agencyRelationships: {
      totalValue: networkData?.relationships?.asDirectContractor?.totalValue || 50000000,
      count: networkData?.relationships?.asDirectContractor?.count || 1,
      topAgencies: ["Department of Defense", "Army", "Navy"].slice(0, 3)
    },
    primeRelationships: {
      totalValue: networkData?.relationships?.asSubcontractor?.totalValue || 380000000,
      count: networkData?.relationships?.asSubcontractor?.count || 91,
      topPrimes: ["MegaCorp Industries", "Global Defense Systems"].slice(0, 2)
    },
    subRelationships: {
      totalValue: networkData?.relationships?.asPrime?.totalValue || 29000000,
      count: networkData?.relationships?.asPrime?.count || 15,
      topSubs: ["Precision Components Inc", "Advanced Materials LLC"].slice(0, 2)
    },

    overviewData: {
      businessSummary: contractor.business_summary,
      topNAICS: contractor.primary_naics,
      topPSC: contractor.primary_psc,
      totalRevenue: activityEvents?.reduce((sum, event) => sum + (event.EVENT_AMOUNT || 0), 0),
      totalPipeline: networkData?.totalPipelineValue || 0
    }
  } : null;

  // Use AI insights hook
  const { insights } = useNetworkInsights(networkInsightData);

  // Process activity events into network distribution data
  const distributionData: NetworkDistributionData | null = React.useMemo(() => {
    if (!activityEvents || activityEvents.length === 0) return null;
    return processNetworkDistribution(activityEvents);
  }, [activityEvents]);

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
              <div className="border border-gray-700 rounded-xl backdrop-blur-sm p-4 h-full" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
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
                            {insights?.contractorProfileHeadline || "SPECIALIZED FABRICATOR"}
                          </div>
                        </div>

                        {/* Description */}
                        <div className="text-[13px] text-gray-400 leading-relaxed mb-2">
                          {insights?.contractorProfileDescription || (
                            <>
                              Manufacturing armor systems and structural components for defense vehicles.
                              Trusted by <span className="text-[#9B7EBD]">DOD</span> with direct awards,
                              integrated with <span className="text-[#5BC0EB]">major primes</span>,
                              managing <span className="text-[#FF4C4C]">specialized suppliers</span>.
                            </>
                          )}
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
                              {insights?.agencyClientsInsight || "DOD contracts for vehicle armor systems, field equipment hardware"}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                              {isLoading ? 'Loading...' : `$${((distributionData?.agencyDirectAwards?.totalAmount || 0) / 1000000).toFixed(0)}M • ${distributionData?.agencyDirectAwards?.relationships?.length || 0} Awards • ${distributionData?.agencyDirectAwards?.relationships?.[0]?.entityName?.split(' ')[0] || 'Agencies'}`}
                            </div>
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
                              {insights?.primeClientsInsight || "Manufacturing support for MegaCorp Industries & Global Defense Systems"}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                              {isLoading ? 'Loading...' : `$${((distributionData?.primeSubAwards?.totalAmount || 0) / 1000000).toFixed(0)}M • ${distributionData?.primeSubAwards?.relationships?.length || 0} Awards • ${distributionData?.primeSubAwards?.relationships?.length || 0} Prime Contractors`}
                            </div>
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
                              {insights?.subVendorsInsight || "Raw materials, specialized coatings, precision machining services"}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                              {isLoading ? 'Loading...' : `$${((distributionData?.vendorProcurement?.totalAmount || 0) / 1000000).toFixed(0)}M • ${distributionData?.vendorProcurement?.relationships?.length || 0} Orders • ${distributionData?.vendorProcurement?.relationships?.length || 0} Suppliers`}
                            </div>
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
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D2AC38]"></div>
                      </div>
                    ) : (
                      <GoldengateNetworkGraph
                        title="Contractor Network"
                        height="100%"
                        liveIndicator={false}
                        liveText="TRACKING"
                        className="w-full h-full"
                        nodes={[
                          // Main contractor node
                          {
                            id: contractor?.uei || 'main',
                            label: contractor?.name || contractor?.contractor_name || 'Contractor',
                            type: 'hybrid' as const,
                            value: contractor?.totalContractValue || 0
                          },
                          // Agency nodes - from actual distribution data
                          ...(distributionData?.agencyDirectAwards?.relationships?.slice(0, 3)?.map((rel, idx) => {
                            // Extract abbreviation for agencies (e.g., Department of Defense -> DOD)
                            let agencyLabel = rel.entityName;
                            if (agencyLabel.includes('Department of Defense')) agencyLabel = 'DOD';
                            else if (agencyLabel.includes('National Aeronautics')) agencyLabel = 'NASA';
                            else if (agencyLabel.includes('General Services')) agencyLabel = 'GSA';
                            else if (agencyLabel.includes('Department of')) {
                              // Extract first letters after "Department of" (e.g., Department of Energy -> DOE)
                              const words = agencyLabel.replace('Department of ', '').split(' ');
                              agencyLabel = words.map(word => word.charAt(0)).join('').toUpperCase();
                            }
                            else if (agencyLabel.includes('Agency')) {
                              // For agencies, take first word + "A" (e.g., Environmental Protection Agency -> EPA)
                              const words = agencyLabel.split(' ');
                              if (words.length >= 3 && words[words.length - 1] === 'Agency') {
                                agencyLabel = words.slice(0, -1).map(word => word.charAt(0)).join('').toUpperCase() + 'A';
                              } else {
                                agencyLabel = words[0];
                              }
                            }
                            else {
                              // Fallback: first word only
                              agencyLabel = agencyLabel.split(' ')[0];
                            }

                            return {
                              id: `agency-${rel.entityUei}`,
                              label: agencyLabel,
                              type: 'agency' as const,
                              value: rel.totalAmount
                            };
                          }) || []),
                          // Prime contractor nodes - from actual distribution data
                          ...(distributionData?.primeSubAwards?.relationships?.slice(0, 3)?.map((rel, idx) => ({
                            id: `prime-${rel.entityUei}`,
                            label: rel.entityName.split(' ')[0] || `Prime${idx + 1}`,
                            type: 'prime' as const,
                            value: rel.totalAmount
                          })) || []),
                          // Sub vendor nodes - from actual distribution data
                          ...(distributionData?.vendorProcurement?.relationships?.slice(0, 3)?.map((rel, idx) => ({
                            id: `sub-${rel.entityUei}`,
                            label: rel.entityName.split(' ')[0] || `Sub${idx + 1}`,
                            type: 'sub' as const,
                            value: rel.totalAmount
                          })) || [])
                        ]}
                        edges={[
                          // Agency edges - inflows to contractor
                          ...(distributionData?.agencyDirectAwards?.relationships?.slice(0, 3)?.map((rel) => ({
                            source: `agency-${rel.entityUei}`,
                            target: contractor?.uei || 'main',
                            weight: Math.min(100, rel.percentage),
                            revenue: rel.totalAmount,
                            contracts: 1 // Could be enhanced with actual contract count if available
                          })) || []),
                          // Prime contractor edges - inflows to contractor
                          ...(distributionData?.primeSubAwards?.relationships?.slice(0, 3)?.map((rel) => ({
                            source: `prime-${rel.entityUei}`,
                            target: contractor?.uei || 'main',
                            weight: Math.min(100, rel.percentage),
                            revenue: rel.totalAmount,
                            contracts: 1
                          })) || []),
                          // Sub vendor edges - outflows from contractor
                          ...(distributionData?.vendorProcurement?.relationships?.slice(0, 3)?.map((rel) => ({
                            source: contractor?.uei || 'main',
                            target: `sub-${rel.entityUei}`,
                            weight: Math.min(100, rel.percentage),
                            revenue: rel.totalAmount,
                            contracts: 1
                          })) || [])
                        ]}
                      />
                    )}
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