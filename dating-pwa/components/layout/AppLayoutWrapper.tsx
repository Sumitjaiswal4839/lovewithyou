"use client";

import { usePathname } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AdminTrigger } from "@/components/AdminTrigger";
import { A2HSPrompt } from "@/components/A2HSPrompt";
import { PushNotificationPrompt } from "@/components/PushNotificationPrompt";
import ScreenshotShield from "@/components/ScreenshotShield";

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <div className="w-full min-h-screen bg-[#080512] text-white overflow-x-hidden">
        <ScreenshotShield>
          {children}
        </ScreenshotShield>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-dark-bg relative shadow-2xl overflow-x-hidden sm:border-x border-white/5 pb-16 pt-14">
      <ScreenshotShield>
        <TopBar />
        <main className="min-h-full relative">
          {children}
        </main>
        <BottomNav />
        <A2HSPrompt />
        <PushNotificationPrompt />
        <AdminTrigger />
      </ScreenshotShield>
    </div>
  );
}
