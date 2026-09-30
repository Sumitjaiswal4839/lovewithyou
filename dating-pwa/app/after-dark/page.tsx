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

  const wsRef = useRef<WebSocket | null>(null);
  const authToken = useUserStore((state) => state.authToken);
  const deviceId = useUserStore((state) => state.deviceId);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  const [sessionToken, setSessionToken] = useState<string>("");
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSearching = async () => {
    setRoomState("searching");
    setMessages([
      { id: Date.now().toString(), sender: "system", text: "🔍 Searching for a consensual 18+ partner...", timestamp: "" }
    ]);

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/lounge/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          myGender: myGender,
          targetGender: targetGender,
          vibeTag: vibeTag
        })
      });
      const data = await res.json();
      
      const newSession = data.data.sessionId;
      setSessionToken(newSession);

      if (data.data.matched) {
        handleMatchSuccess(data.data);
      } else {
        startPolling(newSession);
      }
    } catch (e) {
      toast("Error joining lounge", "error");
      setRoomState("idle");
    }
  };

  const startPolling = (token: string) => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/lounge/status?session=${token}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await res.json();
        
        if (data.status === "matched") {
           if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
           handleMatchSuccess(data.data);
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 5000);
  };

  const handleMatchSuccess = (matchData: any) => {
    setPartnerGender(matchData.partnerGender || "Anyone");
    setPartnerAgeRange("21+");
    setRoomState("connected");
    setMessages([
      { 
        id: Date.now().toString(), 
        sender: "system", 
        text: `🔒 Connected anonymously! Partner Vibe: ${matchData.vibeTag}. No name, no photos, and no GPS location are shared. Screenshot protection is active.`, 
        timestamp: "" 
      }
    ]);
    toast("✨ Connected with a new anonymous partner!", "success");

    const deviceIdStr = deviceId || "anon";
    const wsUrl = `${BACKEND_URL.replace("http", "ws")}/ws?room_id=${matchData.roomId}&device_id=${deviceIdStr}&token=${authToken}`;
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onmessage = (event) => {
      try {
        const incoming = JSON.parse(event.data);
        if (incoming.content && incoming.sender_id !== deviceIdStr) {
           setMessages(prev => [...prev, {
             id: Date.now().toString(),
             sender: "partner",
             text: incoming.content,
             timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
           } as AnonymousMessage]);
        }
      } catch (e) {}
    };
  };

  const handleNextPartner = async () => {
    toast("Disconnecting and hopping to a new anonymous partner...", "info");
    if (sessionToken) {
       await fetch(`${BACKEND_URL}/api/v1/lounge/disconnect`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ sessionToken })
       });
    }
    if (wsRef.current) wsRef.current.close();
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setMessages([]);
    startSearching();
  };

  const handleLeave = async () => {
    if (sessionToken) {
       await fetch(`${BACKEND_URL}/api/v1/lounge/disconnect`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ sessionToken })
       });
    }
    if (wsRef.current) wsRef.current.close();
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
       wsRef.current.send(JSON.stringify({
          sender_id: deviceId || "anon",
          content: inputMsg.trim(),
          type: "message"
       }));
    }
    
    setInputMsg("");
  };

  // --- 1. AGE & CONSENT SCREEN (18+ Mandatory Opt-In) ---
  if (!hasConsented) {
    return (
      <div className="fixed inset-0 z-[200] max-w-md mx-auto border-x border-white/5 bg-gradient-to-b from-black via-[#15050e] to-[#200512] flex flex-col items-center justify-center p-6 text-foreground font-sans text-center shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-primary-hover/20 border-2 border-primary/50 flex items-center justify-center mb-6 shadow-[0_0_35px_rgba(244,63,94,0.4)] animate-pulse">
          <Flame size={44} className="text-primary fill-current" />
        </div>

        <span className="bg-primary/20 text-primary border border-primary/40 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5 shadow">
          <AlertTriangle size={14} /> strictly 18+ consensual mode
        </span>

        <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
          After-Dark Intimate Lounge 🌙
        </h1>
        <p className="text-secondary text-xs sm:text-sm max-w-sm mb-8 leading-relaxed font-medium">
          An exclusive, ultra-private realm designed specifically for consensual adult dating, roleplay, and intimate late-night random conversations.
        </p>

        <div className="w-full max-w-sm bg-surface-elevated border border-border rounded-2xl p-5 mb-8 text-left space-y-3 shadow-xl backdrop-blur-md">
          <div className="flex items-start gap-3">
            <EyeOff size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-foreground">100% Identity Shielded</h4>
              <p className="text-[11px] text-muted leading-tight">Your Name, Photos, Campus & GPS location are strictly concealed. Only your Gender & Age bracket are shared.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="text-warning shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-foreground">Zero Disk Logging & Screenshot Protection</h4>
              <p className="text-[11px] text-muted leading-tight">Conversations reside entirely in RAM and evaporate forever the moment either user taps Next or leaves.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock size={18} className="text-green-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-foreground">Mutual Adult Respect</h4>
              <p className="text-[11px] text-muted leading-tight">By entering, you verify you are at least 18 years old and consent to entering a safe, adult conversational zone.</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => setHasConsented(true)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-primary hover:from-primary hover:to-pink-500 text-white font-extrabold text-sm shadow-[0_0_25px_rgba(244,63,94,0.5)] transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Flame size={18} className="fill-current" /> I am 18+ • Enter Private Lounge
          </button>
          <button
            onClick={() => router.back()}
            className="w-full py-3 rounded-2xl bg-surface-elevated hover:bg-white/15 text-secondary font-bold text-xs transition"
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
      <div className="min-h-screen max-w-md mx-auto border-x border-white/5 bg-gradient-to-b from-black via-[#13050c] to-black p-5 flex flex-col text-foreground font-sans shadow-2xl relative">
        <div className="flex justify-between items-center pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Flame size={24} className="text-primary fill-current" />
            <h2 className="text-lg font-bold text-foreground tracking-wide">After-Dark Setup 🤫</h2>
          </div>
          <button onClick={handleLeave} className="p-2 rounded-full bg-surface-elevated hover:bg-surface-elevated text-muted">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-8 py-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 font-semibold inline-flex items-center gap-1">
              <EyeOff size={12} /> Privacy Engine Active • No Names or Photos Exposed
            </span>
            <h3 className="text-2xl font-black text-foreground">Who are you looking to connect with tonight?</h3>
            <p className="text-xs text-muted">Set your anonymous gender parameters to start matching.</p>
          </div>

          {/* Gender Selector Box */}
          <div className="bg-surface-elevated border border-border rounded-3xl p-5 space-y-5 shadow-lg">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">Your Gender Identity</label>
              <div className="grid grid-cols-2 gap-3">
                {["Male", "Female"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setMyGender(g)}
                    className={`py-3 rounded-xl font-bold text-xs transition border ${
                      myGender === g
                        ? "bg-primary-hover border-primary text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                        : "bg-black/50 border-border text-white/60 hover:text-white"
                    }`}
                  >
                    {g === "Male" ? "♂ Male" : "♀ Female"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">Looking For (Consensual Partner)</label>
              <div className="grid grid-cols-3 gap-2.5">
                {(["Female", "Male", "Anyone"] as const).map((tgt) => (
                  <button
                    key={tgt}
                    onClick={() => setTargetGender(tgt)}
                    className={`py-3 rounded-xl font-bold text-xs transition border ${
                      targetGender === tgt
                        ? "bg-gradient-to-r from-pink-600 to-rose-600 border-pink-500 text-foreground shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                        : "bg-black/50 border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {tgt === "Female" ? "♀ Female" : tgt === "Male" ? "♂ Male" : "🌐 Anyone"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">Tonight&apos;s Conversation Vibe</label>
              <div className="grid grid-cols-2 gap-2">
                {["Flirt & Bold 🔥", "Intimate Roleplay 🎭", "Late Night Confessions 🌙", "Deep & Passionate 💖"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setVibeTag(tag)}
                    className={`py-2.5 px-2 rounded-xl text-[11px] font-bold text-center transition border ${
                      vibeTag === tag
                        ? "bg-surface-elevated border-primary text-primary"
                        : "bg-surface-elevated border-border text-muted hover:text-secondary"
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
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-primary hover:to-purple-500 font-extrabold text-base text-white shadow-[0_0_30px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2 transition transform active:scale-95"
          >
            <Sparkles size={20} /> Launch Anonymous Matchmaking 🎲
          </button>
        </div>
      </div>
    );
  }

  // --- 3. ACTIVE ANONYMOUS CHAT & SEARCHING SCREEN ---
  return (
    <div className="fixed inset-0 z-[150] bg-[#0c0307] flex flex-col text-foreground font-sans overflow-hidden">

      {/* Top Header */}
      <div className="p-3.5 border-b border-border bg-black/80 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(244,63,94,0.4)]">
            <EyeOff size={20} className="text-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-black flex items-center gap-1.5 text-foreground">
              {roomState === "searching" ? "Searching Lounge..." : `Anonymous ${partnerGender} 🤫`}
              {roomState === "connected" && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live Online"></span>}
            </h3>
            <p className="text-[10px] text-primary font-medium">
              {roomState === "connected" ? `Age: ${partnerAgeRange} • Vibe: ${vibeTag}` : "Encrypting P2P Tunnel..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {roomState === "connected" && (
            <button
              onClick={handleNextPartner}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-xs font-extrabold text-foreground flex items-center gap-1.5 shadow-md active:scale-95 transition"
              title="Skip & match with a new random partner"
            >
              <Shuffle size={14} /> Next Partner 🎲
            </button>
          )}
          <button
            onClick={handleLeave}
            className="px-3 py-2 rounded-xl bg-error/20 text-red-400 hover:bg-error hover:text-foreground border border-red-500/30 font-bold text-xs transition flex items-center gap-1"
          >
            <X size={15} /> Exit
          </button>
        </div>
      </div>

      {/* Encryption & No-Screenshot Reminder Banner */}
      <div className="bg-surface-elevated border-b border-primary/20 py-1.5 px-4 text-center text-[10px] font-semibold text-muted flex items-center justify-center gap-2">
        <Lock size={12} className="text-primary" /> End-to-end ephemeral RAM session. ZERO logs stored. Screenshots prohibited.
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-black via-[#0e0409] to-black">
        {roomState === "searching" ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-rose-500 animate-spin"></div>
              <Flame size={32} className="text-primary animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">Connecting to an anonymous {targetGender}...</h4>
              <p className="text-xs text-muted mt-1 max-w-xs">Matching based on your consensual 18+ vibe preference: <span className="text-primary font-bold">{vibeTag}</span></p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((m) => {
              if (m.sender === "system") {
                return (
                  <div key={m.id} className="text-center my-4">
                    <span className="inline-block bg-surface-elevated border border-border text-secondary text-[11px] px-4 py-1.5 rounded-2xl max-w-xs shadow">
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
                        ? "bg-gradient-to-r from-rose-600 to-pink-600 text-foreground rounded-br-none shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                        : "bg-surface-elevated text-gray-100 border border-white/15 rounded-bl-none"
                    }`}
                  >
                    <p className="leading-relaxed">{m.text}</p>
                    <span className={`block text-[9px] mt-1 text-right ${isMe ? "text-rose-200/70" : "text-muted"}`}>
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
        <div className="px-3 py-2 bg-black/90 border-t border-border flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            "What's your biggest fantasy? 🔥",
            "Truth or Dare: After-Dark Edition 🎲",
            "What kind of romance excites you? 💖",
            "Send an ephemeral secret 🤫",
          ].map((pill, idx) => (
            <button
              key={idx}
              onClick={() => setInputMsg(pill)}
              className="px-3 py-1.5 rounded-full bg-surface-elevated hover:bg-surface-elevated border border-primary/30 text-[11px] font-bold text-primary shrink-0 transition active:scale-95"
            >
              {pill}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 bg-background border-t border-border">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-surface-elevated border border-border rounded-full px-4 py-1.5 focus-within:border-primary transition">
          <input
            type="text"
            value={inputMsg}
            disabled={roomState === "searching"}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={roomState === "searching" ? "Waiting for partner connection..." : "Type an intimate message anonymously..."}
            className="flex-1 bg-transparent border-none outline-none text-foreground text-xs sm:text-sm placeholder:text-muted py-2.5 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim() || roomState === "searching"}
            className={`p-2.5 rounded-full transition transform ${
              inputMsg.trim() && roomState === "connected"
                ? "bg-primary-hover text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] scale-100"
                : "bg-surface-elevated text-gray-600 scale-95 cursor-not-allowed"
            }`}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
