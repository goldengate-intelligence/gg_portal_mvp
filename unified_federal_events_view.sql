-- GoldenGate Unified Federal Events View
-- Analyst-Focused Atomic View for Prime Contracts and Subaward Events
-- 20 Essential Fields for Cross-Event Intelligence

CREATE OR REPLACE VIEW USAS_V1.GOLD.V_UNIFIED_FEDERAL_EVENTS AS

-- Prime Contract Events
SELECT
    'PRIME' as event_type,
    ACTION_DATE as event_date,
    RECIPIENT_NAME as recipient_name,
    RECIPIENT_UEI as recipient_uei,
    FEDERAL_ACTION_OBLIGATION as event_amount,
    NULL as prime_contractor_name,  -- NULL for prime events
    AWARDING_AGENCY_NAME as awarding_agency_name,
    AWARDING_SUB_AGENCY_NAME as awarding_sub_agency_name,
    NAICS_CODE as naics_code,
    NAICS_DESCRIPTION as naics_description,
    RECIPIENT_STATE_NAME as recipient_state,
    PRIMARY_PLACE_OF_PERFORMANCE_STATE_NAME as pop_state,
    CURRENT_TOTAL_VALUE_OF_AWARD as contract_total_value,
    AWARD_ID_PIID as award_piid,
    ACTION_TYPE as action_type,
    ACTION_DATE_FISCAL_YEAR as fiscal_year,
    EXTENT_COMPETED as extent_competed,
    TYPE_OF_CONTRACT_PRICING as contract_pricing_type,

    -- Small business flags (concatenated for simplified analysis)
    CASE
        WHEN VETERAN_OWNED_BUSINESS = TRUE THEN 'VET|'
        ELSE ''
    END ||
    CASE
        WHEN WOMAN_OWNED_BUSINESS = TRUE THEN 'WOM|'
        ELSE ''
    END ||
    CASE
        WHEN SMALL_DISADVANTAGED_BUSINESS = TRUE THEN 'SDB|'
        ELSE ''
    END ||
    CASE
        WHEN C8A_PROGRAM_PARTICIPANT = TRUE THEN '8A|'
        ELSE ''
    END ||
    CASE
        WHEN HISTORICALLY_UNDERUTILIZED_BUSINESS_ZONE_HUBZONE_FIRM = TRUE THEN 'HUB|'
        ELSE ''
    END as small_business_flags,

    RECIPIENT_PARENT_NAME as parent_company_name

FROM USAS_V1.SILVER.FACT_FEDERAL_PROCUREMENT_TRANSACTIONS
WHERE CONTRACT_TRANSACTION_UNIQUE_KEY IS NOT NULL
  AND ACTION_DATE IS NOT NULL
  AND RECIPIENT_UEI IS NOT NULL

UNION ALL

-- Subaward Events
SELECT
    'SUBAWARD' as event_type,
    SUBAWARD_ACTION_DATE as event_date,
    SUBAWARDEE_NAME as recipient_name,
    SUBAWARDEE_UEI as recipient_uei,
    SUBAWARD_AMOUNT as event_amount,
    PRIME_AWARDEE_NAME as prime_contractor_name,  -- Prime contractor for subs
    PRIME_AWARD_AWARDING_AGENCY_NAME as awarding_agency_name,
    PRIME_AWARD_AWARDING_SUB_AGENCY_NAME as awarding_sub_agency_name,
    PRIME_AWARD_NAICS_CODE as naics_code,
    PRIME_AWARD_NAICS_DESCRIPTION as naics_description,
    SUBAWARDEE_STATE_NAME as recipient_state,
    SUBAWARD_PRIMARY_PLACE_OF_PERFORMANCE_STATE_NAME as pop_state,
    PRIME_AWARD_AMOUNT as contract_total_value,
    PRIME_AWARD_PIID as award_piid,
    'SUBAWARD' as action_type,  -- All subawards are 'SUBAWARD' type
    SUBAWARD_ACTION_DATE_FISCAL_YEAR as fiscal_year,
    NULL as extent_competed,  -- Not available for subawards
    NULL as contract_pricing_type,  -- Not available for subawards
    NULL as small_business_flags,  -- Not available for subawards
    SUBAWARDEE_PARENT_NAME as parent_company_name

FROM USAS_V1.SILVER.FACT_FEDERAL_SUBAWARD_EVENTS
WHERE SUBAWARD_SAM_REPORT_ID IS NOT NULL
  AND SUBAWARD_ACTION_DATE IS NOT NULL
  AND SUBAWARDEE_UEI IS NOT NULL

ORDER BY event_date DESC, event_amount DESC;

-- Add clustering for optimal query performance
ALTER VIEW USAS_V1.GOLD.V_UNIFIED_FEDERAL_EVENTS
CLUSTER BY (event_date, awarding_agency_name, recipient_uei, event_type);

-- Add comprehensive view comment
COMMENT ON VIEW USAS_V1.GOLD.V_UNIFIED_FEDERAL_EVENTS IS
'Unified Federal Events View: 20-field analyst-focused atomic view combining prime contracts and subaward events.
Grain: Individual transaction events (prime and sub).
Purpose: Cross-event intelligence, flow analysis, and comprehensive federal spending visibility.
Key Features: Flow tracking (agency → prime → sub), temporal analysis, geographic intelligence, corporate relationships.
Use Cases: Market intelligence, competitive analysis, relationship mapping, risk assessment.';

-- Performance and usage queries for validation
-- Sample query for testing:
/*
SELECT
    event_type,
    COUNT(*) as event_count,
    SUM(event_amount) as total_amount,
    COUNT(DISTINCT recipient_uei) as unique_recipients,
    COUNT(DISTINCT awarding_agency_name) as unique_agencies
FROM USAS_V1.GOLD.V_UNIFIED_FEDERAL_EVENTS
WHERE event_date >= '2023-01-01'
GROUP BY event_type
ORDER BY total_amount DESC;
*/