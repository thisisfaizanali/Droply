"use client";

import { File } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FileEmptyStateProps {
  activeTab: string;
}

export default function FileEmptyState({ activeTab }: FileEmptyStateProps) {
  return (
    <Card className="border-none shadow-organic-sm">
      <CardContent className="flex flex-col items-center py-16 text-center">
        <File className="h-10 w-10 text-primary opacity-60" />
        <h3 className="mt-3">
          {activeTab === "all" && "No files available"}
          {activeTab === "starred" && "No starred files"}
          {activeTab === "trash" && "Trash is empty"}
        </h3>
        <p className="mt-2 max-w-md text-muted-foreground">
          {activeTab === "all" &&
            "Upload your first file to get started with your personal cloud storage"}
          {activeTab === "starred" &&
            "Mark important files with a star to find them quickly when you need them"}
          {activeTab === "trash" &&
            "Files you delete will appear here for 30 days before being permanently removed"}
        </p>
      </CardContent>
    </Card>
  );
}
