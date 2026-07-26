"use client";

import { usePathname, useRouter } from "next/navigation";
import { Flame, MessageCircle, User, Dices, GraduationCap } from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { triggerLight } = useHaptics();

  const links = [
    { href: "/", icon: Flame, label: "Match" },
    { href: "/random-chat", icon: Dices, label: "Random" },
    { href: "/campus", icon: GraduationCap, label: "Campus" },
    { href: "/chat", icon: MessageCircle, label: "Chat" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-[#07050e]/95 backdrop-blur-xl border-t border-white/10 pb-safe shadow-2xl transition-colors duration-300">
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
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 relative",
                isActive ? "text-[#D624B8]" : "text-gray-400 hover:text-white"
              )}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-[#D624B8] rounded-full shadow-[0_0_10px_#D624B8]" />
              )}
              <Icon
                size={22}
                className={cn(
                  "transition-all duration-200",
                  isActive ? "scale-110 text-[#D624B8]" : "scale-100"
                )}
              />
              <span className={cn("text-[10px] font-bold tracking-tight", isActive ? "text-[#D624B8] font-black" : "text-gray-400")}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
