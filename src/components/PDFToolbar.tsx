"use client";

import { useState, useCallback, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
} from "lucide-react";

interface PDFToolbarProps {
  pageNumber: number;
  numPages: number;
  scale: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  downloadUrl: string;
  filename?: string;
  isLoading?: boolean;
}

export function PDFToolbar({
  pageNumber,
  numPages,
  scale,
  onPrevPage,
  onNextPage,
  onGoToPage,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  downloadUrl,
  filename,
  isLoading = false,
}: PDFToolbarProps) {
  const [pageInputValue, setPageInputValue] = useState<string>(
    pageNumber.toString()
  );

  // Sync input value when pageNumber prop changes
  const handlePageInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPageInputValue(e.target.value);
    },
    []
  );

  const handlePageInputBlur = useCallback(() => {
    const parsed = parseInt(pageInputValue, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= numPages) {
      onGoToPage(parsed);
    } else {
      setPageInputValue(pageNumber.toString());
    }
  }, [pageInputValue, numPages, pageNumber, onGoToPage]);

  const handlePageInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handlePageInputBlur();
      }
    },
    [handlePageInputBlur]
  );

  const handleDownload = useCallback(() => {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "document.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [downloadUrl, filename]);

  // Update input when page changes externally
  if (pageInputValue !== pageNumber.toString() && document.activeElement?.tagName !== "INPUT") {
    setPageInputValue(pageNumber.toString());
  }

  return (
    <div className="flex items-center justify-between border-b bg-background px-4 py-2 gap-4">
      {/* Page Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevPage}
          disabled={isLoading || pageNumber <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Page</span>
          <Input
            type="number"
            min={1}
            max={numPages}
            value={pageInputValue}
            onChange={handlePageInputChange}
            onBlur={handlePageInputBlur}
            onKeyDown={handlePageInputKeyDown}
            disabled={isLoading || numPages === 0}
            className="w-14 h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-muted-foreground">
            of {numPages || "..."}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onNextPage}
          disabled={isLoading || pageNumber >= numPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomOut}
          disabled={isLoading || scale <= 0.5}
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onResetZoom}
          disabled={isLoading}
          className="min-w-[60px]"
        >
          {Math.round(scale * 100)}%
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onZoomIn}
          disabled={isLoading || scale >= 3.0}
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Download Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isLoading}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Download</span>
      </Button>
    </div>
  );
}
