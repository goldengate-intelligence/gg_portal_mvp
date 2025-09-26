# Consolidated JSON Profile System

A unified data management system that consolidates contractor information from multiple sources into organized JSON profiles with intelligent caching and data merging capabilities.

## Overview

The consolidated profile system brings together data from:
- **Snowflake**: Financial metrics, performance scores, peer analysis
- **Lusha**: Company enrichment, contact info, digital presence
- **Anthropic AI**: Generated insights and analysis
- **Calculated**: Network relationships and distribution analysis

All data is stored in structured JSON profiles with optimized database schema, intelligent caching, and automatic data freshness management.

## Key Components

### 1. ConsolidatedProfileService
Main service for CRUD operations on consolidated profiles.

```typescript
import { ConsolidatedProfileService } from './services/consolidated-profiles';

const service = new ConsolidatedProfileService(database);

// Get a complete profile
const profile = await service.getProfileByUEI('ABC123XYZ789');

// Search with advanced filters
const results = await service.searchProfiles('defense contractor', {
  minPerformanceScore: 75,
  sizeTiers: ['LARGE', 'MEGA'],
  requireSnowflakeData: true
});

// Get profiles needing refresh
const staleProfiles = await service.getProfilesNeedingRefresh(100);
```

### 2. ProfileDataMerger
Handles intelligent merging of data from different sources.

```typescript
import { ProfileDataMerger } from './services/consolidated-profiles';

const merger = new ProfileDataMerger();

// Merge data from multiple sources
const profile = await merger.mergeDataSources('ABC123XYZ789', {
  snowflake: snowflakeData,
  lusha: lushaData,
  aiInsights: insightsData
});

// Generate AI insights from performance data
const insights = await merger.generateAIInsights(
  'ABC123XYZ789',
  'Example Corp',
  snowflakeData
);
```

### 3. ConsolidatedProfileAdapter
Provides backward compatibility and integration with existing services.

```typescript
import { ConsolidatedProfileAdapter } from './services/consolidated-profiles';

const adapter = new ConsolidatedProfileAdapter(database);

// Get contractor in legacy format
const contractor = await adapter.getEnhancedContractor('ABC123XYZ789');

// Integrate Snowflake data
const profile = await adapter.integrateSnowflakeData('ABC123XYZ789', {
  recipientName: 'Example Corp',
  revenueTtmMillions: 150.5,
  performanceScores: { composite: 85, revenue: 90 },
  // ... other Snowflake fields
});

// Generate AI insights
const withInsights = await adapter.generateAIInsights('ABC123XYZ789');
```

## Data Sources Integration

### Snowflake Integration
```typescript
// Financial and performance data from Snowflake
const snowflakeData = {
  uei: 'ABC123XYZ789',
  recipientName: 'Example Defense Corp',
  entityClassification: 'PRIMARY_PRIME',
  revenueTtmMillions: 250.5,
  awardsTtmMillions: 180.2,
  calculatedPipelineMillions: 95.8,
  performanceScores: {
    awards: 88,
    revenue: 92,
    pipeline: 85,
    duration: 78,
    growth: 82,
    composite: 87
  },
  peerGroup: {
    naicsCode: '541330',
    groupSize: 156,
    marketSharePercent: 8.5,
    performanceClassification: 'Strong',
    performanceTier: 'Top 25%'
  },
  primaryNaicsCode: '541330',
  agencyFocus: 'Defense',
  sizeTier: 'LARGE'
};

await adapter.integrateSnowflakeData(uei, snowflakeData);
```

### Lusha Integration
```typescript
// Company enrichment from Lusha
const lushaData = {
  companyName: 'Example Defense Corp',
  website: 'https://exampledefense.com',
  domain: 'exampledefense.com',
  location: {
    country: 'US',
    state: 'VA',
    city: 'Arlington'
  },
  companyDetails: {
    foundedYear: 2005,
    employeeCount: 1250,
    industry: 'Defense & Security'
  },
  digitalPresence: {
    linkedinUrl: 'https://linkedin.com/company/example-defense',
    logoUrl: 'https://example.com/logo.png'
  }
};

await adapter.integrateLushaData(uei, lushaData);
```

### AI Insights Generation
```typescript
// Generate insights based on performance data
const insights = await adapter.generateAIInsights(uei);

// Results in structured insights:
{
  performanceInsights: {
    strongestHeadline: "Revenue Leader",
    strongestInsight: "Exceptional revenue performance indicates strong market capture",
    weakestHeadline: "Duration Gap",
    weakestInsight: "Portfolio duration below peer average suggests opportunity",
    confidenceScore: 85
  },
  marketInsights: {
    competitiveAdvantages: ["Industry-leading performance metrics"],
    marketOpportunities: ["Expansion into adjacent markets"],
    riskFactors: [],
    strategicRecommendations: []
  }
}
```

## Database Schema

The system uses PostgreSQL with JSONB for optimal performance:

