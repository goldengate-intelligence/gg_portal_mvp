interface ApiConfig {
	baseUrl: string;
	clientId: string;
	clientSecret: string;
	redirectUri: string;
	defaultTenantId: string;
}

const config: ApiConfig = {
	baseUrl: import.meta.env.VITE_API_URL || "/api/v1",
	clientId: "goldengate-web",
	clientSecret: "K9qA1BWN5EDWG69O6ka8rv-YEgAfSqUQ",
	redirectUri: `${window.location.origin}/auth/callback`,
	defaultTenantId: "658146d8-2572-4fdb-9cb3-350ddab5893a",
};

interface User {
	id: string;
	email: string;
	username: string;
	fullName: string;
	role: string;
	tenantId: string;
	organizationId: string;
}

interface AuthResponse {
	access_token: string;
	token_type: string;
	user: User;
}

export class ApiClient {
	private baseUrl: string;

	constructor(baseUrl: string = config.baseUrl) {
		this.baseUrl = baseUrl;
	}

	private getAuthHeaders(): Record<string, string> {
		const token = localStorage.getItem("access_token");
		const user = JSON.parse(localStorage.getItem("user") || "{}");

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (token) {
			headers.Authorization = `Bearer ${token}`;
			headers["x-tenant-id"] = user.tenantId || config.defaultTenantId;
		}

		return headers;
	}

	private async makeRequest<T>(
		url: string,
		options: RequestInit = {},
	): Promise<T> {
		const fullUrl = `${this.baseUrl}${url}`;
		const headers = {
			...this.getAuthHeaders(),
			...options.headers,
		};

		console.log("Making request:", options.method || "GET", fullUrl);
		if (options.body) {
			console.log("Request body:", options.body);
		}

		const response = await fetch(fullUrl, {
			...options,
			headers,
		});

		if (response.status === 401) {
			localStorage.removeItem("access_token");
			localStorage.removeItem("user");
			window.location.href = "/login";
			throw new Error("Session expired");
		}

		const responseData = await response.json().catch(() => null);

		if (!response.ok) {
			console.error("Request failed:", response.status, responseData);
			const errorMessage =
				responseData?.error || responseData?.message || "Request failed";
			throw new Error(errorMessage);
		}

		console.log("Response:", responseData);
		return responseData as T;
	}

	// Auth methods
	async register(userData: {
		email: string;
		username: string;
		password: string;
		fullName?: string;
	}): Promise<AuthResponse> {
		return this.makeRequest<AuthResponse>("/auth/register", {
			method: "POST",
			body: JSON.stringify({
				...userData,
				tenantId: config.defaultTenantId,
			}),
		});
	}

	async login(credentials: {
		email: string;
		password: string;
	}): Promise<AuthResponse> {
		const response = await this.makeRequest<AuthResponse>("/auth/login", {
			method: "POST",
			body: JSON.stringify(credentials),
		});

		localStorage.setItem("access_token", response.access_token);
		localStorage.setItem("user", JSON.stringify(response.user));

		return response;
	}

	async logout(): Promise<void> {
		const token = localStorage.getItem("access_token");

		if (token) {
			try {
				await this.makeRequest("/auth/logout", {
					method: "POST",
				});
			} catch (error) {
				console.warn("Logout request failed:", error);
			}
		}

		localStorage.removeItem("access_token");
		localStorage.removeItem("user");
	}

	async getCurrentUser(): Promise<User> {
		return this.makeRequest<User>("/auth/me");
	}

	async changePassword(
		userId: string,
		passwords: {
			currentPassword?: string;
			newPassword: string;
		},
	): Promise<void> {
		return this.makeRequest(`/users/${userId}/change-password`, {
			method: "POST",
			body: JSON.stringify(passwords),
		});
	}

	// User management methods
	async getUsers(): Promise<User[]> {
		return this.makeRequest<User[]>("/users");
	}

	async getUser(userId: string): Promise<User> {
		return this.makeRequest<User>(`/users/${userId}`);
	}

	async createUser(userData: {
		email: string;
		username: string;
		password: string;
		fullName?: string;
		role?: string;
		organizationId?: string;
	}): Promise<User> {
		return this.makeRequest<User>("/users", {
			method: "POST",
			body: JSON.stringify(userData),
		});
	}

	async updateUser(
		userId: string,
		updates: {
			email?: string;
			username?: string;
			fullName?: string;
			isActive?: boolean;
			role?: string;
		},
	): Promise<User> {
		return this.makeRequest<User>(`/users/${userId}`, {
			method: "PATCH",
			body: JSON.stringify(updates),
		});
	}

