import { ConsolidatedProfileService } from './ConsolidatedProfileService';
import { ProfileDataMerger } from './ProfileDataMerger';
import {
  ConsolidatedContractorProfile,
  SnowflakeContractorData,
  LushaEnrichmentData,
  AIGeneratedInsights,
  NetworkRelationshipData
} from '../../types/consolidated-profile';
import { Contractor } from '../../types/index';
import { Database } from '../database';

/**
 * Adapter service that integrates consolidated profiles with existing application services
 * Provides backward compatibility and gradual migration path
 */
export class ConsolidatedProfileAdapter {
  private consolidatedService: ConsolidatedProfileService;
  private dataMerger: ProfileDataMerger;

  constructor(database: Database) {
    this.consolidatedService = new ConsolidatedProfileService(database);
    this.dataMerger = new ProfileDataMerger();
  }

  // ==================== EXISTING SERVICE INTEGRATION ====================

  /**
   * Convert consolidated profile to legacy Contractor format for backward compatibility
   */
  toLegacyContractor(profile: ConsolidatedContractorProfile): Contractor {
    const snowflake = profile.snowflakeData;
    const lusha = profile.lushaData;

    return {
      id: profile.profileId,
      uei: profile.uei,
      name: profile.primaryName,
      dbaName: profile.alternativeNames[0],

      // Map industry from NAICS
      industry: this.mapNaicsToIndustry(snowflake?.primaryNaicsCode),
      location: lusha?.location?.country === 'US' ? 'US' : 'International',
      state: lusha?.location?.state,
      country: lusha?.location?.country,
      city: lusha?.location?.city,

      // Financial data from Snowflake
      annualRevenue: snowflake ? snowflake.revenueTtmMillions * 1000000 : undefined,
      employeeCount: lusha?.companyDetails?.employeeCount,
      foundedYear: lusha?.companyDetails?.foundedYear,
      establishedDate: lusha?.companyDetails?.foundedYear ? new Date(lusha.companyDetails.foundedYear, 0, 1) : undefined,

      // Performance indicators
      lifecycleStage: this.mapPerformanceToLifecycle(snowflake?.peerGroup?.performanceClassification),
      businessMomentum: this.mapGrowthToMomentum(snowflake?.blendedGrowthScore),
      ownershipType: 'private', // Default, could be enhanced with additional data
      growthPotential: snowflake?.performanceScores?.growth,
      marketPosition: snowflake?.performanceScores?.composite,

      // Contract data
      totalContractValue: snowflake ? snowflake.revenueTtmMillions * 1000000 : undefined,
      activeContracts: undefined, // Could be calculated from network data
      pastPerformanceScore: snowflake?.performanceScores?.composite,

      // Media
      profilePhotoUrl: undefined,
      logoUrl: lusha?.digitalPresence?.logoUrl,
      website: lusha?.companyDetails?.website,

      // Metadata
      createdAt: new Date(profile.profileMetadata.createdAt),
      updatedAt: new Date(profile.profileMetadata.lastUpdatedAt),
      lastVerified: new Date(profile.profileMetadata.lastUpdatedAt),

      // Profile-specific aggregated data
      totalUeis: 1,
      primaryAgency: this.extractPrimaryAgency(profile.networkData),
      totalAgencies: this.countAgencies(profile.networkData),
      agencyDiversity: this.calculateAgencyDiversity(profile.networkData),
      totalStates: lusha?.location?.state ? 1 : 0,
      statesList: lusha?.location?.state ? [lusha.location.state] : [],
      primaryNaicsCode: snowflake?.primaryNaicsCode,
      primaryNaicsDescription: snowflake?.primaryNaicsDescription,
      industryClusters: snowflake?.primaryNaicsDescription ? [snowflake.primaryNaicsDescription] : [],
      sizeTier: snowflake?.sizeTier,
      performanceScore: snowflake?.performanceScores?.composite,
      profileCompleteness: profile.dataCompleteness.overall
    };
  }

  /**
   * Enhanced contractor lookup that leverages consolidated profiles
   */
  async getEnhancedContractor(uei: string): Promise<Contractor | null> {
    const profile = await this.consolidatedService.getProfileByUEI(uei);

    if (!profile) {
      return null;
    }

    return this.toLegacyContractor(profile);
  }

  /**
   * Batch contractor lookup with consolidated profile efficiency
   */
  async getEnhancedContractors(ueis: string[]): Promise<Contractor[]> {
    const profiles = await this.consolidatedService.getProfiles({
      ueis: ueis
    });

    return profiles.profiles.map(profile => this.toLegacyContractor(profile));
  }

