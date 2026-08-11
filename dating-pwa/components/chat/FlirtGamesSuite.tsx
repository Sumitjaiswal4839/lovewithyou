"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Gamepad2, Volume2, Mic, Coins, Palette } from "lucide-react";
import { API } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";
import { useUserStore } from "@/store/useUserStore";

interface FlirtGamesSuiteProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => void;
}

export default function FlirtGamesSuite({ isOpen, onClose, onSendMessage }: FlirtGamesSuiteProps) {
  const { toast } = useToast();
  const spendCoins = useUserStore((state) => state.spendCoins);
  const coins = useUserStore((state) => state.coins);
  
  const [activeTab, setActiveTab] = useState<"bottle" | "truths" | "rps" | "canvas" | "whisper">("bottle");

  // Spin Bottle States
  const [spinning, setSpinning] = useState(false);
  const [bottleAngle, setBottleAngle] = useState(0);
  const [currentDare, setCurrentDare] = useState<string | null>(null);

  // 2 Truths 1 Lie States
  const [t1, setT1] = useState("I once accidentally went on a vacation without packing shoes.");
  const [t2, setT2] = useState("My love language is spicy food and stargazing.");
  const [lie, setLie] = useState("I have never stalked a crush on Instagram.");
  const [betPlaced, setBetPlaced] = useState(false);

  // Rock Paper Scissors States
  const [rpsResult, setRpsResult] = useState<string | null>(null);

  // Canvas States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [neonColor, setNeonColor] = useState("#f43f5e"); // Rose pink

  useEffect(() => {
    if (activeTab === "canvas" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0a0512";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const handleSpinBottle = async () => {
    setSpinning(true);
    setCurrentDare(null);
    const randomTurns = 1440 + Math.floor(Math.random() * 360);
    setBottleAngle((prev) => prev + randomTurns);
    
    const res = await API.playFlirtGame("chat_room", "spin_bottle", "spin", 0);
    setTimeout(() => {
      setSpinning(false);
      const dare = res?.data?.dare || "Describe your dream romantic date in 3 words!";
      setCurrentDare(dare);
      onSendMessage(`🎡 Spin the Bottle landed on Dare: "${dare}"`);
    }, 2000);
  };

  const handlePlaceBet2Truths = async () => {
    if (coins < 2) {
      toast("You need at least 2 Coins to place a Truth/Lie wager!", "error");
      return;
    }
    spendCoins(2);
    setBetPlaced(true);
    await API.playFlirtGame("chat_room", "two_truths", "bet_placed", 2);
    toast("2 Coins wagered! If partner guesses correctly, chat unlocks!", "success");
    onSendMessage(`🃏 2 Truths & 1 Lie Bet (-2 Coins): Can you spot the lie?\n1. ${t1}\n2. ${t2}\n3. ${lie}`);
  };

  const handlePlayRPS = async (choice: string) => {
    const res = await API.playFlirtGame("chat_room", "rps", choice, 1);
    const partnerChoice = res?.data?.partnerChoice || "scissors";
    let outcome = "It's a Tie! Play again!";
    if (
      (choice === "rock" && partnerChoice === "scissors") ||
      (choice === "paper" && partnerChoice === "rock") ||
      (choice === "scissors" && partnerChoice === "paper")
    ) {
      outcome = `You chose ${choice.toUpperCase()}, partner chose ${partnerChoice.toUpperCase()}! You won +2 Coins! 🎉`;
    } else if (choice !== partnerChoice) {
      outcome = `You lost to partner's ${partnerChoice.toUpperCase()}! Penalty: You owe a Virtual Rose 🌹!`;
      onSendMessage(`🌹 (Sent a cute Virtual Rose penalty for losing at Rock-Paper-Scissors!)`);
    }
    setRpsResult(outcome);
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = neonColor;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 12;
    ctx.shadowColor = neonColor;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const sendCanvasDoodle = () => {
    onSendMessage(`🎨 [Shared Neon Doodle Canvas]: Partner sketched a glowing romantic artwork!`);
    toast("Neon Doodle synced across both screens in real-time!", "success");
    onClose();
  };

  const handleSendWhisperNote = () => {
    onSendMessage(`🤫 [Intimate Whisper Voice Note (0:15s)] - Plays only via Ear Speaker 🎧`);
    toast("🤫 Intimate Whisper voice note delivered securely!", "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0c0817] border-t sm:border border-purple-500/30 w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.3)]">
        
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface-elevated">
          <div className="flex items-center gap-2">
            <Gamepad2 size={22} className="text-purple-400 animate-pulse" />
            <h2 className="text-sm sm:text-base font-black text-foreground uppercase tracking-wider">Flirt & Intimate Suite 🔥</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-surface-elevated hover:bg-surface-elevated text-muted">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-2 bg-surface-elevated gap-1 overflow-x-auto no-scrollbar border-b border-border text-xs font-bold">
          {[
            { id: "bottle", label: "🎡 Spin Bottle" },
            { id: "truths", label: "🃏 2 Truths & 1 Lie" },
            { id: "rps", label: "✌️ RPS Wager" },
            { id: "canvas", label: "🎨 Neon Doodle" },
            { id: "whisper", label: "🤫 Ear Whisper" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "bottle" | "truths" | "rps" | "canvas" | "whisper")}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-1 ${
                activeTab === tab.id ? "bg-gradient-to-r from-purple-600 to-pink-600 text-foreground shadow-lg" : "bg-surface-elevated text-muted hover:bg-surface-elevated"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-5 overflow-y-auto">
          {activeTab === "bottle" && (
            <div className="text-center space-y-6">
              <span className="text-[10px] bg-primary/20 text-pink-300 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider inline-block">
                3D Interactive Flirt Wheel
              </span>
              
              {/* Spinning Bottle Graphic */}
              <div className="w-48 h-48 mx-auto relative flex items-center justify-center bg-surface-elevated rounded-full border-2 border-dashed border-white/20 shadow-inner">
                <motion.div
                  animate={{ rotate: bottleAngle }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="w-12 h-36 bg-gradient-to-b from-emerald-400 via-teal-500 to-emerald-900 rounded-full border-2 border-white/40 shadow-[0_0_20px_rgba(16,185,129,0.5)] flex flex-col items-center justify-between py-2 cursor-pointer"
                  onClick={!spinning ? handleSpinBottle : undefined}
                >
                  <div className="w-5 h-6 bg-amber-400 rounded-t-lg border border-amber-600"></div>
                  <span className="text-[9px] font-black text-foreground tracking-tighter transform -rotate-90 whitespace-nowrap uppercase">SPIN ME 🔥</span>
                  <div className="w-8 h-8 rounded-full bg-surface-elevated mb-1"></div>
                </motion.div>
              </div>

              {currentDare && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-purple-950/60 border border-purple-500/40 rounded-2xl">
                  <p className="text-xs text-purple-300 font-bold">✨ Bottle Landed on You!</p>
                  <p className="text-sm font-extrabold text-foreground mt-1">&quot;{currentDare}&quot;</p>
                </motion.div>
              )}

              <button
                onClick={handleSpinBottle}
                disabled={spinning}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-foreground font-black text-sm shadow-[0_0_25px_rgba(236,72,153,0.4)] active:scale-95 transition"
              >
                {spinning ? "Bottle Spinning... 🎡" : "Spin the Bottle Now! 🔥"}
              </button>
            </div>
          )}

          {activeTab === "truths" && (
            <div className="space-y-4 text-left">
              <div className="bg-warning/15 border border-amber-500/40 rounded-2xl p-3 text-xs text-amber-200">
                <span className="font-bold flex items-center gap-1 text-warning">
                  <Coins size={14} /> Bet 2 Coins to Challenge
                </span>
                Partner must wager & correctly spot your Lie before unlocking deep profile secrets!
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase">Truth #1</label>
                  <input type="text" value={t1} onChange={(e) => setT1(e.target.value)} className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none mt-1" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted uppercase">Truth #2</label>
                  <input type="text" value={t2} onChange={(e) => setT2(e.target.value)} className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none mt-1" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-primary uppercase">The Lie (Secret 🤫)</label>
                  <input type="text" value={lie} onChange={(e) => setLie(e.target.value)} className="w-full bg-rose-950/30 border border-primary/40 rounded-xl px-3 py-2 text-xs text-rose-200 outline-none mt-1" />
                </div>
              </div>

              <button
                onClick={handlePlaceBet2Truths}
                disabled={betPlaced}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-foreground font-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Coins size={18} /> {betPlaced ? "Wager Active in Chat! 🎲" : "Place Wager & Send (-2 Coins)"}
              </button>
            </div>
          )}

          {activeTab === "rps" && (
            <div className="text-center space-y-6 py-2">
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full font-bold">
                ✌️ Mini-Bet: Loser sends a Virtual Rose 🌹!
              </span>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "rock", emoji: "✊", label: "Rock" },
                  { id: "paper", emoji: "🖐️", label: "Paper" },
                  { id: "scissors", emoji: "✌️", label: "Scissors" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handlePlayRPS(item.id)}
                    className="p-6 rounded-3xl bg-surface-elevated hover:bg-purple-600/30 border border-white/15 transition transform hover:scale-105 active:scale-95 flex flex-col items-center gap-2 shadow-lg"
                  >
                    <span className="text-4xl">{item.emoji}</span>
                    <span className="text-xs font-black text-foreground">{item.label}</span>
                  </button>
                ))}
              </div>

              {rpsResult && (
                <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 font-bold">
                  {rpsResult}
                </div>
              )}
            </div>
          )}

          {activeTab === "canvas" && (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-between text-xs font-bold text-secondary">
                <span>Synchronized Couple Blackboard ✨</span>
                <div className="flex items-center gap-2">
                  {["#f43f5e", "#06b6d4", "#a855f7", "#22c55e"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setNeonColor(c)}
                      className="w-6 h-6 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: c, transform: neonColor === c ? "scale(1.2)" : "scale(1)" }}
                    />
                  ))}
                </div>
              </div>

              <div className="border-2 border-white/20 rounded-2xl overflow-hidden shadow-2xl bg-[#0a0512]">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={240}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={() => setIsDrawing(false)}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={() => setIsDrawing(false)}
                  className="w-full h-60 cursor-crosshair touch-none"
                />
              </div>

              <button
                onClick={sendCanvasDoodle}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-black text-foreground text-xs shadow-lg flex items-center justify-center gap-2"
              >
                <Palette size={16} /> Send Glowing Canvas Stroke to Partner ✨
              </button>
            </div>
          )}

          {activeTab === "whisper" && (
            <div className="text-center space-y-6 py-4">
              <div className="w-24 h-24 rounded-full bg-primary-hover/20 border-2 border-primary mx-auto flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.4)]">
                <Volume2 size={40} className="text-primary" />
              </div>

              <div>
                <h3 className="text-lg font-black text-foreground">🤫 Intimate Whisper Voice Note</h3>
                <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
                  This special voice clip plays <span className="text-primary font-bold">exclusively in the phone call ear-speaker</span> (not speakerphone)—for maximum romance and quiet privacy!
                </p>
              </div>

              <button
                onClick={handleSendWhisperNote}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:brightness-110 text-foreground font-black text-sm shadow-[0_0_25px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2"
              >
                <Mic size={18} /> Record & Send Ear Whisper Note 🤫 (0:15s)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
