"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Users, ShieldAlert, Ban, Search, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

const GROUPS = [
  { id: "1", name: "Anime Lovers Delhi", members: 124, tags: ["Anime", "Manga", "Delhi"] },
  { id: "2", name: "Tech Startup Founders", members: 45, tags: ["Bizz", "Founders", "Tech"] },
  { id: "3", name: "Weekend Hikers", members: 312, tags: ["Fitness", "Outdoors"] },
];

export default function GroupChatLobby() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [search, setSearch] = useState("");

  if (activeGroup) {
    const group = GROUPS.find(g => g.id === activeGroup);
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-dark-bg">
        <div className="flex items-center justify-between p-4 pt-6 glass border-b border-glass-border">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveGroup(null)} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">{group?.name}</h2>
              <p className="text-xs text-gray-400">{group?.members} members online</p>
            </div>
          </div>
          <button onClick={() => setShowReportModal(true)} className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20">
            <ShieldAlert size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center text-xs text-gray-500 my-4">
            Group created by Community Team. Moderated by AI.
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-gray-400 ml-2 mb-1">Rohan</span>
            <div className="bg-white/10 text-gray-200 rounded-2xl rounded-tl-sm px-4 py-2 text-sm max-w-[80%]">
              Anyone up for a meetup this saturday?
            </div>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-gray-400 ml-2 mb-1">Aisha</span>
            <div className="bg-white/10 text-gray-200 rounded-2xl rounded-tl-sm px-4 py-2 text-sm max-w-[80%]">
              Count me in! Where?
            </div>
          </div>
        </div>

        <div className="p-3 glass border-t border-glass-border pb-safe">
          <div className="flex items-center gap-2 relative bg-white/5 border border-white/10 rounded-full p-1 pl-4">
            <input 
              type="text" 
              placeholder="Message group..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-white py-2"
            />
            <button className="p-2 rounded-full bg-primary-500 text-white transition-opacity">
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Report / Moderation Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-dark-bg border border-glass-border w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center border-4 border-dark-bg">
                <Ban size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mt-4">Report Group / User</h3>
              <p className="text-sm text-gray-400 text-center">
                Our LLM moderators will review the chat logs.
              </p>
              
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <h4 className="text-red-400 text-xs font-bold mb-1">⚠️ Warning</h4>
                <p className="text-[10px] text-red-400/80 leading-relaxed">
                  False reports carry a 500 Coin Penalty. Repeated abuse of the reporting system will result in a permanent Hardware Device Ban.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button onClick={() => { toast("Report submitted for AI review.", "success"); setShowReportModal(false); }} className="w-full py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition">
                  Submit Report
                </button>
                <button onClick={() => setShowReportModal(false)} className="w-full py-3 rounded-xl bg-white/5 text-gray-300 font-bold hover:bg-white/10 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-md mx-auto space-y-6 pb-24 h-screen bg-dark-bg">
      <div className="flex items-center gap-4 pt-2">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-white">Communities</h2>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search interests, cities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-primary-500 transition-colors"
        />
      </div>

      <div className="space-y-3">
        {GROUPS.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))).map(group => (
          <div 
            key={group.id} 
            onClick={() => setActiveGroup(group.id)}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary-500/50 transition cursor-pointer flex flex-col gap-3"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-white text-lg">{group.name}</h3>
              <div className="flex items-center gap-1 text-[10px] bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full font-bold">
                <Users size={12} /> {group.members}
              </div>
            </div>
            <div className="flex gap-2">
              {group.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-1 bg-white/10 rounded-md text-gray-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
