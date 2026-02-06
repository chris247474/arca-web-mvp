"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type UserRole = "curator" | "investor";

export interface PrivyUserData {
  id: string;
  email?: string | null;
  google?: {
    email: string;
    name?: string;
  } | null;
}

export interface UserProfile {
  id: string;
  privyId: string;
  name: string | null;
  email: string | null;
  role: UserRole | null;
  linkedinUrl: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sync user data from Privy to Supabase
 * Upserts user record based on Privy ID
 */
export async function syncUser(privyUser: PrivyUserData): Promise<UserProfile | null> {
  if (!privyUser?.id) {
    console.error("syncUser: No Privy user ID provided");
    return null;
  }

  try {
    // Extract email and name from various Privy sources
    const email = privyUser.email || privyUser.google?.email || null;
    const name = privyUser.google?.name || null;

    // Check if user exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.privyId, privyUser.id))
      .limit(1);

    if (existingUsers.length > 0) {
      // Update existing user
      const [updatedUser] = await db
        .update(users)
        .set({
          email: email || existingUsers[0].email,
          name: name || existingUsers[0].name,
          updatedAt: new Date(),
        })
        .where(eq(users.privyId, privyUser.id))
        .returning();

      return updatedUser as unknown as UserProfile;
    }

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        privyId: privyUser.id,
        email,
        name,
        role: null, // Role will be set during onboarding
      })
      .returning();

    return newUser as unknown as UserProfile;
  } catch (error) {
    console.error("syncUser error:", error);
    return null;
  }
}

/**
 * Update user role (curator or investor)
 */
export async function updateUserRole(
  privyId: string,
  role: UserRole
): Promise<UserProfile | null> {
  if (!privyId) {
    console.error("updateUserRole: No Privy ID provided");
    return null;
  }

  if (!["curator", "investor"].includes(role)) {
    console.error("updateUserRole: Invalid role provided");
    return null;
  }

  try {
    const [updatedUser] = await db
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.privyId, privyId))
      .returning();

    if (!updatedUser) {
      console.error("updateUserRole: User not found");
      return null;
    }

    return updatedUser as unknown as UserProfile;
  } catch (error) {
    console.error("updateUserRole error:", error);
    return null;
  }
}

/**
 * Get user profile from Supabase by Privy ID
 */
export async function getUserProfile(privyId: string): Promise<UserProfile | null> {
  if (!privyId) {
    return null;
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.privyId, privyId))
      .limit(1);

    if (!user) {
      return null;
    }

    return user as unknown as UserProfile;
  } catch (error) {
    console.error("getUserProfile error:", error);
    return null;
  }
}
