/**
 * NAICS/PSC Classification Service
 *
 * Handles mapping and classification of NAICS and PSC codes using the comprehensive CSV data.
 * Provides industry categorization and business intelligence for contractor analysis.
 */

import Papa from "papaparse";

export interface NAICSRecord {
	naics_2_char: string;
	naics_2_description: string;
	naics_3_char: string;
	naics_3_description: string;
	naics_4_char: string;
	naics_4_description: string;
	naics_5_char: string;
	naics_5_description: string;
	naics_6_char: string;
	naics_6_description: string;
	psc_2_char: string;
	psc_2_char_description: string;
	psc_3_char: string;
	psc_3_char_description: string;
	psc_4_char: string;
	psc_4_char_description: string;
	keywords: string;
	match_type: "ai" | "deterministic";
	processing_timestamp: string;
}

export interface IndustryClassification {
	naicsCode: string;
	naicsDescription: string;
	pscCode: string;
	pscDescription: string;
	category: string;
	subcategory: string;
	keywords: string[];
	matchType: "ai" | "deterministic";
}

export interface IndustrySummary {
	primaryIndustry: string;
	secondaryIndustries: string[];
	marketType: "defense" | "civilian" | "mixed";
	industryTags: string[];
}

class NAICSPSCService {
	private classifications = new Map<string, IndustryClassification>();
	private naicsIndex = new Map<string, IndustryClassification[]>();
	private pscIndex = new Map<string, IndustryClassification[]>();
	private keywordIndex = new Map<string, IndustryClassification[]>();
	private loaded = false;
	private loading = false;

	/**
	 * Ensure classifications are loaded (lazy loading)
	 */
	private async ensureLoaded(): Promise<void> {
		if (this.loaded || this.loading) return;

		this.loading = true;
		await this.loadClassifications();
		this.loading = false;
	}

	/**
	 * Load classifications from CSV file
	 */
	private async loadClassifications(): Promise<void> {
		try {
			// Fetch from public directory (accessible to web browser)
			const csvPath = "/psc_naics_list.csv";
			const response = await fetch(csvPath);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const csvText = await response.text();

			const parsed = Papa.parse<NAICSRecord>(csvText, {
				header: true,
				skipEmptyLines: true,
			});

			parsed.data.forEach((record) => {
				if (!record.naics_6_char || !record.psc_4_char) return;

				const classification: IndustryClassification = {
					naicsCode: record.naics_6_char,
					naicsDescription: record.naics_6_description,
					pscCode: record.psc_4_char,
					pscDescription: record.psc_4_char_description,
					category: this.categorizeIndustry(record.naics_2_description),
					subcategory: record.naics_3_description,
					keywords: this.parseKeywords(record.keywords),
					matchType: record.match_type,
				};

				const key = `${record.naics_6_char}:${record.psc_4_char}`;
				this.classifications.set(key, classification);

				// Build indices for fast lookup
				this.addToIndex(this.naicsIndex, record.naics_6_char, classification);
				this.addToIndex(this.pscIndex, record.psc_4_char, classification);

				// Index keywords for search
				classification.keywords.forEach((keyword) => {
					this.addToIndex(
						this.keywordIndex,
						keyword.toLowerCase(),
						classification,
					);
				});
			});

			this.loaded = true;
			console.log(
				`Loaded ${this.classifications.size} industry classifications`,
			);
		} catch (error) {
			console.warn(
				"Failed to load NAICS/PSC classifications, falling back to mock data:",
				error,
			);
			this.loadMockClassifications();
		}
	}

	/**
	 * Get industry classification by NAICS code (async version)
	 */
	async getByNAICS(naicsCode: string): Promise<IndustryClassification | null> {
		await this.ensureLoaded();
		const classifications = this.naicsIndex.get(naicsCode);
		return classifications?.[0] || null;
	}

	/**
	 * Get industry classification by NAICS code (sync version - returns null if not loaded)
	 */
	getByNAICSSync(naicsCode: string): IndustryClassification | null {
		if (!this.loaded) return null;
		const classifications = this.naicsIndex.get(naicsCode);
		return classifications?.[0] || null;
	}

