"use client";

import { useUserStore } from "@/store/useUserStore";
import { Coins, Menu } from "lucide-react";
import { useState } from "react";
import { SidebarDrawer } from "../SidebarDrawer";

export function TopBar() {
  const coins = useUserStore((state) => state.coins);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

  const showSidebarToggle = true; // Always show hamburger on all app pages

  return (
    <>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-background/95 backdrop-blur-xl border-b border-border pt-safe transition-colors duration-300">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo or Title with Hamburger */}
          <div className="flex items-center gap-3 text-foreground font-bold text-lg tracking-tight">
            {showSidebarToggle && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 -ml-1 rounded-xl text-secondary hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <Menu size={22} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center p-1.5 border border-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.5)]"
                style={{ background: 'linear-gradient(45deg, #F6A890, #EB7D5A, #77BAEF, #E33C38)' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/favicon.png" alt="LoveWithYou Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-foreground font-black tracking-tight text-base">
                LoveWithYou
              </span>
            </div>
          </div>

          {/* Coin Wallet with #FFDC17 Gold */}
          <div className="flex items-center gap-1.5 badge-gold px-3 py-1.5 rounded-full font-extrabold text-xs backdrop-blur-md shadow-sm">
            <Coins size={14} className="text-[#FFDC17]" />
            <span>{coins}</span>
          </div>
        </div>
      </header>
      <SidebarDrawer isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