	async updateProfile(
		userId: string,
		profileData: {
			bio?: string;
			avatarUrl?: string;
			phone?: string;
			timezone?: string;
			preferences?: Record<string, any>;
		},
	): Promise<void> {
		return this.makeRequest(`/users/${userId}/profile`, {
			method: "PATCH",
			body: JSON.stringify(profileData),
		});
	}

	// Contractor methods
	async getContractors(params?: {
		search?: string;
		state?: string;
		agency?: string;
		industry?: string;
		lifecycle?: string;
		size?: string;
		minObligated?: number;
		maxObligated?: number;
		minContracts?: number;
		maxContracts?: number;
		page?: number;
		limit?: number;
		sortBy?: string;
		sortOrder?: "asc" | "desc";
	}): Promise<ContractorQueryResult> {
		const searchParams = new URLSearchParams();

		if (params?.search) searchParams.set("search", params.search);
		if (params?.state) searchParams.set("state", params.state);
		if (params?.agency) searchParams.set("agency", params.agency);
		if (params?.industry) searchParams.set("industry", params.industry);
		if (params?.lifecycle) searchParams.set("lifecycle", params.lifecycle);
		if (params?.size) searchParams.set("size", params.size);
		if (params?.minObligated)
			searchParams.set("minObligated", params.minObligated.toString());
		if (params?.maxObligated)
			searchParams.set("maxObligated", params.maxObligated.toString());
		if (params?.minContracts)
			searchParams.set("minContracts", params.minContracts.toString());
		if (params?.maxContracts)
			searchParams.set("maxContracts", params.maxContracts.toString());
		if (params?.page) searchParams.set("page", params.page.toString());
		if (params?.limit) searchParams.set("limit", params.limit.toString());
		if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
		if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

		const queryString = searchParams.toString();
		const url = `/contractors${queryString ? `?${queryString}` : ""}`;

		return this.makeRequest<ContractorQueryResult>(url);
	}

	async getContractor(uei: string): Promise<ContractorData> {
		const response = await this.makeRequest<{
			success: boolean;
			data: ContractorData;
		}>(`/contractors/${uei}`);
		return response.data;
	}

	async searchContractors(
		term: string,
		limit?: number,
	): Promise<ContractorData[]> {
		const searchParams = new URLSearchParams();
		if (limit) searchParams.set("limit", limit.toString());

		const queryString = searchParams.toString();
		const url = `/contractors/search/${encodeURIComponent(term)}${queryString ? `?${queryString}` : ""}`;

		const response = await this.makeRequest<{
			success: boolean;
			data: ContractorData[];
		}>(url);
		return response.data;
	}

	async getTopContractors(
		metric: "totalObligated" | "totalContracts" | "agencyDiversity",
		params?: {
			limit?: number;
			state?: string;
			agency?: string;
			industry?: string;
		},
	): Promise<ContractorData[]> {
		const searchParams = new URLSearchParams();

		if (params?.limit) searchParams.set("limit", params.limit.toString());
		if (params?.state) searchParams.set("state", params.state);
		if (params?.agency) searchParams.set("agency", params.agency);
		if (params?.industry) searchParams.set("industry", params.industry);

		const queryString = searchParams.toString();
		const url = `/contractors/top/${metric}${queryString ? `?${queryString}` : ""}`;

		const response = await this.makeRequest<{
			success: boolean;
			data: ContractorData[];
		}>(url);
		return response.data;
	}

	async getContractorFilterOptions(): Promise<FilterOptions> {
		const response = await this.makeRequest<{
			success: boolean;
			data: FilterOptions;
		}>("/contractors/filters/options");
		return response.data;
	}

	async getContractorStatistics(params?: {
		state?: string;
		agency?: string;
		industry?: string;
	}): Promise<ContractorStatistics> {
		const searchParams = new URLSearchParams();

		if (params?.state) searchParams.set("state", params.state);
		if (params?.agency) searchParams.set("agency", params.agency);
		if (params?.industry) searchParams.set("industry", params.industry);

		const queryString = searchParams.toString();
		const url = `/contractors/stats/summary${queryString ? `?${queryString}` : ""}`;

		const response = await this.makeRequest<{
			success: boolean;
			data: ContractorStatistics;
		}>(url);
		return response.data;
	}

