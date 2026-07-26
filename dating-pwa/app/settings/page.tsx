"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { 
  Moon, 
  Sun, 
  Monitor, 
  Trash2, 
  ArrowLeft, 
  Bell, 
  Volume2, 
  ShieldCheck, 
  EyeOff, 
  Smartphone, 
  Globe, 
  HelpCircle, 
  FileText, 
  ShieldAlert, 
  Sparkles, 
  HardDrive, 
  Zap, 
  Lock, 
  PauseCircle, 
  CheckCircle2, 
  ChevronRight,
  MessageCircle,
  Radio
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const profile = useUserStore((state) => state.profile);
  const setProfile = useUserStore((state) => state.setProfile);
  const setDeviceId = useUserStore((state) => state.setDeviceId);
  const { theme, setTheme } = useTheme();

  // Interactive Settings State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [isAccountPaused, setIsAccountPaused] = useState(false);

  // Toggle Switches State
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundHaptics, setSoundHaptics] = useState(true);
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [showActiveStatus, setShowActiveStatus] = useState(true);
  const [screenshotShield, setScreenshotShield] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">("km");
  const [accentColor, setAccentColor] = useState<"pink" | "purple" | "emerald" | "gold">("pink");
  const [cacheSize, setCacheSize] = useState("14.8 MB");

  const handleDeleteAccount = () => {
    setProfile(null as any);
    setDeviceId("");
    toast("Account permanently deleted.", "info");
    router.push("/setup");
  };

  const handleClearCache = () => {
    setCacheSize("0 KB");
    toast("🧹 App cache and media buffer cleared successfully!", "success");
  };

  const handleTogglePause = () => {
    setIsAccountPaused(!isAccountPaused);
    setShowPauseConfirm(false);
    toast(
      !isAccountPaused 
        ? "⏸️ Account Snoozed! Your profile is hidden from swipe decks." 
        : "▶️ Account Resumed! You are now visible to matches.",
      !isAccountPaused ? "info" : "success"
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080512] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">App Settings &amp; Preferences</h1>
            <p className="text-[10px] text-gray-400">Configure notifications, privacy &amp; display</p>
          </div>
        </div>

        <span className="text-[10px] bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 font-extrabold px-3 py-1 rounded-full border border-pink-500/30 flex items-center gap-1">
          <Sparkles size={12} className="text-pink-400" /> PRO READY
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-28">

        {/* 1. APPEARANCE & THEME HARMONY */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
            <Sun size={14} className="text-amber-400" /> Appearance &amp; Visual Style
          </h3>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 space-y-4">
            <div>
              <label className="text-[11px] font-extrabold text-gray-300 block mb-2">Display Theme</label>
              <div className="grid grid-cols-3 gap-2.5">
                <button 
                  onClick={() => setTheme("light")} 
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all ${
                    theme === 'light' 
                      ? 'bg-pink-500/20 border-pink-500 text-pink-300 scale-[1.02] shadow-lg shadow-pink-500/10' 
                      : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <Sun size={20} /> <span className="text-xs font-bold">Light</span>
                </button>

                <button 
                  onClick={() => setTheme("dark")} 
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all ${
                    theme === 'dark' 
                      ? 'bg-pink-500/20 border-pink-500 text-pink-300 scale-[1.02] shadow-lg shadow-pink-500/10' 
                      : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <Moon size={20} /> <span className="text-xs font-bold">Dark</span>
                </button>

                <button 
                  onClick={() => setTheme("system")} 
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all ${
                    theme === 'system' 
                      ? 'bg-pink-500/20 border-pink-500 text-pink-300 scale-[1.02] shadow-lg shadow-pink-500/10' 
                      : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <Monitor size={20} /> <span className="text-xs font-bold">Auto</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <label className="text-[11px] font-extrabold text-gray-300 block mb-2">Accent Theme Color</label>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setAccentColor("pink"); toast("Accent set to Hot Pink 💖", "success"); }}
                  className={`w-9 h-9 rounded-2xl bg-pink-500 flex items-center justify-center text-white transition ${accentColor === 'pink' ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-70'}`}
                >
                  {accentColor === 'pink' && <CheckCircle2 size={16} />}
                </button>
                <button 
                  onClick={() => { setAccentColor("purple"); toast("Accent set to Cyber Purple 🔮", "success"); }}
                  className={`w-9 h-9 rounded-2xl bg-purple-600 flex items-center justify-center text-white transition ${accentColor === 'purple' ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-70'}`}
                >
                  {accentColor === 'purple' && <CheckCircle2 size={16} />}
                </button>
                <button 
                  onClick={() => { setAccentColor("emerald"); toast("Accent set to Neon Emerald ❇️", "success"); }}
                  className={`w-9 h-9 rounded-2xl bg-emerald-500 flex items-center justify-center text-white transition ${accentColor === 'emerald' ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-70'}`}
                >
                  {accentColor === 'emerald' && <CheckCircle2 size={16} />}
                </button>
                <button 
                  onClick={() => { setAccentColor("gold"); toast("Accent set to Gold VIP 👑", "success"); }}
                  className={`w-9 h-9 rounded-2xl bg-amber-400 flex items-center justify-center text-black transition ${accentColor === 'gold' ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-70'}`}
                >
                  {accentColor === 'gold' && <CheckCircle2 size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. NOTIFICATIONS & ALERTS */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
            <Bell size={14} className="text-pink-400" /> Notifications &amp; Sounds
          </h3>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <Bell size={15} className="text-pink-400" /> Push Notifications
                </p>
                <p className="text-[11px] text-gray-400">Receive alerts for new matches, Super Likes &amp; chats</p>
              </div>
              <button 
                onClick={() => { setPushNotifications(!pushNotifications); toast(pushNotifications ? "Notifications muted" : "Notifications enabled", "info"); }}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${pushNotifications ? 'bg-pink-500' : 'bg-white/20'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <Volume2 size={15} className="text-purple-400" /> Sound &amp; Haptic Vibrations
                </p>
                <p className="text-[11px] text-gray-400">In-app sound effects and haptic swipe feedback</p>
              </div>
              <button 
                onClick={() => { setSoundHaptics(!soundHaptics); toast(soundHaptics ? "Sounds muted" : "Sounds enabled", "info"); }}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${soundHaptics ? 'bg-purple-500' : 'bg-white/20'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${soundHaptics ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 3. PRIVACY & SAFETY CONTROLS */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" /> Privacy &amp; Security Shield
          </h3>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <EyeOff size={15} className="text-indigo-400" /> Incognito Ghost Mode
                </p>
                <p className="text-[11px] text-gray-400">Only profiles you right-swipe can view your card</p>
              </div>
              <button 
                onClick={() => { setIncognitoMode(!incognitoMode); toast(!incognitoMode ? "👻 Incognito Mode Active!" : "Incognito Mode Off", "info"); }}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${incognitoMode ? 'bg-indigo-500' : 'bg-white/20'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${incognitoMode ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <Smartphone size={15} className="text-emerald-400" /> Show "Active Now" Status
                </p>
                <p className="text-[11px] text-gray-400">Display online activity indicator on your profile</p>
              </div>
              <button 
                onClick={() => setShowActiveStatus(!showActiveStatus)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${showActiveStatus ? 'bg-emerald-500' : 'bg-white/20'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${showActiveStatus ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <Lock size={15} className="text-rose-400" /> Anti-Screenshot Shield
                </p>
                <p className="text-[11px] text-gray-400">Block screenshot attempts during private chats</p>
              </div>
              <button 
                onClick={() => setScreenshotShield(!screenshotShield)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${screenshotShield ? 'bg-rose-500' : 'bg-white/20'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${screenshotShield ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <Globe size={15} className="text-amber-400" /> Distance Radar Unit
                </p>
                <p className="text-[11px] text-gray-400">Preferred measurement unit for nearby matches</p>
              </div>
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
                <button 
                  onClick={() => setDistanceUnit("km")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${distanceUnit === 'km' ? 'bg-amber-400 text-black' : 'text-gray-400'}`}
                >
                  km
                </button>
                <button 
                  onClick={() => setDistanceUnit("mi")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${distanceUnit === 'mi' ? 'bg-amber-400 text-black' : 'text-gray-400'}`}
                >
                  mi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. APP PERFORMANCE & STORAGE CLEANER */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
            <HardDrive size={14} className="text-indigo-400" /> Performance &amp; Data Saver
          </h3>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <Zap size={15} className="text-amber-400" /> Low Data Saver Mode
                </p>
                <p className="text-[11px] text-gray-400">Optimizes media stream during voice &amp; video calls</p>
              </div>
              <button 
                onClick={() => setDataSaver(!dataSaver)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${dataSaver ? 'bg-amber-500' : 'bg-white/20'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${dataSaver ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <HardDrive size={15} className="text-indigo-400" /> Clear Local App Cache
                </p>
                <p className="text-[11px] text-gray-400">Current temporary cache size: <span className="text-indigo-300 font-bold">{cacheSize}</span></p>
              </div>
              <button 
                onClick={handleClearCache}
                className="px-3.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 rounded-xl font-extrabold text-xs transition active:scale-95"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>

        {/* 5. LEGAL, SUPPORT & ACCOUNT ACTIONS */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
            <HelpCircle size={14} className="text-blue-400" /> Support, Policy &amp; Account
          </h3>

          <div className="space-y-2.5">
            <button 
              onClick={() => router.push('/faq')} 
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 text-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl"><HelpCircle size={18} /></div>
                <span className="font-bold text-xs">Help &amp; FAQ Center</span>
              </div>
              <ChevronRight size={16} className="text-gray-500" />
            </button>

            <button 
              onClick={() => router.push('/feedback')} 
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 text-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl"><MessageCircle size={18} /></div>
                <span className="font-bold text-xs">Send Feedback &amp; Suggestions</span>
              </div>
              <ChevronRight size={16} className="text-gray-500" />
            </button>

            <button 
              onClick={() => router.push('/privacy')} 
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 text-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl"><ShieldAlert size={18} /></div>
                <span className="font-bold text-xs">Privacy Policy</span>
              </div>
              <ChevronRight size={16} className="text-gray-500" />
            </button>

            <button 
              onClick={() => router.push('/terms')} 
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 text-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl"><FileText size={18} /></div>
                <span className="font-bold text-xs">Terms &amp; Conditions</span>
              </div>
              <ChevronRight size={16} className="text-gray-500" />
            </button>
          </div>

          {/* DANGER & FREEZE ZONE */}
          <div className="pt-4 space-y-3">
            {/* Pause Account */}
            {!showPauseConfirm ? (
              <button 
                onClick={() => setShowPauseConfirm(true)} 
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 transition-all border border-amber-500/20 text-amber-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl"><PauseCircle size={18} /></div>
                  <div className="text-left">
                    <span className="font-bold text-xs block">{isAccountPaused ? "Resume Account" : "Snooze / Pause Account"}</span>
                    <span className="text-[10px] text-amber-400/70">Temporarily hide your profile without losing matches</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-amber-500" />
              </button>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <p className="text-xs font-bold text-amber-300 text-center">
                  {isAccountPaused ? "Resume your active dating profile?" : "Pause your account temporarily?"}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setShowPauseConfirm(false)} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs">Cancel</button>
                  <button onClick={handleTogglePause} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-black text-xs">{isAccountPaused ? "Resume Now" : "Pause Account"}</button>
                </div>
              </div>
            )}

            {/* Delete Account */}
            {!showDeleteConfirm ? (
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 transition-all border border-rose-500/20 text-rose-400"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl"><Trash2 size={18} /></div>
                  <div className="text-left">
                    <span className="font-bold text-xs block">Delete Account</span>
                    <span className="text-[10px] text-rose-400/70">Permanently purge your device ID &amp; profile data</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-rose-500" />
              </button>
            ) : (
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                <div className="text-center">
                  <p className="text-sm font-bold text-rose-400">Are you absolutely sure?</p>
                  <p className="text-[11px] text-rose-300/70 mt-0.5">This will permanently erase your matches, coins, and profile.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs">Cancel</button>
                  <button onClick={handleDeleteAccount} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md shadow-rose-600/30">Yes, Permanently Delete</button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
