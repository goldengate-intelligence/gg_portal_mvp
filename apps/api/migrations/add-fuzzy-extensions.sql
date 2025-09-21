-- Add PostgreSQL fuzzy matching extensions
-- Generated: 2025-01-09

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

-- Add indexes for trigram similarity matching on contractor names
CREATE INDEX IF NOT EXISTS idx_contractors_cache_name_trgm 
ON contractors_cache USING gin (contractor_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_contractor_profiles_name_trgm 
ON contractor_profiles USING gin (display_name gin_trgm_ops);

-- Function to calculate name similarity
CREATE OR REPLACE FUNCTION calculate_name_similarity(name1 TEXT, name2 TEXT)
RETURNS REAL AS $$
BEGIN
    -- Return the highest similarity score from multiple algorithms
    RETURN GREATEST(
        similarity(name1, name2),
        similarity(
            regexp_replace(upper(trim(name1)), '\s*(INC|LLC|CORP|CORPORATION|LTD|LIMITED|CO|COMPANY)\.?\s*$', '', 'i'),
            regexp_replace(upper(trim(name2)), '\s*(INC|LLC|CORP|CORPORATION|LTD|LIMITED|CO|COMPANY)\.?\s*$', '', 'i')
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;