-- Create contractors cache table
CREATE TABLE IF NOT EXISTS contractors_cache (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_uei VARCHAR(20) NOT NULL UNIQUE,
  contractor_name TEXT NOT NULL,
  primary_agency TEXT,
  primary_sub_agency_code VARCHAR(10),
  country VARCHAR(100),
  state VARCHAR(2),
  city TEXT,
  zip_code VARCHAR(10),
  primary_naics_code VARCHAR(10),
  primary_naics_description TEXT,
  industry_cluster TEXT,
  lifecycle_stage VARCHAR(50),
  size_tier VARCHAR(20),
  size_quartile VARCHAR(10),
  peer_group_refined TEXT,
  total_contracts INTEGER DEFAULT 0,
  total_obligated DECIMAL(15, 2) DEFAULT 0,
  agency_diversity INTEGER DEFAULT 0,
  source_last_updated TIMESTAMP,
  cache_created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  cache_updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sync_status VARCHAR(20) DEFAULT 'synced',
  sync_error TEXT,
  metadata JSONB
);

-- Create indexes for performance
CREATE INDEX idx_contractor_name ON contractors_cache(contractor_name);
CREATE UNIQUE INDEX idx_contractor_uei ON contractors_cache(contractor_uei);
CREATE INDEX idx_state ON contractors_cache(state);
CREATE INDEX idx_primary_agency ON contractors_cache(primary_agency);
CREATE INDEX idx_industry_cluster ON contractors_cache(industry_cluster);
CREATE INDEX idx_lifecycle_stage ON contractors_cache(lifecycle_stage);
CREATE INDEX idx_size_tier ON contractors_cache(size_tier);
CREATE INDEX idx_total_obligated ON contractors_cache(total_obligated);
CREATE INDEX idx_state_industry ON contractors_cache(state, industry_cluster);
CREATE INDEX idx_agency_size ON contractors_cache(primary_agency, size_tier);

-- Full text search index
CREATE INDEX idx_contractor_search ON contractors_cache 
USING gin(to_tsvector('english', contractor_name || ' ' || COALESCE(primary_naics_description, '')));

-- Create cache statistics table
CREATE TABLE IF NOT EXISTS contractors_cache_stats (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  last_sync_time TIMESTAMP,
  total_records INTEGER DEFAULT 0,
  sync_duration_ms INTEGER,
  sync_status VARCHAR(20) DEFAULT 'idle',
  sync_error TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create update trigger for cache_updated_at
CREATE OR REPLACE FUNCTION update_contractors_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.cache_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contractors_cache_updated_at_trigger
BEFORE UPDATE ON contractors_cache
FOR EACH ROW
EXECUTE FUNCTION update_contractors_cache_updated_at();