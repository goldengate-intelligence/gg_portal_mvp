export * from './import';
export * from './sync';
export * from './query';

import { contractorImportService } from './import';
import { contractorSyncService } from './sync';
import { contractorQueryService } from './query';

export const contractorService = {
  import: contractorImportService,
  sync: contractorSyncService,
  query: contractorQueryService,
};

export default contractorService;