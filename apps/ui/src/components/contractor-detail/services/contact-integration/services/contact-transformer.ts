/**
 * Contact Transformer Service
 *
 * Handles transformation of Lusha API responses to internal contact format.
 * Includes department mapping, seniority classification, and data normalization.
 */

import type { ContractorContact, SeniorityLevel, DepartmentCategory } from '../types/contact-types';

export class ContactTransformer {
  /**
   * Transform Lusha contact format to internal format
   */
  static transformLushaContact(lushaContact: any, companyName: string): ContractorContact {
    const data = lushaContact.data || {};

    return {
      id: data.personId?.toString() || `temp_${Date.now()}_${Math.random()}`,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      fullName: data.fullName || `${data.firstName} ${data.lastName}`.trim(),
      title: data.jobTitle?.title || 'Unknown Title',
      department: this.mapDepartment(data.jobTitle?.departments?.[0] || ''),
      seniority: this.mapSeniority(data.jobTitle?.seniority || ''),
      email: data.emailAddresses?.[0]?.address || undefined,
      phone: data.phoneNumbers?.[0]?.number || undefined,
      linkedinUrl: data.socialLinks?.linkedin || undefined,
      location: {
        city: data.location?.city,
        state: data.location?.state || data.location?.stateCode,
        country: data.location?.country,
      },
      companyName,
      lastUpdated: data.updateDate || new Date().toISOString(),
      confidence: data.confidence || 50,
      isActive: true,
      emailStatus: data.emailAddresses?.[0]?.verified ? 'verified' : 'unverified',
      dataSources: ['lusha'],
    };
  }

  /**
   * Map Lusha department to standard department categories
   */
  static mapDepartment(lushaDepartment: string): DepartmentCategory {
    if (!lushaDepartment) return 'Other';

    const dept = lushaDepartment.toLowerCase();

    if (
      dept.includes('executive') ||
      dept.includes('ceo') ||
      dept.includes('president') ||
      dept.includes('c-level')
    ) {
      return 'Executive';
    }

    if (
      dept.includes('engineering') ||
      dept.includes('technical') ||
      dept.includes('development') ||
      dept.includes('software') ||
      dept.includes('technology')
    ) {
      return 'Engineering';
    }

    if (
      dept.includes('sales') ||
      dept.includes('business development') ||
      dept.includes('revenue')
    ) {
      return 'Sales';
    }

    if (
      dept.includes('marketing') ||
      dept.includes('communications') ||
      dept.includes('brand') ||
      dept.includes('pr')
    ) {
      return 'Marketing';
    }

    if (
      dept.includes('finance') ||
      dept.includes('accounting') ||
      dept.includes('controller') ||
      dept.includes('treasury')
    ) {
      return 'Finance';
    }

    if (
      dept.includes('operations') ||
      dept.includes('production') ||
      dept.includes('manufacturing') ||
      dept.includes('logistics')
    ) {
      return 'Operations';
    }

    if (
      dept.includes('human resources') ||
      dept.includes('hr') ||
      dept.includes('people') ||
      dept.includes('talent')
    ) {
      return 'HR';
    }

    if (
      dept.includes('legal') ||
      dept.includes('compliance') ||
      dept.includes('regulatory') ||
      dept.includes('counsel')
    ) {
      return 'Legal';
    }

    if (
      dept.includes('it') ||
      dept.includes('information technology') ||
      dept.includes('systems') ||
      dept.includes('infrastructure')
    ) {
      return 'IT';
    }

    return 'Other';
  }

  /**
   * Map Lusha seniority to standard seniority levels
   */
  static mapSeniority(lushaSeniority: string): SeniorityLevel {
    if (!lushaSeniority) return 'entry';

    const seniority = lushaSeniority.toLowerCase();

    if (
      seniority.includes('c-level') ||
      seniority.includes('ceo') ||
      seniority.includes('cto') ||
      seniority.includes('cfo') ||
      seniority.includes('coo') ||
      seniority.includes('president') ||
      seniority.includes('founder')
    ) {
      return 'c-level';
    }

    if (
      seniority.includes('vp') ||
      seniority.includes('vice president') ||
      seniority.includes('vice-president')
    ) {
      return 'vp';
    }

    if (
      seniority.includes('director') ||
      seniority.includes('head of')
    ) {
      return 'director';
    }

    if (
      seniority.includes('manager') ||
      seniority.includes('mgr') ||
      seniority.includes('team lead') ||
      seniority.includes('supervisor')
    ) {
      return 'manager';
    }

    if (
      seniority.includes('senior') ||
      seniority.includes('sr') ||
      seniority.includes('principal') ||
      seniority.includes('lead') ||
      seniority.includes('architect')
    ) {
      return 'senior';
    }

    if (
      seniority.includes('junior') ||
      seniority.includes('jr') ||
      seniority.includes('associate') ||
      seniority.includes('coordinator') ||
      seniority.includes('assistant') ||
      seniority.includes('intern')
    ) {
      return 'junior';
    }

    // Default to entry level for unrecognized seniority
    return 'entry';
  }

  /**
   * Sort contacts by seniority priority, then by name
   */
  static sortContactsBySeniority(contacts: ContractorContact[]): ContractorContact[] {
    return [...contacts].sort((a, b) => {
      const seniorityOrder: SeniorityLevel[] = [
        'c-level',
        'vp',
        'director',
        'manager',
        'senior',
        'junior',
        'entry'
      ];

      const aPriority = seniorityOrder.indexOf(a.seniority);
      const bPriority = seniorityOrder.indexOf(b.seniority);

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return a.fullName.localeCompare(b.fullName);
    });
  }

  /**
   * Extract unique departments from contact list
   */
  static extractUniqueDepartments(contacts: ContractorContact[]): DepartmentCategory[] {
    const departments = [...new Set(contacts.map(c => c.department))];
    return departments.sort() as DepartmentCategory[];
  }

  /**
   * Extract unique seniority levels from contact list
   */
  static extractUniqueSeniorityLevels(contacts: ContractorContact[]): SeniorityLevel[] {
    const seniorityLevels = [...new Set(contacts.map(c => c.seniority))];
    const seniorityOrder: SeniorityLevel[] = ['c-level', 'vp', 'director', 'manager', 'senior', 'junior', 'entry'];

    return seniorityLevels.sort((a, b) => {
      return seniorityOrder.indexOf(a) - seniorityOrder.indexOf(b);
    }) as SeniorityLevel[];
  }
}