	// Contractor Profile methods
	async getContractorProfiles(params?: {
		search?: string;
		states?: string;
		agencies?: string;
		industries?: string;
		sizeTiers?: string;
		lifecycleStages?: string;
		minObligated?: string;
		maxObligated?: string;
		page?: number;
		limit?: number;
		sortBy?: string;
		sortOrder?: "asc" | "desc";
	}): Promise<ContractorProfileQueryResult> {
		const searchParams = new URLSearchParams();

		if (params?.search) searchParams.set("search", params.search);
		if (params?.states) searchParams.set("states", params.states);
		if (params?.agencies) searchParams.set("agencies", params.agencies);
		if (params?.industries) searchParams.set("industries", params.industries);
		if (params?.sizeTiers) searchParams.set("sizeTiers", params.sizeTiers);
		if (params?.lifecycleStages)
			searchParams.set("lifecycleStages", params.lifecycleStages);
		if (params?.minObligated)
			searchParams.set("minObligated", params.minObligated);
		if (params?.maxObligated)
			searchParams.set("maxObligated", params.maxObligated);
		if (params?.page) searchParams.set("page", params.page.toString());
		if (params?.limit) searchParams.set("limit", params.limit.toString());
		if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
		if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

		const queryString = searchParams.toString();
		const url = `/contractor-profiles${queryString ? `?${queryString}` : ""}`;

		return this.makeRequest<ContractorProfileQueryResult>(url);
	}

	async getContractorProfile(
		profileId: string,
	): Promise<ContractorProfileDetail> {
		const response = await this.makeRequest<{
			success: boolean;
			data: ContractorProfileDetail;
		}>(`/contractor-profiles/${profileId}`);
		return response.data;
	}

	async getContractorProfileByName(name: string): Promise<ContractorProfile> {
		const response = await this.makeRequest<{
			success: boolean;
			data: ContractorProfile;
		}>(`/contractor-profiles/by-name/${encodeURIComponent(name)}`);
		return response.data;
	}

	async getTopContractorProfiles(
		metric: string,
		params?: {
			limit?: number;
			states?: string;
			agencies?: string;
			industries?: string;
		},
	): Promise<ContractorProfile[]> {
		const searchParams = new URLSearchParams();

		if (params?.limit) searchParams.set("limit", params.limit.toString());
		if (params?.states) searchParams.set("states", params.states);
		if (params?.agencies) searchParams.set("agencies", params.agencies);
		if (params?.industries) searchParams.set("industries", params.industries);

		const queryString = searchParams.toString();
		const url = `/contractor-profiles/top/${metric}${queryString ? `?${queryString}` : ""}`;

		const response = await this.makeRequest<{
			success: boolean;
			data: ContractorProfile[];
		}>(url);
		return response.data;
	}

	async getContractorProfileFilterOptions(): Promise<ProfileFilterOptions> {
		const response = await this.makeRequest<{
			success: boolean;
			data: ProfileFilterOptions;
		}>("/contractor-profiles/filters/options");
		return response.data;
	}

	// Contractor Lists methods
	async getContractorLists(): Promise<ContractorList[]> {
		const response = await this.makeRequest<{
			success: boolean;
			data: ContractorList[];
		}>("/contractor-lists");
		return response.data;
	}

	async createContractorList(data: {
		name: string;
		description?: string;
		color?: string;
		icon?: string;
		isPublic?: boolean;
	}): Promise<ContractorList> {
		const response = await this.makeRequest<{
			success: boolean;
			data: ContractorList;
		}>("/contractor-lists", {
			method: "POST",
			body: JSON.stringify(data),
		});
		return response.data;
	}

	async getContractorList(listId: string): Promise<ContractorListWithItems> {
		const response = await this.makeRequest<{
			success: boolean;
			data: ContractorListWithItems;
		}>(`/contractor-lists/${listId}`);
		return response.data;
	}

	async updateContractorList(
		listId: string,
		updates: {
			name?: string;
			description?: string;
			color?: string;
			icon?: string;
			isPublic?: boolean;
			sortOrder?: number;
		},
	): Promise<ContractorList> {
		const response = await this.makeRequest<{
			success: boolean;
			data: ContractorList;
		}>(`/contractor-lists/${listId}`, {
			method: "PATCH",
			body: JSON.stringify(updates),
		});
		return response.data;
	}

	async deleteContractorList(listId: string): Promise<boolean> {
		const response = await this.makeRequest<{ success: boolean }>(
			`/contractor-lists/${listId}`,
			{
				method: "DELETE",
			},
		);
		return response.success;
	}

