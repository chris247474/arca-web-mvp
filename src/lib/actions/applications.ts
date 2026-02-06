"use server";

import { db } from "@/db";
import { applications, memberships, users, groups } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendEmailAsync } from "@/lib/email";
import { ApplicationSubmittedEmail } from "@/lib/email/templates/application-submitted";
import { ApplicationApprovedEmail } from "@/lib/email/templates/application-approved";
import { ApplicationRejectedEmail } from "@/lib/email/templates/application-rejected";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://arca.app";

export interface ApplicationData {
  userId: string;
  linkedinUrl: string;
  interestStatement: string;
}

export interface Application {
  id: string;
  userId: string;
  groupId: string;
  status: "pending" | "approved" | "rejected";
  linkedinUrl: string | null;
  interestStatement: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationWithUser extends Application {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

/**
 * Submit a new application to join a group
 */
export async function submitApplication(
  groupId: string,
  data: ApplicationData
): Promise<Application | null> {
  if (!groupId || !data.userId) {
    console.error("submitApplication: Missing groupId or userId");
    return null;
  }

  try {
    // Check if user already has a pending application
    const existingApplication = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.userId, data.userId),
          eq(applications.groupId, groupId),
          eq(applications.status, "pending")
        )
      )
      .limit(1);

    if (existingApplication.length > 0) {
      console.error("submitApplication: User already has a pending application");
      return existingApplication[0] as Application;
    }

    const [newApplication] = await db
      .insert(applications)
      .values({
        userId: data.userId,
        groupId,
        status: "pending",
        linkedinUrl: data.linkedinUrl,
        interestStatement: data.interestStatement,
      })
      .returning();

    // Send email notification to curator (non-blocking)
    try {
      // Get applicant info
      const [applicant] = await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, data.userId))
        .limit(1);

      // Get group and curator info
      const [group] = await db
        .select({
          name: groups.name,
          curatorId: groups.curatorId,
        })
        .from(groups)
        .where(eq(groups.id, groupId))
        .limit(1);

      if (group) {
        const [curator] = await db
          .select({ name: users.name, email: users.email })
          .from(users)
          .where(eq(users.id, group.curatorId))
          .limit(1);

        if (curator?.email) {
          sendEmailAsync(
            curator.email,
            `New application for ${group.name}`,
            ApplicationSubmittedEmail({
              curatorName: curator.name || "Curator",
              applicantName: applicant?.name || "Unknown",
              applicantEmail: applicant?.email || "No email provided",
              groupName: group.name,
              linkedinUrl: data.linkedinUrl,
              interestStatement: data.interestStatement,
              reviewUrl: `${APP_URL}/groups/${groupId}?tab=applications`,
            })
          );
        }
      }
    } catch (emailError) {
      // Log but don't fail the main operation
      console.error("submitApplication: Failed to send notification email", emailError);
    }

    return newApplication as Application;
  } catch (error) {
    console.error("submitApplication error:", error);
    return null;
  }
}

/**
 * Get all applications for a group (curator only)
 */
export async function getApplications(
  groupId: string
): Promise<ApplicationWithUser[]> {
  if (!groupId) {
    return [];
  }

  try {
    const result = await db
      .select({
        id: applications.id,
        userId: applications.userId,
        groupId: applications.groupId,
        status: applications.status,
        linkedinUrl: applications.linkedinUrl,
        interestStatement: applications.interestStatement,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(applications)
      .leftJoin(users, eq(applications.userId, users.id))
      .where(eq(applications.groupId, groupId));

    return result as ApplicationWithUser[];
  } catch (error) {
    console.error("getApplications error:", error);
    return [];
  }
}

/**
 * Get count of pending applications for a group (for badge display)
 */
export async function getPendingApplicationCount(
  groupId: string
): Promise<number> {
  if (!groupId) {
    return 0;
  }

  try {
    const result = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.groupId, groupId),
          eq(applications.status, "pending")
        )
      );

    return result.length;
  } catch (error) {
    console.error("getPendingApplicationCount error:", error);
    return 0;
  }
}

/**
 * Approve an application and create membership
 */
export async function approveApplication(
  applicationId: string
): Promise<Application | null> {
  if (!applicationId) {
    console.error("approveApplication: No application ID provided");
    return null;
  }

  try {
    // Get the application
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1);

    if (!application) {
      console.error("approveApplication: Application not found");
      return null;
    }

    // Update application status
    const [updatedApplication] = await db
      .update(applications)
      .set({
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(applications.id, applicationId))
      .returning();

    // Create membership record
    await db.insert(memberships).values({
      userId: application.userId,
      groupId: application.groupId,
      role: "member",
    });

    // Send approval email to applicant (non-blocking)
    try {
      const [applicant] = await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, application.userId))
        .limit(1);

      const [group] = await db
        .select({ name: groups.name })
        .from(groups)
        .where(eq(groups.id, application.groupId))
        .limit(1);

      if (applicant?.email && group) {
        sendEmailAsync(
          applicant.email,
          `Welcome to ${group.name}!`,
          ApplicationApprovedEmail({
            applicantName: applicant.name || "Member",
            groupName: group.name,
            groupUrl: `${APP_URL}/groups/${application.groupId}`,
          })
        );
      }
    } catch (emailError) {
      console.error("approveApplication: Failed to send notification email", emailError);
    }

    return updatedApplication as Application;
  } catch (error) {
    console.error("approveApplication error:", error);
    return null;
  }
}

/**
 * Reject an application
 */
export async function rejectApplication(
  applicationId: string
): Promise<Application | null> {
  if (!applicationId) {
    console.error("rejectApplication: No application ID provided");
    return null;
  }

  try {
    const [updatedApplication] = await db
      .update(applications)
      .set({
        status: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(applications.id, applicationId))
      .returning();

    if (!updatedApplication) {
      console.error("rejectApplication: Application not found");
      return null;
    }

    // Send rejection email to applicant (non-blocking)
    try {
      const [applicant] = await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, updatedApplication.userId))
        .limit(1);

      const [group] = await db
        .select({ name: groups.name })
        .from(groups)
        .where(eq(groups.id, updatedApplication.groupId))
        .limit(1);

      if (applicant?.email && group) {
        sendEmailAsync(
          applicant.email,
          `Application update for ${group.name}`,
          ApplicationRejectedEmail({
            applicantName: applicant.name || "Applicant",
            groupName: group.name,
          })
        );
      }
    } catch (emailError) {
      console.error("rejectApplication: Failed to send notification email", emailError);
    }

    return updatedApplication as Application;
  } catch (error) {
    console.error("rejectApplication error:", error);
    return null;
  }
}

/**
 * Get a user's application for a specific group
 */
export async function getUserApplication(
  userId: string,
  groupId: string
): Promise<Application | null> {
  if (!userId || !groupId) {
    return null;
  }

  try {
    const [application] = await db
      .select()
      .from(applications)
      .where(
        and(eq(applications.userId, userId), eq(applications.groupId, groupId))
      )
      .limit(1);

    return (application as Application) || null;
  } catch (error) {
    console.error("getUserApplication error:", error);
    return null;
  }
}
