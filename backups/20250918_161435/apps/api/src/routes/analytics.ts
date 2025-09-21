import { Elysia, t } from 'elysia';
import { db } from '../db';
import { 
  contractorMetricsMonthly,
  peerComparisonsMonthly,
  contractorNetworkMetrics,
  contractorIcebergOpportunities,
  portfolioBreakdownsMonthly,
  contractorUniverse
} from '../db/schema/contractor-metrics';
import { contractorProfiles, users, userTenants, userOrganizations } from '../db/schema';
import { eq, desc, and, gte, lte, sql, isNotNull } from 'drizzle-orm';
import { jwtVerify } from "jose";
import { config } from "../config";

const jwtSecret = new TextEncoder().encode(config.jwt.secret);

export const analyticsRoutes = new Elysia({ prefix: '/analytics' })
  // Add auth as derive like contractor-lists
  .derive(async ({ request }) => {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return { user: null };
    }

    const token = authHeader.replace("Bearer ", "");
    
    try {
      const { payload } = await jwtVerify(token, jwtSecret);
      const userId = payload.sub as string;
      
      // Get user from database
      const result = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.fullName,
          username: users.username,
          role: userTenants.role,
          tenantId: userTenants.tenantId,
          organizationId: userOrganizations.organizationId,
        })
        .from(users)
        .leftJoin(userTenants, eq(users.id, userTenants.userId))
        .leftJoin(userOrganizations, eq(users.id, userOrganizations.userId))
        .where(and(
          eq(users.id, userId),
          eq(users.isActive, true)
        ))
        .limit(1);

      const user = result[0];
      
      if (user) {
        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name || user.username || '',
            role: user.role || 'member',
            tenantId: user.tenantId || '',
            organizationId: user.organizationId || null,
          }
        };
      }
    } catch (error) {
      console.log('Analytics routes JWT verification failed:', error);
    }
    
    return { user: null };
  })
  
  // Get contractor performance metrics over time
  .get('/metrics/:id/monthly', async ({ params, query }) => {
    const { id } = params;
    
    if (!id || id === 'undefined') {
      throw new Error('Valid contractor ID is required');
    }
    
    const months = query.months ? parseInt(query.months) : 36;
    
    // Get contractor profile
    const profile = await db.query.contractorProfiles.findFirst({
      where: eq(contractorProfiles.id, id)
    });
    
    if (!profile) {
      throw new Error('Contractor not found');
    }
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    // Get all UEIs for this profile
    const { contractorUeiMappings } = await import('../db/schema');
    const ueiMappings = await db
      .select({ uei: contractorUeiMappings.uei })
      .from(contractorUeiMappings)
      .where(eq(contractorUeiMappings.profileId, id));
    
    const ueis = ueiMappings.map(m => m.uei);
    
    if (ueis.length === 0) {
      // No UEIs mapped to this profile
      return {
        contractor: {
          id: profile.id,
          name: profile.displayName
        },
        metrics: [],
        summary: {
          totalRevenue: 0,
          avgMonthlyRevenue: 0,
          totalContracts: 0,
          latestActivityStatus: 'unknown',
          growthTrend: 0
        },
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          months
        }
      };
    }
    
    // Fetch monthly metrics for ALL UEIs associated with this profile
    const metrics = await db
      .select({
        monthYear: contractorMetricsMonthly.monthYear,
        fiscalYear: contractorMetricsMonthly.fiscalYear,
        fiscalQuarter: contractorMetricsMonthly.fiscalQuarter,
        // Aggregate metrics across all UEIs for this month
        monthlyRevenue: sql<string>`SUM(${contractorMetricsMonthly.monthlyRevenue})`,
        monthlyAwards: sql<string>`SUM(${contractorMetricsMonthly.monthlyAwards})`,
        monthlyContracts: sql<number>`SUM(${contractorMetricsMonthly.monthlyContracts})`,
        activeContracts: sql<number>`SUM(${contractorMetricsMonthly.activeContracts})`,
        // Average metrics
        avgWinRate: sql<string>`AVG(${contractorMetricsMonthly.winRate})`,
        // Take max for growth metrics (use company-wide growth)
        revenueGrowthMom: sql<string>`MAX(${contractorMetricsMonthly.revenueGrowthMom})`,
        revenueGrowthYoy: sql<string>`MAX(${contractorMetricsMonthly.revenueGrowthYoy})`,
        // Activity status - take the most active status
        activityStatus: sql<string>`MAX(${contractorMetricsMonthly.activityStatus})`,
      })
      .from(contractorMetricsMonthly)
      .where(
        and(
          sql`${contractorMetricsMonthly.contractorUei} IN (${sql.join(ueis, sql`, `)})`,
          gte(contractorMetricsMonthly.monthYear, startDate),
          lte(contractorMetricsMonthly.monthYear, endDate)
        )
      )
      .groupBy(contractorMetricsMonthly.monthYear, contractorMetricsMonthly.fiscalYear, contractorMetricsMonthly.fiscalQuarter)
      .orderBy(contractorMetricsMonthly.monthYear);
    
    // Calculate summary statistics
    const summary = {
      totalRevenue: metrics.reduce((sum, m) => sum + parseFloat(m.monthlyRevenue || '0'), 0),
      avgMonthlyRevenue: metrics.length > 0 
        ? metrics.reduce((sum, m) => sum + parseFloat(m.monthlyRevenue || '0'), 0) / metrics.length 
        : 0,
      totalContracts: metrics.reduce((sum, m) => sum + (m.activeContracts || 0), 0),
      latestActivityStatus: metrics[metrics.length - 1]?.activityStatus || 'unknown',
      growthTrend: metrics[metrics.length - 1]?.revenueGrowthYoy || 0
    };
    
    return {
      contractor: {
        id: profile.id,
        name: profile.displayName
      },
      metrics,
      summary,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        months
      }
    };
  }, {
    params: t.Object({
      id: t.String()
    }),
    query: t.Object({
      months: t.Optional(t.String())
    })
  })
  
  // Get peer comparison data
  .get('/peer-comparison/:id', async ({ params, query }) => {
    const { id } = params;
    
    if (!id || id === 'undefined') {
      throw new Error('Valid contractor ID is required');
    }
    
    const monthsBack = query.months ? parseInt(query.months) : 3;
    
    // Get contractor profile
    const profile = await db.query.contractorProfiles.findFirst({
      where: eq(contractorProfiles.id, id)
    });
    
    if (!profile) {
      throw new Error('Contractor not found');
    }
    
    // Get all UEIs for this profile
    const { contractorUeiMappings } = await import('../db/schema');
    const ueiMappings = await db
      .select({ uei: contractorUeiMappings.uei })
      .from(contractorUeiMappings)
      .where(eq(contractorUeiMappings.profileId, id));
    
    const ueis = ueiMappings.map(m => m.uei);
    
    if (ueis.length === 0) {
      // No UEIs mapped to this profile
      return {
        contractor: {
          id: profile.id,
          name: profile.displayName
        },
        currentPercentiles: null,
        peerGroup: null,
        historicalComparisons: []
      };
    }
    
    // Get latest peer comparisons for ALL UEIs associated with this profile
    // Aggregate the peer comparison data across all UEIs
    const comparisons = await db
      .select({
        monthYear: peerComparisonsMonthly.monthYear,
        peerGroup: peerComparisonsMonthly.peerGroup,
        // Average percentiles across all UEIs
        avgRevenuePercentile: sql<number>`AVG(${peerComparisonsMonthly.revenuePercentile})`,
        avgGrowthPercentile: sql<number>`AVG(${peerComparisonsMonthly.growthPercentile})`,
        avgWinRatePercentile: sql<number>`AVG(${peerComparisonsMonthly.winRatePercentile})`,
        avgPerformanceScore: sql<number>`AVG(${peerComparisonsMonthly.overallPerformanceScore})`,
        // Sum peer group sizes
        totalPeerGroupSize: sql<number>`SUM(${peerComparisonsMonthly.peerGroupSize})`,
        // Aggregate peer median values
        avgPeerMedianRevenue: sql<string>`AVG(${peerComparisonsMonthly.peerMedianRevenue})`,
        avgPeerAvgRevenue: sql<string>`AVG(${peerComparisonsMonthly.peerAvgRevenue})`,
      })
      .from(peerComparisonsMonthly)
      .where(sql`${peerComparisonsMonthly.contractorUei} IN (${sql.join(ueis, sql`, `)})`)
      .groupBy(peerComparisonsMonthly.monthYear, peerComparisonsMonthly.peerGroup)
      .orderBy(desc(peerComparisonsMonthly.monthYear))
      .limit(monthsBack);
    
    // Get latest comparison for percentiles
    const latest = comparisons[0];
    
    return {
      contractor: {
        id: profile.id,
        name: profile.displayName
      },
      currentPercentiles: latest ? {
        revenue: Math.round(latest.avgRevenuePercentile || 0),
        growth: Math.round(latest.avgGrowthPercentile || 0),
        winRate: Math.round(latest.avgWinRatePercentile || 0),
        overall: Math.round(latest.avgPerformanceScore || 0)
      } : null,
      peerGroup: latest ? {
        size: latest.totalPeerGroupSize || 0,
        peerGroup: latest.peerGroup,
        avgPeerRevenue: parseFloat(latest.avgPeerAvgRevenue || '0')
      } : null,
      historicalComparisons: comparisons.map(c => ({
        monthYear: c.monthYear,
        revenuePercentile: Math.round(c.avgRevenuePercentile || 0),
        growthPercentile: Math.round(c.avgGrowthPercentile || 0),
        overallScore: Math.round(c.avgPerformanceScore || 0)
      }))
    };
  }, {
    params: t.Object({
      id: t.String()
    }),
    query: t.Object({
      months: t.Optional(t.String())
    })
  })
  
  // Get network relationships
  .get('/network/:id', async ({ params, query }) => {
    const { id } = params;
    
    if (!id || id === 'undefined') {
      throw new Error('Valid contractor ID is required');
    }
    
    const limit = query.limit ? parseInt(query.limit) : 50;
    
    // Get contractor profile
    const profile = await db.query.contractorProfiles.findFirst({
      where: eq(contractorProfiles.id, id)
    });
    
    if (!profile) {
      throw new Error('Contractor not found');
    }
    
    // Get all UEIs for this profile
    const { contractorUeiMappings } = await import('../db/schema');
    const ueiMappings = await db
      .select({ uei: contractorUeiMappings.uei })
      .from(contractorUeiMappings)
      .where(eq(contractorUeiMappings.profileId, id));
    
    const ueis = ueiMappings.map(m => m.uei);
    
    if (ueis.length === 0) {
      // No UEIs mapped to this profile
      return {
        contractor: {
          id: profile.id,
          name: profile.displayName
        },
        relationships: {
          asPrime: { count: 0, totalValue: 0, partners: [] },
          asSubcontractor: { count: 0, totalValue: 0, partners: [] }
        },
        networkSummary: {
          totalPartners: 0,
          avgStrengthScore: 0,
          totalNetworkValue: 0
        }
      };
    }
    
    // Get relationships where contractor (any of its UEIs) is prime
    const asPrime = await db
      .select({
        subUei: contractorNetworkMetrics.subUei,
        subName: contractorNetworkMetrics.subName,
        // Aggregate metrics across all prime UEIs for this profile
        totalSharedRevenue: sql<string>`SUM(${contractorNetworkMetrics.monthlySharedRevenue})`,
        totalSharedContracts: sql<number>`SUM(${contractorNetworkMetrics.monthlySharedContracts})`,
        avgStrengthScore: sql<number>`AVG(${contractorNetworkMetrics.relationshipStrengthScore})`,
        maxExclusivityScore: sql<string>`MAX(${contractorNetworkMetrics.exclusivityScore})`,
        collaborationFrequency: sql<string>`MAX(${contractorNetworkMetrics.collaborationFrequency})`,
        isActive: sql<boolean>`BOOL_OR(${contractorNetworkMetrics.isActive})`,
      })
      .from(contractorNetworkMetrics)
      .where(sql`${contractorNetworkMetrics.primeUei} IN (${sql.join(ueis, sql`, `)})`)
      .groupBy(
        contractorNetworkMetrics.subUei,
        contractorNetworkMetrics.subName
      )
      .orderBy(desc(sql`SUM(${contractorNetworkMetrics.monthlySharedRevenue})`))
      .limit(limit);
    
    // Get relationships where contractor (any of its UEIs) is sub
    const asSub = await db
      .select({
        primeUei: contractorNetworkMetrics.primeUei,
        primeName: contractorNetworkMetrics.primeName,
        // Aggregate metrics across all sub UEIs for this profile
        totalSharedRevenue: sql<string>`SUM(${contractorNetworkMetrics.monthlySharedRevenue})`,
        totalSharedContracts: sql<number>`SUM(${contractorNetworkMetrics.monthlySharedContracts})`,
        avgStrengthScore: sql<number>`AVG(${contractorNetworkMetrics.relationshipStrengthScore})`,
        maxExclusivityScore: sql<string>`MAX(${contractorNetworkMetrics.exclusivityScore})`,
        collaborationFrequency: sql<string>`MAX(${contractorNetworkMetrics.collaborationFrequency})`,
        isActive: sql<boolean>`BOOL_OR(${contractorNetworkMetrics.isActive})`,
      })
      .from(contractorNetworkMetrics)
      .where(sql`${contractorNetworkMetrics.subUei} IN (${sql.join(ueis, sql`, `)})`)
      .groupBy(
        contractorNetworkMetrics.primeUei,
        contractorNetworkMetrics.primeName
      )
      .orderBy(desc(sql`SUM(${contractorNetworkMetrics.monthlySharedRevenue})`))
      .limit(limit);
    
    return {
      contractor: {
        id: profile.id,
        name: profile.displayName
      },
      relationships: {
        asPrime: {
          count: asPrime.length,
          totalValue: asPrime.reduce((sum, r) => sum + parseFloat(r.totalSharedRevenue || '0'), 0),
          partners: asPrime.map(r => ({
            subUei: r.subUei,
            subName: r.subName,
            strengthScore: Math.round(r.avgStrengthScore || 0),
            sharedRevenue: parseFloat(r.totalSharedRevenue || '0'),
            sharedContracts: r.totalSharedContracts || 0,
            frequency: r.collaborationFrequency,
            exclusivityScore: parseFloat(r.maxExclusivityScore || '0'),
            isActive: r.isActive
          }))
        },
        asSubcontractor: {
          count: asSub.length,
          totalValue: asSub.reduce((sum, r) => sum + parseFloat(r.totalSharedRevenue || '0'), 0),
          partners: asSub.map(r => ({
            primeUei: r.primeUei,
            primeName: r.primeName,
            strengthScore: Math.round(r.avgStrengthScore || 0),
            sharedRevenue: parseFloat(r.totalSharedRevenue || '0'),
            sharedContracts: r.totalSharedContracts || 0,
            frequency: r.collaborationFrequency,
            exclusivityScore: parseFloat(r.maxExclusivityScore || '0'),
            isActive: r.isActive
          }))
        }
      },
      networkSummary: {
        totalPartners: asPrime.length + asSub.length,
        avgStrengthScore: Math.round(
          (asPrime.reduce((sum, r) => sum + (r.avgStrengthScore || 0), 0) +
           asSub.reduce((sum, r) => sum + (r.avgStrengthScore || 0), 0)) / 
          (asPrime.length + asSub.length || 1)
        ),
        totalNetworkValue: asPrime.reduce((sum, r) => sum + parseFloat(r.totalSharedRevenue || '0'), 0) +
                           asSub.reduce((sum, r) => sum + parseFloat(r.totalSharedRevenue || '0'), 0)
      }
    };
  }, {
    params: t.Object({
      id: t.String()
    }),
    query: t.Object({
      limit: t.Optional(t.String())
    })
  })
  
  // Get iceberg opportunities
  .get('/opportunities/iceberg', async ({ query }) => {
    const limit = query.limit ? parseInt(query.limit) : 100;
    const minScore = query.minScore ? parseInt(query.minScore) : 50;
    const onlyWithPrime = query.onlyWithPrime === 'true';
    
    // Build where conditions
    const whereConditions = [
      gte(contractorIcebergOpportunities.icebergScore, minScore),
      eq(contractorIcebergOpportunities.isActive, true)
    ];
    
    // Optionally filter to only show contractors with some prime revenue
    if (onlyWithPrime) {
      whereConditions.push(sql`${contractorIcebergOpportunities.primeRevenue} > 0`);
    }
    
    // Fetch high-scoring iceberg opportunities
    // Order by multiple factors to get better variety when scores are tied
    const opportunities = await db
      .select()
      .from(contractorIcebergOpportunities)
      .where(and(...whereConditions))
      .orderBy(
        desc(contractorIcebergOpportunities.icebergScore),
        desc(contractorIcebergOpportunities.subcontractorRevenue),
        desc(contractorIcebergOpportunities.subToPrimeRatio)
      )
      .limit(limit);
    
    // Group by opportunity tier
    const byTier = {
      high: opportunities.filter(o => o.opportunityTier === 'high'),
      medium: opportunities.filter(o => o.opportunityTier === 'medium'),
      low: opportunities.filter(o => o.opportunityTier === 'low')
    };
    
    return {
      opportunities: opportunities.map(o => ({
        id: o.id,
        contractorUei: o.contractorUei,
        contractorName: o.contractorName,
        scores: {
          iceberg: o.icebergScore,
          subToPrimeRatio: parseFloat(o.subToPrimeRatio || '0'),
          hiddenRevenuePercentage: parseFloat(o.hiddenRevenuePercentage || '0')
        },
        revenue: {
          // Convert from millions to actual values
          prime: parseFloat(o.primeRevenue || '0') * 1000000,
          subcontractor: parseFloat(o.subcontractorRevenue || '0') * 1000000,
          total: parseFloat(o.totalRevenue || '0') * 1000000,
          potential: parseFloat(o.potentialPrimeValue || '0') * 1000000
        },
        classification: {
          tier: o.opportunityTier,
          scale: o.scaleTier,
          entityType: o.entityType
        },
        advantages: o.competitiveAdvantages,
        risks: o.riskFactors,
        industry: o.primaryIndustry,
        agencies: o.primaryAgencies,
        businessTypes: o.businessTypes
      })),
      summary: {
        total: opportunities.length,
        byTier: {
          high: byTier.high.length,
          medium: byTier.medium.length,
          low: byTier.low.length
        },
        avgScore: opportunities.reduce((sum, o) => sum + (o.icebergScore || 0), 0) / (opportunities.length || 1),
        totalPotentialValue: opportunities.reduce((sum, o) => 
          sum + parseFloat(o.potentialPrimeValue || '0') * 1000000, 0)
      }
    };
  }, {
    query: t.Object({
      limit: t.Optional(t.String()),
      minScore: t.Optional(t.String()),
      tier: t.Optional(t.String()),
      onlyWithPrime: t.Optional(t.String())
    })
  })
  
  // Get portfolio risk analysis
  .get('/portfolios/:id/risk-analysis', async ({ params }) => {
    const { id } = params;
    
    // For now, we'll analyze based on contractor UEIs in portfolio
    // This would normally join with portfolio_items table
    
    // Get portfolio contractors (mock for now - would join with actual portfolio)
    const mockUeis = ['UEI123', 'UEI456']; // Replace with actual portfolio query
    
    // Get concentration metrics for portfolio contractors
    const concentrations = await db
      .select()
      .from(portfolioBreakdownsMonthly)
      .where(sql`${portfolioBreakdownsMonthly.contractorUei} IN ${mockUeis}`)
      .orderBy(desc(portfolioBreakdownsMonthly.monthYear))
      .limit(mockUeis.length);
    
    // Calculate aggregate risk metrics
    const avgAgencyHHI = concentrations.reduce((sum, c) => 
      sum + (c.agencyHhiScore || 0), 0) / (concentrations.length || 1);
    const avgNaicsHHI = concentrations.reduce((sum, c) => 
      sum + (c.naicsHhiScore || 0), 0) / (concentrations.length || 1);
    
    return {
      portfolioId: id,
      riskMetrics: {
        agencyConcentration: {
          hhiScore: avgAgencyHHI,
          riskLevel: avgAgencyHHI > 5000 ? 'high' : avgAgencyHHI > 2500 ? 'medium' : 'low'
        },
        industryConcentration: {
          hhiScore: avgNaicsHHI,
          riskLevel: avgNaicsHHI > 5000 ? 'high' : avgNaicsHHI > 2500 ? 'medium' : 'low'
        },
        diversificationScore: concentrations[0]?.diversificationScore || 0,
        stabilityClassification: concentrations[0]?.stabilityClassification || 'unknown'
      },
      contractors: concentrations
    };
  }, {
    params: t.Object({
      id: t.String()
    })
  });