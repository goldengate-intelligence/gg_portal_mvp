import { Elysia, t } from "elysia";
import fs from 'fs/promises';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

interface ExecutiveSummaryRequest {
  uei: string;
  contractorName: string;
  naicsCodes?: string[];
  pscCodes?: string[];
  agencies?: string[];
  partners?: string[];
  contractTypes?: string[];
  recentAwards?: any[];
}

interface ExecutiveSummary {
  headline: string; // ≤40 chars
  principalActivity: string; // ≤90 chars
  bulletPoints: string[]; // 3 bullets, ≤55 chars each
  generatedAt: string;
  source: 'ai' | 'cached';
}

interface CachedSummary {
  uei: string;
  contractorName: string;
  summary: ExecutiveSummary;
  lastUpdated: string;
  dataHash: string; // To detect if contractor data changed
}

// Initialize Claude API client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '',
});

// Path to our executive summaries cache
const CACHE_FILE_PATH = path.join(__dirname, '../../../ui/src/data/executive-summaries-cache.json');

const executiveSummaryRoutes = new Elysia({ prefix: "/executive-summary" })
  .post("/", async ({ body, set }): Promise<{ summary: ExecutiveSummary }> => {
    try {
      const requestData = body as ExecutiveSummaryRequest;
      const { uei, contractorName } = requestData;

      if (!uei || !contractorName) {
        set.status = 400;
        throw new Error('Missing required fields: uei, contractorName');
      }

      // Check cache first
      const cachedSummary = await getCachedSummary(uei, requestData);
      if (cachedSummary) {
        console.log(`Using cached executive summary for UEI: ${uei}`);
        return { summary: { ...cachedSummary.summary, source: 'cached' as const } };
      }

      // Generate new summary using AI
      const summary = await generateExecutiveSummary(requestData);

      if (summary) {
        // Cache the result
        await cacheSummary(uei, contractorName, summary, requestData);

        return { summary: { ...summary, source: 'ai' as const } };
      }

      // Fallback if AI fails
      const fallbackSummary = generateFallbackSummary(requestData);
      return { summary: { ...fallbackSummary, source: 'ai' as const } };

    } catch (error) {
      console.error('Executive summary generation error:', error);
      set.status = 500;
      throw new Error('Failed to generate executive summary');
    }
  }, {
    body: t.Object({
      uei: t.String(),
      contractorName: t.String(),
      naicsCodes: t.Optional(t.Array(t.String())),
      pscCodes: t.Optional(t.Array(t.String())),
      agencies: t.Optional(t.Array(t.String())),
      partners: t.Optional(t.Array(t.String())),
      contractTypes: t.Optional(t.Array(t.String())),
      recentAwards: t.Optional(t.Array(t.Any()))
    })
  });

/**
 * Generate executive summary using Claude Haiku
 */
