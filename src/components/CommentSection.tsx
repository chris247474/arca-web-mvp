"use client";

import { useState, useCallback, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentCard } from "./CommentCard";
import { CommentInput } from "./CommentInput";
import { MessageSquare } from "lucide-react";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  resolveComment,
  unresolveComment,
  type CommentWithUser,
} from "@/lib/actions/comments";

interface CommentSectionProps {
  dealId: string;
  currentUserId: string | null;
  isCurator: boolean;
}

export function CommentSection({
  dealId,
  currentUserId,
  isCurator,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!dealId) return;

    try {
      const result = await getComments(dealId, isCurator);
      setComments(result);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dealId, isCurator]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Handle new comment
  const handleCreateComment = useCallback(
    async (content: string, visibility: "public" | "private") => {
      if (!currentUserId) return;

      const newComment = await createComment(
        dealId,
        currentUserId,
        content,
        visibility
      );

      if (newComment) {
        // Refresh comments to get the full structure
        await fetchComments();
      }
    },
    [dealId, currentUserId, fetchComments]
  );

  // Handle reply
  const handleReply = useCallback((commentId: string) => {
    setReplyingTo(commentId);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleSubmitReply = useCallback(
    async (content: string, visibility: "public" | "private") => {
      if (!currentUserId || !replyingTo) return;

      const newComment = await createComment(
        dealId,
        currentUserId,
        content,
        visibility,
        replyingTo
      );

      if (newComment) {
        setReplyingTo(null);
        await fetchComments();
      }
    },
    [dealId, currentUserId, replyingTo, fetchComments]
  );

  // Handle edit
  const handleEdit = useCallback(
    async (commentId: string, content: string) => {
      const updated = await updateComment(commentId, content);
      if (updated) {
        await fetchComments();
      }
    },
    [fetchComments]
  );

  // Handle delete
  const handleDelete = useCallback(
    async (commentId: string) => {
      const deleted = await deleteComment(commentId);
      if (deleted) {
        await fetchComments();
      }
    },
    [fetchComments]
  );

  // Handle resolve
  const handleResolve = useCallback(
    async (commentId: string) => {
      const resolved = await resolveComment(commentId);
      if (resolved) {
        await fetchComments();
      }
    },
    [fetchComments]
  );

  // Handle unresolve
  const handleUnresolve = useCallback(
    async (commentId: string) => {
      const unresolved = await unresolveComment(commentId);
      if (unresolved) {
        await fetchComments();
      }
    },
    [fetchComments]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-foreground">Comments</h2>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comments
          {comments.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({comments.length})
            </span>
          )}
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No comments yet. Be the first to comment!
              </p>
            </div>
          ) : (
            <div className="space-y-1 divide-y">
              {comments.map((comment) => (
                <div key={comment.id}>
                  <CommentCard
                    comment={comment}
                    currentUserId={currentUserId}
                    isCurator={isCurator}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onResolve={handleResolve}
                    onUnresolve={handleUnresolve}
                  />
                  {/* Reply input for this comment */}
                  {replyingTo === comment.id && (
                    <div className="ml-11 mt-2 mb-4">
                      <CommentInput
                        onSubmit={handleSubmitReply}
                        onCancel={handleCancelReply}
                        placeholder={`Reply to ${comment.user.name || comment.user.email || "comment"}...`}
                        isReply
                        showVisibilityToggle={isCurator}
                        defaultVisibility="public"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* New comment input at the bottom */}
      {currentUserId && (
        <div className="p-4 border-t bg-background">
          <CommentInput
            onSubmit={handleCreateComment}
            showVisibilityToggle={isCurator}
            defaultVisibility="public"
          />
        </div>
      )}

      {!currentUserId && (
        <div className="p-4 border-t bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in to leave a comment
          </p>
        </div>
      )}
    </div>
  );
}
