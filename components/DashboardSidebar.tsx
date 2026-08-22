"use client";

import { File, Star, Trash, User } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type FileTab = "all" | "starred" | "trash";

interface DashboardSidebarProps {
  activeView: "files" | "profile";
  activeTab: FileTab;
  allCount: number;
  starredCount: number;
  trashCount: number;
  storageUsedBytes: number;
  onSelectTab: (tab: FileTab) => void;
  onSelectProfile: () => void;
}

const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024 * 1024;

function formatGB(bytes: number) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(1);
}

export default function DashboardSidebar({
  activeView,
  activeTab,
  allCount,
  starredCount,
  trashCount,
  storageUsedBytes,
  onSelectTab,
  onSelectProfile,
}: DashboardSidebarProps) {
  const navItemClass = (active: boolean) =>
    `flex w-full items-center gap-2.5 rounded-full px-3.5 py-2.5 text-sm transition-colors ${
      active
        ? "bg-organic-accent-100 font-semibold text-organic-accent-800"
        : "text-foreground hover:bg-muted"
    }`;

  const isFilesTab = (tab: FileTab) => activeView === "files" && activeTab === tab;

  return (
    <aside className="flex w-[230px] flex-shrink-0 flex-col gap-1 border-r border-border p-3.5">
      <button className={navItemClass(isFilesTab("all"))} onClick={() => onSelectTab("all")}>
        <File className="h-[18px] w-[18px]" />
        <span>All Files</span>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs">{allCount}</span>
      </button>
      <button className={navItemClass(isFilesTab("starred"))} onClick={() => onSelectTab("starred")}>
        <Star className="h-[18px] w-[18px]" />
        <span>Starred</span>
        <span className="ml-auto rounded-full bg-organic-accent-100 px-2 py-0.5 text-xs text-organic-accent-800">
          {starredCount}
        </span>
      </button>
      <button className={navItemClass(isFilesTab("trash"))} onClick={() => onSelectTab("trash")}>
        <Trash className="h-[18px] w-[18px]" />
        <span>Trash</span>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs">{trashCount}</span>
      </button>

      <div className="my-2 border-t border-border" />

      <button className={navItemClass(activeView === "profile")} onClick={onSelectProfile}>
        <User className="h-[18px] w-[18px]" />
        <span>Profile</span>
      </button>

      <div className="mt-auto rounded-2xl bg-card p-3.5">
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="font-semibold">Storage</span>
          <span className="text-muted-foreground">
            {formatGB(storageUsedBytes)} GB of {formatGB(STORAGE_QUOTA_BYTES)} GB
          </span>
        </div>
        <Progress value={(storageUsedBytes / STORAGE_QUOTA_BYTES) * 100} className="h-2" />
      </div>
    </aside>
  );
}
