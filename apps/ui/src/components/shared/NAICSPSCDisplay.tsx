import React from 'react';
import { useNAICSDescription, usePSCDescription } from '../../services/reference-data';

interface NAICSPSCDisplayProps {
  naicsCode?: string;
  pscCode?: string;
  layout?: 'inline' | 'stacked';
  showLabels?: boolean;
  className?: string;
}

export function NAICSPSCDisplay({
  naicsCode,
  pscCode,
  layout = 'stacked',
  showLabels = true,
  className = "font-normal text-gray-500 text-xs"
}: NAICSPSCDisplayProps) {
  const { description: naicsDescription, isLoading: naicsLoading } = useNAICSDescription(naicsCode);
  const { description: pscDescription, isLoading: pscLoading } = usePSCDescription(pscCode);

  if (layout === 'inline') {
    return (
      <div className={className}>
        {showLabels && <span>NAICS:</span>} {naicsCode || 'N/A'}
        {naicsLoading && <span className="ml-1 text-gray-400">...</span>}
        {naicsDescription && <span className="ml-1 text-gray-400 italic">({naicsDescription})</span>}
        {' • '}
        {showLabels && <span>PSC:</span>} {pscCode || 'N/A'}
        {pscLoading && <span className="ml-1 text-gray-400">...</span>}
        {pscDescription && <span className="ml-1 text-gray-400 italic">({pscDescription})</span>}
      </div>
    );
  }

  // Stacked layout (default)
  return (
    <div className={className}>
      <div className="flex flex-col gap-1">
        {naicsCode && (
          <div className="text-[#F97316]">
            <span>NAICS: {naicsCode}</span>
            {naicsLoading && <span className="ml-1 text-gray-400">...</span>}
            {naicsDescription && (
              <span className="ml-1">• {naicsDescription}</span>
            )}
          </div>
        )}
        {pscCode && (
          <div className="text-gray-400">
            <span>PSC: {pscCode}</span>
            {pscLoading && <span className="ml-1">...</span>}
            {pscDescription && (
              <span className="ml-1">• {pscDescription}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}