async function generateExecutiveSummary(data: ExecutiveSummaryRequest): Promise<ExecutiveSummary | null> {
  try {
    // Check if API key is configured
    if (!process.env.CLAUDE_API_KEY) {
      console.warn('CLAUDE_API_KEY not configured, using fallback');
      return generateFallbackSummary(data);
    }

    // Build context from contractor data
    const context = buildContractorContext(data);

    // Create the prompt
    const systemPrompt = `You are an expert business analyst specializing in government contractor profiles. Create concise, accurate executive summaries based on contractor data.

CRITICAL REQUIREMENTS:
- Headline: Maximum 40 characters, contractor specialty
- Principal Activity: Maximum 90 characters, core business function
- Three Bullet Points: Maximum 55 characters each, specific products/services

Focus on PSC codes for specificity, use NAICS for industry context, and incorporate partner/agency relationships.`;

    const userPrompt = `Create an executive summary for: ${data.contractorName}

${context}

Respond in this exact JSON format:
{
  "headline": "Brief specialty description (≤40 chars)",
  "principalActivity": "Core business function (≤90 chars)",
  "bulletPoints": [
    "Specific product/service 1 (≤55 chars)",
    "Specific product/service 2 (≤55 chars)",
    "Specific product/service 3 (≤55 chars)"
  ]
}`;

    // Call Claude Haiku API
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      temperature: 0.4,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    // Extract and parse the response
    const content = response.content[0]?.type === 'text' ? response.content[0].text.trim() : null;
    if (!content) return null;

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content);

      // Validate response structure and character limits
      if (validateSummaryResponse(parsed)) {
        console.log(`Claude AI generated executive summary for ${data.contractorName}`);
        return {
          headline: parsed.headline,
          principalActivity: parsed.principalActivity,
          bulletPoints: parsed.bulletPoints,
          generatedAt: new Date().toISOString(),
          source: 'ai' as const
        };
      }
    } catch (parseError) {
      console.warn('Failed to parse Claude response as JSON:', parseError);
    }

    // Fallback if parsing fails
    return generateFallbackSummary(data);

  } catch (error) {
    console.warn(`Claude AI generation failed for ${data.contractorName}:`, error);
    return generateFallbackSummary(data);
  }
}

/**
 * Build context string from contractor data
 */
function buildContractorContext(data: ExecutiveSummaryRequest): string {
  const context = [];

  if (data.pscCodes && data.pscCodes.length > 0) {
    context.push(`PSC Codes: ${data.pscCodes.join(', ')} (Primary focus for products/services)`);
  }

  if (data.naicsCodes && data.naicsCodes.length > 0) {
    context.push(`NAICS Codes: ${data.naicsCodes.join(', ')} (Industry classification)`);
  }

  if (data.agencies && data.agencies.length > 0) {
    context.push(`Key Agencies: ${data.agencies.slice(0, 3).join(', ')}`);
  }

  if (data.partners && data.partners.length > 0) {
    context.push(`Partners: ${data.partners.slice(0, 3).join(', ')}`);
  }

  if (data.contractTypes && data.contractTypes.length > 0) {
    context.push(`Contract Types: ${data.contractTypes.join(', ')}`);
  }

  return context.join('\n');
}

/**
 * Validate Claude's response meets our requirements
 */
function validateSummaryResponse(parsed: any): boolean {
  return (
    typeof parsed.headline === 'string' &&
    parsed.headline.length <= 40 &&
    typeof parsed.principalActivity === 'string' &&
    parsed.principalActivity.length <= 90 &&
    Array.isArray(parsed.bulletPoints) &&
    parsed.bulletPoints.length === 3 &&
    parsed.bulletPoints.every((bullet: any) =>
      typeof bullet === 'string' && bullet.length <= 55
    )
  );
}

/**
 * Generate fallback summary when AI fails
 */
function generateFallbackSummary(data: ExecutiveSummaryRequest): ExecutiveSummary {
  // Determine industry from NAICS
  const industry = getIndustryFromNAICS(data.naicsCodes?.[0] || '');

  // Create basic summary
  const headline = `${industry} contractor`.substring(0, 40);
  const principalActivity = `Providing ${industry.toLowerCase()} services and solutions`.substring(0, 90);

  // Generate bullet points based on available data
  const bullets = generateFallbackBullets(data);

  return {
    headline,
    principalActivity,
    bulletPoints: bullets,
    generatedAt: new Date().toISOString(),
    source: 'ai' as const
  };
}

/**
 * Generate fallback bullet points
 */
function generateFallbackBullets(data: ExecutiveSummaryRequest): string[] {
  const bullets = [];

  // Use PSC codes for specific services
  if (data.pscCodes && data.pscCodes.length > 0) {
    const pscBullets = data.pscCodes.slice(0, 3).map(code =>
      getPSCBasedService(code).substring(0, 55)
    );
    bullets.push(...pscBullets);
  }

  // Fill remaining with NAICS-based services
  while (bullets.length < 3) {
    const industry = getIndustryFromNAICS(data.naicsCodes?.[0] || '');
    bullets.push(`${industry} services and solutions`.substring(0, 55));
  }

  return bullets.slice(0, 3);
}

