/**
 * API Documentation Examples
 * These examples are used to enhance the OpenAPI documentation
 */

export const apiExamples = {
  contractorProfiles: {
    boeing: {
      id: "8a9b50a3-22f0-42e5-88b0-e25a26f8e8cf",
      canonicalName: "BOEING",
      displayName: "THE BOEING COMPANY",
      totalUeis: 127,
      totalContracts: 45321,
      totalObligated: "14730843882644.29",
      avgContractValue: "325123456.78",
      primaryAgency: "Department of Defense",
      totalAgencies: 12,
      agencyDiversity: 8.5,
      headquartersState: "IL",
      totalStates: 45,
      statesList: ["IL", "WA", "CA", "TX", "FL", "VA", "MD", "AZ", "PA", "OH"],
      primaryNaicsCode: "336411",
      primaryNaicsDescription: "Aircraft Manufacturing",
      primaryIndustryCluster: "Aerospace & Defense",
      industryClusters: ["Aerospace & Defense", "Manufacturing", "Technology"],
      dominantSizeTier: "Large Business",
      dominantLifecycleStage: "Mature",
      performanceScore: 92.5,
      riskScore: 15.2,
      growthTrend: "stable",
      firstSeenDate: "2000-01-15",
      lastActiveDate: "2025-08-07",
      profileCreatedAt: "2025-08-07T14:30:40.000Z",
      profileUpdatedAt: "2025-08-07T14:30:40.000Z",
      metadata: {
        dataSource: "Snowflake",
        lastSyncDate: "2025-08-07",
        validationStatus: "verified"
      },
      tags: ["prime-contractor", "top-100", "defense", "aerospace"],
      isActive: true,
      profileCompleteness: 95
    },
    raytheon: {
      id: "262c0a89-9812-4b8e-b869-1aed3df3822c",
      canonicalName: "RAYTHEON",
      displayName: "RAYTHEON COMPANY",
      totalUeis: 82,
      totalContracts: 27552,
      totalObligated: "7863687646700.92",
      avgContractValue: "285412588.80",
      primaryAgency: "Department of Defense",
      totalAgencies: 8,
      agencyDiversity: 8,
      headquartersState: "MA",
      totalStates: 21,
      statesList: ["MA", "VA", "RI", "TX", "CA", "IN", "FL", "CO", "AZ", "NH"],
      primaryNaicsCode: "334511",
      primaryNaicsDescription: "Search, Detection, and Navigation Instruments",
      primaryIndustryCluster: "Defense Technology",
      industryClusters: ["Defense Technology", "Aerospace & Defense", "Electronics"],
      dominantSizeTier: "Large Business",
      dominantLifecycleStage: "Mature",
      performanceScore: 90,
      riskScore: 12.5,
      growthTrend: "growing",
      firstSeenDate: "2000-02-01",
      lastActiveDate: "2025-08-07",
      isActive: true,
      profileCompleteness: 92
    }
  },
  
  contractorLists: {
    defaultList: {
      id: "7f10b7cf-5d70-4f77-bc82-8b7a4a942359",
      userId: "510cd321-2066-4338-94ed-7f899055a0ea",
      name: "My Portfolio",
      description: "Default contractor portfolio",
      isDefault: true,
      isPublic: false,
      color: "#EAB308",
      icon: "star",
      sortOrder: 0,
      itemCount: 5,
      totalValue: "42863687646700.92",
      lastItemAddedAt: "2025-08-07T15:41:36.000Z",
      settings: {
        notifications: true,
        autoTrack: false
      },
      createdAt: "2025-08-07T15:41:36.000Z",
      updatedAt: "2025-08-07T15:41:36.000Z"
    },
    customList: {
      id: "15c613af-dcff-4650-8f04-39733b5bebe7",
      userId: "510cd321-2066-4338-94ed-7f899055a0ea",
      name: "Potential Partners",
      description: "Companies to explore partnership opportunities",
      isDefault: false,
      isPublic: false,
      color: "#10B981",
      icon: "briefcase",
      sortOrder: 1,
      itemCount: 12,
      totalValue: "5432109876.54",
      lastItemAddedAt: "2025-08-07T16:30:00.000Z",
      settings: {
        notifications: true,
        autoTrack: true,
        trackingCriteria: {
          minContractValue: 1000000,
          agencies: ["Department of Defense", "NASA"]
        }
      },
      createdAt: "2025-08-07T16:00:00.000Z",
      updatedAt: "2025-08-07T16:30:00.000Z"
    }
  },
  
  responses: {
    unauthorized: {
      success: false,
      error: "Authentication required",
      code: "UNAUTHORIZED",
      statusCode: 401
    },
    forbidden: {
      success: false,
      error: "Insufficient permissions",
      code: "FORBIDDEN", 
      statusCode: 403
    },
    notFound: {
      success: false,
      error: "Resource not found",
      code: "NOT_FOUND",
      statusCode: 404
    },
    badRequest: {
      success: false,
      error: "Invalid request parameters",
      code: "BAD_REQUEST",
      statusCode: 400,
      details: {
        field: "contractorProfileId",
        message: "Must be a valid UUID"
      }
    },
    serverError: {
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR",
      statusCode: 500
    }
  },
  
  requests: {
    createList: {
      name: "Defense Contractors 2025",
      description: "Top defense contractors for fiscal year 2025 analysis",
      color: "#DC2626",
      icon: "shield",
      isPublic: false
    },
    updateList: {
      name: "Updated Portfolio Name",
      description: "Updated description with more details about the portfolio purpose",
      color: "#059669"
    },
    toggleFavorite: {
      contractorProfileId: "8a9b50a3-22f0-42e5-88b0-e25a26f8e8cf"
    },
    addToList: {
      contractorProfileId: "262c0a89-9812-4b8e-b869-1aed3df3822c",
      notes: "Strong Q4 performance, consider for partnership",
      tags: ["high-priority", "defense", "partner"],
      rating: 5,
      priority: "high"
    },
    checkFavorites: {
      contractorProfileIds: [
        "262c0a89-9812-4b8e-b869-1aed3df3822c",
        "8a9b50a3-22f0-42e5-88b0-e25a26f8e8cf",
        "f3993126-9a38-4445-9d52-7f3fde91ad47"
      ]
    }
  },
  
  authentication: {
    bearerToken: {
      description: "JWT token obtained from /api/v1/auth/login endpoint",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MTBjZDMyMS0yMDY2LTQzMzgtOTRlZC03Zjg5OTA1NWEwZWEiLCJlbWFpbCI6ImpvaG5AaGVkZ2UuY29tIiwicm9sZSI6Im1lbWJlciIsImlhdCI6MTc1NDYwNTkxNiwiZXhwIjoxNzU0NjA5NTE2fQ.DQlCoHRa001PAYCY0gQY-MxwapthXyO-mcns7ibz1AY"
    },
    loginRequest: {
      email: "john@hedge.com",
      password: "SecurePass123!"
    },
    loginResponse: {
      success: true,
      data: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        user: {
          id: "510cd321-2066-4338-94ed-7f899055a0ea",
          email: "john@hedge.com",
          name: "John Hedgerman",
          role: "member",
          tenantId: "658146d8-2572-4fdb-9cb3-350ddab5893a",
          organizationId: null
        },
        expiresIn: 3600
      }
    }
  },
  
  pagination: {
    request: {
      page: 2,
      limit: 50,
      sortBy: "totalObligated",
      sortOrder: "desc"
    },
    response: {
      total: 5432,
      page: 2,
      limit: 50,
      totalPages: 109,
      hasNext: true,
      hasPrevious: true
    }
  },
  
  filters: {
    contractorProfiles: {
      search: "boeing",
      minObligated: "1000000000",
      maxObligated: "100000000000",
      states: "IL,WA,CA",
      agencies: "Department of Defense,NASA",
      industries: "Aerospace & Defense,Technology",
      sizeTiers: "Large Business",
      lifecycleStages: "Mature",
      sortBy: "agencyDiversity",
      sortOrder: "desc"
    }
  }
};

export default apiExamples;