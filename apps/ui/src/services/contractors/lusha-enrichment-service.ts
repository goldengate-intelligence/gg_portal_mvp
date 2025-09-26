/**
 * Lusha Company Enrichment Service
 *
 * Enriches contractor data with Lusha API including:
 * - Company websites
 * - Contact information
 * - Company details (employee count, industry, etc.)
 * - Social media profiles
 */

import { largeDataCache } from '../caching/large-data-cache';

export interface LushaCompanyData {
	name?: string;
	website?: string;
	domain?: string;
	phone?: string;
	industry?: string;
	employeeRange?: string;
	employeeCount?: number;
	description?: string;
	location?: {
		country?: string;
		state?: string;
		city?: string;
		address?: string;
	};
	socialMedia?: {
		linkedin?: string;
		twitter?: string;
		facebook?: string;
	};
	founded?: number;
	revenue?: string;
	technologies?: string[];
}

export interface LushaEnrichmentResponse {
	companyData: LushaCompanyData | null;
	source: 'api' | 'cache' | 'fallback';
	quality: 'high' | 'medium' | 'low';
	lastUpdated?: string;
	error?: string;
}

class LushaEnrichmentService {
	private cache = largeDataCache;
	private apiKey: string | null;
	private baseUrl = 'https://api.lusha.com/company';

	constructor() {
		this.apiKey = import.meta.env.VITE_LUSHA_API_KEY || null;
		if (!this.apiKey) {
			console.warn('Lusha API key not found. Service will return fallback data.');
		}
	}

