/**
 * Contractor Detail Data Orchestration Service
 *
 * Centralized data management for contractor detail views, coordinating between
 * multiple data sources and providing a unified interface for contractor information.
 */

import { largeDataCache } from "../../../services/caching/large-data-cache";
import { contractorLogoService } from "../../../services/contractors/contractor-logo-service";
import { icebergReader } from "../../../services/data-sources/iceberg-reader";
import { snowflakeApi } from "../../../services/data-sources/snowflake-api";
import type { Contractor } from "../../../types";

export interface ContractorDetailData {
	contractor: Contractor;
	performanceData: ContractorPerformanceData;
	networkData: ContractorNetworkData;
	activityData: ContractorActivityData;
	contactData: ContractorContactData;
	logoUrl: string | null;
}

export interface ContractorPerformanceData {
	summary: {
		totalRevenue: number;
		totalAwards: number;
		activeContracts: number;
		pipelineValue: number;
	};
	scores: {
		composite: number;
		awards: number;
		revenue: number;
		pipeline: number;
		duration: number;
		growth: number;
	};
	metrics: Array<{
		monthYear: string;
		monthlyRevenue: string;
	}>;
	benchmarks?: {
		industryAverage: number;
		sizeClassAverage: number;
		regionAverage: number;
	};
}

export interface ContractorNetworkData {
	relationships: {
		asSubcontractor: {
			totalValue: number;
			partners: Array<{
				primeUei: string;
				primeName: string;
				sharedRevenue: number;
				sharedContracts: number;
				strengthScore: number;
			}>;
		};
		asPrime: {
			totalValue: number;
			partners: Array<{
				subUei: string;
				subName: string;
				sharedRevenue: number;
				sharedContracts: number;
				strengthScore: number;
			}>;
		};
	};
}

export interface ContractorActivityData {
	recentAwards: Array<{
		awardId: string;
		title: string;
		amount: number;
		awardDate: string;
		agency: string;
		type: "prime" | "sub";
	}>;
	contractHistory: Array<{
		contractId: string;
		title: string;
		value: number;
		startDate: string;
		endDate?: string;
		status: "active" | "completed" | "cancelled";
	}>;
	timeline: Array<{
		date: string;
		event: string;
		description: string;
		value?: number;
	}>;
}

export interface ContractorContactData {
	primaryContacts: Array<{
		name: string;
		title: string;
		email?: string;
		phone?: string;
		department?: string;
		verified: boolean;
	}>;
	officeLocations: Array<{
		type: "headquarters" | "branch" | "project";
		address: string;
		city: string;
		state: string;
		zipCode?: string;
		phone?: string;
	}>;
	socialMedia: {
		website?: string;
		linkedin?: string;
		twitter?: string;
	};
}

class ContractorDataOrchestrator {
	private cache = largeDataCache;

	/**
	 * Get complete contractor detail data
	 */
	async getContractorDetail(
		contractorId: string,
	): Promise<ContractorDetailData> {
		const cacheKey = `contractor-detail:${contractorId}`;
		const cached = this.cache.get<ContractorDetailData>(cacheKey);
		if (cached) return cached;

		// Load all data in parallel for performance
		const [
			contractor,
			performanceData,
			networkData,
			activityData,
			contactData,
			logoResponse,
		] = await Promise.all([
			this.getContractorInfo(contractorId),
			this.getPerformanceData(contractorId),
			this.getNetworkData(contractorId),
			this.getActivityData(contractorId),
			this.getContactData(contractorId),
			this.getContractorLogo(contractorId),
		]);

		const result: ContractorDetailData = {
			contractor,
			performanceData,
			networkData,
			activityData,
			contactData,
			logoUrl: logoResponse,
		};

		// Cache for 30 minutes
		this.cache.set(cacheKey, result, 30);
		return result;
	}