	async addToContractorList(
		listId: string,
		data: {
			contractorProfileId: string;
			notes?: string;
			tags?: string[];
			rating?: number;
			priority?: "high" | "medium" | "low";
		},
	): Promise<ContractorListItem> {
		const response = await this.makeRequest<{
			success: boolean;
			data: ContractorListItem;
		}>(`/contractor-lists/${listId}/items`, {
			method: "POST",
			body: JSON.stringify(data),
		});
		return response.data;
	}

	async removeFromContractorList(
		listId: string,
		contractorProfileId: string,
	): Promise<boolean> {
		const response = await this.makeRequest<{ success: boolean }>(
			`/contractor-lists/${listId}/items/${contractorProfileId}`,
			{
				method: "DELETE",
			},
		);
		return response.success;
	}

	async toggleContractorFavorite(
		contractorProfileId: string,
	): Promise<{ added: boolean; listId: string }> {
		const response = await this.makeRequest<{
			success: boolean;
			data: { added: boolean; listId: string };
		}>("/contractor-lists/toggle-favorite", {
			method: "POST",
			body: JSON.stringify({ contractorProfileId }),
		});
		return response.data;
	}

	async getContractorFavorites(): Promise<{
		contractorIds: string[];
		contractors: ContractorProfile[];
	}> {
		const response = await this.makeRequest<{
			success: boolean;
			data: { contractorIds: string[]; contractors: ContractorProfile[] };
		}>("/contractor-lists/favorites");
		return response.data;
	}

	async checkContractorFavorites(
		contractorProfileIds: string[],
	): Promise<Record<string, { inLists: boolean; listIds: string[] }>> {
		const response = await this.makeRequest<{
			success: boolean;
			data: Record<string, { inLists: boolean; listIds: string[] }>;
		}>("/contractor-lists/check-favorites", {
			method: "POST",
			body: JSON.stringify({ contractorProfileIds }),
		});
		return response.data;
	}

	async ensureDefaultList(): Promise<ContractorList> {
		const response = await this.makeRequest<{
			success: boolean;
			data: ContractorList;
		}>("/contractor-lists/ensure-default", {
			method: "POST",
		});
		return response.data;
	}

	// Analytics methods for new enhanced features
	async getContractorPerformanceMetrics(
		contractorId: string,
		months?: number,
	): Promise<any> {
		if (!contractorId) {
			throw new Error("Contractor ID is required for performance metrics");
		}
		const params = months ? `?months=${months}` : "";
		return this.makeRequest(
			`/analytics/metrics/${encodeURIComponent(contractorId)}/monthly${params}`,
		);
	}

	async getContractorPeerComparison(
		contractorId: string,
		months?: number,
	): Promise<any> {
		if (!contractorId) {
			throw new Error("Contractor ID is required for peer comparison");
		}
		const params = months ? `?months=${months}` : "";
		return this.makeRequest(
			`/analytics/peer-comparison/${encodeURIComponent(contractorId)}${params}`,
		);
	}

	async getContractorNetwork(
		contractorId: string,
		limit?: number,
	): Promise<any> {
		if (!contractorId) {
			throw new Error("Contractor ID is required for network data");
		}
		const params = limit ? `?limit=${limit}` : "";
		return this.makeRequest(
			`/analytics/network/${encodeURIComponent(contractorId)}${params}`,
		);
	}

	async getIcebergOpportunities(params?: {
		limit?: number;
		minScore?: number;
		tier?: string;
		onlyWithPrime?: boolean;
	}): Promise<any> {
		const searchParams = new URLSearchParams();
		if (params?.limit) searchParams.set("limit", params.limit.toString());
		if (params?.minScore)
			searchParams.set("minScore", params.minScore.toString());
		if (params?.tier) searchParams.set("tier", params.tier);
		if (params?.onlyWithPrime !== undefined)
			searchParams.set("onlyWithPrime", params.onlyWithPrime.toString());

		const queryString = searchParams.toString();
		// Analytics endpoints return data directly, not wrapped in success/data
		return this.makeRequest(
			`/analytics/opportunities/iceberg${queryString ? `?${queryString}` : ""}`,
		);
	}

	async getPortfolioRiskAnalysis(portfolioId: string): Promise<any> {
		return this.makeRequest(
			`/analytics/portfolios/${portfolioId}/risk-analysis`,
		);
	}

	// Convenience method for raw GET requests
	async get(url: string): Promise<Response> {
		const fullUrl = `${this.baseUrl}${url}`;
		const headers = this.getAuthHeaders();

		return fetch(fullUrl, { headers });
	}
}

