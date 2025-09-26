/**
 * Contact Integration Service (Refactored)
 *
 * Main orchestration service for contractor contact discovery and management.
 * This replaces the original 742-line contact-integration.ts while preserving ALL functionality.
 */

import { largeDataCache } from '../../../../services/caching/large-data-cache';
import { lushaApi } from '../../../../services/data-sources/lusha-api';
import type { CompanyContacts } from '../../../../services/data-sources/lusha-api';

import { MockContactProvider } from './providers/mock-contact-provider';
import { ContactTransformer } from './services/contact-transformer';
import { ContactFilterService } from './services/contact-filter-service';
import { CSVExportService } from './services/csv-export-service';

import type {
  ContractorContact,
  ContactSearchFilters,
  ContactStatistics,
  ContactExportOptions,
} from './types/contact-types';

export interface ContactSearchResult {
  contacts: ContractorContact[];
  totalContacts: number;
  departments: string[];
  seniorityLevels: string[];
  hasMore: boolean;
  page: number;
}

export interface ContactExportData {
  fileName: string;
  csvContent: string;
  contactCount: number;
}

class ContactIntegrationService {
  private static readonly CACHE_PREFIX = 'contractor_contacts_';
  private static readonly CACHE_TTL_MINUTES = 60; // 1 hour for contact data
  private static readonly MOCK_CACHE_TTL_MINUTES = 5; // 5 minutes for mock data
  private static readonly MAX_EXPORT_CONTACTS = 1000;

  /**
   * Get contacts for a contractor
   */
  async getContractorContacts(
    uei: string,
    companyName: string,
    additionalInfo?: {
      website?: string;
      linkedinUrl?: string;
      city?: string;
      state?: string;
    }
  ): Promise<ContactSearchResult> {
    const cacheKey = `${ContactIntegrationService.CACHE_PREFIX}${uei}`;

    try {
      // Check cache first
      const cached = largeDataCache.get(cacheKey);
      if (cached) {
        return this.processContactsResponse(cached, {});
      }

      // Fetch from Lusha API
      const lushaResponse = await lushaApi.getContractorContacts(
        uei,
        companyName,
        additionalInfo
      );

      // Cache the response
      largeDataCache.set(
        cacheKey,
        lushaResponse,
        ContactIntegrationService.CACHE_TTL_MINUTES
      );

      return this.processContactsResponse(lushaResponse, {});
    } catch (error) {
      console.warn('Lusha API unavailable, falling back to mock data:', error);

      // Fall back to mock data
      const mockResponse = MockContactProvider.generateMockContacts(uei, companyName);

      // Cache mock data temporarily (shorter TTL)
      largeDataCache.set(
        cacheKey,
        mockResponse,
        ContactIntegrationService.MOCK_CACHE_TTL_MINUTES
      );

      return this.processContactsResponse(mockResponse, {});
    }
  }

  /**
   * Search and filter contacts
   */
  async searchContacts(
    uei: string,
    companyName: string,
    filters: ContactSearchFilters,
    page = 0,
    pageSize = 20
  ): Promise<ContactSearchResult> {
    try {
      const cacheKey = `${ContactIntegrationService.CACHE_PREFIX}${uei}`;
      let lushaResponse = largeDataCache.get(cacheKey);

      // If not cached, fetch fresh data
      if (!lushaResponse) {
        lushaResponse = await lushaApi.getContractorContacts(uei, companyName);
        largeDataCache.set(
          cacheKey,
          lushaResponse,
          ContactIntegrationService.CACHE_TTL_MINUTES
        );
      }

      return this.processContactsResponse(lushaResponse, filters, page, pageSize);
    } catch (error) {
      console.error('Failed to search contractor contacts:', error);

      // Return fallback empty result
      return {
        contacts: [],
        totalContacts: 0,
        departments: [],
        seniorityLevels: [],
        hasMore: false,
        page,
      };
    }
  }

  /**
   * Get available departments for a contractor
   */
  async getAvailableDepartments(uei: string, companyName: string): Promise<string[]> {
    try {
      const result = await this.getContractorContacts(uei, companyName);
      return result.departments;
    } catch (error) {
      console.error('Failed to get departments:', error);
      return [];
    }
  }

  /**
   * Export contacts to CSV
   */
  async exportContactsToCSV(
    uei: string,
    companyName: string,
    filters: ContactSearchFilters = {},
    options: ContactExportOptions = {}
  ): Promise<ContactExportData> {
    try {
      const result = await this.searchContacts(
        uei,
        companyName,
        filters,
        0,
        ContactIntegrationService.MAX_EXPORT_CONTACTS
      );

      return CSVExportService.exportContactsToCSV(
        result.contacts,
        companyName,
        options
      );
    } catch (error) {
      console.error('Failed to export contacts:', error);
      return {
        fileName: 'contacts_export_error.csv',
        csvContent: 'Error generating export',
        contactCount: 0,
      };
    }
  }

  /**
   * Get contact statistics summary
   */
  async getContactStatistics(
    uei: string,
    companyName: string
  ): Promise<ContactStatistics> {
    try {
      const result = await this.getContractorContacts(uei, companyName);
      const filterStats = ContactFilterService.getFilterStatistics(result.contacts);

      return {
        totalContacts: filterStats.totalContacts,
        byDepartment: filterStats.byDepartment,
        bySeniority: filterStats.bySeniority,
        withEmail: filterStats.withEmail,
        withPhone: filterStats.withPhone,
        avgConfidence: filterStats.avgConfidence,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get contact statistics:', error);
      return {
        totalContacts: 0,
        byDepartment: {},
        bySeniority: {},
        withEmail: 0,
        withPhone: 0,
        avgConfidence: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  /**
   * Clear cached contacts for a contractor
   */
  clearContractorCache(uei: string): void {
    const cacheKey = `${ContactIntegrationService.CACHE_PREFIX}${uei}`;
    largeDataCache.delete(cacheKey);
  }

  /**
   * Process Lusha API response into our format with filtering and pagination
   */
  private processContactsResponse(
    lushaResponse: CompanyContacts,
    filters: ContactSearchFilters,
    page = 0,
    pageSize = 20
  ): ContactSearchResult {
    if (!lushaResponse.success || !lushaResponse.contacts) {
      return {
        contacts: [],
        totalContacts: 0,
        departments: [],
        seniorityLevels: [],
        hasMore: false,
        page,
      };
    }

    // Transform Lusha contacts to our format
    const processedContacts = lushaResponse.contacts.map(contact =>
      ContactTransformer.transformLushaContact(contact, lushaResponse.companyName)
    );

    // Sort contacts by seniority priority
    const sortedContacts = ContactTransformer.sortContactsBySeniority(processedContacts);

    // Apply filters and pagination
    const filteredResult = ContactFilterService.searchAndPaginateContacts(
      sortedContacts,
      filters,
      page,
      pageSize
    );

    // Extract available filter options from all contacts (not just filtered ones)
    const departments = ContactTransformer.extractUniqueDepartments(sortedContacts);
    const seniorityLevels = ContactTransformer.extractUniqueSeniorityLevels(sortedContacts);

    return {
      contacts: filteredResult.contacts,
      totalContacts: filteredResult.totalContacts,
      departments,
      seniorityLevels,
      hasMore: filteredResult.hasMore,
      page: filteredResult.page,
    };
  }
}

// Export singleton instance
export const contactIntegrationService = new ContactIntegrationService();

// Legacy export for backward compatibility
export const contractorContactService = contactIntegrationService;