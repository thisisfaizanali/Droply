"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Menu } from "lucide-react";
import type { File as FileType } from "@/lib/db/schema";
import DashboardSidebar from "@/components/DashboardSidebar";
import FileList from "@/components/FileList";
import UserProfile from "@/components/UserProfile";

interface DashboardContentProps {
  userId: string;
  userName: string;
}

type FileTab = "all" | "starred" | "trash";

export default function DashboardContent({ userId, userName }: DashboardContentProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeView, setActiveView] = useState<"files" | "profile">(
    tabParam === "profile" ? "profile" : "files"
  );
  const [activeTab, setActiveTab] = useState<FileTab>("all");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setActiveView(tabParam === "profile" ? "profile" : "files");
  }, [tabParam]);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/files?userId=${userId}`;
      if (currentFolder) url += `&parentId=${currentFolder}`;
      const response = await axios.get(url);
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("We couldn't load your files. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [userId, currentFolder]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const filteredFiles = files.filter((file) => {
    if (activeTab === "starred") return file.isStarred && !file.isTrash;
    if (activeTab === "trash") return file.isTrash;
    return !file.isTrash;
  });

  const allCount = files.filter((f) => !f.isTrash).length;
  const starredCount = files.filter((f) => f.isStarred && !f.isTrash).length;
  const trashCount = files.filter((f) => f.isTrash).length;
  const storageUsedBytes = files
    .filter((f) => !f.isTrash && !f.isFolder)
    .reduce((sum, f) => sum + f.size, 0);

  const handleStar = async (fileId: string) => {
    try {
      await axios.patch(`/api/files/${fileId}/star`);
      const file = files.find((f) => f.id === fileId);
      setFiles(files.map((f) => (f.id === fileId ? { ...f, isStarred: !f.isStarred } : f)));
      toast.success(
        file?.isStarred
          ? `"${file?.name}" removed from your starred files`
          : `"${file?.name}" added to your starred files`
      );
    } catch (error) {
      console.error("Error starring file:", error);
      toast.error("We couldn't update the star status. Please try again.");
    }
  };

  const handleTrash = async (fileId: string) => {
    try {
      const response = await axios.patch(`/api/files/${fileId}/trash`);
      const file = files.find((f) => f.id === fileId);
      setFiles(files.map((f) => (f.id === fileId ? { ...f, isTrash: !f.isTrash } : f)));
      toast.success(
        `"${file?.name}" has been ${response.data.isTrash ? "moved to trash" : "restored"}`
      );
    } catch (error) {
      console.error("Error trashing file:", error);
      toast.error("We couldn't update the file status. Please try again.");
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const fileToDelete = files.find((f) => f.id === fileId);
      const response = await axios.delete(`/api/files/${fileId}/delete`);
      if (response.data.success) {
        setFiles(files.filter((f) => f.id !== fileId));
        toast.success(`"${fileToDelete?.name || "File"}" has been permanently removed`);
      } else {
        throw new Error(response.data.error || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("We couldn't delete the file. Please try again later.");
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await axios.delete(`/api/files/empty-trash`);
      setFiles(files.filter((f) => !f.isTrash));
      toast.success(`All ${trashCount} items have been permanently deleted`);
    } catch (error) {
      console.error("Error emptying trash:", error);
      toast.error("We couldn't empty the trash. Please try again later.");
    }
  };

  const handleDownload = async (file: FileType) => {
    try {
      const downloadUrl = file.type.startsWith("image/")
        ? `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/tr:q-100,orig-true/${file.path}`
        : file.fileUrl;

      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error(`Failed to download file: ${response.statusText}`);

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      toast.success(`"${file.name}" is ready to download.`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("We couldn't download the file. Please try again later.");
    }
  };

  const selectTab = (tab: FileTab) => {
    setActiveView("files");
    setActiveTab(tab);
    setCurrentFolder(null);
    setMobileSidebarOpen(false);
  };

  const selectProfile = () => {
    setActiveView("profile");
    setMobileSidebarOpen(false);
  };

  return (
    <div className="relative flex flex-1">
      <button
        className="mb-3 flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm md:hidden"
        onClick={() => setMobileSidebarOpen(true)}
      >
        <Menu className="h-4 w-4" />
        Menu
      </button>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-organic-neutral-900 opacity-20 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 bg-background transition-transform md:static md:z-auto md:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <DashboardSidebar
          activeView={activeView}
          activeTab={activeTab}
          allCount={allCount}
          starredCount={starredCount}
          trashCount={trashCount}
          storageUsedBytes={storageUsedBytes}
          onSelectTab={selectTab}
          onSelectProfile={selectProfile}
        />
      </div>

      <main className="flex-1 px-4 py-2 md:px-8 md:py-4">
        {activeView === "files" ? (
          <FileList
            files={filteredFiles}
            loading={loading}
            activeTab={activeTab}
            userId={userId}
            onStar={handleStar}
            onTrash={handleTrash}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onRefresh={fetchFiles}
            onEmptyTrash={handleEmptyTrash}
            onFolderChange={setCurrentFolder}
          />
        ) : (
          <UserProfile />
        )}
      </main>
    </div>
  );
}
