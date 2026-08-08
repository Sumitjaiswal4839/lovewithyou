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
  Headphones
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

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
  const canSearch = useUserStore((state) => state.canSearch);
  const incrementSearchCount = useUserStore((state) => state.incrementSearchCount);
  const matchPreferences = useUserStore((state) => state.matchPreferences);
  const updateMatchPreferences = useUserStore((state) => state.updateMatchPreferences);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
        const res = await fetch(`${BACKEND_URL}/users/search?q=${encodeURIComponent(searchQuery)}`);
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
            className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-sm"
          />

          {/* Drawer Panel using clean Screenshot Layout structure */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-[84%] max-w-[340px] bg-white z-[70] shadow-2xl flex flex-col overflow-hidden text-slate-800 font-sans"
          >
            {/* Header Banner (Dark Cosmic Purple Layout from Screenshot) */}
            <div className="relative bg-gradient-to-br from-[#1b082d] via-[#2d0e4a] to-[#120422] p-5 pt-7 text-white overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/20 via-purple-500/10 to-transparent pointer-events-none" />

              <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white transition p-1">
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 relative z-10">
                {/* Profile Photo */}
                <div onClick={() => navigateTo("/profile/edit")} className="relative cursor-pointer group shrink-0">
                  <div className="w-16 h-16 rounded-full border-2 border-white/30 overflow-hidden bg-white/10 shadow-md">
                    {profile.photo_url || (profile.photos && profile.photos[0]) ? (
                      <img src={profile.photo_url || profile.photos?.[0]} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-400 to-purple-600 text-white font-bold text-xl">
                        👤
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-rose-500 border-2 border-[#1b082d] rounded-full flex items-center justify-center text-[10px] text-white">
                    ✎
                  </div>
                </div>

                {/* Profile Info & Voucher */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-white truncate">{profile.name || "User"}</h3>
                    <span className="text-xs font-bold text-gray-300">({profile.age || 22})</span>
                    <button onClick={() => navigateTo("/settings")} className="text-white/70 hover:text-white transition ml-auto">
                      <SettingsIcon size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-bold bg-pink-500/20 text-pink-300 px-2.5 py-0.5 rounded-full border border-pink-500/30">
                      🪙 {coins || 0} Coins
                    </span>

                    <button 
                      onClick={() => navigateTo("/premium")}
                      className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md shadow-rose-500/30 active:scale-95 transition"
                    >
                      Buy Coins
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Navigation List (Clean White Layout with Real LoveWithYou App Features) */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
              
              {/* Live Search Bar */}
              <div className="p-3 bg-slate-50 border-b border-slate-100">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search singles by name..."
                    className="w-full bg-white border border-slate-200 rounded-2xl py-2 pl-9 pr-4 text-xs text-slate-800 focus:outline-none focus:border-rose-500 transition shadow-sm"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && searchQuery.length >= 2 && (
                  <div className="mt-2 bg-white border border-slate-200 rounded-2xl max-h-48 overflow-y-auto shadow-xl">
                    {searchResults.map(user => (
                      <button
                        key={user.id}
                        onClick={() => handleUserClick(user)}
                        className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 transition border-b border-slate-100 last:border-0 text-left"
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-100 overflow-hidden shrink-0">
                          {user.photo_url ? (
                            <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <User size={14} className="text-slate-400 m-auto h-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-slate-800 text-xs font-bold truncate">{user.name}</h4>
                          <p className="text-slate-400 text-[10px] truncate">{user.campus || user.location || "Nearby"}</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-300" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Real App Core Navigation Features */}
              <div className="py-1">
                {/* My Matches */}
                <button onClick={() => navigateTo('/chat?tab=matches')} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition text-left">
                  <div className="flex items-center gap-4">
                    <MessageCircle size={20} className="text-blue-500" />
                    <span className="text-sm font-extrabold text-slate-800">My Matches</span>
                  </div>
                  <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">Chat</span>
                </button>

                {/* Who Liked Me */}
                <button onClick={() => navigateTo('/chat?tab=likes')} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition text-left">
                  <div className="flex items-center gap-4">
                    <HeartPulse size={20} className="text-rose-500" />
                    <span className="text-sm font-extrabold text-slate-800">Who Liked Me</span>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                </button>

                {/* 3-Min Blind Date */}
                <button onClick={() => navigateTo('/blind-date')} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-purple-50/50 transition text-left">
                  <div className="flex items-center gap-4">
                    <Headphones size={20} className="text-purple-600" />
                    <span className="text-sm font-extrabold text-purple-950">3-Min Blind Date</span>
                  </div>
                  <span className="text-[10px] font-black text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full uppercase">Audio</span>
                </button>

                {/* Random Chat */}
                <button onClick={() => navigateTo('/random-chat')} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition text-left">
                  <div className="flex items-center gap-4">
                    <Users size={20} className="text-orange-500" />
                    <span className="text-sm font-extrabold text-slate-800">Random Chat</span>
                  </div>
                  <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase">Live</span>
                </button>

                {/* Nearby Radar & VIP Boosts */}
                <button onClick={() => navigateTo('/nearby-map')} className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition text-left">
                  <Compass size={20} className="text-emerald-600" />
                  <span className="text-sm font-extrabold text-slate-800">Nearby Radar &amp; VIP Boosts</span>
                </button>

                {/* 18+ Anonymous After-Dark */}
                <button onClick={() => navigateTo('/after-dark')} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-rose-50/50 transition text-left">
                  <div className="flex items-center gap-4">
                    <Flame size={20} className="text-rose-600 animate-pulse" />
                    <span className="text-sm font-extrabold text-rose-950">18+ After-Dark Lounge</span>
                  </div>
                  <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full uppercase">18+</span>
                </button>

                {/* Midnight Roulette & 2v2 Squads */}
                <button onClick={() => navigateTo('/midnight-roulette')} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-indigo-50/50 transition text-left">
                  <div className="flex items-center gap-4">
                    <Moon size={20} className="text-indigo-600" />
                    <span className="text-sm font-extrabold text-indigo-950">Midnight Roulette &amp; 2v2 Squads</span>
                  </div>
                </button>

                {/* Match Preferences Accordion */}
                <div className="border-t border-slate-100 my-1">
                  <button 
                    onClick={() => setShowPreferences(!showPreferences)}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition text-left"
                  >
                    <div className="flex items-center gap-4">
                      <SlidersHorizontal size={20} className="text-slate-700" />
                      <span className="text-sm font-extrabold text-slate-800">Match Preferences</span>
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${showPreferences ? "rotate-180" : ""}`} />
                  </button>

                  {showPreferences && (
                    <div className="px-5 py-3 bg-slate-50 space-y-3 border-t border-slate-100 text-xs">
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-600 text-[10px] uppercase">Gender Filter</label>
                        <div className="grid grid-cols-3 gap-1">
                          {["Everyone", "Male", "Female"].map((g) => (
                            <button
                              key={g}
                              onClick={() => updateMatchPreferences({ gender: g as any })}
                              className={`py-1.5 rounded-xl font-bold text-[11px] transition ${
                                matchPreferences.gender === g ? "bg-rose-500 text-white font-extrabold" : "bg-white text-slate-600 border border-slate-200"
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Daily Cupid's Slot Machine */}
                <button onClick={() => navigateTo('/profile')} className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition text-left">
                  <Award size={20} className="text-amber-500" />
                  <span className="text-sm font-extrabold text-slate-800">Daily Cupid&apos;s Slot Machine</span>
                </button>

                {/* Settings */}
                <button onClick={() => navigateTo('/settings')} className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition text-left">
                  <SettingsIcon size={20} className="text-slate-700" />
                  <span className="text-sm font-extrabold text-slate-800">App Settings &amp; Security</span>
                </button>

                {/* FAQs */}
                <button onClick={() => navigateTo('/faq')} className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition text-left">
                  <HelpCircle size={20} className="text-slate-700" />
                  <span className="text-sm font-extrabold text-slate-800">FAQs &amp; Help Center</span>
                </button>

                {/* Send Feedback */}
                <button onClick={() => navigateTo('/feedback')} className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition text-left">
                  <MessageCircle size={20} className="text-slate-700" />
                  <span className="text-sm font-extrabold text-slate-800">Send Feedback</span>
                </button>

                {/* Sign Out */}
                <button onClick={() => navigateTo('/setup')} className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-rose-50 transition text-left border-t border-slate-100 mt-2 text-rose-600">
                  <LogOut size={20} />
                  <span className="text-sm font-black">Sign Out of Account</span>
                </button>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-bold shrink-0">
              <span className="text-rose-400 font-black flex items-center gap-1">
                <Sparkles size={14} /> LoveWithYou
              </span>
              <span className="text-[10px] text-gray-400">v5.4.30 VIP</span>
            </div>
          </motion.div>

          {/* User Search Detail Popup */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1e1e1e] w-full max-w-sm rounded-3xl overflow-hidden border border-white/10 relative text-white">
                <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white">
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
                      {selectedUser.isStudent && <div className="bg-rose-500 text-[10px] px-2 py-0.5 rounded-full font-bold">STUDENT</div>}
                    </h3>
                    <p className="text-white/70 text-sm flex items-center gap-1">
                      <MapPin size={12} /> {selectedUser.location || "Nearby"}
                    </p>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <button className="w-full py-3 rounded-2xl bg-rose-600 font-extrabold text-xs text-white" onClick={() => { onClose(); router.push(`/user/${selectedUser.id}`); }}>
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
