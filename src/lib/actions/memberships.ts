"use server";

import { db } from "@/db";
import { memberships, users, groups } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export interface Membership {
  id: string;
  userId: string;
  groupId: string;
  role: "curator" | "member";
  createdAt: Date;
}

export interface MembershipWithUser extends Membership {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export interface MembershipWithGroup extends Membership {
  group: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

/**
 * Get all members of a group
 */
export async function getMemberships(
  groupId: string
): Promise<MembershipWithUser[]> {
  if (!groupId) {
    return [];
  }

  try {
    const result = await db
      .select({
        id: memberships.id,
        userId: memberships.userId,
        groupId: memberships.groupId,
        role: memberships.role,
        createdAt: memberships.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(memberships)
      .leftJoin(users, eq(memberships.userId, users.id))
      .where(eq(memberships.groupId, groupId));

    return result as MembershipWithUser[];
  } catch (error) {
    console.error("getMemberships error:", error);
    return [];
  }
}

/**
 * Check if user is a member of a group
 */
export async function getMembership(
  userId: string,
  groupId: string
): Promise<Membership | null> {
  if (!userId || !groupId) {
    return null;
  }

  try {
    const [membership] = await db
      .select()
      .from(memberships)
      .where(
        and(eq(memberships.userId, userId), eq(memberships.groupId, groupId))
      )
      .limit(1);

    return (membership as Membership) || null;
  } catch (error) {
    console.error("getMembership error:", error);
    return null;
  }
}

/**
 * Remove a member from a group (curator only)
 */
export async function removeMember(
  userId: string,
  groupId: string
): Promise<boolean> {
  if (!userId || !groupId) {
    return false;
  }

  try {
    await db
      .delete(memberships)
      .where(
        and(eq(memberships.userId, userId), eq(memberships.groupId, groupId))
      );

    return true;
  } catch (error) {
    console.error("removeMember error:", error);
    return false;
  }
}

/**
 * Get all groups a user belongs to
 */
export async function getUserMemberships(
  userId: string
): Promise<MembershipWithGroup[]> {
  if (!userId) {
    return [];
  }

  try {
    const result = await db
      .select({
        id: memberships.id,
        userId: memberships.userId,
        groupId: memberships.groupId,
        role: memberships.role,
        createdAt: memberships.createdAt,
        group: {
          id: groups.id,
          name: groups.name,
          description: groups.description,
        },
      })
      .from(memberships)
      .leftJoin(groups, eq(memberships.groupId, groups.id))
      .where(eq(memberships.userId, userId));

    return result as MembershipWithGroup[];
  } catch (error) {
    console.error("getUserMemberships error:", error);
    return [];
  }
}

/**
 * Check if user is a curator of a group
 */
export async function isCurator(
  userId: string,
  groupId: string
): Promise<boolean> {
  if (!userId || !groupId) {
    return false;
  }

  try {
    const [membership] = await db
      .select()
      .from(memberships)
      .where(
        and(eq(memberships.userId, userId), eq(memberships.groupId, groupId))
      )
      .limit(1);

    return membership?.role === "curator";
  } catch (error) {
    console.error("isCurator error:", error);
    return false;
  }
}

/**
 * Get a user's role in a group
 * Returns the role string or null if not a member
 */
export async function getMembershipRole(
  userId: string,
  groupId: string
): Promise<"curator" | "member" | null> {
  const membership = await getMembership(userId, groupId);
  return membership?.role || null;
}

/**
 * Create a new membership
 */
export async function createMembership(
  userId: string,
  groupId: string,
  role: "curator" | "member" = "member"
): Promise<Membership | null> {
  if (!userId || !groupId) {
    return null;
  }

  try {
    const [newMembership] = await db
      .insert(memberships)
      .values({
        userId,
        groupId,
        role,
      })
      .returning();

    return newMembership as Membership;
  } catch (error) {
    console.error("createMembership error:", error);
    return null;
  }
}