// Contractor types
interface ContractorData {
	id: string;
	contractorUei: string;
	contractorName: string;
	primaryAgency: string | null;
	primarySubAgencyCode: string | null;
	country: string | null;
	state: string | null;
	city: string | null;
	zipCode: string | null;
	primaryNaicsCode: string | null;
	primaryNaicsDescription: string | null;
	industryCluster: string | null;
	lifecycleStage: string | null;
	sizeTier: string | null;
	sizeQuartile: string | null;
	peerGroupRefined: string | null;
	totalContracts: number;
	totalObligated: string;
	agencyDiversity: number;
	sourceLastUpdated: string | null;
	cacheCreatedAt: string;
	cacheUpdatedAt: string;
	isActive: boolean;
	syncStatus: string;
}

interface ContractorQueryResult {
	success: boolean;
	data: ContractorData[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
	aggregations?: {
		totalObligated: string;
		averageContracts: number;
		uniqueAgencies: number;
		uniqueStates: number;
	};
}

interface FilterOptions {
	states: string[];
	agencies: string[];
	industryClusters: string[];
	lifecycleStages: string[];
	sizeTiers: string[];
	sizeQuartiles: string[];
}

interface ContractorStatistics {
	totalContractors: number;
	totalObligated: string;
	averageObligated: string;
	totalContracts: number;
	averageContracts: number;
	topStates: Array<{ state: string; count: number }>;
	topAgencies: Array<{ agency: string; count: number }>;
	topIndustries: Array<{ industry: string; count: number }>;
}

// Contractor Profile types
interface ContractorProfile {
	id: string;
	canonicalName: string;
	displayName: string;
	totalUeis: number;
	totalContracts: number;
	totalObligated: string;
	avgContractValue: string;
	primaryAgency: string | null;
	totalAgencies: number;
	agencyDiversity: number;
	headquartersState: string | null;
	totalStates: number;
	statesList: string[];
	primaryNaicsCode: string | null;
	primaryNaicsDescription: string | null;
	primaryIndustryCluster: string | null;
	industryClusters: string[];
	dominantSizeTier: string | null;
	dominantLifecycleStage: string | null;
	performanceScore: number | null;
	riskScore: number | null;
	growthTrend: string | null;
	isActive: boolean;
	profileCompleteness: number;
	profileCreatedAt: string;
	profileUpdatedAt: string;
}

interface ContractorProfileQueryResult {
	success: boolean;
	data: ContractorProfile[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
	aggregations?: {
		totalObligated: string;
		averageContracts: number;
		uniqueAgencies: number;
		uniqueStates: number;
	};
}

interface ContractorProfileDetail {
	profile: ContractorProfile;
	ueis: Array<{
		id: string;
		uei: string;
		contractorName: string;
		totalContracts: number;
		totalObligated: string;
		primaryAgency: string | null;
		state: string | null;
	}>;
	agencies: Array<{
		id: string;
		agency: string;
		totalContracts: number;
		totalObligated: string;
		totalUeis: number;
		relationshipStrength: string | null;
		isPrimary: boolean;
	}>;
}

interface ProfileFilterOptions {
	states: string[];
	agencies: string[];
	industryClusters: string[];
	sizeTiers: string[];
	lifecycleStages: string[];
}

// Contractor List types
interface ContractorList {
	id: string;
	userId: string;
	name: string;
	description: string | null;
	isDefault: boolean;
	isPublic: boolean;
	color: string | null;
	icon: string | null;
	sortOrder: number;
	itemCount: number;
	totalValue: string;
	lastItemAddedAt: string | null;
	settings: {
		notifications?: boolean;
		autoUpdate?: boolean;
		defaultView?: "grid" | "table";
	};
	createdAt: string;
	updatedAt: string;
}

interface ContractorListItem {
	id: string;
	listId: string;
	contractorProfileId: string;
	notes: string | null;
	tags: string[];
	rating: number | null;
	priority: string | null;
	addedBy: string;
	addedAt: string;
	lastViewedAt: string | null;
	viewCount: number;
	customData: any;
}

interface ContractorListWithItems {
	list: ContractorList;
	items: Array<ContractorListItem & { contractor: ContractorProfile }>;
}

export const apiClient = new ApiClient();
export { config };
export type {
	User,
	AuthResponse,
	ContractorData,
	ContractorQueryResult,
	FilterOptions,
	ContractorStatistics,
	ContractorProfile,
	ContractorProfileQueryResult,
	ContractorProfileDetail,
	ProfileFilterOptions,
	ContractorList,
	ContractorListItem,
	ContractorListWithItems,
};