/**
 * Get industry name from NAICS code
 */
function getIndustryFromNAICS(naicsCode: string): string {
  const codePrefix = naicsCode.substring(0, 2);
  const industryMap: Record<string, string> = {
    '23': 'Construction',
    '31': 'Manufacturing',
    '32': 'Manufacturing',
    '33': 'Manufacturing',
    '54': 'Professional Services',
    '56': 'Administrative Services'
  };
  return industryMap[codePrefix] || 'Professional';
}

/**
 * Get service description from PSC code
 */
function getPSCBasedService(pscCode: string): string {
  const codePrefix = pscCode.substring(0, 2);
  const serviceMap: Record<string, string> = {
    '51': 'Specialized hand tools and equipment',
    '54': 'Prefabricated structures and buildings',
    '56': 'Construction materials and components',
    '70': 'Information technology services',
    '72': 'Furniture and furnishing solutions'
  };
  return serviceMap[codePrefix] || 'Specialized products and services';
}

/**
 * Get cached summary if available and still valid
 */
async function getCachedSummary(uei: string, data: ExecutiveSummaryRequest): Promise<CachedSummary | null> {
  try {
    const cacheContent = await fs.readFile(CACHE_FILE_PATH, 'utf8');
    const cache = JSON.parse(cacheContent);

    const cachedEntry = cache.summaries?.find((entry: CachedSummary) => entry.uei === uei);

    if (cachedEntry) {
      // Check if data has changed (simple hash comparison)
      const currentHash = generateDataHash(data);
      if (cachedEntry.dataHash === currentHash) {
        // Check if cache is still fresh (30 days)
        const cacheAge = Date.now() - new Date(cachedEntry.lastUpdated).getTime();
        if (cacheAge < 30 * 24 * 60 * 60 * 1000) { // 30 days
          return cachedEntry;
        }
      }
    }

    return null;
  } catch (error) {
    // Cache file doesn't exist or is invalid
    return null;
  }
}

/**
 * Cache the generated summary
 */
async function cacheSummary(
  uei: string,
  contractorName: string,
  summary: ExecutiveSummary,
  data: ExecutiveSummaryRequest
): Promise<void> {
  try {
    // Load existing cache or create new
    let cache = { summaries: [] as CachedSummary[] };

    try {
      const cacheContent = await fs.readFile(CACHE_FILE_PATH, 'utf8');
      cache = JSON.parse(cacheContent);
    } catch (error) {
      // Cache file doesn't exist, start fresh
    }

    // Remove existing entry for this UEI
    cache.summaries = cache.summaries.filter((entry: CachedSummary) => entry.uei !== uei);

    // Add new entry
    const newEntry: CachedSummary = {
      uei,
      contractorName,
      summary,
      lastUpdated: new Date().toISOString(),
      dataHash: generateDataHash(data)
    };

    cache.summaries.push(newEntry);

    // Ensure directory exists
    await fs.mkdir(path.dirname(CACHE_FILE_PATH), { recursive: true });

    // Write updated cache
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(cache, null, 2));

    console.log(`Cached executive summary for UEI: ${uei} (${contractorName})`);
  } catch (error) {
    console.warn(`Failed to cache summary for UEI ${uei}:`, error);
  }
}

/**
 * Generate simple hash of contractor data to detect changes
 */
function generateDataHash(data: ExecutiveSummaryRequest): string {
  const hashData = {
    naics: data.naicsCodes?.sort().join(',') || '',
    psc: data.pscCodes?.sort().join(',') || '',
    agencies: data.agencies?.sort().join(',') || '',
    partners: data.partners?.sort().join(',') || ''
  };

  return Buffer.from(JSON.stringify(hashData)).toString('base64');
}

export default executiveSummaryRoutes;