/**
 * Lusha API Service
 *
 * Handles integration with Lusha API for contractor contact data.
 * Powers the contacts tab in contractor-detail feature.
 */

export interface LushaConfig {
	apiKey: string;
	baseUrl: string;
	timeout: number;
}

export interface ContactSearchRequest {
	companyName: string;
	domain?: string;
	website?: string;
	linkedinUrl?: string;
	location?: {
		city?: string;
		state?: string;
		country?: string;
	};
}

export interface ContactPerson {
	id: string;
	firstName: string;
	lastName: string;
	fullName: string;
	title: string;
	department: string;
	seniority:
		| "entry"
		| "junior"
		| "senior"
		| "manager"
		| "director"
		| "vp"
		| "c-level";
	email: string;
	phone?: string;
	linkedinUrl?: string;
	lastUpdated: string;
	confidence: number; // 0-1 confidence in data accuracy
}

export interface CompanyContacts {
	companyName: string;
	domain: string;
	employeeCount?: number;
	industry?: string;
	contacts: ContactPerson[];
	lastRefreshed: string;
	totalFound: number;
	searchQuery: ContactSearchRequest;
}

export interface DepartmentFilter {
	sales: boolean;
	marketing: boolean;
	engineering: boolean;
	operations: boolean;
	finance: boolean;
	hr: boolean;
	legal: boolean;
	executive: boolean;
}

export interface SeniorityFilter {
	"c-level": boolean;
	vp: boolean;
	director: boolean;
	manager: boolean;
	senior: boolean;
	junior: boolean;
	entry: boolean;
}

class LushaApiService {
	private config: LushaConfig;
	private cache = new Map<
		string,
		{ data: CompanyContacts; timestamp: number }
	>();
	private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour cache

	constructor(config: LushaConfig) {
		this.config = config;
	}

