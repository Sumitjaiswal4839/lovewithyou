"use client";

import { useUserStore } from "@/store/useUserStore";
import { Coins, Search, Menu } from "lucide-react";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { useState } from "react";
import { CoinHistoryModal } from "@/components/CoinHistoryModal";
import { SidebarDrawer } from "@/components/SidebarDrawer";
import { useRouter } from "next/navigation";

export function TopBar() {
  const coins = useUserStore((state) => state.coins);
  const [showCoinHistory, setShowCoinHistory] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  
  // Secret admin trigger for mobile (tap 5 times)
  const [tapCount, setTapCount] = useState(0);
  const handleLogoTap = () => {
    setTapCount(prev => {
      if (prev + 1 >= 5) {
        router.push('/admin');
        return 0;
      }
      return prev + 1;
    });
    // Reset tap count after 2 seconds of inactivity
    setTimeout(() => setTapCount(0), 2000);
  };

  return (
    <>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-background/95 backdrop-blur-xl border-b border-border pt-safe transition-colors duration-300">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Hamburger Menu instead of Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-1.5 -ml-1 text-foreground hover:bg-surface-elevated rounded-xl transition active:scale-95"
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/search')}
              className="p-1.5 rounded-xl text-secondary hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Coin Wallet with #FFDC17 Gold */}
            <button 
              onClick={() => setShowCoinHistory(true)}
              className="flex items-center gap-1.5 badge-gold px-3 py-1.5 rounded-full font-extrabold text-xs backdrop-blur-md shadow-sm hover:opacity-80 transition active:scale-95"
            >
              <Coins size={14} className="text-[#FFDC17]" />
              <span>{coins}</span>
            </button>
            
            <NotificationBell />
          </div>
        </div>
      </header>
      <CoinHistoryModal isOpen={showCoinHistory} onClose={() => setShowCoinHistory(false)} />
      <SidebarDrawer isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
