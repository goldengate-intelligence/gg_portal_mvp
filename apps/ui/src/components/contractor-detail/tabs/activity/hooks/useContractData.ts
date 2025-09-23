import { useMemo } from 'react';
import { getContractData } from '../logic/contractData';
import { separateContracts, groupByRelationship, sortInflowRelationships } from '../logic/contractGrouping';

export const useContractData = () => {
  const contracts = useMemo(() => getContractData(), []);

  const { inflowContracts, outflowContracts } = useMemo(() =>
    separateContracts(contracts), [contracts]
  );

  const inflowRelationships = useMemo(() =>
    groupByRelationship(inflowContracts), [inflowContracts]
  );

  const outflowRelationships = useMemo(() =>
    groupByRelationship(outflowContracts), [outflowContracts]
  );

  const sortedInflowRelationships = useMemo(() =>
    sortInflowRelationships(inflowRelationships), [inflowRelationships]
  );

  return {
    contracts,
    inflowContracts,
    outflowContracts,
    inflowRelationships,
    outflowRelationships,
    sortedInflowRelationships
  };
};