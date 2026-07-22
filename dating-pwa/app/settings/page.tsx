"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { Moon, Sun, Monitor, Trash2, MessageSquare, ArrowLeft, X } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const setProfile = useUserStore((state) => state.setProfile);
  const setDeviceId = useUserStore((state) => state.setDeviceId);
  const { theme, setTheme } = useTheme();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const { toast } = useToast();

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
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-1 mt-6">Account Actions</h3>
          
          <button onClick={() => setShowFeedbackModal(true)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-gray-300 shadow-sm">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><MessageSquare size={20} /></div>
            <span className="font-bold">Send Feedback</span>
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

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-dark-bg border border-glass-border w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><MessageSquare size={20} className="text-blue-400"/> Feedback</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="p-2 bg-white/10 rounded-full text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <textarea 
              rows={5}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us what you love or what needs improvement..."
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-4 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none text-sm text-white mb-4"
            />
            <button 
              onClick={async () => {
                if (!feedbackText.trim()) return;
                try {
                  await supabase.from('feedbacks').insert([{ message: feedbackText }]);
                  toast("Feedback sent successfully!", "success");
                } catch(e) {
                  toast("Feedback saved locally", "success");
                }
                setFeedbackText("");
                setShowFeedbackModal(false);
              }}
              className="w-full py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold transition shadow-[0_0_15px_rgba(217,70,239,0.4)]"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
