/**
 * React Hook for Reference Data
 *
 * Provides easy access to NAICS and PSC descriptions in React components.
 * Used throughout contractor-detail and portfolio components.
 */

import { useState, useEffect, useCallback } from 'react';
import { referenceDataService } from './reference-data-service';
import type { NAICSReference, PSCReference } from './reference-data-service';

// Hook for single NAICS lookup
export function useNAICSDescription(naicsCode: string | null | undefined) {
  const [description, setDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!naicsCode) {
      setDescription(null);
      return;
    }

    setIsLoading(true);
    referenceDataService.getNAICSDescription(naicsCode)
      .then(setDescription)
      .catch(() => setDescription(null))
      .finally(() => setIsLoading(false));
  }, [naicsCode]);

  return { description, isLoading };
}

// Hook for single PSC lookup
export function usePSCDescription(pscCode: string | null | undefined) {
  const [description, setDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!pscCode) {
      setDescription(null);
      return;
    }

    setIsLoading(true);
    referenceDataService.getPSCDescription(pscCode)
      .then(setDescription)
      .catch(() => setDescription(null))
      .finally(() => setIsLoading(false));
  }, [pscCode]);

  return { description, isLoading };
}

// Hook for NAICS with fallback hierarchy
export function useNAICSWithFallback(naicsCode: string | null | undefined) {
  const [naicsData, setNAICSData] = useState<NAICSReference | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!naicsCode) {
      setNAICSData(null);
      return;
    }

    setIsLoading(true);
    referenceDataService.getNAICSWithFallback(naicsCode)
      .then(setNAICSData)
      .catch(() => setNAICSData(null))
      .finally(() => setIsLoading(false));
  }, [naicsCode]);

  return { naicsData, isLoading };
}

// Hook for PSC with fallback hierarchy
export function usePSCWithFallback(pscCode: string | null | undefined) {
  const [pscData, setPSCData] = useState<PSCReference | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!pscCode) {
      setPSCData(null);
      return;
    }

    setIsLoading(true);
    referenceDataService.getPSCWithFallback(pscCode)
      .then(setPSCData)
      .catch(() => setPSCData(null))
      .finally(() => setIsLoading(false));
  }, [pscCode]);

  return { pscData, isLoading };
}

// Hook for industry summary (2-digit NAICS)
export function useIndustrySummary(naicsCode: string | null | undefined) {
  const [industrySummary, setIndustrySummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!naicsCode) {
      setIndustrySummary(null);
      return;
    }

    setIsLoading(true);
    referenceDataService.getIndustrySummary(naicsCode)
      .then(setIndustrySummary)
      .catch(() => setIndustrySummary(null))
      .finally(() => setIsLoading(false));
  }, [naicsCode]);

  return { industrySummary, isLoading };
}

// Hook for batch NAICS lookups (performance optimized)
export function useBatchNAICS(naicsCodes: (string | null | undefined)[]) {
  const [naicsMap, setNAICSMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!naicsCodes.length) {
      setNAICSMap(new Map());
      return;
    }

    setIsLoading(true);
    referenceDataService.batchGetNAICS(naicsCodes)
      .then(setNAICSMap)
      .catch(() => setNAICSMap(new Map()))
      .finally(() => setIsLoading(false));
  }, [naicsCodes]);

  const getNAICSDescription = useCallback((code: string | null | undefined): string | null => {
    if (!code) return null;
    return naicsMap.get(code) || null;
  }, [naicsMap]);

  return { naicsMap, getNAICSDescription, isLoading };
}

// Hook for batch PSC lookups (performance optimized)
export function useBatchPSC(pscCodes: (string | null | undefined)[]) {
  const [pscMap, setPSCMap] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!pscCodes.length) {
      setPSCMap(new Map());
      return;
    }

    setIsLoading(true);
    referenceDataService.batchGetPSC(pscCodes)
      .then(setPSCMap)
      .catch(() => setPSCMap(new Map()))
      .finally(() => setIsLoading(false));
  }, [pscCodes]);

  const getPSCDescription = useCallback((code: string | null | undefined): string | null => {
    if (!code) return null;
    return pscMap.get(code) || null;
  }, [pscMap]);

  return { pscMap, getPSCDescription, isLoading };
}

// Hook for reference data initialization (use in app root)
export function useReferenceDataInit() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (referenceDataService.isReferenceDataLoaded()) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    referenceDataService.loadReferenceData()
      .then(() => {
        setIsLoaded(true);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        console.error('Failed to initialize reference data:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { isLoaded, isLoading, error };
}

// Hook for reference data stats (debugging)
export function useReferenceDataStats() {
  const [stats, setStats] = useState({ naicsCount: 0, pscCount: 0, isLoaded: false });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(referenceDataService.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}