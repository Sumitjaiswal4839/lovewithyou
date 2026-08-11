"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Users, Sparkles, X, Shield, Clock, Send, Heart, Flame, Lock, UserPlus } from "lucide-react";
import { API } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";
import { useUserStore } from "@/store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";

export default function MidnightRoulettePage() {
  const router = useRouter();
  const { toast } = useToast();
  const profile = useUserStore((state) => state.profile);
  const deviceId = useUserStore((state) => state.deviceId);

  const [activeTab, setActiveTab] = useState<"midnight" | "squad">("midnight");
  const [demoOverride, setDemoOverride] = useState<boolean>(true); // For testing anytime

  // Squad 2v2 States
  const [squadName, setSquadName] = useState<string>("Midnight Nighthawks 🔥");
  const [friendTag, setFriendTag] = useState<string>("@Rahul_Du_Hub");
  const [squadReady, setSquadReady] = useState<boolean>(false);

  // Roulette States
  const [inLounge, setInLounge] = useState<boolean>(false);
  const [chatMsg, setChatMsg] = useState<string>("");
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: "system", text: "🌙 Welcome to the late-night nocturnal confessional. Zero judging, maximum vibe.", time: "23:05" },
    { sender: "anon_peer", text: "Hey! Who else is wide awake and contemplating love & cosmic destiny at midnight? 🌌✨", time: "23:06" },
  ]);

  const nowHour = new Date().getHours();
  const isMidnightHours = (nowHour >= 23 || nowHour <= 2) || demoOverride;

  const handleCreateSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendTag.trim()) {
      toast("Please tag a friend to form a 2v2 squad!", "error");
      return;
    }
    const res = await API.startDoubleDateSquad(deviceId || "anon_leader", friendTag, squadName);
    setSquadReady(true);
    toast(`👯‍♂️ 2v2 Squad '${squadName}' registered with ${friendTag}! Searching for match...`, "success");
  };

  const handleSendConfessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    setMessages((prev) => [...prev, { sender: "me", text: chatMsg, time: "Just now" }]);
    const sent = chatMsg;
    setChatMsg("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "anon_peer", text: `I totally feel that! Night hits differently when you share real emotions 💫`, time: "Just now" },
      ]);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#080512] to-black text-foreground font-sans flex flex-col">
      {/* Top Bar */}
      <div className="p-4 border-b border-border bg-black/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Moon size={20} className="text-indigo-400 fill-current" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Midnight & 2v2 Squads
            </h1>
            <p className="text-[10px] text-muted font-medium">11 PM - 2 AM Dark Roulette & Squad Teams</p>
          </div>
        </div>
        <button onClick={() => router.back()} className="p-2 rounded-full bg-surface-elevated hover:bg-surface-elevated text-muted">
          <X size={20} />
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex p-2 bg-surface-elevated border-b border-border gap-2">
        <button
          onClick={() => setActiveTab("midnight")}
          className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 ${
            activeTab === "midnight" ? "bg-indigo-600 text-foreground shadow-lg shadow-indigo-500/30" : "bg-surface-elevated text-muted"
          }`}
        >
          <Moon size={16} /> Midnight Confessional 🌙
        </button>
        <button
          onClick={() => setActiveTab("squad")}
          className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 ${
            activeTab === "squad" ? "bg-purple-600 text-foreground shadow-lg shadow-purple-500/30" : "bg-surface-elevated text-muted"
          }`}
        >
          <Users size={16} /> "Double Date" 2v2 Squad 👯‍♂️
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 max-w-lg mx-auto w-full p-4 flex flex-col">
        {activeTab === "midnight" && (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            {/* Time Gate Notice & Toggle */}
            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 text-center space-y-2">
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full uppercase font-extrabold tracking-widest inline-flex items-center gap-1">
                <Clock size={12} /> Time-Gated Sanctuary (11 PM - 2 AM Only)
              </span>
              <p className="text-xs text-secondary">
                A dark-mode sanctuary for restless nocturnal souls to match, discuss life mysteries, and flirt without judgment.
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <label className="text-[11px] text-indigo-400 font-bold">Override Time Gate (Test Mode):</label>
                <input
                  type="checkbox"
                  checked={demoOverride}
                  onChange={(e) => setDemoOverride(e.target.checked)}
                  className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
                />
              </div>
            </div>

            {!isMidnightHours ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 bg-surface-elevated rounded-3xl border border-border my-4">
                <Lock size={48} className="text-muted animate-pulse" />
                <h3 className="text-lg font-bold text-foreground">Lounge Closed 🔒</h3>
                <p className="text-xs text-muted max-w-xs">
                  The Midnight Roulette opens strictly between <span className="text-indigo-400 font-bold">11:00 PM and 2:00 AM</span>. Check the Test Mode toggle above to explore now!
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col bg-surface-elevated border border-border rounded-3xl overflow-hidden my-2 shadow-2xl">
                <div className="bg-indigo-900/40 p-3 border-b border-border flex items-center justify-between text-xs">
                  <span className="text-indigo-300 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Owl Chamber #418
                  </span>
                  <span className="text-muted">Anonymous Mode Active</span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[360px]">
                  {messages.map((m, idx) => (
                    <div key={idx} className={`flex flex-col ${m.sender === "me" ? "items-end" : "items-start"}`}>
                      <span className="text-[10px] text-indigo-400 font-semibold mb-0.5 px-1">{m.sender === "me" ? "You" : "Nocturnal Owl 🦉"}</span>
                      <div className={`px-4 py-2.5 rounded-2xl text-xs max-w-[82%] shadow-md ${
                        m.sender === "me" ? "bg-indigo-600 text-foreground rounded-br-none" : "bg-surface-elevated text-foreground border border-white/15 rounded-bl-none"
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendConfessional} className="p-3 bg-black/80 border-t border-border flex gap-2">
                  <input
                    type="text"
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    placeholder="Share a midnight thought or flirt..."
                    className="flex-1 bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-indigo-500"
                  />
                  <button type="submit" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-foreground font-bold text-xs flex items-center gap-1">
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === "squad" && (
          <div className="flex-1 flex flex-col justify-center space-y-6 py-4">
            <div className="text-center space-y-2">
              <span className="text-[11px] bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full font-bold inline-flex items-center gap-1">
                <Users size={14} /> Zero Shy Pressure • Double the Fun
              </span>
              <h2 className="text-2xl font-extrabold text-foreground">&quot;Double Date&quot; 2v2 Squads</h2>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Tag your best friend to team up in a 2 vs 2 group voice & messaging date room!
              </p>
            </div>

            {!squadReady ? (
              <form onSubmit={handleCreateSquad} className="bg-surface-elevated border border-border rounded-3xl p-6 space-y-5 shadow-xl">
                <div>
                  <label className="text-xs font-bold uppercase text-muted block mb-1.5">Your Squad Name</label>
                  <input
                    type="text"
                    value={squadName}
                    onChange={(e) => setSquadName(e.target.value)}
                    className="w-full bg-surface-elevated border border-white/15 rounded-2xl px-4 py-3 text-sm text-foreground focus:border-purple-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted block mb-1.5">Tag Your Friend (Handle or Campus ID)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={friendTag}
                      onChange={(e) => setFriendTag(e.target.value)}
                      placeholder="@Friend_Handle"
                      className="flex-1 bg-surface-elevated border border-white/15 rounded-2xl px-4 py-3 text-sm text-foreground focus:border-purple-500 outline-none font-medium"
                    />
                    <button type="button" onClick={() => setFriendTag("@Priya_College_Partner")} className="px-3 bg-surface-elevated rounded-2xl text-xs font-bold text-purple-300 hover:bg-surface-elevated">
                      Auto-Select
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-foreground font-extrabold text-base shadow-[0_0_30px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <UserPlus size={20} /> Form 2v2 Squad & Match Now 🔥
                </button>
              </form>
            ) : (
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-purple-950/40 border border-purple-500/50 rounded-3xl p-6 text-center space-y-5 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-purple-600/30 border border-purple-500 mx-auto flex items-center justify-center animate-bounce">
                  <Flame size={36} className="text-pink-400" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-foreground">Squad &apos;{squadName}&apos; Ready!</h3>
                  <p className="text-xs text-purple-300 mt-1">Team: <span className="font-bold text-foreground">You & {friendTag}</span></p>
                </div>
                <div className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-2 text-left">
                  <p className="text-xs text-success font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Matched with Squad: &quot;Campus Queens 💖&quot;
                  </p>
                  <p className="text-[11px] text-muted">4-Way WebRTC audio & group chat room ready!</p>
                </div>
                <button
                  onClick={() => router.push("/chat/group")}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 font-black text-foreground shadow-lg hover:brightness-110 flex items-center justify-center gap-2"
                >
                  Enter 4-Way Squad Lounge 🎙️✨
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
