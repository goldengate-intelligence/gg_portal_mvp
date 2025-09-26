/**
 * Portfolio Pinning Logic
 *
 * Handles asset pinning, unpinning, and pin order management.
 */

import type { GroupAsset, PortfolioAsset } from "../services/portfolio-data";

export interface PinnedAssetData {
	assetId: string;
	pinnedAt: string;
	pinOrder: number;
	type: "asset" | "group";
}

export interface PinningState {
	pinnedAssets: Set<string>;
	pinOrder: string[]; // Ordered list of asset IDs
	lastPinTime: string;
}

class PortfolioPinningLogic {
	private static readonly STORAGE_KEY = "portfolio_pinned_assets";
	private static readonly MAX_PINNED = 10; // Maximum pinned assets

	/**
	 * Load pinning state from storage
	 */
	loadPinningState(): PinningState {
		try {
			const stored = localStorage.getItem(PortfolioPinningLogic.STORAGE_KEY);
			if (!stored) {
				return this.getDefaultPinningState();
			}

			const parsed = JSON.parse(stored);
			return {
				pinnedAssets: new Set(parsed.pinnedAssets || []),
				pinOrder: parsed.pinOrder || [],
				lastPinTime: parsed.lastPinTime || new Date().toISOString(),
			};
		} catch (error) {
			console.error("Failed to load pinning state:", error);
			return this.getDefaultPinningState();
		}
	}

	/**
	 * Save pinning state to storage
	 */
	savePinningState(state: PinningState): void {
		try {
			const toStore = {
				pinnedAssets: Array.from(state.pinnedAssets),
				pinOrder: state.pinOrder,
				lastPinTime: state.lastPinTime,
			};

			localStorage.setItem(
				PortfolioPinningLogic.STORAGE_KEY,
				JSON.stringify(toStore),
			);
		} catch (error) {
			console.error("Failed to save pinning state:", error);
		}
	}

	/**
	 * Pin an asset
	 */
	pinAsset(
		currentState: PinningState,
		assetId: string,
		assetType: "asset" | "group" = "asset",
	): { success: boolean; newState: PinningState; message: string } {
		// Check if already pinned
		if (currentState.pinnedAssets.has(assetId)) {
			return {
				success: false,
				newState: currentState,
				message: "Asset is already pinned",
			};
		}

		// Check pin limit
		if (currentState.pinnedAssets.size >= PortfolioPinningLogic.MAX_PINNED) {
			return {
				success: false,
				newState: currentState,
				message: `Maximum of ${PortfolioPinningLogic.MAX_PINNED} assets can be pinned`,
			};
		}

		const newPinnedAssets = new Set(currentState.pinnedAssets);
		newPinnedAssets.add(assetId);

		const newPinOrder = [...currentState.pinOrder, assetId];

		const newState: PinningState = {
			pinnedAssets: newPinnedAssets,
			pinOrder: newPinOrder,
			lastPinTime: new Date().toISOString(),
		};

		this.savePinningState(newState);

		return {
			success: true,
			newState,
			message: `${assetType === "group" ? "Group" : "Asset"} pinned successfully`,
		};
	}

	/**
	 * Unpin an asset
	 */
	unpinAsset(
		currentState: PinningState,
		assetId: string,
	): { success: boolean; newState: PinningState; message: string } {
		// Check if actually pinned
		if (!currentState.pinnedAssets.has(assetId)) {
			return {
				success: false,
				newState: currentState,
				message: "Asset is not currently pinned",
			};
		}

		const newPinnedAssets = new Set(currentState.pinnedAssets);
		newPinnedAssets.delete(assetId);

		const newPinOrder = currentState.pinOrder.filter((id) => id !== assetId);

		const newState: PinningState = {
			pinnedAssets: newPinnedAssets,
			pinOrder: newPinOrder,
			lastPinTime: new Date().toISOString(),
		};

		this.savePinningState(newState);

		return {
			success: true,
			newState,
			message: "Asset unpinned successfully",
		};
	}

	/**
	 * Toggle pin state of an asset
	 */
	togglePin(
		currentState: PinningState,
		assetId: string,
		assetType: "asset" | "group" = "asset",
	): {
		success: boolean;
		newState: PinningState;
		message: string;
		isPinned: boolean;
	} {
		const isPinned = currentState.pinnedAssets.has(assetId);

		const result = isPinned
			? this.unpinAsset(currentState, assetId)
			: this.pinAsset(currentState, assetId, assetType);

		return {
			...result,
			isPinned: !isPinned,
		};
	}

	/**
	 * Reorder pinned assets
	 */
	reorderPinnedAssets(
		currentState: PinningState,
		newOrder: string[],
	): { success: boolean; newState: PinningState; message: string } {
		// Validate that all items in new order are actually pinned
		const invalidItems = newOrder.filter(
			(id) => !currentState.pinnedAssets.has(id),
		);
		if (invalidItems.length > 0) {
			return {
				success: false,
				newState: currentState,
				message: "Cannot reorder unpinned assets",
			};
		}

		// Validate that all pinned items are in the new order
		if (newOrder.length !== currentState.pinnedAssets.size) {
			return {
				success: false,
				newState: currentState,
				message: "New order must contain all pinned assets",
			};
		}

		const newState: PinningState = {
			...currentState,
			pinOrder: newOrder,
			lastPinTime: new Date().toISOString(),
		};

		this.savePinningState(newState);

		return {
			success: true,
			newState,
			message: "Pin order updated successfully",
		};
	}

