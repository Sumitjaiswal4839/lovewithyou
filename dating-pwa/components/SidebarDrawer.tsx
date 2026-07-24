"use client";
import { useState, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { INDIA_STATES, INDIA_CITIES } from "@/lib/indiaData";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Users, User, Heart, SlidersHorizontal, MessageCircle, HeartPulse, Settings, Edit3, Globe, Headphones, ShieldCheck, HelpCircle, Share2, LogOut, Coins, Search, ChevronRight } from "lucide-react";
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
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-4/5 max-w-[320px] bg-dark-bg border-r border-white/10 z-[70] shadow-2xl flex flex-col pt-safe"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-primary-500" />
                Match Settings
              </h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/70">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-32">
              
              {/* Search Profile */}
              <div className="space-y-3">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search profiles by name..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && searchQuery.length >= 2 && (
                  <div className="bg-black/40 border border-white/10 rounded-xl max-h-48 overflow-y-auto shadow-2xl">
                    {searchResults.map(user => (
                      <button
                        key={user.id}
                        onClick={() => handleUserClick(user)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                          {user.photo_url ? (
                            <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} className="text-white/50 m-auto h-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-bold truncate">{user.name}</h4>
                          <p className="text-white/50 text-xs truncate">{user.campus || user.location || "Unknown location"}</p>
                        </div>
                        <ChevronRight size={16} className="text-white/30" />
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                  <div className="text-center p-3 text-xs text-white/50 bg-white/5 rounded-xl border border-white/10">
                    No users found matching "{searchQuery}"
                  </div>
                )}
              </div>
              
              {/* Quick Links */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => { onClose(); router.push('/chat?tab=matches'); }}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <MessageCircle size={24} className="text-blue-400 mb-2" />
                  <span className="text-xs font-bold text-white">My Matches</span>
                </button>
                <button 
                  onClick={() => { onClose(); router.push('/chat?tab=likes'); }}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <HeartPulse size={24} className="text-pink-500 mb-2" />
                  <span className="text-xs font-bold text-white">Who Liked Me</span>
                </button>
                <button 
                  onClick={() => { onClose(); router.push('/blind-date'); }}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <Headphones size={24} className="text-purple-500 mb-2" />
                  <span className="text-xs font-bold text-white">Blind Date</span>
                </button>
                <button 
                  onClick={() => { onClose(); router.push('/nearby-map'); }}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <Globe size={24} className="text-green-500 mb-2" />
                  <span className="text-xs font-bold text-white">Nearby Map</span>
                </button>
              </div>
              
              {/* Gender Preference */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
                  <Users size={16} /> I want to meet
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {["Everyone", "Male", "Female"].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => updateMatchPreferences({ gender: gender as any })}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                        matchPreferences.gender === gender
                          ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20 scale-105"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Scope */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} /> Distance / Location
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {["Anywhere", "State", "City"].map((scope) => (
                    <button
                      key={scope}
                      onClick={() => {
                        if (scope !== "Anywhere" && matchPreferences.locationScope !== scope) {
                          if (coins < 5) {
                            toast("Not enough coins to unlock advanced filters!", "error");
                            return;
                          }
                          spendCoins(5);
                          toast(`Unlocked ${scope} filter for 5 coins!`, "success");
                        }
                        updateMatchPreferences({ locationScope: scope as any });
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all relative ${
                        matchPreferences.locationScope === scope
                          ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20 scale-105"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {scope !== "Anywhere" && <span className="absolute -top-2 -right-1 text-[10px] bg-yellow-500 text-black px-1 rounded-full font-bold">5 🪙</span>}
                      {scope}
                    </button>
                  ))}
                </div>
              </div>

              {/* State & City Selectors */}
              {(matchPreferences.locationScope === "State" || matchPreferences.locationScope === "City") && (
                <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="space-y-2">
                    <label className="text-xs text-white/70 font-medium">Select State</label>
                    <select 
                      value={matchPreferences.selectedState || ""}
                      onChange={handleStateChange}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value="">-- Choose State --</option>
                      {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {matchPreferences.locationScope === "City" && (
                    <div className="space-y-2">
                      <label className="text-xs text-white/70 font-medium">Select City</label>
                      <select 
                        value={matchPreferences.selectedCity || ""}
                        onChange={(e) => updateMatchPreferences({ selectedCity: e.target.value })}
                        disabled={!matchPreferences.selectedState || !INDIA_CITIES[matchPreferences.selectedState]}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary-500 disabled:opacity-50"
                      >
                        <option value="">-- Choose City --</option>
                        {matchPreferences.selectedState && INDIA_CITIES[matchPreferences.selectedState]?.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {matchPreferences.selectedState && !INDIA_CITIES[matchPreferences.selectedState] && (
                         <p className="text-[10px] text-yellow-500">Major cities list not available for this state yet.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* General Settings & Actions */}
              <div className="space-y-2 mt-6">
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 px-2">
                  Account & Settings
                </h3>
                
                <button 
                  onClick={() => { onClose(); router.push('/profile/edit'); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-white"
                >
                  <Edit3 size={18} className="text-blue-400" />
                  <span className="text-sm font-medium">Edit Profile</span>
                </button>

                <button 
                  onClick={() => { onClose(); router.push('/settings'); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-white"
                >
                  <Settings size={18} className="text-gray-400" />
                  <span className="text-sm font-medium">Settings</span>
                </button>

                <button 
                  onClick={() => { 
                    const isHi = useUserStore.getState().appSettings.language === 'hi';
                    useUserStore.getState().updateSettings({ language: isHi ? 'en' : 'hi' });
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-white"
                >
                  <Globe size={18} className="text-green-400" />
                  <span className="text-sm font-medium">Language ({useUserStore.getState().appSettings.language === 'hi' ? 'Hindi' : 'English'})</span>
                </button>

                <button 
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors text-white"
                >
                  <div className="flex items-center gap-3">
                    <Coins size={18} className="text-yellow-400" />
                    <span className="text-sm font-medium">Get Premium</span>
                  </div>
                  <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-2 py-0.5 rounded-full font-bold">SALE</span>
                </button>
              </div>

              <div className="space-y-2 mt-2">
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 px-2">
                  More
                </h3>

                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-white">
                  <ShieldCheck size={18} className="text-purple-400" />
                  <span className="text-sm font-medium">Safety Center</span>
                </button>

                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-white">
                  <HelpCircle size={18} className="text-pink-400" />
                  <span className="text-sm font-medium">Help & Support</span>
                </button>

                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: 'LoveWith You', url: 'https://lovewithyou.app' })
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-white"
                >
                  <Share2 size={18} className="text-teal-400" />
                  <span className="text-sm font-medium">Share App</span>
                </button>

                <button 
                  onClick={() => {
                     // Add signout logic later
                     onClose();
                     router.push('/setup');
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-red-400 mt-4"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>

            </div>

            <div className="p-4 border-t border-white/10">
              <Button onClick={onClose} className="w-full font-bold">Apply Filters</Button>
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
                      {selectedUser.isStudent && <div className="bg-primary-500 text-[10px] px-2 py-0.5 rounded-full">STUDENT</div>}
                    </h3>
                    <p className="text-white/70 text-sm flex items-center gap-1">
                      <MapPin size={12} /> {selectedUser.location || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {selectedUser.bio && (
                    <p className="text-white/80 text-sm leading-relaxed">
                      "{selectedUser.bio}"
                    </p>
                  )}
                  <Button 
                    variant="primary" 
                    className="w-full"
                    onClick={() => {
                      onClose();
                      router.push(`/user/${selectedUser.id}`);
                    }}
                  >
                    View Complete Profile
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
