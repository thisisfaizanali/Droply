"use client";

import { Star, Trash, X, ArrowUpFromLine, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { File as FileType } from "@/lib/db/schema";

interface FileActionsProps {
  file: FileType;
  onStar: (id: string) => void;
  onTrash: (id: string) => void;
  onDelete: (file: FileType) => void;
  onDownload: (file: FileType) => void;
  compact?: boolean;
}

export default function FileActions({
  file,
  onStar,
  onTrash,
  onDelete,
  onDownload,
  compact = false,
}: FileActionsProps) {
  const size = compact ? "icon" : "sm";

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {!file.isTrash && !file.isFolder && (
        <Button variant="outline" size={size} aria-label="Download" onClick={() => onDownload(file)}>
          <Download className="h-3.5 w-3.5" />
          {!compact && <span className="ml-1">Download</span>}
        </Button>
      )}

      {!file.isTrash && (
        <Button
          variant="outline"
          size={size}
          aria-label={file.isStarred ? "Unstar" : "Star"}
          onClick={() => onStar(file.id)}
        >
          <Star
            className={`h-3.5 w-3.5 ${file.isStarred ? "fill-organic-accent text-organic-accent" : ""}`}
          />
          {!compact && <span className="ml-1">{file.isStarred ? "Unstar" : "Star"}</span>}
        </Button>
      )}

      <Button
        variant="outline"
        size={size}
        aria-label={file.isTrash ? "Restore" : "Delete"}
        onClick={() => onTrash(file.id)}
      >
        {file.isTrash ? <ArrowUpFromLine className="h-3.5 w-3.5" /> : <Trash className="h-3.5 w-3.5" />}
        {!compact && <span className="ml-1">{file.isTrash ? "Restore" : "Delete"}</span>}
      </Button>

      {file.isTrash && (
        <Button variant="outline" size={size} aria-label="Remove" onClick={() => onDelete(file)}>
          <X className="h-3.5 w-3.5" />
          {!compact && <span className="ml-1">Remove</span>}
        </Button>
      )}
    </div>
  );
}
