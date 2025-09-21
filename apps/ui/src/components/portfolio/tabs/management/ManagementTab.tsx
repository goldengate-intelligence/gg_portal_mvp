import React, { useState } from 'react';
import { AssetCardNew } from '../../AssetCardNew';

// Design Framework Components - Indigo Theme
const ExternalPanelContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="h-full border border-[#8B8EFF]/30 rounded-xl overflow-hidden shadow-2xl hover:border-[#8B8EFF]/50 transition-all duration-500 group relative bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 backdrop-blur-sm">
    {/* Animated background grid */}
    <div className="absolute inset-0 opacity-5 z-0">
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(90deg, #8B8EFF 1px, transparent 1px),
          linear-gradient(180deg, #8B8EFF 1px, transparent 1px)
        `,
        backgroundSize: '15px 15px'
      }} />
    </div>

    {/* Glow effect on hover */}
    <div className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-0"
         style={{ background: 'linear-gradient(135deg, #8B8EFF20, transparent)' }} />

    {children}
  </div>
);

// Chart-Style Container
// IMPORTANT: OFFICIAL GUNMETAL COLOR = #223040
const ChartStyleContainer = ({ children }: { children: React.ReactNode }) => (
  <div
    className="rounded-lg p-4"
    style={{
      backgroundColor: '#223040'
    }}
  >
    {children}
  </div>
);

const InternalContentContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 h-full flex flex-col relative z-10">
    {children}
  </div>
);

const PanelTitle = ({ children }: { children: React.ReactNode }) => (
  <h3
    className="text-gray-200 font-normal uppercase tracking-wider"
    style={{
      fontFamily: 'Genos, sans-serif',
      fontSize: '18px',
      letterSpacing: '0.0125em'
    }}
  >
    {children}
  </h3>
);

export function ManagementTab() {
  const [assets, setAssets] = useState([
    {
      id: 'TFL123456789',
      companyName: 'Trio Fabrication LLC',
      naicsDescription: 'Fabricated Plate Work Manufacturing',
      marketType: 'defense' as const,
      uei: 'TFL123456789',
      activeAwards: { value: '$50M' }
    },
    {
      id: 'RAY987654321',
      companyName: 'Raytheon Technologies',
      naicsDescription: 'Guided Missile and Space Vehicle Manufacturing',
      marketType: 'defense' as const,
      uei: 'RAY987654321',
      activeAwards: { value: '$1.8B' }
    },
    {
      id: 'BAE456789123',
      companyName: 'BAE Systems Inc',
      naicsDescription: 'Military Armored Vehicle Manufacturing',
      marketType: 'defense' as const,
      uei: 'BAE456789123',
      activeAwards: { value: '$920M' }
    },
    {
      id: 'ACI789123456',
      companyName: 'Applied Composites Inc',
      naicsDescription: 'Aircraft Parts and Equipment Manufacturing',
      marketType: 'civilian' as const,
      uei: 'ACI789123456',
      activeAwards: { value: '$85M' }
    }
  ]);

  const [draggedAsset, setDraggedAsset] = useState<string | null>(null);

  const handleDragStart = (assetId: string) => {
    setDraggedAsset(assetId);
  };

  const handleDragEnd = () => {
    setDraggedAsset(null);
  };

  const handleDrop = (targetId: string) => {
    if (!draggedAsset || draggedAsset === targetId) return;

    const draggedIndex = assets.findIndex(asset => asset.id === draggedAsset);
    const targetIndex = assets.findIndex(asset => asset.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newAssets = [...assets];
    const [draggedItem] = newAssets.splice(draggedIndex, 1);
    newAssets.splice(targetIndex, 0, draggedItem);

    setAssets(newAssets);
  };

  return (
    <div className="min-h-[500px]">
      {/* Asset Management Activity - Full Width */}
      <ExternalPanelContainer>
        <InternalContentContainer>
          {/* Header Section */}
          <div className="mb-4">
            <PanelTitle>ASSET MANAGEMENT</PanelTitle>
          </div>

          {/* Content Section */}
          <div className="flex-1">
            {/* Chart-Style Container */}
            <ChartStyleContainer>
              {/* Chart Header */}
              <div className="relative h-full">
                {/* Title */}
                <div className="absolute top-0 left-0 z-10">
                  <h3 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                    My Portfolio
                  </h3>
                </div>

                {/* Live Indicator */}
                <div className="absolute top-0 right-0 z-10 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                  <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                    TRACKING
                  </span>
                </div>

                {/* Content */}
                <div className="pt-8">
                  <div className="grid grid-cols-1 gap-4">
                    {assets.map((asset) => (
                      <AssetCardNew
                        key={asset.id}
                        companyName={asset.companyName}
                        naicsDescription={asset.naicsDescription}
                        marketType={asset.marketType}
                        uei={asset.uei}
                        activeAwards={asset.activeAwards}
                        onDragStart={() => handleDragStart(asset.id)}
                        onDragEnd={handleDragEnd}
                        onDrop={() => handleDrop(asset.id)}
                        onClick={() => {
                          window.location.href = `/platform/contractor-detail/${asset.uei}`;
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </ChartStyleContainer>
          </div>
        </InternalContentContainer>
      </ExternalPanelContainer>
    </div>
  );
}