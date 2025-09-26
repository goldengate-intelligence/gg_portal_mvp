/**
 * Contact Integration Module Index
 *
 * Barrel exports for the refactored contact integration service
 */

// Main service
export {
  contactIntegrationService,
  contractorContactService
} from './contact-integration-service';

// Types
export * from './types/contact-types';

// Services (for advanced usage)
export { ContactTransformer } from './services/contact-transformer';
export { ContactFilterService } from './services/contact-filter-service';
export { CSVExportService } from './services/csv-export-service';
export { MockContactProvider } from './providers/mock-contact-provider';

// Interfaces
export type { ContactSearchResult, ContactExportData } from './contact-integration-service';