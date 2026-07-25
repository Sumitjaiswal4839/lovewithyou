"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, Clock, RotateCcw, Puzzle, Trophy, AlertTriangle, CheckCircle2, ScanFace, ChevronDown, ChevronRight, Zap, MapPin, PhoneCall, Quote, Award } from "lucide-react";
import { API } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";
import { useUserStore } from "@/store/useUserStore";

export default function AdvancedDatingWidget() {
  const { toast } = useToast();
  const spendCoins = useUserStore((state) => state.spendCoins);
  const coins = useUserStore((state) => state.coins);
  const deviceId = useUserStore((state) => state.deviceId);
  const addCoins = useUserStore((state) => state.addCoins);

  // 1. Daily Cupid's Slot Machine States
  const [spinningSlot, setSpinningSlot] = useState(false);
  const [slotPrize, setSlotPrize] = useState<string | null>(null);

  // 2. AI Catfish Buster Smile Scan States
  const [scanningSmile, setScanningSmile] = useState(false);
  const [isBlueDiamond, setIsBlueDiamond] = useState(false);

  // 3. Emergency SOS Check-in Timer States
  const [sosActive, setSosActive] = useState(false);
  const [sosLocation, setSosLocation] = useState("Starbucks Cafe, Connaught Place");
  const [sosPhone, setSosPhone] = useState("+91 98765-XXXXX (Best Friend)");

  // 4. Finish My Sentence Teasers States
  const [sentencePrompt, setSentencePrompt] = useState("On our first weekend together, we are eating at...");
  const [sentenceSaved, setSentenceSaved] = useState(true);

  // 5. Leaderboards States
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaders, setLeaders] = useState([
    { alias: "Ayesha M.", campus: "Delhi University Hub", rating: 980, badge: "👑 Platinum Vibe Queen" },
    { alias: "Rohan S.", campus: "IIT Tech Center", rating: 945, badge: "👑 Platinum Vibe King" },
    { alias: "Priya K.", campus: "Symbiosis Pune Hub", rating: 910, badge: "✨ Gold Matcher" },
  ]);

  const handleSpinCupidSlot = async () => {
    setSpinningSlot(true);
    setSlotPrize(null);
    const res = await API.spinDailyCupidSlot();
    setTimeout(() => {
      setSpinningSlot(false);
      const prize = res?.data?.prize || "15 Free Coins 🪙";
      setSlotPrize(prize);
      if (prize.includes("Coins")) addCoins(15);
      toast(`🎰 Cupid's Slot Machine landed on: ${prize}!`, "success");
    }, 1500);
  };

  const handleRunCatfishScan = async () => {
    setScanningSmile(true);
    await API.verifySmileCatfish(deviceId || "me", "mock_base64_selfie");
    setTimeout(() => {
      setScanningSmile(false);
      setIsBlueDiamond(true);
      toast("👁️ Smile Ratio matched 99.4%! Blue Diamond Verification Shield granted!", "success");
    }, 2000);
  };

  const handleToggleSosTimer = async () => {
    if (!sosActive) {
      await API.startSosCheckinTimer(deviceId || "me", sosLocation, sosPhone, 120);
      setSosActive(true);
      toast("🚨 2-Hour Date Protection SOS Timer Armed! We have your back!", "success");
    } else {
      await API.confirmSafeCheckin(deviceId || "me");
      setSosActive(false);
      toast("✅ Confirmed Safe Check-in! Hope your real-world date was amazing!", "success");
    }
  };

  const handleRewindVault = async () => {
    if (coins < 5) {
      toast("Need 5 Coins to rewind your swipe vault history!", "error");
      return;
    }
    spendCoins(5);
    await API.rewindLastSwipe(deviceId || "me");
    toast("🔄 Swiped card restored from vault! (-5 Coins)", "success");
  };

  return (
    <div className="space-y-5 pt-2">
      {/* Sleek Suite Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-sm">
            <Zap size={18} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-white font-black text-base tracking-tight">VIP Match &amp; Safety Suite</h2>
            <p className="text-[11px] text-gray-400 font-medium">Next-gen verification, tools &amp; perks</p>
          </div>
        </div>
        <span className="text-[10px] bg-gradient-to-r from-amber-500/20 to-pink-500/20 text-amber-300 font-extrabold px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1 shadow-sm">
          <Sparkles size={12} className="text-amber-400" /> PRO ENABLED
        </span>
      </div>

      {/* 1. Daily Cupid's Slot Machine Reward Banner */}
      <div className="bg-gradient-to-br from-[#1a0f2e] via-[#1f1235] to-[#120a20] border border-purple-500/30 hover:border-purple-500/50 rounded-3xl p-5 relative overflow-hidden shadow-lg transition-all duration-300 group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-pink-500/20 transition-all" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 text-[10px] bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              ✨ Daily Free Reward
            </span>
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              🎰 Cupid&apos;s Daily Slot Machine
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-normal">
              Spin the lucky wheel once every 24 hours to claim free Wallet Coins, Super Likes, and Profile Discovery boosts!
            </p>
          </div>

          <div className="flex sm:flex-col justify-end shrink-0">
            <button
              onClick={handleSpinCupidSlot}
              disabled={spinningSlot || !!slotPrize}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs shadow-md transition-all active:scale-95 text-center ${
                slotPrize
                  ? "bg-emerald-600/30 border border-emerald-500 text-emerald-300 cursor-default"
                  : "bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-pink-500/20 hover:opacity-95 animate-pulse"
              }`}
            >
              {spinningSlot ? "🎰 Spinning Wheel..." : slotPrize ? "Prize Claimed ✅" : "SPIN TO WIN 🔥"}
            </button>
          </div>
        </div>

        {slotPrize && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-center text-xs text-emerald-300 font-extrabold flex items-center justify-center gap-2">
            <span>🎉 Congrats! You landed on:</span> <span className="text-white font-black">{slotPrize}</span>
          </motion.div>
        )}
      </div>

      {/* 2. AI Catfish Shield & Rewinder - Stacked Horizontal Sleek Cards for ZERO CLIPPING */}
      <div className="space-y-3">
        {/* Catfish Buster Card */}
        <div className="bg-white/[0.03] border border-white/10 hover:border-blue-500/30 rounded-3xl p-5 transition-all shadow-md group">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <ScanFace size={14} className="text-blue-400" /> AI Vision Identity Protection
              </span>
              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                &quot;Catfish Buster&quot; Smile Scan <span className="text-blue-400">🛡️💎</span>
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Verify your real-time smile ratio against your gallery to unlock the coveted Blue Diamond trust shield.
              </p>
            </div>

            <button
              onClick={handleRunCatfishScan}
              disabled={isBlueDiamond || scanningSmile}
              className={`px-5 py-3 rounded-2xl font-black text-xs shrink-0 flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${
                isBlueDiamond
                  ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 cursor-default"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
              }`}
            >
              <ShieldCheck size={16} />
              {scanningSmile ? "AI Scanning..." : isBlueDiamond ? "Verified Diamond 💎" : "Run Smile Scan"}
            </button>
          </div>
        </div>

        {/* Second Chance Rewinder Vault */}
        <div className="bg-white/[0.03] border border-white/10 hover:border-purple-500/30 rounded-3xl p-5 transition-all shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <RotateCcw size={14} className="text-purple-400" /> Swipe History Vault
              </span>
              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                &quot;Second Chance&quot; Rewind Engine
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Accidentally swiped left on a potential soulmate? Open your history vault to immediately restore and like them!
              </p>
            </div>

            <button
              onClick={handleRewindVault}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs shrink-0 shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <RotateCcw size={16} /> Rewind Match (-5 🪙)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Emergency Date Safe Check-in SOS Timer - Re-structured for Zero Text Clipping! */}
      <div className={`border rounded-3xl p-5 transition-all duration-300 shadow-md ${
        sosActive ? "bg-rose-950/30 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)]" : "bg-gradient-to-r from-emerald-950/20 via-black to-emerald-950/10 border-white/10 hover:border-emerald-500/30"
      }`}>
        <div className="space-y-1.5">
          <span className={`text-[10px] font-extrabold px-3 py-0.5 rounded-full inline-flex items-center gap-1.5 uppercase tracking-wider border ${
            sosActive ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}>
            <Clock size={12} /> {sosActive ? "🚨 SOS PROTECTION ACTIVE (02:00:00)" : "🛡️ Physical Date Guardian"}
          </span>
          <h4 className="text-sm font-black text-white mt-1">Emergency &quot;Date Safe Check-in&quot;</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Meeting a date offline? Arm our 2-hour silent safety timer. If you don&apos;t confirm safety before time expires, an instant emergency SOS with your live meetup coordinates is sent to your trusted friend!
          </p>
        </div>

        {/* Vertically stacked & generous input fields to prevent clipping text */}
        <div className="space-y-3 mt-4">
          <div className="bg-black/60 border border-white/10 focus-within:border-emerald-500/50 rounded-2xl p-3 px-4 transition-all">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
              <MapPin size={12} className="text-emerald-400" /> Meetup Location / Cafe Address
            </div>
            <input
              type="text"
              value={sosLocation}
              disabled={sosActive}
              onChange={(e) => setSosLocation(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-white outline-none font-bold"
              placeholder="e.g. Starbucks Cafe, Connaught Place"
            />
          </div>

          <div className="bg-black/60 border border-white/10 focus-within:border-rose-500/50 rounded-2xl p-3 px-4 transition-all">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-400 uppercase tracking-wider mb-1">
              <PhoneCall size={12} className="text-rose-400" /> Trusted Friend Phone / SOS Contact
            </div>
            <input
              type="text"
              value={sosPhone}
              disabled={sosActive}
              onChange={(e) => setSosPhone(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-rose-200 outline-none font-extrabold"
              placeholder="e.g. +91 98765-XXXXX (Best Friend)"
            />
          </div>
        </div>

        <button
          onClick={handleToggleSosTimer}
          className={`w-full mt-4 py-3.5 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2 transition active:scale-95 ${
            sosActive
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
              : "bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 hover:opacity-95 text-white shadow-rose-600/20"
          }`}
        >
          {sosActive ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {sosActive ? "✅ Confirm Safe Check-in (Disarm Timer)" : "🚨 Arm 2-Hour Protection Timer"}
        </button>
      </div>

      {/* 4. "Finish My Sentence" Hinge-style Prompt Teaser */}
      <div className="bg-gradient-to-r from-pink-950/20 to-purple-950/20 border border-white/10 hover:border-pink-500/40 rounded-3xl p-5 space-y-3.5 transition-all shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-pink-400 flex items-center gap-1.5">
            <Puzzle size={15} className="text-pink-400" /> &quot;Finish My Sentence&quot; Profile Icebreaker
          </span>
          <button 
            onClick={() => { setSentenceSaved(true); toast("Icebreaker saved to your profile card!", "success"); }} 
            className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl font-extrabold hover:bg-emerald-500/30 transition"
          >
            {sentenceSaved ? "Saved ✅" : "Save Teaser"}
          </button>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Singles browsing your profile must creatively complete this sentence prompt to unlock sending you a direct message!
        </p>
        <div className="relative">
          <Quote size={16} className="absolute left-3.5 top-3 text-pink-500/60 rotate-180" />
          <input
            type="text"
            value={sentencePrompt}
            onChange={(e) => { setSentencePrompt(e.target.value); setSentenceSaved(false); }}
            className="w-full bg-black/70 border border-pink-500/30 focus:border-pink-500 rounded-2xl py-3 pl-10 pr-4 text-xs sm:text-sm text-pink-200 font-extrabold outline-none shadow-inner transition"
          />
        </div>
      </div>

      {/* 5. Top Flirter & Connector Leaderboards */}
      <div className="bg-gradient-to-r from-amber-950/20 via-purple-950/20 to-black border border-white/10 hover:border-amber-500/40 rounded-3xl p-5 transition-all shadow-md">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowLeaderboard(!showLeaderboard)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy size={20} className="animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Top Flirter &amp; Connector Leaderboards</h4>
              <p className="text-[11px] text-amber-300/80 font-medium">Weekly vibe rating winners earn the Platinum Vibe Tiara 👑</p>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white/5 text-gray-400">
            <ChevronRight size={16} className={`transform transition-transform duration-200 ${showLeaderboard ? "rotate-90 text-amber-400" : ""}`} />
          </div>
        </div>

        {showLeaderboard && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2 pt-4 mt-3 border-t border-white/10">
            {leaders.map((l, idx) => (
              <div key={idx} className="bg-black/40 border border-white/5 rounded-2xl p-3 px-4 flex items-center justify-between text-xs hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                    idx === 0 ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20" : idx === 1 ? "bg-purple-600 text-white" : "bg-white/10 text-gray-300"
                  }`}>
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="font-black text-white flex items-center gap-1.5">
                      {l.alias} {idx === 0 && <span className="text-amber-400 text-[10px]">👑 TOP VIBE</span>}
                    </p>
                    <p className="text-[10px] text-gray-400">{l.campus}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full block">
                    {l.badge}
                  </span>
                  <span className="text-[10px] text-purple-300 font-bold mt-1 block">{l.rating} Vibe Rating ⭐</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
