import React, { createContext, useContext, ReactNode } from 'react';
import { useReferenceDataInit } from '../services/reference-data';

interface ReferenceDataContextValue {
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
}

const ReferenceDataContext = createContext<ReferenceDataContextValue>({
  isLoaded: false,
  isLoading: false,
  error: null
});

export function useReferenceDataContext() {
  return useContext(ReferenceDataContext);
}

interface ReferenceDataProviderProps {
  children: ReactNode;
}

export function ReferenceDataProvider({ children }: ReferenceDataProviderProps) {
  const referenceData = useReferenceDataInit();

  return (
    <ReferenceDataContext.Provider value={referenceData}>
      {children}
    </ReferenceDataContext.Provider>
  );
}