"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "card" | "circular" | "text" | "chatRow";
}

export function Skeleton({ className, variant = "text", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-elevated border border-border shrink-0",
        "before:absolute before:inset-0",
        "before:-translate-x-full",
        "before:animate-[shimmer_1.5s_infinite]",
        "before:bg-gradient-to-r",
        "before:from-transparent before:via-white/10 before:to-transparent",
        variant === "circular" && "rounded-full aspect-square",
        variant === "card" && "rounded-3xl w-full h-[600px]",
        variant === "text" && "rounded-md h-4 w-full",
        variant === "chatRow" && "rounded-2xl h-20 w-full",
        className
      )}
      {...props}
    />
  );
}