	/**
	 * Get contractor basic information
	 */
	async getContractorInfo(contractorId: string): Promise<Contractor> {
		const cacheKey = `contractor-info:${contractorId}`;
		const cached = this.cache.get<Contractor>(cacheKey);
		if (cached) return cached;

		try {
			// Try Iceberg first for materialized contractor data
			const icebergData =
				await icebergReader.getContractorSummary(contractorId);
			if (icebergData) {
				this.cache.set(cacheKey, icebergData, 60);
				return icebergData;
			}

			// Fallback to Snowflake for real-time data
			const snowflakeData = await snowflakeApi.getContractor(contractorId);
			if (snowflakeData) {
				this.cache.set(cacheKey, snowflakeData, 30);
				return snowflakeData;
			}
		} catch (error) {
			console.warn(
				"Failed to load contractor info from APIs, using mock data:",
				error,
			);
		}

		// Fallback to mock data for development
		const mockContractor = this.getMockContractor(contractorId);
		this.cache.set(cacheKey, mockContractor, 5);
		return mockContractor;
	}

	/**
	 * Get contractor performance data
	 */
	async getPerformanceData(
		contractorId: string,
	): Promise<ContractorPerformanceData> {
		const cacheKey = `contractor-performance:${contractorId}`;
		const cached = this.cache.get<ContractorPerformanceData>(cacheKey);
		if (cached) return cached;

		try {
			// Load performance metrics from Iceberg
			const metricsData = await icebergReader.getPerformanceMetrics([
				contractorId,
			]);
			if (metricsData.data.length > 0) {
				const performanceData = this.transformPerformanceData(
					metricsData.data[0],
				);
				this.cache.set(cacheKey, performanceData, 60);
				return performanceData;
			}
		} catch (error) {
			console.warn("Failed to load performance data, using mock data:", error);
		}

		// Fallback to mock data
		const mockData = this.getMockPerformanceData(contractorId);
		this.cache.set(cacheKey, mockData, 5);
		return mockData;
	}

	/**
	 * Get contractor network/relationship data
	 */
	async getNetworkData(contractorId: string): Promise<ContractorNetworkData> {
		const cacheKey = `contractor-network:${contractorId}`;
		const cached = this.cache.get<ContractorNetworkData>(cacheKey);
		if (cached) return cached;

		try {
			// Load network data from Snowflake (real-time relationships)
			const networkData =
				await snowflakeApi.getContractorNetworks(contractorId);
			if (networkData) {
				this.cache.set(cacheKey, networkData, 30);
				return networkData;
			}
		} catch (error) {
			console.warn("Failed to load network data, using mock data:", error);
		}

		// Fallback to mock data
		const mockData = this.getMockNetworkData(contractorId);
		this.cache.set(cacheKey, mockData, 5);
		return mockData;
	}

	/**
	 * Get contractor activity data
	 */
	async getActivityData(contractorId: string): Promise<ContractorActivityData> {
		const cacheKey = `contractor-activity:${contractorId}`;
		const cached = this.cache.get<ContractorActivityData>(cacheKey);
		if (cached) return cached;

		try {
			// Load recent contract activity from Iceberg
			const contractEvents = await icebergReader.getContractEvents(
				{ contractor_uei: contractorId },
				{ limit: 100, offset: 0 },
			);

			if (contractEvents.data.length > 0) {
				const activityData = this.transformActivityData(contractEvents.data);
				this.cache.set(cacheKey, activityData, 30);
				return activityData;
			}
		} catch (error) {
			console.warn("Failed to load activity data, using mock data:", error);
		}

		// Fallback to mock data
		const mockData = this.getMockActivityData(contractorId);
		this.cache.set(cacheKey, mockData, 5);
		return mockData;
	}

	/**
	 * Get contractor contact information
	 */
	async getContactData(contractorId: string): Promise<ContractorContactData> {
		const cacheKey = `contractor-contacts:${contractorId}`;
		const cached = this.cache.get<ContractorContactData>(cacheKey);
		if (cached) return cached;

		try {
			// Contact data would come from contact integration services
			// This is a placeholder for future implementation
			const contactData = await this.loadContactData(contractorId);
			if (contactData) {
				this.cache.set(cacheKey, contactData, 120); // Cache longer for contact data
				return contactData;
			}
		} catch (error) {
			console.warn("Failed to load contact data, using mock data:", error);
		}

		// Fallback to mock data
		const mockData = this.getMockContactData(contractorId);
		this.cache.set(cacheKey, mockData, 5);
		return mockData;
	}

