import { db } from '../../db';
import { contractorsCache, type ContractorCache } from '../../db/schema/contractors-cache';
import { eq, and, or, like, ilike, gte, lte, inArray, sql, desc, asc } from 'drizzle-orm';

export interface ContractorFilter {
  search?: string;
  contractorUei?: string;
  state?: string | string[];
  primaryAgency?: string | string[];
  industryCluster?: string | string[];
  lifecycleStage?: string | string[];
  sizeTier?: string | string[];
  sizeQuartile?: string | string[];
  minTotalObligated?: number;
  maxTotalObligated?: number;
  minContracts?: number;
  maxContracts?: number;
  minAgencyDiversity?: number;
}

export interface ContractorQueryOptions {
  filters?: ContractorFilter;
  page?: number;
  limit?: number;
  sortBy?: keyof ContractorCache;
  sortOrder?: 'asc' | 'desc';
}

export interface ContractorQueryResult {
  data: ContractorCache[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  aggregations?: {
    totalObligated: string;
    averageContracts: number;
    uniqueAgencies: number;
    uniqueStates: number;
  };
}

export class ContractorQueryService {
  /**
   * Query contractors with filters and pagination
   */
  async queryContractors(options: ContractorQueryOptions = {}): Promise<ContractorQueryResult> {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions = this.buildWhereConditions(options.filters);

    // Count total records
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(contractorsCache)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(totalResult[0]?.count || 0);

    // Build query with sorting
    let query = db
      .select()
      .from(contractorsCache)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset);

    // Apply sorting
    if (options.sortBy) {
      const sortColumn = contractorsCache[options.sortBy];
      if (sortColumn) {
        query = query.orderBy(
          options.sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn)
        );
      }
    } else {
      // Default sort by total obligated descending
      query = query.orderBy(desc(contractorsCache.totalObligated));
    }

    const data = await query;

