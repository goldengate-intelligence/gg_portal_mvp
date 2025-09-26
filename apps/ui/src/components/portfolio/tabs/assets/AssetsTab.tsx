import type React from "react";
import { useState } from "react";
import { AssetCardNew } from "../../AssetCardNew";
import { GroupDetailView } from "../../GroupDetailView";
import { GroupNamingModal } from "../../GroupNamingModal";
import { DeleteConfirmationModal } from "../../components/DeleteConfirmationModal";
import { GroupDeleteModal } from "../../components/GroupDeleteModal";
import {
	getContractorMetrics,
	getContractorMetricsByName,
	getDefaultMetrics,
} from "../../services/contractor-metrics-adapter";

// Design Framework Components - Indigo Theme
const ExternalPanelContainer = ({
	children,
}: { children: React.ReactNode }) => (
	<div className="h-full border border-[#8B8EFF]/30 rounded-xl overflow-hidden shadow-2xl hover:border-[#8B8EFF]/50 hover:shadow-3xl hover:shadow-[#8B8EFF]/10 transition-all duration-500 group relative bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 backdrop-blur-sm">
		{/* Animated background grid */}
		<div className="absolute inset-0 opacity-5 z-0">
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: `
          linear-gradient(90deg, #8B8EFF 1px, transparent 1px),
          linear-gradient(180deg, #8B8EFF 1px, transparent 1px)
        `,
					backgroundSize: "15px 15px",
				}}
			/>
		</div>

		{/* Glow effect on hover */}
		<div
			className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-0"
			style={{ background: "linear-gradient(135deg, #8B8EFF20, transparent)" }}
		/>

		{children}
	</div>
);

// Chart-Style Container
// IMPORTANT: OFFICIAL GUNMETAL COLOR = #223040
const ChartStyleContainer = ({ children }: { children: React.ReactNode }) => (
	<div
		className="rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:shadow-[#223040]/20"
		style={{
			backgroundColor: "#223040",
		}}
	>
		{children}
	</div>
);

const InternalContentContainer = ({
	children,
}: { children: React.ReactNode }) => (
	<div className="p-4 h-full flex flex-col relative z-10">{children}</div>
);

const PanelTitle = ({ children }: { children: React.ReactNode }) => (
	<h3
		className="text-gray-200 font-normal uppercase tracking-wider"
		style={{
			fontFamily: "Genos, sans-serif",
			fontSize: "18px",
			letterSpacing: "0.0125em",
		}}
	>
		{children}
	</h3>
);

interface Asset {
	id: string;
	companyName: string;
	naicsDescription: string;
	marketType: "civilian" | "defense";
	uei: string;
	activeAwards: { value: string };
	isPinned?: boolean;
}

interface GroupAsset extends Asset {
	type: "group";
	groupName: string;
	memberAssets: Asset[];
	entityCount: number;
	aggregatedMetrics?: {
		lifetime: string;
		revenue: string;
		pipeline: string;
	};
}

interface PendingGroup {
	draggedAssetId: string;
	targetAssetId: string;
}

interface AssetsTabProps {
	assets: (Asset | GroupAsset)[];
	setAssets: React.Dispatch<React.SetStateAction<(Asset | GroupAsset)[]>>;
}

