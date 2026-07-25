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

  const showSidebarToggle = ["/", "/random-chat", "/blind-date"].includes(pathname || "");

  return (
    <>
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_5px_15px_-3px_rgba(236,72,153,0.3)] pt-safe">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo or Title with Hamburger */}
        <div className="flex items-center gap-3 text-white font-bold text-xl tracking-tight drop-shadow-sm">
          {showSidebarToggle && (
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 -ml-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <Menu size={24} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/15 border border-white/30 flex items-center justify-center p-1 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <img src="/favicon.png" alt="LoveWithYou Logo" className="w-6 h-6 object-contain drop-shadow" />
            </div>
            <span className="bg-gradient-to-r from-white via-pink-100 to-rose-200 bg-clip-text text-transparent font-extrabold tracking-tight">
              LoveWithYou
            </span>
          </div>
        </div>

        {/* Coin Wallet */}
        <div className="flex items-center gap-1.5 bg-black/20 text-yellow-300 px-3 py-1.5 rounded-full font-bold border border-white/20 backdrop-blur-md shadow-sm">
          <Coins size={16} className="text-yellow-400" />
          <span>{coins}</span>
        </div>
      </div>
    </header>
    <SidebarDrawer isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
