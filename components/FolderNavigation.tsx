"use client";

import { ArrowUpFromLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FolderNavigationProps {
  folderPath: Array<{ id: string; name: string }>;
  navigateUp: () => void;
  navigateToPathFolder: (index: number) => void;
}

export default function FolderNavigation({
  folderPath,
  navigateUp,
  navigateToPathFolder,
}: FolderNavigationProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 overflow-x-auto pb-1 text-sm">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        aria-label="Go up one folder"
        onClick={navigateUp}
        disabled={folderPath.length === 0}
      >
        <ArrowUpFromLine className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateToPathFolder(-1)}
        className={folderPath.length === 0 ? "font-semibold" : ""}
      >
        Home
      </Button>
      {folderPath.map((folder, index) => (
        <div key={folder.id} className="flex items-center">
          <span className="mx-1 text-muted-foreground">/</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToPathFolder(index)}
            className={`max-w-[150px] overflow-hidden text-ellipsis ${
              index === folderPath.length - 1 ? "font-semibold" : ""
            }`}
            title={folder.name}
          >
            {folder.name}
          </Button>
        </div>
      ))}
    </div>
  );
}
