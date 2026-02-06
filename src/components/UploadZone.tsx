"use client";

import { useState, useCallback } from "react";
import { Upload, X, CheckCircle2, LoaderCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uploadDocument, type Document } from "@/lib/actions/documents";

interface UploadZoneProps {
  dealId?: string;
  userId?: string;
  groupId?: string;
  onUpload?: (file: File) => void;
  onUploadComplete?: (document: Document) => void;
  onUploadError?: (error: string) => void;
}

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error" | "upload_failed";

export function UploadZone({
  dealId,
  userId,
  onUpload,
  onUploadComplete,
  onUploadError,
}: UploadZoneProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [isCancelled, setIsCancelled] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("dragging");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      // Validate required props
      if (!dealId || !userId) {
        console.error("UploadZone: dealId and userId are required");
        setState("error");
        setTimeout(() => setState("idle"), 2000);
        return;
      }

      setFileName(file.name);
      setState("uploading");
      setProgress(0);
      setIsCancelled(false);

      // Legacy callback for backwards compatibility
      onUpload?.(file);

      // Simulate progress while uploading
      // In a real implementation, you'd use Supabase's upload progress callback
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        // Call the actual upload server action
        const result = await uploadDocument(dealId, file, userId);

        clearInterval(progressInterval);

        // Check if cancelled during upload
        if (isCancelled) {
          setState("idle");
          setProgress(0);
          setFileName("");
          return;
        }

        if (result) {
          setProgress(100);
          setState("success");
          onUploadComplete?.(result);

          // Reset after success
          setTimeout(() => {
            setState("idle");
            setProgress(0);
            setFileName("");
          }, 2000);
        } else {
          setState("upload_failed");
          onUploadError?.("Upload failed. Please try again.");

          // Reset after error
          setTimeout(() => {
            setState("idle");
            setProgress(0);
            setFileName("");
          }, 3000);
        }
      } catch (error) {
        clearInterval(progressInterval);
        console.error("Upload error:", error);
        setState("upload_failed");
        onUploadError?.("Upload failed. Please try again.");

        // Reset after error
        setTimeout(() => {
          setState("idle");
          setProgress(0);
          setFileName("");
        }, 3000);
      }
    },
    [dealId, userId, onUpload, onUploadComplete, onUploadError, isCancelled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        handleUpload(file);
      } else {
        setState("error");
        setTimeout(() => setState("idle"), 2000);
      }
    },
    [handleUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.type === "application/pdf") {
          handleUpload(file);
        } else {
          setState("error");
          setTimeout(() => setState("idle"), 2000);
        }
      }
    },
    [handleUpload]
  );

  const handleCancel = useCallback(() => {
    setIsCancelled(true);
    setState("idle");
    setProgress(0);
    setFileName("");
  }, []);

  if (state === "uploading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 md:min-h-80 rounded-md border-2 border-dashed border-border bg-muted/50 p-6">
        <LoaderCircle className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
        <p className="font-medium mb-2 text-center truncate max-w-full px-4">
          {fileName}
        </p>
        <Progress value={progress} className="w-full max-w-xs mb-4" />
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 md:min-h-80 rounded-md border-2 border-dashed border-chart-2 bg-chart-2/10 p-6">
        <CheckCircle2 className="h-10 w-10 text-chart-2 mb-4" />
        <p className="font-medium text-chart-2">Upload complete!</p>
      </div>
    );
  }

  if (state === "upload_failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 md:min-h-80 rounded-md border-2 border-dashed border-destructive bg-destructive/10 p-6">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <p className="font-medium text-destructive">Upload failed</p>
        <p className="text-sm text-muted-foreground mt-1">Please try again</p>
      </div>
    );
  }

  return (
    <label
      className={`flex flex-col items-center justify-center min-h-64 md:min-h-80 rounded-md border-2 border-dashed cursor-pointer transition-colors ${
        state === "dragging"
          ? "border-primary bg-primary/5"
          : state === "error"
          ? "border-destructive bg-destructive/5"
          : "border-border bg-muted/30 hover:bg-muted/50"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid="upload-zone"
    >
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileSelect}
        data-testid="input-file"
      />
      <Upload
        className={`h-10 w-10 mb-4 ${
          state === "error" ? "text-destructive" : "text-muted-foreground"
        }`}
      />
      <p className="font-medium mb-1">
        {state === "error" ? "Invalid file type" : "Drop PDF here"}
      </p>
      <p className="text-sm text-muted-foreground mb-4">or tap to browse</p>
      <p className="text-xs text-muted-foreground">PDF files only, max 50MB</p>
    </label>
  );
}
