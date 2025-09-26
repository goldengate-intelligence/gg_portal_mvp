import { useState, useEffect } from 'react';
import type { PerformanceInsight, PerformanceInsightData } from './index';

export function usePerformanceInsights(data: PerformanceInsightData | null) {
  const [insights, setInsights] = useState<PerformanceInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) {
      setInsights(null);
      return;
    }

    const generateInsights = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/v1/performance-insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate insights: ${response.statusText}`);
        }

        const result = await response.json();
        setInsights(result);
      } catch (err) {
        console.error('Performance insights generation failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');

        // Set fallback insights
        setInsights({
          strongestHeadline: "Performance Leader",
          strongestInsight: `${data.strongestAttribute.name} excellence drives competitive advantage`,
          weakestHeadline: "Growth Area",
          weakestInsight: `${data.weakestAttribute.name} improvement could enhance overall performance`,
          source: 'ai',
          generatedAt: new Date().toISOString(),
          cacheExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateInsights();
  }, [data]);

  return {
    insights,
    isLoading,
    error,
    isFromCache: insights?.source === 'cache'
  };
}