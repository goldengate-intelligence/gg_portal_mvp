import React from 'react';
import { Plane, Shield, Factory, Building, Truck, Zap } from 'lucide-react';

interface AssetCardProps {
  companyName: string;
  companyImage?: string;
  naicsDescription: string;
  marketType: 'civilian' | 'defense';
  uei: string;
  activeAwards: {
    value: string;
  };
  onClick?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDrop?: () => void;
}

// Map NAICS descriptions to primary industry tags (2-digit NAICS groups)
const getPrimaryIndustryTag = (naicsDescription: string, companyName: string) => {
  const desc = naicsDescription.toLowerCase();
  const company = companyName.toLowerCase();

  if (company.includes('lockheed') || desc.includes('aerospace') || desc.includes('aircraft') || desc.includes('aviation')) {
    return 'Defense & Aerospace';
  }
  if (desc.includes('manufacturing') || desc.includes('fabricat') || desc.includes('produc')) {
    return 'Manufacturing';
  }
  if (desc.includes('construction') || desc.includes('building') || desc.includes('real estate')) {
    return 'Construction';
  }
  if (desc.includes('transportation') || desc.includes('logistics') || desc.includes('shipping')) {
    return 'Transportation';
  }
  if (desc.includes('energy') || desc.includes('power') || desc.includes('electric')) {
    return 'Energy & Utilities';
  }
  if (desc.includes('professional') || desc.includes('technical') || desc.includes('computer') || desc.includes('service')) {
    return 'Professional Services';
  }
  if (desc.includes('information') || desc.includes('technology') || desc.includes('software')) {
    return 'Information Technology';
  }

  return 'Other Services';
};

// Map NAICS descriptions to industry images
const getIndustryImage = (naicsDescription: string, companyName: string) => {
  const desc = naicsDescription.toLowerCase();
  const company = companyName.toLowerCase();

  if (company.includes('lockheed') || desc.includes('aerospace') || desc.includes('aircraft') || desc.includes('aviation')) {
    return '/gg_industry_images/1_defense.jpg';
  }
  if (desc.includes('manufacturing') || desc.includes('fabricat') || desc.includes('produc')) {
    return '/gg_industry_images/6_manufacturing.jpg';
  }
  if (desc.includes('construction') || desc.includes('building') || desc.includes('real estate')) {
    return '/gg_industry_images/3_construction.jpg';
  }
  if (desc.includes('transportation') || desc.includes('logistics') || desc.includes('shipping')) {
    return '/gg_industry_images/9_transportation.jpg';
  }
  if (desc.includes('energy') || desc.includes('power') || desc.includes('electric')) {
    return '/gg_industry_images/12_energy.jpg';
  }
  if (desc.includes('professional') || desc.includes('technical') || desc.includes('computer') || desc.includes('service')) {
    return '/gg_industry_images/4_professionalservices.jpg';
  }

  // Default fallback
  return '/gg_industry_images/16_other.jpg';
};