	/**
	 * Get contractor logo
	 */
	async getContractorLogo(contractorId: string): Promise<string | null> {
		try {
			const contractor = await this.getContractorInfo(contractorId);
			const logoResponse = await contractorLogoService.getContractorLogo(
				contractor.uei || contractorId,
				contractor.name,
			);
			return logoResponse.logoUrl;
		} catch (error) {
			console.warn("Failed to load contractor logo:", error);
			return null;
		}
	}

	/**
	 * Invalidate cache for specific contractor
	 */
	invalidateContractor(contractorId: string): void {
		this.cache.delete(`contractor-detail:${contractorId}`);
		this.cache.delete(`contractor-info:${contractorId}`);
		this.cache.delete(`contractor-performance:${contractorId}`);
		this.cache.delete(`contractor-network:${contractorId}`);
		this.cache.delete(`contractor-activity:${contractorId}`);
		this.cache.delete(`contractor-contacts:${contractorId}`);
	}

	/**
	 * Private: Transform API performance data to our format
	 */
	private transformPerformanceData(rawData: any): ContractorPerformanceData {
		// Transform raw API data to our standardized format
		return {
			summary: {
				totalRevenue: rawData.total_revenue || 0,
				totalAwards: rawData.total_awards || 0,
				activeContracts: rawData.active_contracts || 0,
				pipelineValue: rawData.pipeline_value || 0,
			},
			scores: {
				composite: rawData.composite_score || 0,
				awards: rawData.awards_score || 0,
				revenue: rawData.revenue_score || 0,
				pipeline: rawData.pipeline_score || 0,
				duration: rawData.duration_score || 0,
				growth: rawData.growth_score || 0,
			},
			metrics: rawData.monthly_metrics || [],
		};
	}

	/**
	 * Private: Transform API activity data to our format
	 */
	private transformActivityData(rawData: any[]): ContractorActivityData {
		return {
			recentAwards: rawData
				.filter((item) => item.event_type === "award")
				.map((item) => ({
					awardId: item.award_id,
					title: item.title,
					amount: item.amount,
					awardDate: item.date,
					agency: item.agency,
					type: item.contractor_type,
				})),
			contractHistory: rawData
				.filter((item) => item.event_type === "contract")
				.map((item) => ({
					contractId: item.contract_id,
					title: item.title,
					value: item.value,
					startDate: item.start_date,
					endDate: item.end_date,
					status: item.status,
				})),
			timeline: rawData.map((item) => ({
				date: item.date,
				event: item.event_type,
				description: item.description,
				value: item.amount || item.value,
			})),
		};
	}

	/**
	 * Private: Load contact data (placeholder for future implementation)
	 */
	private async loadContactData(
		contractorId: string,
	): Promise<ContractorContactData | null> {
		// This would integrate with contact services like Apollo, Lusha, etc.
		// For now, return null to use mock data
		return null;
	}

	/**
	 * Private: Mock contractor data for development
	 */
	private getMockContractor(contractorId: string): Contractor {
		return {
			id: contractorId,
			name: "Trio Fabrication LLC",
			uei: "TFL123456789",
			industry: "manufacturing",
			primaryAgency: "Defense",
			state: "DC",
			city: "Washington",
			establishedDate: new Date("2010-01-01"),
			primaryNaicsDescription: "Fabricated Plate Work Manufacturing",
			website: "www.triofabrication.com",
			totalContractValue: 50000000,
		};
	}

