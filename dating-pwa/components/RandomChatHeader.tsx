"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, User, Heart, UserPlus, MapPin, AlertTriangle, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { motion } from "framer-motion";

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
  isConnected: boolean;
}

export default function RandomChatHeader({ partner, onLike, onAddFriend, onReport, onProfileClick, isConnected }: RandomChatHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // Timer state for online status
  const [minutesOnline, setMinutesOnline] = useState(0);

  useEffect(() => {
    if (!isConnected) return;
    
    // Update the online timer every 60 seconds
    const interval = setInterval(() => {
      setMinutesOnline(prev => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div className="flex flex-col bg-black/60 backdrop-blur-md sticky top-0 z-20 shadow-md border-b border-white/10">
      {/* Top Row: Back, Profile Info */}
      <div className="flex items-center p-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white flex-shrink-0">
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={onProfileClick}>
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20 hover:border-primary-500 transition-colors">
               {/* Blur effect simulated by just using an icon instead of their clear photo */}
               <User size={24} className="text-white/50" />
            </div>
            {/* Online Indicator */}
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${isConnected ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]' : 'bg-red-500'}`}></div>
          </div>
          
          <div className="flex flex-col min-w-0">
            <h2 className="text-white font-bold text-base leading-tight truncate">
              {partner.isLiked ? partner.originalName : partner.hiddenName}
            </h2>
            <p className={`text-[11px] font-medium mt-0.5 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? `Online (${minutesOnline}m)` : 'Disconnected'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar (Scrollable horizontally) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-3 pb-3 pt-1">
        
        <button 
          onClick={onLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-colors whitespace-nowrap flex-shrink-0 ${
            partner.isLiked 
              ? 'bg-primary-500/20 border-primary-500 text-primary-400' 
              : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
          }`}
        >
          <Heart size={14} className={partner.isLiked ? "fill-primary-400" : ""} /> 
          {partner.isLiked ? "Liked" : "Like"}
        </button>

        <button 
          onClick={onAddFriend}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors whitespace-nowrap flex-shrink-0"
        >
          <UserPlus size={14} className="text-blue-400" /> 
          Add Friend
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 text-gray-300 text-xs font-medium whitespace-nowrap flex-shrink-0">
          <MapPin size={12} className="text-gray-400" />
          {partner.location}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 text-gray-300 text-xs font-medium whitespace-nowrap flex-shrink-0">
          <UserCircle2 size={12} className="text-gray-400" />
          {partner.gender}
        </div>

        <button 
          onClick={onReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors whitespace-nowrap flex-shrink-0"
        >
          <AlertTriangle size={14} /> 
          Report
        </button>

      </div>
    </div>
  );
}