    // Get aggregations if requested
    const aggregations = await this.getAggregations(conditions);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      aggregations,
    };
  }

  /**
   * Get contractor by UEI
   */
  async getContractorByUei(uei: string): Promise<ContractorCache | null> {
    const result = await db
      .select()
      .from(contractorsCache)
      .where(eq(contractorsCache.contractorUei, uei))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Search contractors by name
   */
  async searchContractors(
    searchTerm: string,
    limit: number = 20
  ): Promise<ContractorCache[]> {
    const searchPattern = `%${searchTerm}%`;
    
    return await db
      .select()
      .from(contractorsCache)
      .where(
        or(
          ilike(contractorsCache.contractorName, searchPattern),
          eq(contractorsCache.contractorUei, searchTerm)
        )
      )
      .orderBy(desc(contractorsCache.totalObligated))
      .limit(limit);
  }

  /**
   * Get top contractors by various metrics
   */
  async getTopContractors(options: {
    metric: 'totalObligated' | 'totalContracts' | 'agencyDiversity';
    limit?: number;
    filters?: ContractorFilter;
  }): Promise<ContractorCache[]> {
    const conditions = this.buildWhereConditions(options.filters);
    const limit = options.limit || 10;

    let query = db
      .select()
      .from(contractorsCache)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit);

    switch (options.metric) {
      case 'totalObligated':
        query = query.orderBy(desc(contractorsCache.totalObligated));
        break;
      case 'totalContracts':
        query = query.orderBy(desc(contractorsCache.totalContracts));
        break;
      case 'agencyDiversity':
        query = query.orderBy(desc(contractorsCache.agencyDiversity));
        break;
    }

    return await query;
  }

  /**
   * Get unique values for filters
   */
  async getFilterOptions(): Promise<{
    states: string[];
    agencies: string[];
    industryClusters: string[];
    lifecycleStages: string[];
    sizeTiers: string[];
    sizeQuartiles: string[];
  }> {
    const [states, agencies, industryClusters, lifecycleStages, sizeTiers, sizeQuartiles] = 
      await Promise.all([
        db
          .selectDistinct({ value: contractorsCache.state })
          .from(contractorsCache)
          .where(sql`${contractorsCache.state} IS NOT NULL`)
          .orderBy(contractorsCache.state),
        
        db
          .selectDistinct({ value: contractorsCache.primaryAgency })
          .from(contractorsCache)
          .where(sql`${contractorsCache.primaryAgency} IS NOT NULL`)
          .orderBy(contractorsCache.primaryAgency),
        
        db
          .selectDistinct({ value: contractorsCache.industryCluster })
          .from(contractorsCache)
          .where(sql`${contractorsCache.industryCluster} IS NOT NULL`)
          .orderBy(contractorsCache.industryCluster),
        
        db
          .selectDistinct({ value: contractorsCache.lifecycleStage })
          .from(contractorsCache)
          .where(sql`${contractorsCache.lifecycleStage} IS NOT NULL`)
          .orderBy(contractorsCache.lifecycleStage),
        
        db
          .selectDistinct({ value: contractorsCache.sizeTier })
          .from(contractorsCache)
          .where(sql`${contractorsCache.sizeTier} IS NOT NULL`)
          .orderBy(contractorsCache.sizeTier),
        
        db
          .selectDistinct({ value: contractorsCache.sizeQuartile })
          .from(contractorsCache)
          .where(sql`${contractorsCache.sizeQuartile} IS NOT NULL`)
          .orderBy(contractorsCache.sizeQuartile),
      ]);

    return {
      states: states.map(s => s.value).filter(Boolean) as string[],
      agencies: agencies.map(a => a.value).filter(Boolean) as string[],
      industryClusters: industryClusters.map(i => i.value).filter(Boolean) as string[],
      lifecycleStages: lifecycleStages.map(l => l.value).filter(Boolean) as string[],
      sizeTiers: sizeTiers.map(s => s.value).filter(Boolean) as string[],
      sizeQuartiles: sizeQuartiles.map(s => s.value).filter(Boolean) as string[],
    };
  }

  /**
   * Get statistics
   */
  async getStatistics(filters?: ContractorFilter): Promise<{
    totalContractors: number;
    totalObligated: string;
    averageObligated: string;
    totalContracts: number;
    averageContracts: number;
    topStates: Array<{ state: string; count: number }>;
    topAgencies: Array<{ agency: string; count: number }>;
    topIndustries: Array<{ industry: string; count: number }>;
  }> {
    const conditions = this.buildWhereConditions(filters);
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get basic statistics
    const stats = await db
      .select({
        totalContractors: sql<number>`count(*)`,
        totalObligated: sql<string>`sum(${contractorsCache.totalObligated})`,
        averageObligated: sql<string>`avg(${contractorsCache.totalObligated})`,
        totalContracts: sql<number>`sum(${contractorsCache.totalContracts})`,
        averageContracts: sql<number>`avg(${contractorsCache.totalContracts})`,
      })
      .from(contractorsCache)
      .where(whereClause);

    // Get top states
    const topStates = await db
      .select({
        state: contractorsCache.state,
        count: sql<number>`count(*)`,
      })
      .from(contractorsCache)
      .where(whereClause)
      .groupBy(contractorsCache.state)
      .having(sql`${contractorsCache.state} IS NOT NULL`)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    // Get top agencies
    const topAgencies = await db
      .select({
        agency: contractorsCache.primaryAgency,
        count: sql<number>`count(*)`,
      })
      .from(contractorsCache)
      .where(whereClause)
      .groupBy(contractorsCache.primaryAgency)
      .having(sql`${contractorsCache.primaryAgency} IS NOT NULL`)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    // Get top industries
    const topIndustries = await db
      .select({
        industry: contractorsCache.industryCluster,
        count: sql<number>`count(*)`,
      })
      .from(contractorsCache)
      .where(whereClause)
      .groupBy(contractorsCache.industryCluster)
      .having(sql`${contractorsCache.industryCluster} IS NOT NULL`)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    return {
      totalContractors: Number(stats[0]?.totalContractors || 0),
      totalObligated: stats[0]?.totalObligated || '0',
      averageObligated: stats[0]?.averageObligated || '0',
      totalContracts: Number(stats[0]?.totalContracts || 0),
      averageContracts: Number(stats[0]?.averageContracts || 0),
      topStates: topStates.map(s => ({ 
        state: s.state || 'Unknown', 
        count: Number(s.count) 
      })),
      topAgencies: topAgencies.map(a => ({ 
        agency: a.agency || 'Unknown', 
        count: Number(a.count) 
      })),
      topIndustries: topIndustries.map(i => ({ 
        industry: i.industry || 'Unknown', 
        count: Number(i.count) 
      })),
    };
  }

  /**
   * Build WHERE conditions from filters
   */
  private buildWhereConditions(filters?: ContractorFilter): any[] {
    const conditions: any[] = [];

    if (!filters) return conditions;

    // Text search
    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(contractorsCache.contractorName, searchPattern),
          eq(contractorsCache.contractorUei, filters.search),
          ilike(contractorsCache.primaryNaicsDescription, searchPattern)
        )
      );
    }

    // Exact matches
    if (filters.contractorUei) {
      conditions.push(eq(contractorsCache.contractorUei, filters.contractorUei));
    }

    // Multiple value filters
    if (filters.state) {
      const states = Array.isArray(filters.state) ? filters.state : [filters.state];
      conditions.push(inArray(contractorsCache.state, states));
    }

    if (filters.primaryAgency) {
      const agencies = Array.isArray(filters.primaryAgency) 
        ? filters.primaryAgency 
        : [filters.primaryAgency];
      conditions.push(inArray(contractorsCache.primaryAgency, agencies));
    }

    if (filters.industryCluster) {
      const clusters = Array.isArray(filters.industryCluster) 
        ? filters.industryCluster 
        : [filters.industryCluster];
      conditions.push(inArray(contractorsCache.industryCluster, clusters));
    }

    if (filters.lifecycleStage) {
      const stages = Array.isArray(filters.lifecycleStage) 
        ? filters.lifecycleStage 
        : [filters.lifecycleStage];
      conditions.push(inArray(contractorsCache.lifecycleStage, stages));
    }

    if (filters.sizeTier) {
      const tiers = Array.isArray(filters.sizeTier) 
        ? filters.sizeTier 
        : [filters.sizeTier];
      conditions.push(inArray(contractorsCache.sizeTier, tiers));
    }

    if (filters.sizeQuartile) {
      const quartiles = Array.isArray(filters.sizeQuartile) 
        ? filters.sizeQuartile 
        : [filters.sizeQuartile];
      conditions.push(inArray(contractorsCache.sizeQuartile, quartiles));
    }

    // Range filters
    if (filters.minTotalObligated !== undefined) {
      conditions.push(gte(contractorsCache.totalObligated, filters.minTotalObligated.toString()));
    }

    if (filters.maxTotalObligated !== undefined) {
      conditions.push(lte(contractorsCache.totalObligated, filters.maxTotalObligated.toString()));
    }

    if (filters.minContracts !== undefined) {
      conditions.push(gte(contractorsCache.totalContracts, filters.minContracts));
    }

    if (filters.maxContracts !== undefined) {
      conditions.push(lte(contractorsCache.totalContracts, filters.maxContracts));
    }

    if (filters.minAgencyDiversity !== undefined) {
      conditions.push(gte(contractorsCache.agencyDiversity, filters.minAgencyDiversity));
    }

    return conditions;
  }

  /**
   * Get aggregations for filtered results
   */
  private async getAggregations(conditions: any[]): Promise<{
    totalObligated: string;
    averageContracts: number;
    uniqueAgencies: number;
    uniqueStates: number;
  }> {
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({
        totalObligated: sql<string>`COALESCE(SUM(${contractorsCache.totalObligated}), 0)`,
        averageContracts: sql<number>`COALESCE(AVG(${contractorsCache.totalContracts}), 0)`,
        uniqueAgencies: sql<number>`COUNT(DISTINCT ${contractorsCache.primaryAgency})`,
        uniqueStates: sql<number>`COUNT(DISTINCT ${contractorsCache.state})`,
      })
      .from(contractorsCache)
      .where(whereClause);

    return {
      totalObligated: result[0]?.totalObligated || '0',
      averageContracts: Number(result[0]?.averageContracts || 0),
      uniqueAgencies: Number(result[0]?.uniqueAgencies || 0),
      uniqueStates: Number(result[0]?.uniqueStates || 0),
    };
  }
}

export const contractorQueryService = new ContractorQueryService();