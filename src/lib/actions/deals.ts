"use server";

import { db } from "@/db";
import { deals, documents } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface Deal {
  id: string;
  name: string;
  description: string | null;
  groupId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DealWithDocuments extends Deal {
  documents: Array<{
    id: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    storagePath: string;
    uploadedBy: string;
    createdAt: Date;
  }>;
}

/**
 * Create a new deal folder
 * @param groupId - The group this deal belongs to
 * @param name - Deal name
 * @param description - Optional deal description
 * @param userId - The user creating the deal
 * @returns The created deal or null on failure
 */
export async function createDeal(
  groupId: string,
  name: string,
  description: string | null,
  userId: string
): Promise<Deal | null> {
  if (!groupId || !name || !userId) {
    console.error("createDeal: Missing required parameters");
    return null;
  }

  try {
    const [newDeal] = await db
      .insert(deals)
      .values({
        groupId,
        name,
        description,
        createdBy: userId,
      })
      .returning();

    return newDeal as Deal;
  } catch (error) {
    console.error("createDeal error:", error);
    return null;
  }
}

/**
 * Get all deals for a group
 * @param groupId - The group ID
 * @returns Array of deals
 */
export async function getDeals(groupId: string): Promise<Deal[]> {
  if (!groupId) {
    return [];
  }

  try {
    const result = await db
      .select()
      .from(deals)
      .where(eq(deals.groupId, groupId));

    return result as Deal[];
  } catch (error) {
    console.error("getDeals error:", error);
    return [];
  }
}

/**
 * Get a single deal by ID with its documents
 * @param id - Deal ID
 * @returns Deal with documents or null
 */
export async function getDealById(id: string): Promise<DealWithDocuments | null> {
  if (!id) {
    return null;
  }

  try {
    // Get the deal
    const [deal] = await db
      .select()
      .from(deals)
      .where(eq(deals.id, id))
      .limit(1);

    if (!deal) {
      return null;
    }

    // Get associated documents
    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.dealId, id));

    return {
      ...deal,
      documents: docs,
    } as DealWithDocuments;
  } catch (error) {
    console.error("getDealById error:", error);
    return null;
  }
}

/**
 * Update deal details
 * @param id - Deal ID
 * @param data - Fields to update
 * @returns Updated deal or null
 */
export async function updateDeal(
  id: string,
  data: Partial<Pick<Deal, "name" | "description">>
): Promise<Deal | null> {
  if (!id) {
    console.error("updateDeal: No deal ID provided");
    return null;
  }

  try {
    const [updatedDeal] = await db
      .update(deals)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(deals.id, id))
      .returning();

    if (!updatedDeal) {
      return null;
    }

    return updatedDeal as Deal;
  } catch (error) {
    console.error("updateDeal error:", error);
    return null;
  }
}

/**
 * Delete a deal and its associated documents
 * @param id - Deal ID
 * @returns True if deleted, false otherwise
 */
export async function deleteDeal(id: string): Promise<boolean> {
  if (!id) {
    console.error("deleteDeal: No deal ID provided");
    return false;
  }

  try {
    // Note: Documents should be deleted from storage separately
    // This will cascade delete documents from DB if foreign key is set up
    const [deletedDeal] = await db
      .delete(deals)
      .where(eq(deals.id, id))
      .returning();

    return !!deletedDeal;
  } catch (error) {
    console.error("deleteDeal error:", error);
    return false;
  }
}
