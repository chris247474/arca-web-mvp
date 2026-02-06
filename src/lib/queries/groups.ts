"use server";

import { db } from "@/db";
import { groups } from "@/db/schema";
import { eq, and, or, ilike } from "drizzle-orm";
import type { Group, Deal, User, Membership } from "@/db/types";

export interface GroupWithMembers extends Group {
  curator?: User;
  memberships?: (Membership & { user: User })[];
}

export interface GroupWithDeals extends Group {
  deals?: Deal[];
}

export interface MemberInfo {
  id: string;
  userId: string;
  name: string | null;
  email: string | null;
  role: "curator" | "member";
  joinedAt: Date;
}

export interface GroupQueryResult {
  success: boolean;
  error?: string;
  group?: Group;
  groups?: Group[];
  members?: MemberInfo[];
  deals?: Deal[];
}

/**
 * Get a group with all its members
 */
export async function getGroupWithMembers(
  groupId: string
): Promise<GroupQueryResult> {
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

    // Transform memberships to MemberInfo
    const members: MemberInfo[] =
      (group as GroupWithMembers).memberships?.map((m) => ({
        id: m.id,
        userId: m.userId,
        name: m.user?.name || null,
        email: m.user?.email || null,
        role: m.role,
        joinedAt: m.createdAt,
      })) || [];

    return { success: true, group, members };
  } catch (error) {
    console.error("getGroupWithMembers error:", error);
    return { success: false, error: "Failed to fetch group with members" };
  }
}

/**
 * Get a group with all its deals
 */
export async function getGroupWithDeals(
  groupId: string
): Promise<GroupQueryResult> {
  if (!groupId) {
    return { success: false, error: "Group ID is required" };
  }

  try {
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
      with: {
        deals: {
          orderBy: (deals, { desc }) => [desc(deals.createdAt)],
        },
      },
    });

    if (!group) {
      return { success: false, error: "Group not found" };
    }

    const deals = (group as GroupWithDeals).deals || [];

    return { success: true, group, deals };
  } catch (error) {
    console.error("getGroupWithDeals error:", error);
    return { success: false, error: "Failed to fetch group with deals" };
  }
}

/**
 * Search and filter groups
 */
export async function searchGroups(
  query?: string,
  sector?: string
): Promise<GroupQueryResult> {
  try {
    const searchGroups = await db.query.groups.findMany({
      where: (groups, { eq, and, or, ilike }) => {
        const conditions = [];

        // Only public groups
        conditions.push(eq(groups.visibility, "public"));

        // Filter by sector if provided
        if (sector) {
          conditions.push(eq(groups.sector, sector));
        }

        // Search by name or description if query provided
        if (query) {
          conditions.push(
            or(
              ilike(groups.name, `%${query}%`),
              ilike(groups.description, `%${query}%`)
            )
          );
        }

        return and(...conditions);
      },
      with: {
        curator: true,
        memberships: true,
      },
      orderBy: (groups, { desc }) => [desc(groups.createdAt)],
    });

    return { success: true, groups: searchGroups };
  } catch (error) {
    console.error("searchGroups error:", error);
    return { success: false, error: "Failed to search groups" };
  }
}