	/**
	 * Private: Mock performance data for development
	 */
	private getMockPerformanceData(
		contractorId: string,
	): ContractorPerformanceData {
		return {
			summary: {
				totalRevenue: 50000000,
				totalAwards: 92,
				activeContracts: 15,
				pipelineValue: 75000000,
			},
			scores: {
				composite: 80,
				awards: 82,
				revenue: 85,
				pipeline: 75,
				duration: 78,
				growth: 79,
			},
			metrics: [
				{ monthYear: "2023-10", monthlyRevenue: "4100000" },
				{ monthYear: "2023-11", monthlyRevenue: "4400000" },
				{ monthYear: "2023-12", monthlyRevenue: "4300000" },
				{ monthYear: "2024-01", monthlyRevenue: "4200000" },
				{ monthYear: "2024-02", monthlyRevenue: "3800000" },
				{ monthYear: "2024-03", monthlyRevenue: "5100000" },
				{ monthYear: "2024-04", monthlyRevenue: "4600000" },
				{ monthYear: "2024-05", monthlyRevenue: "4900000" },
				{ monthYear: "2024-06", monthlyRevenue: "5300000" },
				{ monthYear: "2024-07", monthlyRevenue: "4700000" },
				{ monthYear: "2024-08", monthlyRevenue: "5200000" },
				{ monthYear: "2024-09", monthlyRevenue: "4800000" },
				{ monthYear: "2024-10", monthlyRevenue: "5100000" },
				{ monthYear: "2024-11", monthlyRevenue: "5400000" },
			],
		};
	}

	/**
	 * Private: Mock network data for development
	 */
	private getMockNetworkData(contractorId: string): ContractorNetworkData {
		return {
			relationships: {
				asSubcontractor: {
					totalValue: 380000000,
					partners: [
						{
							primeUei: "MEGA001",
							primeName: "MegaCorp Industries",
							sharedRevenue: 200000000,
							sharedContracts: 45,
							strengthScore: 85,
						},
						{
							primeUei: "GLOBAL001",
							primeName: "Global Defense Systems",
							sharedRevenue: 180000000,
							sharedContracts: 46,
							strengthScore: 78,
						},
					],
				},
				asPrime: {
					totalValue: 29000000,
					partners: [
						{
							subUei: "TEX001",
							subName: "Texas Materials Inc",
							sharedRevenue: 15000000,
							sharedContracts: 12,
							strengthScore: 72,
						},
						{
							subUei: "OK001",
							subName: "Oklahoma Precision",
							sharedRevenue: 8000000,
							sharedContracts: 8,
							strengthScore: 68,
						},
						{
							subUei: "MT001",
							subName: "Montana Coatings LLC",
							sharedRevenue: 6000000,
							sharedContracts: 5,
							strengthScore: 65,
						},
					],
				},
			},
		};
	}

	/**
	 * Private: Mock activity data for development
	 */
	private getMockActivityData(contractorId: string): ContractorActivityData {
		return {
			recentAwards: [
				{
					awardId: "W9133L-24-C-0001",
					title: "Structural Steel Manufacturing",
					amount: 12500000,
					awardDate: "2024-01-15",
					agency: "Department of Defense",
					type: "prime",
				},
			],
			contractHistory: [
				{
					contractId: "W9133L-23-C-0012",
					title: "Advanced Materials Production",
					value: 8700000,
					startDate: "2023-03-01",
					endDate: "2024-02-28",
					status: "completed",
				},
			],
			timeline: [
				{
					date: "2024-01-15",
					event: "Award Received",
					description: "Structural Steel Manufacturing Contract",
					value: 12500000,
				},
			],
		};
	}

	/**
	 * Private: Mock contact data for development
	 */
	private getMockContactData(contractorId: string): ContractorContactData {
		return {
			primaryContacts: [
				{
					name: "John Smith",
					title: "Business Development Director",
					email: "j.smith@triofab.com",
					phone: "(202) 555-0123",
					department: "Business Development",
					verified: true,
				},
			],
			officeLocations: [
				{
					type: "headquarters",
					address: "1234 K Street NW",
					city: "Washington",
					state: "DC",
					zipCode: "20005",
					phone: "(202) 555-0100",
				},
			],
			socialMedia: {
				website: "www.triofabrication.com",
				linkedin: "https://linkedin.com/company/trio-fabrication",
			},
		};
	}
}

// Export singleton instance
export const contractorDataOrchestrator = new ContractorDataOrchestrator();

// Export types
export type {
	ContractorDetailData,
	ContractorPerformanceData,
	ContractorNetworkData,
	ContractorActivityData,
	ContractorContactData,
};
