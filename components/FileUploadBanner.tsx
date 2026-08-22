"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload, FolderPlus, FileUp } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface FileUploadBannerProps {
  userId: string;
  onUploadSuccess?: () => void;
  currentFolder?: string | null;
}

export default function FileUploadBanner({
  userId,
  onUploadSuccess,
  currentFolder = null,
}: FileUploadBannerProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const uploadFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    if (currentFolder) formData.append("parentId", currentFolder);

    setUploading(true);
    setProgress(0);

    try {
      await axios.post("/api/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });

      toast.success(`${file.name} has been uploaded successfully.`);
      onUploadSuccess?.();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("We couldn't upload your file. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error("Please enter a valid folder name.");
      return;
    }

    setCreatingFolder(true);
    try {
      await axios.post("/api/folders/create", {
        name: folderName.trim(),
        userId,
        parentId: currentFolder,
      });

      toast.success(`Folder "${folderName}" has been created successfully.`);
      setFolderName("");
      setFolderModalOpen(false);
      onUploadSuccess?.();
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("We couldn't create the folder. Please try again.");
    } finally {
      setCreatingFolder(false);
    }
  };

  return (
    <>
      <div
        className="mb-5 flex items-center gap-4 rounded-[24px] border-2 border-dashed p-5"
        style={{
          borderColor: dragOver ? "var(--color-accent)" : "var(--color-divider)",
          background: dragOver ? "var(--color-accent-100)" : "var(--color-surface)",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-organic-accent-100">
          <Upload className="h-[22px] w-[22px] text-organic-accent-700" />
        </div>
        <div className="flex-1">
          <div className="font-semibold">
            {uploading ? `Uploading... ${progress}%` : "Drag and drop to upload"}
          </div>
          <div className="text-sm text-muted-foreground">
            Images up to 5MB, kept private to you
          </div>
        </div>
        <Button variant="outline" onClick={() => setFolderModalOpen(true)}>
          <FolderPlus className="mr-1 h-4 w-4" />
          New folder
        </Button>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <FileUp className="mr-1 h-4 w-4" />
          Upload files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      <Dialog open={folderModalOpen} onOpenChange={setFolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-primary" />
              New folder
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="folderName">Folder name</Label>
            <Input
              id="folderName"
              placeholder="My Images"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!folderName.trim() || creatingFolder}>
              {creatingFolder ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
