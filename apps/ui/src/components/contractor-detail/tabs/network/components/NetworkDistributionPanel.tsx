/**
 * Network Distribution Panel (Legacy Compatibility)
 *
 * This file now imports from the refactored network distribution components
 * while maintaining backward compatibility for existing imports.
 */

// Import from refactored component
export { NetworkDistributionPanel } from './NetworkDistributionPanelRefactored';

// Re-export types for backward compatibility
export type { NetworkDistributionPanelProps } from './types/networkDistributionTypes';