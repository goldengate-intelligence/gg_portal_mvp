/**
 * React Hook for Context-Aware Industry Descriptions
 *
 * Uses Claude Sonnet to generate contextual NAICS/PSC descriptions
 * that incorporate contractor context, rollup scenarios, and market positioning.
 */

import { useState, useEffect } from 'react';

export interface DescriptionContext {
  contractorName?: string;
  totalValue?: number;
  contractCount?: number;
  agencies?: string[];
  description?: string; // For rollup context
}

export interface ContextualDescriptionResult {
  description: string | null;
  isLoading: boolean;
  error: string | null;
  source: 'ai' | 'cache' | null;
}

// Hook for contextual NAICS description
export function useContextualNAICSDescription(
  naicsCode: string | null | undefined,
  context?: DescriptionContext
): ContextualDescriptionResult {
  const [description, setDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'ai' | 'cache' | null>(null);

  useEffect(() => {
    if (!naicsCode) {
      setDescription(null);
      setSource(null);
      return;
    }

    const generateDescription = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/v1/industry-descriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'naics-contextual',
            codes: [naicsCode],
            context: context
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate description: ${response.statusText}`);
        }

        const result = await response.json();
        setDescription(result.description);
        setSource(result.source);
      } catch (err) {
        console.error('Contextual NAICS description generation failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setDescription(null);
        setSource(null);
      } finally {
        setIsLoading(false);
      }
    };

    generateDescription();
  }, [naicsCode, context?.contractorName, context?.totalValue, context?.contractCount, JSON.stringify(context?.agencies)]);

  return { description, isLoading, error, source };
}

// Hook for contextual PSC description
export function useContextualPSCDescription(
  pscCode: string | null | undefined,
  context?: DescriptionContext
): ContextualDescriptionResult {
  const [description, setDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'ai' | 'cache' | null>(null);

  useEffect(() => {
    if (!pscCode) {
      setDescription(null);
      setSource(null);
      return;
    }

    const generateDescription = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/v1/industry-descriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'psc-contextual',
            codes: [pscCode],
            context: context
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate description: ${response.statusText}`);
        }

        const result = await response.json();
        setDescription(result.description);
        setSource(result.source);
      } catch (err) {
        console.error('Contextual PSC description generation failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setDescription(null);
        setSource(null);
      } finally {
        setIsLoading(false);
      }
    };

    generateDescription();
  }, [pscCode, context?.contractorName, context?.totalValue, context?.contractCount, JSON.stringify(context?.agencies)]);

  return { description, isLoading, error, source };
}

// Hook for NAICS rollup description (multiple NAICS codes)
export function useNAICSRollupDescription(
  naicsCodes: string[],
  context?: DescriptionContext
): ContextualDescriptionResult {
  const [description, setDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'ai' | 'cache' | null>(null);

  useEffect(() => {
    if (!naicsCodes || naicsCodes.length === 0) {
      setDescription(null);
      setSource(null);
      return;
    }

    // For single codes, fall back to simple description
    if (naicsCodes.length === 1) {
      setDescription(context?.description || null);
      setSource(null);
      return;
    }

    const generateDescription = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/v1/industry-descriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'naics-rollup',
            codes: naicsCodes,
            context: context
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate description: ${response.statusText}`);
        }

        const result = await response.json();
        setDescription(result.description);
        setSource(result.source);
      } catch (err) {
        console.error('NAICS rollup description generation failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setDescription(context?.description || null);
        setSource(null);
      } finally {
        setIsLoading(false);
      }
    };

    generateDescription();
  }, [JSON.stringify(naicsCodes), context?.contractorName, context?.totalValue, context?.description]);

  return { description, isLoading, error, source };
}