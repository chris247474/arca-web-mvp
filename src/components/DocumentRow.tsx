"use client";

import { Download, FileText, MoreVertical, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentRowProps {
  id: string;
  name: string;
  uploaderName: string;
  uploaderInitials: string;
  uploadedAt: string;
  fileSize: string;
  onView?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}

export function DocumentRow({
  id,
  name,
  uploaderName,
  uploaderInitials,
  uploadedAt,
  fileSize,
  onView,
  onDownload,
  onDelete,
  canDelete = false,
}: DocumentRowProps) {
  return (
    <div
      className="flex items-center gap-3 p-3 hover-elevate rounded-md cursor-pointer"
      onClick={onView}
      data-testid={`row-document-${id}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
        <FileText className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{name}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="h-4 w-4">
            <AvatarFallback className="text-[8px]">
              {uploaderInitials}
            </AvatarFallback>
          </Avatar>
          <span className="truncate">{uploaderName}</span>
          <span>·</span>
          <span>{uploadedAt}</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">{fileSize}</span>
        </div>
      </div>
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDownload}
          data-testid={`button-download-${id}`}
        >
          <Download className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" data-testid={`button-menu-${id}`}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            {canDelete && (
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
