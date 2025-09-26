/**
 * Snowflake API Service
 *
 * Handles live queries to Snowflake for the Discovery engine.
 * Supports complex transformations and real-time analysis.
 */

export interface SnowflakeConfig {
	baseUrl: string;
	apiKey: string;
	timeout: number;
}

export interface QueryRequest {
	sql: string;
	parameters?: Record<string, any>;
	maxRows?: number;
	timeout?: number;
}

export interface QueryResponse<T = any> {
	data: T[];
	rowCount: number;
	executionTime: number;
	queryId: string;
	hasMore?: boolean;
	nextToken?: string;
}

export interface DiscoverySearchRequest {
	searchTerm: string;
	filters?: {
		naics?: string[];
		agencies?: string[];
		dateRange?: { start: string; end: string };
		awardValueRange?: { min: number; max: number };
		location?: string;
	};
	sortBy?: string;
	sortDirection?: "asc" | "desc";
	limit?: number;
	offset?: number;
}

class SnowflakeApiService {
	private config: SnowflakeConfig;

	constructor(config: SnowflakeConfig) {
		this.config = config;
	}

	/**
	 * Execute raw SQL query against Snowflake
	 */
	async executeQuery<T = any>(
		request: QueryRequest,
	): Promise<QueryResponse<T>> {
		try {
			const url = `${this.config.baseUrl}/query`;
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.config.apiKey}`,
				},
				body: JSON.stringify({
					...request,
					timeout: request.timeout || this.config.timeout,
				}),
				signal: AbortSignal.timeout(request.timeout || this.config.timeout),
			});

			if (!response.ok) {
				throw new Error(
					`Snowflake query failed: ${response.status} ${response.statusText}`,
				);
			}

			return await response.json();
		} catch (error) {
			console.error("Snowflake API Error:", error);
			throw error;
		}
	}

	/**
	 * Discovery search with semantic analysis
	 */
	async discoverySearch(
		request: DiscoverySearchRequest,
	): Promise<QueryResponse> {
		const sql = this.buildDiscoveryQuery(request);

		return this.executeQuery({
			sql,
			parameters: this.buildQueryParameters(request),
			maxRows: request.limit || 100,
		});
	}

	/**
	 * Get contractor intelligence data
	 */
	async getContractorIntelligence(
		uei: string,
		analysisType: "competitive" | "network" | "risk",
	): Promise<QueryResponse> {
		const sql = this.buildIntelligenceQuery(uei, analysisType);

		return this.executeQuery({
			sql,
			parameters: { uei },
		});
	}

	/**
	 * Get relationship network analysis
	 */
	async getNetworkAnalysis(
		centerUei: string,
		depth = 2,
	): Promise<QueryResponse> {
		const sql = `
      WITH RECURSIVE network_traversal AS (
        -- Base case: direct relationships
        SELECT
          contractor_uei,
          related_contractor_uei,
          relationship_type,
          relationship_strength,
          1 as depth
        FROM contractor_relationships
        WHERE contractor_uei = $1

        UNION ALL

        -- Recursive case: expand network
        SELECT
          r.contractor_uei,
          r.related_contractor_uei,
          r.relationship_type,
          r.relationship_strength,
          nt.depth + 1
        FROM contractor_relationships r
        INNER JOIN network_traversal nt ON r.contractor_uei = nt.related_contractor_uei
        WHERE nt.depth < $2
      )
      SELECT DISTINCT * FROM network_traversal
      ORDER BY depth, relationship_strength DESC;
    `;

		return this.executeQuery({
			sql,
			parameters: { 1: centerUei, 2: depth },
		});
	}

	/**
	 * Get market opportunity analysis
	 */
	async getMarketOpportunities(filters: {
		industries?: string[];
		agencies?: string[];
		awardSizeRange?: { min: number; max: number };
	}): Promise<QueryResponse> {
		const sql = this.buildOpportunityQuery(filters);

		return this.executeQuery({
			sql,
			parameters: this.buildQueryParameters(filters),
		});
	}

	/**
	 * Get real-time market insights
	 */
	async getMarketInsights(
		timeframe: "day" | "week" | "month",
	): Promise<QueryResponse> {
		const sql = `
      SELECT
        award_date,
        agency_name,
        naics_code,
        SUM(award_amount) as total_awards,
        COUNT(*) as award_count,
        AVG(award_amount) as avg_award_size
      FROM recent_awards
      WHERE award_date >= DATEADD(${timeframe.toUpperCase()}, -1, CURRENT_DATE())
      GROUP BY award_date, agency_name, naics_code
      ORDER BY award_date DESC, total_awards DESC;
    `;

		return this.executeQuery({ sql });
	}

	/**
	 * Build discovery query based on search request
	 */
	private buildDiscoveryQuery(request: DiscoverySearchRequest): string {
		let sql = `
      SELECT DISTINCT
        c.uei,
        c.company_name,
        c.naics_code,
        c.naics_description,
        c.primary_agency,
        c.total_awards,
        c.active_awards_value,
        c.performance_score,
        RANK() OVER (ORDER BY c.performance_score DESC, c.total_awards DESC) as ranking
      FROM contractors c
      LEFT JOIN awards a ON c.uei = a.contractor_uei
    `;

		const conditions: string[] = [];

		// Full-text search
		if (request.searchTerm) {
			conditions.push(`(
        CONTAINS(c.company_name, $searchTerm) OR
        CONTAINS(c.naics_description, $searchTerm) OR
        CONTAINS(a.description, $searchTerm)
      )`);
		}

		// Filters
		if (request.filters?.naics?.length) {
			conditions.push(
				`c.naics_code IN (${request.filters.naics.map((_, i) => `$naics_${i}`).join(", ")})`,
			);
		}

		if (request.filters?.agencies?.length) {
			conditions.push(
				`c.primary_agency IN (${request.filters.agencies.map((_, i) => `$agency_${i}`).join(", ")})`,
			);
		}

		if (request.filters?.awardValueRange) {
			conditions.push("c.active_awards_value BETWEEN $minValue AND $maxValue");
		}

		if (request.filters?.dateRange) {
			conditions.push("a.award_date BETWEEN $startDate AND $endDate");
		}

		if (conditions.length > 0) {
			sql += ` WHERE ${conditions.join(" AND ")}`;
		}

		// Sorting
		const sortBy = request.sortBy || "performance_score";
		const direction = request.sortDirection || "desc";
		sql += ` ORDER BY ${sortBy} ${direction.toUpperCase()}`;

		// Pagination
		if (request.limit) {
			sql += ` LIMIT ${request.limit}`;
			if (request.offset) {
				sql += ` OFFSET ${request.offset}`;
			}
		}

		return sql;
	}

	/**
	 * Build intelligence query for contractor analysis
	 */
	private buildIntelligenceQuery(uei: string, analysisType: string): string {
		switch (analysisType) {
			case "competitive":
				return `
          SELECT
            competitor_uei,
            competitor_name,
            shared_naics,
            shared_agencies,
            competitive_overlap_score,
            market_share_difference
          FROM competitive_analysis
          WHERE base_contractor_uei = $uei
          ORDER BY competitive_overlap_score DESC;
        `;

			case "network":
				return `
          SELECT
            network_node_uei,
            network_node_name,
            connection_strength,
            connection_type,
            mutual_connections
          FROM network_analysis
          WHERE center_contractor_uei = $uei
          ORDER BY connection_strength DESC;
        `;

			case "risk":
				return `
          SELECT
            risk_factor,
            risk_score,
            risk_trend,
            contributing_factors
          FROM risk_analysis
          WHERE contractor_uei = $uei
          ORDER BY risk_score DESC;
        `;

			default:
				throw new Error(`Unknown analysis type: ${analysisType}`);
		}
	}

	/**
	 * Build opportunity query
	 */
	private buildOpportunityQuery(filters: any): string {
		let sql = `
      SELECT
        opportunity_id,
        agency_name,
        naics_code,
        estimated_value,
        competition_level,
        win_probability,
        opportunity_score
      FROM market_opportunities
    `;

		const conditions: string[] = [];

		if (filters.industries?.length) {
			conditions.push(
				`naics_code IN (${filters.industries.map((_, i) => `$industry_${i}`).join(", ")})`,
			);
		}

		if (filters.agencies?.length) {
			conditions.push(
				`agency_name IN (${filters.agencies.map((_, i) => `$agency_${i}`).join(", ")})`,
			);
		}

		if (filters.awardSizeRange) {
			conditions.push("estimated_value BETWEEN $minSize AND $maxSize");
		}

		if (conditions.length > 0) {
			sql += ` WHERE ${conditions.join(" AND ")}`;
		}

		sql += " ORDER BY opportunity_score DESC";

		return sql;
	}

	/**
	 * Build query parameters from request
	 */
	private buildQueryParameters(request: any): Record<string, any> {
		const params: Record<string, any> = {};

		if (request.searchTerm) {
			params.searchTerm = request.searchTerm;
		}

		if (request.filters?.naics) {
			request.filters.naics.forEach((naics: string, i: number) => {
				params[`naics_${i}`] = naics;
			});
		}

		if (request.filters?.agencies) {
			request.filters.agencies.forEach((agency: string, i: number) => {
				params[`agency_${i}`] = agency;
			});
		}

		if (request.filters?.awardValueRange) {
			params.minValue = request.filters.awardValueRange.min;
			params.maxValue = request.filters.awardValueRange.max;
		}

		if (request.filters?.dateRange) {
			params.startDate = request.filters.dateRange.start;
			params.endDate = request.filters.dateRange.end;
		}

		return params;
	}
}

// Export singleton instance
export const snowflakeApi = new SnowflakeApiService({
	baseUrl:
		import.meta.env.VITE_SNOWFLAKE_API_URL || "http://localhost:8001/api",
	apiKey: import.meta.env.VITE_SNOWFLAKE_API_KEY || "",
	timeout: 60000, // 60 second timeout for complex queries
});

export { SnowflakeApiService };
