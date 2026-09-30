"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { X, Map, MessageSquare, Moon, Settings, Zap, HeartPulse, GraduationCap, Mail, HelpCircle, Send } from "lucide-react";

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarDrawer({ isOpen, onClose }: SidebarDrawerProps) {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <>
      {/* Backdrop (covers entire screen) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in transition-opacity"
        style={{ zIndex: 100 }}
        onClick={onClose}
      />

      {/* Sidebar Panel (aligned to the left edge of the max-w-md container) */}
      <div
        className="fixed inset-y-0 left-0 sm:left-1/2 sm:-translate-x-[224px] w-[80%] max-w-[320px] bg-background border-r border-border shadow-2xl animate-in slide-in-from-left flex flex-col pt-safe h-[100dvh] overflow-hidden"
        style={{ zIndex: 101 }}
      >

        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-elevated border border-border overflow-hidden">
              {profile?.photo_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profile.photo_url} alt="User" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-black">
                  {profile?.name?.[0] || "?"}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-black text-foreground">{profile?.name || "User"}</h3>
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{profile?.campus || "LoveWithYou"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-surface-elevated text-muted hover:text-foreground rounded-full transition">
            <X size={18} />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">

          <button
            onClick={() => handleNavigate('/blind-date')}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-surface-elevated active:bg-surface-elevated transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
              <HeartPulse size={16} />
            </div>
            <span className="font-bold text-foreground text-sm">Blind Date</span>
          </button>

          <button
            onClick={() => handleNavigate('/nearby-map')}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-surface-elevated active:bg-surface-elevated transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Map size={16} />
            </div>
            <span className="font-bold text-foreground text-sm">Nearby Map</span>
          </button>

          <button
            onClick={() => handleNavigate('/random-chat')}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-surface-elevated active:bg-surface-elevated transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
              <MessageSquare size={16} />
            </div>
            <span className="font-bold text-foreground text-sm">Random Chat</span>
          </button>

          <button
            onClick={() => handleNavigate('/midnight-roulette')}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-surface-elevated active:bg-surface-elevated transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Moon size={16} />
            </div>
            <span className="font-bold text-foreground text-sm">Midnight Roulette</span>
          </button>

          <button
            onClick={() => handleNavigate('/campus')}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-surface-elevated active:bg-surface-elevated transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
              <GraduationCap size={16} />
            </div>
            <span className="font-bold text-foreground text-sm">Campus Hub</span>
          </button>

          <div className="my-2 border-t border-border mx-4" />

          <button
            onClick={() => handleNavigate('/contact')}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-surface-elevated active:bg-surface-elevated transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20 group-hover:scale-110 transition-transform">
              <Mail size={16} />
            </div>
            <span className="font-bold text-foreground text-sm">Contact & Support</span>
          </button>

          <button
            onClick={() => handleNavigate('/feedback')}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-surface-elevated active:bg-surface-elevated transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
              <Send size={16} />
            </div>
            <span className="font-bold text-foreground text-sm">Send Feedback</span>
          </button>

          <button
            onClick={() => handleNavigate('/faq')}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-surface-elevated active:bg-surface-elevated transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 group-hover:scale-110 transition-transform">
              <HelpCircle size={16} />
            </div>
            <span className="font-bold text-foreground text-sm">FAQ & Help Center</span>
          </button>

          <div className="my-2 border-t border-border mx-4" />

          <button
            onClick={() => handleNavigate('/settings')}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-surface-elevated active:bg-surface-elevated transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-surface-elevated text-muted flex items-center justify-center border border-border group-hover:scale-110 transition-transform">
              <Settings size={16} />
            </div>
            <span className="font-bold text-foreground text-sm">Settings & Account</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-background">
          <div className="flex items-center gap-2 text-primary font-black text-sm mb-1 justify-center">
            <Zap size={14} className="fill-primary" /> LoveWithYou
          </div>
          <p className="text-center text-[10px] text-muted">Version 1.0.0</p>
        </div>
      </div>
    </>
  );
}
