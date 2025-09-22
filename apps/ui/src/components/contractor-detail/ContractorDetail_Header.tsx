import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { CONTRACTOR_DETAIL_COLORS } from '../../logic/utils';
import type { Contractor } from '../../types';

interface ContractorDetailHeaderProps {
  contractor: Contractor | null;
}

export function ContractorDetailHeader({ contractor }: ContractorDetailHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* Grid container with two separate panels */}
      <div className="grid grid-cols-4 gap-6 h-full">
        {/* Photo Panel - 1 column */}
        <div className="col-span-1">
          <div className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 relative p-3 border border-gray-700/50 hover:border-gray-600/40">
            {/* Gradient background matching financial metric cards */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl"></div>
            <div className="relative z-10">
              <div className="relative">
                {/* Company Logo with HUD overlay */}
                <div className="w-full aspect-square border border-[#D2AC38]/50 hover:border-[#D2AC38]/70 transition-all duration-500 rounded-lg overflow-hidden relative" style={{ backgroundColor: '#010204' }}>
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #010204CC, #01020499)' }} />
                  <div className="flex items-center justify-center h-full p-6">
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      {/* TFL Logo */}
                      <div className="font-black tracking-wider text-gray-200" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '62px' }}>
                        TFL
                      </div>
                      <div className="text-xs font-semibold tracking-[0.3em] text-gray-400 mt-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        TRIO FABRICATION
                      </div>
                      <div className="text-xs font-normal tracking-[0.4em] text-gray-500" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        LLC
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Panel - 3 columns */}
        <div className="col-span-3">
          <div className="h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 relative p-6 border border-gray-700/50 hover:border-gray-600/40">
            {/* Gradient background matching financial metric cards */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-800/25 to-gray-900/50 rounded-xl"></div>
            <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl text-white tracking-wide font-sans" style={{ fontWeight: '250' }}>
                  {contractor?.name || 'Trio Fabrication LLC'}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-[#D2AC38] border border-gray-800 hover:border-gray-600/30"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>

            {/* Website and Bubbles */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[#D2AC38] font-sans font-normal" style={{ fontSize: '16px' }}>www.website.com</span>
              <div className="relative group">
                <span className="px-1.5 py-0.5 bg-gray-500/20 border border-gray-500/40 rounded-full uppercase tracking-wider text-gray-400 font-sans font-normal" style={{ fontSize: '10px' }}>{contractor?.uei || 'UNKNOWN12345'}</span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  <div className="text-center font-medium">UEI Number</div>
                </div>
              </div>
              <div className="relative group">
                <span className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/40 rounded-full uppercase tracking-wider text-red-400 font-sans font-normal" style={{ fontSize: '10px' }}>Hot</span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  <div className="text-center font-medium">Award Activity ≤30 Days</div>
                </div>
              </div>
              <div className="relative group">
                <span className="px-1.5 py-0.5 bg-[#84cc16]/20 border border-[#84cc16]/40 rounded-full uppercase tracking-wider text-[#84cc16] font-sans font-normal" style={{ fontSize: '10px' }}>Strong</span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  <div className="text-center font-medium">Performance Tier</div>
                </div>
              </div>
            </div>

            <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mb-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Defense contractor specializing in structural metal manufacturing and fabrication.
            </p>

            {/* Location/Sector/Agency Grid - Flat with HUD accents */}
            <div className="grid grid-cols-6 gap-8 mb-8">
              <div className="col-span-2">
                <div className="font-light uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px', color: '#D2AC38' }}>LOCATION</div>
                <div className="text-lg text-white font-light">
                  {contractor?.city && contractor?.state
                    ? contractor.state === 'DC'
                      ? `${contractor.city}, DC`
                      : `${contractor.city}, ${contractor.state}`
                    : contractor?.state === 'DC'
                      ? 'Washington, DC'
                      : `${contractor?.state || 'Texas'}, USA`}
                </div>
              </div>
              <div className="col-span-2">
                <div className="font-light uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px', color: '#D2AC38' }}>SECTOR</div>
                <div className="text-lg text-white font-light">{contractor?.industry?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Manufacturing'}</div>
              </div>
              <div className="col-span-2">
                <div className="font-light uppercase tracking-wider" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px', color: '#D2AC38' }}>AGENCY FOCUS</div>
                <div className="text-lg text-white font-light">{contractor?.primaryAgency || 'Defense'}</div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}