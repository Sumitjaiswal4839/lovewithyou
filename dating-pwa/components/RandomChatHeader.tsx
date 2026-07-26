"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, User, Heart, UserPlus, MapPin, AlertTriangle, UserCircle2, MoreVertical, History, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";

interface RandomChatHeaderProps {
  partner: {
    id: string;
    originalName: string;
    hiddenName: string;
    location: string;
    gender: string;
    isLiked: boolean;
  };
  onLike: () => void;
  onAddFriend: () => void;
  onReport: () => void;
  onProfileClick: () => void;
  onOpenHistory: () => void;
  onOpenSafetyInfo: () => void;
  isConnected: boolean;
}

export default function RandomChatHeader({ 
  partner, 
  onLike, 
  onAddFriend, 
  onReport, 
  onProfileClick, 
  onOpenHistory,
  onOpenSafetyInfo,
  isConnected 
}: RandomChatHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [minutesOnline, setMinutesOnline] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setMinutesOnline(prev => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div className="flex flex-col bg-black/80 backdrop-blur-xl sticky top-0 z-30 shadow-md border-b border-white/10">
      {/* Top Row */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button onClick={() => router.back()} className="p-2 -ml-1 rounded-xl bg-white/5 hover:bg-white/10 text-white transition shrink-0">
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={onProfileClick}>
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                <User size={22} className="text-white/60" />
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${isConnected ? 'bg-emerald-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]' : 'bg-rose-500'}`} />
            </div>
            
            <div className="flex flex-col min-w-0">
              <h2 className="text-white font-black text-sm leading-tight truncate">
                {partner.isLiked ? partner.originalName : partner.hiddenName}
              </h2>
              <p className={`text-[10px] font-bold mt-0.5 ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isConnected ? `Connected (${minutesOnline}m)` : 'Disconnected'}
              </p>
            </div>
          </div>
        </div>

        {/* 3-Dots Menu Button */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <MoreVertical size={18} />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-52 bg-[#07050e] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1"
              >
                <button
                  onClick={() => { setShowMenu(false); onOpenHistory(); }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/10 text-white text-xs font-bold text-left transition"
                >
                  <History size={16} className="text-purple-400" />
                  Matching History Vault 📜
                </button>

                <button
                  onClick={() => { setShowMenu(false); onOpenSafetyInfo(); }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/10 text-white text-xs font-bold text-left transition"
                >
                  <Shield size={16} className="text-amber-400" />
                  Safety &amp; Rules Info 🛡️
                </button>

                <button
                  onClick={() => { setShowMenu(false); onReport(); }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-rose-500/10 text-rose-400 text-xs font-bold text-left transition border-t border-white/10 mt-1"
                >
                  <AlertTriangle size={16} />
                  Report &amp; Block User 🚫
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-3 pb-2.5 pt-0.5">
        <button 
          onClick={onLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-black transition whitespace-nowrap shrink-0 ${
            partner.isLiked 
              ? 'bg-rose-500/20 border-rose-500 text-rose-300' 
              : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
          }`}
        >
          <Heart size={14} className={partner.isLiked ? "fill-rose-400 text-rose-400" : ""} /> 
          {partner.isLiked ? "Liked ✅" : "Like ❤️"}
        </button>

        <button 
          onClick={onAddFriend}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition whitespace-nowrap shrink-0"
        >
          <UserPlus size={14} className="text-blue-400" /> 
          Add Friend
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 text-gray-300 text-xs font-medium whitespace-nowrap shrink-0">
          <MapPin size={12} className="text-gray-400" />
          {partner.location}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 text-gray-300 text-xs font-medium whitespace-nowrap shrink-0">
          <UserCircle2 size={12} className="text-gray-400" />
          {partner.gender}
        </div>
      </div>
    </div>
  );
}
