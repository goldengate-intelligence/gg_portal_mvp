-- Create performance indexes for production queries
-- Based on Snowflake ETL Migration Report recommendations

-- Most critical indexes for contractor metrics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_metrics_uei_month 
  ON contractor_metrics_monthly(contractor_uei, month_year DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_metrics_revenue 
  ON contractor_metrics_monthly(monthly_revenue) 
  WHERE monthly_revenue::numeric > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_metrics_activity_status 
  ON contractor_metrics_monthly(activity_status);

-- Peer comparison indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_peer_composite 
  ON peer_comparisons_monthly(overall_performance_score DESC) 
  WHERE overall_performance_score IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_peer_uei_month 
  ON peer_comparisons_monthly(contractor_uei, month_year DESC);

-- Network metrics indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_network_prime_sub 
  ON contractor_network_metrics(prime_uei, sub_uei);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_network_strength 
  ON contractor_network_metrics(relationship_strength_score DESC) 
  WHERE relationship_strength_score >= 50;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_network_revenue 
  ON contractor_network_metrics(monthly_shared_revenue) 
  WHERE monthly_shared_revenue::numeric > 0;

-- Portfolio breakdown indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_uei_month 
  ON portfolio_breakdowns_monthly(contractor_uei, month_year DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_hhi 
  ON portfolio_breakdowns_monthly(agency_hhi_score) 
  WHERE agency_hhi_score IS NOT NULL;

-- Subcontractor metrics indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sub_metrics_uei_month 
  ON subcontractor_metrics_monthly(contractor_uei, month_year DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sub_metrics_revenue 
  ON subcontractor_metrics_monthly(monthly_sub_revenue) 
  WHERE monthly_sub_revenue::numeric > 0;

-- Contractor universe indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_universe_entity_type 
  ON contractor_universe(entity_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_universe_registration_date 
  ON contractor_universe(registration_date DESC);

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_metrics_composite_performance 
  ON contractor_metrics_monthly(contractor_uei, month_year DESC, monthly_revenue DESC, active_contracts DESC)
  WHERE monthly_revenue::numeric > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_network_composite_active 
  ON contractor_network_metrics(prime_uei, relationship_strength_score DESC, monthly_shared_revenue DESC)
  WHERE is_active = true;