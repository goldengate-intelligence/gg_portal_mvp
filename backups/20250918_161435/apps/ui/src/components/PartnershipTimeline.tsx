import React, { useMemo } from 'react';

interface PartnershipEvent {
  partnerName: string;
  partnerUei: string;
  date: Date;
  value: number; // in millions
  contractNumber?: string;
  relationshipType: 'prime' | 'sub';
  status: 'active' | 'completed' | 'pending';
}

interface PartnershipTimelineProps {
  data: PartnershipEvent[];
  title?: string;
  height?: number;
}

const PartnershipTimeline: React.FC<PartnershipTimelineProps> = ({
  data,
  title = "Partnership Activity Timeline",
  height = 320
}) => {
  // Process data to group by partner and create timeline
  const timelineData = useMemo(() => {
    // Get unique partners
    const partners = Array.from(new Set(data.map(d => d.partnerName)));
    
    // Get time range
    const dates = data.map(d => d.date);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Add padding to dates
    minDate.setMonth(minDate.getMonth() - 1);
    maxDate.setMonth(maxDate.getMonth() + 1);
    
    // Group events by partner
    const groupedData = partners.slice(0, 8).map(partner => {
      const partnerEvents = data.filter(d => d.partnerName === partner);
      return {
        partner,
        events: partnerEvents,
        totalValue: partnerEvents.reduce((sum, e) => sum + e.value, 0),
        relationshipType: partnerEvents[0]?.relationshipType || 'sub'
      };
    });
    
    // Sort by total value
    groupedData.sort((a, b) => b.totalValue - a.totalValue);
    
    return {
      partners: groupedData,
      minDate,
      maxDate,
      totalMonths: Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    };
  }, [data]);

  // Calculate position on timeline
  const getTimelinePosition = (date: Date): number => {
    const { minDate, maxDate } = timelineData;
    const total = maxDate.getTime() - minDate.getTime();
    const position = date.getTime() - minDate.getTime();
    return (position / total) * 100;
  };

  // Get bubble size based on value
  const getBubbleSize = (value: number): number => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minSize = 12;
    const maxSize = 32;
    return minSize + ((value / maxValue) * (maxSize - minSize));
  };

  // Get color based on status and type
  const getBubbleColor = (status: string, type: string): string => {
    if (type === 'prime') {
      return status === 'active' ? '#5BC0EB' : 'rgba(91, 192, 235, 0.5)';
    } else {
      return status === 'active' ? '#FF4C4C' : 'rgba(255, 76, 76, 0.5)';
    }
  };

  // Generate month labels
  const monthLabels = useMemo(() => {
    const labels = [];
    const current = new Date(timelineData.minDate);
    while (current <= timelineData.maxDate) {
      labels.push({
        date: new Date(current),
        label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      });
      current.setMonth(current.getMonth() + 3); // Show every 3 months
    }
    return labels;
  }, [timelineData]);

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-2xl text-gray-200 font-normal tracking-wider mb-3" 
          style={{ fontFamily: 'Genos, sans-serif' }}>
        {title}
      </h3>
      
      <div className="flex-1 relative" style={{ height: height }}>
        {/* Timeline header with month labels */}
        <div className="absolute top-0 left-24 right-4 h-8 flex items-center border-b border-gray-700/50">
          {monthLabels.map((month, idx) => (
            <div
              key={idx}
              className="absolute text-xs text-gray-500"
              style={{ left: `${getTimelinePosition(month.date)}%` }}
            >
              {month.label}
            </div>
          ))}
        </div>

        {/* Partner swimlanes */}
        <div className="absolute top-8 left-0 right-0 bottom-0 overflow-y-auto overflow-x-hidden">
          {timelineData.partners.map((partnerData, idx) => (
            <div key={partnerData.partner} className="relative h-12 mb-2 group">
              {/* Partner name */}
              <div className="absolute left-0 w-24 h-full flex items-center">
                <span className={`text-xs truncate pr-2 ${
                  partnerData.relationshipType === 'prime' ? 'text-[#5BC0EB]' : 'text-[#FF4C4C]'
                }`}>
                  {partnerData.relationshipType === 'prime' ? '▲' : '▼'}
                </span>
                <span className="text-xs text-gray-400 truncate" title={partnerData.partner}>
                  {partnerData.partner.length > 12 
                    ? partnerData.partner.substring(0, 10) + '..' 
                    : partnerData.partner}
                </span>
              </div>

              {/* Timeline track */}
              <div className="absolute left-24 right-4 h-full flex items-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-0.5 bg-gray-800/50"></div>
                </div>

                {/* Event bubbles */}
                {partnerData.events.map((event, eventIdx) => {
                  const position = getTimelinePosition(event.date);
                  const size = getBubbleSize(event.value);
                  const color = getBubbleColor(event.status, event.relationshipType);
                  
                  return (
                    <div
                      key={eventIdx}
                      className="absolute flex items-center justify-center transition-all duration-300 hover:scale-110 hover:z-10 cursor-pointer"
                      style={{
                        left: `${position}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        marginLeft: `-${size/2}px`,
                        marginTop: `-${size/2}px`,
                        top: '50%'
                      }}
                      title={`${event.partnerName}\n$${event.value.toFixed(1)}M\n${event.date.toLocaleDateString()}`}
                    >
                      {/* Bubble with glow effect */}
                      <div
                        className="absolute inset-0 rounded-full animate-pulse opacity-50"
                        style={{
                          backgroundColor: color,
                          filter: 'blur(4px)'
                        }}
                      ></div>
                      <div
                        className="relative rounded-full border-2"
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: `${color}33`,
                          borderColor: color
                        }}
                      >
                        {/* Show value for larger bubbles */}
                        {size > 20 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-white" style={{ fontSize: '10px' }}>
                              {event.value < 10 ? event.value.toFixed(1) : Math.round(event.value)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total value on the right */}
              <div className="absolute right-0 h-full flex items-center">
                <span className="text-xs text-[#D2AC38] font-medium">
                  ${partnerData.totalValue.toFixed(1)}M
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-0 left-24 right-4 flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-700/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full border-2 border-[#5BC0EB] bg-[#5BC0EB]/20"></div>
              <span>Prime Partner</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full border-2 border-[#FF4C4C] bg-[#FF4C4C]/20"></div>
              <span>Sub Partner</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-600"></div>
              <span>→</span>
              <div className="w-5 h-5 rounded-full bg-gray-600"></div>
              <span>Size = Contract Value</span>
            </div>
          </div>
          <div className="text-[#D2AC38]">
            Total shown on right
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnershipTimeline;