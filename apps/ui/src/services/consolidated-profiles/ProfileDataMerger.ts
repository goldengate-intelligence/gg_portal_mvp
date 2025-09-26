import {
  ConsolidatedContractorProfile,
  SnowflakeContractorData,
  LushaEnrichmentData,
  AIGeneratedInsights,
  NetworkRelationshipData,
  CacheMetadata,
  DataSource
} from '../../types/consolidated-profile';
import { performanceInsightsService } from '../performance-insights';

/**
 * Service responsible for merging data from various sources into consolidated profiles
 * Handles data conflicts, prioritization, and smart merging strategies
 */
export class ProfileDataMerger {

  /**
   * Merge multiple data sources into a single consolidated profile
   */
  async mergeDataSources(
    uei: string,
    sources: {
      snowflake?: SnowflakeContractorData;
      lusha?: LushaEnrichmentData;
      aiInsights?: AIGeneratedInsights;
      networkData?: NetworkRelationshipData;
    }
  ): Promise<ConsolidatedContractorProfile> {
    const now = new Date().toISOString();

    // Determine the primary name using priority order
    const primaryName = this.resolvePrimaryName(sources);
    const alternativeNames = this.collectAlternativeNames(sources, primaryName);

    // Build consolidated profile
    const consolidatedProfile: ConsolidatedContractorProfile = {
      profileId: '', // Will be set by service
      uei,
      primaryName,
      alternativeNames,
      dataCompleteness: this.calculateDataCompleteness(sources),
      snowflakeData: sources.snowflake,
      lushaData: sources.lusha,
      aiInsights: sources.aiInsights,
      networkData: sources.networkData,
      profileMetadata: {
        createdAt: now,
        lastUpdatedAt: now,
        version: 1,
        sources: this.getActiveSources(sources),
        refreshSchedule: {
          snowflakeRefresh: '0 2 * * *', // Daily at 2 AM
          lushaRefresh: '0 3 * * 0',    // Weekly on Sunday at 3 AM
          aiRefresh: '0 4 * * 0'        // Weekly on Sunday at 4 AM
        }
      },
      quickAccess: this.buildQuickAccessData(sources)
    };

    return consolidatedProfile;
  }

  /**
   * Merge new data into existing profile, handling conflicts intelligently
   */
  async updateProfile(
    existingProfile: ConsolidatedContractorProfile,
    newData: {
      dataSource: DataSource;
      data: SnowflakeContractorData | LushaEnrichmentData | AIGeneratedInsights | NetworkRelationshipData;
    }
  ): Promise<ConsolidatedContractorProfile> {
    const updatedProfile = { ...existingProfile };

    // Update the specific data source
    switch (newData.dataSource) {
      case 'snowflake':
        updatedProfile.snowflakeData = newData.data as SnowflakeContractorData;
        break;
      case 'lusha':
        updatedProfile.lushaData = newData.data as LushaEnrichmentData;
        break;
      case 'anthropic':
        updatedProfile.aiInsights = newData.data as AIGeneratedInsights;
        break;
      case 'calculated':
        updatedProfile.networkData = newData.data as NetworkRelationshipData;
        break;
    }

    // Recalculate derived fields
    const sources = {
      snowflake: updatedProfile.snowflakeData,
      lusha: updatedProfile.lushaData,
      aiInsights: updatedProfile.aiInsights,
      networkData: updatedProfile.networkData
    };

    updatedProfile.dataCompleteness = this.calculateDataCompleteness(sources);
    updatedProfile.quickAccess = this.buildQuickAccessData(sources);
    updatedProfile.profileMetadata.lastUpdatedAt = new Date().toISOString();
    updatedProfile.profileMetadata.version += 1;
    updatedProfile.profileMetadata.sources = this.getActiveSources(sources);

    // Re-evaluate primary name if it might have changed
    const newPrimaryName = this.resolvePrimaryName(sources);
    if (newPrimaryName !== updatedProfile.primaryName) {
      updatedProfile.primaryName = newPrimaryName;
      updatedProfile.alternativeNames = this.collectAlternativeNames(sources, newPrimaryName);
    }

    return updatedProfile;
  }

  /**
   * Generate AI insights for a profile using Snowflake performance data
   */
  async generateAIInsights(
    uei: string,
    contractorName: string,
    snowflakeData: SnowflakeContractorData
  ): Promise<AIGeneratedInsights> {
    if (!snowflakeData.performanceScores) {
      throw new Error('Performance scores required for AI insight generation');
    }

    // Find strongest and weakest attributes
    const scores = snowflakeData.performanceScores;
    const scoreEntries = Object.entries(scores).filter(([key]) => key !== 'composite' && scores[key] !== undefined);

    scoreEntries.sort((a, b) => b[1] - a[1]);
    const strongest = scoreEntries[0];
    const weakest = scoreEntries[scoreEntries.length - 1];

    // Prepare data for performance insights service
    const insightData = {
      uei,
      contractorName,
      strongestAttribute: {
        name: this.formatAttributeName(strongest[0]),
        score: strongest[1]
      },
      weakestAttribute: {
        name: this.formatAttributeName(weakest[0]),
        score: weakest[1]
      },
      allScores: {
        awards: scores.awards || 0,
        revenue: scores.revenue || 0,
        pipeline: scores.pipeline || 0,
        duration: scores.duration || 0,
        growth: scores.growth || 0
      },
      peerGroupContext: {
        naicsCode: snowflakeData.peerGroup.naicsCode,
        groupSize: snowflakeData.peerGroup.groupSize,
        entityClassification: snowflakeData.peerGroup.entityClassification
      }
    };

    // Generate performance insights
    const performanceInsight = await performanceInsightsService.generatePerformanceInsights(insightData);

    // Build AI insights object
    const aiInsights: AIGeneratedInsights = {
      performanceInsights: {
        strongestHeadline: performanceInsight.strongestHeadline,
        strongestInsight: performanceInsight.strongestInsight,
        weakestHeadline: performanceInsight.weakestHeadline,
        weakestInsight: performanceInsight.weakestInsight,
        confidenceScore: 85 // Base confidence for performance insights
      },
      marketInsights: this.generateMarketInsights(snowflakeData),
      networkInsights: this.generateNetworkInsights(snowflakeData),
      cache: {
        source: 'anthropic',
        fetchedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        version: 1,
        isStale: false
      }
    };

    return aiInsights;
  }

  /**
   * Create Lusha enrichment data from minimal company information
   */
  createLushaData(
    companyName: string,
    website?: string,
    domain?: string,
    additionalData?: Partial<LushaEnrichmentData>
  ): LushaEnrichmentData {
    return {
      companyDetails: {
        name: companyName,
        website: website,
        domain: domain || this.extractDomainFromWebsite(website),
        description: additionalData?.companyDetails?.description,
        foundedYear: additionalData?.companyDetails?.foundedYear,
        employeeCount: additionalData?.companyDetails?.employeeCount,
        annualRevenue: additionalData?.companyDetails?.annualRevenue,
        industry: additionalData?.companyDetails?.industry,
        companyType: additionalData?.companyDetails?.companyType
      },
      location: additionalData?.location || {},
      digitalPresence: additionalData?.digitalPresence || {},
      contactInfo: additionalData?.contactInfo || {
        contactsAvailable: 0
      },
      technologies: additionalData?.technologies || [],
      cache: {
        source: 'lusha',
        fetchedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        version: 1,
        isStale: false
      }
    };
  }

  /**
   * Validate and clean data before merging
   */
  validateAndCleanData(data: any, dataSource: DataSource): boolean {
    switch (dataSource) {
      case 'snowflake':
        return this.validateSnowflakeData(data);
      case 'lusha':
        return this.validateLushaData(data);
      case 'anthropic':
        return this.validateAIData(data);
      case 'calculated':
        return this.validateNetworkData(data);
      default:
        return false;
    }
  }

  /**
   * Detect and resolve data conflicts between sources
   */
  resolveDataConflicts(existingData: any, newData: any, dataSource: DataSource): any {
    // For most cases, newer data takes precedence
    // But preserve certain stable fields from existing data if they exist
    const resolved = { ...newData };

    if (dataSource === 'lusha' && existingData) {
      // Preserve founded year if not provided in new data but exists in old
      if (!resolved.companyDetails?.foundedYear && existingData.companyDetails?.foundedYear) {
        resolved.companyDetails = {
          ...resolved.companyDetails,
          foundedYear: existingData.companyDetails.foundedYear
        };
      }
    }

    return resolved;
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private resolvePrimaryName(sources: any): string {
    // Priority order for name resolution
    if (sources.lusha?.companyDetails?.name) {
      return sources.lusha.companyDetails.name;
    }
    if (sources.snowflake?.recipientName) {
      return sources.snowflake.recipientName;
    }
    return 'Unknown Company';
  }

  private collectAlternativeNames(sources: any, primaryName: string): string[] {
    const alternativeNames: string[] = [];

    // Collect names from different sources
    const candidateNames = [
      sources.snowflake?.recipientName,
      sources.lusha?.companyDetails?.name
    ].filter(name => name && name !== primaryName);

    // Remove duplicates and return
    return [...new Set(candidateNames)];
  }

  private calculateDataCompleteness(sources: any): any {
    const hasSnowflake = !!sources.snowflake;
    const hasLusha = !!sources.lusha;
    const hasAi = !!sources.aiInsights;
    const hasNetwork = !!sources.networkData;

    const overall = (
      (hasSnowflake ? 40 : 0) +
      (hasLusha ? 30 : 0) +
      (hasAi ? 20 : 0) +
      (hasNetwork ? 10 : 0)
    );

    return {
      overall,
      snowflakeData: hasSnowflake,
      lushaEnrichment: hasLusha,
      aiInsights: hasAi,
      networkAnalysis: hasNetwork
    };
  }

  private getActiveSources(sources: any): DataSource[] {
    const activeSources: DataSource[] = [];
    if (sources.snowflake) activeSources.push('snowflake');
    if (sources.lusha) activeSources.push('lusha');
    if (sources.aiInsights) activeSources.push('anthropic');
    if (sources.networkData) activeSources.push('calculated');
    return activeSources;
  }

  private buildQuickAccessData(sources: any): any {
    const snowflake = sources.snowflake;
    const lusha = sources.lusha;

    return {
      displayName: this.resolvePrimaryName(sources),
      primaryIndustry: snowflake?.primaryNaicsDescription || 'Unknown',
      sizeTier: snowflake?.sizeTier || 'Unknown',
      performanceRating: snowflake?.peerGroup?.performanceClassification || 'Unknown',
      lastActivityDate: snowflake?.snapshotMonth || new Date().toISOString(),
      totalContractValue: snowflake?.revenueTtmMillions || 0,
      websiteUrl: lusha?.companyDetails?.website,
      logoUrl: lusha?.digitalPresence?.logoUrl
    };
  }

  private formatAttributeName(attribute: string): string {
    const nameMap: Record<string, string> = {
      'awards': 'Awards Captured',
      'revenue': 'Revenue Performance',
      'pipeline': 'Pipeline Development',
      'duration': 'Portfolio Duration',
      'growth': 'Growth Rate',
      'networkActivity': 'Network Activity'
    };
    return nameMap[attribute] || attribute;
  }

  private generateMarketInsights(snowflakeData: SnowflakeContractorData): any {
    const insights: any = {
      competitiveAdvantages: [],
      marketOpportunities: [],
      riskFactors: [],
      strategicRecommendations: []
    };

    // Analyze performance tier
    const performanceTier = snowflakeData.peerGroup.performanceTier;
    if (performanceTier === 'Top 10%' || performanceTier === 'Top 25%') {
      insights.competitiveAdvantages.push('Industry-leading performance metrics');
    }

    // Analyze growth trends
    if (snowflakeData.blendedGrowthScore && snowflakeData.blendedGrowthScore > 75) {
      insights.competitiveAdvantages.push('Strong growth trajectory');
      insights.marketOpportunities.push('Expansion into adjacent markets');
    } else if (snowflakeData.blendedGrowthScore && snowflakeData.blendedGrowthScore < 25) {
      insights.riskFactors.push('Below-average growth performance');
      insights.strategicRecommendations.push('Focus on growth initiatives');
    }

    // Analyze market share
    if (snowflakeData.peerGroup.marketSharePercent > 10) {
      insights.competitiveAdvantages.push('Significant market presence');
    }

    return insights;
  }

  private generateNetworkInsights(snowflakeData: SnowflakeContractorData): any {
    const insights: any = {
      primaryRelationships: [],
      networkStrength: 'Moderate',
      diversificationLevel: 'Medium'
    };

    // Basic network analysis based on entity classification
    switch (snowflakeData.entityClassification) {
      case 'Pure Prime':
      case 'Teaming Prime':
        insights.primaryRelationships.push('Government agencies', 'Subcontractors');
        insights.networkStrength = 'Strong';
        break;
      case 'Pure Sub':
      case 'Iceberg Sub':
        insights.primaryRelationships.push('Prime contractors');
        insights.diversificationLevel = 'Low';
        break;
      case 'Hybrid':
        insights.primaryRelationships.push('Government agencies', 'Prime contractors', 'Subcontractors');
        insights.networkStrength = 'Strong';
        insights.diversificationLevel = 'High';
        break;
    }

    // Analyze defense vs civilian focus
    if (snowflakeData.agencyFocus === 'Defense') {
      insights.primaryRelationships.push('Defense agencies');
    } else {
      insights.primaryRelationships.push('Civilian agencies');
    }

    return insights;
  }

  private extractDomainFromWebsite(website?: string): string | undefined {
    if (!website) return undefined;

    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      return url.hostname;
    } catch {
      return undefined;
    }
  }

  private validateSnowflakeData(data: SnowflakeContractorData): boolean {
    return !!(
      data.uei &&
      data.recipientName &&
      data.revenueTtmMillions !== undefined &&
      data.performanceScores &&
      data.peerGroup
    );
  }

  private validateLushaData(data: LushaEnrichmentData): boolean {
    return !!(data.companyDetails && data.companyDetails.name);
  }

  private validateAIData(data: AIGeneratedInsights): boolean {
    return !!(
      data.performanceInsights &&
      data.performanceInsights.strongestHeadline &&
      data.performanceInsights.weakestHeadline
    );
  }

  private validateNetworkData(data: NetworkRelationshipData): boolean {
    return !!(data.networkDistribution);
  }
}

export const profileDataMerger = new ProfileDataMerger();