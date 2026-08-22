"use client";

import { Folder, FileText, Video } from "lucide-react";
import { IKImage } from "imagekitio-next";
import type { File as FileType } from "@/lib/db/schema";

interface FileIconProps {
  file: FileType;
  variant?: "row" | "tile";
}

export default function FileIcon({ file, variant = "row" }: FileIconProps) {
  const size = variant === "tile" ? 34 : 18;
  const isTile = variant === "tile";

  if (file.isFolder) {
    return (
      <Folder
        width={size}
        height={size}
        className={isTile ? "text-organic-accent-700" : "h-[18px] w-[18px] text-organic-accent-700"}
      />
    );
  }

  const fileType = file.type.split("/")[0];

  if (fileType === "image") {
    return (
      <div
        className={
          isTile
            ? "relative h-full w-full overflow-hidden"
            : "relative h-12 w-12 overflow-hidden rounded"
        }
      >
        <IKImage
          path={file.path}
          transformation={[{ height: 200, width: 200, focus: "auto", quality: 80, dpr: 2 }]}
          loading="lazy"
          lqip={{ active: true }}
          alt={file.name}
          style={{ objectFit: "cover", height: "100%", width: "100%" }}
        />
      </div>
    );
  }

  const cls = isTile ? "text-organic-accent2-700" : "h-[18px] w-[18px] text-organic-accent2-700";

  if (fileType === "application" && file.type.includes("pdf")) {
    return <FileText width={size} height={size} className={cls} />;
  }
  if (fileType === "video") {
    return <Video width={size} height={size} className={cls} />;
  }
  return <FileText width={size} height={size} className={cls} />;
}

/** Tile background color for grid cards — folders and documents get a tinted
 * backdrop behind their icon; images fill the tile with their own thumbnail. */
export function fileTileBg(file: FileType) {
  if (file.isFolder) return "bg-organic-accent-100";
  const fileType = file.type.split("/")[0];
  if (fileType === "image") return "bg-organic-neutral-200";
  return "bg-organic-accent2-100";
}
