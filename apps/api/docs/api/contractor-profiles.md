# Contractor Profiles API

API endpoints for managing and querying aggregated contractor profile data.

## Overview

Contractor Profiles provide an aggregated view of contractor data, combining information from multiple sources including contracts, performance metrics, and certifications. Each profile represents a unique contractor entity with comprehensive business intelligence.

## Endpoints

### List Contractor Profiles

Get a paginated list of contractor profiles with optional filtering.

**Endpoint:** `GET /api/v1/contractor-profiles`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20, max: 100) |
| search | string | No | Search query for name/UEI |
| state | string | No | Filter by state (2-letter code) |
| city | string | No | Filter by city |
| naics | string | No | Filter by NAICS code |
| hasSetAsides | boolean | No | Filter by set-aside status |
| minEmployees | number | No | Minimum employee count |
| maxEmployees | number | No | Maximum employee count |
| minRevenue | number | No | Minimum annual revenue |
| maxRevenue | number | No | Maximum annual revenue |
| certifications | string | No | Comma-separated certification codes |
| sort | string | No | Sort field (name, revenue, employees, created_at) |
| order | string | No | Sort order (asc, desc) |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "uei": "ZQGGHJH74DW7",
      "cageCode": "1234A",
      "name": "ACME TECHNOLOGIES INC",
      "dbaName": "ACME Tech",
      "legalBusinessName": "ACME Technologies Incorporated",
      "addressLine1": "123 Main Street",
      "addressLine2": "Suite 100",
      "city": "Arlington",
      "state": "VA",
      "zipCode": "22201",
      "country": "USA",
      "congressionalDistrict": "VA-08",
      "businessStartDate": "2010-01-15",
      "fiscalYearEndDate": "12/31",
      "naicsCode": "541511",
      "naicsDescription": "Custom Computer Programming Services",
      "entityStructure": "Corporation",
      "organizationType": "For-Profit",
      "businessTypes": ["Small Business", "Woman-Owned", "8(a)"],
      "primaryContactName": "Jane Doe",
      "primaryContactTitle": "CEO",
      "primaryContactEmail": "jane.doe@acmetech.com",
      "primaryContactPhone": "(703) 555-0100",
      "websiteUrl": "https://www.acmetech.com",
      "employeeCount": 150,
      "annualRevenue": "25000000",
      "totalContractValue": "125000000",
      "activeContractsCount": 12,
      "completedContractsCount": 45,
      "averageContractValue": "2173913",
      "largestContractValue": "15000000",
      "primaryAgency": "Department of Defense",
      "topNaicsCodes": ["541511", "541512", "541519"],
      "setAsideCodes": ["A6", "27"],
      "certifications": {
        "sba8a": true,
        "womanOwned": true,
        "veteranOwned": false,
        "hubzone": false,
        "smallDisadvantaged": true
      },
      "performanceRating": 4.5,
      "pastPerformanceCount": 28,
      "capabilities": [
        "Software Development",
        "Cloud Computing",
        "Cybersecurity",
        "Data Analytics"
      ],
      "registrationDate": "2010-02-01",
      "registrationStatus": "Active",
      "lastUpdatedDate": "2024-01-15T10:30:00Z",
      "metadata": {
        "dataSource": "SAM.gov",
        "lastSyncDate": "2024-01-15T00:00:00Z",
        "dataQualityScore": 0.95
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1500,
    "totalPages": 75,
    "hasMore": true
  }
}
```

### Get Contractor Profile by ID

Get detailed information about a specific contractor profile.

**Endpoint:** `GET /api/v1/contractor-profiles/:id`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Contractor profile UUID |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "uei": "ZQGGHJH74DW7",
    // ... all contractor profile fields (same as list response)
    "additionalDetails": {
      "samRegistration": {
        "status": "Active",
        "expirationDate": "2024-12-31",
        "purposeOfRegistration": "All Awards"
      },
      "financialInformation": {
        "creditScore": "Excellent",
        "dunsNumber": "123456789",
        "bankingInformation": "Verified"
      },
      "socioeconomicData": {
        "womanOwnedPercentage": 51,
        "minorityOwnedPercentage": 100,
        "veteranOwnedPercentage": 0
      }
    }
  }
}
```

### Search Contractor Profiles

Full-text search across contractor profiles.

