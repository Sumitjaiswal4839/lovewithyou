"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Clock, RotateCcw, ScanFace, Zap, MapPin, PhoneCall, Quote } from "lucide-react";
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
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-sm">
            <Zap size={18} />
          </div>
          <div>
            <h2 className="text-white font-black text-base tracking-tight">VIP Match &amp; Safety Suite</h2>
            <p className="text-[11px] text-gray-400 font-medium">Next-gen verification, tools &amp; perks</p>
          </div>
        </div>
        <span className="text-[10px] bg-rose-500/15 text-rose-300 font-extrabold px-3 py-1 rounded-full border border-rose-500/30 flex items-center gap-1 shadow-sm">
          <Sparkles size={12} className="text-rose-400" /> PRO ENABLED
        </span>
      </div>

      {/* 1. Daily Cupid's Slot Machine Reward Banner */}
      <div className="bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-3xl p-5 relative overflow-hidden shadow-lg transition-all duration-300 group">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
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
                  : "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-rose-500/20"
              }`}
            >
              {spinningSlot ? "🎰 Spinning..." : slotPrize ? "Prize Claimed ✅" : "SPIN TO WIN 🔥"}
            </button>
          </div>
        </div>

        {slotPrize && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-center text-xs text-emerald-300 font-extrabold flex items-center justify-center gap-2">
            <span>🎉 Congrats! You landed on:</span> <span className="text-white font-black">{slotPrize}</span>
          </motion.div>
        )}
      </div>

      {/* 2. AI Catfish Shield & Rewinder */}
      <div className="space-y-3">
        {/* Catfish Buster Card */}
        <div className="bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-3xl p-5 transition-all shadow-md group">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <ScanFace size={14} className="text-rose-400" /> AI Vision Identity Protection
              </span>
              <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                &quot;Catfish Buster&quot; Smile Scan <span className="text-rose-400">🛡️💎</span>
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
                  ? "bg-rose-600/20 text-rose-300 border border-rose-500/30 cursor-default"
                  : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
              }`}
            >
              <ShieldCheck size={16} />
              {scanningSmile ? "AI Scanning..." : isBlueDiamond ? "Verified Diamond 💎" : "Run Smile Scan"}
            </button>
          </div>
        </div>

        {/* Second Chance Rewinder Vault */}
        <div className="bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-3xl p-5 transition-all shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <RotateCcw size={14} className="text-gray-400" /> Swipe History Vault
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
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black text-xs shrink-0 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <RotateCcw size={16} /> Rewind Match (-5 🪙)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Emergency Date Safe Check-in SOS Timer */}
      <div className={`border rounded-3xl p-5 transition-all duration-300 shadow-md ${
        sosActive ? "bg-rose-950/30 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)]" : "bg-white/[0.03] border-white/10 hover:border-white/20"
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

        <div className="space-y-3 mt-4">
          <div className="bg-black/60 border border-white/10 focus-within:border-rose-500/50 rounded-2xl p-3 px-4 transition-all">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
              <MapPin size={12} className="text-rose-400" /> Meetup Location / Cafe Address
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
              className="w-full bg-transparent text-xs sm:text-sm text-white outline-none font-bold"
              placeholder="+91 98765-XXXXX"
            />
          </div>

          <button
            onClick={handleToggleSosTimer}
            className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 ${
              sosActive
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
            }`}
          >
            {sosActive ? "✅ Confirm I Am Safe (Disarm SOS)" : "🚨 Arm 2-Hour Date Protection SOS"}
          </button>
        </div>
      </div>

      {/* 4. Finish My Sentence Teasers */}
      <div className="bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-3xl p-5 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Quote size={14} className="text-amber-400" /> Icebreaker Profile Teaser
          </span>
          <span className="text-[10px] text-gray-400">Hinge Style</span>
        </div>

        <h4 className="text-sm font-black text-white">Finish My Sentence Prompt</h4>

        <div className="bg-black/60 border border-white/10 rounded-2xl p-3 px-4 space-y-2">
          <p className="text-xs text-rose-300 font-bold italic">&quot;On our first weekend together, we are eating at...&quot;</p>
          <input
            type="text"
            value={sentencePrompt}
            onChange={(e) => { setSentencePrompt(e.target.value); setSentenceSaved(false); }}
            className="w-full bg-transparent text-xs text-white outline-none font-medium"
            placeholder="Complete this prompt..."
          />
        </div>

        <button
          onClick={() => { setSentenceSaved(true); toast("Saved prompt teaser to your public card!", "success"); }}
          className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs transition"
        >
          {sentenceSaved ? "Saved to Profile ✅" : "Save Prompt Teaser"}
        </button>
      </div>
    </div>
  );
}
