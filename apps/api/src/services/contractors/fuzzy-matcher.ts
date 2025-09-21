import { db } from '../../db';
import { 
  contractorProfiles, 
  contractorUeiMappings, 
  contractorsCache 
} from '../../db/schema';
import { eq, sql, and, isNull, gt } from 'drizzle-orm';

export interface FuzzyMatchResult {
  uei: string;
  contractorName: string;
  profileId: string;
  profileName: string;
  similarity: number;
  matchMethod: 'fuzzy_trigram' | 'fuzzy_normalized' | 'fuzzy_levenshtein';
  confidence: number;
}

export class ContractorFuzzyMatcher {
  
  /**
   * Normalize contractor name for better matching
   */
  private normalizeName(name: string): string {
    return name
      .toUpperCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[,\.]?\s*(INC|LLC|CORP|CORPORATION|LTD|LIMITED|CO|COMPANY|INCORPORATED)\.?$/i, '')
      .replace(/[,\.]?\s*(THE)\s+/i, '')
      .replace(/[^\w\s]/g, '')
      .trim();
  }

  /**
   * Find fuzzy matches for unmapped UEIs using PostgreSQL trigram similarity
   */
  async findFuzzyMatches(minSimilarity: number = 0.6, limit: number = 1000): Promise<FuzzyMatchResult[]> {
    console.log(`🔍 Finding fuzzy matches with similarity >= ${minSimilarity}, limit: ${limit}`);
    
    const results = await db.execute(sql`
      WITH unmapped_ueis AS (
        SELECT DISTINCT cc.contractor_uei as uei, cc.contractor_name
        FROM contractors_cache cc
        LEFT JOIN contractor_uei_mappings cum ON cc.contractor_uei = cum.uei
        WHERE cum.uei IS NULL
          AND cc.contractor_name IS NOT NULL
          AND LENGTH(TRIM(cc.contractor_name)) > 3
        LIMIT ${limit}
      ),
      fuzzy_matches AS (
        SELECT 
          u.uei,
          u.contractor_name,
          p.id as profile_id,
          p.display_name as profile_name,
          calculate_name_similarity(u.contractor_name, p.display_name) as similarity,
          'fuzzy_trigram' as match_method
        FROM unmapped_ueis u
        CROSS JOIN contractor_profiles p
        WHERE calculate_name_similarity(u.contractor_name, p.display_name) >= ${minSimilarity}
      ),
      ranked_matches AS (
        SELECT *,
          ROW_NUMBER() OVER (PARTITION BY uei ORDER BY similarity DESC) as rank
        FROM fuzzy_matches
      )
      SELECT 
        uei,
        contractor_name,
        profile_id,
        profile_name,
        similarity,
        match_method
      FROM ranked_matches 
      WHERE rank = 1
      ORDER BY similarity DESC
    `);

    // Handle different result formats from db.execute()
    const rows = results.rows || results;
    if (!rows || !Array.isArray(rows)) {
      console.log('⚠️  No rows returned from fuzzy matching query');
      return [];
    }

    return rows.map((row: any) => ({
      uei: row.uei,
      contractorName: row.contractor_name,
      profileId: row.profile_id,
      profileName: row.profile_name,
      similarity: parseFloat(row.similarity),
      matchMethod: row.match_method as 'fuzzy_trigram',
      confidence: Math.round(parseFloat(row.similarity) * 100)
    }));
  }

  /**
   * Apply fuzzy matches by creating UEI mappings
   */
  async applyFuzzyMatches(matches: FuzzyMatchResult[], minConfidence: number = 70): Promise<number> {
    const highConfidenceMatches = matches.filter(m => m.confidence >= minConfidence);
    
    if (highConfidenceMatches.length === 0) {
      console.log(`⚠️  No matches above confidence threshold ${minConfidence}%`);
      return 0;
    }

    console.log(`✅ Applying ${highConfidenceMatches.length} high-confidence fuzzy matches`);

    const mappingsToInsert = highConfidenceMatches.map(match => ({
      profileId: match.profileId,
      contractorCacheId: match.uei, // Using UEI as cache ID for now
      uei: match.uei,
      contractorName: match.contractorName,
      mappingConfidence: match.confidence,
      mappingMethod: match.matchMethod,
      isActive: true
    }));

    // Insert mappings in batches to avoid memory issues
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < mappingsToInsert.length; i += batchSize) {
      const batch = mappingsToInsert.slice(i, i + batchSize);
      
      try {
        await db.insert(contractorUeiMappings)
          .values(batch)
          .onConflictDoNothing(); // Skip if UEI already mapped
        
        insertedCount += batch.length;
        console.log(`📊 Inserted batch ${Math.ceil((i + batchSize) / batchSize)} (${insertedCount} total)`);
      } catch (error) {
        console.error(`❌ Error inserting batch starting at index ${i}:`, error);
      }
    }

    return insertedCount;
  }

  /**
   * Run a complete fuzzy matching process
   */
  async runFuzzyMatchingProcess(
    minSimilarity: number = 0.7, 
    minConfidence: number = 75,
    limit: number = 5000
  ): Promise<{
    foundMatches: number;
    appliedMatches: number;
    averageConfidence: number;
  }> {
    console.log(`🚀 Starting fuzzy matching process...`);
    console.log(`📋 Parameters: similarity >= ${minSimilarity}, confidence >= ${minConfidence}%, limit: ${limit}`);
    
    // Get current mapping stats
    const beforeStats = await this.getMappingStats();
    console.log(`📊 Before: ${beforeStats.mappedUeis} UEIs mapped (${beforeStats.mappingPercentage}%)`);

    // Find fuzzy matches
    const matches = await this.findFuzzyMatches(minSimilarity, limit);
    console.log(`🔍 Found ${matches.length} potential fuzzy matches`);

    if (matches.length === 0) {
      return { foundMatches: 0, appliedMatches: 0, averageConfidence: 0 };
    }

    // Apply high-confidence matches
    const appliedCount = await this.applyFuzzyMatches(matches, minConfidence);
    
    // Get updated stats
    const afterStats = await this.getMappingStats();
    console.log(`📊 After: ${afterStats.mappedUeis} UEIs mapped (${afterStats.mappingPercentage}%)`);
    console.log(`📈 Improvement: +${afterStats.mappedUeis - beforeStats.mappedUeis} mappings`);

    const averageConfidence = matches.reduce((sum, m) => sum + m.confidence, 0) / matches.length;

    return {
      foundMatches: matches.length,
      appliedMatches: appliedCount,
      averageConfidence: Math.round(averageConfidence)
    };
  }

  /**
   * Get current UEI mapping statistics
   */
  async getMappingStats(): Promise<{
    totalUeis: number;
    mappedUeis: number;
    unmappedUeis: number;
    mappingPercentage: number;
  }> {
    const [totalResult] = await db.execute(sql`
      SELECT COUNT(DISTINCT contractor_uei) as total_ueis FROM contractors_cache
    `);
    
    const [mappedResult] = await db.execute(sql`
      SELECT COUNT(DISTINCT uei) as mapped_ueis FROM contractor_uei_mappings
    `);

    const totalUeis = parseInt((totalResult.rows?.[0] || totalResult).total_ueis as string);
    const mappedUeis = parseInt((mappedResult.rows?.[0] || mappedResult).mapped_ueis as string);
    const unmappedUeis = totalUeis - mappedUeis;
    const mappingPercentage = Math.round((mappedUeis / totalUeis) * 100);

    return {
      totalUeis,
      mappedUeis,
      unmappedUeis,
      mappingPercentage
    };
  }

  /**
   * Get sample of potential matches for review
   */
  async getSampleMatches(count: number = 20): Promise<FuzzyMatchResult[]> {
    const matches = await this.findFuzzyMatches(0.5, count * 3);
    return matches.slice(0, count);
  }
}

export const fuzzyMatcher = new ContractorFuzzyMatcher();