**Endpoint:** `GET /api/v1/contractor-profiles/search`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query |
| filters | object | No | Additional filters (JSON) |
| page | number | No | Page number (default: 1) |
| limit | number | No | Results per page (default: 20) |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "ACME TECHNOLOGIES INC",
      "uei": "ZQGGHJH74DW7",
      "relevanceScore": 0.95,
      "matchedFields": ["name", "capabilities"],
      // ... other contractor fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasMore": true
  },
  "searchMetadata": {
    "query": "technology consulting",
    "executionTime": 125,
    "totalMatches": 45
  }
}
```

### Get Contractor's Contract History

Get historical contract data for a contractor.

**Endpoint:** `GET /api/v1/contractor-profiles/:id/contracts`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Contractor profile UUID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | No | Filter contracts after this date |
| endDate | string | No | Filter contracts before this date |
| agency | string | No | Filter by agency |
| status | string | No | Filter by status (active, completed) |
| minValue | number | No | Minimum contract value |
| page | number | No | Page number |
| limit | number | No | Items per page |

**Response:**

```json
{
  "success": true,
  "data": {
    "contractorId": "550e8400-e29b-41d4-a716-446655440000",
    "contractorName": "ACME TECHNOLOGIES INC",
    "contracts": [
      {
        "id": "contract-001",
        "piid": "W15P7T20D0001",
        "awardDate": "2023-09-15",
        "completionDate": "2024-09-14",
        "value": "2500000",
        "agency": "Department of Defense",
        "subAgency": "Army",
        "title": "IT Support Services",
        "type": "Firm Fixed Price",
        "naicsCode": "541511",
        "placeOfPerformance": "Arlington, VA",
        "status": "Active",
        "percentComplete": 45,
        "modifications": 2
      }
    ],
    "summary": {
      "totalContracts": 57,
      "totalValue": "125000000",
      "averageValue": "2192982",
      "activeContracts": 12,
      "completedContracts": 45,
      "topAgencies": [
        {
          "name": "Department of Defense",
          "contractCount": 25,
          "totalValue": "75000000"
        }
      ]
    }
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 57,
    "totalPages": 3,
    "hasMore": true
  }
}
```

### Get Contractor Performance Metrics

Get performance metrics and ratings for a contractor.

**Endpoint:** `GET /api/v1/contractor-profiles/:id/performance`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "contractorId": "550e8400-e29b-41d4-a716-446655440000",
    "overallRating": 4.5,
    "totalReviews": 28,
    "metrics": {
      "qualityOfWork": 4.6,
      "timeliness": 4.3,
      "costControl": 4.4,
      "communication": 4.7,
      "compliance": 4.5
    },
    "recentReviews": [
      {
        "contractId": "W15P7T20D0001",
        "agency": "Department of Defense",
        "rating": 4.5,
        "date": "2023-12-15",
        "comments": "Excellent performance on complex IT modernization project"
      }
    ],
    "trends": {
      "ratingTrend": "improving",
      "lastQuarterAverage": 4.4,
      "yearOverYearChange": 0.2
    }
  }
}
```

### Get Similar Contractors

Find contractors similar to a given contractor profile.

**Endpoint:** `GET /api/v1/contractor-profiles/:id/similar`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Number of similar contractors (default: 10) |
| factors | array | No | Similarity factors to consider |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "TECH SOLUTIONS LLC",
      "similarityScore": 0.89,
      "commonAttributes": {
        "naicsCodes": ["541511", "541512"],
        "businessTypes": ["Small Business", "8(a)"],
        "location": "Same state",
        "sizeCategory": "Similar employee count"
      },
      // ... other contractor fields
    }
  ]
}
```

### Export Contractor Profiles

Export contractor profiles in various formats.

**Endpoint:** `POST /api/v1/contractor-profiles/export`

**Authentication:** Required

**Request Body:**

```json
{
  "format": "csv", // csv, excel, json
  "filters": {
    "state": "VA",
    "naics": "541511"
  },
  "fields": [
    "name",
    "uei",
    "state",
    "totalContractValue",
    "employeeCount"
  ],
  "limit": 1000
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "exportId": "exp_123456",
    "status": "processing",
    "format": "csv",
    "recordCount": 1000,
    "downloadUrl": null,
    "expiresAt": "2024-01-16T00:00:00Z"
  }
}
```

### Get Export Status

Check the status of an export job.

**Endpoint:** `GET /api/v1/contractor-profiles/export/:exportId`

**Response:**

```json
{
  "success": true,
  "data": {
    "exportId": "exp_123456",
    "status": "completed",
    "format": "csv",
    "recordCount": 1000,
    "downloadUrl": "https://download.goldengate.com/exports/exp_123456.csv",
    "expiresAt": "2024-01-16T00:00:00Z"
  }
}
```

## Data Models

### Contractor Profile Schema

```typescript
interface ContractorProfile {
  id: string;
  uei: string;
  cageCode?: string;
  name: string;
  dbaName?: string;
  legalBusinessName: string;
  
  // Address
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  congressionalDistrict?: string;
  
  // Business Information
  businessStartDate?: string;
  fiscalYearEndDate?: string;
  naicsCode: string;
  naicsDescription: string;
  entityStructure?: string;
  organizationType?: string;
  businessTypes: string[];
  
  // Contact Information
  primaryContactName?: string;
  primaryContactTitle?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  websiteUrl?: string;
  
  // Metrics
  employeeCount?: number;
  annualRevenue?: string;
  totalContractValue: string;
  activeContractsCount: number;
  completedContractsCount: number;
  averageContractValue: string;
  largestContractValue?: string;
  
  // Certifications & Set-Asides
  certifications: {
    sba8a: boolean;
    womanOwned: boolean;
    veteranOwned: boolean;
    hubzone: boolean;
    smallDisadvantaged: boolean;
  };
  setAsideCodes: string[];
  
  // Performance
  performanceRating?: number;
  pastPerformanceCount?: number;
  capabilities?: string[];
  
  // Metadata
  registrationDate?: string;
  registrationStatus: string;
  lastUpdatedDate: string;
  metadata?: {
    dataSource: string;
    lastSyncDate: string;
    dataQualityScore: number;
  };
}
```

## Error Responses

### 404 Not Found

```json
{
  "success": false,
  "error": "CONTRACTOR_NOT_FOUND",
  "message": "Contractor profile not found"
}
```

### 400 Bad Request

```json
{
  "success": false,
  "error": "INVALID_PARAMETERS",
  "message": "Invalid query parameters",
  "details": {
    "field": "limit",
    "issue": "Must be between 1 and 100"
  }
}
```

## Best Practices

1. **Pagination**: Always use pagination for list endpoints to avoid large response payloads
2. **Caching**: Contractor profiles are cached for 5 minutes; use ETags for cache validation
3. **Search**: Use specific search queries for better performance
4. **Filtering**: Combine multiple filters for precise results
5. **Rate Limiting**: Respect rate limits to avoid throttling

## Related APIs

- [Contractor Lists API](./contractor-lists.md) - Add contractors to portfolios
- [Contractors API](./contractors.md) - Raw contractor data
- [Snowflake API](./snowflake.md) - Advanced analytics queries