# Industry Image Matching Service

## Overview

A sophisticated tagging system that matches contractors to the most relevant industry image from the `gg_industry_images` collection based on comprehensive data analysis.

## How It Works

The system analyzes multiple contractor data points and matches them against extensive tag arrays for each of the 16 industry images:

### Scoring Algorithm

1. **NAICS Code Matching** (High Weight: 10-15 points)
   - Exact matches: 15 points
   - Partial matches (first 3 digits): 10 points

2. **PSC Code Matching** (High Weight: 8-12 points)
   - Exact matches: 12 points
   - Partial matches (first 2 digits): 8 points

3. **Keyword Matching** (Medium Weight: 3-5 points)
   - Direct keyword matches: 5 points
   - Tag matches: 3 points

4. **Agency Type Matching** (Medium Weight: 4 points)
   - Agency name overlap: 4 points

5. **Contract Type Matching** (Low Weight: 2 points)
   - Contract type matches: 2 points

6. **Text Analysis** (Low Weight: 1 point)
   - Description/services text matches: 1 point per tag

## Usage

### Basic Usage (Recommended)
```typescript
import { IndustryImageMatchingService } from '@/services/industry-image-matching';

// Get the best matching image for a contractor
const imagePath = IndustryImageMatchingService.getBestImageForContractor(
  contractor,
  activityEvents
);
```

### Advanced Usage
```typescript
// Get multiple image options with scores
const options = IndustryImageMatchingService.getImageOptionsForContractor(
  contractor,
  activityEvents,
  3 // limit to top 3 matches
);

// Get detailed matching analysis for debugging
const analysis = IndustryImageMatchingService.getMatchingAnalysis(
  contractor,
  activityEvents
);
```

## Industry Images & Tags

The system includes comprehensive tags for all 16 industry images:

1. **Defense** (`1_defense.jpg`) - Military, weapons, aerospace, security
2. **Information Technology** (`2_informationtechnology.jpg`) - Software, hardware, digital
3. **Construction** (`3_construction.jpg`) - Building, engineering, infrastructure
4. **Professional Services** (`4_professionalservices.jpg`) - Consulting, advisory
5. **Research & Development** (`5_researchdevelopment.jpg`) - Science, innovation
6. **Manufacturing** (`6_manufacturing.jpg`) - Production, industrial
7. **Facilities Management** (`7_facilitiesmanagement.jpg`) - Maintenance, operations
8. **Healthcare** (`8_healthcare.jpg`) - Medical, clinical, pharmaceutical
9. **Transportation** (`9_transportation.jpg`) - Logistics, shipping, fleet
10. **Environmental Services** (`10_environmentalservices.jpg`) - Sustainability, cleanup
11. **Telecommunications** (`11_telecom.jpg`) - Communications, networks
12. **Energy** (`12_energy.jpg`) - Power, utilities, renewable
13. **Financial Services** (`13_financialservices.jpg`) - Banking, accounting
14. **Education Services** (`14_educationservices.jpg`) - Training, learning
15. **Agriculture** (`15_agriculture.jpg`) - Farming, food production
16. **Other** (`16_other.jpg`) - General services, miscellaneous

## Data Sources

The matching algorithm extracts data from:
- Contractor profile information
- Activity events and transaction history
- NAICS and PSC codes
- Agency relationships
- Contract types and descriptions
- Service descriptions and capabilities

## Performance

- **Fast**: Optimized scoring algorithm with early exit conditions
- **Accurate**: Weighted scoring prioritizes high-confidence matches
- **Fallback**: Always returns a valid image (defaults to "Other" if no matches)
- **Safe**: Error handling prevents runtime crashes

## Integration

The service is already integrated into:
- `ExecutiveSummaryPanel` - Automatically selects the best industry image
- Available in the main services barrel export

## Configuration

Tag arrays can be extended or modified in `industry-tags.ts` without breaking existing functionality. The scoring weights can be adjusted in the `getBestMatchingIndustryImage` function.