	/**
	 * Search for company contacts
	 */
	async searchCompanyContacts(
		request: ContactSearchRequest,
	): Promise<CompanyContacts> {
		const cacheKey = this.generateCacheKey(request);
		const cached = this.getFromCache(cacheKey);
		if (cached) return cached;

		try {
			const response = await fetch(`${this.config.baseUrl}/company/contacts`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.config.apiKey}`,
				},
				body: JSON.stringify(request),
				signal: AbortSignal.timeout(this.config.timeout),
			});

			if (!response.ok) {
				throw new Error(
					`Lusha API error: ${response.status} ${response.statusText}`,
				);
			}

			const data = await response.json();
			const result = this.transformContactsResponse(data, request);

			this.setCache(cacheKey, result);
			return result;
		} catch (error) {
			console.error("Lusha API error:", error);

			// Return empty result on error
			return {
				companyName: request.companyName,
				domain: request.domain || "",
				contacts: [],
				lastRefreshed: new Date().toISOString(),
				totalFound: 0,
				searchQuery: request,
			};
		}
	}

	/**
	 * Get contacts for contractor (main entry point for contractor-detail)
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
	): Promise<CompanyContacts> {
		const searchRequest: ContactSearchRequest = {
			companyName,
			domain: this.extractDomainFromWebsite(additionalInfo?.website),
			website: additionalInfo?.website,
			linkedinUrl: additionalInfo?.linkedinUrl,
			location:
				additionalInfo?.city || additionalInfo?.state
					? {
							city: additionalInfo.city,
							state: additionalInfo.state,
							country: "USA",
						}
					: undefined,
		};

		return this.searchCompanyContacts(searchRequest);
	}

	/**
	 * Filter contacts by department
	 */
	filterContactsByDepartment(
		contacts: ContactPerson[],
		filters: Partial<DepartmentFilter>,
	): ContactPerson[] {
		if (!Object.values(filters).some(Boolean)) return contacts;

		return contacts.filter((contact) => {
			const dept = contact.department.toLowerCase();

			if (
				filters.sales &&
				this.isDepartment(dept, ["sales", "business development", "account"])
			)
				return true;
			if (
				filters.marketing &&
				this.isDepartment(dept, ["marketing", "growth", "communications"])
			)
				return true;
			if (
				filters.engineering &&
				this.isDepartment(dept, [
					"engineering",
					"development",
					"technical",
					"r&d",
				])
			)
				return true;
			if (
				filters.operations &&
				this.isDepartment(dept, [
					"operations",
					"manufacturing",
					"production",
					"supply",
				])
			)
				return true;
			if (
				filters.finance &&
				this.isDepartment(dept, ["finance", "accounting", "controller"])
			)
				return true;
			if (
				filters.hr &&
				this.isDepartment(dept, ["human resources", "hr", "people", "talent"])
			)
				return true;
			if (
				filters.legal &&
				this.isDepartment(dept, ["legal", "compliance", "regulatory"])
			)
				return true;
			if (
				filters.executive &&
				this.isDepartment(dept, ["executive", "leadership"])
			)
				return true;

			return false;
		});
	}

	/**
	 * Filter contacts by seniority level
	 */
	filterContactsBySeniority(
		contacts: ContactPerson[],
		filters: Partial<SeniorityFilter>,
	): ContactPerson[] {
		if (!Object.values(filters).some(Boolean)) return contacts;

		return contacts.filter((contact) => {
			return filters[contact.seniority] === true;
		});
	}

	/**
	 * Get contact statistics
	 */
	getContactStatistics(contacts: ContactPerson[]): {
		totalContacts: number;
		byDepartment: Record<string, number>;
		bySeniority: Record<string, number>;
		withEmail: number;
		withPhone: number;
		avgConfidence: number;
	} {
		const byDepartment: Record<string, number> = {};
		const bySeniority: Record<string, number> = {};
		let withEmail = 0;
		let withPhone = 0;
		let totalConfidence = 0;

		contacts.forEach((contact) => {
			// Department stats
			const normalizedDept = this.normalizeDepartment(contact.department);
			byDepartment[normalizedDept] = (byDepartment[normalizedDept] || 0) + 1;

			// Seniority stats
			bySeniority[contact.seniority] =
				(bySeniority[contact.seniority] || 0) + 1;

			// Contact method stats
			if (contact.email) withEmail++;
			if (contact.phone) withPhone++;

			totalConfidence += contact.confidence;
		});

		return {
			totalContacts: contacts.length,
			byDepartment,
			bySeniority,
			withEmail,
			withPhone,
			avgConfidence:
				contacts.length > 0 ? totalConfidence / contacts.length : 0,
		};
	}

	/**
	 * Export contacts to CSV format
	 */
	exportContactsToCSV(contacts: ContactPerson[]): string {
		const headers = [
			"Name",
			"Title",
			"Department",
			"Seniority",
			"Email",
			"Phone",
			"LinkedIn",
			"Confidence",
		];
		const rows = contacts.map((contact) => [
			contact.fullName,
			contact.title,
			contact.department,
			contact.seniority,
			contact.email,
			contact.phone || "",
			contact.linkedinUrl || "",
			contact.confidence.toFixed(2),
		]);

		return [headers, ...rows]
			.map((row) => row.map((cell) => `"${cell}"`).join(","))
			.join("\n");
	}

	/**
	 * Clear contact cache
	 */
	clearCache(companyName?: string): void {
		if (companyName) {
			const keys = Array.from(this.cache.keys()).filter((key) =>
				key.includes(companyName),
			);
			keys.forEach((key) => this.cache.delete(key));
		} else {
			this.cache.clear();
		}
	}

	/**
	 * Get API usage statistics
	 */
	getApiUsage(): {
		cacheSize: number;
		cacheHitRate: number; // Would need to track this
	} {
		return {
			cacheSize: this.cache.size,
			cacheHitRate: 0, // Placeholder - would implement tracking
		};
	}

	/**
	 * Private: Transform Lusha API response
	 */
	private transformContactsResponse(
		data: any,
		request: ContactSearchRequest,
	): CompanyContacts {
		const contacts: ContactPerson[] = (data.contacts || []).map(
			(contact: any) => ({
				id:
					contact.id ||
					`${contact.firstName}_${contact.lastName}_${Date.now()}`,
				firstName: contact.firstName || "",
				lastName: contact.lastName || "",
				fullName: `${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
				title: contact.title || "",
				department: contact.department || "Unknown",
				seniority: this.determineSeniority(contact.title),
				email: contact.email || "",
				phone: contact.phone,
				linkedinUrl: contact.linkedinUrl,
				lastUpdated: new Date().toISOString(),
				confidence: Number.parseFloat(contact.confidence || 0.8),
			}),
		);

