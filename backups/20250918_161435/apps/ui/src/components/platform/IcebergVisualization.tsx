import React from 'react';
import { formatCurrency } from '../../utils/contractor-profile-transform';

interface IcebergVisualizationProps {
  contractorName: string;
  primeRevenue: number;
  subRevenue: number;
  totalRevenue: number;
  icebergScore: number;
  hiddenPercentage: number;
  subToPrimeRatio?: number;
}

export function IcebergVisualization({
  contractorName,
  primeRevenue,
  subRevenue,
  totalRevenue,
  icebergScore,
  hiddenPercentage,
  subToPrimeRatio
}: IcebergVisualizationProps) {
  
  // Calculate tier breakdowns (approximate based on typical distribution)
  const tier1 = subRevenue * 0.35;  // Direct to prime
  const tier2 = subRevenue * 0.30;  // Tier 2 subs
  const tier3 = subRevenue * 0.20;  // Tier 3 subs
  const tier4 = subRevenue * 0.10;  // Tier 4 subs
  const tier5 = subRevenue * 0.05;  // Deep supply chain

  // Add floating animation styles
  React.useEffect(() => {
    const styleId = 'iceberg-float-animation';
    
    // Check if style already exists
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Cleanup on unmount
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto p-6 bg-gradient-to-b from-gray-900 to-black rounded-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
          {contractorName.toUpperCase()}
        </h2>
        <p className="text-gray-400 text-sm">
          {hiddenPercentage.toFixed(0)}% of revenue hidden • {subToPrimeRatio ? `${subToPrimeRatio.toFixed(1)}x more sub than prime` : 'Significant subcontractor activity'} • Score: {icebergScore}/100
        </p>
      </div>

      {/* Example text */}
      <div className="absolute top-32 right-8 text-xs text-gray-500 italic max-w-[200px] text-right">
        <strong className="text-yellow-400 block mb-1">Real Data:</strong>
        {contractorName} shows {formatCurrency(primeRevenue)} in prime contracts but has {formatCurrency(subRevenue)} in subcontracts
      </div>

      {/* Iceberg Container */}
      <div className="relative w-full h-[650px] flex items-center justify-center">
        {/* Water line */}
        <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent top-[22%] z-10 shadow-[0_0_20px_rgba(255,215,0,0.5)]">
          <span className="absolute left-5 -top-6 text-yellow-400 text-[10px] font-bold tracking-wider opacity-70">
            VISIBLE
          </span>
          <span className="absolute left-5 top-3 text-yellow-400 text-[10px] font-bold tracking-wider opacity-70">
            HIDDEN
          </span>
        </div>

        {/* SVG Iceberg */}
        <svg className="w-full max-w-[600px] h-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-float" 
             viewBox="0 0 400 600" 
             xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Gradients */}
            <linearGradient id="aboveWater" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#F5FBFF', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#D0E7FF', stopOpacity: 1}} />
            </linearGradient>
            
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#87CEEB', stopOpacity: 0.95}} />
              <stop offset="100%" style={{stopColor: '#6BB6DE', stopOpacity: 0.95}} />
            </linearGradient>
            
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#5FA8D3', stopOpacity: 0.9}} />
              <stop offset="100%" style={{stopColor: '#4A90E2', stopOpacity: 0.9}} />
            </linearGradient>
            
            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#3A7BC8', stopOpacity: 0.85}} />
              <stop offset="100%" style={{stopColor: '#2E5C8A', stopOpacity: 0.85}} />
            </linearGradient>
            
            <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#254E70', stopOpacity: 0.8}} />
              <stop offset="100%" style={{stopColor: '#1A3A52', stopOpacity: 0.8}} />
            </linearGradient>
            
            <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#152A3E', stopOpacity: 0.75}} />
              <stop offset="100%" style={{stopColor: '#0F1E2E', stopOpacity: 0.75}} />
            </linearGradient>
          </defs>

          {/* ABOVE WATER - Tiny visible tip (Prime contracts) */}
          <polygon points="200,80 185,130 195,132 205,131 215,133 212,130" 
                   fill="url(#aboveWater)" 
                   stroke="#D0E7FF" 
                   strokeWidth="1"/>

          {/* BELOW WATER - Massive hidden portion */}
          
          {/* Layer 1 - Just below surface (Tier 1 Prime Subs) */}
          <polygon points="185,132 215,133 235,180 240,210 160,210 165,180" 
                   fill="url(#grad1)" 
                   stroke="#6BB6DE" 
                   strokeWidth="0.5"/>

          {/* Layer 2 - Upper hidden (Tier 2 Subs) */}
          <polygon points="160,210 240,210 265,260 270,300 135,300 130,260" 
                   fill="url(#grad2)" 
                   stroke="#4A90E2" 
                   strokeWidth="0.5"/>

          {/* Layer 3 - Middle hidden (Tier 3 Subs) */}
          <polygon points="135,300 270,300 290,360 295,400 110,400 105,360" 
                   fill="url(#grad3)" 
                   stroke="#2E5C8A" 
                   strokeWidth="0.5"/>

          {/* Layer 4 - Deep hidden (Tier 4 Subs) */}
          <polygon points="110,400 295,400 305,460 300,490 100,490 95,460" 
                   fill="url(#grad4)" 
                   stroke="#1A3A52" 
                   strokeWidth="0.5"/>

          {/* Layer 5 - Deepest hidden (Deep Supply Chain) */}
          <polygon points="100,490 300,490 280,540 200,560 120,540" 
                   fill="url(#grad5)" 
                   stroke="#0F1E2E" 
                   strokeWidth="0.5"/>

          {/* Internal facets for low-poly look */}
          <line x1="200" y1="80" x2="195" y2="132" stroke="#C0D8FF" strokeWidth="0.3" opacity="0.5"/>
          <line x1="200" y1="80" x2="205" y2="131" stroke="#C0D8FF" strokeWidth="0.3" opacity="0.5"/>
          
          <line x1="185" y1="132" x2="175" y2="210" stroke="#6BB6DE" strokeWidth="0.3" opacity="0.5"/>
          <line x1="215" y1="133" x2="225" y2="210" stroke="#6BB6DE" strokeWidth="0.3" opacity="0.5"/>
          <line x1="200" y1="132" x2="200" y2="210" stroke="#6BB6DE" strokeWidth="0.3" opacity="0.5"/>
          
          <line x1="160" y1="210" x2="150" y2="300" stroke="#5FA8D3" strokeWidth="0.3" opacity="0.5"/>
          <line x1="240" y1="210" x2="250" y2="300" stroke="#5FA8D3" strokeWidth="0.3" opacity="0.5"/>
          <line x1="200" y1="210" x2="200" y2="300" stroke="#5FA8D3" strokeWidth="0.3" opacity="0.5"/>
          
          <line x1="135" y1="300" x2="125" y2="400" stroke="#3A7BC8" strokeWidth="0.3" opacity="0.5"/>
          <line x1="270" y1="300" x2="280" y2="400" stroke="#3A7BC8" strokeWidth="0.3" opacity="0.5"/>
          <line x1="200" y1="300" x2="200" y2="400" stroke="#3A7BC8" strokeWidth="0.3" opacity="0.5"/>
          
          <line x1="110" y1="400" x2="105" y2="490" stroke="#254E70" strokeWidth="0.3" opacity="0.5"/>
          <line x1="295" y1="400" x2="295" y2="490" stroke="#254E70" strokeWidth="0.3" opacity="0.5"/>
          <line x1="200" y1="400" x2="200" y2="490" stroke="#254E70" strokeWidth="0.3" opacity="0.5"/>
        </svg>

        {/* Labels with dynamic data */}
        
        {/* Prime Revenue Label */}
        <div className="absolute top-[15%] right-[52%] flex items-center text-[#87CEEB]">
          <div className="text-right">
            <span className="text-xs uppercase tracking-wider block">Prime Contracts</span>
            <span className="text-lg font-bold text-yellow-400">{formatCurrency(primeRevenue)}</span>
          </div>
          <div className="w-24 h-0.5 bg-current mx-4"></div>
          <div className="w-6 h-6 bg-[#87CEEB] text-black rounded-full flex items-center justify-center text-xs font-bold">
            P
          </div>
        </div>

        {/* Tier 1 Label */}
        <div className="absolute top-[35%] left-[58%] flex items-center text-[#5FA8D3]">
          <div className="w-8 h-8 bg-[#5FA8D3] text-black rounded-full flex items-center justify-center font-bold">
            1
          </div>
          <div className="w-20 h-0.5 bg-current mx-4"></div>
          <div>
            <span className="text-xs uppercase tracking-wider block">Direct to Prime</span>
            <span className="text-lg font-bold text-yellow-400">{formatCurrency(tier1)}</span>
          </div>
        </div>

        {/* Tier 2 Label */}
        <div className="absolute top-[48%] right-[52%] flex items-center text-[#4A90E2]">
          <div className="text-right">
            <span className="text-xs uppercase tracking-wider block">Tier 2 Subs</span>
            <span className="text-lg font-bold text-yellow-400">{formatCurrency(tier2)}</span>
          </div>
          <div className="w-28 h-0.5 bg-current mx-4"></div>
          <div className="w-8 h-8 bg-[#4A90E2] text-white rounded-full flex items-center justify-center font-bold">
            2
          </div>
        </div>

        {/* Tier 3 Label */}
        <div className="absolute top-[62%] left-[60%] flex items-center text-[#2E5C8A]">
          <div className="w-8 h-8 bg-[#2E5C8A] text-white rounded-full flex items-center justify-center font-bold">
            3
          </div>
          <div className="w-24 h-0.5 bg-current mx-4"></div>
          <div>
            <span className="text-xs uppercase tracking-wider block">Tier 3 Subs</span>
            <span className="text-lg font-bold text-yellow-400">{formatCurrency(tier3)}</span>
          </div>
        </div>

        {/* Tier 4 Label */}
        <div className="absolute top-[76%] right-[54%] flex items-center text-[#1A3A52]">
          <div className="text-right">
            <span className="text-xs uppercase tracking-wider block">Tier 4 Subs</span>
            <span className="text-lg font-bold text-yellow-400">{formatCurrency(tier4)}</span>
          </div>
          <div className="w-28 h-0.5 bg-current mx-4"></div>
          <div className="w-8 h-8 bg-[#1A3A52] text-white rounded-full flex items-center justify-center font-bold">
            4
          </div>
        </div>

        {/* Tier 5 Label */}
        <div className="absolute top-[88%] left-[58%] flex items-center text-[#0F1E2E]">
          <div className="w-8 h-8 bg-[#0F1E2E] text-white rounded-full flex items-center justify-center font-bold">
            5
          </div>
          <div className="w-20 h-0.5 bg-current mx-4"></div>
          <div>
            <span className="text-xs uppercase tracking-wider block">Deep Supply</span>
            <span className="text-lg font-bold text-yellow-400">{formatCurrency(tier5)}</span>
          </div>
        </div>
      </div>

      {/* Stats at bottom */}
      <div className="grid grid-cols-4 gap-4 mt-8 p-6 bg-gray-900/90 rounded-lg border border-gray-800">
        <div className="text-center">
          <span className="block text-3xl font-bold text-yellow-400">
            {formatCurrency(subRevenue)}
          </span>
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            Total Hidden Revenue
          </span>
        </div>
        <div className="text-center">
          <span className="block text-3xl font-bold text-yellow-400">
            {formatCurrency(primeRevenue)}
          </span>
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            Visible Revenue
          </span>
        </div>
        <div className="text-center">
          <span className="block text-3xl font-bold text-yellow-400">
            {hiddenPercentage.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            Revenue Hidden
          </span>
        </div>
        <div className="text-center">
          <span className="block text-3xl font-bold text-yellow-400">
            {icebergScore}/100
          </span>
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            Iceberg Score
          </span>
        </div>
      </div>
    </div>
  );
}