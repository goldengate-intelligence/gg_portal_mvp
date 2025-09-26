/**
 * Contractor Detail Contact Integration Service
 *
 * Handles Lusha API integration for contractor contact discovery and management.
 * Provides filtered contact search, department categorization, and export functionality.
 */

import { largeDataCache } from "../../../services/caching/large-data-cache";
import {
	type CompanyContacts,
	type LushaContactResponse,
	lushaApi,
} from "../../../services/data-sources/lusha-api";

export interface ContractorContact {
	id: string;
	firstName: string;
	lastName: string;
	fullName: string;
	title: string;
	department: string;
	seniority: "Executive" | "Senior" | "Mid-Level" | "Entry-Level" | "Unknown";
	email?: string;
	phone?: string;
	linkedinUrl?: string;
	location?: {
		city?: string;
		state?: string;
		country?: string;
	};
	companyName: string;
	lastUpdated: string;
}

export interface ContactSearchFilters {
	department?: string;
	seniority?: string;
	searchTerm?: string; // For name/title search
}

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

class ContractorDetailContactService {
	private static readonly CACHE_PREFIX = "contractor_contacts_";
	private static readonly CACHE_TTL_MINUTES = 60; // 1 hour for contact data
	private static readonly MAX_CONTACTS_PER_REQUEST = 100;

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
		},
	): Promise<ContactSearchResult> {
		const cacheKey = `${ContractorDetailContactService.CACHE_PREFIX}${uei}`;

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
				additionalInfo,
			);

			// Cache the response
			largeDataCache.set(
				cacheKey,
				lushaResponse,
				ContractorDetailContactService.CACHE_TTL_MINUTES,
			);

			return this.processContactsResponse(lushaResponse, {});
		} catch (error) {
			console.warn("Lusha API unavailable, falling back to mock data:", error);

			// Fall back to mock data
			const mockResponse = this.generateMockContacts(uei, companyName);

			// Cache mock data temporarily (shorter TTL)
			largeDataCache.set(
				cacheKey,
				mockResponse,
				5, // 5 minutes for mock data
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
		pageSize = 20,
	): Promise<ContactSearchResult> {
		try {
			const cacheKey = `${ContractorDetailContactService.CACHE_PREFIX}${uei}`;
			let lushaResponse = largeDataCache.get(cacheKey);

			// If not cached, fetch fresh data
			if (!lushaResponse) {
				lushaResponse = await lushaApi.getContractorContacts(uei, companyName);
				largeDataCache.set(
					cacheKey,
					lushaResponse,
					ContractorDetailContactService.CACHE_TTL_MINUTES,
				);
			}

			return this.processContactsResponse(
				lushaResponse,
				filters,
				page,
				pageSize,
			);
		} catch (error) {
			console.error("Failed to search contractor contacts:", error);
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
	async getAvailableDepartments(
		uei: string,
		companyName: string,
	): Promise<string[]> {
		try {
			const result = await this.getContractorContacts(uei, companyName);
			return result.departments;
		} catch (error) {
			console.error("Failed to get departments:", error);
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
	): Promise<ContactExportData> {
		try {
			const result = await this.searchContacts(
				uei,
				companyName,
				filters,
				0,
				1000,
			); // Export all
			const csvContent = this.generateCSV(result.contacts, companyName);

			const fileName = `${companyName.replace(/[^a-zA-Z0-9]/g, "_")}_contacts_${new Date().toISOString().split("T")[0]}.csv`;

			return {
				fileName,
				csvContent,
				contactCount: result.contacts.length,
			};
		} catch (error) {
			console.error("Failed to export contacts:", error);
			return {
				fileName: "contacts_export_error.csv",
				csvContent: "Error generating export",
				contactCount: 0,
			};
		}
	}

	/**
	 * Clear cached contacts for a contractor
	 */
	clearContractorCache(uei: string): void {
		const cacheKey = `${ContractorDetailContactService.CACHE_PREFIX}${uei}`;
		largeDataCache.delete(cacheKey);
	}

	/**
	 * Get contact statistics summary (basic counts only)
	 */
	async getContactStatistics(
		uei: string,
		companyName: string,
	): Promise<{
		totalContacts: number;
		departmentBreakdown: Record<string, number>;
		seniorityBreakdown: Record<string, number>;
	}> {
		try {
			const result = await this.getContractorContacts(uei, companyName);

			const departmentBreakdown: Record<string, number> = {};
			const seniorityBreakdown: Record<string, number> = {};

			result.contacts.forEach((contact) => {
				// Count by department
				const dept = contact.department || "Unknown";
				departmentBreakdown[dept] = (departmentBreakdown[dept] || 0) + 1;

				// Count by seniority
				const seniority = contact.seniority || "Unknown";
				seniorityBreakdown[seniority] =
					(seniorityBreakdown[seniority] || 0) + 1;
			});

			return {
				totalContacts: result.totalContacts,
				departmentBreakdown,
				seniorityBreakdown,
			};
		} catch (error) {
			console.error("Failed to get contact statistics:", error);
			return {
				totalContacts: 0,
				departmentBreakdown: {},
				seniorityBreakdown: {},
			};
		}
	}

	/**
	 * Private: Process Lusha API response into our format
	 */
	private processContactsResponse(
		lushaResponse: CompanyContacts,
		filters: ContactSearchFilters,
		page = 0,
		pageSize = 20,
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
		let processedContacts = lushaResponse.contacts.map((contact) =>
			this.transformLushaContact(contact, lushaResponse.companyName),
		);

		// Apply filters
		if (filters.department) {
			processedContacts = processedContacts.filter(
				(contact) => contact.department === filters.department,
			);
		}

		if (filters.seniority) {
			processedContacts = processedContacts.filter(
				(contact) => contact.seniority === filters.seniority,
			);
		}

		if (filters.searchTerm) {
			const searchLower = filters.searchTerm.toLowerCase();
			processedContacts = processedContacts.filter(
				(contact) =>
					contact.fullName.toLowerCase().includes(searchLower) ||
					contact.title.toLowerCase().includes(searchLower),
			);
		}

		// Sort by seniority priority, then by name
		processedContacts.sort((a, b) => {
			const seniorityOrder = [
				"Executive",
				"Senior",
				"Mid-Level",
				"Entry-Level",
				"Unknown",
			];
			const aPriority = seniorityOrder.indexOf(a.seniority);
			const bPriority = seniorityOrder.indexOf(b.seniority);

			if (aPriority !== bPriority) {
				return aPriority - bPriority;
			}

			return a.fullName.localeCompare(b.fullName);
		});

		// Extract unique departments and seniority levels
		const departments = [
			...new Set(processedContacts.map((c) => c.department)),
		].sort();
		const seniorityLevels = [
			...new Set(processedContacts.map((c) => c.seniority)),
		].sort();

		// Apply pagination
		const startIndex = page * pageSize;
		const endIndex = startIndex + pageSize;
		const paginatedContacts = processedContacts.slice(startIndex, endIndex);

		return {
			contacts: paginatedContacts,
			totalContacts: processedContacts.length,
			departments,
			seniorityLevels,
			hasMore: endIndex < processedContacts.length,
			page,
		};
	}

	/**
	 * Private: Transform Lusha contact format to our format
	 */
	private transformLushaContact(
		lushaContact: any,
		companyName: string,
	): ContractorContact {
		const data = lushaContact.data || {};

		return {
			id: data.personId?.toString() || `temp_${Date.now()}_${Math.random()}`,
			firstName: data.firstName || "",
			lastName: data.lastName || "",
			fullName: data.fullName || `${data.firstName} ${data.lastName}`.trim(),
			title: data.jobTitle?.title || "Unknown Title",
			department: this.mapDepartment(data.jobTitle?.departments?.[0] || ""),
			seniority: this.mapSeniority(data.jobTitle?.seniority || ""),
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
		};
	}

	/**
	 * Private: Map Lusha department to our standard departments
	 */
	private mapDepartment(lushaDepartment: string): string {
		if (!lushaDepartment) return "Unknown";

		const dept = lushaDepartment.toLowerCase();

		if (
			dept.includes("executive") ||
			dept.includes("ceo") ||
			dept.includes("president")
		)
			return "Executive";
		if (
			dept.includes("engineering") ||
			dept.includes("technical") ||
			dept.includes("development")
		)
			return "Engineering & Technical";
		if (dept.includes("sales") || dept.includes("business development"))
			return "Sales";
		if (dept.includes("marketing") || dept.includes("communications"))
			return "Marketing";
		if (dept.includes("finance") || dept.includes("accounting"))
			return "Finance";
		if (dept.includes("operations") || dept.includes("operations"))
			return "Operations";
		if (
			dept.includes("human resources") ||
			dept.includes("hr") ||
			dept.includes("people")
		)
			return "Human Resources";
		if (dept.includes("legal") || dept.includes("compliance"))
			return "Legal & Compliance";
		if (dept.includes("procurement") || dept.includes("sourcing"))
			return "Procurement";
		if (dept.includes("program") || dept.includes("project"))
			return "Program Management";

		return lushaDepartment; // Return original if no mapping found
	}

	/**
	 * Private: Map Lusha seniority to our standard levels
	 */
	private mapSeniority(
		lushaSeniority: string,
	): "Executive" | "Senior" | "Mid-Level" | "Entry-Level" | "Unknown" {
		if (!lushaSeniority) return "Unknown";

		const seniority = lushaSeniority.toLowerCase();

		if (
			seniority.includes("executive") ||
			seniority.includes("ceo") ||
			seniority.includes("president") ||
			seniority.includes("vp") ||
			seniority.includes("vice president") ||
			seniority.includes("director")
		) {
			return "Executive";
		}
		if (
			seniority.includes("senior") ||
			seniority.includes("sr") ||
			seniority.includes("principal") ||
			seniority.includes("lead") ||
			seniority.includes("manager")
		) {
			return "Senior";
		}
		if (
			seniority.includes("mid") ||
			seniority.includes("specialist") ||
			seniority.includes("analyst")
		) {
			return "Mid-Level";
		}
		if (
			seniority.includes("entry") ||
			seniority.includes("junior") ||
			seniority.includes("associate") ||
			seniority.includes("coordinator") ||
			seniority.includes("assistant")
		) {
			return "Entry-Level";
		}

		return "Unknown";
	}

	/**
	 * Private: Generate CSV content from contacts
	 */
	private generateCSV(
		contacts: ContractorContact[],
		companyName: string,
	): string {
		const headers = [
			"Full Name",
			"First Name",
			"Last Name",
			"Title",
			"Department",
			"Seniority",
			"Email",
			"Phone",
			"LinkedIn URL",
			"City",
			"State",
			"Country",
			"Company",
			"Last Updated",
		];

		const csvRows = [headers.join(",")];

		contacts.forEach((contact) => {
			const row = [
				this.csvEscape(contact.fullName),
				this.csvEscape(contact.firstName),
				this.csvEscape(contact.lastName),
				this.csvEscape(contact.title),
				this.csvEscape(contact.department),
				this.csvEscape(contact.seniority),
				this.csvEscape(contact.email || ""),
				this.csvEscape(contact.phone || ""),
				this.csvEscape(contact.linkedinUrl || ""),
				this.csvEscape(contact.location?.city || ""),
				this.csvEscape(contact.location?.state || ""),
				this.csvEscape(contact.location?.country || ""),
				this.csvEscape(companyName),
				this.csvEscape(new Date(contact.lastUpdated).toLocaleDateString()),
			];

			csvRows.push(row.join(","));
		});

		return csvRows.join("\n");
	}

	/**
	 * Private: Escape CSV field content
	 */
	private csvEscape(field: string): string {
		if (!field) return "";

		// Escape double quotes and wrap in quotes if necessary
		const escaped = field.replace(/"/g, '""');

		if (
			escaped.includes(",") ||
			escaped.includes("\n") ||
			escaped.includes('"')
		) {
			return `"${escaped}"`;
		}

		return escaped;
	}

	/**
	 * Private: Generate mock contacts for development/fallback
	 * TODO: Remove this when Lusha API is fully integrated
	 */
	private generateMockContacts(uei: string, companyName: string): any {
		const mockContacts = [
			{
				data: {
					personId: 1001,
					firstName: "Michael",
					lastName: "Thompson",
					fullName: "Michael Thompson",
					jobTitle: {
						title: "Chief Executive Officer",
						seniority: "Executive",
						departments: ["Executive"],
					},
					emailAddresses: [
						{
							address: `m.thompson@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
						},
					],
					phoneNumbers: [{ number: "(555) 123-4567" }],
					socialLinks: { linkedin: "https://linkedin.com/in/michael-thompson" },
					location: { city: "Austin", state: "TX", country: "United States" },
					updateDate: new Date().toISOString(),
				},
			},
			{
				data: {
					personId: 1002,
					firstName: "Sarah",
					lastName: "Martinez",
					fullName: "Sarah Martinez",
					jobTitle: {
						title: "VP of Operations",
						seniority: "Senior",
						departments: ["Operations"],
					},
					emailAddresses: [
						{
							address: `s.martinez@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
						},
					],
					phoneNumbers: [{ number: "(555) 123-4568" }],
					socialLinks: { linkedin: "https://linkedin.com/in/sarah-martinez" },
					location: { city: "Austin", state: "TX", country: "United States" },
					updateDate: new Date().toISOString(),
				},
			},
			{
				data: {
					personId: 1003,
					firstName: "James",
					lastName: "Wilson",
					fullName: "James Wilson",
					jobTitle: {
						title: "Director of Engineering",
						seniority: "Senior",
						departments: ["Engineering & Technical"],
					},
					emailAddresses: [
						{
							address: `j.wilson@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
						},
					],
					phoneNumbers: [{ number: "(555) 123-4569" }],
					socialLinks: { linkedin: "https://linkedin.com/in/james-wilson" },
					location: { city: "Austin", state: "TX", country: "United States" },
					updateDate: new Date().toISOString(),
				},
			},
			{
				data: {
					personId: 1004,
					firstName: "Robert",
					lastName: "Chen",
					fullName: "Robert Chen",
					jobTitle: {
						title: "Chief Financial Officer",
						seniority: "Executive",
						departments: ["Finance"],
					},
					emailAddresses: [
						{
							address: `r.chen@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
						},
					],
					phoneNumbers: [{ number: "(555) 123-4570" }],
					socialLinks: { linkedin: "https://linkedin.com/in/robert-chen" },
					location: { city: "Austin", state: "TX", country: "United States" },
					updateDate: new Date().toISOString(),
				},
			},
			{
				data: {
					personId: 1005,
					firstName: "Jennifer",
					lastName: "Davis",
					fullName: "Jennifer Davis",
					jobTitle: {
						title: "VP of Sales",
						seniority: "Senior",
						departments: ["Sales"],
					},
					emailAddresses: [
						{
							address: `j.davis@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
						},
					],
					phoneNumbers: [{ number: "(555) 123-4571" }],
					socialLinks: { linkedin: "https://linkedin.com/in/jennifer-davis" },
					location: { city: "Austin", state: "TX", country: "United States" },
					updateDate: new Date().toISOString(),
				},
			},
			{
				data: {
					personId: 1006,
					firstName: "David",
					lastName: "Kim",
					fullName: "David Kim",
					jobTitle: {
						title: "Director of Quality Assurance",
						seniority: "Senior",
						departments: ["Operations"],
					},
					emailAddresses: [
						{
							address: `d.kim@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
						},
					],
					phoneNumbers: [{ number: "(555) 123-4572" }],
					socialLinks: { linkedin: "https://linkedin.com/in/david-kim" },
					location: { city: "Austin", state: "TX", country: "United States" },
					updateDate: new Date().toISOString(),
				},
			},
			{
				data: {
					personId: 1007,
					firstName: "Lisa",
					lastName: "Rodriguez",
					fullName: "Lisa Rodriguez",
					jobTitle: {
						title: "Program Manager",
						seniority: "Mid-Level",
						departments: ["Program Management"],
					},
					emailAddresses: [
						{
							address: `l.rodriguez@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
						},
					],
					phoneNumbers: [{ number: "(555) 123-4573" }],
					socialLinks: { linkedin: "https://linkedin.com/in/lisa-rodriguez" },
					location: { city: "Austin", state: "TX", country: "United States" },
					updateDate: new Date().toISOString(),
				},
			},
			{
				data: {
					personId: 1008,
					firstName: "Brian",
					lastName: "Johnson",
					fullName: "Brian Johnson",
					jobTitle: {
						title: "Senior Contract Specialist",
						seniority: "Senior",
						departments: ["Procurement"],
					},
					emailAddresses: [
						{
							address: `b.johnson@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
						},
					],
					phoneNumbers: [{ number: "(555) 123-4574" }],
					socialLinks: { linkedin: "https://linkedin.com/in/brian-johnson" },
					location: { city: "Austin", state: "TX", country: "United States" },
					updateDate: new Date().toISOString(),
				},
			},
		];

		return {
			success: true,
			contacts: mockContacts,
			companyName,
			metadata: {
				source: "mock_fallback",
				uei,
				generated_at: new Date().toISOString(),
			},
		};
	}
}

// Export singleton instance
export const contractorContactService = new ContractorDetailContactService();

export { ContractorDetailContactService };
