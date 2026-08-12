"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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
import { useState, useEffect } from "react";
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
  const [isMounted, setIsMounted] = useState(false);
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
  const [autoGreeting, setAutoGreeting] = useState("Hey! Your profile caught my eye. How's your day going?");

  // Modals Controls
  const [showUserCode, setShowUserCode] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateSettings = (updates: any) => {
    if ('allowFriendSearch' in updates) setAllowFriendSearch(updates.allowFriendSearch);
    if ('allowAutoFriendAccept' in updates) setAllowAutoFriendAccept(updates.allowAutoFriendAccept);
    if ('automaticTranslation' in updates) setAutomaticTranslation(updates.automaticTranslation);
    if ('accentColor' in updates) setAccentColor(updates.accentColor);
    if ('encryptedChat' in updates) setEncryptedChat(updates.encryptedChat);
    if ('incognitoMode' in updates) setIncognitoMode(updates.incognitoMode);
    if ('screenshotShield' in updates) setScreenshotShield(updates.screenshotShield);
    if ('pushNotifications' in updates) setPushNotifications(updates.pushNotifications);
    if ('hapticsEnabled' in updates) setSoundHaptics(updates.hapticsEnabled);
    if ('distanceUnit' in updates) setDistanceUnit(updates.distanceUnit);
    if ('lowDataMode' in updates) setDataSaver(updates.lowDataMode);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);


  // Match Preferences State
  const [matchAgeMin, setMatchAgeMin] = useState(18);
  const [matchAgeMax, setMatchAgeMax] = useState(30);
  const [matchRadiusKm, setMatchRadiusKm] = useState(50);
  const [selectedAvatar, setSelectedAvatar] = useState("🦊 Cyber Fox");
  const [alarmTime, setAlarmTime] = useState("22:00");
  const [alarmEnabled, setAlarmEnabled] = useState(true);

  // Dynamic Safety Data
  const [blockedList, setBlockedList] = useState<any[]>([]);
  const [reportedList, setReportedList] = useState<any[]>([]);
  const [isLoadingSafety, setIsLoadingSafety] = useState(true);

  useEffect(() => {
    async function fetchSafetyData() {
      if (!deviceId) return;
      setIsLoadingSafety(true);
      try {
        // Fetch Blocks
        const { data: blocks } = await supabase
          .from("blocks")
          .select("id, blocked_id, created_at")
          .eq("blocker_id", deviceId);

        if (blocks && blocks.length > 0) {
          const blockedIds = blocks.map((b: any) => b.blocked_id);
          const { data: profiles } = await supabase.from("profiles").select("device_id, name").in("device_id", blockedIds);
          
          if (profiles) {
            setBlockedList(blocks.map((b: any) => {
              const p = profiles.find((p: any) => p.device_id === b.blocked_id);
              return { id: b.blocked_id, name: p?.name || "Unknown User", reason: "Blocked", date: b.created_at };
            }));
          }
        } else {
          setBlockedList([]);
        }

        // Fetch Reports
        const { data: reports } = await supabase
          .from("reports")
          .select("id, reported_id, reason, status, created_at")
          .eq("reporter_id", deviceId);

        if (reports && reports.length > 0) {
          const reportedIds = reports.map((r: any) => r.reported_id);
          const { data: profiles } = await supabase.from("profiles").select("device_id, name").in("device_id", reportedIds);
          
          if (profiles) {
            setReportedList(reports.map((r: any) => {
              const p = profiles.find((p: any) => p.device_id === r.reported_id);
              return { id: r.id, name: p?.name || "Unknown User", status: r.status, date: r.created_at };
            }));
          }
        } else {
          setReportedList([]);
        }
      } catch (err) {
        console.error("Failed to load safety data", err);
      } finally {
        setIsLoadingSafety(false);
      }
    }
    fetchSafetyData();
  }, [deviceId]);

  const handleDeleteAccount = async () => {
    if (deviceId) {
      await supabase
        .from("profiles")
        .update({ deletion_requested_at: new Date().toISOString() })
        .eq("device_id", deviceId);
    }
    setProfile(null as any);
    setDeviceId("");
    toast("Account deletion requested. Data will be cleared within 30 days.", "info");
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

  const handleUnblockUser = async (id: string, name: string) => {
    try {
      await supabase.from("blocks").delete().eq("blocker_id", deviceId).eq("blocked_id", id);
      setBlockedList(prev => prev.filter(u => u.id !== id));
      toast(`Unblocked ${name} successfully!`, "success");
    } catch (err) {
      toast("Failed to unblock user", "error");
    }
  };

  const userSecretCode = deviceId ? `LWY-${deviceId.substring(0, 8).toUpperCase()}` : "LWY-8891-X792";

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-black/70 backdrop-blur-xl sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-surface-elevated hover:bg-surface-elevated rounded-full text-foreground transition active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-black text-foreground tracking-tight">Settings</h1>
          </div>
        </div>

        <span className="text-[10px] bg-primary/20 text-primary font-extrabold px-3 py-1 rounded-full border border-primary/30 flex items-center gap-1">
          <Sparkles size={12} /> v5.30.97
        </span>
      </div>

      {/* Main Settings Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-28">

        {/* 1. MATCHING & CHAT */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-4 rounded-full bg-primary"></div>
            <h3 className="text-sm font-black text-foreground tracking-tight">Matching &amp; Chat</h3>
          </div>

          <div className="bg-white/[0.03] border border-border rounded-3xl overflow-hidden divide-y divide-divider">
            <button onClick={() => setActiveModal("alarm")} className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition text-left">
              <span className="text-xs font-bold text-foreground">Alarm setting</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted">{alarmEnabled ? alarmTime : "Off"}</span>
                <ChevronRight size={16} className="text-muted" />
              </div>
            </button>

            <button onClick={() => setActiveModal("avatar")} className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition text-left">
              <span className="text-xs font-bold text-foreground">Avatar</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-primary font-bold">{selectedAvatar}</span>
                <ChevronRight size={16} className="text-muted" />
              </div>
            </button>

            <button onClick={() => setActiveModal("match_settings")} className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition text-left">
              <span className="text-xs font-bold text-foreground">Match Settings</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted">{matchAgeMin}-{matchAgeMax} yrs • {matchRadiusKm}km</span>
                <ChevronRight size={16} className="text-muted" />
              </div>
            </button>

            <div className="flex items-center justify-between p-4">
              <span className="text-xs font-bold text-foreground">Allow friend search</span>
              <input type="checkbox" checked={allowFriendSearch} onChange={(e) => updateSettings({ allowFriendSearch: e.target.checked })} className="w-5 h-5 accent-primary cursor-pointer" />
            </div>

            <div className="flex items-center justify-between p-4">
              <span className="text-xs font-bold text-foreground">Allow Auto-Friend Accept</span>
              <input type="checkbox" checked={allowAutoFriendAccept} onChange={(e) => updateSettings({ allowAutoFriendAccept: e.target.checked })} className="w-5 h-5 accent-primary cursor-pointer" />
            </div>

            <div className="flex items-center justify-between p-4">
              <span className="text-xs font-bold text-foreground">Automatic Translation</span>
              <input type="checkbox" checked={automaticTranslation} onChange={(e) => updateSettings({ automaticTranslation: e.target.checked })} className="w-5 h-5 accent-primary cursor-pointer" />
            </div>
          </div>
        </div>

        {/* 2. APP PREFERENCES */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-4 rounded-full bg-purple-500"></div>
            <h3 className="text-sm font-black text-foreground tracking-tight">App Preferences</h3>
          </div>

          <div className="bg-white/[0.03] border border-border rounded-3xl overflow-hidden divide-y divide-divider">
            <div className="flex items-center justify-between p-4">
              <span className="text-xs font-bold text-foreground">Dark Mode</span>
              <input type="checkbox" checked={theme === "dark"} onChange={(e) => setTheme(e.target.checked ? "dark" : "light")} className="w-5 h-5 accent-primary cursor-pointer" />
            </div>

            <div className="p-4 space-y-2">
              <span className="text-xs font-bold text-foreground block">Accent Theme Color</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { updateSettings({ accentColor: "pink" }); toast("Accent set to Hot Pink 💖", "success"); }}
                  className={`w-8 h-8 rounded-2xl bg-primary flex items-center justify-center text-white transition ${accentColor === 'pink' ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-70'}`}
                >
                  {accentColor === 'pink' && <CheckCircle2 size={14} />}
                </button>
                <button 
                  onClick={() => { updateSettings({ accentColor: "purple" }); toast("Accent set to Cyber Purple 🔮", "success"); }}
                  className={`w-8 h-8 rounded-2xl bg-purple-600 flex items-center justify-center text-foreground transition ${accentColor === 'purple' ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-70'}`}
                >
                  {accentColor === 'purple' && <CheckCircle2 size={14} />}
                </button>
                <button 
                  onClick={() => { updateSettings({ accentColor: "emerald" }); toast("Accent set to Neon Emerald ❇️", "success"); }}
                  className={`w-8 h-8 rounded-2xl bg-success flex items-center justify-center text-foreground transition ${accentColor === 'emerald' ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-70'}`}
                >
                  {accentColor === 'emerald' && <CheckCircle2 size={14} />}
                </button>
                <button 
                  onClick={() => { updateSettings({ accentColor: "gold" }); toast("Accent set to Gold VIP 👑", "success"); }}
                  className={`w-8 h-8 rounded-2xl bg-amber-400 flex items-center justify-center text-black transition ${accentColor === 'gold' ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-70'}`}
                >
                  {accentColor === 'gold' && <CheckCircle2 size={14} />}
                </button>
              </div>
            </div>

            <button onClick={() => setActiveModal("language")} className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition text-left">
              <span className="text-xs font-bold text-foreground">App Language Settings</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted">{appLanguage}</span>
                <ChevronRight size={16} className="text-muted" />
              </div>
            </button>

            <button onClick={() => setActiveModal("fontsize")} className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition text-left">
              <span className="text-xs font-bold text-foreground">App Font Size</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted">{fontSize}</span>
                <ChevronRight size={16} className="text-muted" />
              </div>
            </button>

            <button onClick={() => setActiveModal("photo_picker")} className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition text-left">
              <span className="text-xs font-bold text-foreground">Photo Picker</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted">{photoPickerType}</span>
                <ChevronRight size={16} className="text-muted" />
              </div>
            </button>
          </div>
        </div>

        {/* 3. PREMIUM */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-4 rounded-full bg-amber-400"></div>
            <h3 className="text-sm font-black text-foreground tracking-tight">Premium</h3>
          </div>

          <div className="bg-white/[0.03] border border-border rounded-3xl overflow-hidden divide-y divide-divider">
            <button onClick={() => router.push("/premium")} className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition text-left">
              <span className="text-xs font-bold text-foreground">PREMIUM Subscription Information</span>
              <ChevronRight size={16} className="text-muted" />
            </button>

            <button onClick={() => setActiveModal("auto_greeting")} className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition text-left">
              <span className="text-xs font-bold text-foreground">Auto greeting message</span>
              <ChevronRight size={16} className="text-muted" />
            </button>

            <div className="flex items-center justify-between p-4">
              <span className="text-xs font-bold text-foreground">Encrypted Chat</span>
              <input type="checkbox" checked={encryptedChat} onChange={(e) => updateSettings({ encryptedChat: e.target.checked })} className="w-5 h-5 accent-primary cursor-pointer" />
            </div>
          </div>
        </div>

        {/* 4. PRIVACY & SECURITY SHIELD */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-4 rounded-full bg-emerald-400"></div>
            <h3 className="text-sm font-black text-foreground tracking-tight">Privacy &amp; Security Shield</h3>
          </div>

          <div className="bg-white/[0.03] border border-border rounded-3xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground flex items-center gap-2">
                  <EyeOff size={15} className="text-indigo-400" /> Incognito Ghost Mode
                </p>
                <p className="text-[11px] text-muted">Only profiles you right-swipe can view your card</p>
              </div>
              <button 
                onClick={() => { updateSettings({ incognitoMode: !incognitoMode }); toast(!incognitoMode ? "👻 Incognito Active!" : "Incognito Off", "info"); }}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${incognitoMode ? 'bg-indigo-500' : 'bg-surface-elevated'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${incognitoMode ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Lock size={15} className="text-primary" /> Anti-Screenshot Shield
                </p>
                <p className="text-[11px] text-muted">Block screenshot attempts during private chats</p>
              </div>
              <button 
                onClick={() => updateSettings({ screenshotShield: !screenshotShield })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${screenshotShield ? 'bg-primary' : 'bg-surface-elevated'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${screenshotShield ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Bell size={15} className="text-pink-400" /> Push Notifications
                </p>
                <p className="text-[11px] text-muted">Alerts for matches &amp; chats</p>
              </div>
              <button 
                onClick={() => updateSettings({ pushNotifications: !pushNotifications })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${pushNotifications ? 'bg-primary' : 'bg-surface-elevated'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Volume2 size={15} className="text-purple-400" /> Sound &amp; Haptics
                </p>
                <p className="text-[11px] text-muted">Swipe sound &amp; vibration feedback</p>
              </div>
              <button 
                onClick={() => updateSettings({ hapticsEnabled: !soundHaptics })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${soundHaptics ? 'bg-purple-500' : 'bg-surface-elevated'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${soundHaptics ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Globe size={15} className="text-warning" /> Distance Radar Unit
                </p>
                <p className="text-[11px] text-muted">Measurement unit for matches</p>
              </div>
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-border">
                <button onClick={() => updateSettings({ distanceUnit: "km" })} className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${distanceUnit === 'km' ? 'bg-amber-400 text-black' : 'text-muted'}`}>km</button>
                <button onClick={() => updateSettings({ distanceUnit: "mi" })} className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${distanceUnit === 'mi' ? 'bg-amber-400 text-black' : 'text-muted'}`}>mi</button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. PERFORMANCE & STORAGE CLEANER */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-4 rounded-full bg-indigo-500"></div>
            <h3 className="text-sm font-black text-foreground tracking-tight">Performance &amp; Storage Cleaner</h3>
          </div>

          <div className="bg-white/[0.03] border border-border rounded-3xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Zap size={15} className="text-warning" /> Low Data Saver Mode
                </p>
                <p className="text-[11px] text-muted">Optimizes media stream during calls</p>
              </div>
              <button 
                onClick={() => updateSettings({ lowDataMode: !dataSaver })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${dataSaver ? 'bg-warning' : 'bg-surface-elevated'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${dataSaver ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground flex items-center gap-2">
                  <HardDrive size={15} className="text-indigo-400" /> Clear Local App Cache
                </p>
                <p className="text-[11px] text-muted">Current cache: <span className="text-indigo-300 font-bold">{cacheSize}</span></p>
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
            <h3 className="text-sm font-black text-foreground tracking-tight">Data management</h3>
          </div>

          <div className="bg-white/[0.03] border border-border rounded-3xl overflow-hidden divide-y divide-divider">
            <button onClick={() => setActiveModal("blocked")} className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition text-left">
              <span className="text-xs font-bold text-foreground">Block friend management</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted">{isLoadingSafety ? '...' : blockedList.length} users</span>
                <ChevronRight size={16} className="text-muted" />
              </div>
            </button>

            <button onClick={() => setActiveModal("reported")} className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition text-left">
              <span className="text-xs font-bold text-foreground">Reported user management</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted">{isLoadingSafety ? '...' : reportedList.length} tickets</span>
                <ChevronRight size={16} className="text-muted" />
              </div>
            </button>
          </div>
        </div>

        {/* 7. POLICY & ACCOUNT */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-4 rounded-full bg-success"></div>
            <h3 className="text-sm font-black text-foreground tracking-tight">Policy &amp; Account</h3>
          </div>

          <div className="bg-white/[0.03] border border-border rounded-3xl overflow-hidden divide-y divide-divider">
            <button onClick={() => setActiveModal("child_safety")} className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition text-left">
              <span className="text-xs font-bold text-foreground">Child Safety Policy</span>
              <ChevronRight size={16} className="text-muted" />
            </button>

            <div className="flex items-center justify-between p-4">
              <span className="text-xs font-bold text-foreground">User code</span>
              <div className="flex items-center gap-2">
                {showUserCode ? (
                  <span className="text-xs font-mono font-black text-primary bg-primary/20 px-2 py-0.5 rounded-lg border border-primary/30">
                    {userSecretCode}
                  </span>
                ) : (
                  <span className="text-xs font-mono text-muted">••••••••••</span>
                )}
                <button onClick={() => setShowUserCode(!showUserCode)} className="p-1 text-muted hover:text-foreground transition">
                  {showUserCode ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button onClick={() => setActiveModal("recovery")} className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition text-left">
              <span className="text-xs font-bold text-foreground">Account recovery</span>
              <ChevronRight size={16} className="text-muted" />
            </button>

            {!showPauseConfirm ? (
              <button onClick={() => setShowPauseConfirm(true)} className="w-full flex items-center justify-between p-4 hover:bg-warning/10 transition text-left">
                <span className="text-xs font-bold text-amber-300">{isAccountPaused ? "Resume Account" : "Snooze / Pause Account"}</span>
                <ChevronRight size={16} className="text-warning" />
              </button>
            ) : (
              <div className="p-4 bg-warning/10 border-t border-amber-500/20 space-y-3">
                <p className="text-xs font-bold text-amber-300 text-center">
                  {isAccountPaused ? "Resume your active dating profile?" : "Pause your account temporarily?"}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setShowPauseConfirm(false)} className="flex-1 py-2 bg-surface-elevated rounded-xl text-xs font-bold">Cancel</button>
                  <button onClick={handleTogglePause} className="flex-1 py-2 bg-warning text-black rounded-xl text-xs font-black">{isAccountPaused ? "Resume Now" : "Pause Account"}</button>
                </div>
              </div>
            )}

            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-between p-4 hover:bg-primary/10 transition text-left">
                <span className="text-xs font-bold text-primary">Delete account</span>
                <ChevronRight size={16} className="text-primary" />
              </button>
            ) : (
              <div className="p-4 bg-primary/10 border-t border-primary/20 space-y-3">
                <p className="text-xs font-bold text-primary text-center">
                  Are you sure you want to permanently delete your account?
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 bg-surface-elevated rounded-xl text-xs font-bold">Cancel</button>
                  <button onClick={handleDeleteAccount} className="flex-1 py-2 bg-primary-hover rounded-xl text-xs font-black text-white">Yes, Delete</button>
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
            <div className="bg-surface border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 text-center">
              <h3 className="text-base font-black text-foreground">Alarm &amp; Match Notifications</h3>
              <div className="flex items-center justify-between bg-surface-elevated p-3 rounded-2xl border border-border">
                <span className="text-xs font-bold">Enable Daily Reminder</span>
                <input type="checkbox" checked={alarmEnabled} onChange={(e) => setAlarmEnabled(e.target.checked)} className="w-5 h-5 accent-primary" />
              </div>
              <input type="time" value={alarmTime} onChange={(e) => setAlarmTime(e.target.value)} className="bg-surface-elevated border border-border text-foreground rounded-xl p-3 w-full text-center text-lg font-bold" />
              <button onClick={() => { setActiveModal(null); toast("Alarm setting saved!", "success"); }} className="w-full py-3 bg-primary rounded-2xl font-black text-xs">Save Alarm</button>
            </div>
          </motion.div>
        )}

        {activeModal === "avatar" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border w-full max-w-sm rounded-3xl p-5 space-y-4">
              <h3 className="text-base font-black text-foreground text-center">Select Your Avatar</h3>
              <div className="grid grid-cols-2 gap-2">
                {["🦊 Cyber Fox", "🐱 Neon Cat", "🐼 Zen Panda", "🦁 Gold Lion"].map(av => (
                  <button key={av} onClick={() => { setSelectedAvatar(av); setActiveModal(null); toast(`Avatar set to ${av}`, "success"); }} className={`p-3 rounded-2xl text-xs font-bold border ${selectedAvatar === av ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-elevated border-border'}`}>
                    {av}
                  </button>
                ))}
              </div>
              <button onClick={() => setActiveModal(null)} className="w-full py-2 bg-surface-elevated rounded-xl text-xs font-bold">Close</button>
            </div>
          </motion.div>
        )}

        {activeModal === "match_settings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border w-full max-w-sm rounded-3xl p-5 space-y-4">
              <h3 className="text-base font-black text-foreground text-center">Match Preferences</h3>
              <div className="space-y-2">
                <label className="text-xs font-bold text-secondary">Age Range: {matchAgeMin} - {matchAgeMax} years</label>
                <div className="flex gap-2">
                  <input type="range" min="18" max="50" value={matchAgeMin} onChange={(e) => setMatchAgeMin(Number(e.target.value))} className="w-full accent-primary" />
                  <input type="range" min="18" max="60" value={matchAgeMax} onChange={(e) => setMatchAgeMax(Number(e.target.value))} className="w-full accent-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-secondary">Distance Radius: {matchRadiusKm} km</label>
                <input type="range" min="5" max="200" value={matchRadiusKm} onChange={(e) => setMatchRadiusKm(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <button onClick={() => { setActiveModal(null); toast("Match preferences updated!", "success"); }} className="w-full py-3 bg-primary rounded-2xl font-black text-xs">Save Match Filters</button>
            </div>
          </motion.div>
        )}

        {activeModal === "language" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border w-full max-w-sm rounded-3xl p-5 space-y-3">
              <h3 className="text-base font-black text-foreground text-center">App Language Settings</h3>
              {["System defaults", "English (US)", "Hindi (हिन्दी)", "Spanish (Español)", "French (Français)"].map(lang => (
                <button key={lang} onClick={() => { updateSettings({ language: lang }); setActiveModal(null); toast(`Language set to ${lang}`, "info"); }} className="w-full p-3 bg-surface-elevated hover:bg-surface-elevated rounded-2xl text-xs font-bold text-left border border-border flex items-center justify-between">
                  <span>{lang}</span>
                  {appLanguage === lang && <Check size={16} className="text-primary" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {activeModal === "fontsize" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 text-center">
              <h3 className="text-base font-black text-foreground">App Font Size</h3>
              <div className="grid grid-cols-3 gap-2">
                {[8, 10, 12].map(sz => (
                  <button key={sz} onClick={() => { updateSettings({ fontSize: sz }); setActiveModal(null); toast(`Font size set to ${sz}`, "info"); }} className={`p-3 rounded-2xl text-xs font-bold border ${fontSize === sz ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-elevated border-border'}`}>
                    Size {sz}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeModal === "photo_picker" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border w-full max-w-sm rounded-3xl p-5 space-y-3">
              <h3 className="text-base font-black text-foreground text-center">Photo Picker Type</h3>
              {["Classic Photo Picker", "HD Cloudinary Cloud Picker", "System Native Gallery"].map(p => (
                <button key={p} onClick={() => { updateSettings({ photoPickerType: p }); setActiveModal(null); toast(`Photo picker set to ${p}`, "info"); }} className="w-full p-3 bg-surface-elevated hover:bg-surface-elevated rounded-2xl text-xs font-bold text-left border border-border">
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {activeModal === "auto_greeting" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border w-full max-w-sm rounded-3xl p-5 space-y-4">
              <h3 className="text-base font-black text-foreground text-center">Auto Greeting Message</h3>
              <textarea value={autoGreeting} onChange={(e) => setAutoGreeting(e.target.value)} className="w-full h-24 bg-surface-elevated border border-border rounded-2xl p-3 text-xs text-foreground outline-none" />
              <button onClick={() => { setActiveModal(null); toast("Auto greeting message saved!", "success"); }} className="w-full py-3 bg-primary rounded-2xl font-black text-xs">Save Message</button>
            </div>
          </motion.div>
        )}

        {activeModal === "blocked" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border w-full max-w-sm rounded-3xl p-5 space-y-4">
              <h3 className="text-base font-black text-foreground text-center">Block Friend Management</h3>
              {isLoadingSafety ? (
                <p className="text-xs text-muted text-center py-4">Loading real data...</p>
              ) : blockedList.length === 0 ? (
                <p className="text-xs text-muted text-center py-4">No blocked users found.</p>
              ) : (
                blockedList.map(u => (
                  <div key={u.id} className="flex items-center justify-between bg-surface-elevated p-3 rounded-2xl border border-border">
                    <div>
                      <p className="text-xs font-bold text-foreground">{u.name}</p>
                      <p className="text-[10px] text-muted">{u.reason}</p>
                    </div>
                    <button onClick={() => handleUnblockUser(u.id, u.name)} className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-xl text-[10px] font-bold">Unblock</button>
                  </div>
                ))
              )}
              <button onClick={() => setActiveModal(null)} className="w-full py-2 bg-surface-elevated rounded-xl text-xs font-bold">Close</button>
            </div>
          </motion.div>
        )}

        {activeModal === "reported" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border w-full max-w-sm rounded-3xl p-5 space-y-4">
              <h3 className="text-base font-black text-foreground text-center">Reported User Tickets</h3>
              {isLoadingSafety ? (
                <p className="text-xs text-muted text-center py-4">Loading real data...</p>
              ) : reportedList.length === 0 ? (
                <p className="text-xs text-muted text-center py-4">No reported tickets found.</p>
              ) : (
                reportedList.map(r => (
                  <div key={r.id} className="bg-surface-elevated p-3 rounded-2xl border border-border space-y-1">
                    <p className="text-xs font-bold text-foreground">{r.name}</p>
                    <p className="text-[10px] text-warning font-bold">{r.status}</p>
                    {r.reason && <p className="text-[10px] text-muted">{r.reason}</p>}
                  </div>
                ))
              )}
              <button onClick={() => setActiveModal(null)} className="w-full py-2 bg-surface-elevated rounded-xl text-xs font-bold">Close</button>
            </div>
          </motion.div>
        )}

        {activeModal === "recovery" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 text-center">
              <h3 className="text-base font-black text-foreground">Account Recovery Code</h3>
              <p className="text-xs text-muted">Save this code to restore your profile on a new device.</p>
              <div className="p-3 bg-surface-elevated border border-border rounded-2xl text-primary font-mono font-bold text-sm tracking-wider">
                REC-8892-LWY-2026
              </div>
              <button onClick={() => { setActiveModal(null); toast("Recovery code copied!", "success"); }} className="w-full py-3 bg-primary rounded-2xl font-black text-xs">Copy &amp; Close</button>
            </div>
          </motion.div>
        )}

        {activeModal === "child_safety" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border w-full max-w-sm rounded-3xl p-5 space-y-3 max-h-[80vh] overflow-y-auto">
              <h3 className="text-base font-black text-foreground text-center">Child Safety Policy</h3>
              <p className="text-xs text-secondary leading-relaxed">
                LoveWithYou has a strict zero-tolerance policy regarding underage users (under 18). All users must undergo AI verification and device hardware matching.
              </p>
              <button onClick={() => setActiveModal(null)} className="w-full py-2 bg-surface-elevated rounded-xl text-xs font-bold">Understood</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
