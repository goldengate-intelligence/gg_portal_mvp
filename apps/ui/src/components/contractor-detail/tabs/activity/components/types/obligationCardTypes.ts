/**
 * Obligation Card Types
 *
 * Type definitions specific to ObligationCardView - similar to but distinct from AwardCardView
 */

export interface ObligationEvent {
  event_id: string;
  event_type: "PRIME" | "SUBAWARD";
  event_date: string;
  recipient_name: string;
  recipient_uei: string;
  event_amount: number;
  prime_contractor_name: string | null;
  awarding_agency_name: string;
  awarding_sub_agency_name: string;
  naics_code: string;
  naics_description: string;
  recipient_state: string;
  pop_state: string;
  contract_total_value: number;
  award_piid: string;
  action_type: string;
  fiscal_year: number;
  extent_competed: string;
  contract_pricing_type: string;
  small_business_flags: string[];
  parent_company_name: string | null;
  start_date: string;
  end_date: string;
  utilization: number;
  psc_code?: string;
  ai_description?: string;
  // ObligationCardView specific fields
  EVENT_ID: string;
  recipient_count?: number;
  outlays?: number;
}

export interface ActivityEvent {
  EVENT_ID: string;
  event_date: string;
  recipient_name: string;
  recipient_uei: string;
  event_amount: number;
  prime_contractor_name: string | null;
  awarding_agency_name: string;
  awarding_sub_agency_name: string;
  naics_code: string;
  naics_description: string;
  recipient_state: string;
  pop_state: string;
  contract_total_value: number;
  award_piid: string;
  action_type: string;
  fiscal_year: number;
  extent_competed: string;
  contract_pricing_type: string;
  small_business_flags: string[];
  parent_company_name: string | null;
  start_date: string;
  end_date: string;
  psc_code?: string;
  ai_description?: string;
  // Additional activity event fields
  contract_id?: string;
  flow_direction?: string;
}

export interface ObligationCardViewProps {
  contractId: string;
  contractTitle: string;
  originContainer?: "inflow" | "outflow";
  activityEvents?: ActivityEvent[];
  onBack: () => void;
}

export interface ObligationTerminology {
  container: string;
  title: string;
  items: string;
}

export interface ObligationItemProps {
  obligation: ObligationEvent;
  index: number;
  terminology: ObligationTerminology;
  isExpanded: boolean;
  activeTooltip: string | null;
  onToggleExpansion: (itemId: string) => void;
  onSetTooltip: (tooltip: string | null) => void;
}

export interface ObligationItemHeaderProps {
  obligation: ObligationEvent;
  latestActionDate: string;
}

export interface ObligationItemToolbarProps {
  obligation: ObligationEvent;
  index: number;
  activeTooltip: string | null;
  onSetTooltip: (tooltip: string | null) => void;
  onToggleExpansion: (itemId: string) => void;
}

export interface ObligationItemExpandedContentProps {
  obligation: ObligationEvent;
}