"use server";

import { db } from "@/db";
import { comments, users, deals, groups } from "@/db/schema";
import { eq, and, isNull, or } from "drizzle-orm";
import { sendEmailAsync } from "@/lib/email";
import { NewCommentEmail } from "@/lib/email/templates/new-comment";
import { CommentReplyEmail } from "@/lib/email/templates/comment-reply";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://arca.app";

export interface Comment {
  id: string;
  content: string;
  userId: string;
  dealId: string;
  parentId: string | null;
  visibility: "public" | "private";
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentWithUser extends Comment {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  replies?: CommentWithUser[];
}

/**
 * Create a new comment
 * @param dealId - The deal this comment belongs to
 * @param userId - The user creating the comment
 * @param content - The comment content
 * @param visibility - Comment visibility (public or private)
 * @param parentId - Parent comment ID for replies (optional)
 * @returns The created comment or null on failure
 */
export async function createComment(
  dealId: string,
  userId: string,
  content: string,
  visibility: "public" | "private" = "public",
  parentId?: string | null
): Promise<Comment | null> {
  if (!dealId || !userId || !content.trim()) {
    console.error("createComment: Missing required parameters");
    return null;
  }

  try {
    const [newComment] = await db
      .insert(comments)
      .values({
        dealId,
        userId,
        content: content.trim(),
        visibility,
        parentId: parentId ?? null,
      })
      .returning();

    // Send email notifications (non-blocking)
    try {
      // Get commenter info
      const [commenter] = await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      // Get deal and group info
      const [deal] = await db
        .select({
          name: deals.name,
          groupId: deals.groupId,
          createdBy: deals.createdBy,
        })
        .from(deals)
        .where(eq(deals.id, dealId))
        .limit(1);

      if (deal) {
        // Create a preview of the comment (truncate if too long)
        const commentPreview =
          content.length > 200 ? content.substring(0, 200) + "..." : content;

        // If this is a reply, notify the parent commenter
        if (parentId) {
          const [parentComment] = await db
            .select({ userId: comments.userId })
            .from(comments)
            .where(eq(comments.id, parentId))
            .limit(1);

          if (parentComment && parentComment.userId !== userId) {
            const [parentCommenter] = await db
              .select({ name: users.name, email: users.email })
              .from(users)
              .where(eq(users.id, parentComment.userId))
              .limit(1);

            if (parentCommenter?.email) {
              sendEmailAsync(
                parentCommenter.email,
                `New reply on ${deal.name}`,
                CommentReplyEmail({
                  recipientName: parentCommenter.name || "User",
                  replierName: commenter?.name || "Someone",
                  dealName: deal.name,
                  replyPreview: commentPreview,
                  viewUrl: `${APP_URL}/groups/${deal.groupId}/deals/${dealId}#comment-${newComment.id}`,
                })
              );
            }
          }
        }

        // Notify curator if the commenter is not the curator
        if (deal.createdBy !== userId) {
          // Get curator (deal creator) info
          const [curator] = await db
            .select({ name: users.name, email: users.email })
            .from(users)
            .where(eq(users.id, deal.createdBy))
            .limit(1);

          if (curator?.email) {
            sendEmailAsync(
              curator.email,
              `New comment on ${deal.name}`,
              NewCommentEmail({
                curatorName: curator.name || "Curator",
                commenterName: commenter?.name || "Someone",
                dealName: deal.name,
                commentPreview: commentPreview,
                viewUrl: `${APP_URL}/groups/${deal.groupId}/deals/${dealId}#comment-${newComment.id}`,
              })
            );
          }
        }
      }
    } catch (emailError) {
      // Log but don't fail the main operation
      console.error("createComment: Failed to send notification emails", emailError);
    }

    return newComment as Comment;
  } catch (error) {
    console.error("createComment error:", error);
    return null;
  }
}

/**
 * Get all comments for a deal with user information
 * Organizes comments into threads (parent comments with their replies)
 * @param dealId - The deal ID
 * @param includePrivate - Whether to include private comments (for curators)
 * @returns Array of top-level comments with nested replies
 */
export async function getComments(
  dealId: string,
  includePrivate: boolean = false
): Promise<CommentWithUser[]> {
  if (!dealId) {
    return [];
  }

  try {
    // Build the visibility condition
    const visibilityCondition = includePrivate
      ? eq(comments.dealId, dealId)
      : and(eq(comments.dealId, dealId), eq(comments.visibility, "public"));

    // Fetch all comments for the deal with user info
    const result = await db
      .select({
        id: comments.id,
        content: comments.content,
        userId: comments.userId,
        dealId: comments.dealId,
        parentId: comments.parentId,
        visibility: comments.visibility,
        resolved: comments.resolved,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(visibilityCondition)
      .orderBy(comments.createdAt);

    // Transform results and organize into threads
    const commentMap = new Map<string, CommentWithUser>();
    const topLevelComments: CommentWithUser[] = [];

    // First pass: create comment objects
    for (const row of result) {
      const comment: CommentWithUser = {
        id: row.id,
        content: row.content,
        userId: row.userId,
        dealId: row.dealId,
        parentId: row.parentId,
        visibility: row.visibility as "public" | "private",
        resolved: row.resolved,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        user: {
          id: row.userId,
          name: row.userName,
          email: row.userEmail,
        },
        replies: [],
      };
      commentMap.set(comment.id, comment);
    }

    // Second pass: organize into threads
    for (const comment of commentMap.values()) {
      if (comment.parentId === null) {
        topLevelComments.push(comment);
      } else {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(comment);
        } else {
          // Parent not found (possibly private), treat as top-level
          topLevelComments.push(comment);
        }
      }
    }

    return topLevelComments;
  } catch (error) {
    console.error("getComments error:", error);
    return [];
  }
}

/**
 * Update a comment's content
 * @param id - Comment ID
 * @param content - New content
 * @returns Updated comment or null
 */
export async function updateComment(
  id: string,
  content: string
): Promise<Comment | null> {
  if (!id || !content.trim()) {
    console.error("updateComment: Missing required parameters");
    return null;
  }

  try {
    const [updatedComment] = await db
      .update(comments)
      .set({
        content: content.trim(),
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
      .returning();

    if (!updatedComment) {
      return null;
    }

    return updatedComment as Comment;
  } catch (error) {
    console.error("updateComment error:", error);
    return null;
  }
}

/**
 * Delete a comment
 * @param id - Comment ID
 * @returns True if deleted, false otherwise
 */
export async function deleteComment(id: string): Promise<boolean> {
  if (!id) {
    console.error("deleteComment: No comment ID provided");
    return false;
  }

  try {
    // First, delete any replies to this comment
    await db.delete(comments).where(eq(comments.parentId, id));

    // Then delete the comment itself
    const [deletedComment] = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning();

    return !!deletedComment;
  } catch (error) {
    console.error("deleteComment error:", error);
    return false;
  }
}

/**
 * Mark a comment as resolved
 * @param id - Comment ID
 * @returns Updated comment or null
 */
export async function resolveComment(id: string): Promise<Comment | null> {
  if (!id) {
    console.error("resolveComment: No comment ID provided");
    return null;
  }

  try {
    const [updatedComment] = await db
      .update(comments)
      .set({
        resolved: true,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
      .returning();

    if (!updatedComment) {
      return null;
    }

    return updatedComment as Comment;
  } catch (error) {
    console.error("resolveComment error:", error);
    return null;
  }
}

/**
 * Unmark a comment as resolved
 * @param id - Comment ID
 * @returns Updated comment or null
 */
export async function unresolveComment(id: string): Promise<Comment | null> {
  if (!id) {
    console.error("unresolveComment: No comment ID provided");
    return null;
  }

  try {
    const [updatedComment] = await db
      .update(comments)
      .set({
        resolved: false,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
      .returning();

    if (!updatedComment) {
      return null;
    }

    return updatedComment as Comment;
  } catch (error) {
    console.error("unresolveComment error:", error);
    return null;
  }
}
