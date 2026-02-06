"use client";

import { useState, useCallback } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  MoreHorizontal,
  Reply,
  CheckCircle,
  Circle,
  Pencil,
  Trash2,
  Lock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { CommentWithUser } from "@/lib/actions/comments";

interface CommentCardProps {
  comment: CommentWithUser;
  currentUserId: string | null;
  isCurator: boolean;
  onReply: (commentId: string) => void;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onResolve: (commentId: string) => Promise<void>;
  onUnresolve: (commentId: string) => Promise<void>;
  isReply?: boolean;
}

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "?";
}

export function CommentCard({
  comment,
  currentUserId,
  isCurator,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  onUnresolve,
  isReply = false,
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwnComment = currentUserId === comment.userId;
  const canEdit = isOwnComment;
  const canDelete = isOwnComment || isCurator;
  const canResolve = isCurator;
  const isPrivate = comment.visibility === "private";

  const handleEditSubmit = useCallback(async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      setEditContent(comment.content);
      return;
    }

    setIsSubmitting(true);
    try {
      await onEdit(comment.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to edit comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [editContent, comment.content, comment.id, onEdit]);

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    setEditContent(comment.content);
  }, [comment.content]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [comment.id, onDelete]);

  const handleToggleResolved = useCallback(async () => {
    setIsSubmitting(true);
    try {
      if (comment.resolved) {
        await onUnresolve(comment.id);
      } else {
        await onResolve(comment.id);
      }
    } catch (error) {
      console.error("Failed to toggle resolved:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [comment.id, comment.resolved, onResolve, onUnresolve]);

  return (
    <div
      className={cn(
        "group",
        isReply && "ml-8 pl-4 border-l-2 border-muted",
        comment.resolved && "opacity-60"
      )}
    >
      <div className="flex gap-3 py-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="text-xs">
            {getInitials(comment.user.name, comment.user.email)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-foreground">
              {comment.user.name || comment.user.email || "Unknown User"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
            {isPrivate && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <Lock className="h-3 w-3" />
                Private
              </span>
            )}
            {comment.resolved && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <CheckCircle className="h-3 w-3" />
                Resolved
              </span>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px]"
                disabled={isSubmitting}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleEditSubmit}
                  disabled={isSubmitting || !editContent.trim()}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEditCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground mt-1 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {!isEditing && (
            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onReply(comment.id)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}

              {canResolve && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleToggleResolved}
                  disabled={isSubmitting}
                >
                  {comment.resolved ? (
                    <>
                      <Circle className="h-3 w-3 mr-1" />
                      Unresolve
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolve
                    </>
                  )}
                </Button>
              )}

              {(canEdit || canDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit && (
                      <DropdownMenuItem
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-0">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              isCurator={isCurator}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onResolve={onResolve}
              onUnresolve={onUnresolve}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}
