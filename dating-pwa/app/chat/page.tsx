"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { MessageCircle, Search, Sparkles } from "lucide-react";
import { KarmaBadge } from "@/components/ui/KarmaBadge";

export default function ChatListPage() {
  const router = useRouter();
  const matches = useUserStore((state) => state.matches);

  return (
    <div className="flex flex-col h-screen bg-dark-bg pb-20">
      
      {/* Header */}
      <div className="p-4 pt-8 pb-4 glass border-b border-glass-border">
        <h1 className="text-2xl font-bold text-white mb-4">Matches & Chats</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search matches..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-primary-500 text-sm text-gray-200"
          />
        </div>
      </div>


      {/* Matches List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle size={48} className="text-white/10 mb-2" />
            <p>No matches yet.</p>
            <p className="text-xs">Start swiping to find someone!</p>
          </div>
        ) : (
          matches.map((match) => (
            <div 
              key={match.id}
              onClick={() => router.push(`/chat/${match.id}`)}
              className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors"
            >
              {/* Avatar */}
              <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0">
                <img src={match.img} alt={match.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark-bg rounded-full"></div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-bold truncate">{match.name}</h3>
                  <span className="text-xs text-primary-400 font-medium">New Match!</span>
                </div>
                <div className="flex items-center gap-2">
                   {match.campus && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-300">🎓 {match.campus}</span>}
                   <KarmaBadge score={match.karma} showText={false} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
    </div>
  );
}
