import React from "react";
import { Flag, AlertTriangle, ShieldCheck, Star, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface KarmaBadgeProps {
  score: number;
  className?: string;
  showText?: boolean;
}

export function KarmaBadge({ score, className, showText = true }: KarmaBadgeProps) {
  const getKarmaDetails = (s: number) => {
    if (s < 50) return { label: "Low Trust", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", Icon: Flag };
    if (s < 90) return { label: "Needs Work", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", Icon: AlertTriangle };
    if (s <= 120) return { label: "Safe", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", Icon: ShieldCheck };
    if (s <= 150) return { label: "Trusted", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", Icon: Star };
    return { label: "Top Karma", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", Icon: Gem };
  };

  const { label, color, bg, border, Icon } = getKarmaDetails(score);

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold backdrop-blur-sm shadow-sm", bg, border, color, className)}>
      <Icon size={14} className="drop-shadow-md" />
      {showText && <span>{label}</span>}
      <span className="opacity-70 text-[10px] ml-0.5 font-mono">({score})</span>
    </div>
  );
}
