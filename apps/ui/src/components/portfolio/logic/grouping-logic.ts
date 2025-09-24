/**
 * Portfolio Grouping Logic
 *
 * Handles asset grouping, ungrouping, and group management operations.
 */

import { PortfolioAsset, GroupAsset } from '../services/portfolio-data';

export interface GroupingOperation {
  type: 'create' | 'add_to_existing' | 'remove_from_group' | 'rename_group' | 'delete_group';
  groupId?: string;
  assetIds: string[];
  newGroupName?: string;
}

export interface GroupingResult {
  success: boolean;
  updatedAssets: Array<PortfolioAsset | GroupAsset>;
  message: string;
  groupId?: string;
}

class PortfolioGroupingLogic {
  /**
   * Create a new group from selected assets
   */
  createGroup(
    assets: Array<PortfolioAsset | GroupAsset>,
    assetIds: string[],
    groupName: string
  ): GroupingResult {
    try {
      // Find assets to group (only individual assets, not existing groups)
      const assetsToGroup: PortfolioAsset[] = [];
      const remainingAssets: Array<PortfolioAsset | GroupAsset> = [];

      assets.forEach(asset => {
        if (assetIds.includes(asset.id) && !('type' in asset)) {
          assetsToGroup.push(asset as PortfolioAsset);
        } else {
          remainingAssets.push(asset);
        }
      });

      if (assetsToGroup.length < 2) {
        return {
          success: false,
          updatedAssets: assets,
          message: 'At least 2 assets are required to create a group'
        };
      }

      // Create group using portfolio data service
      const { portfolioDataService } = await import('../services/portfolio-data');
      const newGroup = portfolioDataService.createAssetGroup(assetsToGroup, groupName);

      return {
        success: true,
        updatedAssets: [...remainingAssets, newGroup],
        message: `Created group "${groupName}" with ${assetsToGroup.length} assets`,
        groupId: newGroup.id
      };

    } catch (error) {
      return {
        success: false,
        updatedAssets: assets,
        message: `Failed to create group: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Add assets to an existing group
   */
  addToExistingGroup(
    assets: Array<PortfolioAsset | GroupAsset>,
    assetIds: string[],
    targetGroupId: string
  ): GroupingResult {
    try {
      const assetsToAdd: PortfolioAsset[] = [];
      const remainingAssets: Array<PortfolioAsset | GroupAsset> = [];
      let targetGroup: GroupAsset | null = null;

      assets.forEach(asset => {
        if (asset.id === targetGroupId && 'type' in asset) {
          targetGroup = asset as GroupAsset;
        } else if (assetIds.includes(asset.id) && !('type' in asset)) {
          assetsToAdd.push(asset as PortfolioAsset);
        } else {
          remainingAssets.push(asset);
        }
      });

      if (!targetGroup) {
        return {
          success: false,
          updatedAssets: assets,
          message: 'Target group not found'
        };
      }

      if (assetsToAdd.length === 0) {
        return {
          success: false,
          updatedAssets: assets,
          message: 'No valid assets to add to group'
        };
      }

      // Update group with new members
      const { portfolioDataService } = await import('../services/portfolio-data');
      const updatedGroup = portfolioDataService.updateAssetGroup(targetGroup, {
        memberAssets: [...targetGroup.memberAssets, ...assetsToAdd]
      });

      return {
        success: true,
        updatedAssets: [...remainingAssets, updatedGroup],
        message: `Added ${assetsToAdd.length} asset(s) to group "${targetGroup.groupName}"`,
        groupId: targetGroup.id
      };

    } catch (error) {
      return {
        success: false,
        updatedAssets: assets,
        message: `Failed to add to group: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Remove assets from a group
   */
  removeFromGroup(
    assets: Array<PortfolioAsset | GroupAsset>,
    assetIds: string[],
    groupId: string
  ): GroupingResult {
    try {
      let targetGroup: GroupAsset | null = null;
      const otherAssets: Array<PortfolioAsset | GroupAsset> = [];

      assets.forEach(asset => {
        if (asset.id === groupId && 'type' in asset) {
          targetGroup = asset as GroupAsset;
        } else {
          otherAssets.push(asset);
        }
      });

      if (!targetGroup) {
        return {
          success: false,
          updatedAssets: assets,
          message: 'Group not found'
        };
      }

      // Split members into those to remove and those to keep
      const assetsToRemove: PortfolioAsset[] = [];
      const remainingMembers: PortfolioAsset[] = [];

      targetGroup.memberAssets.forEach(member => {
        if (assetIds.includes(member.id)) {
          assetsToRemove.push(member);
        } else {
          remainingMembers.push(member);
        }
      });

      if (assetsToRemove.length === 0) {
        return {
          success: false,
          updatedAssets: assets,
          message: 'No assets found to remove from group'
        };
      }

      // If only one member left, dissolve the group
      if (remainingMembers.length <= 1) {
        return {
          success: true,
          updatedAssets: [...otherAssets, ...remainingMembers, ...assetsToRemove],
          message: `Dissolved group "${targetGroup.groupName}" - insufficient members remaining`
        };
      }

      // Update group with remaining members
      const { portfolioDataService } = await import('../services/portfolio-data');
      const updatedGroup = portfolioDataService.updateAssetGroup(targetGroup, {
        memberAssets: remainingMembers
      });

      return {
        success: true,
        updatedAssets: [...otherAssets, updatedGroup, ...assetsToRemove],
        message: `Removed ${assetsToRemove.length} asset(s) from group "${targetGroup.groupName}"`,
        groupId: updatedGroup.id
      };

    } catch (error) {
      return {
        success: false,
        updatedAssets: assets,
        message: `Failed to remove from group: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Rename a group
   */
  renameGroup(
    assets: Array<PortfolioAsset | GroupAsset>,
    groupId: string,
    newName: string
  ): GroupingResult {
    try {
      const updatedAssets = assets.map(asset => {
        if (asset.id === groupId && 'type' in asset) {
          const group = asset as GroupAsset;
          const { portfolioDataService } = require('../services/portfolio-data');
          return portfolioDataService.updateAssetGroup(group, { groupName: newName });
        }
        return asset;
      });

      return {
        success: true,
        updatedAssets,
        message: `Renamed group to "${newName}"`,
        groupId
      };

    } catch (error) {
      return {
        success: false,
        updatedAssets: assets,
        message: `Failed to rename group: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Delete a group (ungroup all members)
   */
  deleteGroup(
    assets: Array<PortfolioAsset | GroupAsset>,
    groupId: string
  ): GroupingResult {
    try {
      let targetGroup: GroupAsset | null = null;
      const otherAssets: Array<PortfolioAsset | GroupAsset> = [];

      assets.forEach(asset => {
        if (asset.id === groupId && 'type' in asset) {
          targetGroup = asset as GroupAsset;
        } else {
          otherAssets.push(asset);
        }
      });

      if (!targetGroup) {
        return {
          success: false,
          updatedAssets: assets,
          message: 'Group not found'
        };
      }

      return {
        success: true,
        updatedAssets: [...otherAssets, ...targetGroup.memberAssets],
        message: `Deleted group "${targetGroup.groupName}" and ungrouped ${targetGroup.memberAssets.length} assets`
      };

    } catch (error) {
      return {
        success: false,
        updatedAssets: assets,
        message: `Failed to delete group: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get grouping suggestions based on asset similarity
   */
  getGroupingSuggestions(assets: PortfolioAsset[]): Array<{
    suggestedName: string;
    assets: PortfolioAsset[];
    reason: string;
    confidence: number;
  }> {
    const suggestions: Array<{
      suggestedName: string;
      assets: PortfolioAsset[];
      reason: string;
      confidence: number;
    }> = [];

    // Group by industry
    const industryGroups = new Map<string, PortfolioAsset[]>();
    assets.forEach(asset => {
      const industry = this.extractIndustryFromNaics(asset.naicsDescription);
      const existing = industryGroups.get(industry) || [];
      existing.push(asset);
      industryGroups.set(industry, existing);
    });

    industryGroups.forEach((assetGroup, industry) => {
      if (assetGroup.length >= 2) {
        suggestions.push({
          suggestedName: `${industry} Group`,
          assets: assetGroup,
          reason: `Similar industry classification (${industry})`,
          confidence: 0.8
        });
      }
    });

    // Group by agency
    const agencyGroups = new Map<string, PortfolioAsset[]>();
    assets.forEach(asset => {
      const agency = asset.primaryAgency;
      const existing = agencyGroups.get(agency) || [];
      existing.push(asset);
      agencyGroups.set(agency, existing);
    });

    agencyGroups.forEach((assetGroup, agency) => {
      if (assetGroup.length >= 2) {
        suggestions.push({
          suggestedName: `${agency} Contractors`,
          assets: assetGroup,
          reason: `Same primary agency (${agency})`,
          confidence: 0.7
        });
      }
    });

    // Group by performance tier
    const topPerformers = assets.filter(a => a.performanceScore >= 85);
    if (topPerformers.length >= 2) {
      suggestions.push({
        suggestedName: 'Top Performers',
        assets: topPerformers,
        reason: 'High performance scores (85+)',
        confidence: 0.6
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Validate grouping operation
   */
  validateGrouping(operation: GroupingOperation): { valid: boolean; message: string } {
    switch (operation.type) {
      case 'create':
        if (!operation.newGroupName?.trim()) {
          return { valid: false, message: 'Group name is required' };
        }
        if (operation.assetIds.length < 2) {
          return { valid: false, message: 'At least 2 assets required for grouping' };
        }
        break;

      case 'add_to_existing':
        if (!operation.groupId) {
          return { valid: false, message: 'Target group ID is required' };
        }
        if (operation.assetIds.length === 0) {
          return { valid: false, message: 'No assets specified to add to group' };
        }
        break;

      case 'rename_group':
        if (!operation.newGroupName?.trim()) {
          return { valid: false, message: 'New group name is required' };
        }
        if (!operation.groupId) {
          return { valid: false, message: 'Group ID is required' };
        }
        break;

      case 'remove_from_group':
      case 'delete_group':
        if (!operation.groupId) {
          return { valid: false, message: 'Group ID is required' };
        }
        break;
    }

    return { valid: true, message: 'Valid operation' };
  }

  /**
   * Private: Extract industry from NAICS description
   */
  private extractIndustryFromNaics(naicsDescription: string): string {
    const desc = naicsDescription.toLowerCase();

    if (desc.includes('manufacturing') || desc.includes('fabricat')) return 'Manufacturing';
    if (desc.includes('construction') || desc.includes('building')) return 'Construction';
    if (desc.includes('technology') || desc.includes('computer') || desc.includes('software')) return 'Technology';
    if (desc.includes('professional') || desc.includes('consulting')) return 'Professional Services';
    if (desc.includes('healthcare') || desc.includes('medical')) return 'Healthcare';
    if (desc.includes('aerospace') || desc.includes('aircraft')) return 'Aerospace';
    if (desc.includes('defense') || desc.includes('military')) return 'Defense';

    return 'Other';
  }
}

// Export singleton instance
export const portfolioGroupingLogic = new PortfolioGroupingLogic();

export { PortfolioGroupingLogic };