import React, { useState } from 'react';
import { X, FileText, Calendar, DollarSign, TrendingUp, AlertCircle, Building2, Users } from 'lucide-react';
import { CONTRACTOR_DETAIL_COLORS } from '../../../../lib/utils';
import { EventsListPopup } from './EventsListPopup';

interface AwardGrainPopupProps {
  isOpen: boolean;
  onClose: () => void;
  relationship: any;
}

export function AwardGrainPopup({ isOpen, onClose, relationship }: AwardGrainPopupProps) {
  const [isEventsPopupOpen, setIsEventsPopupOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  if (!isOpen || !relationship) return null;

  const openEventsPopup = (contract: any) => {
    setSelectedContract(contract);
    setIsEventsPopupOpen(true);
  };

  const closeEventsPopup = () => {
    setIsEventsPopupOpen(false);
    setSelectedContract(null);
  };

  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate award status
  const getAwardStatus = (contract: any) => {
    const startDate = new Date(contract.start);
    const endDate = new Date(contract.end);
    const today = new Date();

    if (today < startDate) return { status: 'upcoming', color: '#60a5fa' };
    if (today > endDate) return { status: 'completed', color: '#6b7280' };
    return { status: 'active', color: '#22c55e' };
  };

  // Get relationship color
  const getRelationshipColor = () => {
    if (relationship.type === 'agency') return '#9B7EBD';
    if (relationship.type === 'prime') return '#5BC0EB';
    return '#FF4C4C'; // sub
  };

  // No scroll management - let the existing modal system handle it

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-16" data-popup>
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        onClick={onClose}
      />

      {/* Popup Content */}
      <div
        className="relative w-[95vw] max-h-[calc(100vh-8rem)] rounded-xl border shadow-2xl flex flex-col"
        style={{
          backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor,
          borderColor: getRelationshipColor() + '40'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: getRelationshipColor() + '20' }}>
          <div className="flex items-center gap-4">
            {/* Relationship Icon */}
            <div style={{ color: getRelationshipColor() }}>
              {relationship.type === 'agency' ? (
                <Building2 className="w-8 h-8" />
              ) : relationship.type === 'prime' ? (
                <Users className="w-8 h-8" />
              ) : (
                <FileText className="w-8 h-8" />
              )}
            </div>

            {/* Title Info */}
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Genos, sans-serif' }}>
                {relationship.name}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-gray-400">
                  {relationship.contracts.length} Award{relationship.contracts.length > 1 ? 's' : ''}
                </span>
                <span className="text-gray-600">•</span>
                <div
                  className="px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide"
                  style={{
                    backgroundColor: getRelationshipColor() + '20',
                    color: getRelationshipColor(),
                    border: `1px solid ${getRelationshipColor()}40`
                  }}
                >
                  {relationship.type === 'agency' ? 'Agency' : relationship.type === 'prime' ? 'Prime' : 'Sub'}
                </div>
              </div>
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

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pb-6" data-popup-scroll>
          {/* Portfolio Summary Bar - Matching Activity Rollups Structure */}
          <div className="px-6 py-4">
          <div
            className="border border-gray-700/50 rounded-lg overflow-hidden relative"
            style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-[2px]"
              style={{ backgroundColor: getRelationshipColor() }}
            />
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h5 className="text-base font-semibold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Portfolio Summary ({relationship.contracts.length} award{relationship.contracts.length > 1 ? 's' : ''})
                  </h5>
                </div>
                <div className="flex items-center mr-15">
                  {(() => {
                    const totalLifetime = relationship.totalValue;
                    const totalActive = totalLifetime * 0.85;
                    const totalObligated = relationship.contracts.reduce((sum: number, contract: any) => {
                      const contractValue = parseFloat(contract.currentValue.replace(/[$M]/g, '')) * 1000000;
                      const activeValue = contractValue * 0.85;
                      const obligatedValue = activeValue * (contract.utilization / 100);
                      return sum + obligatedValue;
                    }, 0);
                    const weightedUtilization = totalActive > 0 ? (totalObligated / totalActive) * 100 : 0;

                    const getObligationColor = () => {
                      if (weightedUtilization <= 25) return '#15803d';
                      if (weightedUtilization <= 50) return '#84cc16';
                      if (weightedUtilization <= 75) return '#eab308';
                      return '#dc2626';
                    };

                    return (
                      <>
                        {/* Lifetime */}
                        <div className="text-center" style={{ width: '80px' }}>
                          <div className="text-lg font-medium text-gray-500 leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                            ${(totalLifetime / 1000000).toFixed(0)}M
                          </div>
                          <div className="text-xs uppercase tracking-wider text-gray-500 mt-0.5">
                            Lifetime
                          </div>
                        </div>

                        {/* Subtle Separator */}
                        <div className="w-px h-8 bg-gray-700/40 mx-3"></div>

                        {/* Active */}
                        <div className="text-center" style={{ width: '80px' }}>
                          <div className="text-xl font-bold text-white leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                            ${(totalActive / 1000000).toFixed(0)}M
                          </div>
                          <div className="text-xs uppercase tracking-wider text-gray-500 mt-0.5">
                            Active
                          </div>
                        </div>

                        {/* Subtle Separator */}
                        <div className="w-px h-8 bg-gray-700/40 mx-3"></div>

                        {/* Obligated */}
                        <div className="text-center" style={{ width: '80px' }}>
                          <div className="text-lg font-semibold text-gray-300 leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                            ${(totalObligated / 1000000).toFixed(0)}M
                          </div>
                          <div className="text-xs uppercase tracking-wider text-gray-500 mt-0.5">
                            Obligated
                          </div>
                        </div>

                        {/* Subtle Separator */}
                        <div className="w-px h-8 bg-gray-700/40 mx-3"></div>

                        {/* Utilization Percentage */}
                        <div className="text-center" style={{ width: '80px' }}>
                          <div className="text-lg font-bold leading-none" style={{ color: getObligationColor(), fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                            {Math.round(weightedUtilization)}%
                          </div>
                          <div className="text-xs uppercase tracking-wider text-gray-500 mt-0.5">
                            Utilization
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6" data-popup-scroll>
          <div className="space-y-4">
            {relationship.contracts.map((contract: any, index: number) => {
              const status = getAwardStatus(contract);
              const contractValue = parseFloat(contract.currentValue.replace(/[$M]/g, '')) * 1000000;
              const obligatedValue = contractValue * (contract.utilization / 100);

              return (
                <div
                  key={contract.id}
                  className="border border-gray-700/50 rounded-lg overflow-hidden hover:border-gray-600/40 transition-all group relative bg-gray-900/60"
                >
                  {/* Color accent bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[2px]"
                    style={{ backgroundColor: status.color }}
                  />

                  <div className="px-3 pt-3 pb-2 cursor-pointer transition-all">
                    {/* Redesigned Layout - Following Relationship Card Framework */}
                    <div className="relative">
                      {/* Main content area */}
                      <div className="space-y-3">
                        {/* Layout with proper alignment */}
                        <div className="flex justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            {/* Status Icon */}
                            <div style={{ color: status.color }}>
                              <FileText className="w-6 h-6" />
                            </div>

                            {/* Award ID and Details */}
                            <div>
                              <div className="text-lg font-medium">
                                <span className="text-white">{contract.id}</span>
                                <span className="text-gray-400"> - {contract.desc}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Side: Clean Financial Flow */}
                          <div className="flex items-center mr-15">
                            {/* Lifetime */}
                            <div className="text-center" style={{ width: '80px' }}>
                              <div className="text-lg font-medium text-gray-500 leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                ${(contractValue / 1000000).toFixed(0)}M
                              </div>
                              <div className="text-xs uppercase tracking-wider text-gray-500 mt-0.5">
                                Lifetime
                              </div>
                            </div>

                            {/* Subtle Separator */}
                            <div className="w-px h-8 bg-gray-700/40 mx-3"></div>

                            {/* Active */}
                            <div className="text-center" style={{ width: '80px' }}>
                              <div className="text-xl font-bold text-white leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                ${((contractValue * 0.85) / 1000000).toFixed(0)}M
                              </div>
                              <div className="text-xs uppercase tracking-wider text-gray-500 mt-0.5">
                                Active
                              </div>
                            </div>

                            {/* Subtle Separator */}
                            <div className="w-px h-8 bg-gray-700/40 mx-3"></div>

                            {/* Obligated */}
                            <div className="text-center" style={{ width: '80px' }}>
                              <div className="text-lg font-semibold text-gray-300 leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                ${(obligatedValue / 1000000).toFixed(0)}M
                              </div>
                              <div className="text-xs uppercase tracking-wider text-gray-500 mt-0.5">
                                Obligated
                              </div>
                            </div>

                            {/* Subtle Separator */}
                            <div className="w-px h-8 bg-gray-700/40 mx-3"></div>

                            {/* Utilization Percentage */}
                            <div className="text-center" style={{ width: '80px' }}>
                              <div
                                className="text-lg font-bold leading-none"
                                style={{
                                  fontFamily: 'system-ui, -apple-system, sans-serif',
                                  color: contract.utilization <= 25 ? '#15803d' :
                                         contract.utilization <= 50 ? '#84cc16' :
                                         contract.utilization <= 75 ? '#eab308' : '#dc2626'
                                }}
                              >
                                {contract.utilization}%
                              </div>
                              <div className="text-xs uppercase tracking-wider text-gray-500 mt-0.5">
                                Utilization
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Award Metadata - Clean Layout */}
                        <div className="pt-2">
                          {/* Award Classification & Counts Grid */}
                          <div className="grid grid-cols-3 gap-6 mr-15">
                            {/* Left Column: Classification */}
                            <div className="space-y-2">
                              <div className="text-xs text-gray-500 uppercase tracking-wider font-medium border-b border-gray-700 pb-1">Classification</div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-400">Industry:</span>
                                  <span className="text-xs text-gray-300 font-medium">NAICS {contract.naics}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-400">Category:</span>
                                  <span className="text-xs text-gray-300 font-medium">PSC {contract.psc}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-400">Type:</span>
                                  <span className="text-xs text-gray-300 font-medium">{contract.type}</span>
                                </div>
                              </div>
                            </div>

                            {/* Middle Column: Award Counts */}
                            <div className="space-y-2">
                              <div className="text-xs text-gray-500 uppercase tracking-wider font-medium border-b border-gray-700 pb-1">Award Structure</div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-400">Awardees:</span>
                                  <span className="text-xs text-gray-300 font-medium">{Math.floor(Math.random() * 5) + 1}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-400">Subawardees:</span>
                                  <span className="text-xs text-gray-300 font-medium">{Math.floor(Math.random() * 12) + 3}</span>
                                </div>
                              </div>
                            </div>

                            {/* Right Column: Activity Metrics */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between pb-1 border-b border-gray-700">
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Activity</div>
                                {(() => {
                                  // Mock action date and temperature - in production this would come from contract data
                                  const lastActionDays = Math.floor(Math.random() * 800);

                                  let heatColor, heatLabel, bgColor, borderColor;
                                  if (lastActionDays <= 30) {
                                    heatColor = '#ef4444'; // Hot - Red text
                                    bgColor = 'bg-red-500/20'; // Hot - Red background
                                    borderColor = 'border-red-500/40'; // Hot - Red border
                                    heatLabel = 'Hot';
                                  } else if (lastActionDays <= 365) {
                                    heatColor = '#f59e0b'; // Warm - Orange text
                                    bgColor = 'bg-orange-500/20'; // Warm - Orange background
                                    borderColor = 'border-orange-500/40'; // Warm - Orange border
                                    heatLabel = 'Warm';
                                  } else {
                                    heatColor = '#3b82f6'; // Cold - Blue text
                                    bgColor = 'bg-blue-500/20'; // Cold - Blue background
                                    borderColor = 'border-blue-500/40'; // Cold - Blue border
                                    heatLabel = 'Cold';
                                  }

                                  return (
                                    <span className={`px-1 py-0.5 ${bgColor} border ${borderColor} rounded-full uppercase tracking-wider font-sans font-normal`} style={{ fontSize: '8px', color: heatColor }}>
                                      {heatLabel}
                                    </span>
                                  );
                                })()}
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-400">Latest Event:</span>
                                  <span className="text-xs text-gray-300 font-medium">
                                    {(() => {
                                      // Mock action date - in production this would come from contract data
                                      const lastActionDays = Math.floor(Math.random() * 800);
                                      const actionDate = new Date();
                                      actionDate.setDate(actionDate.getDate() - lastActionDays);

                                      return actionDate.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      });
                                    })()}
                                  </span>
                                </div>
                                <div
                                  className="flex justify-between cursor-pointer hover:bg-gray-700/20 rounded px-1 py-0.5 transition-colors"
                                  onClick={() => openEventsPopup(contract)}
                                >
                                  <span className="text-xs text-gray-400">Events:</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-[#5BC0EB] font-medium hover:text-[#7DD3F0]">{Math.floor(Math.random() * 25) + 8}</span>
                                    <Calendar className="w-3 h-3 text-[#5BC0EB]" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Progress Timeline - Following relationship card pattern */}
                        <div className="mr-15 space-y-2">
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${(() => {
                                  const start = new Date(contract.start);
                                  const end = new Date(contract.end);
                                  const today = new Date();
                                  const total = end.getTime() - start.getTime();
                                  const elapsed = Math.max(0, today.getTime() - start.getTime());
                                  const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
                                  return Math.max(percent, 3);
                                })()}%`,
                                backgroundColor: status.color
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-300" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                              <span className="text-gray-500">Award Performance Period:</span>
                              <span className="ml-2">
                                {formatDate(contract.start)}
                              </span>
                              <span className="mx-2">-</span>
                              <span>
                                {formatDate(contract.end)}
                              </span>
                            </div>
                            <span className="text-sm text-gray-400" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                              {(() => {
                                const start = new Date(contract.start);
                                const end = new Date(contract.end);
                                const today = new Date();
                                const total = end.getTime() - start.getTime();
                                const elapsed = Math.max(0, today.getTime() - start.getTime());
                                const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
                                return `${Math.round(percent)}% Elapsed`;
                              })()}
                            </span>
                          </div>
                        </div>

                        {/* Right Arrow - Opens Events Popup */}
                        <div
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                          onClick={() => openEventsPopup(contract)}
                        >
                          <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center hover:bg-gray-600/60 transition-colors">
                            <svg className="w-4 h-4 text-gray-400 hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </div>

      {/* Events List Popup */}
      <EventsListPopup
        isOpen={isEventsPopupOpen}
        onClose={closeEventsPopup}
        contractId={selectedContract?.id || ''}
        contractTitle={selectedContract?.desc || ''}
      />
    </div>
  );
}