export function AssetCardNew({
  companyName,
  companyImage,
  naicsDescription,
  marketType,
  uei,
  activeAwards,
  onClick,
  onDragStart,
  onDragEnd,
  onDrop
}: AssetCardProps) {
  const industryImageSrc = getIndustryImage(naicsDescription, companyName);
  const primaryIndustryTag = getPrimaryIndustryTag(naicsDescription, companyName);

  // Generate dynamic company initials and colors
  const getCompanyInitials = (name: string) => {
    if (name.includes('Trio')) return 'TFL';
    if (name.includes('Raytheon')) return 'RTX';
    if (name.includes('BAE')) return 'BAE';
    if (name.includes('Applied')) return 'ACI';
    return name.split(' ').map(word => word.charAt(0)).join('').slice(0, 3);
  };

  const getCardTheme = (name: string) => {
    if (name.includes('Trio')) return {
      accent: '#D2AC38',
      progress: 'from-[#D2AC38] to-green-400',
      fill: '75%'
    };
    if (name.includes('Raytheon')) return {
      accent: '#3B82F6',
      progress: 'from-blue-500 to-purple-500',
      fill: '90%'
    };
    if (name.includes('BAE')) return {
      accent: '#EF4444',
      progress: 'from-red-500 to-orange-500',
      fill: '85%'
    };
    if (name.includes('Applied')) return {
      accent: '#10B981',
      progress: 'from-emerald-500 to-teal-500',
      fill: '60%'
    };
    return {
      accent: '#6B7280',
      progress: 'from-gray-500 to-slate-500',
      fill: '50%'
    };
  };

  const getRandomMetrics = (name: string) => {
    if (name.includes('Trio')) return { revenue: '$125M', lifetime: '$890M', pipeline: '$280M' };
    if (name.includes('Raytheon')) return { revenue: '$2.1B', lifetime: '$45B', pipeline: '$8.5B' };
    if (name.includes('BAE')) return { revenue: '$1.8B', lifetime: '$28B', pipeline: '$3.2B' };
    if (name.includes('Applied')) return { revenue: '$180M', lifetime: '$1.2B', pipeline: '$450M' };
    return { revenue: '$100M', lifetime: '$500M', pipeline: '$200M' };
  };

  const initials = getCompanyInitials(companyName);
  const theme = getCardTheme(companyName);
  const metrics = getRandomMetrics(companyName);

  // Square card layout for all companies
  return (
    <div
      className="bg-black/40 border border-[#D2AC38]/30 rounded-xl hover:border-[#D2AC38]/50 transition-all duration-300 cursor-move overflow-hidden relative shadow-lg hover:shadow-xl"
      style={{ width: '100%', height: '220px' }}
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
          companyName,
          uei,
          marketType,
          naicsDescription
        }));
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.5';
        if (onDragStart) onDragStart();
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.opacity = '1';
        if (onDragEnd) onDragEnd();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.style.borderColor = '#D2AC38';
      }}
      onDragLeave={(e) => {
        e.currentTarget.style.borderColor = '';
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.style.borderColor = '';
        if (onDrop) onDrop();
      }}
      onClick={onClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, ${theme.accent}22 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, ${theme.accent}15 0%, transparent 50%)`
        }} />
      </div>

      {/* Header Section */}
      <div className="relative p-4 bg-gradient-to-br from-gray-900/90 via-gray-800/70 to-gray-900/50 h-28">
        {/* Company Logo & Info */}
        <div className="flex items-start justify-between h-full">
          <div className="flex items-start gap-4">
            {/* Logo Square */}
            <div className="w-20 h-20 bg-gray-700/50 rounded-lg border border-gray-600/30 flex items-center justify-center flex-shrink-0">
              <span className="text-gray-300 text-lg font-bold">
                {initials}
              </span>
            </div>

            {/* Company Info */}
            <div className="flex flex-col justify-center h-20">
              <h3
                className="text-white font-bold text-lg leading-tight hover:text-[#D2AC38] transition-colors cursor-pointer mb-2"
                draggable={false}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (onClick) onClick();
                }}
              >
                {companyName.split(' ').slice(0, 2).join(' ')}
              </h3>

              {/* Industry Tag and Icons Row */}
              <div className="flex items-center gap-3">
                <span className="inline-block px-3 py-1 bg-[#D2AC38]/20 text-[#F4D03F] text-xs rounded-full border border-[#D2AC38]/40 uppercase tracking-wide font-medium">
                  {primaryIndustryTag}
                </span>

                {/* Action Icons */}
                <div className="flex gap-1">
                  {/* AI Chat Icon */}
                  <div className="p-1 bg-blue-500/20 border border-blue-500/40 rounded hover:bg-blue-500/30 transition-colors cursor-pointer group">
                    <svg className="w-3 h-3 text-blue-400 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>

                  {/* Document Attachment Icon */}
                  <div className="p-1 bg-gray-500/20 border border-gray-500/40 rounded hover:bg-gray-500/30 transition-colors cursor-pointer group">
                    <svg className="w-3 h-3 text-gray-400 group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </div>

                  {/* Performance Indicator */}
                  <div className="p-1 bg-[#84cc16]/20 border border-[#84cc16]/40 rounded">
                    <svg className="w-3 h-3 text-[#84cc16]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>

                  {/* Alert/Hot Indicator */}
                  <div className="p-1 bg-red-500/20 border border-red-500/40 rounded">
                    <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Industry Image */}
          <div className="w-20 h-20 bg-gray-700/50 rounded-lg border border-gray-600/30 overflow-hidden flex-shrink-0">
            <img
              src={industryImageSrc}
              alt="Industry"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 relative z-10">
        {/* Financial Metrics Grid - NO ICONS */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-800/30 rounded p-1.5 border border-gray-700/30 text-center">
            <span className="text-gray-400 text-xs uppercase block mb-1">Active</span>
            <span className="text-[#FFB84D] font-bold text-lg block">{activeAwards.value}</span>
          </div>
          <div className="bg-gray-800/30 rounded p-1.5 border border-gray-700/30 text-center">
            <span className="text-gray-400 text-xs uppercase block mb-1">Revenue</span>
            <span className="text-green-400 font-bold text-lg block">{metrics.revenue}</span>
          </div>
          <div className="bg-gray-800/30 rounded p-1.5 border border-gray-700/30 text-center">
            <span className="text-gray-400 text-xs uppercase block mb-1">Lifetime</span>
            <span className="text-blue-400 font-bold text-lg block">{metrics.lifetime}</span>
          </div>
          <div className="bg-gray-800/30 rounded p-1.5 border border-gray-700/30 text-center">
            <span className="text-gray-400 text-xs uppercase block mb-1">Pipeline</span>
            <span className="text-purple-400 font-bold text-lg block">{metrics.pipeline}</span>
          </div>
        </div>
      </div>
    </div>
  );
}