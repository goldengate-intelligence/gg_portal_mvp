import React, { useState } from 'react';
import { X, Calendar, DollarSign, Building2, MapPin, Filter, ArrowUpDown } from 'lucide-react';
import { CONTRACTOR_DETAIL_COLORS } from '../../../../logic/utils';

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
  // Period of Performance
  start_date: string;
  end_date: string;
  // Utilization metrics
  utilization: number;
}

interface EventsListPopupProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  contractTitle: string;
}

export function EventsListPopup({ isOpen, onClose, contractId, contractTitle }: EventsListPopupProps) {
  const [sortField, setSortField] = useState<keyof Event>('event_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState('');

  if (!isOpen) return null;

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

  const filteredEvents = mockEvents.filter(event =>
    event.recipient_name.toLowerCase().includes(filter.toLowerCase()) ||
    event.awarding_agency_name.toLowerCase().includes(filter.toLowerCase()) ||
    event.action_type.toLowerCase().includes(filter.toLowerCase())
  );

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * multiplier;
    }
    return String(aVal).localeCompare(String(bVal)) * multiplier;
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-4 pb-8" data-popup>
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
        onClick={onClose}
      />

      {/* Popup Content */}
      <div
        className="relative w-[98vw] max-h-[calc(100vh-4rem)] rounded-xl border shadow-2xl flex flex-col"
        style={{
          backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor,
          borderColor: '#5BC0EB40'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-[#5BC0EB]/10">
              <Calendar className="w-6 h-6 text-[#5BC0EB]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Genos, sans-serif' }}>
                Contract Events: {contractId}
              </h2>
              <p className="text-gray-400 mt-1">{contractTitle}</p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-700/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filter:</span>
            </div>
            <input
              type="text"
              placeholder="Search events..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-black/20 border border-gray-700/50 text-gray-300 placeholder-gray-500 px-3 py-2 rounded-lg text-sm"
            />
            <div className="text-sm text-gray-400">
              Showing {sortedEvents.length} of {mockEvents.length} events
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="flex-1 overflow-y-auto" data-popup-scroll>
          <div className="p-4">
            <div className="rounded-lg border-2 border-orange-500/40 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-black/40 border-b border-gray-700/50">
                    <th className="text-left py-3 px-4 text-[#D2AC38] font-medium">Event Date</th>
                    <th className="text-left py-3 px-4 text-[#D2AC38] font-medium">Event Type</th>
                    <th className="text-left py-3 px-4 text-[#D2AC38] font-medium">Recipient</th>
                    <th className="text-left py-3 px-4 text-[#D2AC38] font-medium">Event Amount</th>
                    <th className="text-left py-3 px-4 text-[#D2AC38] font-medium">Agency</th>
                    <th className="text-left py-3 px-4 text-[#D2AC38] font-medium">NAICS</th>
                    <th className="text-left py-3 px-4 text-[#D2AC38] font-medium">Utilization</th>
                    <th className="text-left py-3 px-4 text-[#D2AC38] font-medium">Action Type</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEvents.map((event, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-black/40' : 'bg-[#223040]'}
                    >
                      <td className="py-3 px-4 text-gray-300">
                        {formatDate(event.event_date)}
                      </td>
                      <td className="py-3 px-4">
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
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        <div>{event.recipient_name}</div>
                        <div className="text-xs text-gray-500">{event.recipient_state}</div>
                      </td>
                      <td className="py-3 px-4 text-white font-semibold">
                        {formatMoney(event.event_amount)}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        <div>{event.awarding_agency_name}</div>
                        <div className="text-xs text-gray-500">{event.awarding_sub_agency_name}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        <div>{event.naics_code}</div>
                        <div className="text-xs text-gray-500">{event.naics_description}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-lg font-bold leading-none" style={{
                          color: event.utilization <= 25 ? '#15803d' :
                                event.utilization <= 50 ? '#84cc16' :
                                event.utilization <= 75 ? '#eab308' : '#dc2626',
                          fontFamily: 'system-ui, -apple-system, sans-serif'
                        }}>
                          {event.utilization}%
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {event.action_type}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700/30 bg-gray-900/30">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>Total Events: {sortedEvents.length}</div>
            <div>
              Total Value: {formatMoney(sortedEvents.reduce((sum, event) => sum + event.event_amount, 0))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}