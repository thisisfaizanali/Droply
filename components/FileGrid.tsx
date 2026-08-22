"use client";

import { Star } from "lucide-react";
import type { File as FileType } from "@/lib/db/schema";
import FileIcon, { fileTileBg } from "@/components/FileIcon";
import FileActions from "@/components/FileActions";

interface FileGridProps {
  files: FileType[];
  onOpen: (file: FileType) => void;
  onStar: (id: string) => void;
  onTrash: (id: string) => void;
  onDelete: (file: FileType) => void;
  onDownload: (file: FileType) => void;
}

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileGrid({
  files,
  onOpen,
  onStar,
  onTrash,
  onDelete,
  onDownload,
}: FileGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {files.map((file) => (
        <div
          key={file.id}
          className={`overflow-hidden rounded-[24px] bg-card shadow-organic-sm transition-transform hover:-translate-y-0.5 ${
            file.isFolder || file.type.startsWith("image/") ? "cursor-pointer" : ""
          }`}
          onClick={() => onOpen(file)}
        >
          <div className={`flex h-[100px] items-center justify-center ${fileTileBg(file)}`}>
            <FileIcon file={file} variant="tile" />
          </div>
          <div className="p-3.5">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold">{file.name}</span>
              {file.isStarred && (
                <Star className="h-3 w-3 flex-shrink-0 fill-organic-accent text-organic-accent" />
              )}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {file.isFolder ? "—" : formatSize(file.size)} ·{" "}
              {new Date(file.createdAt).toLocaleDateString()}
            </div>
            <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
              <FileActions
                file={file}
                onStar={onStar}
                onTrash={onTrash}
                onDelete={onDelete}
                onDownload={onDownload}
                compact
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
