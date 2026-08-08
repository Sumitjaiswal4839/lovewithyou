"use client";

import { useUserStore } from "@/store/useUserStore";
import { Coins, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SidebarDrawer } from "../SidebarDrawer";

export function TopBar() {
  const coins = useUserStore((state) => state.coins);
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const showSidebarToggle = true; // Always show hamburger on all app pages

  return (
    <>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-[#07050e]/95 backdrop-blur-xl border-b border-white/10 pt-safe transition-colors duration-300">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo or Title with Hamburger */}
          <div className="flex items-center gap-3 text-white font-bold text-lg tracking-tight">
            {showSidebarToggle && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 -ml-1 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Menu size={22} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#D624B8]/15 border border-[#D624B8]/30 flex items-center justify-center p-1.5 shadow-sm">
                <img src="/favicon.png" alt="LoveWithYou Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-white font-black tracking-tight text-base">
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
