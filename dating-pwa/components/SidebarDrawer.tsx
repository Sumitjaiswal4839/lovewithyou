"use client";
import { useState, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { INDIA_STATES, INDIA_CITIES } from "@/lib/indiaData";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Users, User, Heart, SlidersHorizontal, MessageCircle, HeartPulse, Settings, Edit3, Globe, Headphones, ShieldCheck, HelpCircle, Share2, LogOut, Coins, Search, ChevronRight, ChevronDown, MessageSquareHeart, Flame, Moon, Sparkles, Award, Compass, ShieldAlert } from "lucide-react";
import { Button } from "./ui/Button";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarDrawer({ isOpen, onClose }: SidebarDrawerProps) {
  const { toast } = useToast();
  const matchPreferences = useUserStore((state) => state.matchPreferences);
  const updateMatchPreferences = useUserStore((state) => state.updateMatchPreferences);
  const profile = useUserStore((state) => state.profile);
  const coins = useUserStore((state) => state.coins);
  const spendCoins = useUserStore((state) => state.spendCoins);
  const canSearch = useUserStore((state) => state.canSearch);
  const incrementSearchCount = useUserStore((state) => state.incrementSearchCount);
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Accordion / Dropdown Submenu States
  const [openSections, setOpenSections] = useState({
    arenas: true,     // Core Dating & Social
    afterDark: true,  // 18+ & Late Night
    filters: false,   // Match Preferences & Distance
    vip: false,       // Premium & Rewards
    account: false,   // Account & Settings
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

  const handleUserClick = (user: any) => {
    if (canSearch()) {
      incrementSearchCount();
      setSelectedUser(user);
    } else {
      toast("Not enough coins! You need 1 coin to search more profiles today.", "error");
    }
  };

  if (!profile) return null;

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
            className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-md"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-4/5 max-w-[340px] bg-[#0c0816] border-r border-white/10 z-[70] shadow-2xl flex flex-col pt-safe text-white"
          >
            {/* Header Brand */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-pink-950/30 to-purple-950/30">
              <div className="flex items-center gap-2.5">
                <img src="/favicon.png" alt="LoveWithYou" className="w-7 h-7 object-contain drop-shadow" />
                <div>
                  <h2 className="text-lg font-extrabold bg-gradient-to-r from-white via-pink-200 to-rose-400 bg-clip-text text-transparent tracking-tight">
                    LoveWithYou
                  </h2>
                  <p className="text-[10px] text-pink-300 font-medium">Next-Gen Flirt & Discovery</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 custom-scrollbar">
              
              {/* Search Profile Box */}
              <div className="space-y-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search singles by name..."
                    className="w-full bg-black/60 border border-white/10 rounded-2xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-pink-500 transition-all shadow-inner"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && searchQuery.length >= 2 && (
                  <div className="bg-black/90 border border-white/10 rounded-2xl max-h-48 overflow-y-auto shadow-2xl z-20">
                    {searchResults.map(user => (
                      <button
                        key={user.id}
                        onClick={() => handleUserClick(user)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                          {user.photo_url ? (
                            <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <User size={16} className="text-white/50 m-auto h-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-xs font-bold truncate">{user.name}</h4>
                          <p className="text-white/50 text-[10px] truncate">{user.campus || user.location || "Unknown"}</p>
                        </div>
                        <ChevronRight size={14} className="text-white/30" />
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                  <div className="text-center p-2 text-[11px] text-white/50 bg-white/5 rounded-xl border border-white/5">
                    No singles found matching &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
              
              {/* ACCORDION 1: 💖 Dating & Social Arenas */}
              <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-lg">
                <button
                  onClick={() => toggleSection("arenas")}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-xs font-black text-white flex items-center gap-2">
                    <Compass size={16} className="text-pink-400" /> Core Dating & Arenas
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transform transition-transform ${openSections.arenas ? "rotate-180" : ""}`} />
                </button>
                
                {openSections.arenas && (
                  <div className="p-3 pt-0 grid grid-cols-2 gap-2 border-t border-white/5 bg-black/20">
                    <button 
                      onClick={() => { onClose(); router.push('/chat?tab=matches'); }}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                    >
                      <MessageCircle size={20} className="text-blue-400 mb-1" />
                      <span className="text-[11px] font-bold text-white">My Matches</span>
                    </button>
                    <button 
                      onClick={() => { onClose(); router.push('/chat?tab=likes'); }}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                    >
                      <HeartPulse size={20} className="text-pink-500 mb-1" />
                      <span className="text-[11px] font-bold text-white">Who Liked Me</span>
                    </button>
                    <button 
                      onClick={() => { onClose(); router.push('/blind-date'); }}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-purple-950/50 to-black hover:bg-purple-900/30 border border-purple-500/30 transition-all shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                    >
                      <Headphones size={20} className="text-purple-400 mb-1" />
                      <span className="text-[11px] font-bold text-purple-200">3-Min Blind Date</span>
                    </button>
                    <button 
                      onClick={() => { onClose(); router.push('/random-chat'); }}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                    >
                      <Users size={20} className="text-orange-400 mb-1" />
                      <span className="text-[11px] font-bold text-white">Random Chat</span>
                    </button>
                    <button 
                      onClick={() => { onClose(); router.push('/nearby-map'); }}
                      className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 transition-all"
                    >
                      <Globe size={18} className="text-emerald-400" />
                      <span className="text-xs font-extrabold text-emerald-200">📍 Nearby Radar & VIP Boosts</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ACCORDION 2: 🔥 18+ After-Dark & Late Night */}
              <div className="bg-gradient-to-br from-rose-950/30 via-indigo-950/30 to-black border border-rose-500/40 rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                <button
                  onClick={() => toggleSection("afterDark")}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-xs font-black text-rose-300 flex items-center gap-2">
                    <Flame size={16} className="text-rose-500 animate-bounce" /> 18+ After-Dark & Squads
                  </span>
                  <ChevronDown size={16} className={`text-rose-300 transform transition-transform ${openSections.afterDark ? "rotate-180" : ""}`} />
                </button>
                
                {openSections.afterDark && (
                  <div className="p-3 pt-0 space-y-2 border-t border-rose-500/20 bg-black/40">
                    <button 
                      onClick={() => { onClose(); router.push('/after-dark'); }}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 transition-all text-left group"
                    >
                      <span className="text-lg">💋</span>
                      <div>
                        <h4 className="text-xs font-extrabold text-rose-200 group-hover:text-white">18+ Anonymous Consent Mode</h4>
                        <p className="text-[10px] text-gray-400">Zero logging, ephemeral intimacy rooms</p>
                      </div>
                    </button>
                    <button 
                      onClick={() => { onClose(); router.push('/midnight-roulette'); }}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 transition-all text-left group"
                    >
                      <Moon size={20} className="text-indigo-400 animate-pulse flex-shrink-0" />
                      <div>
                        <h4 className="text-xs font-extrabold text-indigo-200 group-hover:text-white">🌙 Midnight Roulette & 2v2 Squads</h4>
                        <p className="text-[10px] text-gray-400">Late night lounge (11 PM-2 AM) & Tag-a-friend</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* ACCORDION 3: 🎯 Match Preferences & Distance */}
              <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-lg">
                <button
                  onClick={() => toggleSection("filters")}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-xs font-extrabold text-white flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-purple-400" /> Match Preferences & Scope
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transform transition-transform ${openSections.filters ? "rotate-180" : ""}`} />
                </button>
                
                {openSections.filters && (
                  <div className="p-4 pt-2 space-y-4 border-t border-white/5 bg-black/30 text-xs">
                    {/* Gender Preference */}
                    <div className="space-y-2">
                      <label className="font-bold text-white/70 text-[11px] uppercase tracking-wider block">Looking To Meet</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {["Everyone", "Male", "Female"].map((gender) => (
                          <button
                            key={gender}
                            onClick={() => updateMatchPreferences({ gender: gender as any })}
                            className={`py-2 px-2 rounded-xl font-bold transition-all ${
                              matchPreferences.gender === gender
                                ? "bg-pink-600 text-white shadow-md shadow-pink-600/30 font-black"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                            }`}
                          >
                            {gender}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Location Scope */}
                    <div className="space-y-2">
                      <label className="font-bold text-white/70 text-[11px] uppercase tracking-wider block">Location Range</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {["Anywhere", "State", "City"].map((scope) => (
                          <button
                            key={scope}
                            onClick={() => {
                              if (scope !== "Anywhere" && matchPreferences.locationScope !== scope) {
                                if (coins < 5) {
                                  toast("Not enough coins to unlock advanced location filters!", "error");
                                  return;
                                }
                                spendCoins(5);
                                toast(`Unlocked ${scope} filter for 5 coins!`, "success");
                              }
                              updateMatchPreferences({ locationScope: scope as any });
                            }}
                            className={`py-2 px-2 rounded-xl font-bold transition-all relative ${
                              matchPreferences.locationScope === scope
                                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                            }`}
                          >
                            {scope !== "Anywhere" && <span className="absolute -top-2 -right-1 text-[9px] bg-yellow-400 text-black px-1 rounded-full font-extrabold">5 🪙</span>}
                            {scope}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* State & City Pickers */}
                    {(matchPreferences.locationScope === "State" || matchPreferences.locationScope === "City") && (
                      <div className="space-y-3 pt-2 border-t border-white/10">
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold block mb-1">State</label>
                          <select 
                            value={matchPreferences.selectedState || ""}
                            onChange={handleStateChange}
                            className="w-full bg-black border border-white/20 rounded-xl p-2.5 text-xs text-white outline-none"
                          >
                            <option value="">-- Choose State --</option>
                            {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>

                        {matchPreferences.locationScope === "City" && (
                          <div>
                            <label className="text-[10px] text-gray-400 font-bold block mb-1">City</label>
                            <select 
                              value={matchPreferences.selectedCity || ""}
                              onChange={(e) => updateMatchPreferences({ selectedCity: e.target.value })}
                              disabled={!matchPreferences.selectedState || !INDIA_CITIES[matchPreferences.selectedState]}
                              className="w-full bg-black border border-white/20 rounded-xl p-2.5 text-xs text-white outline-none disabled:opacity-40"
                            >
                              <option value="">-- Choose City --</option>
                              {matchPreferences.selectedState && INDIA_CITIES[matchPreferences.selectedState]?.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ACCORDION 4: 👑 VIP & Monetization Rewards */}
              <div className="bg-gradient-to-r from-amber-950/40 to-black border border-amber-500/30 rounded-3xl overflow-hidden shadow-lg">
                <button
                  onClick={() => toggleSection("vip")}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-xs font-extrabold text-amber-300 flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400 animate-pulse" /> VIP Rewards & Coins Vault
                  </span>
                  <ChevronDown size={16} className={`text-amber-300 transform transition-transform ${openSections.vip ? "rotate-180" : ""}`} />
                </button>
                
                {openSections.vip && (
                  <div className="p-3 pt-0 space-y-2 border-t border-amber-500/20 bg-black/40">
                    <button 
                      onClick={() => { onClose(); router.push('/premium'); }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Coins size={18} className="text-yellow-400" />
                        <span className="text-xs font-bold text-white">Get Premium Access</span>
                      </div>
                      <span className="bg-amber-400 text-black text-[10px] px-2 py-0.5 rounded-full font-extrabold animate-pulse">SALE</span>
                    </button>
                    <button 
                      onClick={() => { onClose(); router.push('/profile'); }}
                      className="w-full flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-colors"
                    >
                      <Award size={16} className="text-purple-400" /> Daily Cupid&apos;s Slot Machine
                    </button>
                  </div>
                )}
              </div>

              {/* ACCORDION 5: ⚙️ Account & Settings */}
              <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-lg">
                <button
                  onClick={() => toggleSection("account")}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-xs font-extrabold text-white flex items-center gap-2">
                    <Settings size={16} className="text-gray-400" /> Account & App Settings
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transform transition-transform ${openSections.account ? "rotate-180" : ""}`} />
                </button>
                
                {openSections.account && (
                  <div className="p-2 space-y-1 border-t border-white/5 bg-black/30">
                    <button 
                      onClick={() => { onClose(); router.push('/profile/edit'); }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors text-white text-xs font-medium"
                    >
                      <Edit3 size={16} className="text-blue-400" /> Edit Profile Details
                    </button>
                    <button 
                      onClick={() => { onClose(); router.push('/settings'); }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors text-white text-xs font-medium"
                    >
                      <Settings size={16} className="text-gray-400" /> Preferences & Security
                    </button>
                    <button 
                      onClick={() => { 
                        const isHi = useUserStore.getState().appSettings.language === 'hi';
                        useUserStore.getState().updateSettings({ language: isHi ? 'en' : 'hi' });
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors text-white text-xs font-medium"
                    >
                      <Globe size={16} className="text-green-400" /> Language ({useUserStore.getState().appSettings.language === 'hi' ? 'Hindi' : 'English'})
                    </button>
                    <button 
                      onClick={() => { onClose(); router.push('/faq'); }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors text-white text-xs font-medium"
                    >
                      <HelpCircle size={16} className="text-pink-400" /> FAQ & Support Center
                    </button>
                    <button 
                      onClick={() => { onClose(); router.push('/feedback'); }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors text-white text-xs font-medium"
                    >
                      <MessageSquareHeart size={16} className="text-amber-400" /> Send Feedback
                    </button>
                    <button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: 'LoveWithYou', url: 'https://lovewithyou.app' });
                        }
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors text-white text-xs font-medium"
                    >
                      <Share2 size={16} className="text-teal-400" /> Share LoveWithYou App
                    </button>
                    <button 
                      onClick={() => { onClose(); router.push('/setup'); }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-500/10 transition-colors text-red-400 text-xs font-bold pt-2 border-t border-white/10 mt-2"
                    >
                      <LogOut size={16} /> Sign Out of Account
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Apply Bar */}
            <div className="p-4 border-t border-white/10 bg-black/80 backdrop-blur-md">
              <button onClick={onClose} className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 font-extrabold text-xs text-white shadow-lg shadow-pink-500/30 active:scale-95 transition-transform">
                APPLY PREFERENCES & DISCOVER 🔥
              </button>
            </div>
          </motion.div>

          {/* Profile Popup */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1e1e1e] w-full max-w-sm rounded-3xl overflow-hidden border border-white/10 relative"
              >
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                >
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
                      {selectedUser.isStudent && <div className="bg-pink-500 text-[10px] px-2 py-0.5 rounded-full font-bold">STUDENT</div>}
                    </h3>
                    <p className="text-white/70 text-sm flex items-center gap-1">
                      <MapPin size={12} /> {selectedUser.location || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {selectedUser.bio && (
                    <p className="text-white/80 text-sm leading-relaxed">
                      &quot;{selectedUser.bio}&quot;
                    </p>
                  )}
                  <button 
                    className="w-full py-3 rounded-2xl bg-pink-600 font-extrabold text-xs text-white"
                    onClick={() => {
                      onClose();
                      router.push(`/user/${selectedUser.id}`);
                    }}
                  >
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