		return {
			companyName: request.companyName,
			domain: data.company?.domain || request.domain || "",
			employeeCount: data.company?.employeeCount,
			industry: data.company?.industry,
			contacts: contacts.sort((a, b) => b.confidence - a.confidence),
			lastRefreshed: new Date().toISOString(),
			totalFound: contacts.length,
			searchQuery: request,
		};
	}

	/**
	 * Private: Determine seniority from title
	 */
	private determineSeniority(title: string): ContactPerson["seniority"] {
		const normalizedTitle = title.toLowerCase();

		if (
			this.includesAny(normalizedTitle, [
				"ceo",
				"cfo",
				"cto",
				"coo",
				"chief",
				"president",
				"founder",
			])
		)
			return "c-level";
		if (this.includesAny(normalizedTitle, ["vp", "vice president"]))
			return "vp";
		if (this.includesAny(normalizedTitle, ["director", "head of"]))
			return "director";
		if (this.includesAny(normalizedTitle, ["manager", "lead", "supervisor"]))
			return "manager";
		if (this.includesAny(normalizedTitle, ["senior", "sr.", "principal"]))
			return "senior";
		if (this.includesAny(normalizedTitle, ["junior", "jr.", "associate"]))
			return "junior";

		return "entry";
	}

	/**
	 * Private: Check if department matches keywords
	 */
	private isDepartment(dept: string, keywords: string[]): boolean {
		return keywords.some((keyword) => dept.includes(keyword));
	}

	/**
	 * Private: Normalize department name
	 */
	private normalizeDepartment(dept: string): string {
		const normalized = dept.toLowerCase();

		if (this.isDepartment(normalized, ["sales", "business development"]))
			return "Sales";
		if (this.isDepartment(normalized, ["marketing", "growth"]))
			return "Marketing";
		if (
			this.isDepartment(normalized, ["engineering", "development", "technical"])
		)
			return "Engineering";
		if (this.isDepartment(normalized, ["operations", "manufacturing"]))
			return "Operations";
		if (this.isDepartment(normalized, ["finance", "accounting"]))
			return "Finance";
		if (this.isDepartment(normalized, ["human resources", "hr"])) return "HR";
		if (this.isDepartment(normalized, ["legal", "compliance"])) return "Legal";
		if (this.isDepartment(normalized, ["executive", "leadership"]))
			return "Executive";

		return "Other";
	}

	/**
	 * Private: Extract domain from website URL
	 */
	private extractDomainFromWebsite(website?: string): string | undefined {
		if (!website) return undefined;

		try {
			const url = new URL(
				website.startsWith("http") ? website : `https://${website}`,
			);
			return url.hostname.replace("www.", "");
		} catch {
			return undefined;
		}
	}

	/**
	 * Private: Check if string includes any of the keywords
	 */
	private includesAny(text: string, keywords: string[]): boolean {
		return keywords.some((keyword) => text.includes(keyword));
	}

	/**
	 * Private: Generate cache key
	 */
	private generateCacheKey(request: ContactSearchRequest): string {
		return `contacts_${request.companyName}_${request.domain || ""}_${JSON.stringify(request.location || {})}`;
	}

	/**
	 * Private: Get from cache
	 */
	private getFromCache(key: string): CompanyContacts | null {
		const cached = this.cache.get(key);
		if (!cached) return null;

		const now = Date.now();
		if (now - cached.timestamp > this.CACHE_TTL) {
			this.cache.delete(key);
			return null;
		}

		return cached.data;
	}

	/**
	 * Private: Set cache
	 */
	private setCache(key: string, data: CompanyContacts): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
		});
	}
}

// Export singleton instance
export const lushaApi = new LushaApiService({
	apiKey: import.meta.env.VITE_LUSHA_API_KEY || "",
	baseUrl: import.meta.env.VITE_LUSHA_API_URL || "https://api.lusha.com/v2",
	timeout: 15000, // 15 second timeout
});

export { LushaApiService };
