"use client";

import { usePathname, useRouter } from "next/navigation";
import { Flame, MessageCircle, User, Headphones, Dices, GraduationCap } from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { triggerLight } = useHaptics();

  // Removed calendar cache fix

  const links = [
    { href: "/", icon: Flame, label: "Match" },
    { href: "/random-chat", icon: Dices, label: "Random" },
    { href: "/campus", icon: GraduationCap, label: "Campus" },
    { href: "/chat", icon: MessageCircle, label: "Chat" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 border-t border-white/10 pb-safe shadow-[0_-5px_15px_-3px_rgba(236,72,153,0.3)]">
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
                isActive ? "text-white" : "text-white/60 hover:text-white"
              )}
            >
              <Icon
                size={24}
                className={cn(
                  "transition-all duration-300",
                  isActive ? "fill-white/30 scale-110 drop-shadow-md" : "scale-100"
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
