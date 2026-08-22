"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, List, RefreshCw, Trash as TrashIcon, Star, Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import type { File as FileType } from "@/lib/db/schema";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import FileEmptyState from "@/components/FileEmptyState";
import FileIcon from "@/components/FileIcon";
import FileActions from "@/components/FileActions";
import FileLoadingState from "@/components/FileLoadingState";
import FileGrid from "@/components/FileGrid";
import FolderNavigation from "@/components/FolderNavigation";
import FileUploadBanner from "@/components/FileUploadBanner";

interface FileListProps {
  files: FileType[];
  loading: boolean;
  activeTab: "all" | "starred" | "trash";
  userId: string;
  onStar: (id: string) => void;
  onTrash: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (file: FileType) => void;
  onRefresh: () => void;
  onEmptyTrash: () => void;
  onFolderChange: (folderId: string | null) => void;
}

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileList({
  files,
  loading,
  activeTab,
  userId,
  onStar,
  onTrash,
  onDelete,
  onDownload,
  onRefresh,
  onEmptyTrash,
  onFolderChange,
}: FileListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<Array<{ id: string; name: string }>>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  // Switching sidebar tabs always exits whatever folder is open, matching the
  // mockup's behavior (see design spec, "Dashboard" section).
  useEffect(() => {
    setCurrentFolder(null);
    setFolderPath([]);
    onFolderChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const openImageViewer = (file: FileType) => {
    const optimizedUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/tr:q-90,w-1600,h-1200,fo-auto/${file.path}`;
    window.open(optimizedUrl, "_blank");
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolder(folderId);
    setFolderPath([...folderPath, { id: folderId, name: folderName }]);
    onFolderChange(folderId);
  };

  const navigateUp = () => {
    if (folderPath.length === 0) return;
    const newPath = [...folderPath];
    newPath.pop();
    setFolderPath(newPath);
    const newFolderId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
    setCurrentFolder(newFolderId);
    onFolderChange(newFolderId);
  };

  const navigateToPathFolder = (index: number) => {
    if (index < 0) {
      setCurrentFolder(null);
      setFolderPath([]);
      onFolderChange(null);
      return;
    }
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    const newFolderId = newPath[newPath.length - 1].id;
    setCurrentFolder(newFolderId);
    onFolderChange(newFolderId);
  };

  const handleOpen = (file: FileType) => {
    if (file.isFolder) navigateToFolder(file.id, file.name);
    else if (file.type.startsWith("image/")) openImageViewer(file);
  };

  const trashCount = files.filter((f) => f.isTrash).length;

  if (loading) return <FileLoadingState />;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="truncate text-3xl">
          {folderPath.length > 0
            ? folderPath[folderPath.length - 1].name
            : activeTab === "starred"
              ? "Starred Files"
              : activeTab === "trash"
                ? "Trash"
                : "All Files"}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
          {activeTab === "trash" && trashCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => setEmptyTrashModalOpen(true)}>
              <TrashIcon className="mr-1 h-4 w-4" />
              Empty trash
            </Button>
          )}
          <div className="flex overflow-hidden rounded-full border border-border">
            <button
              className={`px-2.5 py-2 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              className={`px-2.5 py-2 ${viewMode === "table" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setViewMode("table")}
              aria-label="Table view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {folderPath.length > 0 && (
        <FolderNavigation
          folderPath={folderPath}
          navigateUp={navigateUp}
          navigateToPathFolder={navigateToPathFolder}
        />
      )}

      {activeTab === "all" && !currentFolder && (
        <FileUploadBanner userId={userId} onUploadSuccess={onRefresh} currentFolder={currentFolder} />
      )}

      {files.length === 0 ? (
        <FileEmptyState activeTab={currentFolder ? "all" : activeTab} />
      ) : viewMode === "grid" ? (
        <FileGrid
          files={files}
          onOpen={handleOpen}
          onStar={onStar}
          onTrash={onTrash}
          onDelete={(file) => {
            setSelectedFile(file);
            setDeleteModalOpen(true);
          }}
          onDownload={onDownload}
        />
      ) : (
        <div className="overflow-hidden rounded-[24px] bg-card shadow-organic-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Size</TableHead>
                  <TableHead className="hidden sm:table-cell">Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow
                    key={file.id}
                    className={file.isFolder || file.type.startsWith("image/") ? "cursor-pointer" : ""}
                    onClick={() => handleOpen(file)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileIcon file={file} />
                        <div>
                          <div className="flex items-center gap-2 font-medium">
                            <span className="max-w-[200px] truncate">{file.name}</span>
                            {file.isStarred && (
                              <Star className="h-3.5 w-3.5 fill-organic-accent text-organic-accent" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground sm:hidden">
                            {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                      {file.isFolder ? "Folder" : file.type}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {file.isFolder ? "-" : formatSize(file.size)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <FileActions
                        file={file}
                        onStar={onStar}
                        onTrash={onTrash}
                        onDelete={(f) => {
                          setSelectedFile(f);
                          setDeleteModalOpen(true);
                        }}
                        onDownload={onDownload}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete permanently?"
        description="Are you sure you want to permanently delete this file?"
        icon={X}
        confirmText="Delete permanently"
        onConfirm={() => selectedFile && onDelete(selectedFile.id)}
        isDangerous
        warningMessage={`You are about to permanently delete "${selectedFile?.name}". This file will be permanently removed from your account and cannot be recovered.`}
      />

      <ConfirmationModal
        isOpen={emptyTrashModalOpen}
        onOpenChange={setEmptyTrashModalOpen}
        title="Empty trash"
        description="Are you sure you want to empty the trash?"
        icon={Trash}
        confirmText="Empty trash"
        onConfirm={onEmptyTrash}
        isDangerous
        warningMessage={`You are about to permanently delete all ${trashCount} items in your trash. These files will be permanently removed from your account and cannot be recovered.`}
      />
    </div>
  );
}
