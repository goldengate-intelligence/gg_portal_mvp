/**
 * Award Card Header
 *
 * Header section with title and back button
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Terminology } from './types/awardCardTypes';

interface AwardCardHeaderProps {
  title: string;
  relationshipName: string;
  terminology: Terminology;
  onBack: () => void;
}

export const AwardCardHeader: React.FC<AwardCardHeaderProps> = ({
  title,
  relationshipName,
  terminology,
  onBack
}) => {
  return (
    <div className="flex items-center mb-6">
      <button
        onClick={onBack}
        className="mr-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="flex-1">
        <h2
          className="text-2xl font-bold text-white mb-1"
          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        >
          {title}
        </h2>
        <p className="text-sm text-gray-400">
          <span className="text-orange-400 font-medium">{relationshipName}</span>
          {" • "}
          {terminology.items}
        </p>
      </div>
    </div>
  );
};