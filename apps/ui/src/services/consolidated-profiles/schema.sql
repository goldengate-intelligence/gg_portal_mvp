-- Consolidated JSON Profile Database Schema
-- Unified storage for all contractor data sources with optimized indexing

-- Main table for consolidated contractor profiles
CREATE TABLE consolidated_contractor_profiles (
    -- Primary identification
    profile_id VARCHAR(36) PRIMARY KEY, -- UUID
    uei VARCHAR(12) NOT NULL UNIQUE,
    primary_name VARCHAR(255) NOT NULL,
    alternative_names JSON, -- Array of alternative names/DBA names

    -- Complete profile data as JSON
    profile_data JSONB NOT NULL,

    -- Data completeness tracking
    data_completeness_overall INTEGER DEFAULT 0 CHECK (data_completeness_overall >= 0 AND data_completeness_overall <= 100),
    has_snowflake_data BOOLEAN DEFAULT FALSE,
    has_lusha_data BOOLEAN DEFAULT FALSE,
    has_ai_insights BOOLEAN DEFAULT FALSE,
    has_network_data BOOLEAN DEFAULT FALSE,

    -- Quick access computed fields for fast filtering (extracted from JSON)
    display_name VARCHAR(255),
    primary_industry VARCHAR(100),
    size_tier VARCHAR(20),
    performance_rating VARCHAR(50),
    total_contract_value DECIMAL(15,2),
    website_url VARCHAR(500),
    logo_url VARCHAR(500),

    -- Location data for geographic filtering
    primary_state VARCHAR(2),
    primary_country VARCHAR(2) DEFAULT 'US',
    primary_city VARCHAR(100),

    -- Financial metrics for fast filtering
    revenue_ttm_millions DECIMAL(12,2),
    awards_ttm_millions DECIMAL(12,2),
    calculated_pipeline_millions DECIMAL(12,2),

    -- Performance scores for ranking
    composite_performance_score INTEGER CHECK (composite_performance_score >= 0 AND composite_performance_score <= 100),
    awards_performance_score INTEGER CHECK (awards_performance_score >= 0 AND awards_performance_score <= 100),
    revenue_performance_score INTEGER CHECK (revenue_performance_score >= 0 AND revenue_performance_score <= 100),

    -- Industry classification
    primary_naics_code VARCHAR(10),
    primary_naics_description VARCHAR(255),
    agency_focus VARCHAR(20), -- 'Defense' | 'Civilian'
    entity_classification VARCHAR(30), -- 'PRIMARY_PRIME' | 'PRIMARY_SUB' | 'HYBRID' | 'PRIME_WITH_SUBS'

    -- Data freshness tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    profile_version INTEGER DEFAULT 1,

    -- Cache expiration tracking per data source
    snowflake_expires_at TIMESTAMP WITH TIME ZONE,
    lusha_expires_at TIMESTAMP WITH TIME ZONE,
    ai_insights_expires_at TIMESTAMP WITH TIME ZONE,
    network_data_expires_at TIMESTAMP WITH TIME ZONE,

    -- Last successful refresh per data source
    snowflake_last_refresh TIMESTAMP WITH TIME ZONE,
    lusha_last_refresh TIMESTAMP WITH TIME ZONE,
    ai_insights_last_refresh TIMESTAMP WITH TIME ZONE,
    network_data_last_refresh TIMESTAMP WITH TIME ZONE,

    -- Data source tracking
    data_sources JSON -- Array of data sources used
);

-- Performance optimization indexes
CREATE INDEX idx_consolidated_profiles_uei ON consolidated_contractor_profiles(uei);
CREATE INDEX idx_consolidated_profiles_name ON consolidated_contractor_profiles(primary_name);
CREATE INDEX idx_consolidated_profiles_industry ON consolidated_contractor_profiles(primary_industry);
CREATE INDEX idx_consolidated_profiles_size_tier ON consolidated_contractor_profiles(size_tier);
CREATE INDEX idx_consolidated_profiles_location ON consolidated_contractor_profiles(primary_state, primary_country);
CREATE INDEX idx_consolidated_profiles_naics ON consolidated_contractor_profiles(primary_naics_code);
CREATE INDEX idx_consolidated_profiles_agency_focus ON consolidated_contractor_profiles(agency_focus);
CREATE INDEX idx_consolidated_profiles_entity_class ON consolidated_contractor_profiles(entity_classification);

-- Performance score indexes for ranking
CREATE INDEX idx_consolidated_profiles_composite_score ON consolidated_contractor_profiles(composite_performance_score DESC);
CREATE INDEX idx_consolidated_profiles_revenue_score ON consolidated_contractor_profiles(revenue_performance_score DESC);
CREATE INDEX idx_consolidated_profiles_awards_score ON consolidated_contractor_profiles(awards_performance_score DESC);

