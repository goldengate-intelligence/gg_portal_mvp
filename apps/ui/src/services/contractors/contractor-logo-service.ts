/**
 * Contractor Logo Service
 *
 * Handles contractor logo retrieval from API/hosting solution.
 * Provides caching and fallback strategies for logo display.
 */

import { LargeDataCache } from "../caching/large-data-cache";

export interface LogoConfig {
	apiUrl: string;
	apiKey?: string;
	cdnUrl?: string;
	fallbackEnabled: boolean;
}

export interface LogoResponse {
	logoUrl: string | null;
	source: "api" | "cdn" | "fallback" | "cached";
	quality: "high" | "medium" | "low";
	lastUpdated?: string;
}

class ContractorLogoService {
	private config: LogoConfig;
	private cache: LargeDataCache;

	// Static fallback logos for well-known contractors
	private readonly FALLBACK_LOGOS: Record<string, string> = {
		// Defense contractors
		RTX987654321: "/contractor-logos/raytheon.svg",
		LMT123456789: "/contractor-logos/lockheed-martin.svg",
		BA987654321: "/contractor-logos/boeing.svg",
		NOC123456789: "/contractor-logos/northrop-grumman.svg",
		GD987654321: "/contractor-logos/general-dynamics.svg",
		BAE456789123: "/contractor-logos/bae-systems.svg",

		// Technology contractors
		IBM123456789: "/contractor-logos/ibm.svg",
		MSFT987654321: "/contractor-logos/microsoft.svg",
		AMZN123456789: "/contractor-logos/amazon.svg",
		GOOG987654321: "/contractor-logos/google.svg",

		// Healthcare
		JNJ123456789: "/contractor-logos/johnson-johnson.svg",
		PFE987654321: "/contractor-logos/pfizer.svg",

		// Engineering/Construction
		CAT123456789: "/contractor-logos/caterpillar.svg",
		HON987654321: "/contractor-logos/honeywell.svg",

		// Trio and other specific contractors
		TFL123456789: "/contractor-logos/trio-fabrication.svg",
	};

	constructor(config: LogoConfig) {
		this.config = config;
		this.cache = new LargeDataCache({
			maxCacheSize: 10_000, // Cache up to 10k logo URLs
			ttlMinutes: 60 * 24, // 24 hour cache for logos
		});
	}

	/**
	 * Get contractor logo URL
	 */
	async getContractorLogo(
		uei: string,
		companyName?: string,
	): Promise<LogoResponse> {
		console.log(`[Logo Service] Getting logo for UEI: ${uei}, Company: ${companyName}`);

		// Check cache first
		const cacheKey = `logo:${uei}`;
		const cached = this.cache.get<LogoResponse>(cacheKey);
		if (cached) {
			console.log(`[Logo Service] Logo found in cache for ${companyName}`);
			return { ...cached, source: "cached" };
		}

		// Try static fallback first for better performance and reliability
		console.log(`[Logo Service] Trying static fallback for ${companyName}`);
		const fallbackResult = this.getFallbackLogo(uei, companyName);
		if (fallbackResult.logoUrl) {
			console.log(`[Logo Service] Static fallback logo found for ${companyName}: ${fallbackResult.logoUrl}`);
			this.cache.set(cacheKey, fallbackResult);
			return fallbackResult;
		}

		// Try Logo.dev API second if no static fallback is available
		try {
			console.log(`[Logo Service] Trying Logo.dev API for ${companyName}`);
			const apiResult = await this.fetchFromAPI(uei, companyName);
			if (apiResult.logoUrl) {
				console.log(`[Logo Service] API logo found for ${companyName}: ${apiResult.logoUrl}`);
				this.cache.set(cacheKey, apiResult);
				return apiResult;
			}
		} catch (error) {
			console.warn(`[Logo Service] Logo.dev API failed for ${companyName} (this is expected if API key is invalid or service is down):`, error instanceof Error ? error.message : 'Unknown error');

			// For testing: if it's a major company, show the error more prominently
			if (companyName && (
				companyName.toLowerCase().includes('lockheed') ||
				companyName.toLowerCase().includes('raytheon') ||
				companyName.toLowerCase().includes('general dynamics') ||
				companyName.toLowerCase().includes('boeing')
			)) {
				console.error(`[Logo Service] ❌ API failed for major company ${companyName}. This should work! Full error:`, error);
				console.error(`[Logo Service] API Key present: ${this.config.apiKey ? 'YES' : 'NO'}`);
				console.error(`[Logo Service] API Key starts with: ${this.config.apiKey ? this.config.apiKey.substring(0, 10) + '...' : 'N/A'}`);
			}
		}

		// Try CDN if available
		if (this.config.cdnUrl) {
			try {
				console.log(`[Logo Service] Trying CDN for ${companyName}`);
				const cdnResult = await this.fetchFromCDN(uei, companyName);
				if (cdnResult.logoUrl) {
					console.log(`[Logo Service] CDN logo found for ${companyName}: ${cdnResult.logoUrl}`);
					this.cache.set(cacheKey, cdnResult);
					return cdnResult;
				}
			} catch (error) {
				console.warn(`[Logo Service] Logo CDN failed for ${companyName}:`, error instanceof Error ? error.message : 'Unknown error');
			}
		}

		// Return null if no logo found
		console.warn(`[Logo Service] No logo found for ${companyName} (UEI: ${uei})`);
		const noLogoResult: LogoResponse = {
			logoUrl: null,
			source: "fallback",
			quality: "low",
		};

		this.cache.set(cacheKey, noLogoResult);
		return noLogoResult;
	}