	/**
	 * Get industry classification by PSC code
	 */
	async getByPSC(pscCode: string): Promise<IndustryClassification | null> {
		await this.ensureLoaded();
		const classifications = this.pscIndex.get(pscCode);
		return classifications?.[0] || null;
	}

	/**
	 * Search industries by keyword (async version)
	 */
	async searchByKeyword(keyword: string): Promise<IndustryClassification[]> {
		await this.ensureLoaded();
		return this.searchByKeywordSync(keyword);
	}

	/**
	 * Search industries by keyword (sync version - returns empty if not loaded)
	 */
	searchByKeywordSync(keyword: string): IndustryClassification[] {
		if (!this.loaded) return [];

		const normalizedKeyword = keyword.toLowerCase();
		const directMatches = this.keywordIndex.get(normalizedKeyword) || [];

		// Also search in descriptions for partial matches
		const partialMatches: IndustryClassification[] = [];
		this.classifications.forEach((classification) => {
			if (
				classification.naicsDescription
					.toLowerCase()
					.includes(normalizedKeyword) ||
				classification.pscDescription.toLowerCase().includes(normalizedKeyword)
			) {
				partialMatches.push(classification);
			}
		});

		// Combine and deduplicate
		const allMatches = [...directMatches, ...partialMatches];
		return Array.from(
			new Map(allMatches.map((c) => [c.naicsCode + c.pscCode, c])).values(),
		);
	}

	/**
	 * Get industry summary for a contractor based on their NAICS codes
	 */
	async getIndustrySummary(naicsCodes: string[]): Promise<IndustrySummary> {
		await this.ensureLoaded();
		const classifications = await Promise.all(
			naicsCodes.map((code) => this.getByNAICS(code)),
		);
		const validClassifications = classifications.filter(
			(c): c is IndustryClassification => c !== null,
		);

		if (validClassifications.length === 0) {
			return {
				primaryIndustry: "Unknown",
				secondaryIndustries: [],
				marketType: "civilian",
				industryTags: [],
			};
		}

		// Determine primary industry (most common category)
		const categoryCount = new Map<string, number>();
		validClassifications.forEach((c) => {
			categoryCount.set(c.category, (categoryCount.get(c.category) || 0) + 1);
		});

		const [primaryIndustry] = [...categoryCount.entries()].sort(
			(a, b) => b[1] - a[1],
		)[0];

		// Get secondary industries
		const secondaryIndustries = validClassifications
			.map((c) => c.subcategory)
			.filter((sub) => sub !== primaryIndustry)
			.slice(0, 3);

		// Determine market type based on keywords and PSC codes
		const marketType = this.determineMarketType(validClassifications);

		// Generate industry tags
		const allKeywords = validClassifications.flatMap((c) => c.keywords);
		const keywordCount = new Map<string, number>();
		allKeywords.forEach((keyword) => {
			keywordCount.set(keyword, (keywordCount.get(keyword) || 0) + 1);
		});

		const industryTags = [...keywordCount.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([keyword]) => keyword);

		return {
			primaryIndustry,
			secondaryIndustries,
			marketType,
			industryTags,
		};
	}

	/**
	 * Get all classifications for a specific industry category
	 */
	async getByCategory(category: string): Promise<IndustryClassification[]> {
		await this.ensureLoaded();
		return Array.from(this.classifications.values()).filter(
			(c) => c.category.toLowerCase() === category.toLowerCase(),
		);
	}

