import React from 'react';
import { HudCard } from './ui/hud-card';
import { GoldengateDoughnutChart } from '../lib/charts';

export const NaicsMixPanel = () => (
  <HudCard variant="default" priority="medium" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
    <div className="p-4 h-full flex flex-col">
      <h3 className="text-gray-200 font-normal tracking-wider mb-4 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
        NAICS MIX
      </h3>
      <div className="flex-1 relative">
        <div style={{height: '240px'}}>
          <GoldengateDoughnutChart
            title="Current Portfolio"
            liveIndicator={true}
            liveText="TRACKING"
            height={240}
            data={{
              labels: ['541511', '541512', '336411', 'Other'],
              datasets: [{
                data: [35, 30, 20, 15],
                backgroundColor: [
                  'rgba(210, 172, 56, 0.25)',
                  'rgba(255, 107, 53, 0.25)',
                  'rgba(78, 201, 176, 0.25)',
                  'rgba(162, 89, 255, 0.25)'
                ],
                hoverBackgroundColor: ['#D2AC38', '#FF6B35', '#4EC9B0', '#A259FF'],
                hoverBorderColor: ['#D2AC38', '#FF6B35', '#4EC9B0', '#A259FF'],
                borderColor: ['#D2AC38', '#FF6B35', '#4EC9B0', '#A259FF'],
                borderWidth: 2,
                hoverBorderWidth: 2,
                cutout: '0%'
              }]
            }}
            options={{
              plugins: { legend: { display: false } }
            }}
          />
        </div>
        <div className="absolute bottom-2 left-2 right-2 text-center">
          <div className="flex justify-center gap-2 font-light" style={{color: '#D2AC38', fontSize: '14px'}}>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5" style={{backgroundColor: '#D2AC38'}}></div>
              <span>541511</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5" style={{backgroundColor: '#FF6B35'}}></div>
              <span>541512</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5" style={{backgroundColor: '#4EC9B0'}}></div>
              <span>336411</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5" style={{backgroundColor: '#A259FF'}}></div>
              <span>Other</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </HudCard>
);

export const PscMixPanel = () => (
  <HudCard variant="default" priority="medium" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
    <div className="p-4 h-full flex flex-col">
      <h3 className="text-gray-200 font-normal tracking-wider mb-4 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
        PSC MIX
      </h3>
      <div className="flex-1 relative">
        <div style={{height: '240px'}}>
          <GoldengateDoughnutChart
            title="Current Portfolio"
            liveIndicator={true}
            liveText="TRACKING"
            height={240}
            data={{
              labels: ['D302', 'R425', 'Y1FZ', 'Other'],
              datasets: [{
                data: [40, 25, 20, 15],
                backgroundColor: [
                  'rgba(210, 172, 56, 0.25)',
                  'rgba(227, 66, 52, 0.25)',
                  'rgba(163, 230, 53, 0.25)',
                  'rgba(236, 72, 153, 0.25)'
                ],
                hoverBackgroundColor: ['#D2AC38', '#E34234', '#A3E635', '#EC4899'],
                hoverBorderColor: ['#D2AC38', '#E34234', '#A3E635', '#EC4899'],
                borderColor: ['#D2AC38', '#E34234', '#A3E635', '#EC4899'],
                borderWidth: 2,
                hoverBorderWidth: 2,
                cutout: '0%'
              }]
            }}
            options={{
              plugins: { legend: { display: false } }
            }}
          />
        </div>
        <div className="absolute bottom-2 left-2 right-2 text-center">
          <div className="flex justify-center gap-2 font-light" style={{color: '#D2AC38', fontSize: '14px'}}>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5" style={{backgroundColor: '#D2AC38'}}></div>
              <span>D302</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5" style={{backgroundColor: '#E34234'}}></div>
              <span>R425</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5" style={{backgroundColor: '#A3E635'}}></div>
              <span>Y1FZ</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5" style={{backgroundColor: '#EC4899'}}></div>
              <span>Other</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </HudCard>
);

export const PipelinePositionPanel = () => (
  <HudCard variant="default" priority="medium" isPanel={true} className="h-full border-gray-700/30 rounded-xl overflow-hidden shadow-2xl hover:border-gray-600/20 transition-all duration-500 group">
    <div className="p-4 h-full flex flex-col">
      <h3 className="text-gray-200 font-normal tracking-wider mb-4 uppercase" style={{ fontFamily: 'Genos, sans-serif', fontSize: '18px' }}>
        PIPELINE POSITION
      </h3>
      <div className="flex-1 relative">
        <div style={{height: '240px'}}>
          <GoldengateDoughnutChart
            title="Current Portfolio"
            liveIndicator={true}
            liveText="TRACKING"
            height={240}
            data={{
              labels: ['Remaining', 'Subcontracted', 'Executed'],
              datasets: [{
                data: [45, 25, 30],
                backgroundColor: [
                  'rgba(210, 172, 56, 0.25)',
                  'rgba(255, 76, 76, 0.25)',
                  'rgba(91, 192, 235, 0.25)'
                ],
                hoverBackgroundColor: ['#D2AC38', '#FF4C4C', '#5BC0EB'],
                hoverBorderColor: ['#D2AC38', '#FF4C4C', '#5BC0EB'],
                borderColor: ['#D2AC38', '#FF4C4C', '#5BC0EB'],
                borderWidth: 2,
                hoverBorderWidth: 2,
                cutout: '60%'
              }]
            }}
            options={{
              plugins: { legend: { display: false } }
            }}
          />
        </div>
        <div className="absolute bottom-2 left-2 right-2 text-center">
          <div className="flex justify-center gap-2 font-light" style={{color: '#D2AC38', fontSize: '14px'}}>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5" style={{backgroundColor: '#5BC0EB'}}></div>
              <span>Executed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5" style={{backgroundColor: '#FF4C4C'}}></div>
              <span>Subcontracted</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5" style={{backgroundColor: '#D2AC38'}}></div>
              <span>Remaining</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </HudCard>
);