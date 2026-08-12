// components/SidebarDrawer.tsx
"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { INDIA_STATES, INDIA_CITIES } from "@/lib/indiaData";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  MapPin, 
  Users, 
  User, 
  Heart, 
  SlidersHorizontal, 
  MessageCircle, 
  HeartPulse, 
  Settings as SettingsIcon, 
  Edit3, 
  Globe, 
  HelpCircle, 
  Share2, 
  LogOut, 
  Coins, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Flame, 
  Moon, 
  Sparkles, 
  Award, 
  Compass,
  Headphones,
  Trophy,
  Calendar,
  GraduationCap,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { CoinHistoryModal } from "@/components/CoinHistoryModal";

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarDrawer({ isOpen, onClose }: SidebarDrawerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const profile = useUserStore((state) => state.profile);
  const coins = useUserStore((state) => state.coins);
  const spendCoins = useUserStore((state) => state.spendCoins);
  const [showCoinHistory, setShowCoinHistory] = useState(false);
  const canSearch = useUserStore((state) => state.canSearch);
  const incrementSearchCount = useUserStore((state) => state.incrementSearchCount);
  const matchPreferences = useUserStore((state) => state.matchPreferences);
  const updateMatchPreferences = useUserStore((state) => state.updateMatchPreferences);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showSecretArenas, setShowSecretArenas] = useState(false);
  const [showConnections, setShowConnections] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const isProd = process.env.NODE_ENV === "production";
        const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || (isProd ? "https://lovewithyou.onrender.com" : "http://localhost:8080"))?.replace(/\/+$/, "");
        const token = useUserStore.getState().authToken;
        const res = await fetch(`${BACKEND_URL}/users/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        setSearchResults(data || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  if (!profile) return null;

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  const handleUserClick = (user: any) => {
    if (canSearch()) {
      incrementSearchCount();
      setSelectedUser(user);
    } else {
      toast("Not enough coins! You need 1 coin to search more profiles today.", "error");
    }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMatchPreferences({ selectedState: e.target.value, selectedCity: null });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          />

          {/* Drawer Panel - Using Theme Variables */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{ 
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-foreground)'
            }}
            className="fixed top-0 left-0 h-full w-[84%] max-w-[340px] border-r drop-shadow-sm z-[70] shadow-2xl flex flex-col overflow-hidden font-sans"
          >
            {/* Header Banner */}
            <div 
              className="relative p-5 pt-7 text-inherit overflow-hidden shrink-0 shadow-sm border-b"
              style={{ 
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-divider)'
              }}
            >
              <button onClick={onClose} className="absolute top-4 right-4 text-inherit hover:opacity-70 drop-shadow-sm transition p-1">
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 relative z-10">
                {/* Profile Photo */}
                <div onClick={() => navigateTo("/profile/edit")} className="relative cursor-pointer group shrink-0">
                  <div 
                    className="w-16 h-16 rounded-full border-2 overflow-hidden shadow-md"
                    style={{ 
                      borderColor: 'var(--color-border)',
                      backgroundColor: 'var(--color-surface)'
                    }}
                  >
                    {profile.photo_url || (profile.photos && profile.photos[0]) ? (
                      <img src={profile.photo_url || profile.photos?.[0]} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center btn-signature-gradient font-bold text-xl">
                        👤
                      </div>
                    )}
                  </div>
                  <div 
                    className="absolute bottom-0 right-0 w-5 h-5 border-2 rounded-full flex items-center justify-center text-[10px] text-white"
                    style={{ 
                      backgroundColor: 'var(--color-primary)',
                      borderColor: 'var(--color-surface)'
                    }}
                  >
                    ✎
                  </div>
                </div>

                {/* Profile Info & Voucher */}
                <div className="space-y-1.5 flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base truncate drop-shadow-sm" style={{ color: 'var(--color-foreground)' }}>
                      {profile.name || "User"}
                    </h3>
                    <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>
                      ({profile.age || 22})
                    </span>
                    <button onClick={() => navigateTo("/settings")} className="hover:opacity-70 drop-shadow-md transition" style={{ color: 'var(--color-text-muted)' }}>
                      <SettingsIcon size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowCoinHistory(true)}
                      className="flex items-center gap-1 text-xs font-bold badge-gold px-2.5 py-0.5 rounded-full hover:opacity-80 transition cursor-pointer"
                    >
                      🪙 {coins || 0} Coins
                    </button>

                    <button 
                      onClick={() => navigateTo("/premium")}
                      className="btn-signature-gradient text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md active:scale-95 transition"
                    >
                      Buy Coins
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Navigation List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ backgroundColor: 'var(--color-background)' }}>
              
              {/* Live Search Bar */}
              <div className="p-3 border-b" style={{ borderColor: 'var(--color-divider)' }}>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search singles by name..."
                    className="w-full border rounded-2xl py-2 pl-9 pr-4 text-xs focus:outline-none transition shadow-sm"
                    style={{ 
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-foreground)'
                    }}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
                  )}
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && searchQuery.length >= 2 && (
                  <div className="mt-2 border rounded-2xl max-h-48 overflow-y-auto shadow-xl" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    {searchResults.map(user => (
                      <button
                        key={user.id}
                        onClick={() => handleUserClick(user)}
                        className="w-full flex items-center gap-3 p-2.5 transition border-b last:border-0 text-left hover:opacity-80"
                        style={{ borderColor: 'var(--color-divider)' }}
                      >
                        <div className="w-7 h-7 rounded-full overflow-hidden shrink-0" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                          {user.photo_url ? (
                            <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <User size={14} className="m-auto h-full" style={{ color: 'var(--color-text-muted)' }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold truncate" style={{ color: 'var(--color-foreground)' }}>{user.name}</h4>
                          <p className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>{user.campus || user.location || "Nearby"}</p>
                        </div>
                        <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Real App Core Navigation Features */}
              <div className="py-1">
                {/* Connections Accordion (Sub Nav) */}
                <div className="border-t pt-1 pb-1" style={{ borderColor: 'var(--color-divider)' }}>
                  <button 
                    onClick={() => setShowConnections(!showConnections)}
                    className="w-full flex items-center justify-between px-5 py-4 transition text-left hover:opacity-80"
                  >
                    <div className="flex items-center gap-4">
                      <HeartPulse size={20} style={{ color: 'var(--color-romantic)' }} />
                      <span className="text-sm font-extrabold" style={{ color: 'var(--color-foreground)' }}>My Connections 💌</span>
                    </div>
                    <ChevronRight size={18} className={`transition-transform ${showConnections ? 'rotate-90' : ''}`} style={{ color: 'var(--color-text-muted)' }} />
                  </button>

                  <AnimatePresence>
                    {showConnections && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                        style={{ backgroundColor: 'var(--color-surface-elevated)' }}
                      >
                        {/* My Matches */}
                        <button onClick={() => navigateTo('/chat?tab=matches')} className="w-full flex items-center justify-between px-5 py-3 transition text-left pl-14 hover:opacity-80">
                          <div className="flex items-center gap-3">
                            <MessageCircle size={16} style={{ color: 'var(--color-primary)' }} />
                            <span className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>My Matches</span>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-soft)' }}>Chat</span>
                        </button>

                        {/* Who Liked Me */}
                        <button onClick={() => navigateTo('/chat?tab=likes')} className="w-full flex items-center justify-between px-5 py-3 transition text-left pl-14 pb-4 hover:opacity-80">
                          <div className="flex items-center gap-3">
                            <Heart size={16} style={{ color: 'var(--color-romantic)' }} />
                            <span className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>Who Liked Me</span>
                          </div>
                          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-romantic)' }} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Secret Match Arenas Accordion */}
                <div className="border-y my-1" style={{ borderColor: 'var(--color-divider)' }}>
                  <button 
                    onClick={() => setShowSecretArenas(!showSecretArenas)}
                    className="w-full flex items-center justify-between px-5 py-4 transition text-left hover:opacity-80"
                  >
                    <div className="flex items-center gap-4">
                      <Sparkles size={20} className="animate-pulse" style={{ color: 'var(--color-coral)' }} />
                      <span className="text-sm font-extrabold" style={{ color: 'var(--color-foreground)' }}>Secret Match Arenas 🎭</span>
                    </div>
                    <ChevronRight size={18} className={`transition-transform ${showSecretArenas ? 'rotate-90' : ''}`} style={{ color: 'var(--color-text-muted)' }} />
                  </button>

                  <AnimatePresence>
                    {showSecretArenas && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                        style={{ backgroundColor: 'var(--color-surface-elevated)' }}
                      >
                        {/* 3-Min Blind Date */}
                        <button onClick={() => navigateTo('/blind-date')} className="w-full flex items-center justify-between px-5 py-3 transition text-left pl-14 hover:opacity-80">
                          <div className="flex items-center gap-3">
                            <Headphones size={16} style={{ color: 'var(--color-primary)' }} />
                            <span className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>3-Min Blind Date</span>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase badge-indigo">Audio</span>
                        </button>

                        {/* Random Chat */}
                        <button onClick={() => navigateTo('/random-chat')} className="w-full flex items-center justify-between px-5 py-3 transition text-left pl-14 hover:opacity-80">
                          <div className="flex items-center gap-3">
                            <Users size={16} style={{ color: 'var(--color-warning)' }} />
                            <span className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>Random Chat</span>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase badge-gold">Live</span>
                        </button>

                        {/* 18+ Anonymous After-Dark */}
                        <button onClick={() => navigateTo('/after-dark')} className="w-full flex items-center justify-between px-5 py-3 transition text-left pl-14 hover:opacity-80">
                          <div className="flex items-center gap-3">
                            <Flame size={16} className="animate-pulse" style={{ color: 'var(--color-error)' }} />
                            <span className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>18+ After-Dark</span>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase badge-coral">18+</span>
                        </button>

                        {/* Midnight Roulette & 2v2 Squads */}
                        <button onClick={() => navigateTo('/midnight-roulette')} className="w-full flex items-center justify-between px-5 py-3 transition text-left pl-14 pb-4 hover:opacity-80">
                          <div className="flex items-center gap-3">
                            <Moon size={16} style={{ color: 'var(--text-secondary)' }} />
                            <span className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>Midnight 2v2 Squads</span>
                          </div>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Campus Hub */}
                <button onClick={() => navigateTo('/campus')} className="w-full flex items-center justify-between px-5 py-3.5 transition text-left hover:opacity-80">
                  <div className="flex items-center gap-4">
                    <GraduationCap size={20} style={{ color: 'var(--color-success)' }} />
                    <span className="text-sm font-extrabold" style={{ color: 'var(--color-foreground)' }}>Campus Hub</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase badge-lime">Students</span>
                </button>

                {/* Leaderboard */}
                <button onClick={() => navigateTo('/leaderboard')} className="w-full flex items-center justify-between px-5 py-3.5 transition text-left hover:opacity-80">
                  <div className="flex items-center gap-4">
                    <Trophy size={20} style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm font-extrabold" style={{ color: 'var(--color-foreground)' }}>Leaderboard</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase badge-magenta">Top Connectors</span>
                </button>

                {/* Events */}
                <button onClick={() => navigateTo('/events')} className="w-full flex items-center justify-between px-5 py-3.5 transition text-left hover:opacity-80">
                  <div className="flex items-center gap-4">
                    <Calendar size={20} style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-sm font-extrabold" style={{ color: 'var(--color-foreground)' }}>Events Calendar</span>
                  </div>
                </button>

                {/* Coin History & Ledger */}
                <button onClick={() => setShowCoinHistory(true)} className="w-full flex items-center justify-between px-5 py-3.5 transition text-left hover:opacity-80">
                  <div className="flex items-center gap-4">
                    <Coins size={20} style={{ color: 'var(--color-warning)' }} />
                    <span className="text-sm font-extrabold" style={{ color: 'var(--color-foreground)' }}>Coin History &amp; Ledger</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase badge-gold">Transparent</span>
                </button>

                {/* Daily Cupid's Slot Machine */}
                <button onClick={() => navigateTo('/profile')} className="w-full flex items-center gap-4 px-5 py-3.5 transition text-left hover:opacity-80">
                  <Award size={20} style={{ color: 'var(--color-warning)' }} />
                  <span className="text-sm font-extrabold" style={{ color: 'var(--color-foreground)' }}>Daily Cupid&apos;s Slot Machine</span>
                </button>

                {/* Settings */}
                <button onClick={() => navigateTo('/settings')} className="w-full flex items-center gap-4 px-5 py-3.5 transition text-left hover:opacity-80">
                  <SettingsIcon size={20} style={{ color: 'var(--color-text-secondary)' }} />
                  <span className="text-sm font-extrabold" style={{ color: 'var(--color-foreground)' }}>App Settings &amp; Security</span>
                </button>

                {/* FAQs */}
                <button onClick={() => navigateTo('/faq')} className="w-full flex items-center gap-4 px-5 py-3.5 transition text-left hover:opacity-80">
                  <HelpCircle size={20} style={{ color: 'var(--color-text-secondary)' }} />
                  <span className="text-sm font-extrabold" style={{ color: 'var(--color-foreground)' }}>FAQs &amp; Help Center</span>
                </button>

                {/* Send Feedback */}
                <button onClick={() => navigateTo('/feedback')} className="w-full flex items-center gap-4 px-5 py-3.5 transition text-left hover:opacity-80">
                  <MessageCircle size={20} style={{ color: 'var(--color-text-secondary)' }} />
                  <span className="text-sm font-extrabold" style={{ color: 'var(--color-foreground)' }}>Send Feedback</span>
                </button>

                {/* Legal & Safety (Others) */}
                <div className="border-t mt-2 py-2" style={{ borderColor: 'var(--color-divider)' }}>
                  <h4 className="px-5 py-2 text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Legal &amp; Safety</h4>
                  
                  <button onClick={() => navigateTo('/terms')} className="w-full flex items-center justify-between px-5 py-2.5 transition text-left hover:opacity-80">
                    <span className="text-xs font-bold" style={{ color: 'var(--color-text-secondary)' }}>Terms of Service</span>
                    <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                  </button>

                  <button onClick={() => navigateTo('/privacy')} className="w-full flex items-center justify-between px-5 py-2.5 transition text-left hover:opacity-80">
                    <span className="text-xs font-bold" style={{ color: 'var(--color-text-secondary)' }}>Privacy Policy</span>
                    <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                  </button>

                  <div className="w-full flex items-center justify-between px-5 py-2.5 text-left">
                    <span className="text-xs font-bold" style={{ color: 'var(--color-text-secondary)' }}>Version</span>
                    <span className="text-xs font-black" style={{ color: 'var(--color-text-muted)' }}>5.30.97</span>
                  </div>
                </div>

                {/* Sign Out */}
                <button onClick={() => navigateTo('/setup')} className="w-full flex items-center gap-4 px-5 py-3.5 transition text-left border-t mt-2" style={{ color: 'var(--color-error)', borderColor: 'var(--color-divider)' }}>
                  <LogOut size={20} />
                  <span className="text-sm font-extrabold">Sign Out of Account</span>
                </button>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="p-3 flex items-center justify-between text-xs font-bold shrink-0" style={{ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-foreground)' }}>
              <span className="font-black flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                <Sparkles size={14} /> LoveWithYou
              </span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>v5.30.97 VIP</span>
            </div>
          </motion.div>

          {/* Coin History Modal */}
          <CoinHistoryModal isOpen={showCoinHistory} onClose={() => setShowCoinHistory(false)} />

          {/* User Search Detail Popup */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm rounded-3xl overflow-hidden border relative" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}>
                <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:opacity-80">
                  <X size={16} />
                </button>
                <div className="h-64 bg-black relative">
                  {selectedUser.photo_url ? (
                    <img src={selectedUser.photo_url} alt={selectedUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-white/20 absolute inset-0 m-auto" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      {selectedUser.name}
                      {selectedUser.isStudent && <div className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'var(--color-primary)' }}>STUDENT</div>}
                    </h3>
                    <p className="text-white/70 text-sm flex items-center gap-1">
                      <MapPin size={12} /> {selectedUser.location || "Nearby"}
                    </p>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <button className="w-full py-3 rounded-2xl font-extrabold text-xs text-white btn-signature-gradient" onClick={() => { onClose(); router.push(`/user/${selectedUser.id}`); }}>
                    View Complete Profile
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}