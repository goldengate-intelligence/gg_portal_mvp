/**
 * Contractor Detail Contact Integration Service (Legacy Compatibility)
 *
 * This file now imports from the refactored contact integration service
 * while maintaining backward compatibility for existing imports.
 */

// Import from refactored service
export {
  contactIntegrationService as contractorContactService,
  type ContactSearchResult,
  type ContactExportData,
} from './contact-integration/index';

// Re-export types for backward compatibility
export type {
  ContractorContact,
  ContactSearchFilters,
  ContactStatistics,
  ContactExportOptions,
} from './contact-integration/index';