  /**
   * Enhanced search with consolidated profile power
   */
  async searchEnhancedContractors(
    query: string,
    filters: any = {},
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ contractors: Contractor[]; totalCount: number }> {
    // Convert legacy filters to consolidated profile filters
    const consolidatedFilters = this.convertLegacyFilters(filters);

    const result = await this.consolidatedService.searchProfiles(query, consolidatedFilters, options);

    return {
      contractors: result.profiles.map(profile => this.toLegacyContractor(profile)),
      totalCount: result.totalCount
    };
  }

  // ==================== DATA SOURCE INTEGRATION ====================

  /**
   * Integrate Snowflake data into consolidated profiles
   */
  async integrateSnowflakeData(
    uei: string,
    snowflakeData: {
      recipientName: string;
      entityClassification: string;
      revenueTtmMillions: number;
      awardsTtmMillions: number;
      calculatedPipelineMillions: number;
      performanceScores: any;
      peerGroup: any;
      primaryNaicsCode: string;
      primaryNaicsDescription: string;
      agencyFocus: string;
      sizeTier: string;
      blendedGrowthScore?: number;
    }
  ): Promise<ConsolidatedContractorProfile> {
    const consolidatedData: SnowflakeContractorData = {
      uei,
      recipientName: snowflakeData.recipientName,
      entityClassification: snowflakeData.entityClassification as any,
      revenueTtmMillions: snowflakeData.revenueTtmMillions,
      awardsTtmMillions: snowflakeData.awardsTtmMillions,
      subcontractingTtmMillions: 0, // Default, could be enhanced
      calculatedPipelineMillions: snowflakeData.calculatedPipelineMillions,
      avgContractDurationMonths: 12, // Default, could be enhanced
      blendedGrowthScore: snowflakeData.blendedGrowthScore,
      primaryNaicsCode: snowflakeData.primaryNaicsCode,
      primaryNaicsDescription: snowflakeData.primaryNaicsDescription,
      agencyFocus: snowflakeData.agencyFocus as 'Defense' | 'Civilian',
      sizeTier: snowflakeData.sizeTier as any,
      performanceScores: snowflakeData.performanceScores,
      peerGroup: snowflakeData.peerGroup,
      snapshotMonth: new Date().toISOString().substring(0, 7) + '-01',
      cache: {
        source: 'snowflake',
        fetchedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day
        version: 1,
        isStale: false
      }
    };

    return await this.consolidatedService.updateProfileDataSource(uei, 'snowflake', consolidatedData);
  }

  /**
   * Integrate Lusha data into consolidated profiles
   */
  async integrateLushaData(
    uei: string,
    lushaData: {
      companyName: string;
      website?: string;
      domain?: string;
      location?: any;
      companyDetails?: any;
      digitalPresence?: any;
      contactInfo?: any;
    }
  ): Promise<ConsolidatedContractorProfile> {
    const consolidatedData = this.dataMerger.createLushaData(
      lushaData.companyName,
      lushaData.website,
      lushaData.domain,
      {
        location: lushaData.location,
        companyDetails: lushaData.companyDetails,
        digitalPresence: lushaData.digitalPresence,
        contactInfo: lushaData.contactInfo
      }
    );

    return await this.consolidatedService.updateProfileDataSource(uei, 'lusha', consolidatedData);
  }

  /**
   * Generate and integrate AI insights
   */
  async generateAIInsights(uei: string): Promise<ConsolidatedContractorProfile> {
    const profile = await this.consolidatedService.getProfileByUEI(uei);

    if (!profile || !profile.snowflakeData) {
      throw new Error('Snowflake data required for AI insight generation');
    }

    const aiInsights = await this.dataMerger.generateAIInsights(
      uei,
      profile.primaryName,
      profile.snowflakeData
    );

    return await this.consolidatedService.updateProfileDataSource(uei, 'anthropic', aiInsights);
  }

  /**
   * Integrate network relationship data
   */
  async integrateNetworkData(
    uei: string,
    networkData: NetworkRelationshipData
  ): Promise<ConsolidatedContractorProfile> {
    return await this.consolidatedService.updateProfileDataSource(uei, 'calculated', networkData);
  }

  // ==================== MIGRATION AND MAINTENANCE ====================

  /**
   * Migrate existing contractor data to consolidated profiles
   */
  async migrateContractorToProfile(contractor: Contractor): Promise<ConsolidatedContractorProfile> {
    // Create minimal Lusha data from contractor info
    const lushaData = this.dataMerger.createLushaData(
      contractor.name,
      contractor.website,
      undefined,
      {
        location: {
          state: contractor.state,
          country: contractor.country,
          city: contractor.city
        },
        companyDetails: {
          foundedYear: contractor.foundedYear,
          employeeCount: contractor.employeeCount,
          annualRevenue: contractor.annualRevenue
        },
        digitalPresence: {
          logoUrl: contractor.logoUrl
        }
      }
    );

    // Create profile with available data
    const profileData = {
      uei: contractor.uei,
      primaryName: contractor.name,
      alternativeNames: contractor.dbaName ? [contractor.dbaName] : [],
      lushaData: lushaData
    };

    return await this.consolidatedService.upsertProfile(profileData);
  }