-- Financial metrics indexes for filtering
CREATE INDEX idx_consolidated_profiles_revenue_ttm ON consolidated_contractor_profiles(revenue_ttm_millions DESC);
CREATE INDEX idx_consolidated_profiles_awards_ttm ON consolidated_contractor_profiles(awards_ttm_millions DESC);
CREATE INDEX idx_consolidated_profiles_total_contract_value ON consolidated_contractor_profiles(total_contract_value DESC);

-- Data completeness indexes
CREATE INDEX idx_consolidated_profiles_data_completeness ON consolidated_contractor_profiles(data_completeness_overall DESC);
CREATE INDEX idx_consolidated_profiles_has_snowflake ON consolidated_contractor_profiles(has_snowflake_data) WHERE has_snowflake_data = TRUE;
CREATE INDEX idx_consolidated_profiles_has_lusha ON consolidated_contractor_profiles(has_lusha_data) WHERE has_lusha_data = TRUE;
CREATE INDEX idx_consolidated_profiles_has_ai_insights ON consolidated_contractor_profiles(has_ai_insights) WHERE has_ai_insights = TRUE;

-- Data freshness indexes for cache management
CREATE INDEX idx_consolidated_profiles_last_updated ON consolidated_contractor_profiles(last_updated_at DESC);
CREATE INDEX idx_consolidated_profiles_snowflake_expires ON consolidated_contractor_profiles(snowflake_expires_at) WHERE snowflake_expires_at IS NOT NULL;
CREATE INDEX idx_consolidated_profiles_lusha_expires ON consolidated_contractor_profiles(lusha_expires_at) WHERE lusha_expires_at IS NOT NULL;
CREATE INDEX idx_consolidated_profiles_ai_expires ON consolidated_contractor_profiles(ai_insights_expires_at) WHERE ai_insights_expires_at IS NOT NULL;

-- Full-text search index on names
CREATE INDEX idx_consolidated_profiles_name_search ON consolidated_contractor_profiles USING gin(to_tsvector('english', primary_name));

-- JSONB indexes for deep JSON queries
CREATE INDEX idx_consolidated_profiles_json_performance ON consolidated_contractor_profiles USING gin((profile_data -> 'snowflakeData' -> 'performanceScores'));
CREATE INDEX idx_consolidated_profiles_json_peer_group ON consolidated_contractor_profiles USING gin((profile_data -> 'snowflakeData' -> 'peerGroup'));
CREATE INDEX idx_consolidated_profiles_json_lusha_company ON consolidated_contractor_profiles USING gin((profile_data -> 'lushaData' -> 'companyDetails'));

