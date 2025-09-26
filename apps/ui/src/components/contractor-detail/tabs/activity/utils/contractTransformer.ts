/**
 * Contract Transformer
 *
 * Transforms raw contract data into Event format for AwardCardView
 */

import type { Event } from '../components/types/awardCardTypes';
import { parseValue, formatDateForEvent } from './awardCardUtils';

/**
 * Transform relationship contracts into Event format for display
 */
export const transformContractsToEvents = (relationship: any): Event[] => {
  if (!relationship?.contracts) return [];

  return relationship.contracts.map((contract: any, index: number): Event => ({
    AWARD_KEY: contract.id || `AWARD_${index}`,
    EVENT_DATE: formatDateForEvent(contract.start),
    award_key: contract.id || `AWARD_${index}`,
    event_type: contract.role === 'prime' ? "PRIME" : "SUBAWARD",
    event_date: formatDateForEvent(contract.start),
    recipient_name: contract.client || "Unknown Recipient",
    recipient_uei: `UEI_${index.toString().padStart(9, '0')}`, // Generate placeholder UEI
    event_amount: parseValue(contract.currentValue),
    prime_contractor_name: contract.role === 'sub' ? contract.subTo : null,
    awarding_agency_name: contract.clientType === 'agency' ? contract.client : "Unknown Agency",
    awarding_sub_agency_name: contract.clientType === 'agency' ? "Sub-agency" : "",
    naics_code: contract.naics || "000000",
    naics_description: contract.desc || "Professional Services",
    recipient_state: "Unknown", // Not available in Contract interface
    pop_state: "Unknown", // Not available in Contract interface
    contract_total_value: parseValue(contract.totalValue),
    award_piid: contract.id || `PIID_${index}`,
    action_type: contract.mods > 1 ? "MOD" : "NEW",
    fiscal_year: new Date().getFullYear(),
    extent_competed: "UNKNOWN", // Not available in Contract interface
    contract_pricing_type: contract.type || "UNKNOWN",
    small_business_flags: [], // Not available in Contract interface
    parent_company_name: null, // Not available in Contract interface
    start_date: contract.start || "",
    end_date: contract.end || "",
    utilization: contract.utilization || 0,
    psc_code: contract.psc || "",
    ai_description: contract.desc || "Professional contract services"
  }));
};