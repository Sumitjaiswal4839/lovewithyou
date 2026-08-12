"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coins, ArrowUpRight, ArrowDownLeft, ShieldCheck, Sparkles, RefreshCw } from "lucide-react";

interface CoinHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CoinHistoryModal({ isOpen, onClose }: CoinHistoryModalProps) {
  const coins = useUserStore((state) => state.coins);
  const cashbackVault = useUserStore((state) => state.cashbackVault);
  const coinHistory = useUserStore((state) => state.coinHistory);
  const loadCoinHistory = useUserStore((state) => state.loadCoinHistory);

  useEffect(() => {
    if (isOpen) {
      loadCoinHistory();
    }
  }, [isOpen, loadCoinHistory]);

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
            className="fixed inset-0 bg-black/80 z-[80] backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] max-w-md mx-auto bg-[#0d091a] border border-white/15 z-[90] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-foreground font-sans"
          >
            {/* Header */}
            <div className="p-5 border-b border-border bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-black flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-warning/20 border border-amber-500/30 flex items-center justify-center text-warning">
                  <Coins size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground tracking-tight flex items-center gap-1.5">
                    Coin History &amp; Ledger <Sparkles size={14} className="text-warning" />
                  </h3>
                  <p className="text-[10px] text-muted">100% Transparent ledger of earned &amp; spent coins</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadCoinHistory()}
                  className="p-2 rounded-full bg-surface-elevated hover:bg-surface-elevated text-secondary transition"
                  title="Refresh history"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-surface-elevated hover:bg-surface-elevated text-secondary transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Current Balance Summary Banner */}
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border-b border-border flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted block">Available Balance</span>
                <span className="text-2xl font-black text-warning flex items-center gap-1">
                  🪙 {coins} <span className="text-xs text-muted font-normal">Coins</span>
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-muted block">Cashback Vault</span>
                <span className="text-sm font-extrabold text-success">
                  +⚡ {cashbackVault} Coins
                </span>
              </div>
            </div>

            {/* Transaction List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {coinHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center text-muted">
                    <Coins size={24} />
                  </div>
                  <p className="text-xs font-bold text-muted">No transactions recorded yet.</p>
                  <p className="text-[10px] text-muted max-w-[200px]">
                    Earn free coins by completing daily games, watching ads, or unlocking random matches!
                  </p>
                </div>
              ) : (
                coinHistory.map((tx) => {
                  const isEarned = tx.amount > 0 || tx.transaction_type === "EARNED";
                  return (
                    <div
                      key={tx.id || Math.random().toString()}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-border transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border ${
                            isEarned
                              ? "bg-success/20 text-success border-emerald-500/30"
                              : "bg-primary/20 text-primary border-primary/30"
                          }`}
                        >
                          {isEarned ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {tx.description || (isEarned ? "Coins Added" : "Coins Spent")}
                          </h4>
                          <p className="text-[10px] text-muted">
                            {tx.created_at ? new Date(tx.created_at).toLocaleString() : "Just now"}
                          </p>
                        </div>
                      </div>

                      <div className={`font-black text-sm shrink-0 ml-3 ${isEarned ? "text-success" : "text-primary"}`}>
                        {isEarned ? "+" : ""}{tx.amount} 🪙
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Security Guarantee Footer */}
            <div className="p-3 bg-surface-elevated border-t border-border flex items-center justify-between text-[11px] text-muted shrink-0">
              <span className="flex items-center gap-1 text-success font-bold">
                <ShieldCheck size={14} /> Audit Ledger Active
              </span>
              <span>Encrypted & Secured</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
