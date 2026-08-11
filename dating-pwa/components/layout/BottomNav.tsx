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
    <>
      <svg width="0" height="0" className="absolute pointer-events-none">
        <linearGradient id="vipGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F6A890" />
          <stop offset="33%" stopColor="#EB7D5A" />
          <stop offset="66%" stopColor="#77BAEF" />
          <stop offset="100%" stopColor="#E33C38" />
        </linearGradient>
      </svg>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white backdrop-blur-xl border-t border-border pb-safe shadow-2xl transition-colors duration-300">
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
                !isActive && "text-slate-500 hover:text-slate-800"
              )}
            >
              {isActive && (
                <span 
                  className="absolute top-0 w-8 h-1 rounded-full border-b border-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.6)]" 
                  style={{ background: 'linear-gradient(45deg, #F6A890, #EB7D5A, #77BAEF, #E33C38)' }}
                />
              )}
              <Icon
                size={22}
                className={cn(
                  "transition-all duration-200",
                  isActive ? "scale-110" : "scale-100"
                )}
                stroke={isActive ? "url(#vipGradient)" : "currentColor"}
              />
              <span 
                className={cn("text-[10px] font-bold tracking-tight", isActive ? "font-black" : "text-slate-500")}
                style={isActive ? { backgroundImage: 'linear-gradient(45deg, #F6A890, #EB7D5A, #77BAEF, #E33C38)', WebkitBackgroundClip: 'text', color: 'transparent' } : {}}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
      </nav>
    </>
  );
}
