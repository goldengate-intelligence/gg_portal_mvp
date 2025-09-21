-- Test the similarity function
SELECT calculate_name_similarity('BOEING COMPANY', 'THE BOEING COMPANY') as boeing_test;

-- Test basic trigram similarity
SELECT similarity('BOEING COMPANY', 'THE BOEING COMPANY') as trigram_test;

-- Check if extensions are installed
SELECT * FROM pg_extension WHERE extname IN ('pg_trgm', 'fuzzystrmatch');

-- Simple test query with a limit
SELECT 
  cc.contractor_uei,
  cc.contractor_name,
  calculate_name_similarity(cc.contractor_name, 'BOEING COMPANY') as sim_score
FROM contractors_cache cc 
WHERE cc.contractor_name ILIKE '%BOEING%'
LIMIT 5;