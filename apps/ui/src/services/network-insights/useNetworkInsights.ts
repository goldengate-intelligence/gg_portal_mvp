import { useState, useEffect } from 'react';
import type { NetworkInsight, NetworkInsightData } from './index';

export function useNetworkInsights(data: NetworkInsightData | null) {
  const [insights, setInsights] = useState<NetworkInsight | null>(null);
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
        const response = await fetch('/api/v1/network-insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate insights: ${response.statusText}`);
        }

        const result: NetworkInsight = await response.json();
        setInsights(result);
      } catch (err) {
        console.error('Network insights generation failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');

        // Fallback insights
        setInsights({
          contractorProfileHeadline: "SPECIALIZED CONTRACTOR",
          contractorProfileDescription: `${data.naicsCode} contractor serving government and prime contractor markets with specialized capabilities.`,
          agencyClientsInsight: "Direct government contracts for specialized products and services",
          primeClientsInsight: "Manufacturing support and specialized services for major defense contractors",
          subVendorsInsight: "Procurement of raw materials and specialized components from trusted suppliers",
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
  };
}