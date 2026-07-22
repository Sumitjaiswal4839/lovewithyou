"use client";

import { useUserStore } from "@/store/useUserStore";
import { INDIA_STATES, INDIA_CITIES } from "@/lib/indiaData";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Users, Heart, SlidersHorizontal } from "lucide-react";
import { Button } from "./ui/Button";

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarDrawer({ isOpen, onClose }: SidebarDrawerProps) {
  const matchPreferences = useUserStore((state) => state.matchPreferences);
  const updateMatchPreferences = useUserStore((state) => state.updateMatchPreferences);
  const profile = useUserStore((state) => state.profile);

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
                      onClick={() => updateMatchPreferences({ locationScope: scope as any })}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                        matchPreferences.locationScope === scope
                          ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20 scale-105"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
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

              <div className="p-4 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-2xl border border-primary-500/30">
                <p className="text-xs text-white/80 leading-relaxed text-center">
                  These filters will apply to <strong className="text-white">Match</strong>, <strong className="text-white">Random Chat</strong>, and <strong className="text-white">Blind Date</strong>.
                </p>
              </div>

            </div>

            <div className="p-4 border-t border-white/10">
              <Button onClick={onClose} className="w-full font-bold">Apply Filters</Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
