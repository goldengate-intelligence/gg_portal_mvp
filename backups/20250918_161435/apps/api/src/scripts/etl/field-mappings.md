# Snowflake to PostgreSQL Field Mappings

## 1. contractor_universe Table
**Source**: full_contractor_universe.csv.gz

| CSV Column | PostgreSQL Column | Transformation |
|------------|------------------|----------------|
| RECIPIENT_UEI | uei | Direct |
| RECIPIENT_NAME | legalBusinessName | Direct |
| ENTITY_TYPE | entityType | Direct (HYBRID, PRIME, SUB) |
| SCALE_TIER | - | Store in metadata |
| HAS_PRIME_ACTIVITY | isPrime | Boolean conversion |
| HAS_SUB_ACTIVITY | isSubcontractor | Boolean conversion |
| ENTITY_TYPE='HYBRID' | isHybrid | Derived |
| TOTAL_REVENUE_LIFETIME_MILLIONS | lifetimeRevenue | Direct |
| LAST_UPDATED | lastUpdatedDate | Date conversion |
| DATA_QUALITY_FLAG | registrationStatus | Map to status |

## 2. contractor_metrics_monthly Table
**Source**: full_contractor_metrics_monthly/*.csv.gz

| CSV Column | PostgreSQL Column | Transformation |
|------------|------------------|----------------|
| SNAPSHOT_MONTH | monthYear | Date conversion |
| RECIPIENT_UEI | contractorUei | Direct |
| RECIPIENT_NAME | contractorName | Direct |
| REVENUE_MONTHLY_MILLIONS | monthlyRevenue | Direct |
| AWARDS_MONTHLY_MILLIONS | monthlyAwards | Direct |
| ACTIVE_CONTRACT_COUNT | activeContracts | Integer |
| ACTIVE_PIPELINE_MILLIONS | pipelineValue | Direct |
| GROWTH_YOY_REVENUE_TTM_PCT | revenueGrowthYoy | Direct |
| ACTIVITY_CLASSIFICATION | activityStatus | Direct |
| DAYS_SINCE_LAST_CONTRACT_START | daysInactive | Integer |
| AWARDING_AGENCY_NAME | primaryAgency | Direct |
| REVENUE_TTM_MILLIONS | - | For avg calculation |
| AVG_CONTRACT_DURATION_MONTHS | - | Store in metadata |

## 3. peer_comparisons_monthly Table
**Source**: peer_comparisons_monthly/*.csv.gz

| CSV Column | PostgreSQL Column | Transformation |
|------------|------------------|----------------|
| SNAPSHOT_MONTH | monthYear | Date conversion |
| RECIPIENT_UEI | contractorUei | Direct |
| RECIPIENT_NAME | contractorName | Direct |
| PEER_NAICS_CODE | peerGroup | Direct |
| PEER_GROUP_SIZE | peerGroupSize | Integer |
| REVENUE_RANK | revenueRank | Integer |
| GROWTH_RANK | growthRank | Integer |
| SIZE_QUARTILE | revenueQuartile | Map 1-4 |
| COMPOSITE_SCORE | overallPerformanceScore | Integer |
| COMPOSITE_RANK | - | Store separately |
| PERFORMANCE_CLASSIFICATION | competitivePositioning | Direct |
| REVENUE_SCORE | revenuePercentile | Scale to 0-100 |
| GROWTH_SCORE | growthPercentile | Scale to 0-100 |

## 4. portfolio_breakdowns_monthly Table
**Source**: portfolio_breakdowns_monthly/*.csv.gz

| CSV Column | PostgreSQL Column | Transformation |
|------------|------------------|----------------|
| RECIPIENT_UEI | contractorUei | Direct |
| SNAPSHOT_MONTH | monthYear | Date conversion |
| TOTAL_AWARD_MILLIONS | - | Store in metadata |
| TOTAL_PIPELINE_MILLIONS | - | Store in metadata |
| AGENCY_AWARD_BREAKDOWN | topAgencies | Parse JSON |
| NAICS_AWARD_BREAKDOWN | topNaics | Parse JSON |
| PSC_AWARD_BREAKDOWN | topPsc | Parse JSON |

Note: HHI calculations and concentration scores need to be derived from the JSON breakdowns.

## 5. subcontractor_metrics_monthly Table
**Source**: full_subcontractor_metrics_monthly/*.csv.gz

| CSV Column | PostgreSQL Column | Transformation |
|------------|------------------|----------------|
| RECIPIENT_UEI | subcontractorUei | Direct |
| RECIPIENT_NAME | subcontractorName | Direct |
| SNAPSHOT_MONTH | monthYear | Date conversion |
| REVENUE_MONTHLY_MILLIONS | monthlySubcontractRevenue | Direct |
| AWARDS_MONTHLY_MILLIONS | - | Store in metadata |
| REVENUE_TTM_MILLIONS | - | For calculations |
| GROWTH_YOY_REVENUE_TTM_PCT | subRevenueGrowthYoy | Direct |
| IS_PERFORMING | - | Boolean flag |

## 6. contractor_network_metrics Table
**Source**: subcontractor_network_metrics_monthly/*.csv.gz

| CSV Column | PostgreSQL Column | Transformation |
|------------|------------------|----------------|
| RECIPIENT_UEI | subUei | Direct |
| RECIPIENT_NAME | subName | Direct |
| SNAPSHOT_MONTH | monthYear | Date conversion |
| DOMINANT_PRIME_UEI | primeUei | Direct |
| DOMINANT_PRIME_NAME | primeName | Direct |
| MAX_PRIME_RELATIONSHIP_TTM | monthlySharedRevenue | Direct |
| TOTAL_PRIME_RELATIONSHIPS | primeNetworkSize | Integer |
| ACTIVE_PRIME_COUNT | - | Store separately |
| MAX_STRENGTH_SCORE | relationshipStrengthScore | Scale to 0-100 |
| OVERALL_STRENGTH_TIER | collaborationFrequency | Map tier |
| MAX_CONCENTRATION_PCT | exclusivityScore | Decimal |

## 7. contractor_search_index Table
**Source**: iceberg_search_union/*.csv.gz

| CSV Column | PostgreSQL Column | Transformation |
|------------|------------------|----------------|
| RECIPIENT_UEI | entityUei | Direct |
| RECIPIENT_NAME | searchableName, displayName | Direct |
| ENTITY_TYPE | entityType | Direct |
| TOTAL_REVENUE_TTM_MILLIONS | - | Store in summary |
| SCALE_TIER | - | Store in metadata |
| HAS_PRIME_ACTIVITY | isActive | Boolean OR with HAS_SUB |

## 8. hybrid_entities Table (Special Processing)
**Source**: hybrid_entities.csv.gz

This contains contractors that work as both primes and subs. Process as:
1. Update contractor_universe with hybrid flags
2. Create entries in both contractor_metrics_monthly and subcontractor_metrics_monthly
3. Calculate versatility scores

## JSON Field Parsing Examples

### Agency Breakdown (portfolio_breakdowns_monthly)
```json
{
  "DEPARTMENT OF DEFENSE": 45.2,
  "NASA": 23.1,
  "DEPARTMENT OF ENERGY": 15.7
}
```
Transform to:
```json
[
  {"agency": "DEPARTMENT OF DEFENSE", "revenue": 45.2, "percentage": 45.2},
  {"agency": "NASA", "revenue": 23.1, "percentage": 23.1},
  {"agency": "DEPARTMENT OF ENERGY", "revenue": 15.7, "percentage": 15.7}
]
```

### Calculate HHI (Herfindahl-Hirschman Index)
```javascript
const calculateHHI = (breakdown) => {
  const values = Object.values(breakdown);
  const total = values.reduce((sum, val) => sum + val, 0);
  const shares = values.map(val => (val / total) * 100);
  return shares.reduce((hhi, share) => hhi + (share * share), 0) / 10000;
};
```