	/**
	 * Get multiple contractor logos efficiently
	 */
	async getMultipleLogos(
		requests: Array<{ uei: string; companyName?: string }>,
	): Promise<Record<string, LogoResponse>> {
		const results: Record<string, LogoResponse> = {};

		// Process in batches to avoid overwhelming the API
		const batchSize = 10;
		for (let i = 0; i < requests.length; i += batchSize) {
			const batch = requests.slice(i, i + batchSize);

			const batchPromises = batch.map(async ({ uei, companyName }) => {
				const result = await this.getContractorLogo(uei, companyName);
				return { uei, result };
			});

			const batchResults = await Promise.all(batchPromises);
			batchResults.forEach(({ uei, result }) => {
				results[uei] = result;
			});
		}

		return results;
	}

	/**
	 * Preload logos for a list of contractors
	 */
	async preloadLogos(ueis: string[]): Promise<void> {
		// Load in background, don't wait for results
		this.getMultipleLogos(ueis.map((uei) => ({ uei }))).catch((error) =>
			console.warn("Logo preloading failed:", error),
		);
	}

	/**
	 * Get logo placeholder/initials fallback
	 */
	getLogoPlaceholder(companyName: string): {
		initials: string;
		backgroundColor: string;
		textColor: string;
	} {
		const initials = this.generateCompanyInitials(companyName);
		const backgroundColor = this.generateColorFromString(companyName);

		return {
			initials,
			backgroundColor,
			textColor: this.getContrastingTextColor(backgroundColor),
		};
	}

