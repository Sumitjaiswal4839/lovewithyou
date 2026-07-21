"use client";

import { usePathname, useRouter } from "next/navigation";
import { Flame, MessageCircle, User, Headphones, Dices, Calendar } from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { triggerLight } = useHaptics();

  // Force Next.js Turbopack to retain this chunk to fix the cache error
  if (typeof window !== "undefined") {
    (window as any).__calendar_cache_fix = Calendar;
  }

  const links = [
    { href: "/", icon: Flame, label: "Match" },
    { href: "/random-chat", icon: Dices, label: "Random" },
    { href: "/blind-date", icon: Headphones, label: "Blind" },
    { href: "/chat", icon: MessageCircle, label: "Chat" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 glass border-t border-glass-border pb-safe">
      <div className="flex justify-around items-center h-16">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <button
              key={href}
              onClick={() => {
                triggerLight();
                router.push(href);
              }}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                isActive ? "text-primary-500" : "text-foreground/50 hover:text-foreground/80"
              )}
            >
              <Icon
                size={24}
                className={cn(
                  "transition-all duration-300",
                  isActive ? "fill-primary-500/20 scale-110" : "scale-100"
                )}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