	/**
	 * Sort assets with pinned items at the top
	 */
	sortWithPinnedFirst(
		assets: Array<PortfolioAsset | GroupAsset>,
		pinnedAssets: Set<string>,
		pinOrder: string[],
	): Array<PortfolioAsset | GroupAsset> {
		const pinned: Array<PortfolioAsset | GroupAsset> = [];
		const unpinned: Array<PortfolioAsset | GroupAsset> = [];

		// Separate pinned and unpinned assets
		assets.forEach((asset) => {
			if (pinnedAssets.has(asset.id)) {
				pinned.push(asset);
			} else {
				unpinned.push(asset);
			}
		});

		// Sort pinned assets by pin order
		pinned.sort((a, b) => {
			const aIndex = pinOrder.indexOf(a.id);
			const bIndex = pinOrder.indexOf(b.id);

			if (aIndex === -1 && bIndex === -1) return 0;
			if (aIndex === -1) return 1;
			if (bIndex === -1) return -1;

			return aIndex - bIndex;
		});

		// Sort unpinned assets by performance score (default sort)
		unpinned.sort((a, b) => {
			const aScore = this.getAssetScore(a);
			const bScore = this.getAssetScore(b);
			return bScore - aScore;
		});

		return [...pinned, ...unpinned];
	}

	/**
	 * Get pinned asset statistics
	 */
	getPinningStatistics(
		assets: Array<PortfolioAsset | GroupAsset>,
		pinnedAssets: Set<string>,
	): {
		totalPinned: number;
		maxPinned: number;
		canPinMore: boolean;
		remainingSlots: number;
		pinnedValue: string;
		pinnedPercentage: number;
	} {
		const totalPinned = pinnedAssets.size;
		const maxPinned = PortfolioPinningLogic.MAX_PINNED;
		const canPinMore = totalPinned < maxPinned;
		const remainingSlots = maxPinned - totalPinned;

		// Calculate value of pinned assets
		const pinnedAssetsList = assets.filter((asset) =>
			pinnedAssets.has(asset.id),
		);
		let totalPinnedValue = 0;
		let totalPortfolioValue = 0;

		assets.forEach((asset) => {
			const value = this.parseMoneyValue(asset.activeAwards.value);
			totalPortfolioValue += value;

			if (pinnedAssets.has(asset.id)) {
				totalPinnedValue += value;
			}
		});

		const pinnedPercentage =
			totalPortfolioValue > 0
				? (totalPinnedValue / totalPortfolioValue) * 100
				: 0;

		return {
			totalPinned,
			maxPinned,
			canPinMore,
			remainingSlots,
			pinnedValue: this.formatCurrency(totalPinnedValue),
			pinnedPercentage,
		};
	}

	/**
	 * Clear all pins
	 */
	clearAllPins(): PinningState {
		const newState = this.getDefaultPinningState();
		this.savePinningState(newState);
		return newState;
	}

	/**
	 * Get assets that are recommended for pinning
	 */
	getPinningRecommendations(
		assets: Array<PortfolioAsset | GroupAsset>,
		currentlyPinned: Set<string>,
		limit = 3,
	): Array<{
		asset: PortfolioAsset | GroupAsset;
		reason: string;
		confidence: number;
	}> {
		const unpinnedAssets = assets.filter(
			(asset) => !currentlyPinned.has(asset.id),
		);
		const recommendations: Array<{
			asset: PortfolioAsset | GroupAsset;
			reason: string;
			confidence: number;
		}> = [];

		unpinnedAssets.forEach((asset) => {
			const score = this.getAssetScore(asset);
			const value = this.parseMoneyValue(asset.activeAwards.value);

			// High performance assets
			if (score >= 85) {
				recommendations.push({
					asset,
					reason: `High performance score (${score.toFixed(1)})`,
					confidence: 0.9,
				});
			}

			// High value assets
			if (value >= 100000000) {
				// $100M+
				recommendations.push({
					asset,
					reason: `High contract value (${asset.activeAwards.value})`,
					confidence: 0.8,
				});
			}

			// Groups
			if ("type" in asset && asset.type === "group") {
				recommendations.push({
					asset,
					reason: `Asset group with ${asset.memberAssets.length} members`,
					confidence: 0.7,
				});
			}
		});

		return recommendations
			.sort((a, b) => b.confidence - a.confidence)
			.slice(0, limit);
	}

	/**
	 * Private: Get default pinning state
	 */
	private getDefaultPinningState(): PinningState {
		return {
			pinnedAssets: new Set<string>(),
			pinOrder: [],
			lastPinTime: new Date().toISOString(),
		};
	}

	/**
	 * Private: Get asset performance score
	 */
	private getAssetScore(asset: PortfolioAsset | GroupAsset): number {
		if ("type" in asset) {
			// For groups, use average of member scores
			const memberScores = asset.memberAssets.map(
				(member) => member.performanceScore,
			);
			return (
				memberScores.reduce((sum, score) => sum + score, 0) /
				memberScores.length
			);
		}

		return asset.performanceScore;
	}

	/**
	 * Private: Parse money value
	 */
	private parseMoneyValue(moneyStr: string): number {
		const cleaned = moneyStr.replace(/[^\d.-]/g, "");
		const value = Number.parseFloat(cleaned) || 0;

		if (moneyStr.includes("B")) return value * 1000000000;
		if (moneyStr.includes("M")) return value * 1000000;
		if (moneyStr.includes("K")) return value * 1000;

		return value;
	}

	/**
	 * Private: Format currency
	 */
	private formatCurrency(value: number): string {
		if (value >= 1000000000) {
			return `$${(value / 1000000000).toFixed(1)}B`;
		}
		if (value >= 1000000) {
			return `$${(value / 1000000).toFixed(1)}M`;
		}
		if (value >= 1000) {
			return `$${(value / 1000).toFixed(1)}K`;
		}
		return `$${value.toFixed(0)}`;
	}
}

// Export singleton instance
export const portfolioPinningLogic = new PortfolioPinningLogic();

export { PortfolioPinningLogic };
