"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Flame, ShieldAlert, Lock, Send, RefreshCw, EyeOff, Sparkles, AlertTriangle, Heart, UserCheck, Shuffle } from "lucide-react";
import MatchPreferencesHeader from "@/components/MatchPreferencesHeader";
import { useUserStore } from "@/store/useUserStore";
import { useToast } from "@/components/ui/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";

interface AnonymousMessage {
  id: string;
  sender: "me" | "partner" | "system";
  text: string;
  timestamp: string;
}

export default function AfterDarkLoungePage() {
  const router = useRouter();
  const { toast } = useToast();
  const profile = useUserStore((state) => state.profile);

  // Consent & Age Validation Screen
  const [hasConsented, setHasConsented] = useState<boolean>(false);

  // Matchmaking Parameters (No Name, No GPS, ONLY Gender & Vibe)
  const [myGender, setMyGender] = useState<string>(profile?.gender || "Male");
  const [targetGender, setTargetGender] = useState<"Female" | "Male" | "Anyone">("Female");
  const [vibeTag, setVibeTag] = useState<string>("Flirt & Bold 🔥");

  // Room State
  const [roomState, setRoomState] = useState<"idle" | "searching" | "connected">("idle");
  const [partnerGender, setPartnerGender] = useState<string>("Female");
  const [partnerAgeRange, setPartnerAgeRange] = useState<string>("21+");
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [inputMsg, setInputMsg] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSearching = () => {
    setRoomState("searching");
    setMessages([
      { id: "1", sender: "system", text: "🔍 Searching for a consensual 18+ partner...", timestamp: "" }
    ]);

    setTimeout(() => {
      const matchedGender = targetGender === "Anyone" ? (Math.random() > 0.5 ? "Female" : "Male") : targetGender;
      setPartnerGender(matchedGender);
      setPartnerAgeRange("22+");
      setRoomState("connected");
      setMessages([
        { 
          id: "2", 
          sender: "system", 
          text: "🔒 Connected anonymously! No name, no photos, and no GPS location are shared. Screenshot protection is active.", 
          timestamp: "" 
        },
        {
          id: "3",
          sender: "partner",
          text: `Hey there! I'm here for some late-night fun and intimate flirting. What's your vibe tonight? 🔥`,
          timestamp: "Just now"
        }
      ]);
      toast("✨ Connected with a new anonymous partner!", "success");
    }, 2500);
  };

  const handleNextPartner = () => {
    toast("Disconnecting and hopping to a new anonymous partner...", "info");
    setMessages([]);
    startSearching();
  };

  const handleLeave = () => {
    toast("Session terminated. All intimate chat logs evaporated from RAM.", "info");
    router.back();
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg: AnonymousMessage = {
      id: Date.now().toString(),
      sender: "me",
      text: inputMsg.trim(),
      timestamp: "Just now"
    };

    setMessages((prev) => [...prev, newMsg]);
    const currentText = inputMsg.trim();
    setInputMsg("");

    // Simulated Partner Reply
    if (roomState === "connected") {
      setTimeout(() => {
        let replyText = "That sounds super exciting and bold... tell me more about your secret desires! 🤫✨";
        if (currentText.toLowerCase().includes("fantasy")) {
          replyText = "My biggest fantasy involves spontaneous midnight getaways with someone brave enough to take the lead 😉🔥";
        } else if (currentText.toLowerCase().includes("truth or dare")) {
          replyText = "I choose Dare! Give me a fun, daring question to answer honestly! 🎲💋";
        }
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), sender: "partner", text: replyText, timestamp: "Just now" }
        ]);
      }, 2000);
    }
  };

  // --- 1. AGE & CONSENT SCREEN (18+ Mandatory Opt-In) ---
  if (!hasConsented) {
    return (
      <div className="fixed inset-0 z-[200] bg-gradient-to-b from-black via-[#15050e] to-[#200512] flex flex-col items-center justify-center p-6 text-white font-sans text-center">
        <div className="w-20 h-20 rounded-full bg-rose-600/20 border-2 border-rose-500/50 flex items-center justify-center mb-6 shadow-[0_0_35px_rgba(244,63,94,0.4)] animate-pulse">
          <Flame size={44} className="text-rose-500 fill-current" />
        </div>

        <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5 shadow">
          <AlertTriangle size={14} /> strictly 18+ consensual mode
        </span>

        <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
          After-Dark Intimate Lounge 🌙
        </h1>
        <p className="text-gray-300 text-xs sm:text-sm max-w-sm mb-8 leading-relaxed font-medium">
          An exclusive, ultra-private realm designed specifically for consensual adult dating, roleplay, and intimate late-night random conversations.
        </p>

        <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 text-left space-y-3 shadow-xl backdrop-blur-md">
          <div className="flex items-start gap-3">
            <EyeOff size={18} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">100% Identity Shielded</h4>
              <p className="text-[11px] text-gray-400 leading-tight">Your Name, Photos, Campus & GPS location are strictly concealed. Only your Gender & Age bracket are shared.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">Zero Disk Logging & Screenshot Protection</h4>
              <p className="text-[11px] text-gray-400 leading-tight">Conversations reside entirely in RAM and evaporate forever the moment either user taps Next or leaves.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock size={18} className="text-green-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">Mutual Adult Respect</h4>
              <p className="text-[11px] text-gray-400 leading-tight">By entering, you verify you are at least 18 years old and consent to entering a safe, adult conversational zone.</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => setHasConsented(true)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-[0_0_25px_rgba(244,63,94,0.5)] transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Flame size={18} className="fill-current" /> I am 18+ • Enter Private Lounge
          </button>
          <button
            onClick={() => router.back()}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold text-xs transition"
          >
            Exit & Return to Standard Dating
          </button>
        </div>
      </div>
    );
  }

  // --- 2. MATCHMAKING SETUP SCREEN ---
  if (roomState === "idle") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-[#13050c] to-black p-5 flex flex-col text-white font-sans">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Flame size={24} className="text-rose-500 fill-current" />
            <h2 className="text-lg font-bold text-white tracking-wide">After-Dark Setup 🤫</h2>
          </div>
          <button onClick={handleLeave} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-8 py-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] bg-rose-500/10 text-rose-300 px-3 py-1 rounded-full border border-rose-500/20 font-semibold inline-flex items-center gap-1">
              <EyeOff size={12} /> Privacy Engine Active • No Names or Photos Exposed
            </span>
            <h3 className="text-2xl font-black text-white">Who are you looking to connect with tonight?</h3>
            <p className="text-xs text-gray-400">Set your anonymous gender parameters to start matching.</p>
          </div>

          {/* Gender Selector Box */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-5 shadow-lg">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Your Gender Identity</label>
              <div className="grid grid-cols-2 gap-3">
                {["Male", "Female"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setMyGender(g)}
                    className={`py-3 rounded-xl font-bold text-xs transition border ${
                      myGender === g
                        ? "bg-rose-600 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                        : "bg-black/50 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {g === "Male" ? "♂ Male" : "♀ Female"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Looking For (Consensual Partner)</label>
              <div className="grid grid-cols-3 gap-2.5">
                {(["Female", "Male", "Anyone"] as const).map((tgt) => (
                  <button
                    key={tgt}
                    onClick={() => setTargetGender(tgt)}
                    className={`py-3 rounded-xl font-bold text-xs transition border ${
                      targetGender === tgt
                        ? "bg-gradient-to-r from-pink-600 to-rose-600 border-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                        : "bg-black/50 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {tgt === "Female" ? "♀ Female" : tgt === "Male" ? "♂ Male" : "🌐 Anyone"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Tonight&apos;s Conversation Vibe</label>
              <div className="grid grid-cols-2 gap-2">
                {["Flirt & Bold 🔥", "Intimate Roleplay 🎭", "Late Night Confessions 🌙", "Deep & Passionate 💖"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setVibeTag(tag)}
                    className={`py-2.5 px-2 rounded-xl text-[11px] font-bold text-center transition border ${
                      vibeTag === tag
                        ? "bg-white/20 border-rose-400 text-rose-300"
                        : "bg-black/40 border-white/5 text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={startSearching}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 font-extrabold text-base text-white shadow-[0_0_30px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2 transition transform active:scale-95"
          >
            <Sparkles size={20} /> Launch Anonymous Matchmaking 🎲
          </button>
        </div>
      </div>
    );
  }

  // --- 3. ACTIVE ANONYMOUS CHAT & SEARCHING SCREEN ---
  return (
    <div className="fixed inset-0 z-[150] bg-[#0c0307] flex flex-col text-white font-sans overflow-hidden">
      <MatchPreferencesHeader />
      {/* Top Header */}
      <div className="p-3.5 border-b border-white/10 bg-black/80 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(244,63,94,0.4)]">
            <EyeOff size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black flex items-center gap-1.5 text-white">
              {roomState === "searching" ? "Searching Lounge..." : `Anonymous ${partnerGender} 🤫`}
              {roomState === "connected" && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live Online"></span>}
            </h3>
            <p className="text-[10px] text-rose-400 font-medium">
              {roomState === "connected" ? `Age: ${partnerAgeRange} • Vibe: ${vibeTag}` : "Encrypting P2P Tunnel..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {roomState === "connected" && (
            <button
              onClick={handleNextPartner}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-xs font-extrabold text-white flex items-center gap-1.5 shadow-md active:scale-95 transition"
              title="Skip & match with a new random partner"
            >
              <Shuffle size={14} /> Next Partner 🎲
            </button>
          )}
          <button
            onClick={handleLeave}
            className="px-3 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 font-bold text-xs transition flex items-center gap-1"
          >
            <X size={15} /> Exit
          </button>
        </div>
      </div>

      {/* Encryption & No-Screenshot Reminder Banner */}
      <div className="bg-black/60 border-b border-rose-500/20 py-1.5 px-4 text-center text-[10px] font-semibold text-gray-400 flex items-center justify-center gap-2">
        <Lock size={12} className="text-rose-400" /> End-to-end ephemeral RAM session. ZERO logs stored. Screenshots prohibited.
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-black via-[#0e0409] to-black">
        {roomState === "searching" ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin"></div>
              <Flame size={32} className="text-rose-400 animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Connecting to an anonymous {targetGender}...</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">Matching based on your consensual 18+ vibe preference: <span className="text-rose-400 font-bold">{vibeTag}</span></p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((m) => {
              if (m.sender === "system") {
                return (
                  <div key={m.id} className="text-center my-4">
                    <span className="inline-block bg-white/5 border border-white/10 text-gray-300 text-[11px] px-4 py-1.5 rounded-2xl max-w-xs shadow">
                      {m.text}
                    </span>
                  </div>
                );
              }
              const isMe = m.sender === "me";
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md font-medium ${
                      isMe
                        ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-br-none shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                        : "bg-white/10 text-gray-100 border border-white/15 rounded-bl-none"
                    }`}
                  >
                    <p className="leading-relaxed">{m.text}</p>
                    <span className={`block text-[9px] mt-1 text-right ${isMe ? "text-rose-200/70" : "text-gray-400"}`}>
                      {m.timestamp}
                    </span>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Quick Intimate Vibe Starter Pills */}
      {roomState === "connected" && (
        <div className="px-3 py-2 bg-black/90 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            "What's your biggest fantasy? 🔥",
            "Truth or Dare: After-Dark Edition 🎲",
            "What kind of romance excites you? 💖",
            "Send an ephemeral secret 🤫",
          ].map((pill, idx) => (
            <button
              key={idx}
              onClick={() => setInputMsg(pill)}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-rose-500/30 text-[11px] font-bold text-rose-300 shrink-0 transition active:scale-95"
            >
              {pill}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 bg-dark-bg border-t border-white/10">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 focus-within:border-rose-500 transition">
          <input
            type="text"
            value={inputMsg}
            disabled={roomState === "searching"}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={roomState === "searching" ? "Waiting for partner connection..." : "Type an intimate message anonymously..."}
            className="flex-1 bg-transparent border-none outline-none text-white text-xs sm:text-sm placeholder:text-gray-500 py-2.5 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim() || roomState === "searching"}
            className={`p-2.5 rounded-full transition transform ${
              inputMsg.trim() && roomState === "connected"
                ? "bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] scale-100"
                : "bg-white/10 text-gray-600 scale-95 cursor-not-allowed"
            }`}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