-- Profile update history table for audit trail
CREATE TABLE consolidated_profile_updates (
    update_id VARCHAR(36) PRIMARY KEY,
    profile_id VARCHAR(36) REFERENCES consolidated_contractor_profiles(profile_id) ON DELETE CASCADE,
    uei VARCHAR(12) NOT NULL,

    -- What was updated
    update_type VARCHAR(50) NOT NULL, -- 'full_refresh' | 'snowflake_update' | 'lusha_update' | 'ai_update' | 'network_update'
    data_sources_updated JSON, -- Array of data sources that were updated

    -- Update details
    initiated_by VARCHAR(100), -- 'system' | 'user' | 'scheduler'
    update_trigger VARCHAR(100), -- 'scheduled' | 'manual' | 'stale_detection' | 'new_profile'

    -- Performance tracking
    update_duration_ms INTEGER,
    records_processed INTEGER DEFAULT 1,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,

    -- Version tracking
    previous_version INTEGER,
    new_version INTEGER,

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for update history
CREATE INDEX idx_profile_updates_profile_id ON consolidated_profile_updates(profile_id);
CREATE INDEX idx_profile_updates_uei ON consolidated_profile_updates(uei);
CREATE INDEX idx_profile_updates_type ON consolidated_profile_updates(update_type);
CREATE INDEX idx_profile_updates_started_at ON consolidated_profile_updates(started_at DESC);
CREATE INDEX idx_profile_updates_success ON consolidated_profile_updates(success);

-- Profile search index table for advanced search capabilities
CREATE TABLE consolidated_profile_search_index (
    profile_id VARCHAR(36) REFERENCES consolidated_contractor_profiles(profile_id) ON DELETE CASCADE,
    uei VARCHAR(12) NOT NULL,

    -- Searchable text fields
    search_text TEXT, -- Combined searchable content
    keywords JSON, -- Array of keywords/tags

    -- Categorical search fields
    industries JSON, -- Array of industries
    locations JSON, -- Array of locations
    naics_codes JSON, -- Array of NAICS codes
    technologies JSON, -- Array of technologies from Lusha

    -- Search scoring
    search_rank DECIMAL(5,4) DEFAULT 1.0, -- Relevance scoring
    boost_factor DECIMAL(3,2) DEFAULT 1.0, -- Manual boost for important profiles

    -- Index maintenance
    last_indexed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (profile_id)
);

-- Full-text search index
CREATE INDEX idx_profile_search_text ON consolidated_profile_search_index USING gin(to_tsvector('english', search_text));
CREATE INDEX idx_profile_search_rank ON consolidated_profile_search_index(search_rank DESC);
CREATE INDEX idx_profile_search_keywords ON consolidated_profile_search_index USING gin(keywords);

-- Cache statistics table for monitoring
CREATE TABLE consolidated_profile_cache_stats (
    stats_date DATE PRIMARY KEY,

    -- Profile counts
    total_profiles INTEGER DEFAULT 0,
    profiles_with_snowflake INTEGER DEFAULT 0,
    profiles_with_lusha INTEGER DEFAULT 0,
    profiles_with_ai_insights INTEGER DEFAULT 0,
    profiles_with_network_data INTEGER DEFAULT 0,

    -- Freshness distribution
    fresh_profiles INTEGER DEFAULT 0, -- < 1 day old
    recent_profiles INTEGER DEFAULT 0, -- 1-7 days old
    stale_profiles INTEGER DEFAULT 0, -- > 7 days old

    -- Performance metrics
    average_completeness DECIMAL(5,2),
    cache_hit_rate DECIMAL(5,4),
    average_update_duration_ms INTEGER,

    -- Data quality
    profiles_needing_refresh INTEGER DEFAULT 0,
    failed_updates_today INTEGER DEFAULT 0,

    -- Computed at
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Snowflake data freshness tracking table
CREATE TABLE snowflake_data_checks (
    check_id VARCHAR(50) PRIMARY KEY,
    check_date DATE NOT NULL GENERATED ALWAYS AS (DATE(checked_at)) STORED,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Snowflake table update timestamps
    metrics_last_updated TIMESTAMP WITH TIME ZONE,
    peers_last_updated TIMESTAMP WITH TIME ZONE,

    -- Data freshness indicators
    metrics_record_count BIGINT,
    peers_record_count BIGINT,
    latest_snapshot_month VARCHAR(10), -- YYYY-MM format

    -- Check results
    has_new_data BOOLEAN DEFAULT FALSE,
    refresh_recommended BOOLEAN DEFAULT FALSE,
    estimated_affected_profiles INTEGER DEFAULT 0,

    -- Performance tracking
    check_duration_ms INTEGER,

    UNIQUE(check_date)
);

-- Indexes for Snowflake data tracking
CREATE INDEX idx_snowflake_checks_date ON snowflake_data_checks(check_date DESC);
CREATE INDEX idx_snowflake_checks_has_new_data ON snowflake_data_checks(has_new_data) WHERE has_new_data = TRUE;

-- Useful views for common queries
CREATE VIEW consolidated_profiles_summary AS
SELECT
    profile_id,
    uei,
    display_name,
    primary_industry,
    size_tier,
    performance_rating,
    data_completeness_overall,
    has_snowflake_data,
    has_lusha_data,
    has_ai_insights,
    composite_performance_score,
    revenue_ttm_millions,
    total_contract_value,
    agency_focus,
    entity_classification,
    primary_state,
    last_updated_at,

    -- Data freshness indicators
    CASE
        WHEN last_updated_at > NOW() - INTERVAL '1 day' THEN 'Fresh'
        WHEN last_updated_at > NOW() - INTERVAL '7 days' THEN 'Recent'
        ELSE 'Stale'
    END as data_freshness
FROM consolidated_contractor_profiles;

-- View for profiles needing refresh
CREATE VIEW profiles_needing_refresh AS
SELECT
    profile_id,
    uei,
    display_name,

    -- What needs refreshing
    CASE WHEN snowflake_expires_at < NOW() THEN TRUE ELSE FALSE END as needs_snowflake_refresh,
    CASE WHEN lusha_expires_at < NOW() THEN TRUE ELSE FALSE END as needs_lusha_refresh,
    CASE WHEN ai_insights_expires_at < NOW() THEN TRUE ELSE FALSE END as needs_ai_refresh,
    CASE WHEN network_data_expires_at < NOW() THEN TRUE ELSE FALSE END as needs_network_refresh,

    -- Time since last refresh
    EXTRACT(EPOCH FROM (NOW() - snowflake_last_refresh))/3600 as hours_since_snowflake_refresh,
    EXTRACT(EPOCH FROM (NOW() - lusha_last_refresh))/3600 as hours_since_lusha_refresh,
    EXTRACT(EPOCH FROM (NOW() - ai_insights_last_refresh))/3600 as hours_since_ai_refresh,

    last_updated_at
FROM consolidated_contractor_profiles
WHERE
    snowflake_expires_at < NOW()
    OR lusha_expires_at < NOW()
    OR ai_insights_expires_at < NOW()
    OR network_data_expires_at < NOW()
ORDER BY last_updated_at ASC;

-- Triggers for maintaining computed fields
CREATE OR REPLACE FUNCTION update_consolidated_profile_computed_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Update last_updated_at
    NEW.last_updated_at = NOW();

    -- Update version
    NEW.profile_version = OLD.profile_version + 1;

    -- Extract quick access fields from JSON
    NEW.display_name = COALESCE(NEW.profile_data ->> 'quickAccess' ->> 'displayName', NEW.primary_name);
    NEW.primary_industry = NEW.profile_data ->> 'quickAccess' ->> 'primaryIndustry';
    NEW.size_tier = NEW.profile_data ->> 'quickAccess' ->> 'sizeTier';
    NEW.performance_rating = NEW.profile_data ->> 'quickAccess' ->> 'performanceRating';
    NEW.total_contract_value = (NEW.profile_data ->> 'quickAccess' ->> 'totalContractValue')::DECIMAL;
    NEW.website_url = NEW.profile_data ->> 'quickAccess' ->> 'websiteUrl';
    NEW.logo_url = NEW.profile_data ->> 'quickAccess' ->> 'logoUrl';

    -- Extract Snowflake financial data
    NEW.revenue_ttm_millions = (NEW.profile_data -> 'snowflakeData' ->> 'revenueTtmMillions')::DECIMAL;
    NEW.awards_ttm_millions = (NEW.profile_data -> 'snowflakeData' ->> 'awardsTtmMillions')::DECIMAL;
    NEW.calculated_pipeline_millions = (NEW.profile_data -> 'snowflakeData' ->> 'calculatedPipelineMillions')::DECIMAL;

    -- Extract performance scores
    NEW.composite_performance_score = (NEW.profile_data -> 'snowflakeData' -> 'performanceScores' ->> 'composite')::INTEGER;
    NEW.revenue_performance_score = (NEW.profile_data -> 'snowflakeData' -> 'performanceScores' ->> 'revenue')::INTEGER;
    NEW.awards_performance_score = (NEW.profile_data -> 'snowflakeData' -> 'performanceScores' ->> 'awards')::INTEGER;

    -- Extract classification data
    NEW.primary_naics_code = NEW.profile_data -> 'snowflakeData' ->> 'primaryNaicsCode';
    NEW.primary_naics_description = NEW.profile_data -> 'snowflakeData' ->> 'primaryNaicsDescription';
    NEW.agency_focus = NEW.profile_data -> 'snowflakeData' ->> 'agencyFocus';
    NEW.entity_classification = NEW.profile_data -> 'snowflakeData' ->> 'entityClassification';

    -- Extract location data from Lusha
    NEW.primary_state = NEW.profile_data -> 'lushaData' -> 'location' ->> 'state';
    NEW.primary_country = COALESCE(NEW.profile_data -> 'lushaData' -> 'location' ->> 'country', 'US');
    NEW.primary_city = NEW.profile_data -> 'lushaData' -> 'location' ->> 'city';

    -- Update data completeness flags
    NEW.has_snowflake_data = (NEW.profile_data -> 'snowflakeData') IS NOT NULL;
    NEW.has_lusha_data = (NEW.profile_data -> 'lushaData') IS NOT NULL;
    NEW.has_ai_insights = (NEW.profile_data -> 'aiInsights') IS NOT NULL;
    NEW.has_network_data = (NEW.profile_data -> 'networkData') IS NOT NULL;

    -- Calculate overall data completeness
    NEW.data_completeness_overall = (
        CASE WHEN NEW.has_snowflake_data THEN 40 ELSE 0 END +
        CASE WHEN NEW.has_lusha_data THEN 30 ELSE 0 END +
        CASE WHEN NEW.has_ai_insights THEN 20 ELSE 0 END +
        CASE WHEN NEW.has_network_data THEN 10 ELSE 0 END
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
CREATE TRIGGER trigger_update_consolidated_profile_computed_fields
    BEFORE UPDATE ON consolidated_contractor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_consolidated_profile_computed_fields();