  /**
   * Bulk migration of contractors to profiles
   */
  async bulkMigrateContractors(contractors: Contractor[]): Promise<{
    successful: string[];
    failed: Array<{ uei: string; error: string }>;
  }> {
    const successful: string[] = [];
    const failed: Array<{ uei: string; error: string }> = [];

    for (const contractor of contractors) {
      try {
        await this.migrateContractorToProfile(contractor);
        successful.push(contractor.uei);
      } catch (error) {
        failed.push({
          uei: contractor.uei,
          error: error.message
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Schedule refresh for profiles that need updates
   */
  async scheduleProfileRefresh(priority: 'low' | 'normal' | 'high' = 'normal'): Promise<void> {
    const stalePr��iles = await this.consolidatedService.getProfilesNeedingRefresh();

    for (const profile of staleProfiles) {
      // Queue for refresh based on what needs updating
      if (profile.needsSnowflakeRefresh) {
        // Queue Snowflake data refresh
        console.log(`Queueing Snowflake refresh for ${profile.uei}`);
      }

      if (profile.needsLushaRefresh) {
        // Queue Lusha data refresh
        console.log(`Queueing Lusha refresh for ${profile.uei}`);
      }

      if (profile.needsAiRefresh) {
        // Queue AI insights refresh
        console.log(`Queueing AI refresh for ${profile.uei}`);
      }

      // In a real implementation, these would be added to job queues
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private mapNaicsToIndustry(naicsCode?: string): any {
    if (!naicsCode) return 'other';

    const naics2 = naicsCode.substring(0, 2);
    const industryMapping: Record<string, any> = {
      '11': 'agriculture',
      '21': 'energy',
      '22': 'energy',
      '23': 'construction',
      '31': 'manufacturing',
      '32': 'manufacturing',
      '33': 'manufacturing',
      '42': 'professional-services',
      '44': 'professional-services',
      '45': 'professional-services',
      '48': 'transportation',
      '49': 'transportation',
      '51': 'information-technology',
      '52': 'financial-services',
      '53': 'professional-services',
      '54': 'professional-services',
      '55': 'professional-services',
      '56': 'professional-services',
      '61': 'education',
      '62': 'healthcare',
      '71': 'professional-services',
      '72': 'professional-services',
      '81': 'professional-services',
      '92': 'defense'
    };

    return industryMapping[naics2] || 'other';
  }

  private mapPerformanceToLifecycle(performanceClassification?: string): any {
    switch (performanceClassification) {
      case 'Elite':
      case 'Strong':
        return 'active';
      case 'Stable':
        return 'option-period';
      case 'Emerging':
        return 'pre-award';
      default:
        return 'active';
    }
  }

  private mapGrowthToMomentum(growthScore?: number): any {
    if (!growthScore) return 'stable';

    if (growthScore >= 90) return 'high-growth';
    if (growthScore >= 70) return 'steady-growth';
    if (growthScore >= 40) return 'stable';
    if (growthScore >= 20) return 'declining';
    return 'volatile';
  }

  private extractPrimaryAgency(networkData?: NetworkRelationshipData): string | null {
    if (!networkData?.topAgencies || networkData.topAgencies.length === 0) {
      return null;
    }

    return networkData.topAgencies[0].name;
  }

  private countAgencies(networkData?: NetworkRelationshipData): number {
    return networkData?.topAgencies?.length || 0;
  }

  private calculateAgencyDiversity(networkData?: NetworkRelationshipData): number {
    if (!networkData?.topAgencies || networkData.topAgencies.length === 0) {
      return 0;
    }

    // Simple diversity calculation based on distribution
    const agencies = networkData.topAgencies;
    if (agencies.length === 1) return 25;
    if (agencies.length <= 3) return 50;
    if (agencies.length <= 5) return 75;
    return 100;
  }

  private convertLegacyFilters(legacyFilters: any): any {
    // Convert legacy search filters to consolidated profile filters
    const consolidatedFilters: any = {};

    if (legacyFilters.sectors) {
      consolidatedFilters.industries = legacyFilters.sectors;
    }

    if (legacyFilters.states) {
      consolidatedFilters.states = legacyFilters.states;
    }

    if (legacyFilters.minPerformanceScore) {
      consolidatedFilters.minPerformanceScore = legacyFilters.minPerformanceScore;
    }

    if (legacyFilters.revenueMin) {
      consolidatedFilters.minRevenue = legacyFilters.revenueMin;
    }

    if (legacyFilters.revenueMax) {
      consolidatedFilters.maxRevenue = legacyFilters.revenueMax;
    }

    return consolidatedFilters;
  }
}

export const consolidatedProfileAdapter = new ConsolidatedProfileAdapter(new Database());