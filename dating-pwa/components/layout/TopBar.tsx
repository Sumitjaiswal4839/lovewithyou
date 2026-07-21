"use client";

import { useUserStore } from "@/store/useUserStore";
import { Coins } from "lucide-react";

export function TopBar() {
  const coins = useUserStore((state) => state.coins);

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 glass border-b border-glass-border pt-safe">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo or Title */}
        <div className="flex items-center gap-2 text-primary-500 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-md shadow-primary-500/30">
            <span className="text-sm font-black italic">LW</span>
          </div>
          LoveWith You
        </div>

        {/* Coin Wallet */}
        <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full font-medium border border-amber-500/20">
          <Coins size={16} />
          <span>{coins}</span>
        </div>
      </div>
    </header>
  );
}
