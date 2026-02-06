"use client";

import { useState } from "react";
import { Folder, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DocumentRow } from "./DocumentRow";

export interface DealDocument {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  uploadedBy: string;
  uploaderName: string;
  createdAt: Date;
}

interface DealFolderProps {
  id: string;
  name: string;
  documentCount: number;
  documents: DealDocument[];
  onDownload?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
  onView?: (documentId: string) => void;
  canDelete?: boolean;
  isCurator?: boolean;
  onCreateDeal?: () => void;
  defaultExpanded?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function DealFolder({
  id,
  name,
  documentCount,
  documents,
  onDownload,
  onDelete,
  onView,
  canDelete = false,
  isCurator = false,
  onCreateDeal,
  defaultExpanded = false,
}: DealFolderProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  const documentLabel = documentCount === 1 ? "document" : "documents";

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      data-testid={`deal-folder-${id}`}
    >
      <CollapsibleTrigger asChild>
        <button
          className="flex w-full items-center gap-3 p-3 hover:bg-muted/50 rounded-md transition-colors text-left"
          aria-label={name}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Folder className="h-5 w-5" data-testid="folder-icon" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{name}</p>
            <p className="text-sm text-muted-foreground">
              {documentCount} {documentLabel}
            </p>
          </div>
          <ChevronRight
            className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-[52px] border-l border-border pl-4 space-y-1">
          {documents.map((doc) => (
            <DocumentRow
              key={doc.id}
              id={doc.id}
              name={doc.filename}
              uploaderName={doc.uploaderName}
              uploaderInitials={getInitials(doc.uploaderName)}
              uploadedAt={formatDate(doc.createdAt)}
              fileSize={formatFileSize(doc.fileSize)}
              onView={() => onView?.(doc.id)}
              onDownload={() => onDownload?.(doc.id)}
              onDelete={() => onDelete?.(doc.id)}
              canDelete={canDelete}
            />
          ))}
          {documents.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No documents in this deal yet.
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