```sql
-- Main profiles table with computed fields for fast querying
CREATE TABLE consolidated_contractor_profiles (
    profile_id VARCHAR(36) PRIMARY KEY,
    uei VARCHAR(12) NOT NULL UNIQUE,
    primary_name VARCHAR(255) NOT NULL,
    profile_data JSONB NOT NULL,

    -- Quick access computed fields
    revenue_ttm_millions DECIMAL(12,2),
    composite_performance_score INTEGER,
    primary_industry VARCHAR(100),
    size_tier VARCHAR(20),

    -- Data freshness tracking
    snowflake_expires_at TIMESTAMP WITH TIME ZONE,
    lusha_expires_at TIMESTAMP WITH TIME ZONE,
    ai_insights_expires_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimized indexes for common queries
CREATE INDEX idx_consolidated_profiles_uei ON consolidated_contractor_profiles(uei);
CREATE INDEX idx_consolidated_profiles_composite_score ON consolidated_contractor_profiles(composite_performance_score DESC);
CREATE INDEX idx_consolidated_profiles_revenue_ttm ON consolidated_contractor_profiles(revenue_ttm_millions DESC);
CREATE INDEX idx_consolidated_profiles_name_search ON consolidated_contractor_profiles USING gin(to_tsvector('english', primary_name));
```

## Caching Strategy

The system implements multi-tiered caching:

1. **Memory Cache**: Fast access for frequently requested profiles
2. **Database Cache**: Persistent storage with expiration tracking
3. **Data Source Cache**: Individual cache TTLs per data source
   - Snowflake: 1 day (financial data changes daily)
   - Lusha: 1 week (company info changes slowly)
   - AI Insights: 30 days (insights remain relevant longer)

```typescript
const cacheStrategy = {
  defaultTtl: 3600, // 1 hour in memory
  maxSize: 10000,   // 10k profiles in memory
  evictionPolicy: 'lru',
  compressionEnabled: true
};

const service = new ConsolidatedProfileService(database, cacheStrategy);
```

## Usage Examples

### Basic Profile Operations
```typescript
import { createConsolidatedProfileSystem } from './services/consolidated-profiles';

const profiles = createConsolidatedProfileSystem(database);

// Get complete profile
const profile = await profiles.getProfile('ABC123XYZ789');

// Search with filters
const results = await profiles.searchProfiles('aerospace', {
  minPerformanceScore: 80,
  requireLushaData: true
});

// Update from Snowflake
await profiles.updateFromSnowflake('ABC123XYZ789', snowflakeData);

// Generate fresh insights
await profiles.generateInsights('ABC123XYZ789');
```

### Advanced Filtering
```typescript
const advancedResults = await service.getProfiles({
  industries: ['defense', 'aerospace'],
  sizeTiers: ['LARGE', 'MEGA'],
  minPerformanceScore: 75,
  performanceTiers: ['Top 10%', 'Top 25%'],
  requireSnowflakeData: true,
  requireLushaData: true,
  minDataCompleteness: 80,
  excludeStale: true,
  maxAgeHours: 24
}, {
  limit: 50,
  sortBy: 'composite_performance_score',
  sortOrder: 'DESC'
});
```

### Bulk Operations
```typescript
// Bulk update multiple profiles
const result = await service.bulkUpdateProfiles([
  {
    ueis: ['UEI1', 'UEI2', 'UEI3'],
    refreshSources: ['snowflake', 'lusha']
  }
]);

console.log(`Updated: ${result.successful.length}, Failed: ${result.failed.length}`);
```

### Cache Management
```typescript
// Get cache statistics
const stats = await service.getCacheStats();
console.log(`Cache hit rate: ${stats.cacheHitRate}%`);
console.log(`Average data age: ${stats.averageDataAge} hours`);

// Find profiles needing refresh
const staleProfiles = await service.getProfilesNeedingRefresh(100);
console.log(`Found ${staleProfiles.length} profiles needing refresh`);
```

## Migration from Legacy System

The adapter provides seamless migration:

```typescript
// Migrate existing contractors
const legacyContractors = await getLegacyContractors();
const migrationResult = await adapter.bulkMigrateContractors(legacyContractors);

// Use enhanced lookup (backward compatible)
const enhancedContractor = await adapter.getEnhancedContractor('ABC123XYZ789');

// Enhanced search with consolidated power
const searchResults = await adapter.searchEnhancedContractors('defense', {
  minPerformanceScore: 80
});
```

## Performance Benefits

- **Fast Queries**: Computed fields eliminate JSON parsing for common filters
- **Efficient Caching**: Multi-tiered strategy reduces API calls and database hits
- **Smart Refresh**: Only refresh stale data sources, not entire profiles
- **Batch Operations**: Bulk updates minimize database round trips
- **Full-Text Search**: PostgreSQL GIN indexes for fast text search

## Monitoring and Maintenance

```typescript
// Monitor cache performance
const stats = await service.getCacheStats();

// Schedule maintenance
await adapter.scheduleProfileRefresh('high'); // Priority refresh

// Health check
const staleCount = await service.getProfilesNeedingRefresh().length;
if (staleCount > 1000) {
  console.warn('High number of stale profiles detected');
}
```