"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, X, Lock, Globe } from "lucide-react";

interface CommentInputProps {
  onSubmit: (
    content: string,
    visibility: "public" | "private"
  ) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  isReply?: boolean;
  showVisibilityToggle?: boolean;
  defaultVisibility?: "public" | "private";
  autoFocus?: boolean;
}

export function CommentInput({
  onSubmit,
  onCancel,
  placeholder = "Add a comment...",
  isReply = false,
  showVisibilityToggle = true,
  defaultVisibility = "public",
  autoFocus = false,
}: CommentInputProps) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">(
    defaultVisibility
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = useCallback(async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim(), visibility);
      setContent("");
      setVisibility(defaultVisibility);
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [content, visibility, isSubmitting, onSubmit, defaultVisibility]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Submit on Cmd/Ctrl + Enter
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
      // Cancel reply on Escape
      if (e.key === "Escape" && onCancel) {
        e.preventDefault();
        onCancel();
      }
    },
    [handleSubmit, onCancel]
  );

  const handleCancel = useCallback(() => {
    setContent("");
    setVisibility(defaultVisibility);
    onCancel?.();
  }, [defaultVisibility, onCancel]);

  return (
    <div className="space-y-3">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isSubmitting}
        className="min-h-[80px] resize-none"
        rows={3}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {showVisibilityToggle && (
            <Select
              value={visibility}
              onValueChange={(val) =>
                setVisibility(val as "public" | "private")
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-[130px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5" />
                    <span>Public</span>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Private</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}

          {visibility === "private" && (
            <span className="text-xs text-muted-foreground">
              Only curators can see private comments
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isReply && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
          >
            <Send className="h-4 w-4 mr-1" />
            {isReply ? "Reply" : "Comment"}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Press Cmd/Ctrl + Enter to submit
      </p>
    </div>
  );
}