	/**
	 * Get industry image/icon mapping (extends existing logic)
	 * Synchronous method - falls back to default if not loaded
	 */
	getIndustryImage(companyName: string, naicsDescription: string): string {
		if (!this.loaded) {
			return this.getDefaultIndustryImage(naicsDescription);
		}

		// Since we're synchronous, we can't await - do a simple search
		const normalizedKeyword = naicsDescription.toLowerCase();
		const directMatches = this.keywordIndex.get(normalizedKeyword) || [];
		const classification = directMatches[0];

		if (!classification) {
			return this.getDefaultIndustryImage(naicsDescription);
		}

		// Use keywords to determine appropriate image
		const keywords = classification.keywords.map((k) => k.toLowerCase());

		if (
			keywords.some((k) => ["aerospace", "aircraft", "aviation"].includes(k))
		) {
			return "/gg_industry_images/aerospace.jpg";
		}
		if (
			keywords.some((k) =>
				["manufacturing", "fabrication", "machinery"].includes(k),
			)
		) {
			return "/gg_industry_images/manufacturing.jpg";
		}
		if (
			keywords.some((k) =>
				["construction", "building", "engineering"].includes(k),
			)
		) {
			return "/gg_industry_images/construction.jpg";
		}
		if (
			keywords.some((k) => ["technology", "software", "computer"].includes(k))
		) {
			return "/gg_industry_images/technology.jpg";
		}
		if (keywords.some((k) => ["defense", "military", "security"].includes(k))) {
			return "/gg_industry_images/defense.jpg";
		}

		return this.getDefaultIndustryImage(naicsDescription);
	}

	/**
	 * Get industry tag/badge for display
	 * Synchronous method - falls back to default if not loaded
	 */
	getIndustryTag(companyName: string, naicsDescription: string): string {
		if (!this.loaded) {
			return this.getDefaultIndustryTag(naicsDescription);
		}

		// Since we're synchronous, we can't await - do a simple search
		const normalizedKeyword = naicsDescription.toLowerCase();
		const directMatches = this.keywordIndex.get(normalizedKeyword) || [];
		const classification = directMatches[0];

		if (!classification) {
			return this.getDefaultIndustryTag(naicsDescription);
		}

		return classification.category.toUpperCase();
	}

	/**
	 * Check if service is ready
	 */
	isLoaded(): boolean {
		return this.loaded;
	}

	/**
	 * Get classification statistics
	 */
	getStats(): { total: number; categories: Record<string, number> } {
		const categoryCount: Record<string, number> = {};

		this.classifications.forEach((classification) => {
			categoryCount[classification.category] =
				(categoryCount[classification.category] || 0) + 1;
		});

		return {
			total: this.classifications.size,
			categories: categoryCount,
		};
	}

	/**
	 * Private: Add classification to index
	 */
	private addToIndex(
		index: Map<string, IndustryClassification[]>,
		key: string,
		classification: IndustryClassification,
	): void {
		const existing = index.get(key) || [];
		existing.push(classification);
		index.set(key, existing);
	}

	/**
	 * Private: Parse keywords from CSV field
	 */
	private parseKeywords(keywordStr: string): string[] {
		if (!keywordStr) return [];

		return keywordStr
			.split(",")
			.map((k) => k.trim())
			.filter((k) => k.length > 0)
			.slice(0, 10); // Limit to 10 keywords
	}

	/**
	 * Private: Categorize industry based on NAICS 2-digit description
	 */
	private categorizeIndustry(naics2Description: string): string {
		const desc = naics2Description.toLowerCase();

		if (desc.includes("manufacturing")) return "Manufacturing";
		if (desc.includes("construction")) return "Construction";
		if (desc.includes("information")) return "Technology";
		if (desc.includes("professional") || desc.includes("technical"))
			return "Professional Services";
		if (desc.includes("health")) return "Healthcare";
		if (desc.includes("educational")) return "Education";
		if (desc.includes("transportation")) return "Transportation";
		if (desc.includes("administrative")) return "Administrative Services";
		if (desc.includes("public administration")) return "Government";

		return "Other Services";
	}

	/**
	 * Private: Determine market type based on classifications
	 */
	private determineMarketType(
		classifications: IndustryClassification[],
	): "defense" | "civilian" | "mixed" {
		const defenseKeywords = [
			"defense",
			"military",
			"missile",
			"weapon",
			"surveillance",
			"security",
		];
		const civilianKeywords = [
			"healthcare",
			"education",
			"civilian",
			"commercial",
		];

		let defenseCount = 0;
		let civilianCount = 0;

		classifications.forEach((c) => {
			const allText =
				`${c.naicsDescription} ${c.pscDescription} ${c.keywords.join(" ")}`.toLowerCase();

			if (defenseKeywords.some((keyword) => allText.includes(keyword))) {
				defenseCount++;
			} else if (
				civilianKeywords.some((keyword) => allText.includes(keyword))
			) {
				civilianCount++;
			} else {
				civilianCount++; // Default to civilian
			}
		});

		if (defenseCount > civilianCount) return "defense";
		if (defenseCount > 0 && civilianCount > 0) return "mixed";
		return "civilian";
	}

