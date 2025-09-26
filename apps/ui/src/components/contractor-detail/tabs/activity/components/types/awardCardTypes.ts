/**
 * Award Card Types
 *
 * Type definitions extracted from AwardCardView for better organization
 */

export interface Event {
  AWARD_KEY: string;
  EVENT_DATE: string;
  award_key: string;
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
}

export interface AwardCardViewProps {
  relationship: any;
  type: "inflow" | "outflow";
  onBack: () => void;
  onOpenObligationCardView: (
    contractId: string,
    contractTitle: string,
    originContainer?: "inflow" | "outflow"
  ) => void;
}

export interface Terminology {
  container: string;
  title: string;
  items: string;
}

export type TemperatureStatus = "hot" | "warm" | "cold";

export interface AwardItemProps {
  award: Event;
  index: number;
  type: "inflow" | "outflow";
  terminology: Terminology;
  isExpanded: boolean;
  activeTooltip: string | null;
  onToggleExpansion: (itemId: string) => void;
  onSetTooltip: (tooltip: string | null) => void;
  onOpenObligationCardView: (
    contractId: string,
    contractTitle: string,
    originContainer?: "inflow" | "outflow"
  ) => void;
}

export interface AwardItemHeaderProps {
  award: Event;
  latestActionDate: string;
}

export interface AwardItemToolbarProps {
  award: Event;
  index: number;
  type: "inflow" | "outflow";
  activeTooltip: string | null;
  onSetTooltip: (tooltip: string | null) => void;
  onToggleExpansion: (itemId: string) => void;
  onOpenObligationCardView: (
    contractId: string,
    contractTitle: string,
    originContainer?: "inflow" | "outflow"
  ) => void;
}

export interface PerformanceProgressBarProps {
  startDate: string;
  endDate: string;
}

export interface TemperatureStatusBadgeProps {
  actionDate: string;
}