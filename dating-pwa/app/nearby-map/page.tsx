"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { X, MapPin, Radar, Sliders, Send, Sparkles, ShieldCheck, Heart, UserCheck, Coins, Flame, Radio } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { API } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import Leaflet Map because it requires window object
const MapComponent = dynamic(() => import("@/components/MapComponent"), { 
  ssr: false, 
  loading: () => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-dark-bg text-gray-400 gap-3">
      <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
      <span className="text-sm font-medium">Loading GPS Map Engine...</span>
    </div>
  ) 
});

interface RadarUser {
  id: string;
  alias: string;
  gender: string;
  distance: number;
  badge: string;
  verified: boolean;
  x: number; // Percent % position on radar grid
  y: number;
  avatar: string;
}

const MOCK_RADAR_USERS: RadarUser[] = [
  { id: "r1", alias: "P***a (CS Dept)", gender: "Female", distance: 0.8, badge: "💎 Platinum Karma", verified: true, x: 30, y: 40, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80" },
  { id: "r2", alias: "S***t (Medical)", gender: "Male", distance: 1.4, badge: "🔥 Campus Vibe", verified: true, x: 70, y: 25, avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80" },
  { id: "r3", alias: "A***n (Design)", gender: "Female", distance: 2.1, badge: "🌸 Safe Pick", verified: true, x: 75, y: 70, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80" },
  { id: "r4", alias: "M***k (Engineering)", gender: "Female", distance: 3.5, badge: "🎵 Music Lover", verified: false, x: 25, y: 80, avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80" },
  { id: "r5", alias: "K***j (MBA Hub)", gender: "Male", distance: 4.8, badge: "🚀 Entrepreneur", verified: true, x: 50, y: 20, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
];

export default function NearbyMapPage() {
  const router = useRouter();
  const { toast } = useToast();
  const coins = useUserStore((state) => state.coins);
  const spendCoins = useUserStore((state) => state.spendCoins);

  const [activeTab, setActiveTab] = useState<"radar" | "map">("radar");
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [selectedUser, setSelectedUser] = useState<RadarUser | null>(null);
  const [pingedUsers, setPingedUsers] = useState<string[]>([]);
  const [hasHalo, setHasHalo] = useState(false);
  const [pulseSent, setPulseSent] = useState(false);

  const filteredUsers = MOCK_RADAR_USERS.filter((u) => u.distance <= radiusKm);

  const handleActivateHalo = async () => {
    if (coins < 20) {
      toast("Need 20 Coins to equip the 24-hr Golden VIP Halo Aura!", "error");
      return;
    }
    spendCoins(20);
    await API.activateVipHalo("my_device_id");
    setHasHalo(true);
    toast("🌟 24-hr Golden VIP Halo Aura activated! Your avatar now shines with a neon-gold flame!", "success");
  };

  const handlePheromoneBroadcast = async () => {
    if (coins < 30) {
      toast("Need 30 Coins to trigger an instant Pheromone Pulse broadcast!", "error");
      return;
    }
    spendCoins(30);
    await API.broadcastPheromonePulse("my_device_id", 28.6139, 77.2090);
    setPulseSent(true);
    toast("📢 Pheromone Pulse sent! All singles within 3km notified instantly via high-priority push!", "success");
  };

  const handlePing = (user: RadarUser) => {
    if (pingedUsers.includes(user.id)) {
      toast("You already sent a Radar Ping to this user!", "info");
      return;
    }
    if (coins >= 5) {
      spendCoins(5);
      setPingedUsers((prev) => [...prev, user.id]);
      toast(`📡 Radar Ping sent to ${user.alias}! They will be notified instantly.`, "success");
      setSelectedUser(null);
    } else {
      toast("Not enough coins! Need 5 Coins to send a direct Radar Ping.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-dark-bg flex flex-col overflow-hidden text-white font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-[101]">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/40">
            <Radar size={20} className="text-primary-400 animate-spin" style={{ animationDuration: "6s" }} />
          </div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-1.5">
              Nearby Discovery <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </h2>
            <p className="text-[11px] text-gray-400">Anonymous GPS Protection Active</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Coin Badge */}
          <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs text-amber-300 font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <span>🪙</span> {coins}
          </div>
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Mode Toggler & Radius Control */}
      <div className="bg-black/60 border-b border-white/10 px-4 py-3 flex flex-col gap-3 z-[101] backdrop-blur-sm">
        <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
          <button
            onClick={() => setActiveTab("radar")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
              activeTab === "radar" ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30" : "text-gray-400 hover:text-white"
            }`}
          >
            <Radar size={15} /> Live Sonar Radar
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
              activeTab === "map" ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30" : "text-gray-400 hover:text-white"
            }`}
          >
            <MapPin size={15} /> Interactive Map
          </button>
        </div>

        {/* VIP Halo & Pheromone Pulse Boost Bar */}
        <div className="grid grid-cols-2 gap-2 my-1">
          <button
            onClick={handleActivateHalo}
            disabled={hasHalo}
            className={`py-2 px-3 rounded-xl font-black text-[11px] transition flex items-center justify-center gap-1.5 shadow-md ${
              hasHalo
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default"
                : "bg-gradient-to-r from-amber-500 to-yellow-600 hover:brightness-110 text-black font-extrabold"
            }`}
          >
            <Sparkles size={14} className="text-white fill-current" />
            {hasHalo ? "🌟 VIP Halo Equipped!" : "🌟 Golden Halo Aura (-20 Coins)"}
          </button>

          <button
            onClick={handlePheromoneBroadcast}
            disabled={pulseSent}
            className={`py-2 px-3 rounded-xl font-black text-[11px] transition flex items-center justify-center gap-1.5 shadow-md ${
              pulseSent
                ? "bg-rose-950/40 text-rose-300 border border-rose-500/40 cursor-default"
                : "bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:brightness-110 text-white animate-pulse"
            }`}
          >
            <Radio size={14} className="text-white animate-ping" />
            {pulseSent ? "📢 Pulse Active (3km)" : "📢 Pheromone Pulse (-30 Coins)"}
          </button>
        </div>

        {/* Distance Slider */}
        <div className="flex items-center justify-between gap-4 px-1">
          <span className="text-xs font-medium text-gray-300 flex items-center gap-1">
            <Sliders size={13} className="text-primary-400" /> Range Filter:
          </span>
          <div className="flex-1 flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>
          <span className="text-xs font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20 min-w-[50px] text-center">
            {radiusKm} km
          </span>
        </div>
      </div>

      {/* Main Container Area */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#0a0510] via-black to-[#051510]">
        {activeTab === "map" ? (
          <MapComponent />
        ) : (
          <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
            {/* Background glowing rings */}
            <div className="absolute w-[80vw] sm:w-[350px] aspect-square rounded-full border border-primary-500/20 animate-pulse"></div>
            <div className="absolute w-[60vw] sm:w-[250px] aspect-square rounded-full border border-primary-500/30"></div>
            <div className="absolute w-[40vw] sm:w-[150px] aspect-square rounded-full border border-primary-500/40"></div>
            <div className="absolute w-2 h-2 rounded-full bg-primary-400 shadow-[0_0_15px_rgba(236,72,153,1)] z-10"></div>

            {/* Radar Sweeper Animation */}
            <div 
              className="absolute w-[80vw] sm:w-[350px] aspect-square rounded-full pointer-events-none opacity-40 origin-center"
              style={{
                background: "conic-gradient(from 0deg, rgba(236,72,153,0) 270deg, rgba(236,72,153,0.5) 360deg)",
                animation: "spin 4s linear infinite",
              }}
            ></div>

            {/* Crosshairs */}
            <div className="absolute w-full h-[1px] bg-white/10"></div>
            <div className="absolute h-full w-[1px] bg-white/10"></div>

            {/* Floating Anonymized User Avatars */}
            {filteredUsers.map((user) => {
              const isPinged = pingedUsers.includes(user.id);
              return (
                <motion.div
                  key={user.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  onClick={() => setSelectedUser(user)}
                  style={{ top: `${user.y}%`, left: `${user.x}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-20"
                >
                  <div className={`relative p-0.5 rounded-full ${isPinged ? 'bg-green-500' : 'bg-gradient-to-tr from-primary-500 to-pink-500'} shadow-[0_0_15px_rgba(236,72,153,0.5)] transition group-hover:scale-110`}>
                    <img src={user.avatar} alt="Student Avatar" className="w-11 h-11 rounded-full object-cover blur-[2px] brightness-90 group-hover:blur-0 transition-all" />
                    {user.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-black text-blue-400 rounded-full p-0.5 border border-white/20 shadow-sm" title="AI Verified Face">
                        <ShieldCheck size={13} />
                      </div>
                    )}
                  </div>
                  <div className="mt-1 bg-black/80 border border-white/10 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight text-white flex items-center gap-1 shadow-md">
                    <span>{user.alias}</span>
                    <span className="text-primary-400 font-normal">({user.distance}km)</span>
                  </div>
                </motion.div>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="text-center z-20 px-6 bg-black/50 p-6 rounded-2xl backdrop-blur-md border border-white/10">
                <p className="text-gray-300 font-medium mb-1">No students located within {radiusKm} km</p>
                <p className="text-xs text-gray-500">Try broadening your range slider above to discover campus peers!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected User Modal Popup */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-dark-bg border border-white/15 rounded-3xl overflow-hidden shadow-2xl p-6 relative"
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center text-center mt-2">
                <div className="relative mb-4">
                  <img src={selectedUser.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-primary-500 shadow-[0_0_20px_rgba(236,72,153,0.4)]" />
                  {selectedUser.verified && (
                    <span className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full border border-black shadow">
                      <ShieldCheck size={16} />
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-1.5">
                  {selectedUser.alias}
                  <span className="text-xs px-2 py-0.5 bg-white/10 text-gray-300 rounded-full font-normal">{selectedUser.gender}</span>
                </h3>
                <p className="text-xs text-primary-400 font-medium mb-4">📍 Approximately {selectedUser.distance} km away from your location</p>

                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between mb-6">
                  <div className="text-left">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">Trust Standing</p>
                    <p className="text-sm font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                      <Sparkles size={14} /> {selectedUser.badge}
                    </p>
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-gray-300">
                    {selectedUser.verified ? "Verified Face" : "Pending AI Scan"}
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <button
                    onClick={() => handlePing(selectedUser)}
                    disabled={pingedUsers.includes(selectedUser.id)}
                    className={`w-full py-3.5 rounded-2xl font-bold transition flex items-center justify-center gap-2 shadow-lg ${
                      pingedUsers.includes(selectedUser.id)
                        ? "bg-green-600/30 text-green-300 border border-green-500/30 cursor-not-allowed"
                        : "bg-gradient-to-r from-primary-600 to-pink-500 hover:from-primary-500 hover:to-pink-400 text-white shadow-primary-600/30"
                    }`}
                  >
                    <Send size={16} />
                    {pingedUsers.includes(selectedUser.id) ? "Radar Ping Already Sent ✅" : "Send Radar Ping 📡 (5 Coins)"}
                  </button>

                  <p className="text-[11px] text-gray-400 leading-tight">
                    Sending a ping sends an instant vibration & connection prompt directly to their hardware device ID.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
