/**
 * CSV Export Service
 *
 * Handles CSV generation and export functionality for contact data.
 * Provides proper CSV escaping and formatting.
 */

import type { ContractorContact, ContactExportOptions } from '../types/contact-types';

export interface ContactExportData {
  fileName: string;
  csvContent: string;
  contactCount: number;
}

export class CSVExportService {
  /**
   * Generate CSV export data from contacts
   */
  static exportContactsToCSV(
    contacts: ContractorContact[],
    companyName: string,
    options: ContactExportOptions = {}
  ): ContactExportData {
    try {
      const csvContent = this.generateCSV(contacts, companyName, options);
      const fileName = this.generateFileName(companyName);

      return {
        fileName,
        csvContent,
        contactCount: contacts.length,
      };
    } catch (error) {
      console.error('Failed to generate CSV export:', error);
      return {
        fileName: 'contacts_export_error.csv',
        csvContent: 'Error generating export',
        contactCount: 0,
      };
    }
  }

  /**
   * Generate CSV content from contacts
   */
  private static generateCSV(
    contacts: ContractorContact[],
    companyName: string,
    options: ContactExportOptions
  ): string {
    const {
      includeHeaders = true,
      dateFormat = 'US',
      fieldDelimiter = ',',
      textDelimiter = '"'
    } = options;

    const headers = [
      'Full Name',
      'First Name',
      'Last Name',
      'Title',
      'Department',
      'Seniority',
      'Email',
      'Phone',
      'LinkedIn URL',
      'City',
      'State',
      'Country',
      'Company',
      'Last Updated',
    ];

    const csvRows: string[] = [];

    // Add headers if requested
    if (includeHeaders) {
      csvRows.push(headers.join(fieldDelimiter));
    }

    // Add data rows
    contacts.forEach((contact) => {
      const row = [
        this.csvEscape(contact.fullName, textDelimiter),
        this.csvEscape(contact.firstName, textDelimiter),
        this.csvEscape(contact.lastName, textDelimiter),
        this.csvEscape(contact.title, textDelimiter),
        this.csvEscape(contact.department, textDelimiter),
        this.csvEscape(contact.seniority, textDelimiter),
        this.csvEscape(contact.email || '', textDelimiter),
        this.csvEscape(contact.phone || '', textDelimiter),
        this.csvEscape(contact.linkedinUrl || '', textDelimiter),
        this.csvEscape(contact.location?.city || '', textDelimiter),
        this.csvEscape(contact.location?.state || '', textDelimiter),
        this.csvEscape(contact.location?.country || '', textDelimiter),
        this.csvEscape(companyName, textDelimiter),
        this.csvEscape(this.formatDate(contact.lastUpdated, dateFormat), textDelimiter),
      ];

      csvRows.push(row.join(fieldDelimiter));
    });

    return csvRows.join('\n');
  }

  /**
   * Generate standardized filename for CSV export
   */
  private static generateFileName(companyName: string): string {
    const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStamp = new Date().toISOString().split('T')[0];
    return `${sanitizedCompanyName}_contacts_${dateStamp}.csv`;
  }

  /**
   * Format date according to specified format
   */
  private static formatDate(dateString: string, format: 'ISO' | 'US' | 'EU'): string {
    const date = new Date(dateString);

    switch (format) {
      case 'ISO':
        return date.toISOString().split('T')[0];
      case 'EU':
        return date.toLocaleDateString('en-GB');
      case 'US':
      default:
        return date.toLocaleDateString('en-US');
    }
  }

  /**
   * Escape CSV field content with proper quoting and delimiter handling
   */
  private static csvEscape(field: string, textDelimiter: string = '"'): string {
    if (!field) return '';

    // Escape text delimiter by doubling it
    const escaped = field.replace(new RegExp(textDelimiter, 'g'), textDelimiter + textDelimiter);

    // Wrap in text delimiters if field contains special characters
    if (
      escaped.includes(',') ||
      escaped.includes(';') ||
      escaped.includes('\t') ||
      escaped.includes('\n') ||
      escaped.includes('\r') ||
      escaped.includes(textDelimiter)
    ) {
      return `${textDelimiter}${escaped}${textDelimiter}`;
    }

    return escaped;
  }
}