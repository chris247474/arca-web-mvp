"use server";

import { db } from "@/db";
import { groups, memberships, users } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import type { Group, Membership } from "@/db/types";

export interface CreateGroupInput {
  name: string;
  description?: string;
  curatorId: string;
  sector?: string;
  visibility?: "public" | "private";
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
  sector?: string;
  visibility?: "public" | "private";
}

export interface GroupWithCurator extends Group {
  curator?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  memberships?: Membership[];
}

export interface GroupActionResult {
  success: boolean;
  error?: string;
  group?: GroupWithCurator;
  groups?: GroupWithCurator[];
  memberCount?: number;
}

/**
 * Generate a random 8-character alphanumeric invite code
 */
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new group and automatically create curator membership
 */
export async function createGroup(
  input: CreateGroupInput
): Promise<GroupActionResult> {
  const { name, description, curatorId, sector, visibility = "private" } = input;

  if (!curatorId) {
    return { success: false, error: "Curator ID is required" };
  }

  if (!name?.trim()) {
    return { success: false, error: "Group name is required" };
  }

  try {
    // Generate invite code
    const inviteCode = generateInviteCode();

    // Create the group
    const [newGroup] = await db
      .insert(groups)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        curatorId,
        sector: sector?.trim() || null,
        visibility,
        inviteCode,
      })
      .returning();

    if (!newGroup) {
      return { success: false, error: "Failed to create group" };
    }

    // Create curator membership
    await db.insert(memberships).values({
      userId: curatorId,
      groupId: newGroup.id,
      role: "curator",
    });

    return { success: true, group: newGroup };
  } catch (error) {
    console.error("createGroup error:", error);
    return { success: false, error: "Failed to create group" };
  }
}

/**
 * Get all public groups for the browse page
 */
export async function getGroups(): Promise<GroupActionResult> {
  try {
    const publicGroups = await db.query.groups.findMany({
      where: eq(groups.visibility, "public"),
      with: {
        curator: true,
        memberships: true,
      },
      orderBy: (groups, { desc }) => [desc(groups.createdAt)],
    });

    return { success: true, groups: publicGroups as GroupWithCurator[] };
  } catch (error) {
    console.error("getGroups error:", error);
    return { success: false, error: "Failed to fetch groups" };
  }
}

/**
 * Get groups where user is curator or member
 */
export async function getUserGroups(
  userId: string
): Promise<GroupActionResult> {
  if (!userId) {
    return { success: false, error: "User ID is required" };
  }

  try {
    // Find all groups where user has membership
    const userMemberships = await db.query.memberships.findMany({
      where: eq(memberships.userId, userId),
      with: {
        group: {
          with: {
            curator: true,
            memberships: true,
          },
        },
      },
    });

    const userGroups = userMemberships.map((m) => m.group) as GroupWithCurator[];

    return { success: true, groups: userGroups };
  } catch (error) {
    console.error("getUserGroups error:", error);
    return { success: false, error: "Failed to fetch user groups" };
  }
}

/**
 * Get a single group by ID with member count
 */
export async function getGroupById(
  groupId: string
): Promise<GroupActionResult> {
  if (!groupId) {
    return { success: false, error: "Group ID is required" };
  }

  try {
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
      with: {
        curator: true,
        memberships: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!group) {
      return { success: false, error: "Group not found" };
    }

    const memberCount = group.memberships?.length || 0;

    return {
      success: true,
      group: group as GroupWithCurator,
      memberCount,
    };
  } catch (error) {
    console.error("getGroupById error:", error);
    return { success: false, error: "Failed to fetch group" };
  }
}

/**
 * Update group details (curator only)
 */
export async function updateGroup(
  groupId: string,
  curatorId: string,
  input: UpdateGroupInput
): Promise<GroupActionResult> {
  if (!groupId) {
    return { success: false, error: "Group ID is required" };
  }

  if (!curatorId) {
    return { success: false, error: "Curator ID is required" };
  }

  try {
    // Check if user is the curator
    const existingGroup = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
    });

    if (!existingGroup) {
      return { success: false, error: "Group not found" };
    }

    if (existingGroup.curatorId !== curatorId) {
      return { success: false, error: "Only the curator can update this group" };
    }

    // Build update object
    const updateData: Partial<typeof groups.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) {
      updateData.name = input.name.trim();
    }
    if (input.description !== undefined) {
      updateData.description = input.description.trim() || null;
    }
    if (input.sector !== undefined) {
      updateData.sector = input.sector.trim() || null;
    }
    if (input.visibility !== undefined) {
      updateData.visibility = input.visibility;
    }

    const [updatedGroup] = await db
      .update(groups)
      .set(updateData)
      .where(eq(groups.id, groupId))
      .returning();

    return { success: true, group: updatedGroup };
  } catch (error) {
    console.error("updateGroup error:", error);
    return { success: false, error: "Failed to update group" };
  }
}

/**
 * Delete a group (curator only)
 */
export async function deleteGroup(
  groupId: string,
  curatorId: string
): Promise<GroupActionResult> {
  if (!groupId) {
    return { success: false, error: "Group ID is required" };
  }

  if (!curatorId) {
    return { success: false, error: "Curator ID is required" };
  }

  try {
    // Check if user is the curator
    const existingGroup = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
    });

    if (!existingGroup) {
      return { success: false, error: "Group not found" };
    }

    if (existingGroup.curatorId !== curatorId) {
      return { success: false, error: "Only the curator can delete this group" };
    }

    // Delete memberships first (foreign key constraint)
    await db.delete(memberships).where(eq(memberships.groupId, groupId));

    // Delete the group
    await db.delete(groups).where(eq(groups.id, groupId));

    return { success: true };
  } catch (error) {
    console.error("deleteGroup error:", error);
    return { success: false, error: "Failed to delete group" };
  }
}

/**
 * Get a group by invite code
 */
export async function getGroupByInviteCode(
  inviteCode: string
): Promise<GroupActionResult> {
  if (!inviteCode) {
    return { success: false, error: "Invite code is required" };
  }

  try {
    const group = await db.query.groups.findFirst({
      where: eq(groups.inviteCode, inviteCode),
      with: {
        curator: true,
        memberships: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!group) {
      return { success: false, error: "Invalid invite code" };
    }

    const memberCount = group.memberships?.length || 0;

    return {
      success: true,
      group: group as GroupWithCurator,
      memberCount,
    };
  } catch (error) {
    console.error("getGroupByInviteCode error:", error);
    return { success: false, error: "Failed to fetch group" };
  }
}
