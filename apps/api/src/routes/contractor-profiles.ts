import { Elysia, t } from 'elysia';
import { db } from "../db";
import { 
  contractorProfiles, 
  contractorUeiMappings,
  contractorAgencyRelationships,
  contractorProfileStats,
  users,
  userTenants,
  userOrganizations
} from "../db/schema";
import { eq, sql, desc, asc, and, gte, lte, ilike, inArray } from "drizzle-orm";
import { ContractorProfileAggregator } from "../services/contractors/profile-aggregator";
import { jwtVerify } from "jose";
import { config } from "../config";

const aggregator = new ContractorProfileAggregator();
const jwtSecret = new TextEncoder().encode(config.jwt.secret);

const contractorProfilesRoutes = new Elysia({ prefix: '/contractor-profiles' })
  // Add auth as derive - same pattern as contractor-lists
  .derive(async ({ request }) => {
    console.log('🔐 CONTRACTOR-PROFILES AUTH - Checking');
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      console.log('🔐 CONTRACTOR-PROFILES - No valid auth header');
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
        console.log('🔐 CONTRACTOR-PROFILES - User authenticated:', user.email);
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
      console.log('🔐 CONTRACTOR-PROFILES - JWT verification failed');
    }
    
    return { user: null };
  })
  
  // Get contractor profiles with pagination and filtering
  .get('/', async ({ query }) => {
    try {
      const pageNum = parseInt(query.page || '1');
      const limitNum = parseInt(query.limit || '24');
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions
      const conditions = [];

      if (query.search) {
        conditions.push(
          ilike(contractorProfiles.displayName, `%${query.search}%`)
        );
      }

      if (query.minObligated) {
        conditions.push(
          gte(contractorProfiles.totalObligated, query.minObligated)
        );
      }

      if (query.maxObligated) {
        conditions.push(
          lte(contractorProfiles.totalObligated, query.maxObligated)
        );
      }

      if (query.states) {
        const stateList = query.states.split(',');
        conditions.push(
          inArray(contractorProfiles.headquartersState, stateList)
        );
      }

      if (query.agencies) {
        const agencyList = query.agencies.split(',');
        conditions.push(
          inArray(contractorProfiles.primaryAgency, agencyList)
        );
      }

      if (query.industries) {
        const industryList = query.industries.split(',');
        conditions.push(
          inArray(contractorProfiles.primaryIndustryCluster, industryList)
        );
      }

      if (query.sizeTiers) {
        const sizeList = query.sizeTiers.split(',');
        conditions.push(
          inArray(contractorProfiles.dominantSizeTier, sizeList)
        );
      }

      if (query.lifecycleStages) {
        const lifecycleList = query.lifecycleStages.split(',');
        conditions.push(
          inArray(contractorProfiles.dominantLifecycleStage, lifecycleList)
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(contractorProfiles)
        .where(whereClause);

      // Determine sort column
      const sortColumn = {
        totalObligated: contractorProfiles.totalObligated,
        totalContracts: contractorProfiles.totalContracts,
        totalUeis: contractorProfiles.totalUeis,
        performanceScore: contractorProfiles.performanceScore,
        agencyDiversity: contractorProfiles.agencyDiversity,
        displayName: contractorProfiles.displayName,
      }[query.sortBy || 'totalObligated'] || contractorProfiles.totalObligated;

      // Get profiles
      const profiles = await db
        .select()
        .from(contractorProfiles)
        .where(whereClause)
        .orderBy(query.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn))
        .limit(limitNum)
        .offset(offset);

      // Get aggregations
      const aggregations = await db
        .select({
          totalObligated: sql<string>`sum(${contractorProfiles.totalObligated})`,
          avgContracts: sql<number>`avg(${contractorProfiles.totalContracts})`,
          uniqueAgencies: sql<number>`count(distinct ${contractorProfiles.primaryAgency})`,
          uniqueStates: sql<number>`count(distinct ${contractorProfiles.headquartersState})`,
        })
        .from(contractorProfiles)
        .where(whereClause);

      return {
        success: true,
        data: profiles,
        pagination: {
          total: Number(count),
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(Number(count) / limitNum)
        },
        aggregations: {
          totalObligated: aggregations[0]?.totalObligated || "0",
          averageContracts: Math.round(aggregations[0]?.avgContracts || 0),
          uniqueAgencies: aggregations[0]?.uniqueAgencies || 0,
          uniqueStates: aggregations[0]?.uniqueStates || 0,
        }
      };

    } catch (error: any) {
      console.error("Error fetching contractor profiles:", error);
      return { 
        success: false, 
        error: error.message || "Failed to fetch contractor profiles" 
      };
    }
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      search: t.Optional(t.String()),
      minObligated: t.Optional(t.String()),
      maxObligated: t.Optional(t.String()),
      states: t.Optional(t.String()),
      agencies: t.Optional(t.String()),
      industries: t.Optional(t.String()),
      sizeTiers: t.Optional(t.String()),
      lifecycleStages: t.Optional(t.String()),
      sortBy: t.Optional(t.String()),
      sortOrder: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
    }),
    detail: {
      summary: 'List contractor profiles',
      description: 'Get a paginated list of aggregated contractor profiles. Each profile represents a unique contractor entity that may have multiple UEIs. Supports extensive filtering by agency, state, industry, size tier, and lifecycle stage. Results can be sorted by various metrics including total obligated amount, contract count, and agency diversity score.',
      tags: ['contractor-profiles'],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number (1-based)',
          schema: { type: 'integer', minimum: 1, default: 1 }
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of results per page',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 24 }
        },
        {
          name: 'search',
          in: 'query',
          description: 'Search term for contractor name',
          schema: { type: 'string' }
        },
        {
          name: 'minObligated',
          in: 'query',
          description: 'Minimum total obligated amount',
          schema: { type: 'string' }
        },
        {
          name: 'maxObligated',
          in: 'query',
          description: 'Maximum total obligated amount',
          schema: { type: 'string' }
        },
        {
          name: 'states',
          in: 'query',
          description: 'Comma-separated list of state codes (e.g., "MA,VA,TX")',
          schema: { type: 'string' }
        },
        {
          name: 'agencies',
          in: 'query',
          description: 'Comma-separated list of agency names',
          schema: { type: 'string' }
        },
        {
          name: 'sortBy',
          in: 'query',
          description: 'Field to sort by',
          schema: { 
            type: 'string',
            enum: ['totalObligated', 'totalContracts', 'totalUeis', 'performanceScore', 'agencyDiversity', 'displayName'],
            default: 'totalObligated'
          }
        },
        {
          name: 'sortOrder',
          in: 'query',
          description: 'Sort order',
          schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
        }
      ],
      responses: {
        200: {
          description: 'Successfully retrieved contractor profiles',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    description: 'Array of contractor profiles',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        canonicalName: { type: 'string', example: 'BOEING' },
                        displayName: { type: 'string', example: 'THE BOEING COMPANY' },
                        totalUeis: { type: 'integer', example: 82 },
                        totalContracts: { type: 'integer', example: 45321 },
                        totalObligated: { type: 'string', example: '14730843882644.29' },
                        avgContractValue: { type: 'string', example: '325123456.78' },
                        primaryAgency: { type: 'string', example: 'Department of Defense' },
                        totalAgencies: { type: 'integer', example: 12 },
                        agencyDiversity: { type: 'number', example: 8.5 },
                        headquartersState: { type: 'string', example: 'IL' },
                        totalStates: { type: 'integer', example: 45 },
                        statesList: { type: 'array', items: { type: 'string' } },
                        performanceScore: { type: 'number', example: 92.5 },
                        isActive: { type: 'boolean', example: true }
                      }
                    }
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      total: { type: 'integer', example: 5432 },
                      page: { type: 'integer', example: 1 },
                      limit: { type: 'integer', example: 24 },
                      totalPages: { type: 'integer', example: 227 }
                    }
                  },
                  aggregations: {
                    type: 'object',
                    properties: {
                      totalObligated: { type: 'string', example: '123456789012.34' },
                      averageContracts: { type: 'integer', example: 1234 },
                      uniqueAgencies: { type: 'integer', example: 25 },
                      uniqueStates: { type: 'integer', example: 50 }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Bad request - Invalid query parameters'
        },
        500: {
          description: 'Internal server error'
        }
      }
    }
  })

  // Get single contractor profile by ID
  .get('/:profileId', async ({ params }) => {
    try {
      const { profileId } = params;

      // Get profile
      const profile = await db
        .select()
        .from(contractorProfiles)
        .where(eq(contractorProfiles.id, profileId))
        .limit(1);

      if (profile.length === 0) {
        return { 
          success: false, 
          error: "Contractor profile not found" 
        };
      }

      // Get UEI mappings
      const ueiMappings = await db
        .select()
        .from(contractorUeiMappings)
        .where(eq(contractorUeiMappings.profileId, profileId));

      // Get agency relationships
      const agencyRelationships = await db
        .select()
        .from(contractorAgencyRelationships)
        .where(eq(contractorAgencyRelationships.profileId, profileId))
        .orderBy(desc(contractorAgencyRelationships.totalObligated));

      return {
        success: true,
        data: {
          profile: profile[0],
          ueis: ueiMappings,
          agencies: agencyRelationships
        }
      };

    } catch (error: any) {
      console.error("Error fetching contractor profile:", error);
      return { 
        success: false, 
        error: error.message || "Failed to fetch contractor profile" 
      };
    }
  }, {
    params: t.Object({
      profileId: t.String()
    }),
    detail: {
      summary: 'Get contractor profile',
      description: 'Get comprehensive information about a specific contractor profile. Returns the aggregated profile data along with all associated UEI mappings and detailed agency relationships. Agency relationships are sorted by total obligated amount to show primary contracting partners.',
      tags: ['contractor-profiles'],
      parameters: [
        {
          name: 'profileId',
          in: 'path',
          required: true,
          description: 'UUID of the contractor profile',
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        200: {
          description: 'Successfully retrieved contractor profile',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      profile: {
                        type: 'object',
                        description: 'Complete contractor profile data'
                      },
                      ueis: {
                        type: 'array',
                        description: 'All UEI numbers associated with this contractor',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', format: 'uuid' },
                            profileId: { type: 'string', format: 'uuid' },
                            uei: { type: 'string', example: 'XJQXD8HHB9Q7' },
                            ueiName: { type: 'string', example: 'BOEING COMPANY, THE' },
                            isPrimary: { type: 'boolean' },
                            isActive: { type: 'boolean' },
                            contractCount: { type: 'integer' },
                            totalObligated: { type: 'string' },
                            firstSeenDate: { type: 'string', format: 'date' },
                            lastSeenDate: { type: 'string', format: 'date' }
                          }
                        }
                      },
                      agencies: {
                        type: 'array',
                        description: 'Agency relationships sorted by total obligated amount',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', format: 'uuid' },
                            profileId: { type: 'string', format: 'uuid' },
                            agencyName: { type: 'string', example: 'Department of Defense' },
                            agencyCode: { type: 'string', example: 'DOD' },
                            totalContracts: { type: 'integer', example: 1234 },
                            totalObligated: { type: 'string', example: '9876543210.12' },
                            avgContractValue: { type: 'string' },
                            firstContractDate: { type: 'string', format: 'date' },
                            lastContractDate: { type: 'string', format: 'date' },
                            relationshipDuration: { type: 'integer', description: 'Duration in days' },
                            contractTypes: { type: 'array', items: { type: 'string' } },
                            naicsCodes: { type: 'array', items: { type: 'string' } }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        404: {
          description: 'Contractor profile not found'
        },
        500: {
          description: 'Internal server error'
        }
      }
    }
  })

  // Get contractor profile by name
  .get('/by-name/:name', async ({ params }) => {
    try {
      const { name } = params;

      // Search by canonical or display name
      const profile = await db
        .select()
        .from(contractorProfiles)
        .where(
          sql`${contractorProfiles.canonicalName} = ${name.toUpperCase()} 
           OR ${contractorProfiles.displayName} = ${name}`
        )
        .limit(1);

      if (profile.length === 0) {
        return { 
          success: false, 
          error: "Contractor profile not found" 
        };
      }

      return {
        success: true,
        data: profile[0]
      };

    } catch (error: any) {
      console.error("Error fetching contractor profile by name:", error);
      return { 
        success: false, 
        error: error.message || "Failed to fetch contractor profile" 
      };
    }
  }, {
    params: t.Object({
      name: t.String()
    }),
    detail: {
      summary: 'Find profile by name',
      description: 'Search for a contractor profile by canonical or display name',
      tags: ['contractor-profiles']
    }
  })

  // Get top contractor profiles by metric
  .get('/top/:metric', async ({ params, query }) => {
    try {
      const { metric } = params;
      const limitNum = parseInt(query.limit || '10');

      // Build where conditions
      const conditions = [];

      if (query.states) {
        const stateList = query.states.split(',');
        conditions.push(
          inArray(contractorProfiles.headquartersState, stateList)
        );
      }

      if (query.agencies) {
        const agencyList = query.agencies.split(',');
        conditions.push(
          inArray(contractorProfiles.primaryAgency, agencyList)
        );
      }

      if (query.industries) {
        const industryList = query.industries.split(',');
        conditions.push(
          inArray(contractorProfiles.primaryIndustryCluster, industryList)
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Determine sort column based on metric
      const sortColumn = {
        totalObligated: contractorProfiles.totalObligated,
        totalContracts: contractorProfiles.totalContracts,
        agencyDiversity: contractorProfiles.agencyDiversity,
        totalUeis: contractorProfiles.totalUeis,
        performanceScore: contractorProfiles.performanceScore,
      }[metric] || contractorProfiles.totalObligated;

      const profiles = await db
        .select()
        .from(contractorProfiles)
        .where(whereClause)
        .orderBy(desc(sortColumn))
        .limit(limitNum);

      return {
        success: true,
        data: profiles
      };

    } catch (error: any) {
      console.error("Error fetching top contractor profiles:", error);
      return { 
        success: false, 
        error: error.message || "Failed to fetch top contractor profiles" 
      };
    }
  }, {
    params: t.Object({
      metric: t.String()
    }),
    query: t.Object({
      limit: t.Optional(t.String()),
      states: t.Optional(t.String()),
      agencies: t.Optional(t.String()),
      industries: t.Optional(t.String()),
    })
  })

  // Get filter options for profiles
  .get('/filters/options', async () => {
    try {
      const [states, agencies, industries, sizeTiers, lifecycleStages] = await Promise.all([
        db
          .selectDistinct({ value: contractorProfiles.headquartersState })
          .from(contractorProfiles)
          .where(sql`${contractorProfiles.headquartersState} IS NOT NULL`)
          .orderBy(contractorProfiles.headquartersState),
        
        db
          .selectDistinct({ value: contractorProfiles.primaryAgency })
          .from(contractorProfiles)
          .where(sql`${contractorProfiles.primaryAgency} IS NOT NULL`)
          .orderBy(contractorProfiles.primaryAgency),
        
        db
          .selectDistinct({ value: contractorProfiles.primaryIndustryCluster })
          .from(contractorProfiles)
          .where(sql`${contractorProfiles.primaryIndustryCluster} IS NOT NULL`)
          .orderBy(contractorProfiles.primaryIndustryCluster),
        
        db
          .selectDistinct({ value: contractorProfiles.dominantSizeTier })
          .from(contractorProfiles)
          .where(sql`${contractorProfiles.dominantSizeTier} IS NOT NULL`)
          .orderBy(contractorProfiles.dominantSizeTier),
        
        db
          .selectDistinct({ value: contractorProfiles.dominantLifecycleStage })
          .from(contractorProfiles)
          .where(sql`${contractorProfiles.dominantLifecycleStage} IS NOT NULL`)
          .orderBy(contractorProfiles.dominantLifecycleStage),
      ]);

      return {
        success: true,
        data: {
          states: states.map(s => s.value).filter(Boolean),
          agencies: agencies.map(a => a.value).filter(Boolean),
          industryClusters: industries.map(i => i.value).filter(Boolean),
          sizeTiers: sizeTiers.map(s => s.value).filter(Boolean),
          lifecycleStages: lifecycleStages.map(l => l.value).filter(Boolean),
        }
      };

    } catch (error: any) {
      console.error("Error fetching profile filter options:", error);
      return { 
        success: false, 
        error: error.message || "Failed to fetch filter options" 
      };
    }
  })

  // Trigger profile aggregation (admin only)
  .post('/aggregate', async ({ user }) => {
    try {
      if (!user) {
        return { 
          success: false, 
          error: "Authentication required" 
        };
      }
      
      // Check if user is admin
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return { 
          success: false, 
          error: "Admin access required" 
        };
      }

      // Check if aggregation is already running
      const status = await aggregator.getAggregationStatus();
      if (status?.aggregationStatus === 'running') {
        return { 
          success: false, 
          error: "Aggregation is already running" 
        };
      }

      // Start aggregation in background
      aggregator.buildAllProfiles()
        .then(result => {
          console.log("Profile aggregation completed:", result);
        })
        .catch(error => {
          console.error("Profile aggregation failed:", error);
        });

      return {
        success: true,
        message: "Profile aggregation started in background"
      };

    } catch (error: any) {
      console.error("Error starting profile aggregation:", error);
      return { 
        success: false, 
        error: error.message || "Failed to start profile aggregation" 
      };
    }
  })

  // Update recent profiles (admin only)
  .post('/aggregate/incremental', async ({ user, body }) => {
    try {
      if (!user) {
        return { 
          success: false, 
          error: "Authentication required" 
        };
      }
      
      // Check if user is admin
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return { 
          success: false, 
          error: "Admin access required" 
        };
      }
      
      const since = body.sinceDate ? new Date(body.sinceDate) : undefined;
      const result = await aggregator.updateRecentProfiles(since);

      return {
        success: true,
        data: result
      };

    } catch (error: any) {
      console.error("Error updating recent profiles:", error);
      return { 
        success: false, 
        error: error.message || "Failed to update recent profiles" 
      };
    }
  }, {
    body: t.Object({
      sinceDate: t.Optional(t.String())
    })
  })

  // Get aggregation status (admin only)
  .get('/aggregate/status', async ({ user }) => {
    try {
      if (!user) {
        return { 
          success: false, 
          error: "Authentication required" 
        };
      }
      
      // Check if user is admin
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return { 
          success: false, 
          error: "Admin access required" 
        };
      }
      
      const status = await aggregator.getAggregationStatus();

      return {
        success: true,
        data: status
      };

    } catch (error: any) {
      console.error("Error fetching aggregation status:", error);
      return { 
        success: false, 
        error: error.message || "Failed to fetch aggregation status" 
      };
    }
  });

export default contractorProfilesRoutes;