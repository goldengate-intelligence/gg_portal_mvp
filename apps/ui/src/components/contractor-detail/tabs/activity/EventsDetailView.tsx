import React from 'react';
import { Card } from "../../../ui/card";
import { CONTRACTOR_DETAIL_COLORS } from '../../../../logic/utils';
import { ArrowLeft, Calendar, DollarSign, Building2, MapPin } from 'lucide-react';

interface Event {
  event_type: 'PRIME' | 'SUBAWARD';
  event_date: string;
  recipient_name: string;
  recipient_uei: string;
  event_amount: number;
  prime_contractor_name: string | null;
  awarding_agency_name: string;
  awarding_sub_agency_name: string;
  naics_code: string;
  naics_description: string;
  recipient_state: string;
  pop_state: string;
  contract_total_value: number;
  award_piid: string;
  action_type: string;
  fiscal_year: number;
  extent_competed: string;
  contract_pricing_type: string;
  small_business_flags: string[];
  parent_company_name: string | null;
  start_date: string;
  end_date: string;
  utilization: number;
}

interface EventsDetailViewProps {
  relationship: any;
  onBack: () => void;
}

export function EventsDetailView({ relationship, onBack }: EventsDetailViewProps) {
  // Mock events data - in production this would come from props or API
  const mockEvents: Event[] = [
    {
      event_type: 'PRIME',
      event_date: '2024-03-15',
      recipient_name: 'Trio Fabrication LLC',
      recipient_uei: 'W123456789',
      event_amount: 25000000,
      prime_contractor_name: null,
      awarding_agency_name: 'Department of Defense',
      awarding_sub_agency_name: 'Army Corps of Engineers',
      naics_code: '332312',
      naics_description: 'Fabricated Structural Metal Manufacturing',
      recipient_state: 'DC',
      pop_state: 'CO',
      contract_total_value: 165000000,
      award_piid: 'W912HZ24F0123',
      action_type: 'NEW',
      fiscal_year: 2024,
      extent_competed: 'FULL',
      contract_pricing_type: 'FFP',
      small_business_flags: ['Veteran-Owned', 'Small Business'],
      parent_company_name: null,
      start_date: '2024-03-15',
      end_date: '2029-12-31',
      utilization: 28
    },
    {
      event_type: 'PRIME',
      event_date: '2024-06-20',
      recipient_name: 'Trio Fabrication LLC',
      recipient_uei: 'W123456789',
      event_amount: 8500000,
      prime_contractor_name: null,
      awarding_agency_name: 'Department of Defense',
      awarding_sub_agency_name: 'Army Corps of Engineers',
      naics_code: '332312',
      naics_description: 'Fabricated Structural Metal Manufacturing',
      recipient_state: 'DC',
      pop_state: 'CO',
      contract_total_value: 165000000,
      award_piid: 'W912HZ24F0123',
      action_type: 'MOD',
      fiscal_year: 2024,
      extent_competed: 'FULL',
      contract_pricing_type: 'FFP',
      small_business_flags: ['Veteran-Owned', 'Small Business'],
      parent_company_name: null,
      start_date: '2024-03-15',
      end_date: '2029-12-31',
      utilization: 35
    },
    {
      event_type: 'SUBAWARD',
      event_date: '2024-04-10',
      recipient_name: 'Texas Materials Inc',
      recipient_uei: 'T987654321',
      event_amount: 3200000,
      prime_contractor_name: 'Trio Fabrication LLC',
      awarding_agency_name: 'Department of Defense',
      awarding_sub_agency_name: 'Army Corps of Engineers',
      naics_code: '327320',
      naics_description: 'Ready-Mix Concrete Manufacturing',
      recipient_state: 'TX',
      pop_state: 'CO',
      contract_total_value: 165000000,
      award_piid: 'W912HZ24F0123',
      action_type: 'NEW',
      fiscal_year: 2024,
      extent_competed: 'SOLE_SOURCE',
      contract_pricing_type: 'FFP',
      small_business_flags: ['Small Business', 'Minority-Owned'],
      parent_company_name: null,
      start_date: '2024-04-10',
      end_date: '2026-03-31',
      utilization: 52
    },
    {
      event_type: 'SUBAWARD',
      event_date: '2024-05-15',
      recipient_name: 'Advanced Component Solutions',
      recipient_uei: 'A456789123',
      event_amount: 1800000,
      prime_contractor_name: 'Trio Fabrication LLC',
      awarding_agency_name: 'Department of Defense',
      awarding_sub_agency_name: 'Army Corps of Engineers',
      naics_code: '336413',
      naics_description: 'Other Aircraft Part Manufacturing',
      recipient_state: 'CA',
      pop_state: 'CO',
      contract_total_value: 165000000,
      award_piid: 'W912HZ24F0123',
      action_type: 'NEW',
      fiscal_year: 2024,
      extent_competed: 'SOLE_SOURCE',
      contract_pricing_type: 'FFP',
      small_business_flags: ['Small Business', 'Woman-Owned'],
      parent_company_name: null,
      start_date: '2024-05-15',
      end_date: '2025-11-30',
      utilization: 78
    },
    {
      event_type: 'SUBAWARD',
      event_date: '2024-07-08',
      recipient_name: 'Precision Engineering Corp',
      recipient_uei: 'P789123456',
      event_amount: 950000,
      prime_contractor_name: 'Trio Fabrication LLC',
      awarding_agency_name: 'Department of Defense',
      awarding_sub_agency_name: 'Army Corps of Engineers',
      naics_code: '332710',
      naics_description: 'Machine Shops',
      recipient_state: 'MI',
      pop_state: 'CO',
      contract_total_value: 165000000,
      award_piid: 'W912HZ24F0123',
      action_type: 'NEW',
      fiscal_year: 2024,
      extent_competed: 'SOLE_SOURCE',
      contract_pricing_type: 'FFP',
      small_business_flags: ['Veteran-Owned', 'Small Business'],
      parent_company_name: null,
      start_date: '2024-07-08',
      end_date: '2025-06-30',
      utilization: 41
    }
  ];

  const formatMoney = (value: number): string => {
    return `$${(value / 1000000).toFixed(1)}M`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEventTypeColor = (type: string) => {
    return type === 'PRIME' ? '#5BC0EB' : '#FF4C4C';
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization <= 25) return '#15803d'; // Forest green
    if (utilization <= 50) return '#84cc16'; // Chartreuse
    if (utilization <= 75) return '#eab308'; // Yellow
    return '#dc2626'; // Red
  };

  return (
    <Card className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 group relative border border-[#D2AC38]/50 hover:border-[#D2AC38]/90" style={{ backgroundColor: '#111726' }}>
      <div className="p-4 relative z-10">
        {/* Back Button and Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Activity</span>
          </button>
          <h3 className="font-bold tracking-wide text-gray-200 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
            Contract Events: {relationship?.name}
          </h3>
        </div>

        {/* Events Container */}
        <div className="flex-1 overflow-auto rounded-xl border border-gray-700" style={{ backgroundColor: '#223040' }}>
          <div className="p-4">
            <div className="mb-3">
              <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                EVENTS • {mockEvents.length}
              </h5>
            </div>

            <div className="space-y-2">
              {mockEvents.map((event, index) => (
                <div key={index}
                     style={{ backgroundColor: '#03070F' }}
                     className="border border-gray-700/50 rounded-lg overflow-hidden hover:border-gray-600/40 transition-all group relative">
                  {/* Color accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-[2px]"
                       style={{ backgroundColor: getEventTypeColor(event.event_type) }} />

                  <div className="p-2.5 transition-all">
                    <div className="relative">
                      {/* Main content area */}
                      <div className="space-y-3">
                        {/* Top Row: Event Type, Recipient, Amount */}
                        <div className="flex justify-between">
                          <div className="flex items-center flex-1">
                            <div className="flex items-center gap-3">
                              {/* Event Type Badge */}
                              <div
                                className="px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide inline-block"
                                style={{
                                  backgroundColor: getEventTypeColor(event.event_type) + '20',
                                  color: getEventTypeColor(event.event_type),
                                  border: `1px solid ${getEventTypeColor(event.event_type)}40`
                                }}
                              >
                                {event.event_type}
                              </div>

                              {/* Recipient Info */}
                              <div>
                                <div className="text-base text-white font-medium">
                                  {event.recipient_name}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {event.recipient_state} • {event.action_type}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Side: Financial Info */}
                          <div className="flex items-center mr-15">
                            {/* Event Amount */}
                            <div className="text-center" style={{ width: '80px' }}>
                              <div className="text-base font-bold text-white leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                {formatMoney(event.event_amount)}
                              </div>
                              <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">
                                Event Value
                              </div>
                            </div>

                            {/* Separator */}
                            <div className="w-px h-6 bg-gray-700/40 mx-2"></div>

                            {/* Utilization */}
                            <div className="text-center" style={{ width: '65px' }}>
                              <div className="text-sm font-bold leading-none" style={{ color: getUtilizationColor(event.utilization), fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                {event.utilization}%
                              </div>
                              <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">
                                Utilization
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Details */}
                        <div className="mr-15 space-y-2">
                          <div className="flex items-center justify-between text-xs text-gray-300" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-500">Date:</span>
                              <span>{formatDate(event.event_date)}</span>
                              <span className="text-gray-500">Agency:</span>
                              <span>{event.awarding_agency_name}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-300" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-500">NAICS:</span>
                              <span>{event.naics_code}</span>
                              <span className="text-gray-500">Award:</span>
                              <span className="text-[#D2AC38]">{event.award_piid}</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                            {event.naics_description}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}