	/**
	 * Enrich company data by company name
	 */
	async enrichCompanyByName(companyName: string): Promise<LushaEnrichmentResponse> {
		const cacheKey = `lusha-company:${companyName.toLowerCase()}`;
		const cached = this.cache.get<LushaEnrichmentResponse>(cacheKey);

		if (cached) {
			return { ...cached, source: 'cache' };
		}

		if (!this.apiKey) {
			return this.getFallbackResponse(companyName);
		}

		try {
			const response = await fetch(`${this.baseUrl}?company=${encodeURIComponent(companyName)}`, {
				headers: {
					'api_key': this.apiKey,
					'Content-Type': 'application/json',
				},
				signal: AbortSignal.timeout(10000), // 10 second timeout
			});

			if (!response.ok) {
				throw new Error(`Lusha API error: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			const enrichmentData = this.transformLushaResponse(data);

			// Cache for 24 hours
			this.cache.set(cacheKey, enrichmentData, 60 * 24);

			return enrichmentData;
		} catch (error) {
			console.warn(`Lusha enrichment failed for "${companyName}":`, error);
			return this.getFallbackResponse(companyName, error.message);
		}
	}

	/**
	 * Enrich company data by domain
	 */
	async enrichCompanyByDomain(domain: string): Promise<LushaEnrichmentResponse> {
		const cacheKey = `lusha-domain:${domain.toLowerCase()}`;
		const cached = this.cache.get<LushaEnrichmentResponse>(cacheKey);

		if (cached) {
			return { ...cached, source: 'cache' };
		}

		if (!this.apiKey) {
			return this.getFallbackResponse(domain);
		}

		try {
			const response = await fetch(`${this.baseUrl}?domain=${encodeURIComponent(domain)}`, {
				headers: {
					'api_key': this.apiKey,
					'Content-Type': 'application/json',
				},
				signal: AbortSignal.timeout(10000),
			});

			if (!response.ok) {
				throw new Error(`Lusha API error: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			const enrichmentData = this.transformLushaResponse(data);

			// Cache for 24 hours
			this.cache.set(cacheKey, enrichmentData, 60 * 24);

			return enrichmentData;
		} catch (error) {
			console.warn(`Lusha domain enrichment failed for "${domain}":`, error);
			return this.getFallbackResponse(domain, error.message);
		}
	}

	/**
	 * Enrich multiple companies in batch
	 */
	async enrichCompaniesBatch(companies: string[]): Promise<Record<string, LushaEnrichmentResponse>> {
		const results: Record<string, LushaEnrichmentResponse> = {};

		// Process in smaller batches to avoid rate limiting
		const batchSize = 5;
		for (let i = 0; i < companies.length; i += batchSize) {
			const batch = companies.slice(i, i + batchSize);

			const batchPromises = batch.map(async (company) => {
				const result = await this.enrichCompanyByName(company);
				return { company, result };
			});

			const batchResults = await Promise.all(batchPromises);
			batchResults.forEach(({ company, result }) => {
				results[company] = result;
			});

			// Add delay between batches to respect rate limits
			if (i + batchSize < companies.length) {
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
		}

		return results;
	}

	/**
	 * Get website from company data (primary use case for contractor detail)
	 */
	async getCompanyWebsite(companyName: string): Promise<string | null> {
		const enrichment = await this.enrichCompanyByName(companyName);
		return enrichment.companyData?.website || null;
	}

	/**
	 * Transform Lusha API response to our format
	 */
	private transformLushaResponse(lushaData: any): LushaEnrichmentResponse {
		if (!lushaData || !lushaData.data) {
			return {
				companyData: null,
				source: 'api',
				quality: 'low',
				error: 'No data returned from Lusha API'
			};
		}

		const company = lushaData.data;

		const companyData: LushaCompanyData = {
			name: company.name,
			website: this.normalizeWebsite(company.website || company.domain),
			domain: company.domain,
			phone: company.phone,
			industry: company.industry,
			employeeRange: company.employeeRange,
			employeeCount: this.parseEmployeeCount(company.employeeRange),
			description: company.description,
			location: {
				country: company.country,
				state: company.state,
				city: company.city,
				address: company.address,
			},
			socialMedia: {
				linkedin: company.linkedinUrl,
				twitter: company.twitterUrl,
				facebook: company.facebookUrl,
			},
			founded: company.foundedYear,
			revenue: company.revenue,
			technologies: company.technologies || [],
		};

		return {
			companyData,
			source: 'api',
			quality: this.assessDataQuality(companyData),
			lastUpdated: new Date().toISOString(),
		};
	}

	/**
	 * Get fallback response when API is unavailable
	 */
	private getFallbackResponse(identifier: string, error?: string): LushaEnrichmentResponse {
		// For known contractors, provide some fallback data
		const knownWebsites: Record<string, string> = {
			'raytheon technologies': 'rtx.com',
			'raytheon': 'rtx.com',
			'lockheed martin': 'lockheedmartin.com',
			'boeing': 'boeing.com',
			'northrop grumman': 'northropgrumman.com',
			'general dynamics': 'gd.com',
			'bae systems': 'baesystems.com',
			'trio fabrication': 'triofabrication.com',
			'microsoft': 'microsoft.com',
			'ibm': 'ibm.com',
			'amazon': 'amazon.com',
			'google': 'google.com',
		};

		const lowerIdentifier = identifier.toLowerCase();
		const website = knownWebsites[lowerIdentifier];

		if (website) {
			return {
				companyData: {
					name: identifier,
					website,
				},
				source: 'fallback',
				quality: 'medium',
				error,
			};
		}

		return {
			companyData: null,
			source: 'fallback',
			quality: 'low',
			error: error || 'No fallback data available',
		};
	}

	/**
	 * Normalize website URLs
	 */
	private normalizeWebsite(website?: string): string | undefined {
		if (!website) return undefined;

		// Remove protocol if present
		let normalized = website.replace(/^https?:\/\//, '');

		// Remove www if present
		normalized = normalized.replace(/^www\./, '');

		// Remove trailing slash
		normalized = normalized.replace(/\/$/, '');

		return normalized;
	}

	/**
	 * Parse employee count from range
	 */
	private parseEmployeeCount(employeeRange?: string): number | undefined {
		if (!employeeRange) return undefined;

		const ranges: Record<string, number> = {
			'1-10': 5,
			'11-50': 30,
			'51-200': 125,
			'201-500': 350,
			'501-1000': 750,
			'1001-5000': 3000,
			'5001-10000': 7500,
			'10000+': 15000,
		};

		return ranges[employeeRange] || undefined;
	}

	/**
	 * Assess data quality based on available fields
	 */
	private assessDataQuality(data: LushaCompanyData): 'high' | 'medium' | 'low' {
		let score = 0;

		if (data.website) score += 3;
		if (data.name) score += 2;
		if (data.industry) score += 2;
		if (data.employeeCount) score += 2;
		if (data.location?.country) score += 1;
		if (data.socialMedia?.linkedin) score += 1;
		if (data.phone) score += 1;

		if (score >= 8) return 'high';
		if (score >= 4) return 'medium';
		return 'low';
	}

	/**
	 * Clear enrichment cache
	 */
	clearCache(identifier?: string): void {
		if (identifier) {
			this.cache.delete(`lusha-company:${identifier.toLowerCase()}`);
			this.cache.delete(`lusha-domain:${identifier.toLowerCase()}`);
		} else {
			this.cache.clear('lusha-');
		}
	}

	/**
	 * Get service status
	 */
	getStatus(): { apiKeyConfigured: boolean; cacheStats: any } {
		return {
			apiKeyConfigured: !!this.apiKey,
			cacheStats: this.cache.getStats(),
		};
	}
}

// Export singleton instance
export const lushaEnrichmentService = new LushaEnrichmentService();

export { LushaEnrichmentService };