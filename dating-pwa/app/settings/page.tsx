"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { Moon, Sun, Monitor, Trash2, ArrowLeft } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const setProfile = useUserStore((state) => state.setProfile);
  const setDeviceId = useUserStore((state) => state.setDeviceId);
  const { theme, setTheme } = useTheme();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = () => {
    // In a real app, this would call DELETE /profile API
    setProfile(null as any);
    setDeviceId("");
    router.push("/setup");
  };

  return (
    <div className="flex flex-col h-screen bg-dark-bg">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 bg-white/10 rounded-full text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {/* Theme Settings */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-1">Appearance</h3>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => setTheme("light")} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${theme === 'light' ? 'bg-primary-500/20 border-primary-500 text-primary-400 scale-[1.02] shadow-lg shadow-primary-500/10' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
              <Sun size={24} /> <span className="text-sm font-medium">Light</span>
            </button>
            <button onClick={() => setTheme("dark")} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-primary-500/20 border-primary-500 text-primary-400 scale-[1.02] shadow-lg shadow-primary-500/10' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
              <Moon size={24} /> <span className="text-sm font-medium">Dark</span>
            </button>
            <button onClick={() => setTheme("system")} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${theme === 'system' ? 'bg-primary-500/20 border-primary-500 text-primary-400 scale-[1.02] shadow-lg shadow-primary-500/10' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
              <Monitor size={24} /> <span className="text-sm font-medium">Auto</span>
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-1 mt-6">Legal & Actions</h3>
          
          <button onClick={() => router.push('/privacy')} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-gray-300 shadow-sm">
            <div className="p-2 bg-green-500/20 text-green-400 rounded-lg"><span className="font-bold text-lg leading-none">?</span></div>
            <span className="font-bold">Privacy Policy</span>
          </button>

          <button onClick={() => router.push('/terms')} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-gray-300 shadow-sm mt-3">
            <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg"><span className="font-bold text-lg leading-none">!</span></div>
            <span className="font-bold">Terms & Conditions</span>
          </button>

          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-500/5 hover:bg-red-500/10 transition-colors border border-red-500/10 text-red-400 mt-3 shadow-sm">
              <div className="p-2 bg-red-500/20 text-red-400 rounded-lg"><Trash2 size={20} /></div>
              <span className="font-bold">Delete Account</span>
            </button>
          ) : (
            <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-4 mt-3 animate-in fade-in zoom-in-95 shadow-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-red-400">Are you absolutely sure?</p>
                <p className="text-sm text-red-300/70 mt-1">This will permanently delete your profile, matches, and all your coins.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition text-white font-bold">Cancel</button>
                <button onClick={handleDeleteAccount} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)]">Yes, Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
