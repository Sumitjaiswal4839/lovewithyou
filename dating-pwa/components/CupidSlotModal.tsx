"use client";

import { useState } from "react";
import { Award, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API } from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";
import { useUserStore } from "@/store/useUserStore";
import { BaseModal } from "@/components/ui/BaseModal";

interface CupidSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CupidSlotModal({ isOpen, onClose }: CupidSlotModalProps) {
  const { toast } = useToast();
  const addCoins = useUserStore((state) => state.addCoins);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const slotEmojis = ["🍒", "🔔", "💎", "💖", "🪙", "🎁"];

  const handleSpin = async () => {
    setIsSpinning(true);
    setResult(null);

    // Call API
    const res = await API.spinDailyCupidSlot();
    
    // Fake spin delay for animation
    setTimeout(() => {
      setIsSpinning(false);
      const prize = res?.data?.prize || "15 Free Coins 🪙";
      setResult(prize);
      
      if (prize.includes("Coin")) {
        addCoins(15, "Won from Daily Cupid Slot");
        toast(`Jackpot! You won ${prize}!`, "success");
      } else {
        toast(`You got: ${prize}!`, "success");
      }
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Cupid Slot"
      icon={<Award size={20} className="text-warning" />}
      headerGradient="from-amber-900/40 to-orange-900/40"
      zIndex={100}
    >
      <div className="bg-surface-elevated">
        <div className="p-6 text-center space-y-6">
            <div className="space-y-2">
              <p className="text-xs text-muted font-bold">Spin once a day to win free coins, VIP halos, and super likes! 🎰</p>
            </div>

            {/* Slot Machine Display */}
            <div className="bg-black border-4 border-warning/30 rounded-2xl p-4 flex justify-between items-center h-28 shadow-inner overflow-hidden relative">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex-1 text-5xl flex items-center justify-center">
                  {isSpinning ? (
                    <motion.div
                      animate={{ y: [0, -100, 0] }}
                      transition={{ repeat: Infinity, duration: 0.2, delay: i * 0.1 }}
                      className="filter blur-[1px]"
                    >
                      {slotEmojis[i % slotEmojis.length]}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.6 }}
                    >
                      {result ? (result.includes("Coin") ? "🪙" : "🎁") : "💖"}
                    </motion.div>
                  )}
                </div>
              ))}
              
              {/* Overlay shadow for realism */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none"></div>
            </div>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-warning/20 border border-warning/50 text-warning font-black text-lg shadow-lg flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} /> {result}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleSpin}
              disabled={isSpinning || !!result}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-lg uppercase tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {isSpinning ? "Spinning..." : result ? "Come back tomorrow!" : "Pull Lever 🎰"}
            </button>
        </div>
      </div>
    </BaseModal>
  );
}