	/**
	 * Clear logo cache
	 */
	clearCache(uei?: string): void {
		if (uei) {
			this.cache.delete(`logo:${uei}`);
		} else {
			this.cache.clear("logo:");
		}
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats(): { size: number; hitRate: number } {
		return this.cache.getStats();
	}

	/**
	 * Private: Fetch logo from Logo.dev API
	 */
	private async fetchFromAPI(
		uei: string,
		companyName?: string,
	): Promise<LogoResponse> {
		if (!companyName) {
			throw new Error("Company name is required for Logo.dev search API");
		}

		if (!this.config.apiKey) {
			throw new Error("Logo.dev API key not configured");
		}

		// Use correct Logo.dev search API format
		const searchQuery = companyName.toLowerCase();
		const apiUrl = `https://api.logo.dev/search?q=${encodeURIComponent(searchQuery)}`;
		console.log(`[Logo Service] Searching Logo.dev API for: ${searchQuery}`);

		try {
			const response = await fetch(apiUrl, {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${this.config.apiKey}`,
				},
				signal: AbortSignal.timeout(5000),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.log(`[Logo Service] Logo.dev API error: ${response.status} - ${errorText}`);
				throw new Error(`Logo.dev API error: ${response.status} - ${errorText}`);
			}

			const data = await response.json();
			console.log(`[Logo Service] Logo.dev API response:`, data);

			// Logo.dev returns an array of results like:
			// [{ "name": "Google", "domain": "google.com", "logo_url": "https://img.logo.dev/google.com?token=..." }]
			if (Array.isArray(data) && data.length > 0) {
				const firstResult = data[0];
				const logoUrl = firstResult.logo_url;

				if (logoUrl) {
					console.log(`[Logo Service] Successfully found logo for ${companyName}: ${logoUrl}`);
					return {
						logoUrl,
						source: "api",
						quality: "high",
						lastUpdated: new Date().toISOString(),
					};
				}
			}

			console.warn(`[Logo Service] No logo found in Logo.dev response for ${companyName}`);
			throw new Error("No logo found in API response");
		} catch (error) {
			console.warn(`[Logo Service] Logo API error for ${companyName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
			throw new Error(`Logo API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	/**
	 * Private: Fetch logo from CDN
	 */
	private async fetchFromCDN(
		uei: string,
		companyName?: string,
	): Promise<LogoResponse> {
		// Try multiple naming conventions
		const possiblePaths = [
			`${this.config.cdnUrl}/logos/${uei.toLowerCase()}.svg`,
			`${this.config.cdnUrl}/logos/${uei.toLowerCase()}.png`,
			`${this.config.cdnUrl}/logos/${uei.toLowerCase()}.jpg`,
			...(companyName
				? [
						`${this.config.cdnUrl}/logos/${companyName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.svg`,
						`${this.config.cdnUrl}/logos/${companyName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`,
						`${this.config.cdnUrl}/logos/${companyName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.jpg`,
					]
				: []),
		];

		for (const path of possiblePaths) {
			try {
				const response = await fetch(path, {
					method: "HEAD",
					signal: AbortSignal.timeout(3000),
				});
				if (response.ok) {
					return {
						logoUrl: path,
						source: "cdn",
						quality: "medium",
					};
				}
			} catch {
				// Continue to next path
			}
		}

		throw new Error("No logo found in CDN");
	}

	/**
	 * Private: Get fallback logo from static assets
	 */
	private getFallbackLogo(uei: string, companyName?: string): LogoResponse {
		// Check direct UEI mapping
		if (this.FALLBACK_LOGOS[uei]) {
			return {
				logoUrl: this.FALLBACK_LOGOS[uei],
				source: "fallback",
				quality: "medium",
			};
		}

		// Check company name patterns
		if (companyName) {
			const name = companyName.toLowerCase();

			// Major defense contractors
			if (name.includes("raytheon"))
				return {
					logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Raytheon_logo.svg/320px-Raytheon_logo.svg.png",
					source: "fallback",
					quality: "high",
					lastUpdated: new Date().toISOString(),
				};
			if (name.includes("lockheed"))
				return {
					logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Lockheed_Martin_logo.svg/320px-Lockheed_Martin_logo.svg.png",
					source: "fallback",
					quality: "high",
					lastUpdated: new Date().toISOString(),
				};
			if (name.includes("boeing"))
				return {
					logoUrl: "/contractor-logos/boeing.svg",
					source: "fallback",
					quality: "medium",
				};
			if (name.includes("northrop"))
				return {
					logoUrl: "/contractor-logos/northrop-grumman.svg",
					source: "fallback",
					quality: "medium",
				};
			if (name.includes("general dynamics"))
				return {
					logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/General_Dynamics_logo.svg/320px-General_Dynamics_logo.svg.png",
					source: "fallback",
					quality: "high",
					lastUpdated: new Date().toISOString(),
				};
			if (name.includes("bae"))
				return {
					logoUrl: "/contractor-logos/bae-systems.svg",
					source: "fallback",
					quality: "medium",
				};

			// Technology companies
			if (name.includes("ibm"))
				return {
					logoUrl: "/contractor-logos/ibm.svg",
					source: "fallback",
					quality: "medium",
				};
			if (name.includes("microsoft"))
				return {
					logoUrl: "/contractor-logos/microsoft.svg",
					source: "fallback",
					quality: "medium",
				};
			if (name.includes("amazon"))
				return {
					logoUrl: "/contractor-logos/amazon.svg",
					source: "fallback",
					quality: "medium",
				};
			if (name.includes("google"))
				return {
					logoUrl: "/contractor-logos/google.svg",
					source: "fallback",
					quality: "medium",
				};

			// Trio Fabrication
			if (name.includes("trio"))
				return {
					logoUrl: "/contractor-logos/trio-fabrication.svg",
					source: "fallback",
					quality: "medium",
				};

			// Applied Composites
			if (name.includes("applied") && name.includes("composites"))
				return {
					logoUrl: "/contractor-logos/applied-composites.svg",
					source: "fallback",
					quality: "medium",
				};

			// MedStar Federal
			if (name.includes("medstar"))
				return {
					logoUrl: "/contractor-logos/medstar-federal.svg",
					source: "fallback",
					quality: "medium",
				};

			// InfoTech Consulting
			if (name.includes("infotech"))
				return {
					logoUrl: "/contractor-logos/infotech-consulting.svg",
					source: "fallback",
					quality: "medium",
				};
		}

		return { logoUrl: null, source: "fallback", quality: "low" };
	}

	/**
	 * Private: Generate company initials
	 */
	private generateCompanyInitials(companyName: string): string {
		// Special cases for well-known patterns
		if (companyName.includes("Trio")) return "TFL";
		if (companyName.includes("Raytheon")) return "RTX";
		if (companyName.includes("BAE")) return "BAE";

		// General algorithm
		return companyName
			.split(" ")
			.map((word) => word.charAt(0))
			.join("")
			.slice(0, 3)
			.toUpperCase();
	}

	/**
	 * Private: Generate consistent color from string
	 */
	private generateColorFromString(str: string): string {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}

		// Generate a pleasant color (avoid too light or too dark)
		const hue = hash % 360;
		return `hsl(${hue}, 60%, 45%)`;
	}

	/**
	 * Private: Get contrasting text color
	 */
	private getContrastingTextColor(backgroundColor: string): string {
		// Simple contrast check - for production, use a proper contrast ratio calculation
		return "#ffffff"; // White text generally works well with the generated colors
	}

	/**
	 * Private: Extract company domain from name or UEI
	 */
	private extractCompanyDomain(companyName?: string): string | null {
		if (!companyName) return null;

		const name = companyName.toLowerCase();

		// Well-known domain mappings for major contractors
		const domainMappings: Record<string, string> = {
			// Defense contractors
			"raytheon": "rtx.com",
			"lockheed martin": "lockheedmartin.com",
			"boeing": "boeing.com",
			"northrop grumman": "northropgrumman.com",
			"general dynamics": "gd.com",
			"bae systems": "baesystems.com",

			// Technology companies
			"ibm": "ibm.com",
			"microsoft": "microsoft.com",
			"amazon": "amazon.com",
			"google": "google.com",
			"alphabet": "google.com",

			// Healthcare
			"johnson & johnson": "jnj.com",
			"pfizer": "pfizer.com",

			// Engineering/Construction
			"caterpillar": "caterpillar.com",
			"honeywell": "honeywell.com",

			// Professional Services & IT
			"accenture": "accenture.com",
			"booz allen hamilton": "boozallen.com",
			"caci": "caci.com",
			"saic": "saic.com",

			// Construction/Engineering
			"fluor": "fluor.com",

			// Others
			"trio fabrication": "triofabrication.com"
		};

		// Check for exact matches first
		for (const [company, domain] of Object.entries(domainMappings)) {
			if (name.includes(company)) {
				console.log(`[Logo Service] Mapped "${companyName}" to domain: ${domain}`);
				return domain;
			}
		}

		// Try to extract domain-like patterns from company name
		// Look for "Corp", "Inc", "LLC" etc. and create a domain
		const cleanName = name
			.replace(/\b(corporation|corp|incorporated|inc|company|co|llc|ltd|limited)\b/g, "")
			.replace(/[^a-z0-9\s]/g, "")
			.trim()
			.replace(/\s+/g, "");

		if (cleanName && cleanName.length > 2) {
			return `${cleanName}.com`;
		}

		return null;
	}
}

// Export singleton instance configured for Logo.dev
export const contractorLogoService = new ContractorLogoService({
	apiUrl: "https://img.logo.dev", // Logo.dev API endpoint
	apiKey: import.meta.env.VITE_LOGO_DEV_API_KEY, // Your Logo.dev API token
	cdnUrl: import.meta.env.VITE_LOGO_CDN_URL, // Optional fallback CDN
	fallbackEnabled: true,
});

export { ContractorLogoService };
