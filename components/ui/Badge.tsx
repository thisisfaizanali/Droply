import { cn } from "@/lib/utils";
import React from "react";

export type BadgeProps = {
  children: React.ReactNode;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  variant?: "solid" | "flat" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export const Badge = ({
  children,
  color = "default",
  variant = "solid",
  size = "md",
  className,
  ...props
}: BadgeProps & React.HTMLAttributes<HTMLSpanElement>) => {
  const colorStyles = {
    default: {
      solid: "bg-muted text-foreground",
      flat: "bg-muted text-foreground",
      outline: "border border-border text-foreground",
    },
    primary: {
      solid: "bg-primary text-primary-foreground",
      flat: "bg-organic-accent-100 text-organic-accent-800",
      outline: "border border-organic-accent-300 text-organic-accent-800",
    },
    secondary: {
      solid: "bg-secondary text-secondary-foreground",
      flat: "bg-muted text-foreground",
      outline: "border border-border text-foreground",
    },
    success: {
      solid: "bg-organic-accent2-600 text-white",
      flat: "bg-organic-accent2-100 text-organic-accent2-800",
      outline: "border border-organic-accent2-300 text-organic-accent2-800",
    },
    warning: {
      solid: "bg-organic-accent-600 text-white",
      flat: "bg-organic-accent-100 text-organic-accent-800",
      outline: "border border-organic-accent-300 text-organic-accent-800",
    },
    danger: {
      solid: "bg-destructive text-destructive-foreground",
      flat: "bg-organic-accent-200 text-organic-accent-900",
      outline: "border border-organic-accent-400 text-organic-accent-900",
    },
  };

  const sizeStyles = {
    sm: "text-xs px-1.5 py-0.5 rounded",
    md: "text-xs px-2 py-1 rounded-md",
    lg: "text-sm px-2.5 py-1 rounded-md",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-medium",
        colorStyles[color][variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