	/**
	 * Private: Fallback industry image logic (from existing code)
	 */
	private getDefaultIndustryImage(naicsDescription: string): string {
		const desc = naicsDescription.toLowerCase();

		if (desc.includes("aircraft") || desc.includes("aerospace")) {
			return "/gg_industry_images/aerospace.jpg";
		}
		if (desc.includes("manufacturing") || desc.includes("fabrication")) {
			return "/gg_industry_images/manufacturing.jpg";
		}
		if (desc.includes("construction") || desc.includes("building")) {
			return "/gg_industry_images/construction.jpg";
		}

		return "/gg_industry_images/default.jpg";
	}

	/**
	 * Private: Fallback industry tag logic
	 */
	private getDefaultIndustryTag(naicsDescription: string): string {
		const desc = naicsDescription.toLowerCase();

		if (desc.includes("manufacturing")) return "MFG";
		if (desc.includes("construction")) return "CONST";
		if (desc.includes("professional")) return "PROF";
		if (desc.includes("technology")) return "TECH";

		return "OTHER";
	}

	/**
	 * Private: Load mock classifications when CSV fails
	 * TODO: Remove when CSV loading is reliable
	 */
	private loadMockClassifications(): void {
		const mockData = [
			{
				naicsCode: "336411",
				naicsDescription: "Aircraft Manufacturing",
				pscCode: "1510",
				pscDescription: "Aircraft, Fixed Wing",
				category: "Manufacturing",
				subcategory: "Aerospace Product and Parts Manufacturing",
				keywords: [
					"aircraft",
					"airplane",
					"aviation",
					"aerospace",
					"manufacturing",
				],
				matchType: "deterministic" as const,
			},
			{
				naicsCode: "541330",
				naicsDescription: "Engineering Services",
				pscCode: "R425",
				pscDescription: "Engineering Services",
				category: "Professional Services",
				subcategory: "Engineering Services",
				keywords: [
					"engineering",
					"design",
					"technical",
					"professional",
					"consulting",
				],
				matchType: "deterministic" as const,
			},
			{
				naicsCode: "236220",
				naicsDescription: "Commercial and Institutional Building Construction",
				pscCode: "Z101",
				pscDescription: "Construction Services",
				category: "Construction",
				subcategory: "Commercial Building Construction",
				keywords: ["construction", "building", "commercial", "institutional"],
				matchType: "deterministic" as const,
			},
			{
				naicsCode: "541511",
				naicsDescription: "Custom Computer Programming Services",
				pscCode: "D302",
				pscDescription: "Software Development",
				category: "Technology",
				subcategory: "Computer Systems Design",
				keywords: [
					"software",
					"programming",
					"computer",
					"development",
					"technology",
				],
				matchType: "deterministic" as const,
			},
			{
				naicsCode: "541512",
				naicsDescription: "Computer Systems Design Services",
				pscCode: "D307",
				pscDescription: "Systems Analysis",
				category: "Technology",
				subcategory: "Computer Systems Design",
				keywords: ["systems", "design", "computer", "analysis", "technology"],
				matchType: "deterministic" as const,
			},
		];

		mockData.forEach((mock) => {
			const key = `${mock.naicsCode}:${mock.pscCode}`;
			this.classifications.set(key, mock);

			// Build indices
			this.addToIndex(this.naicsIndex, mock.naicsCode, mock);
			this.addToIndex(this.pscIndex, mock.pscCode, mock);

			// Index keywords
			mock.keywords.forEach((keyword) => {
				this.addToIndex(this.keywordIndex, keyword.toLowerCase(), mock);
			});
		});

		this.loaded = true;
		console.log(
			`Loaded ${mockData.length} mock NAICS/PSC classifications (fallback mode)`,
		);
	}
}

// Export singleton instance
export const naicsPscService = new NAICSPSCService();

export { NAICSPSCService };
