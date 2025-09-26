/**
 * Obligation Item Header
 *
 * Header section for individual obligation items - preserving exact styling and functionality
 */

import React from 'react';
import { Building2 } from 'lucide-react';
import { NAICSPSCDisplay } from '../../../../shared/NAICSPSCDisplay';
import type { ObligationItemHeaderProps } from './types/obligationCardTypes';
import { formatDate } from '../utils/obligationCardUtils';
import { TemperatureStatusBadge } from './TemperatureStatusBadge';

export const ObligationItemHeader: React.FC<ObligationItemHeaderProps> = ({
  obligation,
  latestActionDate
}) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-lg flex-shrink-0"
          style={{
            backgroundColor: "#223040",
            border: "1px solid #374151"
          }}
        >
          <Building2 className="w-5 h-5 text-orange-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className="font-semibold text-white mb-1 text-lg leading-tight"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            {obligation.recipient_name}
          </h4>
          <p className="text-sm text-gray-400 mb-2">
            Latest Action: {formatDate(latestActionDate)} • Event ID: {obligation.EVENT_ID}
          </p>
          <div className="mb-2">
            <NAICSPSCDisplay
              naics={obligation.naics_code}
              naicsDescription={obligation.naics_description}
              psc={obligation.psc_code}
              size="sm"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <TemperatureStatusBadge actionDate={latestActionDate} />
      </div>
    </div>
  );
};