export function AssetsTab({ assets, setAssets }: AssetsTabProps) {
	const [pinnedAssets, setPinnedAssets] = useState<Set<string>>(new Set());
	const [pinOrder, setPinOrder] = useState<string[]>([]); // Track order of pinning
	const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set()); // Track expanded cards

	// Helper function to get consistent identifier for any asset
	const getAssetIdentifier = (asset: Asset | GroupAsset): string => {
		return "type" in asset && asset.type === "group" ? asset.id : asset.uei;
	};

	const [pendingGroup, setPendingGroup] = useState<PendingGroup | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [draggedAsset, setDraggedAsset] = useState<string | null>(null);
	const [selectedGroup, setSelectedGroup] = useState<GroupAsset | null>(null);
	const [insertionIndex, setInsertionIndex] = useState<number | null>(null);

	// Group deletion modal states
	const [showGroupDeleteOptions, setShowGroupDeleteOptions] = useState<
		string | null
	>(null);
	const [showGroupPortfolioDeleteConfirm, setShowGroupPortfolioDeleteConfirm] =
		useState<string | null>(null);

	// Helper functions for financial calculations
	const parseFinancialValue = (value: string): number => {
		const numStr = value.replace(/[$,]/g, "");
		const multiplier = value.includes("B")
			? 1000000000
			: value.includes("M")
				? 1000000
				: 1;
		return Number.parseFloat(numStr) * multiplier;
	};

	const formatFinancialValue = (value: number): string => {
		if (value >= 1000000000) {
			return `$${(value / 1000000000).toFixed(1)}B`;
		}
		if (value >= 1000000) {
			return `$${(value / 1000000).toFixed(0)}M`;
		}
		return `$${value.toLocaleString()}`;
	};

	const generateGroupAbbreviation = (groupName: string): string => {
		return groupName
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase())
			.join("")
			.slice(0, 3);
	};

	const getMemberMetrics = (asset: Asset) => {
		// First try to get metrics by UEI
		let contractorMetrics = getContractorMetrics(asset.uei);

		// If not found by UEI, try by company name
		if (!contractorMetrics) {
			contractorMetrics = getContractorMetricsByName(asset.companyName);
		}

		// If still not found, use default metrics
		if (!contractorMetrics) {
			contractorMetrics = getDefaultMetrics(asset.uei, asset.companyName);
		}

		return {
			revenue: contractorMetrics.revenue,
			lifetime: contractorMetrics.lifetimeAwards,
			pipeline: contractorMetrics.pipeline,
		};
	};

	const handleDragStart = (assetId: string) => {
		setDraggedAsset(assetId);
	};

	const handleDragEnd = () => {
		setDraggedAsset(null);
		setInsertionIndex(null);
	};

	const handleDrop = (targetId: string) => {
		if (!draggedAsset || draggedAsset === targetId) return;

		const draggedIndex = assets.findIndex((asset) => asset.id === draggedAsset);
		const targetIndex = assets.findIndex((asset) => asset.id === targetId);

		if (draggedIndex === -1 || targetIndex === -1) return;

		const newAssets = [...assets];
		const [draggedItem] = newAssets.splice(draggedIndex, 1);
		newAssets.splice(targetIndex, 0, draggedItem);

		setAssets(newAssets);
	};

	// Handle dropping between cards for reordering
	const handleInsertionDrop = (index: number) => {
		if (!draggedAsset) return;

		const draggedIndex = assets.findIndex((asset) => asset.id === draggedAsset);
		if (draggedIndex === -1) return;

		const newAssets = [...assets];
		const [draggedItem] = newAssets.splice(draggedIndex, 1);

		// Adjust insertion index if dragging forward
		const adjustedIndex = index > draggedIndex ? index - 1 : index;
		newAssets.splice(adjustedIndex, 0, draggedItem);

		setAssets(newAssets);
		setInsertionIndex(null);
	};

	// Handle drag over insertion zones
	const handleInsertionDragOver = (index: number) => {
		setInsertionIndex(index);
	};

	const handleInsertionDragLeave = () => {
		setInsertionIndex(null);
	};

	// Handle intelligent insertion hover based on mouse position within card
	const handleCardInsertionHover =
		(assetIndex: number) => (type: "before" | "after" | "group") => {
			if (type === "before") {
				setInsertionIndex(assetIndex);
			} else if (type === "after") {
				setInsertionIndex(assetIndex + 1);
			} else {
				setInsertionIndex(null); // Clear insertion, will show grouping
			}
		};

	// Handle intelligent insertion drop based on mouse position within card
	const handleCardInsertionDrop =
		(assetIndex: number) => (type: "before" | "after") => {
			if (type === "before") {
				handleInsertionDrop(assetIndex);
			} else if (type === "after") {
				handleInsertionDrop(assetIndex + 1);
			}
		};

	const handleGroupDrop = (draggedAssetId: string, targetAssetId: string) => {
		if (draggedAssetId === targetAssetId) return;

		// Search by both id and uei since drag/drop uses UEI but groups use different IDs
		const targetAsset = assets.find(
			(asset) => asset.id === targetAssetId || asset.uei === targetAssetId,
		);
		const draggedAsset = assets.find(
			(asset) => asset.id === draggedAssetId || asset.uei === draggedAssetId,
		);

		if (!targetAsset || !draggedAsset) {
			return;
		}

		// Check if target is already a group
		if ("type" in targetAsset && targetAsset.type === "group") {
			console.log("=== ADDING TO EXISTING GROUP ===");
			console.log("Target group:", targetAsset.id, targetAsset.companyName);
			console.log("Dragged asset:", draggedAsset.id, draggedAsset.companyName);
			console.log(
				"Current pinned assets before group modification:",
				Array.from(pinnedAssets),
			);

			// Check if dragged asset was pinned
			const draggedWasPinned =
				pinnedAssets.has(draggedAssetId) ||
				pinnedAssets.has(draggedAsset.uei) ||
				("type" in draggedAsset &&
					draggedAsset.type === "group" &&
					pinnedAssets.has(draggedAsset.id));

			console.log("Dragged asset pin status:", draggedWasPinned);

			// Add to existing group
			const updatedAssets = assets
				.map((asset) => {
					if (
						(asset.id === targetAssetId || asset.uei === targetAssetId) &&
						"type" in asset &&
						asset.type === "group"
					) {
						const newMemberAssets = [...asset.memberAssets];

						if ("type" in draggedAsset && draggedAsset.type === "group") {
							// Merging two groups - add all members from dragged group
							newMemberAssets.push(...draggedAsset.memberAssets);
						} else {
							// Adding single asset to group
							newMemberAssets.push(draggedAsset as Asset);
						}

						// Calculate aggregate values from all members
						const totalActiveAwards = newMemberAssets.reduce(
							(sum, memberAsset) =>
								sum + parseFinancialValue(memberAsset.activeAwards.value),
							0,
						);

						// Calculate other aggregate metrics
						const totalLifetime = newMemberAssets.reduce((sum, memberAsset) => {
							const memberMetrics = getMemberMetrics(memberAsset);
							return sum + parseFinancialValue(memberMetrics.lifetime);
						}, 0);

						const totalRevenue = newMemberAssets.reduce((sum, memberAsset) => {
							const memberMetrics = getMemberMetrics(memberAsset);
							return sum + parseFinancialValue(memberMetrics.revenue);
						}, 0);

						const totalPipeline = newMemberAssets.reduce((sum, memberAsset) => {
							const memberMetrics = getMemberMetrics(memberAsset);
							return sum + parseFinancialValue(memberMetrics.pipeline);
						}, 0);

						const updatedGroup = {
							...asset,
							memberAssets: newMemberAssets,
							entityCount: newMemberAssets.length,
							uei: `GROUP${newMemberAssets.length}`,
							activeAwards: { value: formatFinancialValue(totalActiveAwards) },
							aggregatedMetrics: {
								lifetime: formatFinancialValue(totalLifetime),
								revenue: formatFinancialValue(totalRevenue),
								pipeline: formatFinancialValue(totalPipeline),
							},
						};

						return updatedGroup;
					}
					return asset;
				})
				.filter(
					(asset) =>
						asset.id !== draggedAssetId && asset.uei !== draggedAssetId,
				); // Remove the dragged asset

			// Update pinned assets - remove dragged asset references
			const updatedPinnedAssets = new Set(pinnedAssets);
			let updatedPinOrder = [...pinOrder];

			// Remove dragged asset from pinned set and pin order
			updatedPinnedAssets.delete(draggedAssetId);
			updatedPinnedAssets.delete(draggedAsset.uei);
			if ("type" in draggedAsset && draggedAsset.type === "group") {
				updatedPinnedAssets.delete(draggedAsset.id);
			}

			updatedPinOrder = updatedPinOrder.filter(
				(id) =>
					id !== draggedAssetId &&
					id !== draggedAsset.uei &&
					!(
						"type" in draggedAsset &&
						draggedAsset.type === "group" &&
						id === draggedAsset.id
					),
			);

			// If dragged asset was pinned, ensure target group becomes/remains pinned and moves to most recent
			if (draggedWasPinned) {
				if (!updatedPinnedAssets.has(targetAsset.id)) {
					updatedPinnedAssets.add(targetAsset.id);
				}
				// Remove target from current position and add to end (most recent)
				updatedPinOrder = updatedPinOrder.filter((id) => id !== targetAsset.id);
				updatedPinOrder.push(targetAsset.id);
				console.log(
					"Ensuring target group becomes most recently pinned due to dragged asset pin status",
				);
			}

			setPinnedAssets(updatedPinnedAssets);
			setPinOrder(updatedPinOrder);
			console.log(
				"Updated pinned assets after group modification:",
				Array.from(updatedPinnedAssets),
			);
			console.log(
				"Updated pin order after group modification:",
				updatedPinOrder,
			);

			setAssets(updatedAssets);
			return; // Important: return here to prevent any fallback logic
		}
		// Create new group - show modal
		setPendingGroup({ draggedAssetId, targetAssetId });
		setIsModalOpen(true);
	};

	const handleGroupConfirm = (groupName: string) => {
		if (!pendingGroup) return;

		const { draggedAssetId, targetAssetId } = pendingGroup;
		const targetAsset = assets.find(
			(asset) => asset.id === targetAssetId,
		) as Asset;
		const draggedAsset = assets.find(
			(asset) => asset.id === draggedAssetId,
		) as Asset;

		if (!targetAsset || !draggedAsset) return;

		const memberAssets = [targetAsset, draggedAsset];
		const totalActiveAwards = memberAssets.reduce(
			(sum, asset) => sum + parseFinancialValue(asset.activeAwards.value),
			0,
		);

		// Calculate other aggregate metrics
		const totalLifetime = memberAssets.reduce((sum, asset) => {
			const metrics = getMemberMetrics(asset);
			return sum + parseFinancialValue(metrics.lifetime);
		}, 0);

		const totalRevenue = memberAssets.reduce((sum, asset) => {
			const metrics = getMemberMetrics(asset);
			return sum + parseFinancialValue(metrics.revenue);
		}, 0);

		const totalPipeline = memberAssets.reduce((sum, asset) => {
			const metrics = getMemberMetrics(asset);
			return sum + parseFinancialValue(metrics.pipeline);
		}, 0);

		const groupId = `group_${Date.now()}`;
		const newGroup: GroupAsset = {
			id: groupId,
			type: "group",
			companyName: groupName,
			groupName,
			naicsDescription: "Consolidated Asset Group",
			marketType: targetAsset.marketType,
			uei: `GROUP${memberAssets.length}`,
			activeAwards: { value: formatFinancialValue(totalActiveAwards) },
			memberAssets,
			entityCount: memberAssets.length,
			aggregatedMetrics: {
				lifetime: formatFinancialValue(totalLifetime),
				revenue: formatFinancialValue(totalRevenue),
				pipeline: formatFinancialValue(totalPipeline),
			},
		};

		console.log("=== GROUP CREATION ===");
		console.log("Creating group from assets:", {
			targetAssetId,
			draggedAssetId,
		});
		console.log(
			"Current pinned assets before group creation:",
			Array.from(pinnedAssets),
		);

		// Check if any of the original assets were pinned
		const targetWasPinned =
			pinnedAssets.has(targetAssetId) || pinnedAssets.has(targetAsset.uei);
		const draggedWasPinned =
			pinnedAssets.has(draggedAssetId) || pinnedAssets.has(draggedAsset.uei);

		console.log("Pin status check:", { targetWasPinned, draggedWasPinned });

		// Update pinned assets - remove old asset IDs and add group ID if any member was pinned
		const updatedPinnedAssets = new Set(pinnedAssets);
		let updatedPinOrder = [...pinOrder];

		// Remove old asset identifiers from pinned set and pin order
		updatedPinnedAssets.delete(targetAssetId);
		updatedPinnedAssets.delete(targetAsset.uei);
		updatedPinnedAssets.delete(draggedAssetId);
		updatedPinnedAssets.delete(draggedAsset.uei);

		updatedPinOrder = updatedPinOrder.filter(
			(id) =>
				id !== targetAssetId &&
				id !== targetAsset.uei &&
				id !== draggedAssetId &&
				id !== draggedAsset.uei,
		);

		if (targetWasPinned || draggedWasPinned) {
			updatedPinnedAssets.add(groupId);
			updatedPinOrder.push(groupId); // Add to end (most recent)
			console.log("Group inherits pin status, adding:", groupId);
		}

		setPinnedAssets(updatedPinnedAssets);
		setPinOrder(updatedPinOrder);
		console.log(
			"Updated pinned assets after group creation:",
			Array.from(updatedPinnedAssets),
		);
		console.log("Updated pin order after group creation:", updatedPinOrder);

		// Replace both assets with the new group at the target asset's position
		const newAssets = assets
			.map((asset) => {
				if (asset.id === targetAssetId) {
					return newGroup; // Replace target asset with the group
				}
				if (asset.id === draggedAssetId) {
					return null; // Mark dragged asset for removal
				}
				return asset;
			})
			.filter(Boolean) as (Asset | GroupAsset)[];

		setAssets(newAssets);
		setIsModalOpen(false);
		setPendingGroup(null);
	};

	const handleModalClose = () => {
		setIsModalOpen(false);
		setPendingGroup(null);
	};

	const getDefaultGroupName = () => {
		if (!pendingGroup) return "";
		const targetAsset = assets.find(
			(asset) => asset.id === pendingGroup.targetAssetId,
		);
		return targetAsset
			? `${targetAsset.companyName.split(" ")[0]} Group`
			: "New Group";
	};

	const handleGroupClick = (group: GroupAsset) => {
		setSelectedGroup(group);
	};

	const handleBackFromGroup = () => {
		setSelectedGroup(null);
	};

	const handleRemoveGroupMember = (memberUei: string) => {
		if (!selectedGroup) return;

		// Find the removed member to add back to individual assets
		const removedMember = selectedGroup.memberAssets.find(
			(member) => member.uei === memberUei,
		);
		if (!removedMember) return;

		const updatedGroup = {
			...selectedGroup,
			memberAssets: selectedGroup.memberAssets.filter(
				(member) => member.uei !== memberUei,
			),
		};

		// If only one member left, dissolve the group and return the remaining member to individual assets
		if (updatedGroup.memberAssets.length === 1) {
			const remainingMember = updatedGroup.memberAssets[0];
			const updatedAssets = assets
				.filter((asset) => asset.id !== selectedGroup.id)
				.concat([remainingMember, removedMember]);

			setAssets(updatedAssets);
			setSelectedGroup(null);
		} else {
			// Update the group with recalculated metrics
			const totalActiveAwards = updatedGroup.memberAssets.reduce(
				(sum, member) => sum + parseFinancialValue(member.activeAwards.value),
				0,
			);

			const totalLifetime = updatedGroup.memberAssets.reduce((sum, member) => {
				const metrics = getMemberMetrics(member);
				return sum + parseFinancialValue(metrics.lifetime);
			}, 0);

			const totalRevenue = updatedGroup.memberAssets.reduce((sum, member) => {
				const metrics = getMemberMetrics(member);
				return sum + parseFinancialValue(metrics.revenue);
			}, 0);

			const totalPipeline = updatedGroup.memberAssets.reduce((sum, member) => {
				const metrics = getMemberMetrics(member);
				return sum + parseFinancialValue(metrics.pipeline);
			}, 0);

			const recalculatedGroup: GroupAsset = {
				...updatedGroup,
				entityCount: updatedGroup.memberAssets.length,
				uei: `GROUP${updatedGroup.memberAssets.length}`,
				activeAwards: { value: formatFinancialValue(totalActiveAwards) },
				aggregatedMetrics: {
					lifetime: formatFinancialValue(totalLifetime),
					revenue: formatFinancialValue(totalRevenue),
					pipeline: formatFinancialValue(totalPipeline),
				},
			};

			// Update the group in the assets array and add the removed member back as individual asset
			const updatedAssets = assets
				.map((asset) =>
					asset.id === selectedGroup.id ? recalculatedGroup : asset,
				)
				.concat(removedMember);

			setAssets(updatedAssets);
			setSelectedGroup(recalculatedGroup);
		}
	};

	const handleUpdateGroup = (updatedGroup: GroupAsset) => {
		const updatedAssets = assets.map((asset) =>
			asset.id === updatedGroup.id ? updatedGroup : asset,
		);
		setAssets(updatedAssets);
		setSelectedGroup(updatedGroup);
	};

	const handleRemoveAsset = (assetId: string) => {
		setAssets(assets.filter((asset) => asset.id !== assetId));
	};

	const handleDeleteFromPortfolio = (memberUei: string) => {
		// Remove the asset from the entire portfolio by UEI
		setAssets(
			assets.filter((asset) => {
				// For individual assets, check UEI
				if (!("type" in asset)) {
					return asset.uei !== memberUei;
				}
				// For groups, check if the UEI is in member assets and remove it
				if (asset.type === "group") {
					const updatedMemberAssets = asset.memberAssets.filter(
						(member) => member.uei !== memberUei,
					);
					// If group would have less than 2 members, dissolve it
					if (updatedMemberAssets.length < 2) {
						return false; // Remove the group entirely
					}
					// Otherwise, update the group's member assets
					asset.memberAssets = updatedMemberAssets;
					asset.entityCount = updatedMemberAssets.length;
				}
				return true;
			}),
		);
	};

	// Group deletion modal handlers
	const handleGroupRemoveOnly = (memberUei: string) => {
		setShowGroupDeleteOptions(null);
		if (selectedGroup) {
			handleRemoveGroupMember(memberUei);
		}
	};

	const handleGroupDeleteFromPortfolio = (memberUei: string) => {
		setShowGroupDeleteOptions(null);
		setShowGroupPortfolioDeleteConfirm(memberUei);
	};

	const handleGroupPortfolioConfirm = (memberUei: string) => {
		setShowGroupPortfolioDeleteConfirm(null);
		// Remove from group first
		handleRemoveGroupMember(memberUei);
		// Then delete from entire portfolio
		handleDeleteFromPortfolio(memberUei);
	};

	const getCompanyNameByUei = (uei: string): string => {
		if (!selectedGroup) return "";
		const member = selectedGroup.memberAssets.find((m) => m.uei === uei);
		return member?.companyName || "";
	};

	// Group rename handler
	const handleGroupRename = (assetId: string, newName: string) => {
		setAssets((prevAssets) =>
			prevAssets.map((asset) => {
				if (asset.id === assetId && "type" in asset && asset.type === "group") {
					return {
						...asset,
						companyName: newName,
						groupName: newName,
					};
				}
				return asset;
			}),
		);
	};

	const handlePin = (uei: string) => {
		console.log("=== PIN OPERATION START ===");
		console.log("UEI to pin:", uei);
		console.log("Current pinned assets before:", Array.from(pinnedAssets));
		console.log("Current pin order before:", pinOrder);

		// Find the asset by UEI (this works for both individual assets and groups)
		const asset = assets.find((a) => a.uei === uei);

		if (!asset) {
			console.error("Asset not found for UEI:", uei);
			return;
		}

		// Use the consistent identifier
		const assetIdentifier = getAssetIdentifier(asset);
		console.log("Asset found:", {
			uei,
			assetType: "type" in asset ? asset.type : "individual",
			identifier: assetIdentifier,
			currentlyPinned: pinnedAssets.has(assetIdentifier),
			assetId: asset.id,
		});

		const newPinnedAssets = new Set(pinnedAssets);
		let newPinOrder = [...pinOrder];

		if (pinnedAssets.has(assetIdentifier)) {
			// Unpin the asset
			console.log("UNPINNING asset:", assetIdentifier);
			newPinnedAssets.delete(assetIdentifier);
			newPinOrder = newPinOrder.filter((id) => id !== assetIdentifier);
		} else {
			// Pin the asset - add to end of order (most recent)
			console.log("PINNING asset:", assetIdentifier);
			newPinnedAssets.add(assetIdentifier);
			newPinOrder.push(assetIdentifier);
		}

		console.log(
			"New pinned assets after operation:",
			Array.from(newPinnedAssets),
		);
		console.log("New pin order after operation:", newPinOrder);

		setPinnedAssets(newPinnedAssets);
		setPinOrder(newPinOrder);

		// Update the asset's pinned status in the assets array
		setAssets((prev) => {
			const updated = prev.map((currentAsset) => {
				const currentIdentifier = getAssetIdentifier(currentAsset);
				const shouldBePinned = newPinnedAssets.has(currentIdentifier);
				return {
					...currentAsset,
					isPinned: shouldBePinned,
				};
			});

			console.log(
				"Updated assets with pin status:",
				updated.map((a) => ({
					id: a.id,
					uei: a.uei,
					type: "type" in a ? a.type : "individual",
					isPinned: a.isPinned,
					identifier: getAssetIdentifier(a),
				})),
			);

			return updated;
		});

		console.log("=== PIN OPERATION END ===");
	};

	const handleToggleExpanded = (assetId: string) => {
		setExpandedAssets((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(assetId)) {
				newSet.delete(assetId);
			} else {
				newSet.add(assetId);
			}
			return newSet;
		});
	};

	// Sort assets: most recently pinned first, then other pinned, then unpinned
	const sortedAssets = [...assets].sort((a, b) => {
		const aIdentifier = getAssetIdentifier(a);
		const bIdentifier = getAssetIdentifier(b);

		const aIsPinned = pinnedAssets.has(aIdentifier);
		const bIsPinned = pinnedAssets.has(bIdentifier);

		// Get pin order positions (higher index = more recent)
		const aPinIndex = pinOrder.indexOf(aIdentifier);
		const bPinIndex = pinOrder.indexOf(bIdentifier);

		console.log("Sorting comparison:", {
			a: {
				name: a.companyName,
				identifier: aIdentifier,
				isPinned: aIsPinned,
				pinIndex: aPinIndex,
			},
			b: {
				name: b.companyName,
				identifier: bIdentifier,
				isPinned: bIsPinned,
				pinIndex: bPinIndex,
			},
		});

		// If both are pinned, sort by pin order (most recent first)
		if (aIsPinned && bIsPinned) {
			return bPinIndex - aPinIndex; // Higher index (more recent) comes first
		}

		// If only one is pinned, pinned comes first
		if (aIsPinned && !bIsPinned) return -1;
		if (!aIsPinned && bIsPinned) return 1;

		// If neither is pinned, maintain original order
		return 0;
	});

	// Debug: Log sorting results
	console.log("=== SORTING DEBUG ===");
	console.log("Pinned assets Set:", Array.from(pinnedAssets));
	console.log("Pin order array:", pinOrder);
	console.log(
		"All assets before sorting:",
		assets.map((a) => ({
			name: a.companyName,
			id: a.id,
			uei: a.uei,
			identifier: getAssetIdentifier(a),
			isPinned: pinnedAssets.has(getAssetIdentifier(a)),
			pinIndex: pinOrder.indexOf(getAssetIdentifier(a)),
			type: "type" in a ? a.type : "individual",
		})),
	);
	console.log(
		"Sorted assets order:",
		sortedAssets.map((a) => ({
			name: a.companyName,
			identifier: getAssetIdentifier(a),
			isPinned: pinnedAssets.has(getAssetIdentifier(a)),
			pinIndex: pinOrder.indexOf(getAssetIdentifier(a)),
			type: "type" in a ? a.type : "individual",
		})),
	);

	// If we're viewing a group detail, render that instead
	if (selectedGroup) {
		return (
			<>
				<GroupDetailView
					group={selectedGroup}
					onBack={handleBackFromGroup}
					onRemoveMember={handleRemoveGroupMember}
					onUpdateGroup={handleUpdateGroup}
					onDeleteFromPortfolio={handleDeleteFromPortfolio}
					showDeleteOptions={showGroupDeleteOptions}
					showPortfolioDeleteConfirm={showGroupPortfolioDeleteConfirm}
					onShowDeleteOptions={setShowGroupDeleteOptions}
					onCloseDeleteOptions={() => setShowGroupDeleteOptions(null)}
					onShowPortfolioDeleteConfirm={setShowGroupPortfolioDeleteConfirm}
					onClosePortfolioDeleteConfirm={() =>
						setShowGroupPortfolioDeleteConfirm(null)
					}
				/>

				{/* Group Delete Options Modal - Rendered at top level */}
				{showGroupDeleteOptions && (
					<GroupDeleteModal
						isOpen={true}
						companyName={getCompanyNameByUei(showGroupDeleteOptions)}
						onRemoveFromGroup={() =>
							handleGroupRemoveOnly(showGroupDeleteOptions)
						}
						onDeleteFromPortfolio={() =>
							handleGroupDeleteFromPortfolio(showGroupDeleteOptions)
						}
						onCancel={() => setShowGroupDeleteOptions(null)}
					/>
				)}

				{/* Portfolio Delete Confirmation Modal - Rendered at top level */}
				{showGroupPortfolioDeleteConfirm && (
					<DeleteConfirmationModal
						isOpen={true}
						companyName={getCompanyNameByUei(showGroupPortfolioDeleteConfirm)}
						onConfirm={() =>
							handleGroupPortfolioConfirm(showGroupPortfolioDeleteConfirm)
						}
						onCancel={() => setShowGroupPortfolioDeleteConfirm(null)}
					/>
				)}
			</>
		);
	}

	return (
		<div className="min-h-[500px] flex justify-center">
			<div className="w-full max-w-4xl">
				<div className="border border-[#8B8EFF]/30 rounded-xl hover:border-[#8B8EFF]/50 transition-all duration-500">
					<InternalContentContainer>
						{/* Content Section */}
						<div className="flex-1">
							{/* Chart-Style Container */}
							<ChartStyleContainer>
								{/* Chart Header */}
								<div className="relative h-full">
									{/* Title */}
									<div className="absolute top-0 left-0 z-10">
										<h3 className="font-sans text-xs uppercase tracking-wider text-gray-500">
											My Portfolio
										</h3>
									</div>

									{/* Live Indicator */}
									<div className="absolute top-0 right-0 z-10 flex items-center gap-2">
										<span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
										<span
											className="text-[10px] text-green-400 tracking-wider font-light"
											style={{ fontFamily: "Genos, sans-serif" }}
										>
											TRACKING
										</span>
									</div>

									{/* Content */}
									<div className="pt-8">
										<div className="grid grid-cols-1 gap-4">
											{sortedAssets.map((asset, index) => (
												<div
													key={asset.id}
													className="relative group transition-all duration-300 ease-in-out"
													style={{ animationDelay: `${index * 50}ms` }}
												>
													{/* Insertion line overlay - positioned absolutely */}
													{insertionIndex === index && (
														<div className="absolute -top-0.5 left-0 right-0 h-0.5 bg-[#D2AC38] z-30 animate-pulse shadow-lg shadow-[#D2AC38]/50 transition-all duration-300" />
													)}
													{insertionIndex === index + 1 && (
														<div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#D2AC38] z-30 animate-pulse shadow-lg shadow-[#D2AC38]/50 transition-all duration-300" />
													)}
													<AssetCardNew
														companyName={asset.companyName}
														naicsDescription={asset.naicsDescription}
														marketType={asset.marketType}
														uei={asset.uei}
														activeAwards={asset.activeAwards}
														onDragStart={() => handleDragStart(asset.id)}
														onDragEnd={handleDragEnd}
														onDrop={() => handleDrop(asset.id)}
														onGroupDrop={handleGroupDrop}
														isGrouped={
															"type" in asset && asset.type === "group"
														}
														groupMembers={
															"type" in asset && asset.type === "group"
																? asset.memberAssets.map((m) => m.id)
																: []
														}
														isPinned={pinnedAssets.has(
															getAssetIdentifier(asset),
														)}
														onPin={handlePin}
														aggregatedMetrics={
															"type" in asset && asset.type === "group"
																? (asset as GroupAsset).aggregatedMetrics
																: undefined
														}
														isExpanded={expandedAssets.has(
															getAssetIdentifier(asset),
														)}
														onGroupRename={
															"type" in asset && asset.type === "group"
																? (newName: string) =>
																		handleGroupRename(asset.id, newName)
																: undefined
														}
														onToggleExpanded={() =>
															handleToggleExpanded(getAssetIdentifier(asset))
														}
														onRemove={() => handleRemoveAsset(asset.id)}
														onInsertionHover={handleCardInsertionHover(index)}
														onInsertionDrop={handleCardInsertionDrop(index)}
														onClick={() => {
															if ("type" in asset && asset.type === "group") {
																handleGroupClick(asset);
															} else {
																window.location.href = `/platform/contractor-detail/${asset.uei}`;
															}
														}}
													/>
												</div>
											))}
										</div>
									</div>
								</div>
							</ChartStyleContainer>
						</div>
					</InternalContentContainer>
				</div>
			</div>

			{/* Group Naming Modal */}
			<GroupNamingModal
				isOpen={isModalOpen}
				onClose={handleModalClose}
				onConfirm={handleGroupConfirm}
				defaultName={getDefaultGroupName()}
			/>
		</div>
	);
}
