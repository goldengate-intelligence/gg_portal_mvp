import Anthropic from '@anthropic-ai/sdk';

export interface PerformanceInsight {
  strongestHeadline: string; // 2-3 words
  strongestInsight: string; // ≤100 chars
  weakestHeadline: string; // 2-3 words
  weakestInsight: string; // ≤100 chars
  source: 'ai' | 'cache';
  generatedAt: string;
  cacheExpiry: string;
}

export interface PerformanceInsightData {
  uei: string;
  contractorName: string;
  strongestAttribute: {
    name: string;
    score: number;
  };
  weakestAttribute: {
    name: string;
    score: number;
  };
  allScores: {
    awards: number;
    revenue: number;
    pipeline: number;
    duration: number;
    growth: number;
  };
  peerGroupContext: {
    naicsCode: string;
    groupSize: number;
    entityClassification: string;
  };
}

class PerformanceInsightsService {
  private anthropic: Anthropic;
  private cache = new Map<string, PerformanceInsight>();
  private cacheFile = 'apps/ui/src/data/performance-insights-cache.json';

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.loadCache();
  }

  private async loadCache() {
    try {
      const fs = await import('fs');
      if (fs.existsSync(this.cacheFile)) {
        const data = JSON.parse(fs.readFileSync(this.cacheFile, 'utf-8'));
        this.cache = new Map(Object.entries(data));
      }
    } catch (error) {
      console.log('Performance insights cache not found, starting fresh');
    }
  }

  private async saveCache() {
    try {
      const fs = await import('fs');
      const path = await import('path');

      const dir = path.dirname(this.cacheFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const cacheObject = Object.fromEntries(this.cache);
      fs.writeFileSync(this.cacheFile, JSON.stringify(cacheObject, null, 2));
    } catch (error) {
      console.error('Failed to save performance insights cache:', error);
    }
  }

  private isCacheValid(insight: PerformanceInsight): boolean {
    return new Date() < new Date(insight.cacheExpiry);
  }

  async generatePerformanceInsights(data: PerformanceInsightData): Promise<PerformanceInsight> {
    // Check cache first
    const cached = this.cache.get(data.uei);
    if (cached && this.isCacheValid(cached)) {
      return { ...cached, source: 'cache' };
    }

    try {
      const prompt = `Generate concise performance insights for government contractor analysis.

CONTRACTOR: ${data.contractorName} (UEI: ${data.uei})

PERFORMANCE SCORES (0-100 percentile):
- Awards Captured: ${data.allScores.awards}
- Revenue: ${data.allScores.revenue}
- Pipeline Development: ${data.allScores.pipeline}
- Portfolio Duration: ${data.allScores.duration}
- Blended Growth: ${data.allScores.growth}

PEER GROUP: ${data.peerGroupContext.groupSize} contractors in NAICS ${data.peerGroupContext.naicsCode} (${data.peerGroupContext.entityClassification})

STRONGEST: ${data.strongestAttribute.name} (${data.strongestAttribute.score}th percentile)
WEAKEST: ${data.weakestAttribute.name} (${data.weakestAttribute.score}th percentile)

Provide exactly 4 elements:
1. STRONGEST_HEADLINE: 2-3 word phrase summarizing the strongest capability area
2. STRONGEST_INSIGHT: Analyze what the high performance indicates about capabilities (≤100 chars)
3. WEAKEST_HEADLINE: 2-3 word phrase summarizing the weakest capability area
4. WEAKEST_INSIGHT: Analyze what the low performance suggests for improvement (≤100 chars)

Format as JSON:
{
  "strongestHeadline": "2-3 words",
  "strongestInsight": "insight text here",
  "weakestHeadline": "2-3 words",
  "weakestInsight": "insight text here"
}`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const result = JSON.parse(content.text);

      // Validate response format
      if (!result.strongestHeadline || !result.strongestInsight || !result.weakestHeadline || !result.weakestInsight) {
        throw new Error('Invalid response format from Claude');
      }

      // Ensure character limits
      const strongestHeadline = result.strongestHeadline.slice(0, 20); // Keep headlines short
      const strongestInsight = result.strongestInsight.slice(0, 100);
      const weakestHeadline = result.weakestHeadline.slice(0, 20);
      const weakestInsight = result.weakestInsight.slice(0, 100);

      const insight: PerformanceInsight = {
        strongestHeadline,
        strongestInsight,
        weakestHeadline,
        weakestInsight,
        source: 'ai',
        generatedAt: new Date().toISOString(),
        cacheExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      // Cache the result
      this.cache.set(data.uei, insight);
      await this.saveCache();

      return insight;

    } catch (error) {
      console.error('Failed to generate performance insights:', error);

      // Return fallback insights
      return {
        strongestHeadline: "Performance Leader",
        strongestInsight: `${data.strongestAttribute.name} excellence drives competitive advantage`,
        weakestHeadline: "Growth Area",
        weakestInsight: `${data.weakestAttribute.name} improvement could enhance overall performance`,
        source: 'ai',
        generatedAt: new Date().toISOString(),
        cacheExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
    }
  }
}

export const performanceInsightsService = new PerformanceInsightsService();