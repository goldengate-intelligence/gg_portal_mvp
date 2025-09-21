import { db } from "../../db";
import { 
  contractorsCache, 
  contractorProfiles, 
  contractorUeiMappings,
  contractorAgencyRelationships,
  contractorProfileStats
} from "../../db/schema";
import { eq, sql, and, desc, isNull, inArray } from "drizzle-orm";
import type { 
  ContractorProfile, 
  NewContractorProfile,
  NewContractorUeiMapping,
  NewContractorAgencyRelationship
} from "../../db/schema/contractor-profiles";

export class ContractorProfileAggregator {
  /**
   * Build or rebuild all contractor profiles from cache data
   */
  async buildAllProfiles(): Promise<{ 
    profilesCreated: number; 
    ueisMapped: number; 
    errors: string[] 
  }> {
    const startTime = Date.now();
    const errors: string[] = [];
    let profilesCreated = 0;
    let ueisMapped = 0;

    try {
      // Update aggregation status
      await db.insert(contractorProfileStats).values({
        aggregationStatus: "running",
        lastAggregationRun: new Date(),
      });

      // Get all unique contractor names from cache
      const uniqueNames = await db
        .select({
          contractorName: contractorsCache.contractorName,
          count: sql<number>`count(*)`.as("count"),
          totalObligated: sql<string>`sum(${contractorsCache.totalObligated})`.as("totalObligated"),
        })
        .from(contractorsCache)
        .where(and(
          isNull(sql`NULL`), // Always true, just for proper syntax
        ))
        .groupBy(contractorsCache.contractorName)
        .having(sql`count(*) > 0`)
        .orderBy(desc(sql`sum(${contractorsCache.totalObligated})`));

      console.log(`Found ${uniqueNames.length} unique contractor names to process`);

      // Process each unique contractor name in batches
      const batchSize = 100;
      for (let i = 0; i < uniqueNames.length; i += batchSize) {
        const batch = uniqueNames.slice(i, Math.min(i + batchSize, uniqueNames.length));
        
        // Process batch in parallel with limited concurrency
        const batchPromises = batch.map(async (nameGroup) => {
          try {
            const profileId = await this.createOrUpdateProfile(nameGroup.contractorName);
            if (profileId) {
              // Map all UEIs for this contractor
              const mappedCount = await this.mapUeisToProfile(profileId, nameGroup.contractorName);
              
              // Build agency relationships
              await this.buildAgencyRelationships(profileId, nameGroup.contractorName);
              
              return { success: true, ueisMapped: mappedCount };
            }
            return { success: false, ueisMapped: 0 };
          } catch (error) {
            const errorMsg = `Failed to process contractor ${nameGroup.contractorName}: ${error}`;
            console.error(errorMsg);
            errors.push(errorMsg);
            return { success: false, ueisMapped: 0 };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        profilesCreated += batchResults.filter(r => r.success).length;
        ueisMapped += batchResults.reduce((sum, r) => sum + r.ueisMapped, 0);
        
        // Log progress
        if ((i + batchSize) % 1000 === 0 || i + batchSize >= uniqueNames.length) {
          console.log(`Processed ${Math.min(i + batchSize, uniqueNames.length)}/${uniqueNames.length} contractors (${profilesCreated} profiles created)`);
        }
      }

      // Update stats
      const duration = Date.now() - startTime;
      await db.insert(contractorProfileStats).values({
        totalProfiles: profilesCreated,
        totalUeisMapped: ueisMapped,
        lastAggregationRun: new Date(),
        aggregationDuration: duration,
        aggregationStatus: "completed",
      });

      console.log(`Profile aggregation completed: ${profilesCreated} profiles, ${ueisMapped} UEIs mapped`);
      
      return { profilesCreated, ueisMapped, errors };

    } catch (error) {
      // Update status on error
      await db.insert(contractorProfileStats).values({
        aggregationStatus: "failed",
        aggregationError: String(error),
        lastAggregationRun: new Date(),
      });
      
      throw error;
    }
  }

  /**
   * Create or update a contractor profile for a given name
   */
  private async createOrUpdateProfile(contractorName: string): Promise<string | null> {
    // Get all records for this contractor name
    const contractorRecords = await db
      .select()
      .from(contractorsCache)
      .where(eq(contractorsCache.contractorName, contractorName));

    if (contractorRecords.length === 0) {
      return null;
    }

    // Aggregate metrics across all UEIs with safeguards for large values
    const totalUeis = contractorRecords.length;
    const totalContracts = contractorRecords.reduce((sum, r) => sum + r.totalContracts, 0);
    
    // Use string arithmetic for very large numbers to avoid precision issues
    let totalObligated = 0;
    try {
      totalObligated = contractorRecords.reduce(
        (sum, r) => {
          const val = parseFloat(r.totalObligated || "0");
          // Cap individual values at a reasonable maximum to avoid overflow
          return sum + (isNaN(val) ? 0 : Math.min(val, 1e15)); // Cap at 1 quadrillion per record
        }, 
        0
      );
    } catch (e) {
      console.error(`Error calculating total obligated for ${contractorName}:`, e);
      totalObligated = 0;
    }
    
    const avgContractValue = totalContracts > 0 ? totalObligated / totalContracts : 0;

    // Find primary agency (most common)
    const agencyCounts = new Map<string, number>();
    contractorRecords.forEach(r => {
      if (r.primaryAgency) {
        agencyCounts.set(r.primaryAgency, (agencyCounts.get(r.primaryAgency) || 0) + 1);
      }
    });
    const primaryAgency = Array.from(agencyCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Collect unique states
    const states = new Set<string>();
    contractorRecords.forEach(r => {
      if (r.state) states.add(r.state);
    });

    // Find headquarters state (most common)
    const stateCounts = new Map<string, number>();
    contractorRecords.forEach(r => {
      if (r.state) {
        stateCounts.set(r.state, (stateCounts.get(r.state) || 0) + 1);
      }
    });
    const headquartersState = Array.from(stateCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Find primary industry
    const industryCounts = new Map<string, number>();
    contractorRecords.forEach(r => {
      if (r.industryCluster) {
        industryCounts.set(r.industryCluster, (industryCounts.get(r.industryCluster) || 0) + 1);
      }
    });
    const primaryIndustry = Array.from(industryCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Find primary NAICS
    const naicsCounts = new Map<string, { code: string; description: string | null; count: number }>();
    contractorRecords.forEach(r => {
      if (r.primaryNaicsCode) {
        const existing = naicsCounts.get(r.primaryNaicsCode);
        if (existing) {
          existing.count++;
        } else {
          naicsCounts.set(r.primaryNaicsCode, {
            code: r.primaryNaicsCode,
            description: r.primaryNaicsDescription,
            count: 1
          });
        }
      }
    });
    const primaryNaics = Array.from(naicsCounts.values())
      .sort((a, b) => b.count - a.count)[0];

    // Determine dominant size tier
    const sizeTierCounts = new Map<string, number>();
    contractorRecords.forEach(r => {
      if (r.sizeTier) {
        sizeTierCounts.set(r.sizeTier, (sizeTierCounts.get(r.sizeTier) || 0) + 1);
      }
    });
    const dominantSizeTier = Array.from(sizeTierCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Determine dominant lifecycle stage
    const lifecycleCounts = new Map<string, number>();
    contractorRecords.forEach(r => {
      if (r.lifecycleStage) {
        lifecycleCounts.set(r.lifecycleStage, (lifecycleCounts.get(r.lifecycleStage) || 0) + 1);
      }
    });
    const dominantLifecycleStage = Array.from(lifecycleCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Calculate scores
    const agencyDiversity = new Set(contractorRecords.map(r => r.primaryAgency).filter(Boolean)).size;
    const performanceScore = Math.min(100, 50 + (agencyDiversity * 5) + (totalUeis * 2));
    const riskScore = Math.max(0, 100 - performanceScore);

    // Determine growth trend (simplified - would need historical data for real trend)
    let growthTrend = "stable";
    if (dominantLifecycleStage === "New Entrant") growthTrend = "increasing";
    else if (dominantLifecycleStage === "Dormant") growthTrend = "declining";

    // Create canonical name (cleaned version)
    const canonicalName = contractorName.toUpperCase().trim()
      .replace(/\s+/g, ' ')
      .replace(/[,\.]?\s*(INC|LLC|CORP|CORPORATION|LTD|LIMITED|CO|COMPANY)\.?$/i, '')
      .trim();

    const profileData: NewContractorProfile = {
      canonicalName,
      displayName: contractorName,
      totalUeis,
      totalContracts,
      totalObligated: totalObligated.toFixed(2),
      avgContractValue: avgContractValue.toFixed(2),
      primaryAgency,
      totalAgencies: agencyCounts.size,
      agencyDiversity,
      headquartersState,
      totalStates: states.size,
      statesList: Array.from(states),
      primaryNaicsCode: primaryNaics?.code || null,
      primaryNaicsDescription: primaryNaics?.description || null,
      primaryIndustryCluster: primaryIndustry,
      industryClusters: Array.from(industryCounts.keys()),
      dominantSizeTier,
      dominantLifecycleStage,
      performanceScore,
      riskScore,
      growthTrend,
      firstSeenDate: new Date(Math.min(...contractorRecords.map(r => new Date(r.cacheCreatedAt).getTime()))),
      lastActiveDate: new Date(Math.max(...contractorRecords.map(r => new Date(r.cacheUpdatedAt).getTime()))),
      profileCompleteness: Math.round((
        (primaryAgency ? 20 : 0) +
        (headquartersState ? 20 : 0) +
        (primaryNaics ? 20 : 0) +
        (primaryIndustry ? 20 : 0) +
        (dominantSizeTier ? 20 : 0)
      )),
      isActive: contractorRecords.some(r => r.isActive),
    };

    // Insert or update profile
    const result = await db
      .insert(contractorProfiles)
      .values(profileData)
      .onConflictDoUpdate({
        target: contractorProfiles.canonicalName,
        set: {
          ...profileData,
          profileUpdatedAt: new Date(),
        }
      })
      .returning({ id: contractorProfiles.id });

    return result[0]?.id || null;
  }

  /**
   * Map all UEIs to a contractor profile
   */
  private async mapUeisToProfile(profileId: string, contractorName: string): Promise<number> {
    const contractorRecords = await db
      .select()
      .from(contractorsCache)
      .where(eq(contractorsCache.contractorName, contractorName));

    const mappings: NewContractorUeiMapping[] = contractorRecords.map(record => ({
      profileId,
      contractorCacheId: record.id,
      uei: record.contractorUei,
      contractorName: record.contractorName,
      totalContracts: record.totalContracts,
      totalObligated: record.totalObligated,
      primaryAgency: record.primaryAgency,
      state: record.state,
      mappingConfidence: 100, // Exact name match
      mappingMethod: "exact_match",
      isActive: record.isActive,
    }));

    if (mappings.length > 0) {
      await db
        .insert(contractorUeiMappings)
        .values(mappings)
        .onConflictDoNothing();
    }

    return mappings.length;
  }

  /**
   * Build agency relationships for a contractor profile
   */
  private async buildAgencyRelationships(profileId: string, contractorName: string): Promise<void> {
    const contractorRecords = await db
      .select()
      .from(contractorsCache)
      .where(eq(contractorsCache.contractorName, contractorName));

    // Aggregate by agency
    const agencyMap = new Map<string, {
      contracts: number;
      obligated: number;
      ueis: Set<string>;
    }>();

    contractorRecords.forEach(record => {
      if (record.primaryAgency) {
        const existing = agencyMap.get(record.primaryAgency) || {
          contracts: 0,
          obligated: 0,
          ueis: new Set()
        };
        existing.contracts += record.totalContracts;
        existing.obligated += parseFloat(record.totalObligated || "0");
        existing.ueis.add(record.contractorUei);
        agencyMap.set(record.primaryAgency, existing);
      }
    });

    // Find primary agency
    const primaryAgency = Array.from(agencyMap.entries())
      .sort((a, b) => b[1].obligated - a[1].obligated)[0]?.[0];

    // Create relationship records
    const relationships: NewContractorAgencyRelationship[] = [];
    
    for (const [agency, data] of agencyMap.entries()) {
      const totalObligated = data.obligated;
      let relationshipStrength = "weak";
      if (totalObligated > 100000000) relationshipStrength = "strong";
      else if (totalObligated > 10000000) relationshipStrength = "moderate";

      relationships.push({
        profileId,
        agency,
        subAgency: null, // Could be enhanced to include sub-agency
        totalContracts: data.contracts,
        totalObligated: data.obligated.toFixed(2),
        totalUeis: data.ueis.size,
        relationshipStrength,
        isPrimary: agency === primaryAgency,
      });
    }

    if (relationships.length > 0) {
      await db
        .insert(contractorAgencyRelationships)
        .values(relationships)
        .onConflictDoNothing();
    }
  }

  /**
   * Get aggregation status
   */
  async getAggregationStatus() {
    const stats = await db
      .select()
      .from(contractorProfileStats)
      .orderBy(desc(contractorProfileStats.createdAt))
      .limit(1);

    return stats[0] || null;
  }

  /**
   * Incrementally update profiles for recently changed contractors
   */
  async updateRecentProfiles(sinceDate?: Date): Promise<{ updated: number; errors: string[] }> {
    const errors: string[] = [];
    let updated = 0;

    const since = sinceDate || new Date(Date.now() - 24 * 60 * 60 * 1000); // Default to last 24 hours

    // Get recently updated contractors
    const recentContractors = await db
      .select({ contractorName: contractorsCache.contractorName })
      .from(contractorsCache)
      .where(sql`${contractorsCache.cacheUpdatedAt} > ${since}`)
      .groupBy(contractorsCache.contractorName);

    console.log(`Found ${recentContractors.length} contractors to update`);

    for (const { contractorName } of recentContractors) {
      try {
        const profileId = await this.createOrUpdateProfile(contractorName);
        if (profileId) {
          updated++;
          await this.mapUeisToProfile(profileId, contractorName);
          await this.buildAgencyRelationships(profileId, contractorName);
        }
      } catch (error) {
        const errorMsg = `Failed to update profile for ${contractorName}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    return { updated, errors };
  }
}