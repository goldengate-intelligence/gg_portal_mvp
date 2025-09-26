/**
 * Contact Filter Service
 *
 * Handles filtering and searching functionality for contact data.
 * Provides pagination, search, and filter operations.
 */

import type { ContractorContact, ContactSearchFilters } from '../types/contact-types';

export interface FilteredContactResult {
  contacts: ContractorContact[];
  totalContacts: number;
  hasMore: boolean;
  page: number;
}

export class ContactFilterService {
  /**
   * Apply search filters to contact list
   */
  static filterContacts(
    contacts: ContractorContact[],
    filters: ContactSearchFilters
  ): ContractorContact[] {
    let filteredContacts = [...contacts];

    // Filter by department
    if (filters.department && filters.department.length > 0) {
      filteredContacts = filteredContacts.filter(contact =>
        filters.department!.includes(contact.department)
      );
    }

    // Filter by seniority
    if (filters.seniority && filters.seniority.length > 0) {
      filteredContacts = filteredContacts.filter(contact =>
        filters.seniority!.includes(contact.seniority)
      );
    }

    // Filter by search term (name/title)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredContacts = filteredContacts.filter(contact =>
        contact.fullName.toLowerCase().includes(searchLower) ||
        contact.title.toLowerCase().includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by minimum confidence
    if (filters.minConfidence !== undefined) {
      filteredContacts = filteredContacts.filter(contact =>
        contact.confidence >= filters.minConfidence!
      );
    }

    // Filter by active status
    if (filters.isActive !== undefined) {
      filteredContacts = filteredContacts.filter(contact =>
        contact.isActive === filters.isActive
      );
    }

    return filteredContacts;
  }

  /**
   * Apply pagination to filtered results
   */
  static paginateContacts(
    contacts: ContractorContact[],
    page: number = 0,
    pageSize: number = 20
  ): FilteredContactResult {
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedContacts = contacts.slice(startIndex, endIndex);

    return {
      contacts: paginatedContacts,
      totalContacts: contacts.length,
      hasMore: endIndex < contacts.length,
      page,
    };
  }

  /**
   * Combine filtering and pagination
   */
  static searchAndPaginateContacts(
    contacts: ContractorContact[],
    filters: ContactSearchFilters,
    page: number = 0,
    pageSize: number = 20
  ): FilteredContactResult {
    const filteredContacts = this.filterContacts(contacts, filters);
    return this.paginateContacts(filteredContacts, page, pageSize);
  }

  /**
   * Advanced search with multiple criteria
   */
  static advancedSearch(
    contacts: ContractorContact[],
    criteria: {
      name?: string;
      title?: string;
      department?: string[];
      seniority?: string[];
      hasEmail?: boolean;
      hasPhone?: boolean;
      location?: {
        city?: string;
        state?: string;
        country?: string;
      };
    }
  ): ContractorContact[] {
    return contacts.filter(contact => {
      // Name search
      if (criteria.name) {
        const nameMatch = contact.fullName.toLowerCase().includes(criteria.name.toLowerCase());
        if (!nameMatch) return false;
      }

      // Title search
      if (criteria.title) {
        const titleMatch = contact.title.toLowerCase().includes(criteria.title.toLowerCase());
        if (!titleMatch) return false;
      }

      // Department filter
      if (criteria.department && criteria.department.length > 0) {
        if (!criteria.department.includes(contact.department)) return false;
      }

      // Seniority filter
      if (criteria.seniority && criteria.seniority.length > 0) {
        if (!criteria.seniority.includes(contact.seniority)) return false;
      }

      // Email requirement
      if (criteria.hasEmail !== undefined) {
        const hasEmail = !!contact.email;
        if (criteria.hasEmail !== hasEmail) return false;
      }

      // Phone requirement
      if (criteria.hasPhone !== undefined) {
        const hasPhone = !!contact.phone;
        if (criteria.hasPhone !== hasPhone) return false;
      }

      // Location filters
      if (criteria.location) {
        if (criteria.location.city && contact.location?.city !== criteria.location.city) {
          return false;
        }
        if (criteria.location.state && contact.location?.state !== criteria.location.state) {
          return false;
        }
        if (criteria.location.country && contact.location?.country !== criteria.location.country) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get filter statistics for current dataset
   */
  static getFilterStatistics(contacts: ContractorContact[]) {
    const stats = {
      totalContacts: contacts.length,
      byDepartment: {} as Record<string, number>,
      bySeniority: {} as Record<string, number>,
      withEmail: 0,
      withPhone: 0,
      withLinkedIn: 0,
      byLocation: {
        cities: {} as Record<string, number>,
        states: {} as Record<string, number>,
        countries: {} as Record<string, number>,
      },
      avgConfidence: 0,
    };

    let totalConfidence = 0;

    contacts.forEach(contact => {
      // Department counts
      const dept = contact.department || 'Unknown';
      stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;

      // Seniority counts
      const seniority = contact.seniority || 'Unknown';
      stats.bySeniority[seniority] = (stats.bySeniority[seniority] || 0) + 1;

      // Contact method counts
      if (contact.email) stats.withEmail++;
      if (contact.phone) stats.withPhone++;
      if (contact.linkedinUrl) stats.withLinkedIn++;

      // Location counts
      if (contact.location?.city) {
        stats.byLocation.cities[contact.location.city] =
          (stats.byLocation.cities[contact.location.city] || 0) + 1;
      }
      if (contact.location?.state) {
        stats.byLocation.states[contact.location.state] =
          (stats.byLocation.states[contact.location.state] || 0) + 1;
      }
      if (contact.location?.country) {
        stats.byLocation.countries[contact.location.country] =
          (stats.byLocation.countries[contact.location.country] || 0) + 1;
      }

      // Confidence average
      totalConfidence += contact.confidence;
    });

    stats.avgConfidence = contacts.length > 0 ? totalConfidence / contacts.length : 0;

    return stats;
  }
}