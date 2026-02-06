"use client";

import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { FileText, File, FileSpreadsheet, FileImage } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Document {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  uploadedBy: string;
  createdAt: Date;
}

interface DocumentListProps {
  documents: Document[];
  selectedDocumentId: string | null;
  onSelectDocument: (document: Document) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(mimeType: string) {
  if (mimeType === "application/pdf") {
    return FileText;
  }
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    mimeType === "text/csv"
  ) {
    return FileSpreadsheet;
  }
  if (mimeType.startsWith("image/")) {
    return FileImage;
  }
  return File;
}

export function DocumentList({
  documents,
  selectedDocumentId,
  onSelectDocument,
}: DocumentListProps) {
  const sortedDocuments = useMemo(() => {
    return [...documents].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [documents]);

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="font-medium text-foreground mb-1">No Documents</h3>
        <p className="text-sm text-muted-foreground">
          No documents have been uploaded to this deal yet
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        {sortedDocuments.map((doc) => {
          const Icon = getFileIcon(doc.mimeType);
          const isSelected = selectedDocumentId === doc.id;
          const isPDF = doc.mimeType === "application/pdf";

          return (
            <button
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              disabled={!isPDF}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                isSelected
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted/50",
                !isPDF && "opacity-50 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 p-2 rounded-md",
                  isSelected ? "bg-primary/10" : "bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "font-medium truncate",
                    isSelected ? "text-accent-foreground" : "text-foreground"
                  )}
                  title={doc.filename}
                >
                  {doc.filename}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{formatFileSize(doc.fileSize)}</span>
                  <span>-</span>
                  <span>
                    {formatDistanceToNow(new Date(doc.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {!isPDF && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Preview not available
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
