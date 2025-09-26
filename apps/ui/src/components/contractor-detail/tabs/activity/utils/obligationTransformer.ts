/**
 * Obligation Transformer
 *
 * Transforms ActivityEvent data to ObligationEvent format - preserving exact business logic
 */

import type { ActivityEvent, ObligationEvent } from '../components/types/obligationCardTypes';
import {
  calculateOutlays,
  getRecipientCount,
  getUtilizationPercentage,
  generateEventKey
} from './obligationCardUtils';

/**
 * Transform activity events to obligation events - exact same logic as original
 */
export const transformActivityToObligationEvents = (
  activityEvents: ActivityEvent[],
  contractId: string,
  originContainer?: "inflow" | "outflow"
): ObligationEvent[] => {
  // Filter events for this specific contract and flow direction - exact same logic
  const filteredEvents = activityEvents.filter(event =>
    event.contract_id === contractId &&
    (originContainer === "outflow" ? event.flow_direction === "outflow" : event.flow_direction === "inflow")
  );

  // Transform to ObligationEvent format - preserving exact transformation logic
  const obligations = filteredEvents.map((event, index): ObligationEvent => ({
    event_id: generateEventKey(event, index),
    EVENT_ID: event.EVENT_ID,
    event_type: "PRIME", // Simplified classification as in original
    event_date: event.event_date || new Date().toISOString(),
    recipient_name: event.recipient_name || "Unknown Recipient",
    recipient_uei: event.recipient_uei || `UEI_${index.toString().padStart(9, '0')}`,
    event_amount: event.event_amount || 0,
    prime_contractor_name: event.prime_contractor_name,
    awarding_agency_name: event.awarding_agency_name || "Unknown Agency",
    awarding_sub_agency_name: event.awarding_sub_agency_name || "",
    naics_code: event.naics_code || "000000",
    naics_description: event.naics_description || "Professional Services",
    recipient_state: event.recipient_state || "Unknown",
    pop_state: event.pop_state || "Unknown",
    contract_total_value: event.contract_total_value || event.event_amount || 0,
    award_piid: event.award_piid || `PIID_${index}`,
    action_type: event.action_type || "NEW",
    fiscal_year: event.fiscal_year || new Date().getFullYear(),
    extent_competed: event.extent_competed || "UNKNOWN",
    contract_pricing_type: event.contract_pricing_type || "UNKNOWN",
    small_business_flags: event.small_business_flags || [],
    parent_company_name: event.parent_company_name,
    start_date: event.start_date || "",
    end_date: event.end_date || "",
    utilization: getUtilizationPercentage(), // Static 50% as in original
    psc_code: event.psc_code || "",
    ai_description: event.ai_description || "Professional services obligation",
    // ObligationCardView specific calculations
    recipient_count: getRecipientCount(), // Static 1 as in original
    outlays: calculateOutlays(event.event_amount || 0) // 60% of event amount
  }));

  // Fallback handling - exact same logic as original
  if (obligations.length === 0) {
    return [{
      event_id: "fallback-obligation",
      EVENT_ID: "FALLBACK_001",
      event_type: "PRIME",
      event_date: new Date().toISOString(),
      recipient_name: "No Obligations Available",
      recipient_uei: "000000000",
      event_amount: 0,
      prime_contractor_name: null,
      awarding_agency_name: "No Agency Data",
      awarding_sub_agency_name: "",
      naics_code: "000000",
      naics_description: "No description available",
      recipient_state: "Unknown",
      pop_state: "Unknown",
      contract_total_value: 0,
      award_piid: "NO_PIID",
      action_type: "NEW",
      fiscal_year: new Date().getFullYear(),
      extent_competed: "UNKNOWN",
      contract_pricing_type: "UNKNOWN",
      small_business_flags: [],
      parent_company_name: null,
      start_date: "",
      end_date: "",
      utilization: getUtilizationPercentage(),
      psc_code: "",
      ai_description: "No obligation data available for this contract",
      recipient_count: getRecipientCount(),
      outlays: 0
    }];
  }

  return obligations;
};