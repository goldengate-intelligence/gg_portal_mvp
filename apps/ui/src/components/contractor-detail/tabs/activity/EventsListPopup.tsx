import React, { useState } from 'react';
import { X, Calendar, DollarSign, Building2, MapPin, Filter, ArrowUpDown } from 'lucide-react';
import { CONTRACTOR_DETAIL_COLORS } from '../../../../lib/utils';

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

        {/* Events List */}
        <div className="flex-1 overflow-y-auto" data-popup-scroll>
          <div className="p-4">
            <div className="space-y-2">
              {sortedEvents.map((event, index) => (
                <div
                  key={index}
                  className="border border-gray-700/50 rounded-lg overflow-hidden hover:border-gray-600/40 transition-all group bg-gray-900/40"
                >
                  <div className="p-4">
                    {/* Event Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide"
                          style={{
                            backgroundColor: getEventTypeColor(event.event_type) + '20',
                            color: getEventTypeColor(event.event_type),
                            border: `1px solid ${getEventTypeColor(event.event_type)}40`
                          }}
                        >
                          {event.event_type}
                        </div>
                        <span className="text-lg font-semibold text-white">
                          {formatMoney(event.event_amount)}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-300">{formatDate(event.event_date)}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        FY{event.fiscal_year} • {event.action_type}
                      </div>
                    </div>

                    {/* Event Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                      {/* Recipient Info */}
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Recipient</div>
                        <div className="text-gray-300 font-medium">{event.recipient_name}</div>
                        <div className="text-xs text-gray-500">{event.recipient_state}</div>
                        {event.parent_company_name && (
                          <div className="text-xs text-gray-400">Parent: {event.parent_company_name}</div>
                        )}
                      </div>

                      {/* Agency Info */}
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Agency</div>
                        <div className="text-gray-300 font-medium">{event.awarding_agency_name}</div>
                        <div className="text-xs text-gray-400">{event.awarding_sub_agency_name}</div>
                      </div>

                      {/* Contract Info */}
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contract</div>
                        <div className="text-gray-300 font-medium">{event.contract_pricing_type}</div>
                        <div className="text-xs text-gray-400">{event.extent_competed}</div>
                        <div className="text-xs text-gray-500">Total: {formatMoney(event.contract_total_value)}</div>
                      </div>

                      {/* Industry & Location */}
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Industry & PoP</div>
                        <div className="text-gray-300 font-medium">{event.naics_code}</div>
                        <div className="text-xs text-gray-400">{event.naics_description}</div>
                        <div className="text-xs text-gray-500">PoP: {event.pop_state}</div>
                      </div>

                      {/* Utilization */}
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Utilization</div>
                        <div className="text-lg font-bold leading-none" style={{
                          color: event.utilization <= 25 ? '#15803d' :
                                event.utilization <= 50 ? '#84cc16' :
                                event.utilization <= 75 ? '#eab308' : '#dc2626',
                          fontFamily: 'system-ui, -apple-system, sans-serif'
                        }}>
                          {event.utilization}%
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">Obligated</div>
                      </div>
                    </div>

                    {/* Period of Performance Timeline */}
                    <div className="mt-4 pt-3 border-t border-gray-700/30">
                      {(() => {
                        const startDate = new Date(event.start_date);
                        const endDate = new Date(event.end_date);
                        const today = new Date();
                        const totalDuration = endDate.getTime() - startDate.getTime();
                        const elapsed = Math.max(0, today.getTime() - startDate.getTime());
                        const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
                        const remainingMonths = Math.max(0, Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));

                        // Timeline color based on time remaining and progress
                        const getTimelineColor = () => {
                          if (today > endDate) return '#6b7280'; // Completed - gray
                          if (remainingMonths <= 3) return '#dc2626'; // Critical - red
                          if (remainingMonths <= 6) return '#eab308'; // Warning - yellow
                          if (remainingMonths <= 12) return '#84cc16'; // Caution - chartreuse
                          return '#15803d'; // Good - green
                        };

                        const getStatusLabel = () => {
                          if (today > endDate) return 'COMPLETED';
                          if (today < startDate) return 'UPCOMING';
                          return 'ACTIVE';
                        };

                        const getStatusColor = () => {
                          if (today > endDate) return '#6b7280';
                          if (today < startDate) return '#60a5fa';
                          return '#22c55e';
                        };

                        return (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500 uppercase tracking-wider">Period of Performance</div>
                              <div className="px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide" style={{
                                backgroundColor: getStatusColor() + '20',
                                color: getStatusColor(),
                                border: `1px solid ${getStatusColor()}40`
                              }}>
                                {getStatusLabel()}
                              </div>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.max(progressPercent, 3)}%`,
                                  backgroundColor: getTimelineColor()
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-300" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                <span className="text-gray-500">{formatDate(event.start_date)}</span>
                                <span className="mx-2 text-gray-600">-</span>
                                <span className="text-gray-500">{formatDate(event.end_date)}</span>
                              </div>
                              <span className="text-sm text-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                {Math.round(progressPercent)}% Elapsed
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Small Business Flags */}
                    {event.small_business_flags.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700/30">
                        <div className="flex gap-2 flex-wrap">
                          {event.small_business_flags.map((flag, flagIndex) => (
                            <span
                              key={flagIndex}
                              className="px-2 py-1 bg-[#D2AC38]/10 text-[#D2AC38] rounded text-xs"
                            >
                              {flag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prime Contractor (for subawards) */}
                    {event.prime_contractor_name && (
                      <div className="mt-3 pt-3 border-t border-gray-700/30">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Prime Contractor</div>
                        <div className="text-gray-300">{event.prime_contractor_name}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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