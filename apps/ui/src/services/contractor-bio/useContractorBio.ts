/**
 * React Hook for AI-Generated Contractor Bio
 *
 * Uses Claude Opus to generate professional one-liner contractor bios
 * with integrated business context and market positioning.
 */

import { useState, useEffect } from 'react';

export interface ContractorBioContext {
  uei: string;
  contractorName: string;
  naicsCode?: string;
  naicsDescription?: string;
  primaryPSCs?: string[];
  location?: {
    city?: string;
    state?: string;
  };
  businessContext?: {
    totalValue?: number;
    contractCount?: number;
    primaryAgencies?: string[];
    agencyFocus?: string; // "Defense" | "Civilian"
  };
}

export interface ContractorBioResult {
  bio: string | null;
  isLoading: boolean;
  error: string | null;
  source: 'ai' | 'cache' | null;
}

/**
 * Hook for generating AI-powered contractor bios
 */
export function useContractorBio(context: ContractorBioContext | null): ContractorBioResult {
  const [bio, setBio] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'ai' | 'cache' | null>(null);

  useEffect(() => {
    if (!context || !context.uei || !context.contractorName) {
      setBio(null);
      setSource(null);
      setError(null);
      return;
    }

    const generateBio = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/v1/contractor-bio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(context),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate bio: ${response.statusText}`);
        }

        const result = await response.json();
        setBio(result.bio);
        setSource(result.source);
      } catch (err) {
        console.error('Contractor bio generation failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setBio(null);
        setSource(null);
      } finally {
        setIsLoading(false);
      }
    };

    generateBio();
  }, [
    context?.uei,
    context?.contractorName,
    context?.naicsCode,
    context?.naicsDescription,
    JSON.stringify(context?.primaryPSCs),
    JSON.stringify(context?.location),
    JSON.stringify(context?.businessContext)
  ]);

  return { bio, isLoading, error, source };
}