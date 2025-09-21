import { db } from "../../db";
import {
  contractorLists,
  contractorListItems,
  contractorListActivity,
  contractorListShares,
  contractorProfiles,
  users,
} from "../../db/schema";
import { eq, and, sql, desc, asc, inArray } from "drizzle-orm";
import type {
  ContractorList,
  NewContractorList,
  ContractorListItem,
  NewContractorListItem,
  NewContractorListActivity,
} from "../../db/schema/contractor-lists";

export class ContractorListManager {
  /**
   * Create or get default list for a user
   */
  async ensureDefaultList(userId: string): Promise<ContractorList> {
    // Check if user has a default list
    const existingDefault = await db
      .select()
      .from(contractorLists)
      .where(and(
        eq(contractorLists.userId, userId),
        eq(contractorLists.isDefault, true)
      ))
      .limit(1);

    if (existingDefault.length > 0) {
      return existingDefault[0];
    }

    // Create default list
    const [newDefaultList] = await db
      .insert(contractorLists)
      .values({
        userId,
        name: "My Portfolio",
        description: "Default contractor portfolio",
        isDefault: true,
        color: "#EAB308", // Yellow theme color
        icon: "star",
        sortOrder: 0,
      })
      .returning();

    return newDefaultList;
  }

  /**
   * Create a new list for a user
   */
  async createList(userId: string, data: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    isPublic?: boolean;
  }): Promise<ContractorList> {
    // Get the next sort order
    const [maxSortOrder] = await db
      .select({ max: sql<number>`max(${contractorLists.sortOrder})` })
      .from(contractorLists)
      .where(eq(contractorLists.userId, userId));

    const nextSortOrder = (maxSortOrder?.max || 0) + 1;

    const [newList] = await db
      .insert(contractorLists)
      .values({
        userId,
        name: data.name,
        description: data.description,
        color: data.color || "#6B7280",
        icon: data.icon || "folder",
        isPublic: data.isPublic || false,
        sortOrder: nextSortOrder,
      })
      .returning();

    // Log activity
    await this.logActivity(newList.id, userId, "created", undefined, { listName: data.name });

    return newList;
  }

  /**
   * Get all lists for a user
   */
  async getUserLists(userId: string): Promise<ContractorList[]> {
    return await db
      .select()
      .from(contractorLists)
      .where(eq(contractorLists.userId, userId))
      .orderBy(asc(contractorLists.sortOrder), asc(contractorLists.createdAt));
  }

  /**
   * Get a specific list with items
   */
  async getListWithItems(listId: string, userId: string): Promise<{
    list: ContractorList;
    items: Array<ContractorListItem & { contractor: any }>;
  } | null> {
    // Get the list
    let [list] = await db
      .select()
      .from(contractorLists)
      .where(and(
        eq(contractorLists.id, listId),
        eq(contractorLists.userId, userId)
      ))
      .limit(1);

    if (!list) {
      // Check if user has access via share
      const [share] = await db
        .select()
        .from(contractorListShares)
        .where(and(
          eq(contractorListShares.listId, listId),
          eq(contractorListShares.sharedWithUserId, userId)
        ))
        .limit(1);

      if (!share) {
        return null;
      }

      // Get shared list
      const [sharedList] = await db
        .select()
        .from(contractorLists)
        .where(eq(contractorLists.id, listId))
        .limit(1);

      if (!sharedList) {
        return null;
      }

      list = sharedList;
    }

    // Get items with contractor profiles
    const items = await db
      .select({
        item: contractorListItems,
        contractor: contractorProfiles,
      })
      .from(contractorListItems)
      .innerJoin(
        contractorProfiles,
        eq(contractorListItems.contractorProfileId, contractorProfiles.id)
      )
      .where(eq(contractorListItems.listId, listId))
      .orderBy(desc(contractorListItems.addedAt));

    return {
      list,
      items: items.map(({ item, contractor }) => ({
        ...item,
        contractor,
      })),
    };
  }

  /**
   * Add a contractor to a list
   */
  async addToList(
    listId: string,
    contractorProfileId: string,
    userId: string,
    data?: {
      notes?: string;
      tags?: string[];
      rating?: number;
      priority?: string;
    }
  ): Promise<ContractorListItem> {
    // Verify user owns the list or has edit permission
    const hasAccess = await this.verifyListAccess(listId, userId, "edit");
    if (!hasAccess) {
      throw new Error("Access denied to this list");
    }

    // Check if contractor already in list
    const existing = await db
      .select()
      .from(contractorListItems)
      .where(and(
        eq(contractorListItems.listId, listId),
        eq(contractorListItems.contractorProfileId, contractorProfileId)
      ))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Add to list
    const [newItem] = await db
      .insert(contractorListItems)
      .values({
        listId,
        contractorProfileId,
        addedBy: userId,
        notes: data?.notes,
        tags: data?.tags || [],
        rating: data?.rating,
        priority: data?.priority,
      })
      .returning();

    // Update list statistics
    await this.updateListStats(listId);

    // Log activity
    await this.logActivity(listId, userId, "added_item", newItem.id, {
      contractorProfileId,
    });

    return newItem;
  }

  /**
   * Remove a contractor from a list
   */
  async removeFromList(
    listId: string,
    contractorProfileId: string,
    userId: string
  ): Promise<boolean> {
    // Verify user owns the list or has edit permission
    const hasAccess = await this.verifyListAccess(listId, userId, "edit");
    if (!hasAccess) {
      throw new Error("Access denied to this list");
    }

    const result = await db
      .delete(contractorListItems)
      .where(and(
        eq(contractorListItems.listId, listId),
        eq(contractorListItems.contractorProfileId, contractorProfileId)
      ))
      .returning();

    if (result.length > 0) {
      // Update list statistics
      await this.updateListStats(listId);

      // Log activity
      await this.logActivity(listId, userId, "removed_item", undefined, {
        contractorProfileId,
      });

      return true;
    }

    return false;
  }

  /**
   * Toggle contractor in user's default list (for heart/favorite functionality)
   */
  async toggleInDefaultList(
    contractorProfileId: string,
    userId: string
  ): Promise<{ added: boolean; listId: string }> {
    console.log(`toggleInDefaultList - userId: ${userId}, contractorProfileId: ${contractorProfileId}`);
    
    // Ensure user has a default list
    const defaultList = await this.ensureDefaultList(userId);
    console.log(`Default list: ${defaultList.id} - ${defaultList.name}`);

    // Check if contractor is already in the list
    const existing = await db
      .select()
      .from(contractorListItems)
      .where(and(
        eq(contractorListItems.listId, defaultList.id),
        eq(contractorListItems.contractorProfileId, contractorProfileId)
      ))
      .limit(1);

    console.log(`Existing item found: ${existing.length > 0}`);

    if (existing.length > 0) {
      // Remove from list
      await this.removeFromList(defaultList.id, contractorProfileId, userId);
      console.log(`Removed from list`);
      return { added: false, listId: defaultList.id };
    } else {
      // Add to list
      await this.addToList(defaultList.id, contractorProfileId, userId);
      console.log(`Added to list`);
      return { added: true, listId: defaultList.id };
    }
  }

  /**
   * Update list details
   */
  async updateList(
    listId: string,
    userId: string,
    updates: Partial<{
      name: string;
      description: string;
      color: string;
      icon: string;
      isPublic: boolean;
      sortOrder: number;
    }>
  ): Promise<ContractorList> {
    // Verify user owns the list
    const hasAccess = await this.verifyListAccess(listId, userId, "owner");
    if (!hasAccess) {
      throw new Error("Only the owner can update list details");
    }

    const [updated] = await db
      .update(contractorLists)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(contractorLists.id, listId))
      .returning();

    // Log activity
    await this.logActivity(listId, userId, "updated", undefined, { updates });

    return updated;
  }

  /**
   * Delete a list
   */
  async deleteList(listId: string, userId: string): Promise<boolean> {
    // Verify user owns the list
    const hasAccess = await this.verifyListAccess(listId, userId, "owner");
    if (!hasAccess) {
      throw new Error("Only the owner can delete a list");
    }

    // Don't allow deleting default list
    const [list] = await db
      .select()
      .from(contractorLists)
      .where(eq(contractorLists.id, listId))
      .limit(1);

    if (list?.isDefault) {
      throw new Error("Cannot delete the default list");
    }

    const result = await db
      .delete(contractorLists)
      .where(eq(contractorLists.id, listId))
      .returning();

    return result.length > 0;
  }

  /**
   * Get contractors that are in user's lists
   */
  async getUserFavorites(userId: string): Promise<string[]> {
    const items = await db
      .select({ contractorProfileId: contractorListItems.contractorProfileId })
      .from(contractorListItems)
      .innerJoin(
        contractorLists,
        eq(contractorListItems.listId, contractorLists.id)
      )
      .where(eq(contractorLists.userId, userId));

    return [...new Set(items.map(item => item.contractorProfileId))];
  }

  /**
   * Check if a contractor is in any of user's lists
   */
  async isInUserLists(contractorProfileId: string, userId: string): Promise<{
    inLists: boolean;
    listIds: string[];
  }> {
    const items = await db
      .select({ listId: contractorListItems.listId })
      .from(contractorListItems)
      .innerJoin(
        contractorLists,
        eq(contractorListItems.listId, contractorLists.id)
      )
      .where(and(
        eq(contractorLists.userId, userId),
        eq(contractorListItems.contractorProfileId, contractorProfileId)
      ));

    return {
      inLists: items.length > 0,
      listIds: items.map(item => item.listId),
    };
  }

  /**
   * Update list statistics
   */
  private async updateListStats(listId: string): Promise<void> {
    // Get item count and total value
    const stats = await db
      .select({
        count: sql<number>`count(*)`,
        totalValue: sql<string>`sum(${contractorProfiles.totalObligated})`,
      })
      .from(contractorListItems)
      .innerJoin(
        contractorProfiles,
        eq(contractorListItems.contractorProfileId, contractorProfiles.id)
      )
      .where(eq(contractorListItems.listId, listId));

    await db
      .update(contractorLists)
      .set({
        itemCount: stats[0]?.count || 0,
        totalValue: stats[0]?.totalValue || "0",
        lastItemAddedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contractorLists.id, listId));
  }

  /**
   * Verify user has access to a list
   */
  private async verifyListAccess(
    listId: string,
    userId: string,
    requiredPermission: "owner" | "edit" | "view"
  ): Promise<boolean> {
    // Check if user owns the list
    const [list] = await db
      .select()
      .from(contractorLists)
      .where(and(
        eq(contractorLists.id, listId),
        eq(contractorLists.userId, userId)
      ))
      .limit(1);

    if (list) {
      return true; // Owner has all permissions
    }

    if (requiredPermission === "owner") {
      return false; // Only owner check, no shares
    }

    // Check if user has share access
    const [share] = await db
      .select()
      .from(contractorListShares)
      .where(and(
        eq(contractorListShares.listId, listId),
        eq(contractorListShares.sharedWithUserId, userId)
      ))
      .limit(1);

    if (!share) {
      return false;
    }

    if (requiredPermission === "view") {
      return true; // Any share allows viewing
    }

    if (requiredPermission === "edit") {
      return share.permission === "edit";
    }

    return false;
  }

  /**
   * Log activity for a list
   */
  private async logActivity(
    listId: string,
    userId: string,
    action: string,
    itemId?: string,
    metadata?: any
  ): Promise<void> {
    await db
      .insert(contractorListActivity)
      .values({
        listId,
        userId,
        action,
        itemId,
        metadata,
      });
  }
}