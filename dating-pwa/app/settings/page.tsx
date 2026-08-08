"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { 
  Moon, 
  Sun, 
  Monitor,
  Trash2, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  Sliders, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  UserCheck, 
  Globe, 
  Type, 
  Image as ImageIcon, 
  Crown, 
  MessageSquare, 
  Users, 
  FileText, 
  ShieldAlert, 
  Key, 
  Bell, 
  Volume2,
  HardDrive,
  Zap,
  PauseCircle,
  HelpCircle,
  MessageCircle,
  CheckCircle2,
  Check, 
  X, 
  Languages, 
  UserX,
  AlertOctagon,
  LifeBuoy
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const profile = useUserStore((state) => state.profile);
  const setProfile = useUserStore((state) => state.setProfile);
  const setDeviceId = useUserStore((state) => state.setDeviceId);
  const deviceId = useUserStore((state) => state.deviceId);
  const { theme, setTheme } = useTheme();

  // Settings State
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundHaptics, setSoundHaptics] = useState(true);
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [showActiveStatus, setShowActiveStatus] = useState(true);
  const [screenshotShield, setScreenshotShield] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">("km");
  const [accentColor, setAccentColor] = useState<"pink" | "purple" | "emerald" | "gold">("pink");
  const [cacheSize, setCacheSize] = useState("14.8 MB");
  const [isAccountPaused, setIsAccountPaused] = useState(false);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);

  // Toggles State
  const [allowFriendSearch, setAllowFriendSearch] = useState(true);
  const [allowAutoFriendAccept, setAllowAutoFriendAccept] = useState(false);
  const [automaticTranslation, setAutomaticTranslation] = useState(true);
  const [appLanguage, setAppLanguage] = useState("System defaults");
  const [fontSize, setFontSize] = useState(10);
  const [photoPickerType, setPhotoPickerType] = useState("Classic Photo Picker");
  const [encryptedChat, setEncryptedChat] = useState(false);
  const [autoGreeting, setAutoGreeting] = useState("Hey! Happy to connect here 😊✨");

  // Modals Controls
  const [showUserCode, setShowUserCode] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Match Preferences State
  const [matchAgeMin, setMatchAgeMin] = useState(18);
  const [matchAgeMax, setMatchAgeMax] = useState(30);
  const [matchRadiusKm, setMatchRadiusKm] = useState(50);
  const [selectedAvatar, setSelectedAvatar] = useState("🦊 Cyber Fox");
  const [alarmTime, setAlarmTime] = useState("22:00");
  const [alarmEnabled, setAlarmEnabled] = useState(true);

  // Lists
  const [blockedList, setBlockedList] = useState([
    { id: "b-1", name: "Anonymous_99", reason: "Harassment", date: "2026-07-20" },
    { id: "b-2", name: "Spam_Bot_X", reason: "Unsolicited Links", date: "2026-07-22" }
  ]);

  const [reportedList, setReportedList] = useState([
    { id: "r-1", name: "Fake_Profile_4", status: "Under Review by Moderation Team" }
  ]);

  const handleDeleteAccount = () => {
    setProfile(null as any);
    setDeviceId("");
    toast("Account permanently deleted.", "info");
    router.push("/setup");
  };

  const handleClearCache = () => {
    setCacheSize("0 KB");
    toast("🧹 App cache & media buffer cleared successfully!", "success");
  };

  const handleTogglePause = () => {
    setIsAccountPaused(!isAccountPaused);
    setShowPauseConfirm(false);
    toast(
      !isAccountPaused 
        ? "⏸️ Account Snoozed! Profile hidden from swipe decks." 
        : "▶️ Account Resumed! Visible to matches.",
      !isAccountPaused ? "info" : "success"
    );
  };

  const handleUnblockUser = (id: string, name: string) => {
    setBlockedList(prev => prev.filter(u => u.id !== id));
    toast(`Unblocked ${name} successfully!`, "success");
  };

  const userSecretCode = deviceId ? `LWY-${deviceId.substring(0, 8).toUpperCase()}` : "LWY-8891-X792";

  return (
    <div className="flex flex-col min-h-screen bg-[#080512] text-white font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/70 backdrop-blur-xl sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-black text-white tracking-tight">Settings</h1>
            <p className="text-[10px] text-gray-400">Clean &amp; De-duplicated Settings Suite</p>
          </div>
        </div>

        <span className="text-[10px] bg-rose-500/20 text-rose-300 font-extrabold px-3 py-1 rounded-full border border-rose-500/30 flex items-center gap-1">
          <Sparkles size={12} /> v5.4.30
        </span>
      </div>

      {/* Main Settings Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-28">

        {/* 1. MATCHING & CHAT */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-4 rounded-full bg-rose-500"></div>
            <h3 className="text-sm font-black text-white tracking-tight">Matching &amp; Chat</h3>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden divide-y divide-white/5">
            <button onClick={() => setActiveModal("alarm")} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition text-left">
              <span className="text-xs font-bold text-gray-200">Alarm setting</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">{alarmEnabled ? alarmTime : "Off"}</span>
                <ChevronRight size={16} className="text-gray-500" />
              </div>
            </button>

            <button onClick={() => setActiveModal("avatar")} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition text-left">
              <span className="text-xs font-bold text-gray-200">Avatar</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-rose-300 font-bold">{selectedAvatar}</span>
                <ChevronRight size={16} className="text-gray-500" />
              </div>
            </button>

            <button onClick={() => setActiveModal("match_settings")} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition text-left">
              <span className="text-xs font-bold text-gray-200">Match Settings</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">{matchAgeMin}-{matchAgeMax} yrs • {matchRadiusKm}km</span>
                <ChevronRight size={16} className="text-gray-500" />
              </div>
            </button>

            <div className="flex items-center justify-between p-4">
              <span className="text-xs font-bold text-gray-200">Allow friend search</span>
              <input type="checkbox" checked={allowFriendSearch} onChange={(e) => setAllowFriendSearch(e.target.checked)} className="w-5 h-5 accent-rose-500 cursor-pointer" />
            </div>

            <div className="flex items-center justify-between p-4">
              <span className="text-xs font-bold text-gray-200">Allow Auto-Friend Accept</span>
              <input type="checkbox" checked={allowAutoFriendAccept} onChange={(e) => setAllowAutoFriendAccept(e.target.checked)} className="w-5 h-5 accent-rose-500 cursor-pointer" />
            </div>

            <div className="flex items-center justify-between p-4">
              <span className="text-xs font-bold text-gray-200">Automatic Translation</span>
              <input type="checkbox" checked={automaticTranslation} onChange={(e) => setAutomaticTranslation(e.target.checked)} className="w-5 h-5 accent-rose-500 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* 2. APP PREFERENCES */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-4 rounded-full bg-purple-500"></div>
            <h3 className="text-sm font-black text-white tracking-tight">App Preferences</h3>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden divide-y divide-white/5">
            <div className="flex items-center justify-between p-4">
              <span className="text-xs font-bold text-gray-200">Dark Mode</span>
              <input type="checkbox" checked={theme === "dark"} onChange={(e) => setTheme(e.target.checked ? "dark" : "light")} className="w-5 h-5 accent-rose-500 cursor-pointer" />
            </div>

            <div className="p-4 space-y-2">
              <span className="text-xs font-bold text-gray-200 block">Accent Theme Color</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setAccentColor("pink"); toast("Accent set to Hot Pink 💖", "success"); }}
                  className={`w-8 h-8 rounded-2xl bg-pink-500 flex items-center justify-center text-white transition ${accentColor === 'pink' ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-70'}`}
                >
                  {accentColor === 'pink' && <CheckCircle2 size={14} />}
                </button>
                <button 
                  onClick={() => { setAccentColor("purple"); toast("Accent set to Cyber Purple 🔮", "success"); }}
                  className={`w-8 h-8 rounded-2xl bg-purple-600 flex items-center justify-center text-white transition ${accentColor === 'purple' ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-70'}`}
                >
                  {accentColor === 'purple' && <CheckCircle2 size={14} />}
                </button>
                <button 
                  onClick={() => { setAccentColor("emerald"); toast("Accent set to Neon Emerald ❇️", "success"); }}
                  className={`w-8 h-8 rounded-2xl bg-emerald-500 flex items-center justify-center text-white transition ${accentColor === 'emerald' ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-70'}`}
                >
                  {accentColor === 'emerald' && <CheckCircle2 size={14} />}
                </button>
                <button 
                  onClick={() => { setAccentColor("gold"); toast("Accent set to Gold VIP 👑", "success"); }}
                  className={`w-8 h-8 rounded-2xl bg-amber-400 flex items-center justify-center text-black transition ${accentColor === 'gold' ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-70'}`}
                >
                  {accentColor === 'gold' && <CheckCircle2 size={14} />}
                </button>
              </div>
            </div>

            <button onClick={() => setActiveModal("language")} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition text-left">
              <span className="text-xs font-bold text-gray-200">App Language Settings</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">{appLanguage}</span>
                <ChevronRight size={16} className="text-gray-500" />
              </div>
            </button>

            <button onClick={() => setActiveModal("fontsize")} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition text-left">
              <span className="text-xs font-bold text-gray-200">App Font Size</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">{fontSize}</span>
                <ChevronRight size={16} className="text-gray-500" />
              </div>
            </button>

            <button onClick={() => setActiveModal("photo_picker")} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition text-left">
              <span className="text-xs font-bold text-gray-200">Photo Picker</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">{photoPickerType}</span>
                <ChevronRight size={16} className="text-gray-500" />
              </div>
            </button>
          </div>
        </div>

        {/* 3. PREMIUM */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-4 rounded-full bg-amber-400"></div>
            <h3 className="text-sm font-black text-white tracking-tight">Premium</h3>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden divide-y divide-white/5">
            <button onClick={() => router.push("/premium")} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition text-left">
              <span className="text-xs font-bold text-gray-200">PREMIUM Subscription Information</span>
              <ChevronRight size={16} className="text-gray-500" />
            </button>

            <button onClick={() => setActiveModal("auto_greeting")} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition text-left">
              <span className="text-xs font-bold text-gray-200">Auto greeting message</span>
              <ChevronRight size={16} className="text-gray-500" />
            </button>

            <div className="flex items-center justify-between p-4">
              <span className="text-xs font-bold text-gray-200">Encrypted Chat</span>
              <input type="checkbox" checked={encryptedChat} onChange={(e) => setEncryptedChat(e.target.checked)} className="w-5 h-5 accent-rose-500 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* 4. PRIVACY & SECURITY SHIELD */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-4 rounded-full bg-emerald-400"></div>
            <h3 className="text-sm font-black text-white tracking-tight">Privacy &amp; Security Shield</h3>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <EyeOff size={15} className="text-indigo-400" /> Incognito Ghost Mode
                </p>
                <p className="text-[11px] text-gray-400">Only profiles you right-swipe can view your card</p>
              </div>
              <button 
                onClick={() => { setIncognitoMode(!incognitoMode); toast(!incognitoMode ? "👻 Incognito Active!" : "Incognito Off", "info"); }}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${incognitoMode ? 'bg-indigo-500' : 'bg-white/20'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${incognitoMode ? 'translate-x-6' : 'translate-x-0'}`} />
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
                  <Bell size={15} className="text-pink-400" /> Push Notifications
                </p>
                <p className="text-[11px] text-gray-400">Alerts for matches &amp; chats</p>
              </div>
              <button 
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${pushNotifications ? 'bg-pink-500' : 'bg-white/20'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <Volume2 size={15} className="text-purple-400" /> Sound &amp; Haptics
                </p>
                <p className="text-[11px] text-gray-400">Swipe sound &amp; vibration feedback</p>
              </div>
              <button 
                onClick={() => setSoundHaptics(!soundHaptics)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${soundHaptics ? 'bg-purple-500' : 'bg-white/20'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${soundHaptics ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <Globe size={15} className="text-amber-400" /> Distance Radar Unit
                </p>
                <p className="text-[11px] text-gray-400">Measurement unit for matches</p>
              </div>
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
                <button onClick={() => setDistanceUnit("km")} className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${distanceUnit === 'km' ? 'bg-amber-400 text-black' : 'text-gray-400'}`}>km</button>
                <button onClick={() => setDistanceUnit("mi")} className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${distanceUnit === 'mi' ? 'bg-amber-400 text-black' : 'text-gray-400'}`}>mi</button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. PERFORMANCE & STORAGE CLEANER */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-4 rounded-full bg-indigo-500"></div>
            <h3 className="text-sm font-black text-white tracking-tight">Performance &amp; Storage Cleaner</h3>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <Zap size={15} className="text-amber-400" /> Low Data Saver Mode
                </p>
                <p className="text-[11px] text-gray-400">Optimizes media stream during calls</p>
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
                <p className="text-[11px] text-gray-400">Current cache: <span className="text-indigo-300 font-bold">{cacheSize}</span></p>
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

        {/* 6. DATA MANAGEMENT */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-4 rounded-full bg-blue-500"></div>
            <h3 className="text-sm font-black text-white tracking-tight">Data management</h3>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden divide-y divide-white/5">
            <button onClick={() => setActiveModal("blocked")} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition text-left">
              <span className="text-xs font-bold text-gray-200">Block friend management</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">{blockedList.length} users</span>
                <ChevronRight size={16} className="text-gray-500" />
              </div>
            </button>

            <button onClick={() => setActiveModal("reported")} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition text-left">
              <span className="text-xs font-bold text-gray-200">Reported user management</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">{reportedList.length} tickets</span>
                <ChevronRight size={16} className="text-gray-500" />
              </div>
            </button>
          </div>
        </div>

        {/* 7. POLICY & ACCOUNT */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-4 rounded-full bg-emerald-500"></div>
            <h3 className="text-sm font-black text-white tracking-tight">Policy &amp; Account</h3>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden divide-y divide-white/5">
            <div className="flex items-center justify-between p-4">
              <span className="text-xs font-bold text-gray-200">User code</span>
              <div className="flex items-center gap-2">
                {showUserCode ? (
                  <span className="text-xs font-mono font-black text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-lg border border-rose-500/30">
                    {userSecretCode}
                  </span>
                ) : (
                  <span className="text-xs font-mono text-gray-500">••••••••••</span>
                )}
                <button onClick={() => setShowUserCode(!showUserCode)} className="p-1 text-gray-400 hover:text-white transition">
                  {showUserCode ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button onClick={() => setActiveModal("recovery")} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition text-left">
              <span className="text-xs font-bold text-gray-200">Account recovery</span>
              <ChevronRight size={16} className="text-gray-500" />
            </button>

            <button onClick={() => router.push("/terms")} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition text-left">
              <span className="text-xs font-bold text-gray-200">Terms of Service</span>
              <ChevronRight size={16} className="text-gray-500" />
            </button>

            <button onClick={() => setActiveModal("child_safety")} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition text-left">
              <span className="text-xs font-bold text-gray-200">Child Safety Policy</span>
              <ChevronRight size={16} className="text-gray-500" />
            </button>

            <button onClick={() => router.push("/privacy")} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition text-left">
              <span className="text-xs font-bold text-gray-200">Privacy Policy</span>
              <ChevronRight size={16} className="text-gray-500" />
            </button>

            <div className="flex items-center justify-between p-4">
              <span className="text-xs font-bold text-gray-200">Version</span>
              <span className="text-xs font-bold text-gray-400">5.4.30</span>
            </div>

            {!showPauseConfirm ? (
              <button onClick={() => setShowPauseConfirm(true)} className="w-full flex items-center justify-between p-4 hover:bg-amber-500/10 transition text-left">
                <span className="text-xs font-bold text-amber-300">{isAccountPaused ? "Resume Account" : "Snooze / Pause Account"}</span>
                <ChevronRight size={16} className="text-amber-500" />
              </button>
            ) : (
              <div className="p-4 bg-amber-500/10 border-t border-amber-500/20 space-y-3">
                <p className="text-xs font-bold text-amber-300 text-center">
                  {isAccountPaused ? "Resume your active dating profile?" : "Pause your account temporarily?"}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setShowPauseConfirm(false)} className="flex-1 py-2 bg-white/10 rounded-xl text-xs font-bold">Cancel</button>
                  <button onClick={handleTogglePause} className="flex-1 py-2 bg-amber-500 text-black rounded-xl text-xs font-black">{isAccountPaused ? "Resume Now" : "Pause Account"}</button>
                </div>
              </div>
            )}

            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-between p-4 hover:bg-rose-500/10 transition text-left">
                <span className="text-xs font-bold text-rose-500">Delete account</span>
                <ChevronRight size={16} className="text-rose-500" />
              </button>
            ) : (
              <div className="p-4 bg-rose-500/10 border-t border-rose-500/20 space-y-3">
                <p className="text-xs font-bold text-rose-300 text-center">
                  Are you sure you want to permanently delete your account?
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 bg-white/10 rounded-xl text-xs font-bold">Cancel</button>
                  <button onClick={handleDeleteAccount} className="flex-1 py-2 bg-rose-600 rounded-xl text-xs font-black text-white">Yes, Delete</button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ALL INTERACTIVE MODALS */}
      <AnimatePresence>
        {activeModal === "alarm" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e0a1f] border border-white/10 w-full max-w-sm rounded-3xl p-5 space-y-4 text-center">
              <h3 className="text-base font-black text-white">Alarm &amp; Match Notifications</h3>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-xs font-bold">Enable Daily Reminder</span>
                <input type="checkbox" checked={alarmEnabled} onChange={(e) => setAlarmEnabled(e.target.checked)} className="w-5 h-5 accent-rose-500" />
              </div>
              <input type="time" value={alarmTime} onChange={(e) => setAlarmTime(e.target.value)} className="bg-black/60 border border-white/10 text-white rounded-xl p-3 w-full text-center text-lg font-bold" />
              <button onClick={() => { setActiveModal(null); toast("Alarm setting saved!", "success"); }} className="w-full py-3 bg-rose-500 rounded-2xl font-black text-xs">Save Alarm</button>
            </div>
          </motion.div>
        )}

        {activeModal === "avatar" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e0a1f] border border-white/10 w-full max-w-sm rounded-3xl p-5 space-y-4">
              <h3 className="text-base font-black text-white text-center">Select Your Avatar</h3>
              <div className="grid grid-cols-2 gap-2">
                {["🦊 Cyber Fox", "🐱 Neon Cat", "🐼 Zen Panda", "🦁 Gold Lion"].map(av => (
                  <button key={av} onClick={() => { setSelectedAvatar(av); setActiveModal(null); toast(`Avatar set to ${av}`, "success"); }} className={`p-3 rounded-2xl text-xs font-bold border ${selectedAvatar === av ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-white/5 border-white/10'}`}>
                    {av}
                  </button>
                ))}
              </div>
              <button onClick={() => setActiveModal(null)} className="w-full py-2 bg-white/10 rounded-xl text-xs font-bold">Close</button>
            </div>
          </motion.div>
        )}

        {activeModal === "match_settings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e0a1f] border border-white/10 w-full max-w-sm rounded-3xl p-5 space-y-4">
              <h3 className="text-base font-black text-white text-center">Match Preferences</h3>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">Age Range: {matchAgeMin} - {matchAgeMax} years</label>
                <div className="flex gap-2">
                  <input type="range" min="18" max="50" value={matchAgeMin} onChange={(e) => setMatchAgeMin(Number(e.target.value))} className="w-full accent-rose-500" />
                  <input type="range" min="18" max="60" value={matchAgeMax} onChange={(e) => setMatchAgeMax(Number(e.target.value))} className="w-full accent-rose-500" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">Distance Radius: {matchRadiusKm} km</label>
                <input type="range" min="5" max="200" value={matchRadiusKm} onChange={(e) => setMatchRadiusKm(Number(e.target.value))} className="w-full accent-rose-500" />
              </div>
              <button onClick={() => { setActiveModal(null); toast("Match preferences updated!", "success"); }} className="w-full py-3 bg-rose-500 rounded-2xl font-black text-xs">Save Match Filters</button>
            </div>
          </motion.div>
        )}

        {activeModal === "language" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e0a1f] border border-white/10 w-full max-w-sm rounded-3xl p-5 space-y-3">
              <h3 className="text-base font-black text-white text-center">App Language Settings</h3>
              {["System defaults", "English (US)", "Hindi (हिन्दी)", "Spanish (Español)", "French (Français)"].map(lang => (
                <button key={lang} onClick={() => { setAppLanguage(lang); setActiveModal(null); toast(`Language set to ${lang}`, "info"); }} className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-left border border-white/10 flex items-center justify-between">
                  <span>{lang}</span>
                  {appLanguage === lang && <Check size={16} className="text-rose-400" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {activeModal === "fontsize" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e0a1f] border border-white/10 w-full max-w-sm rounded-3xl p-5 space-y-4 text-center">
              <h3 className="text-base font-black text-white">App Font Size</h3>
              <div className="grid grid-cols-3 gap-2">
                {[8, 10, 12].map(sz => (
                  <button key={sz} onClick={() => { setFontSize(sz); setActiveModal(null); toast(`Font size set to ${sz}`, "info"); }} className={`p-3 rounded-2xl text-xs font-bold border ${fontSize === sz ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-white/5 border-white/10'}`}>
                    Size {sz}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeModal === "photo_picker" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e0a1f] border border-white/10 w-full max-w-sm rounded-3xl p-5 space-y-3">
              <h3 className="text-base font-black text-white text-center">Photo Picker Type</h3>
              {["Classic Photo Picker", "HD Cloudinary Cloud Picker", "System Native Gallery"].map(p => (
                <button key={p} onClick={() => { setPhotoPickerType(p); setActiveModal(null); toast(`Photo picker set to ${p}`, "info"); }} className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold text-left border border-white/10">
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {activeModal === "auto_greeting" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e0a1f] border border-white/10 w-full max-w-sm rounded-3xl p-5 space-y-4">
              <h3 className="text-base font-black text-white text-center">Auto Greeting Message</h3>
              <textarea value={autoGreeting} onChange={(e) => setAutoGreeting(e.target.value)} className="w-full h-24 bg-black/60 border border-white/10 rounded-2xl p-3 text-xs text-white outline-none" />
              <button onClick={() => { setActiveModal(null); toast("Auto greeting message saved!", "success"); }} className="w-full py-3 bg-rose-500 rounded-2xl font-black text-xs">Save Message</button>
            </div>
          </motion.div>
        )}

        {activeModal === "blocked" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e0a1f] border border-white/10 w-full max-w-sm rounded-3xl p-5 space-y-4">
              <h3 className="text-base font-black text-white text-center">Block Friend Management</h3>
              {blockedList.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No blocked users.</p>
              ) : (
                blockedList.map(u => (
                  <div key={u.id} className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10">
                    <div>
                      <p className="text-xs font-bold text-white">{u.name}</p>
                      <p className="text-[10px] text-gray-400">{u.reason}</p>
                    </div>
                    <button onClick={() => handleUnblockUser(u.id, u.name)} className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-[10px] font-bold">Unblock</button>
                  </div>
                ))
              )}
              <button onClick={() => setActiveModal(null)} className="w-full py-2 bg-white/10 rounded-xl text-xs font-bold">Close</button>
            </div>
          </motion.div>
        )}

        {activeModal === "reported" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e0a1f] border border-white/10 w-full max-w-sm rounded-3xl p-5 space-y-4">
              <h3 className="text-base font-black text-white text-center">Reported User Tickets</h3>
              {reportedList.map(r => (
                <div key={r.id} className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
                  <p className="text-xs font-bold text-white">{r.name}</p>
                  <p className="text-[10px] text-amber-400 font-bold">{r.status}</p>
                </div>
              ))}
              <button onClick={() => setActiveModal(null)} className="w-full py-2 bg-white/10 rounded-xl text-xs font-bold">Close</button>
            </div>
          </motion.div>
        )}

        {activeModal === "recovery" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e0a1f] border border-white/10 w-full max-w-sm rounded-3xl p-5 space-y-4 text-center">
              <h3 className="text-base font-black text-white">Account Recovery Code</h3>
              <p className="text-xs text-gray-400">Save this code to restore your profile on a new device.</p>
              <div className="p-3 bg-black/60 border border-white/10 rounded-2xl text-rose-300 font-mono font-bold text-sm tracking-wider">
                REC-8892-LWY-2026
              </div>
              <button onClick={() => { setActiveModal(null); toast("Recovery code copied!", "success"); }} className="w-full py-3 bg-rose-500 rounded-2xl font-black text-xs">Copy &amp; Close</button>
            </div>
          </motion.div>
        )}

        {activeModal === "child_safety" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0e0a1f] border border-white/10 w-full max-w-sm rounded-3xl p-5 space-y-3 max-h-[80vh] overflow-y-auto">
              <h3 className="text-base font-black text-white text-center">Child Safety Policy</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                LoveWithYou has a strict zero-tolerance policy regarding underage users (under 18). All users must undergo AI verification and device hardware matching.
              </p>
              <button onClick={() => setActiveModal(null)} className="w-full py-2 bg-white/10 rounded-xl text-xs font-bold">Understood</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
